#!/usr/bin/env python3
"""
Recopilación de escenas para la sección «Videos» de la web de Cérvix-B.

Toma 4 videos (o los que se entreguen), elige una escena de cada uno y los une en un
clip de 20 segundos con transiciones suaves, un título sobre cada escena y la marca
Cérvix-B. Deja el resultado en public/video/recopilacion.mp4 y su portada .jpg.

Uso básico (elige las escenas automáticamente):
    python3 scripts/recopilacion.py v1.mp4 v2.mp4 v3.mp4 v4.mp4

Eligiendo el segundo en que empieza cada escena y sus títulos:
    python3 scripts/recopilacion.py v1.mp4 v2.mp4 v3.mp4 v4.mp4 \
        --inicios 12 30 5 41 --titulos "Entrevistas" "Semáforo" "Prototipo" "Equipo"

Otras opciones:
    --miniaturas DIR   guarda una hoja de miniaturas por video (cada 3 s) para elegir escenas.
    --completos        además comprime cada video completo a 720p como public/video/video-N.mp4 (+ .jpg).
    --sin-audio        recopilación muda.
    --duracion 20      duración total en segundos.

Requiere ffmpeg y ffprobe.
"""

import argparse
import json
import os
import subprocess
import sys
import tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESTINO = os.environ.get('CERVIX_VIDEO_DESTINO', os.path.join(RAIZ, 'public', 'video'))
FUENTE = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
ANCHO, ALTO, FPS = 1280, 720, 30
TRANSICION = 0.5  # segundos de fundido entre escenas


def correr(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if r.returncode != 0:
        sys.exit(f'Error al ejecutar {cmd[0]}:\n{r.stderr[-2000:]}')
    return r


def info(ruta):
    """Duración y si el video tiene audio."""
    r = correr(['ffprobe', '-v', 'error', '-show_entries', 'format=duration:stream=codec_type', '-of', 'json', ruta])
    datos = json.loads(r.stdout)
    duracion = float(datos['format']['duration'])
    con_audio = any(s.get('codec_type') == 'audio' for s in datos.get('streams', []))
    return duracion, con_audio


def cambios_de_escena(ruta):
    """Segundos donde la imagen cambia mucho (cortes de cámara), analizando en baja resolución."""
    r = subprocess.run(
        ['ffmpeg', '-hide_banner', '-i', ruta, '-an', '-vf', "fps=4,scale=160:-2,select='gt(scene,0.3)',showinfo", '-f', 'null', '-'],
        capture_output=True,
        text=True,
    )
    tiempos = []
    for linea in r.stderr.splitlines():
        if 'pts_time:' in linea:
            try:
                tiempos.append(float(linea.split('pts_time:')[1].split()[0]))
            except ValueError:
                pass
    return tiempos


def elegir_inicio(ruta, duracion, largo):
    """Escena automática: el corte de cámara más cercano a un tercio del video (evita intros y cierres)."""
    limite = max(0.0, duracion - largo - 0.1)
    if limite <= 0:
        return 0.0
    objetivo = duracion * 0.35
    candidatos = [t for t in cambios_de_escena(ruta) if duracion * 0.1 <= t <= limite]
    inicio = min(candidatos, key=lambda t: abs(t - objetivo)) if candidatos else objetivo
    return round(min(max(inicio, 0.0), limite), 2)


def miniaturas(rutas, carpeta):
    os.makedirs(carpeta, exist_ok=True)
    for i, ruta in enumerate(rutas, 1):
        salida = os.path.join(carpeta, f'miniaturas-video-{i}.jpg')
        correr([
            'ffmpeg', '-y', '-hide_banner', '-i', ruta, '-vf',
            f"fps=1/3,scale=320:-2,drawtext=fontfile={FUENTE}:text='%{{pts\\:hms}}':x=6:y=6:fontsize=18:fontcolor=white:box=1:boxcolor=black@0.6,tile=6x6",
            '-frames:v', '1', '-q:v', '4', salida,
        ])
        print(f'Miniaturas: {salida}')


def comprimir_completo(ruta, n):
    """Versión liviana del video completo para publicarlo en la web (720p, H.264)."""
    os.makedirs(DESTINO, exist_ok=True)
    salida = os.path.join(DESTINO, f'video-{n}.mp4')
    correr([
        'ffmpeg', '-y', '-hide_banner', '-i', ruta,
        # Se respeta la forma original (horizontal o vertical), con un máximo de 1280 px por lado.
        '-vf', f'scale={ANCHO}:{ANCHO}:force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2,setsar=1',
        '-c:v', 'libx264', '-preset', 'medium', '-crf', '28', '-pix_fmt', 'yuv420p',
        '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', salida,
    ])
    duracion, _ = info(salida)
    correr(['ffmpeg', '-y', '-hide_banner', '-ss', str(min(3, duracion / 3)), '-i', salida, '-frames:v', '1', '-q:v', '3',
            os.path.join(DESTINO, f'video-{n}.jpg')])
    mb = os.path.getsize(salida) / 1e6
    print(f'Video completo {n}: {salida} ({mb:.1f} MB)' + ('  ⚠️ pesa más de 90 MB: conviene subirlo a YouTube' if mb > 90 else ''))


def recopilar(rutas, inicios, titulos, total, sin_audio):
    n = len(rutas)
    largo = (total + (n - 1) * TRANSICION) / n  # cada escena, contando el fundido compartido
    datos = [info(r) for r in rutas]
    if not inicios:
        inicios = [elegir_inicio(r, d, largo) for r, (d, _) in zip(rutas, datos)]
    for i, ((d, _), ini) in enumerate(zip(datos, inicios), 1):
        if ini + largo > d + 0.05:
            sys.exit(f'El video {i} dura {d:.1f} s: la escena desde {ini} s no alcanza {largo:.2f} s.')

    tmp = tempfile.mkdtemp()
    entradas, filtros = [], []
    for i, (ruta, ini) in enumerate(zip(rutas, inicios)):
        entradas += ['-ss', str(ini), '-t', f'{largo + 0.1:.3f}', '-i', ruta]
    for i, ((dur, con_audio), titulo) in enumerate(zip(datos, titulos)):
        texto = os.path.join(tmp, f't{i}.txt')
        with open(texto, 'w', encoding='utf-8') as f:
            f.write(titulo)
        filtros.append(
            # Si el video no es 16:9 (p. ej. vertical), se rellena con el mismo video difuminado.
            f'[{i}:v]trim=0:{largo:.3f},setpts=PTS-STARTPTS,fps={FPS},split[f{i}][b{i}];'
            f'[b{i}]scale={ANCHO}:{ALTO}:force_original_aspect_ratio=increase,crop={ANCHO}:{ALTO},boxblur=24:2,eq=brightness=-0.12[bg{i}];'
            f'[f{i}]scale={ANCHO}:{ALTO}:force_original_aspect_ratio=decrease[fg{i}];'
            f'[bg{i}][fg{i}]overlay=(W-w)/2:(H-h)/2,setsar=1,format=yuv420p,'
            f"drawtext=fontfile={FUENTE}:textfile='{texto}':x=48:y=h-th-56:fontsize=38:fontcolor=white:"
            f"box=1:boxcolor=0x7a4b94@0.82:boxborderw=16:alpha='if(lt(t,0.35),t/0.35,if(gt(t,{largo - 0.45:.2f}),max(0,({largo:.2f}-t)/0.45),1))'[v{i}]"
        )
        if not sin_audio:
            if con_audio:
                filtros.append(f'[{i}:a]atrim=0:{largo:.3f},asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo[a{i}]')
            else:
                filtros.append(f'anullsrc=r=48000:cl=stereo,atrim=0:{largo:.3f}[a{i}]')

    # Fundidos encadenados entre escenas.
    previo = 'v0'
    for i in range(1, n):
        salida = f'x{i}'
        offset = i * (largo - TRANSICION)
        efecto = ['fade', 'smoothleft', 'fade', 'smoothright'][i % 4]
        filtros.append(f'[{previo}][v{i}]xfade=transition={efecto}:duration={TRANSICION}:offset={offset:.3f}[{salida}]')
        previo = salida
    filtros.append(
        f"[{previo}]drawtext=fontfile={FUENTE}:text='Cérvix-B':x=w-tw-36:y=30:fontsize=28:fontcolor=white@0.9:"
        f'shadowcolor=black@0.5:shadowx=2:shadowy=2,fade=t=in:st=0:d=0.4,fade=t=out:st={total - 0.6:.2f}:d=0.6[vout]'
    )
    mapas = ['-map', '[vout]']
    if not sin_audio:
        previo = 'a0'
        for i in range(1, n):
            filtros.append(f'[{previo}][a{i}]acrossfade=d={TRANSICION}[ax{i}]')
            previo = f'ax{i}'
        filtros.append(f'[{previo}]loudnorm=I=-16:TP=-1.5,afade=t=in:d=0.4,afade=t=out:st={total - 0.8:.2f}:d=0.8[aout]')
        mapas += ['-map', '[aout]', '-c:a', 'aac', '-b:a', '128k']

    os.makedirs(DESTINO, exist_ok=True)
    salida = os.path.join(DESTINO, 'recopilacion.mp4')
    correr(['ffmpeg', '-y', '-hide_banner', *entradas, '-filter_complex', ';'.join(filtros), *mapas,
            '-t', str(total), '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p',
            '-movflags', '+faststart', salida])
    portada = os.path.join(DESTINO, 'recopilacion.jpg')
    correr(['ffmpeg', '-y', '-hide_banner', '-ss', f'{largo / 2:.2f}', '-i', salida, '-frames:v', '1', '-q:v', '3', portada])
    duracion, _ = info(salida)
    print(f'Recopilación: {salida} ({duracion:.2f} s, {os.path.getsize(salida) / 1e6:.1f} MB)')
    print('Escenas usadas (segundo de inicio en cada video):', ', '.join(f'video {i + 1}: {s} s' for i, s in enumerate(inicios)))


def main():
    p = argparse.ArgumentParser(description='Recopilación de 20 s para la web de Cérvix-B.')
    p.add_argument('videos', nargs='+', help='rutas de los videos, en orden')
    p.add_argument('--inicios', nargs='+', type=float, help='segundo en que empieza la escena de cada video')
    p.add_argument('--titulos', nargs='+', help='texto que aparece sobre cada escena')
    p.add_argument('--duracion', type=float, default=20.0)
    p.add_argument('--sin-audio', action='store_true')
    p.add_argument('--completos', action='store_true', help='comprimir también cada video completo para la web')
    p.add_argument('--miniaturas', metavar='DIR', help='solo generar hojas de miniaturas para elegir escenas')
    a = p.parse_args()

    for r in a.videos:
        if not os.path.isfile(r):
            sys.exit(f'No encuentro el archivo: {r}')
    if a.miniaturas:
        miniaturas(a.videos, a.miniaturas)
        return
    if a.inicios and len(a.inicios) != len(a.videos):
        sys.exit('Indica un --inicios por cada video.')
    titulos = a.titulos or [f'Video {i}' for i in range(1, len(a.videos) + 1)]
    if len(titulos) != len(a.videos):
        sys.exit('Indica un --titulos por cada video.')

    recopilar(a.videos, a.inicios, titulos, a.duracion, a.sin_audio)
    if a.completos:
        for i, r in enumerate(a.videos, 1):
            comprimir_completo(r, i)


if __name__ == '__main__':
    main()

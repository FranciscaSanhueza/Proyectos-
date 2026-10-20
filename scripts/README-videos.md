# Videos de la web (sección «05 · Videos»)

La sección tiene dos partes:

1. **Recopilación de 20 segundos** (arriba): una escena de cada video, unidas con fundidos, un título sobre cada escena y la marca Cérvix-B. Se reproduce sola y en silencio; el parlante activa el sonido.
2. **Los 4 videos completos** (abajo), cada uno con su título y descripción.

## Generar la recopilación

Pon los 4 videos originales en la carpeta `videos-originales/` (no se sube a GitHub) y ejecuta:

```bash
# 1) Miniaturas cada 3 s para elegir la mejor escena de cada video
python3 scripts/recopilacion.py videos-originales/1.mp4 videos-originales/2.mp4 videos-originales/3.mp4 videos-originales/4.mp4 --miniaturas videos-originales/miniaturas

# 2) Recopilación (y versiones livianas de los videos completos)
python3 scripts/recopilacion.py videos-originales/1.mp4 videos-originales/2.mp4 videos-originales/3.mp4 videos-originales/4.mp4 \
  --inicios 12 30 5 41 \
  --titulos "Entrevistas" "El semáforo" "Prueba del prototipo" "Equipo" \
  --completos
```

- Sin `--inicios`, el script elige solo una escena por video (un corte de cámara cerca de un tercio del video).
- Cada escena dura 5,4 s y se une a la siguiente con un fundido de 0,5 s: en total son exactamente 20 s.
- Los videos verticales se ajustan con un fondo difuminado del mismo video.
- El resultado queda en `public/video/recopilacion.mp4` y `recopilacion.jpg` (portada). Con `--completos` también quedan `video-1.mp4` … `video-4.mp4` y sus portadas.

## Mostrar los videos completos

En `index.html`, dentro de la sección `#videos`, cada video tiene un `<div class="video-frame">`. Completa **uno** de estos atributos:

| Opción | Atributo |
| --- | --- |
| Archivo propio (lo genera `--completos`) | `data-src="./video/video-1.mp4" data-poster="./video/video-1.jpg"` |
| YouTube (puede ser «no listado») | `data-youtube="https://youtu.be/XXXXXXXXXXX"` |
| Google Drive («cualquier persona con el enlace») | `data-drive="https://drive.google.com/file/d/XXXX/view"` |

El título y la descripción se cambian en el `<h3>` y el `<p>` de cada tarjeta. Mientras un video no tenga fuente, se muestra «Próximamente».

> GitHub no acepta archivos de más de 100 MB. Si un video comprimido pesa más de ~90 MB, conviene subirlo a YouTube como «no listado».

// Sonidos suaves de Cérvix-B, generados con Web Audio (sin archivos de audio).
// Se usan en la app y en el sitio. Se silencian con data-sounds="off" en <html>.

export type SoundName = 'tap' | 'ding' | 'success' | 'medal' | 'warn' | 'alert'

let ctx: AudioContext | null = null

const enabled = () => typeof document !== 'undefined' && document.documentElement.dataset.sounds !== 'off'

function audio(): AudioContext | null {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx ??= new AC()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

/** Una nota con ataque y caída suaves. */
function note(ac: AudioContext, freq: number, start: number, length: number, volume = 0.18, type: OscillatorType = 'sine') {
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.value = freq
  const t = ac.currentTime + start
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + length)
  osc.connect(gain).connect(ac.destination)
  osc.start(t)
  osc.stop(t + length + 0.05)
}

const SOUNDS: Record<SoundName, (ac: AudioContext) => void> = {
  // Toque breve al elegir una opción.
  tap: (ac) => note(ac, 660, 0, 0.08, 0.08),
  // Campanita al guardar o marcar algo como hecho.
  ding: (ac) => {
    note(ac, 880, 0, 0.45, 0.14)
    note(ac, 1320, 0.06, 0.4, 0.07)
  },
  // Arpegio alegre al completar (anillos, encuesta).
  success: (ac) => [523, 659, 784, 1047].forEach((f, i) => note(ac, f, i * 0.09, 0.35, 0.13)),
  // Brillo de medalla.
  medal: (ac) => [784, 988, 1175, 1568, 1976].forEach((f, i) => note(ac, f, i * 0.07, 0.4, 0.1, 'triangle')),
  // Aviso amarillo: dos tonos medios.
  warn: (ac) => {
    note(ac, 587, 0, 0.22, 0.14, 'triangle')
    note(ac, 587, 0.28, 0.22, 0.14, 'triangle')
  },
  // Alerta roja: tonos que bajan, distintos del resto.
  alert: (ac) => [880, 660, 880, 660].forEach((f, i) => note(ac, f, i * 0.18, 0.16, 0.16, 'square')),
}

export function playSound(name: SoundName) {
  if (!enabled()) return
  const ac = audio()
  if (ac) SOUNDS[name](ac)
}

/** Sonido según el color del semáforo. */
export const levelSound = (level: 'verde' | 'amarillo' | 'rojo'): SoundName =>
  level === 'rojo' ? 'alert' : level === 'amarillo' ? 'warn' : 'ding'

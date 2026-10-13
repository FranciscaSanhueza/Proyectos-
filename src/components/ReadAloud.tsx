import { useEffect, useState } from 'react'
import { Square, Volume2 } from 'lucide-react'

const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

/** Lee en voz alta el texto entregado con la voz del sistema (español por defecto). */
export function ReadAloud({
  text,
  label = 'Escuchar',
  stopLabel = 'Detener',
  lang = 'es-CL',
}: {
  text: string
  label?: string
  stopLabel?: string
  /** Idioma BCP-47. Si el sistema no tiene esa voz se usa la más cercana. */
  lang?: string
}) {
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => () => { if (supported) window.speechSynthesis.cancel() }, [])

  if (!supported) return null

  const toggle = () => {
    const synth = window.speechSynthesis
    if (speaking) {
      synth.cancel()
      setSpeaking(false)
      return
    }
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang
    u.rate = 0.95
    // Criollo haitiano casi nunca trae voz propia: se usa una voz francesa como apoyo.
    const base = lang.slice(0, 2)
    const voices = synth.getVoices()
    const voice =
      voices.find((v) => v.lang.toLowerCase() === lang.toLowerCase()) ??
      voices.find((v) => v.lang.startsWith(base)) ??
      (base === 'ht' ? voices.find((v) => v.lang.startsWith('fr')) : undefined)
    if (voice) u.voice = voice
    u.onend = () => setSpeaking(false)
    u.onerror = () => setSpeaking(false)
    setSpeaking(true)
    synth.speak(u)
  }

  return (
    <button className="read-aloud" onClick={toggle} aria-pressed={speaking}>
      {speaking ? <Square size={16} /> : <Volume2 size={16} />}
      {speaking ? stopLabel : label}
    </button>
  )
}

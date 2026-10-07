import { useEffect, useState } from 'react'
import { Square, Volume2 } from 'lucide-react'

const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

/** Lee en voz alta el texto entregado (voz del sistema, en español). */
export function ReadAloud({ text, label = 'Escuchar' }: { text: string; label?: string }) {
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
    u.lang = 'es-CL'
    u.rate = 0.95
    const voice = synth.getVoices().find((v) => v.lang.startsWith('es'))
    if (voice) u.voice = voice
    u.onend = () => setSpeaking(false)
    u.onerror = () => setSpeaking(false)
    setSpeaking(true)
    synth.speak(u)
  }

  return (
    <button className="read-aloud" onClick={toggle} aria-pressed={speaking}>
      {speaking ? <Square size={16} /> : <Volume2 size={16} />}
      {speaking ? 'Detener' : label}
    </button>
  )
}

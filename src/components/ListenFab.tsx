import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Square, Volume2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { haptic } from '../utils'

const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

/** Junta el texto visible de la pantalla actual (títulos, párrafos, botones con texto). */
function screenText(): string {
  const main = document.querySelector('main.app-content')
  if (!main) return ''
  const seen = new Set<string>()
  const parts: string[] = []
  main.querySelectorAll<HTMLElement>('h1, h2, h3, p, li, strong, label, .btn, small').forEach((el) => {
    if (el.closest('[aria-hidden="true"], details:not([open]), .dchart__table, svg')) return
    if (el.offsetParent === null) return
    // Evita leer dos veces un texto que ya está dentro de otro elemento leído.
    if (el.parentElement?.closest('p, li, label, .btn')) return
    const t = (el.innerText || '').replace(/\s+/g, ' ').trim()
    if (t.length < 2 || seen.has(t)) return
    seen.add(t)
    parts.push(/[.!?:]$/.test(t) ? t : t + '.')
  })
  return parts.join(' ').slice(0, 2500)
}

function speak(text: string, onEnd: () => void) {
  const synth = window.speechSynthesis
  synth.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'es-CL'
  u.rate = 0.95
  const voice = synth.getVoices().find((v) => v.lang.toLowerCase() === 'es-cl') ?? synth.getVoices().find((v) => v.lang.startsWith('es'))
  if (voice) u.voice = voice
  u.onend = onEnd
  u.onerror = onEnd
  synth.speak(u)
}

/**
 * «Escúchame»: lee en voz alta la pantalla actual. Con la guía en audio activa
 * (Ajustes) lee cada pantalla sola al abrirla.
 */
export function ListenFab() {
  const { pathname } = useLocation()
  const { prefs } = useApp()
  const [speaking, setSpeaking] = useState(false)
  const first = useRef(true)

  // Al cambiar de pantalla: se corta la lectura y, si la guía está activa, se lee la nueva.
  useEffect(() => {
    if (!supported) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
    if (!prefs.audioGuide) return
    const delay = first.current ? 900 : 600
    first.current = false
    const t = setTimeout(() => {
      const text = screenText()
      if (!text) return
      setSpeaking(true)
      speak(text, () => setSpeaking(false))
    }, delay)
    return () => clearTimeout(t)
  }, [pathname, prefs.audioGuide])

  useEffect(() => () => { if (supported) window.speechSynthesis.cancel() }, [])

  const hidden = !supported || pathname.includes('/chat/') || pathname.endsWith('/encuesta')
  if (hidden) return null

  const toggle = () => {
    haptic(10)
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    const text = screenText()
    if (!text) return
    setSpeaking(true)
    speak(text, () => setSpeaking(false))
  }

  return (
    <button className={`listen-fab${speaking ? ' is-on' : ''}`} onClick={toggle} aria-pressed={speaking} aria-label={speaking ? 'Detener lectura' : 'Escúchame: leer esta pantalla en voz alta'}>
      {speaking ? <Square size={18} /> : <Volume2 size={20} />}
      <span>{speaking ? 'Detener' : 'Escúchame'}</span>
      {speaking && <i className="listen-fab__wave" aria-hidden="true"><b /><b /><b /></i>}
    </button>
  )
}

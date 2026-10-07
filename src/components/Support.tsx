import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BellRing, HeartHandshake, MapPin, MessageCircle, Phone, Wind } from 'lucide-react'
import type { Level } from '../types'
import { LevelFace } from './LevelFace'

/** Pantalla de alerta cuando el semáforo queda en rojo. */
export function UrgentAlert({ onClose }: { onClose?: () => void }) {
  return (
    <div className="urgent" role="alertdialog" aria-labelledby="urgent-title" aria-describedby="urgent-desc">
      <LevelFace level="rojo" size={72} />
      <h2 id="urgent-title">Acude a urgencias ahora</h2>
      <p id="urgent-desc">
        Tus respuestas muestran señales de alarma después del procedimiento. No esperes a que pase.
      </p>
      <a className="btn btn--white btn--block" href="tel:131">
        <Phone size={18} /> Llamar al SAMU (131)
      </a>
      <a
        className="btn btn--outline-white btn--block"
        href="https://www.google.com/maps/search/servicio+de+urgencia+cerca+de+mi"
        target="_blank"
        rel="noreferrer"
      >
        <MapPin size={18} /> Ver urgencias cercanas
      </a>
      <p className="urgent__note">
        <BellRing size={16} /> Tu equipo médico ya fue notificado.
      </p>
      {onClose && (
        <button className="link-btn link-btn--white" onClick={onClose}>
          Entendido, cerrar
        </button>
      )}
    </div>
  )
}

/** Mensaje para amarillo: el equipo fue notificado y puede escribir. */
export function YellowNotice() {
  const navigate = useNavigate()
  return (
    <div className="yellow-notice">
      <p>
        <BellRing size={16} /> Avisamos a tu equipo de salud: te contactarán pronto. Si quieres, escríbeles ahora.
      </p>
      <button className="btn btn--primary btn--block" onClick={() => navigate('/paciente/chat/d1')}>
        <MessageCircle size={18} /> Escribir a mi equipo
      </button>
    </div>
  )
}

const PHASES = [
  { label: 'Inhala', secs: 4 },
  { label: 'Sostén', secs: 4 },
  { label: 'Exhala', secs: 6 },
]

/** Respiración guiada 4-4-6 durante unos ciclos. */
export function Breathing({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const cycles = 4
  const phase = PHASES[step % PHASES.length]

  useEffect(() => {
    if (step >= cycles * PHASES.length) {
      onDone()
      return
    }
    const t = setTimeout(() => setStep((s) => s + 1), phase.secs * 1000)
    return () => clearTimeout(t)
  }, [step])

  return (
    <div className="breathing" aria-live="polite">
      <div className={`breathing__circle breathing__circle--${phase.label.toLowerCase()}`} style={{ transitionDuration: `${phase.secs}s` }} />
      <strong>{phase.label}</strong>
      <small>Ciclo {Math.min(Math.floor(step / PHASES.length) + 1, cycles)} de {cycles}</small>
      <button className="link-btn" onClick={onDone}>Terminar</button>
    </div>
  )
}

/** Apoyo emocional cuando la paciente se siente muy preocupada. */
export function SupportCard() {
  const navigate = useNavigate()
  const [breathing, setBreathing] = useState(false)
  return (
    <div className="support">
      <div className="support__head">
        <HeartHandshake size={28} />
        <div>
          <strong>No estás sola 💜</strong>
          <p>Es normal sentir preocupación durante la recuperación. Estas opciones pueden ayudarte:</p>
        </div>
      </div>
      {breathing ? (
        <Breathing onDone={() => setBreathing(false)} />
      ) : (
        <div className="support__actions">
          <button className="btn btn--ghost btn--block" onClick={() => setBreathing(true)}>
            <Wind size={18} /> Ejercicio de respiración (1 min)
          </button>
          <button className="btn btn--ghost btn--block" onClick={() => navigate('/paciente/chat/d2')}>
            <MessageCircle size={18} /> Conversar con la matrona
          </button>
          <a className="btn btn--ghost btn--block" href="tel:6003607777">
            <Phone size={18} /> Salud Responde 600 360 7777
          </a>
        </div>
      )}
    </div>
  )
}

/** Acción recomendada según el nivel del semáforo. */
export function LevelAction({ level }: { level: Level }) {
  if (level === 'rojo') return <UrgentAlert />
  if (level === 'amarillo') return <YellowNotice />
  return null
}

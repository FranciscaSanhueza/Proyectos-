import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, LifeBuoy, MessageCircle } from 'lucide-react'
import { LevelFace } from '../../components/LevelFace'
import { HelpSheet } from '../../components/Help'
import { ReadAloud } from '../../components/ReadAloud'
import { LEVEL_INFO, currentLevel, haptic, surveyStatus } from '../../utils'
import { usePatient } from './usePatient'

/** Modo simple: tres botones grandes para pacientes con poca experiencia digital (como el «modo fácil» de Android). */
export function SimpleHome() {
  const { patient, patientId, responses, messages, setPrefs, symptomLogs } = usePatient()
  const navigate = useNavigate()
  const [help, setHelp] = useState(false)
  const level = currentLevel(responses, patientId, symptomLogs)
  const survey = surveyStatus(responses, patientId)
  const unread = messages.filter((m) => m.patientId === patientId && m.from === 'medico' && !m.read).length
  const go = (to: string) => {
    haptic()
    navigate(to)
  }

  return (
    <div className="page simple">
      <header className="simple__head">
        <h1>Hola, {patient.name.split(' ')[0]} 🌷</h1>
        <p>¿Qué necesitas hoy?</p>
        <ReadAloud text={`Hola ${patient.name.split(' ')[0]}. Tienes tres botones. Uno: cómo estoy. Dos: hablar con mi equipo. Tres: necesito ayuda.`} />
      </header>

      {survey.available && (
        <button className="simple__survey" onClick={() => go('/paciente/encuesta')}>
          <ClipboardList size={26} /> Responder mi encuesta semanal (5 min)
        </button>
      )}

      <button className={`simple__btn simple__btn--state level-bg--${level}`} onClick={() => go('/paciente/semaforo')}>
        <LevelFace level={level} size={64} />
        <span>
          <strong>¿Cómo estoy?</strong>
          <small>Tu semáforo está en {LEVEL_INFO[level].title.toLowerCase()}</small>
        </span>
      </button>

      <button className="simple__btn simple__btn--chat" onClick={() => go('/paciente/chat/d1')}>
        <span className="simple__icon"><MessageCircle size={40} />{unread > 0 && <i className="dot-badge">{unread}</i>}</span>
        <span>
          <strong>Hablar con mi equipo</strong>
          <small>{unread > 0 ? `Tienes ${unread} ${unread === 1 ? 'mensaje nuevo' : 'mensajes nuevos'}` : 'Escribe o envía un audio'}</small>
        </span>
      </button>

      <button
        className="simple__btn simple__btn--help"
        onClick={() => {
          haptic([20, 40, 20])
          setHelp(true)
        }}
      >
        <span className="simple__icon"><LifeBuoy size={40} /></span>
        <span>
          <strong>Necesito ayuda</strong>
          <small>Urgencias, 131 y orientación</small>
        </span>
      </button>

      <button className="link-btn simple__exit" onClick={() => setPrefs({ simpleMode: false })}>
        Ver la app completa
      </button>
      <HelpSheet open={help} onClose={() => setHelp(false)} />
    </div>
  )
}

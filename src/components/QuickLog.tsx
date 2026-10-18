import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { surveyQuestions } from '../data/mock'
import type { Level, SymptomLog } from '../types'
import { LEVEL_INFO, formatTime, haptic, toDayKey } from '../utils'
import { LevelFace } from './LevelFace'
import { UrgentAlert } from './Support'

type Kind = SymptomLog['symptom']

const CHIPS: { id: Kind; emoji: string; label: string }[] = [
  { id: 'sangrado', emoji: '🩸', label: 'Sangrado' },
  { id: 'dolor', emoji: '😣', label: 'Dolor' },
  { id: 'fiebre', emoji: '🌡️', label: 'Fiebre' },
  { id: 'flujo', emoji: '💧', label: 'Flujo' },
  { id: 'nada', emoji: '✨', label: 'Nada raro' },
]

const NEXT: Record<Level, string> = {
  verde: 'Es esperable. Sigue tu plan y vuelve a registrar si cambia.',
  amarillo: 'Avisamos a tu equipo. Escríbeles para que te orienten.',
  rojo: 'Es una señal de alarma: acude a urgencias o llama al 131.',
}

/** «Hoy noté…»: registrar un síntoma con un toque, sin esperar la encuesta semanal. */
export function QuickLog({ patientId }: { patientId: string }) {
  const { symptomLogs, logSymptom } = useApp()
  const navigate = useNavigate()
  const [open, setOpen] = useState<Kind | null>(null)
  const [result, setResult] = useState<{ label: string; level: Level } | null>(null)
  const [urgent, setUrgent] = useState(false)
  const today = toDayKey(new Date())
  const todays = symptomLogs.filter((l) => l.patientId === patientId && toDayKey(new Date(l.at)) === today).slice(0, 3)
  // Se omite la opción «No» de cada pregunta: aquí la paciente ya dijo que notó algo.
  const options = open && open !== 'nada' ? surveyQuestions.find((q) => q.id === open)!.options.filter((o) => o.intensity > 0) : []

  const save = (symptom: Kind, label: string, level: Level) => {
    haptic(level === 'rojo' ? [30, 60, 30] : 12)
    logSymptom({ patientId, symptom, label, level })
    setResult({ label, level })
    setOpen(null)
    if (level === 'rojo') setUrgent(true)
  }

  return (
    <div className="card quicklog home-half">
      {urgent && (
        <div className="overlay">
          <UrgentAlert onClose={() => setUrgent(false)} />
        </div>
      )}
      <p className="form__label">Hoy noté…</p>
      <div className="quicklog__chips">
        {CHIPS.map((c) => (
          <button
            key={c.id}
            className={`quicklog__chip${open === c.id ? ' is-active' : ''}`}
            aria-pressed={open === c.id}
            onClick={() => {
              setResult(null)
              if (c.id === 'nada') save('nada', 'Nada raro', 'verde')
              else setOpen(open === c.id ? null : c.id)
            }}
          >
            <span aria-hidden="true">{c.emoji}</span>
            {c.label}
          </button>
        ))}
      </div>

      {open && open !== 'nada' && (
        <div className="quicklog__opts pop-in">
          <small>¿Cómo es?</small>
          {options.map((o) => (
            <button key={o.label} className="quicklog__opt" onClick={() => save(open, `${CHIPS.find((c) => c.id === open)!.label}: ${o.label.toLowerCase()}`, o.level ?? 'verde')}>
              <i className={`dot-l dot-l--${o.level}`} /> {o.label}
            </button>
          ))}
        </div>
      )}

      {result && (
        <div className={`quicklog__result level-bg--${result.level} pop-in`}>
          <LevelFace level={result.level} size={38} />
          <div>
            <strong className={`level-text--${result.level}`}>{LEVEL_INFO[result.level].title}</strong>
            <span>{result.label === 'Nada raro' ? '¡Qué bueno! Gracias por contarnos 🌸' : NEXT[result.level]}</span>
            {result.level === 'amarillo' && (
              <button className="btn btn--primary small-gap" onClick={() => navigate('/paciente/chat/d1')}>Escribir a mi equipo</button>
            )}
          </div>
        </div>
      )}

      {!result && todays.length > 0 && (
        <ul className="quicklog__today">
          {todays.map((l) => (
            <li key={l.id}>
              <i className={`dot-l dot-l--${l.level}`} /> {formatTime(l.at)} · {l.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

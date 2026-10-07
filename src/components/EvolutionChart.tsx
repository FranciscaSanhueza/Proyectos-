import { useState } from 'react'
import { surveyQuestions } from '../data/mock'
import type { RecoveryPlan, SurveyIcon, SurveyResponse } from '../types'
import { LEVEL_INFO, formatShortDate } from '../utils'
import { LevelFace } from './LevelFace'
import { QUESTION_ICON } from './IntensityScale'

const ROWS: { id: SurveyIcon; label: string }[] = [
  { id: 'sangrado', label: 'Sangrado' },
  { id: 'dolor', label: 'Dolor' },
  { id: 'animo', label: 'Preocupación' },
]
const INTENSITY = ['Nada', 'Leve', 'Moderado', 'Intenso']
const WEEK_MS = 7 * 24 * 60 * 60 * 1000

const option = (r: SurveyResponse, id: SurveyIcon) => {
  const q = surveyQuestions.find((x) => x.id === id)!
  return q.options[r.answers[id]]
}

/**
 * Evolución semana a semana: una columna por encuesta con el semáforo arriba
 * y barras pequeñas (0–3) para los síntomas principales. Tocar una semana
 * muestra el detalle debajo.
 */
export function EvolutionChart({ responses, plan }: { responses: SurveyResponse[]; plan: RecoveryPlan }) {
  const list = [...responses].sort((a, b) => a.at.localeCompare(b.at)).slice(-8)
  const [selected, setSelected] = useState<string | null>(list[list.length - 1]?.id ?? null)

  if (list.length === 0) return <p className="empty">Responde tu primera encuesta para ver tu evolución.</p>

  const week = (r: SurveyResponse) =>
    Math.max(1, Math.floor((new Date(r.at).getTime() - new Date(plan.procedureDate).getTime()) / WEEK_MS) + 1)
  const current = list.find((r) => r.id === selected)

  return (
    <div className="evo">
      <div className="evo__grid" style={{ gridTemplateColumns: `92px repeat(${list.length}, minmax(36px, 1fr))` }}>
        <span />
        {list.map((r) => (
          <button
            key={r.id}
            className={`evo__col-head${r.id === selected ? ' is-selected' : ''}`}
            onClick={() => setSelected(r.id)}
            aria-pressed={r.id === selected}
            aria-label={`Semana ${week(r)}: ${LEVEL_INFO[r.level].title}`}
          >
            <small>Sem {week(r)}</small>
            <LevelFace level={r.level} size={24} />
          </button>
        ))}

        {ROWS.map(({ id, label }) => {
          const Icon = QUESTION_ICON[id]
          return (
            <div key={id} className="evo__row">
              <span className="evo__label"><Icon size={14} /> {label}</span>
              {list.map((r) => {
                const opt = option(r, id)
                const n = opt?.intensity ?? 0
                return (
                  <button
                    key={r.id}
                    className={`evo__cell${r.id === selected ? ' is-selected' : ''}`}
                    onClick={() => setSelected(r.id)}
                    aria-label={`${label}, semana ${week(r)}: ${INTENSITY[n]}`}
                  >
                    <span className="evo__bar" style={{ height: `${n === 0 ? 2 : (n / 3) * 100}%` }} />
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
      <p className="evo__hint">Barra más alta = síntoma más intenso. Toca una semana para ver el detalle.</p>

      {current && (
        <div className="evo__detail">
          <div className="appt__head">
            <strong>Semana {week(current)} · {formatShortDate(current.at)}</strong>
            <span className={`pill level-bg--${current.level}`}>
              <LevelFace level={current.level} size={16} /> {LEVEL_INFO[current.level].title}
            </span>
          </div>
          <ul>
            {ROWS.map(({ id, label }) => (
              <li key={id}>
                <span>{label}</span>
                <b>{option(current, id)?.label ?? '—'}</b>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

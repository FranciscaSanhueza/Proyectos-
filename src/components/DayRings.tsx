import { useEffect, useRef } from 'react'
import { Check, ChevronRight } from 'lucide-react'

interface Ring {
  key: string
  label: string
  detail: string
  value: number // 0–1
  color: string
  onClick: () => void
}

/** Anillos del día (como el Apple Watch): ánimo, cuidados y encuesta semanal. */
export function DayRings({ rings, onComplete }: { rings: Ring[]; onComplete?: () => void }) {
  const size = 132
  const stroke = 13
  const allDone = rings.every((r) => r.value >= 1)
  const wasDone = useRef(allDone)
  useEffect(() => {
    if (allDone && !wasDone.current) onComplete?.()
    wasDone.current = allDone
  }, [allDone, onComplete])

  return (
    <div className="card rings home-half">
      <p className="form__label">Tus anillos de hoy {allDone && '🎉'}</p>
      <div className="rings__body">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={rings.map((r) => `${r.label}: ${Math.round(r.value * 100)}%`).join(', ')}>
          {rings.map((r, k) => {
            const radius = size / 2 - stroke / 2 - k * (stroke + 4)
            const c = 2 * Math.PI * radius
            return (
              <g key={r.key} transform={`rotate(-90 ${size / 2} ${size / 2})`}>
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={r.color} strokeOpacity={0.18} strokeWidth={stroke} />
                <circle
                  className="rings__arc"
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={r.color}
                  strokeWidth={stroke}
                  strokeLinecap="round"
                  strokeDasharray={c}
                  strokeDashoffset={c * (1 - Math.min(1, r.value))}
                />
              </g>
            )
          })}
        </svg>
        <ul className="rings__legend">
          {rings.map((r) => (
            <li key={r.key}>
              <button onClick={r.onClick}>
                <i style={{ background: r.color }} />
                <span>
                  <strong>{r.label}</strong>
                  <small>{r.detail}</small>
                </span>
                {r.value >= 1 ? <Check size={18} className="level-text--verde" /> : <ChevronRight size={18} className="muted" />}
              </button>
            </li>
          ))}
        </ul>
      </div>
      {allDone && <p className="rings__done pop-in">¡Cerraste tus anillos de hoy! Tu cuerpo te lo agradece 💜</p>}
    </div>
  )
}

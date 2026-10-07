import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Reminder, ReminderKind } from '../types'
import { toDayKey } from '../utils'

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const monthFmt = new Intl.DateTimeFormat('es-CL', { month: 'long' })

export const KIND_LABEL: Record<ReminderKind, string> = {
  control: 'Control médico',
  medicamento: 'Medicamento',
  cuidado: 'Cuidado',
  encuesta: 'Encuesta',
}

export function CalendarMonth({
  month,
  onMonthChange,
  selected,
  onSelect,
  reminders,
}: {
  month: Date // cualquier día del mes visible
  onMonthChange: (d: Date) => void
  selected: string // YYYY-MM-DD
  onSelect: (day: string) => void
  reminders: Reminder[]
}) {
  const year = month.getFullYear()
  const m = month.getMonth()
  const first = new Date(year, m, 1)
  const offset = (first.getDay() + 6) % 7 // semana parte el lunes
  const days = new Date(year, m + 1, 0).getDate()
  const today = toDayKey(new Date())

  const byDay = new Map<string, Reminder[]>()
  reminders.forEach((r) => byDay.set(r.date, [...(byDay.get(r.date) ?? []), r]))

  const cells: (string | null)[] = [
    ...Array<null>(offset).fill(null),
    ...Array.from({ length: days }, (_, i) => toDayKey(new Date(year, m, i + 1))),
  ]

  return (
    <div className="calendar">
      <div className="calendar__head">
        <button className="icon-btn" onClick={() => onMonthChange(new Date(year, m - 1, 1))} aria-label="Mes anterior">
          <ChevronLeft size={20} />
        </button>
        <strong>{monthFmt.format(month)} {year}</strong>
        <button className="icon-btn" onClick={() => onMonthChange(new Date(year, m + 1, 1))} aria-label="Mes siguiente">
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="calendar__grid">
        {WEEKDAYS.map((d, i) => (
          <span key={i} className="calendar__wd">{d}</span>
        ))}
        {cells.map((key, i) => {
          if (!key) return <span key={i} />
          const items = byDay.get(key) ?? []
          const kinds = [...new Set(items.map((r) => r.kind))]
          return (
            <button
              key={key}
              className={`calendar__day${key === selected ? ' is-selected' : ''}${key === today ? ' is-today' : ''}${kinds[0] ? ` kind--${kinds[0]}` : ''}`}
              onClick={() => onSelect(key)}
              aria-label={`${key}${items.length ? `, ${items.length} recordatorio(s)` : ''}`}
            >
              {Number(key.slice(8))}
              {kinds.length > 0 && (
                <span className="calendar__dots">
                  {kinds.map((k) => <i key={k} className={`dot kind--${k}`} />)}
                </span>
              )}
            </button>
          )
        })}
      </div>
      <div className="calendar__legend">
        {(Object.keys(KIND_LABEL) as ReminderKind[]).map((k) => (
          <span key={k}><i className={`dot kind--${k}`} /> {KIND_LABEL[k]}</span>
        ))}
      </div>
    </div>
  )
}

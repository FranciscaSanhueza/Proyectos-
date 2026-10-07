import { useState } from 'react'
import { Check } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { toDayKey } from '../utils'
import { Celebrate } from './Celebrate'

/** Cuidados del plan para marcar cada día; celebra al completarlos todos. */
export function CareChecklist({ patientId, cares }: { patientId: string; cares: string[] }) {
  const { careLogs, toggleCare } = useApp()
  const today = toDayKey(new Date())
  const done = careLogs.find((l) => l.patientId === patientId && l.date === today)?.done ?? []
  const [party, setParty] = useState(0)
  const count = cares.filter((c) => done.includes(c)).length

  const toggle = (c: string) => {
    const completes = !done.includes(c) && count + 1 === cares.length
    toggleCare(patientId, today, c)
    if (completes) setParty((n) => n + 1)
  }

  return (
    <div className="care-list">
      {party > 0 && <Celebrate key={party} />}
      <div className="care-list__progress" aria-label={`${count} de ${cares.length} cuidados`}>
        <span style={{ width: `${cares.length ? (count / cares.length) * 100 : 0}%` }} />
      </div>
      <p className="muted">
        {count === cares.length ? '¡Completaste todos tus cuidados de hoy! 🌸' : `${count} de ${cares.length} cuidados de hoy`}
      </p>
      {cares.map((c) => {
        const on = done.includes(c)
        return (
          <button key={c} className={`care-item${on ? ' is-done' : ''}`} onClick={() => toggle(c)} aria-pressed={on}>
            <span className="care-item__box">{on && <Check size={16} strokeWidth={3} />}</span>
            <span className="grow">{c}</span>
          </button>
        )
      })}
    </div>
  )
}

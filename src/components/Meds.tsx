import { useState } from 'react'
import { Pill, Plus, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { Medication } from '../types'
import { formatShortDate, haptic, toDayKey } from '../utils'
import { playSound } from '../sound'
import { Celebrate } from './Celebrate'

const DAY = 24 * 60 * 60 * 1000

/** Día del tratamiento (1 = primer día) y si está activo hoy. */
export function medStatus(m: Medication, today = toDayKey(new Date())) {
  const day = Math.floor((new Date(today + 'T12:00').getTime() - new Date(m.start + 'T12:00').getTime()) / DAY) + 1
  const state = day < 1 ? 'pending' : m.days > 0 && day > m.days ? 'done' : 'active'
  return { day, state } as const
}

/** «Mis medicamentos»: un toque por dosis tomada; muestra cuántas faltan hoy. */
export function MedsCard({ patientId, meds }: { patientId: string; meds: Medication[] }) {
  const { medLogs, takeDose } = useApp()
  const today = toDayKey(new Date())
  const [party, setParty] = useState(0)

  if (!meds.length) return <p className="muted">Tu equipo no ha indicado medicamentos en tu plan.</p>

  return (
    <div className="meds">
      {party > 0 && <Celebrate key={party} />}
      {meds.map((m) => {
        const { day, state } = medStatus(m, today)
        const taken = medLogs.find((l) => l.patientId === patientId && l.medId === m.id && l.date === today)?.taken ?? 0
        const left = m.perDay - taken
        const tap = (i: number) => {
          if (state !== 'active') return
          const undo = i < taken
          takeDose(patientId, m.id, today, undo ? -1 : 1, m.perDay)
          haptic(undo ? 8 : 14)
          if (!undo && taken + 1 === m.perDay && !m.asNeeded) {
            playSound('success')
            setParty((n) => n + 1)
          } else playSound(undo ? 'tap' : 'ding')
        }
        return (
          <div key={m.id} className={`med med--${state}`}>
            <div className="med__head">
              <span className="med__icon"><Pill size={20} /></span>
              <div className="grow">
                <strong>{m.name} {m.dose}</strong>
                <small>
                  {m.asNeeded ? `Solo si hay dolor · hasta ${m.perDay} al día` : `${m.perDay} ${m.perDay === 1 ? 'vez' : 'veces'} al día`}
                  {m.days > 0 && ` · ${m.days} días`}
                </small>
              </div>
              {state === 'active' && m.days > 0 && <span className="med__day">Día {day} de {m.days}</span>}
            </div>
            {state === 'active' ? (
              <>
                <div className="med__doses" role="group" aria-label={`Dosis de ${m.name} hoy`}>
                  {Array.from({ length: m.perDay }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`med__dose${i < taken ? ' is-taken' : ''}`}
                      onClick={() => tap(i)}
                      aria-pressed={i < taken}
                      aria-label={i < taken ? `Dosis ${i + 1} tomada. Toca para deshacer` : `Marcar dosis ${i + 1} como tomada`}
                    >
                      <Pill size={18} />
                      <small>{i < taken ? 'Tomada' : `Dosis ${i + 1}`}</small>
                    </button>
                  ))}
                </div>
                <p className={`med__left${left === 0 ? ' is-done' : ''}`}>
                  {m.asNeeded
                    ? taken === 0
                      ? 'Hoy no la has necesitado.'
                      : `Tomaste ${taken} hoy${left === 0 ? ' · llegaste al máximo del día' : ''}.`
                    : left === 0
                      ? '¡Listo por hoy! 🌸'
                      : `Te ${left === 1 ? 'falta 1 dosis' : `faltan ${left} dosis`} hoy.`}
                </p>
                {m.days > 0 && (
                  <div className="med__progress" aria-label={`Día ${day} de ${m.days}`}>
                    <span style={{ width: `${Math.min(100, (day / m.days) * 100)}%` }} />
                  </div>
                )}
              </>
            ) : (
              <p className="med__left">{state === 'done' ? 'Tratamiento terminado ✓' : `Empieza el ${formatShortDate(m.start + 'T12:00')}.`}</p>
            )}
          </div>
        )
      })}
      <p className="muted med__note">Sigue siempre la indicación de tu médico. Si tienes dudas sobre una dosis, escríbele a tu equipo.</p>
    </div>
  )
}

/** Editor de medicamentos del plan (vista del médico). */
export function MedsEditor({ meds, onChange }: { meds: Medication[]; onChange: (m: Medication[]) => void }) {
  const set = (i: number, changes: Partial<Medication>) => onChange(meds.map((m, j) => (j === i ? { ...m, ...changes } : m)))
  return (
    <div className="meds-edit">
      {meds.map((m, i) => (
        <div key={m.id} className="meds-edit__row">
          <input value={m.name} onChange={(e) => set(i, { name: e.target.value })} placeholder="Medicamento" aria-label="Medicamento" />
          <input value={m.dose} onChange={(e) => set(i, { dose: e.target.value })} placeholder="Dosis (ej. 500 mg)" aria-label="Dosis" />
          <label>
            Veces al día
            <select value={m.perDay} onChange={(e) => set(i, { perDay: Number(e.target.value) })}>
              {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <label>
            Días (0 = sin fin)
            <input type="number" min={0} max={60} value={m.days} onChange={(e) => set(i, { days: Math.max(0, Number(e.target.value) || 0) })} />
          </label>
          <label className="meds-edit__check">
            <input type="checkbox" checked={!!m.asNeeded} onChange={(e) => set(i, { asNeeded: e.target.checked })} /> Solo si hay dolor
          </label>
          <button type="button" className="icon-btn" onClick={() => onChange(meds.filter((_, j) => j !== i))} aria-label={`Quitar ${m.name || 'medicamento'}`}>
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <button
        type="button"
        className="btn btn--ghost"
        onClick={() => onChange([...meds, { id: 'm' + Math.random().toString(36).slice(2, 8), name: '', dose: '', perDay: 1, days: 5, start: toDayKey(new Date()) }])}
      >
        <Plus size={16} /> Agregar medicamento
      </button>
    </div>
  )
}

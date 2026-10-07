import { useState, type FormEvent } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { CalendarMonth, KIND_LABEL } from '../../components/CalendarMonth'
import { Card, Empty, PageHeader, SectionTitle } from '../../components/ui'
import type { ReminderKind } from '../../types'
import { formatDate, toDayKey } from '../../utils'
import { usePatient } from './usePatient'

export function Calendario() {
  const { patientId, reminders, addReminder, removeReminder } = usePatient()
  const [month, setMonth] = useState(new Date())
  const [selected, setSelected] = useState(toDayKey(new Date()))
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('')
  const [kind, setKind] = useState<ReminderKind>('cuidado')

  const mine = reminders.filter((r) => r.patientId === patientId)
  const ofDay = mine
    .filter((r) => r.date === selected)
    .sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    addReminder({ patientId, date: selected, time: time || undefined, title: title.trim(), kind, createdBy: 'paciente' })
    setTitle('')
    setTime('')
    setAdding(false)
  }

  return (
    <div className="page">
      <PageHeader title={`Recordatorios ${month.getFullYear()}`} subtitle="Controles, medicamentos y cuidados" />
      <Card>
        <CalendarMonth month={month} onMonthChange={setMonth} selected={selected} onSelect={setSelected} reminders={mine} />
      </Card>

      <SectionTitle
        action={
          <button className="icon-btn icon-btn--primary" onClick={() => setAdding(!adding)} aria-label="Agregar recordatorio">
            <Plus size={18} />
          </button>
        }
      >
        {formatDate(selected + 'T12:00')}
      </SectionTitle>

      {adding && (
        <Card className="form">
          <form onSubmit={submit}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="¿Qué quieres recordar?" aria-label="Recordatorio" autoFocus />
            <div className="row">
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} aria-label="Hora" />
              <select value={kind} onChange={(e) => setKind(e.target.value as ReminderKind)} aria-label="Tipo">
                {(Object.keys(KIND_LABEL) as ReminderKind[]).map((k) => (
                  <option key={k} value={k}>{KIND_LABEL[k]}</option>
                ))}
              </select>
            </div>
            <button className="btn btn--primary btn--block" type="submit" disabled={!title.trim()}>Guardar</button>
          </form>
        </Card>
      )}

      {ofDay.length === 0 && !adding && <Empty>Sin recordatorios este día.</Empty>}
      <div className="stack">
        {ofDay.map((r) => (
          <Card key={r.id} className="reminder">
            <i className={`dot dot--lg kind--${r.kind}`} />
            <div className="grow">
              <strong>{r.title}</strong>
              <small>{r.time ? `${r.time} · ` : ''}{KIND_LABEL[r.kind]}{r.createdBy === 'medico' ? ' · indicado por tu médico' : ''}</small>
            </div>
            {r.createdBy === 'paciente' && (
              <button className="icon-btn" onClick={() => removeReminder(r.id)} aria-label="Eliminar">
                <Trash2 size={18} />
              </button>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

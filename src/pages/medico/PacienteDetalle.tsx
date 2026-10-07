import { useEffect, useState, type FormEvent } from 'react'
import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import { Phone, Plus, ShieldCheck, Trash2, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { currentDoctor, patients, surveyQuestions } from '../../data/mock'
import { Chat } from '../../components/Chat'
import { KIND_LABEL } from '../../components/CalendarMonth'
import { LevelFace } from '../../components/LevelFace'
import { Card, Empty, PageHeader, SectionTitle } from '../../components/ui'
import type { RecoveryPlan, ReminderKind } from '../../types'
import { LEVEL_INFO, currentLevel, formatDateTime, formatShortDate, recoveryWeek } from '../../utils'

const tabs = [
  { id: 'plan', label: 'Plan' },
  { id: 'encuestas', label: 'Encuestas' },
  { id: 'chat', label: 'Chat' },
  { id: 'recordatorios', label: 'Recordatorios' },
] as const
type Tab = (typeof tabs)[number]['id']

export function PacienteDetalle() {
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const { responses } = useApp()
  const patient = patients.find((p) => p.id === id)
  if (!patient) return <Navigate to="/medico" replace />

  const tab = (params.get('tab') as Tab) ?? 'plan'
  const level = currentLevel(responses, patient.id)

  return (
    <div className={`page${tab === 'chat' ? ' page--chat' : ''}`}>
      <PageHeader
        title={patient.name}
        subtitle={`${patient.age} años · RUT ${patient.rut}`}
        back
        action={<LevelFace level={level} size={36} />}
      />
      <div className="tabs" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`tab${tab === t.id ? ' is-active' : ''}`}
            onClick={() => setParams({ tab: t.id }, { replace: true })}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'plan' && <PlanEditor patientId={patient.id} phone={patient.phone} code={patient.code} />}
      {tab === 'encuestas' && <SurveyHistory patientId={patient.id} />}
      {tab === 'chat' && <Chat patientId={patient.id} staffId={currentDoctor.id} me="medico" />}
      {tab === 'recordatorios' && <PatientReminders patientId={patient.id} />}
    </div>
  )
}

function EditableList({ items, onChange, placeholder }: { items: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [value, setValue] = useState('')
  return (
    <div className="edit-list">
      {items.map((c, i) => (
        <div key={i} className="edit-list__item">
          <span>{c}</span>
          <button type="button" className="icon-btn" aria-label="Quitar" onClick={() => onChange(items.filter((_, j) => j !== i))}>
            <X size={16} />
          </button>
        </div>
      ))}
      <div className="row">
        <input value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} />
        <button
          type="button"
          className="icon-btn icon-btn--primary"
          aria-label="Agregar"
          disabled={!value.trim()}
          onClick={() => {
            onChange([...items, value.trim()])
            setValue('')
          }}
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  )
}

function PlanEditor({ patientId, phone, code }: { patientId: string; phone: string; code: string }) {
  const { plans, savePlan } = useApp()
  const saved = plans.find((p) => p.patientId === patientId)!
  const [draft, setDraft] = useState<RecoveryPlan>(saved)
  const [flash, setFlash] = useState('')
  useEffect(() => setDraft(saved), [saved])

  const set = <K extends keyof RecoveryPlan>(k: K, v: RecoveryPlan[K]) => setDraft((d) => ({ ...d, [k]: v }))

  const save = (validate: boolean) => {
    savePlan({
      ...draft,
      validated: validate || draft.validated,
      validatedBy: validate ? currentDoctor.name : draft.validatedBy,
      updatedAt: new Date().toISOString(),
    })
    setFlash(validate ? 'Plan validado y enviado a la paciente ✅' : 'Cambios guardados')
    setTimeout(() => setFlash(''), 2500)
  }

  return (
    <>
      <Card className="info-row">
        <span className="meta"><Phone size={14} /> {phone}</span>
        <span className="meta">Código app: <b>{code}</b></span>
        <span className="meta">Semana {recoveryWeek(draft)}</span>
      </Card>

      {draft.validated ? (
        <p className="trust trust--box"><ShieldCheck size={18} /> Validado por {draft.validatedBy} · {formatShortDate(draft.updatedAt)}</p>
      ) : (
        <p className="notice">Este plan aún no está validado. Revísalo antes de que la paciente se retire.</p>
      )}

      <Card className="form">
        <label className="form__label" htmlFor="proc">Procedimiento</label>
        <input id="proc" value={draft.procedure} onChange={(e) => set('procedure', e.target.value)} />
        <label className="form__label" htmlFor="diag">Diagnóstico</label>
        <input id="diag" value={draft.diagnosis} onChange={(e) => set('diagnosis', e.target.value)} />
        <div className="row">
          <div className="grow">
            <label className="form__label" htmlFor="pdate">Fecha procedimiento</label>
            <input id="pdate" type="date" value={draft.procedureDate.slice(0, 10)} onChange={(e) => set('procedureDate', new Date(e.target.value + 'T12:00').toISOString())} />
          </div>
          <div className="grow">
            <label className="form__label" htmlFor="ctrl">Próximo control</label>
            <input id="ctrl" type="date" value={draft.nextControl.slice(0, 10)} onChange={(e) => set('nextControl', new Date(e.target.value + 'T12:00').toISOString())} />
          </div>
        </div>
        <label className="form__label">Cuidados</label>
        <EditableList items={draft.cares} onChange={(v) => set('cares', v)} placeholder="Agregar cuidado…" />
        <label className="form__label">Consultar si aparece</label>
        <EditableList items={draft.warnings} onChange={(v) => set('warnings', v)} placeholder="Agregar signo de alarma…" />

        <div className="row">
          <button className="btn btn--ghost grow" onClick={() => save(false)}>Guardar</button>
          <button className="btn btn--primary grow" onClick={() => save(true)}>
            {draft.validated ? 'Guardar y re-validar' : 'Validar plan'}
          </button>
        </div>
        {flash && <p className="success">{flash}</p>}
      </Card>
    </>
  )
}

function SurveyHistory({ patientId }: { patientId: string }) {
  const { responses } = useApp()
  const list = responses.filter((r) => r.patientId === patientId).sort((a, b) => b.at.localeCompare(a.at))
  if (list.length === 0) return <Empty>La paciente aún no responde encuestas.</Empty>
  return (
    <div className="stack">
      {list.map((r) => (
        <Card key={r.id} className={`level-border--${r.level}`}>
          <div className="appt__head">
            <strong>{formatDateTime(r.at)}</strong>
            <span className={`pill level-bg--${r.level}`}>
              <LevelFace level={r.level} size={18} /> {LEVEL_INFO[r.level].title}
            </span>
          </div>
          <dl className="answers">
            {surveyQuestions.map((q) => {
              const opt = q.options[r.answers[q.id]]
              if (!opt) return null
              return (
                <div key={q.id}>
                  <dt>{q.text}</dt>
                  <dd className={opt.level ? `level-text--${opt.level}` : ''}>{opt.label}</dd>
                </div>
              )
            })}
          </dl>
          {r.comment && <p className="quote">“{r.comment}”</p>}
        </Card>
      ))}
    </div>
  )
}

function PatientReminders({ patientId }: { patientId: string }) {
  const { reminders, addReminder, removeReminder } = useApp()
  const [form, setForm] = useState({ title: '', date: '', time: '', kind: 'control' as ReminderKind })
  const list = reminders.filter((r) => r.patientId === patientId).sort((a, b) => a.date.localeCompare(b.date))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.date) return
    addReminder({ patientId, title: form.title.trim(), date: form.date, time: form.time || undefined, kind: form.kind, createdBy: 'medico' })
    setForm({ ...form, title: '', time: '' })
  }

  return (
    <>
      <Card className="form">
        <form onSubmit={submit}>
          <label className="form__label">Nuevo recordatorio para la paciente</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ej: Control post conización" />
          <div className="row">
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} aria-label="Fecha" />
            <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} aria-label="Hora" />
          </div>
          <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as ReminderKind })} aria-label="Tipo">
            {(Object.keys(KIND_LABEL) as ReminderKind[]).map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
          </select>
          <button className="btn btn--primary btn--block" type="submit" disabled={!form.title.trim() || !form.date}>Agregar</button>
        </form>
      </Card>
      <SectionTitle>Programados</SectionTitle>
      {list.length === 0 && <Empty>Sin recordatorios.</Empty>}
      <div className="stack">
        {list.map((r) => (
          <Card key={r.id} className="reminder">
            <i className={`dot dot--lg kind--${r.kind}`} />
            <div className="grow">
              <strong>{r.title}</strong>
              <small>{formatShortDate(r.date + 'T12:00')}{r.time ? ` · ${r.time}` : ''} · {KIND_LABEL[r.kind]}{r.createdBy === 'paciente' ? ' · creado por la paciente' : ''}</small>
            </div>
            <button className="icon-btn" onClick={() => removeReminder(r.id)} aria-label="Eliminar"><Trash2 size={18} /></button>
          </Card>
        ))}
      </div>
    </>
  )
}

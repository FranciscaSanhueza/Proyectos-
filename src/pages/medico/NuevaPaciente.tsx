import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, PartyPopper } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Card, PageHeader } from '../../components/ui'
import type { Patient } from '../../types'
import { normalizeRut, toDayKey } from '../../utils'

const PROCEDURES = ['Conización cervical (LEEP)', 'Conización con bisturí frío', 'Biopsia por colposcopía', 'Crioterapia', 'Otro']

export function NuevaPaciente() {
  const { addPatient, patients } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    rut: '',
    age: '',
    phone: '',
    email: '',
    procedure: PROCEDURES[0],
    diagnosis: 'Lesión precancerosa · NIE ',
    procedureDate: toDayKey(new Date()),
  })
  const [error, setError] = useState('')
  const [created, setCreated] = useState<Patient | null>(null)
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (patients.some((p) => normalizeRut(p.rut) === normalizeRut(form.rut))) {
      setError('Ya existe una paciente con ese RUT.')
      return
    }
    const patient = addPatient(
      { name: form.name.trim(), rut: form.rut.trim(), age: Number(form.age) || 0, phone: form.phone.trim(), email: form.email.trim() || undefined },
      { procedure: form.procedure, diagnosis: form.diagnosis.trim(), procedureDate: new Date(form.procedureDate + 'T12:00').toISOString() },
    )
    setCreated(patient)
  }

  if (created) {
    return (
      <div className="page">
        <PageHeader title="Paciente agregada" back />
        <Card className="survey-state pop-in">
          <PartyPopper size={56} className="accent" />
          <h2>{created.name} ya está en tu lista</h2>
          <p>Entrégale este código en la consulta para que active la app con su RUT:</p>
          <button className="code-chip" onClick={() => navigator.clipboard?.writeText(created.code)} aria-label="Copiar código">
            {created.code} <Copy size={18} />
          </button>
          <p className="muted">Antes de que se retire, revisa y valida su plan de recuperación.</p>
          <button className="btn btn--primary btn--block" onClick={() => navigate(`/medico/pacientes/${created.id}?tab=plan`, { replace: true })}>
            Revisar y validar su plan
          </button>
        </Card>
      </div>
    )
  }

  const valid = form.name.trim() && form.rut.trim() && form.procedureDate

  return (
    <div className="page">
      <PageHeader title="Nueva paciente" subtitle="Se genera un código para que active la app" back />
      <Card className="form">
        <form onSubmit={submit}>
          <label className="form__label" htmlFor="np-name">Nombre completo</label>
          <input id="np-name" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ej: Ana Pérez Rojas" />
          <div className="row">
            <div className="grow">
              <label className="form__label" htmlFor="np-rut">RUT</label>
              <input id="np-rut" value={form.rut} onChange={(e) => { set('rut', e.target.value); setError('') }} placeholder="12.345.678-9" />
            </div>
            <div style={{ width: 90 }}>
              <label className="form__label" htmlFor="np-age">Edad</label>
              <input id="np-age" type="number" min={0} value={form.age} onChange={(e) => set('age', e.target.value)} />
            </div>
          </div>
          <label className="form__label" htmlFor="np-phone">Teléfono</label>
          <input id="np-phone" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+56 9 …" />
          <label className="form__label" htmlFor="np-email">Correo (opcional)</label>
          <input id="np-email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />

          <hr className="divider" />
          <label className="form__label" htmlFor="np-proc">Procedimiento</label>
          <select id="np-proc" value={form.procedure} onChange={(e) => set('procedure', e.target.value)}>
            {PROCEDURES.map((p) => <option key={p}>{p}</option>)}
          </select>
          <label className="form__label" htmlFor="np-diag">Diagnóstico</label>
          <input id="np-diag" value={form.diagnosis} onChange={(e) => set('diagnosis', e.target.value)} />
          <label className="form__label" htmlFor="np-date">Fecha del procedimiento</label>
          <input id="np-date" type="date" value={form.procedureDate} onChange={(e) => set('procedureDate', e.target.value)} />

          {error && <p className="form__error">{error}</p>}
          <button className="btn btn--primary btn--block" type="submit" disabled={!valid}>Agregar paciente</button>
        </form>
      </Card>
    </div>
  )
}

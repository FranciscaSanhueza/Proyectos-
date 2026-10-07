import { useEffect, useState } from 'react'
import { Check, ClipboardCheck, HeartPulse, MessageCircleQuestion, NotebookPen, Plus, Save, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Card, Empty, SectionTitle } from '../../components/ui'
import { EvolutionChart } from '../../components/EvolutionChart'
import { MOODS } from '../../components/MoodPicker'
import type { Patient } from '../../types'
import { formatShortDate, latestResponse, toDayKey } from '../../utils'

const lastDays = (n: number) =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (n - 1 - i))
    return toDayKey(d)
  })

const weekdayFmt = new Intl.DateTimeFormat('es-CL', { weekday: 'narrow' })

/** Vista general de la paciente para el médico. */
export function Resumen({ patientId, onGo }: { patientId: string; onGo: (tab: 'encuestas' | 'perfil' | 'plan') => void }) {
  const { patients, plans, responses, checkIns, careLogs, questions } = useApp()
  const patient = patients.find((p) => p.id === patientId)!
  const plan = plans.find((p) => p.patientId === patientId)!
  const mine = responses.filter((r) => r.patientId === patientId)
  const last = latestResponse(responses, patientId)
  const days = lastDays(7)

  const moods = days.map((d) => checkIns.find((c) => c.patientId === patientId && c.date === d)?.mood)
  const answeredMoods = moods.filter((m): m is NonNullable<typeof m> => !!m)
  const avgMood = answeredMoods.length ? answeredMoods.reduce((a, b) => a + b, 0) / answeredMoods.length : null

  const careTotal = plan.cares.length * days.length
  const careDone = careLogs
    .filter((l) => l.patientId === patientId && days.includes(l.date))
    .reduce((n, l) => n + l.done.filter((c) => plan.cares.includes(c)).length, 0)
  const carePct = careTotal ? Math.round((careDone / careTotal) * 100) : 0

  const pendingQs = questions.filter((q) => q.patientId === patientId && !q.answered)

  return (
    <div className="stack stagger">
      <div className="kpis">
        <div className="kpi">
          <ClipboardCheck size={18} />
          <strong>{last ? formatShortDate(last.at) : '—'}</strong>
          <small>Última encuesta</small>
        </div>
        <div className="kpi">
          <HeartPulse size={18} />
          <strong>{avgMood ? MOODS[Math.round(avgMood) - 1].emoji : '—'}</strong>
          <small>Ánimo 7 días</small>
        </div>
        <div className="kpi">
          <Check size={18} />
          <strong>{carePct}%</strong>
          <small>Cuidados cumplidos</small>
        </div>
      </div>

      <Card>
        <p className="form__label">Ánimo diario (últimos 7 días)</p>
        <div className="mood-strip">
          {days.map((d, i) => (
            <div key={d} className="mood-strip__day">
              <span className="mood-strip__emoji" title={moods[i] ? MOODS[moods[i]! - 1].label : 'Sin registro'}>
                {moods[i] ? MOODS[moods[i]! - 1].emoji : '·'}
              </span>
              <small>{weekdayFmt.format(new Date(d + 'T12:00'))}</small>
            </div>
          ))}
        </div>
      </Card>

      <SectionTitle action={<button className="link-btn" onClick={() => onGo('encuestas')}>Ver encuestas</button>}>
        Evolución
      </SectionTitle>
      <Card>
        <EvolutionChart responses={mine} plan={plan} />
      </Card>

      <SectionTitle>
        <MessageCircleQuestion size={18} className="accent" /> Preguntas para el control
      </SectionTitle>
      {pendingQs.length === 0 ? (
        <Empty>La paciente no ha anotado preguntas.</Empty>
      ) : (
        <Card>
          <ul className="plan-list">
            {pendingQs.map((q) => (
              <li key={q.id}>
                <MessageCircleQuestion size={18} className="accent" /> {q.text}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <SectionTitle action={<button className="link-btn" onClick={() => onGo('perfil')}>Editar</button>}>
        <NotebookPen size={18} className="accent" /> Notas privadas
      </SectionTitle>
      <Card className="private-note">
        <p>{patient.notes || 'Sin notas. Agrégalas en la pestaña Perfil.'}</p>
        <small className="muted">Solo las ve el equipo médico.</small>
      </Card>
    </div>
  )
}

const TAG_SUGGESTIONS = ['Primera conización', 'Recidiva', 'Embarazo a futuro', 'Ansiedad', 'Sangrado aumentado', 'Biopsia en estudio', 'Inmunosuprimida']

/** Edición de datos, prioridad, etiquetas, notas y estado. */
export function PerfilEditor({ patientId }: { patientId: string }) {
  const { patients, updatePatient } = useApp()
  const patient = patients.find((p) => p.id === patientId)!
  const [draft, setDraft] = useState<Patient>(patient)
  const [tag, setTag] = useState('')
  const [saved, setSaved] = useState(false)
  useEffect(() => setDraft(patient), [patient])

  const set = <K extends keyof Patient>(k: K, v: Patient[K]) => setDraft((d) => ({ ...d, [k]: v }))
  const addTag = (t: string) => {
    const clean = t.trim()
    if (clean && !draft.tags.includes(clean)) set('tags', [...draft.tags, clean])
    setTag('')
  }
  const save = () => {
    updatePatient(patientId, draft)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="stack stagger">
      <Card className="form">
        <p className="form__label">Datos de contacto</p>
        <label className="field-label" htmlFor="pf-name">Nombre</label>
        <input id="pf-name" value={draft.name} onChange={(e) => set('name', e.target.value)} />
        <div className="row">
          <div className="grow">
            <label className="field-label" htmlFor="pf-phone">Teléfono</label>
            <input id="pf-phone" value={draft.phone} onChange={(e) => set('phone', e.target.value)} />
          </div>
          <div style={{ width: 90 }}>
            <label className="field-label" htmlFor="pf-age">Edad</label>
            <input id="pf-age" type="number" value={draft.age} onChange={(e) => set('age', Number(e.target.value))} />
          </div>
        </div>
        <label className="field-label" htmlFor="pf-email">Correo</label>
        <input id="pf-email" type="email" value={draft.email ?? ''} onChange={(e) => set('email', e.target.value)} />
        <p className="muted">Código de acceso a la app: <b>{draft.code}</b></p>
      </Card>

      <Card className="form">
        <p className="form__label">Prioridad de seguimiento</p>
        <div className="segmented">
          {(['normal', 'alta'] as const).map((p) => (
            <button key={p} className={`segmented__opt${draft.priority === p ? ' is-active' : ''}`} onClick={() => set('priority', p)}>
              {p === 'alta' ? '🚩 Alta' : 'Normal'}
            </button>
          ))}
        </div>

        <p className="form__label">Etiquetas</p>
        <div className="tag-list">
          {draft.tags.map((t) => (
            <span key={t} className="tag tag--removable">
              {t}
              <button aria-label={`Quitar ${t}`} onClick={() => set('tags', draft.tags.filter((x) => x !== t))}><X size={12} /></button>
            </span>
          ))}
        </div>
        <div className="row">
          <input value={tag} onChange={(e) => setTag(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTag(tag)} placeholder="Nueva etiqueta…" />
          <button className="icon-btn icon-btn--primary" onClick={() => addTag(tag)} disabled={!tag.trim()} aria-label="Agregar etiqueta"><Plus size={18} /></button>
        </div>
        <div className="chips">
          {TAG_SUGGESTIONS.filter((t) => !draft.tags.includes(t)).map((t) => (
            <button key={t} className="chip chip--sm" onClick={() => addTag(t)}>+ {t}</button>
          ))}
        </div>
      </Card>

      <Card className="form">
        <label className="form__label" htmlFor="pf-notes">Notas privadas</label>
        <textarea id="pf-notes" rows={4} value={draft.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Antecedentes, contexto, acuerdos… (no visibles para la paciente)" />
      </Card>

      <Card className="form">
        <p className="form__label">Estado</p>
        <div className="segmented">
          {(['activa', 'alta'] as const).map((st) => (
            <button key={st} className={`segmented__opt${draft.status === st ? ' is-active' : ''}`} onClick={() => set('status', st)}>
              {st === 'activa' ? 'En seguimiento' : 'Dada de alta'}
            </button>
          ))}
        </div>
        {draft.status === 'alta' && <small className="muted">Al darla de alta deja de aparecer en la lista principal y no podrá entrar a la app.</small>}
      </Card>

      <button className="btn btn--primary btn--block" onClick={save}>
        <Save size={18} /> Guardar cambios
      </button>
      {saved && <p className="success pop-in">Perfil actualizado ✅</p>}
    </div>
  )
}

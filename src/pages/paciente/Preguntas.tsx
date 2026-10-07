import { useState, type FormEvent } from 'react'
import { CalendarDays, Check, Lightbulb, Plus, Trash2 } from 'lucide-react'
import { Card, Empty, PageHeader, SectionTitle } from '../../components/ui'
import { formatShortDate } from '../../utils'
import { usePatient } from './usePatient'

const IDEAS = [
  '¿Cuándo puedo volver a hacer ejercicio?',
  '¿Cuándo puedo retomar mi vida sexual?',
  '¿Qué significa el resultado de mi biopsia?',
  '¿Cada cuánto debo hacerme controles?',
  '¿Puedo embarazarme en el futuro?',
  '¿Debo vacunarme contra el VPH?',
]

/** Lista de preguntas que la paciente quiere llevar a su próximo control. */
export function Preguntas() {
  const { patientId, plan, questions, addQuestion, toggleQuestion, removeQuestion } = usePatient()
  const [text, setText] = useState('')
  const mine = questions.filter((q) => q.patientId === patientId)
  const pending = mine.filter((q) => !q.answered)
  const done = mine.filter((q) => q.answered)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    addQuestion(patientId, text.trim())
    setText('')
  }

  return (
    <div className="page stagger">
      <PageHeader title="Mis preguntas" subtitle="Anótalas para no olvidarlas en tu control" back />

      <Card className="info-row">
        <span className="meta"><CalendarDays size={16} /> Próximo control: <b>{formatShortDate(plan.nextControl)}</b></span>
        <small className="muted">Tu médica podrá verlas antes de la consulta.</small>
      </Card>

      <form className="row" onSubmit={submit}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe tu pregunta…" aria-label="Nueva pregunta" />
        <button className="icon-btn icon-btn--primary" type="submit" disabled={!text.trim()} aria-label="Agregar">
          <Plus size={20} />
        </button>
      </form>

      <div className="chips">
        <Lightbulb size={16} className="accent" />
        {IDEAS.filter((i) => !mine.some((q) => q.text === i)).slice(0, 4).map((i) => (
          <button key={i} className="chip chip--sm" onClick={() => addQuestion(patientId, i)}>+ {i}</button>
        ))}
      </div>

      <SectionTitle>Por preguntar ({pending.length})</SectionTitle>
      {pending.length === 0 && <Empty>No tienes preguntas pendientes.</Empty>}
      <div className="stack">
        {pending.map((q) => (
          <div key={q.id} className="question-item pop-in">
            <button className="care-item__box" onClick={() => toggleQuestion(q.id)} aria-label="Marcar como respondida" />
            <span className="grow">{q.text}</span>
            <button className="icon-btn" onClick={() => removeQuestion(q.id)} aria-label="Eliminar"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>

      {done.length > 0 && (
        <>
          <SectionTitle>Ya respondidas</SectionTitle>
          <div className="stack">
            {done.map((q) => (
              <div key={q.id} className="question-item is-done">
                <button className="care-item__box" onClick={() => toggleQuestion(q.id)} aria-label="Marcar como pendiente">
                  <Check size={16} strokeWidth={3} />
                </button>
                <span className="grow">{q.text}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

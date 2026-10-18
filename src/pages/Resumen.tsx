import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Printer } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { surveyQuestions } from '../data/mock'
import { MOODS } from '../components/MoodPicker'
import { ShareButtons } from '../components/ShareButtons'
import { LEVEL_INFO, currentLevel, daysSince, formatDate, formatShortDate, recoveryWeek, toDayKey } from '../utils'

const DAY = 24 * 60 * 60 * 1000
const COLUMN: Record<string, string> = { sangrado: 'Sangrado', dolor: 'Dolor', fiebre: 'Fiebre', flujo: 'Flujo', plan: 'Plan', animo: 'Ánimo' }

/**
 * Resumen de la recuperación para llevar al control (o adjuntar a la ficha).
 * Se imprime o guarda como PDF con el diálogo de impresión del navegador.
 */
export function Resumen() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { session, patients, plans, responses, checkIns, careLogs, questions, symptomLogs } = useApp()

  const patient = patients.find((p) => p.id === id)
  const plan = plans.find((p) => p.patientId === id)
  const isDoctor = session?.role === 'medico'
  if (!patient || !plan || !(isDoctor || session?.patientId === id)) return <Navigate to="/" replace />

  const level = currentLevel(responses, id, symptomLogs)
  const surveys = responses.filter((r) => r.patientId === id).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 6)
  const days = Array.from({ length: 7 }, (_, i) => toDayKey(new Date(Date.now() - (6 - i) * DAY)))
  const moodOf = (d: string) => checkIns.find((c) => c.patientId === id && c.date === d)?.mood
  const careOf = (d: string) => careLogs.find((l) => l.patientId === id && l.date === d)?.done.filter((c) => plan.cares.includes(c)).length ?? 0
  const pending = questions.filter((q) => q.patientId === id && !q.answered)
  const answerLabel = (qid: string, i: number | undefined) =>
    i === undefined ? '—' : surveyQuestions.find((q) => q.id === qid)?.options[i]?.label ?? '—'

  return (
    <div className="summary">
      <div className="summary__bar no-print">
        <button className="btn btn--ghost" onClick={() => navigate(-1)}><ChevronLeft size={18} /> Volver</button>
        <button className="btn btn--primary" onClick={() => window.print()}><Printer size={18} /> Descargar PDF / imprimir</button>
      </div>
      <p className="summary__tip no-print">En el diálogo de impresión elige «Guardar como PDF» para descargarlo.</p>
      {!isDoctor && (
        <div className="summary__share no-print">
          <small>Envía lo principal a tu pareja o familia:</small>
          <ShareButtons
            title="Mi recuperación en Cérvix-B"
            text={
              `Mi recuperación en Cérvix-B 💜\n` +
              `• Semáforo: ${LEVEL_INFO[level].title}\n` +
              `• Semana ${recoveryWeek(plan)} después de mi ${plan.procedure.toLowerCase()}\n` +
              `• Próximo control: ${formatShortDate(plan.nextControl)}\n` +
              (pending.length ? `• Preguntas para el control:\n${pending.map((q) => `   – ${q.text}`).join('\n')}\n` : '') +
              `• Señales de alarma: ${plan.warnings.join('; ')} → urgencias o 131.`
            }
          />
        </div>
      )}

      <article className="summary__sheet">
        <header className="summary__head">
          <div>
            <p className="summary__brand">Cérvix-B · Resumen de seguimiento</p>
            <h1>{patient.name}</h1>
            <p>{patient.age} años · RUT {patient.rut} · {patient.phone}</p>
          </div>
          <div className={`summary__level level-bg--${level}`}>
            <small>Semáforo actual</small>
            <strong className={`level-text--${level}`}>{LEVEL_INFO[level].title}</strong>
          </div>
        </header>

        <section>
          <h2>Plan de recuperación</h2>
          <dl className="summary__facts">
            <dt>Procedimiento</dt><dd>{plan.procedure} · {formatShortDate(plan.procedureDate)}</dd>
            <dt>Diagnóstico</dt><dd>{plan.diagnosis}</dd>
            <dt>Recuperación</dt><dd>Semana {recoveryWeek(plan)} · {daysSince(plan.procedureDate)} días</dd>
            <dt>Próximo control</dt><dd>{formatShortDate(plan.nextControl)}</dd>
            <dt>Validación</dt><dd>{plan.validated ? `Validado por ${plan.validatedBy}` : 'Pendiente de validación'}</dd>
          </dl>
          <div className="summary__cols">
            <div>
              <h3>Cuidados indicados</h3>
              <ul>{plan.cares.map((c) => <li key={c}>{c}</li>)}</ul>
            </div>
            <div>
              <h3>Consultar si aparece</h3>
              <ul>{plan.warnings.map((c) => <li key={c}>{c}</li>)}</ul>
            </div>
          </div>
        </section>

        <section>
          <h2>Últimos 7 días</h2>
          <table className="summary__table">
            <thead>
              <tr><th></th>{days.map((d) => <th key={d}>{formatDate(d + 'T12:00')}</th>)}</tr>
            </thead>
            <tbody>
              <tr><th>Ánimo</th>{days.map((d) => <td key={d}>{moodOf(d) ? MOODS[moodOf(d)! - 1].label : '—'}</td>)}</tr>
              <tr><th>Cuidados</th>{days.map((d) => <td key={d}>{careOf(d)}/{plan.cares.length}</td>)}</tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2>Encuestas semanales</h2>
          {surveys.length === 0 ? (
            <p>Aún no hay encuestas respondidas.</p>
          ) : (
            <table className="summary__table summary__table--wide">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Nivel</th>
                  {surveyQuestions.map((q) => <th key={q.id}>{COLUMN[q.id]}</th>)}
                </tr>
              </thead>
              <tbody>
                {surveys.map((r) => (
                  <tr key={r.id}>
                    <td>{formatDate(r.at)}</td>
                    <td className={`level-text--${r.level}`}><b>{LEVEL_INFO[r.level].title}</b></td>
                    {surveyQuestions.map((q) => <td key={q.id}>{answerLabel(q.id, r.answers[q.id])}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {surveys.filter((r) => r.comment).map((r) => (
            <p key={r.id} className="summary__comment">«{r.comment}» <small>— {formatDate(r.at)}</small></p>
          ))}
        </section>

        <section>
          <h2>Preguntas para el control</h2>
          {pending.length === 0 ? <p>Sin preguntas pendientes.</p> : <ol>{pending.map((q) => <li key={q.id}>{q.text}</li>)}</ol>}
        </section>

        {isDoctor && patient.notes && (
          <section>
            <h2>Notas privadas del equipo</h2>
            <p>{patient.notes}</p>
          </section>
        )}

        <footer className="summary__foot">
          Generado el {formatShortDate(new Date().toISOString())} desde Cérvix-B (prototipo académico). La información
          registrada por la paciente no reemplaza la evaluación clínica.
        </footer>
      </article>
    </div>
  )
}

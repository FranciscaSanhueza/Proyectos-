import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardCheck, ClipboardList, Clock } from 'lucide-react'
import { Card, PageHeader } from '../../components/ui'
import { LevelFace } from '../../components/LevelFace'
import { surveyQuestions } from '../../data/mock'
import type { Level } from '../../types'
import { LEVEL_INFO, formatShortDate, levelFromAnswers, surveyStatus } from '../../utils'
import { usePatient } from './usePatient'

type Step = 'intro' | 'questions' | 'done'

export function Encuesta() {
  const { patientId, responses, submitSurvey } = usePatient()
  const navigate = useNavigate()
  const status = surveyStatus(responses, patientId)
  const [step, setStep] = useState<Step>('intro')
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [comment, setComment] = useState('')
  const [result, setResult] = useState<Level | null>(null)

  // Una página de preguntas por pantalla, con la última para comentarios.
  const total = surveyQuestions.length + 1
  const question = surveyQuestions[index]

  const send = () => {
    const level = levelFromAnswers(surveyQuestions, answers)
    submitSurvey({ patientId, answers, comment: comment.trim(), level })
    setResult(level)
    setStep('done')
  }

  if (step === 'done' && result) {
    const next = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    return (
      <div className="page">
        <PageHeader title="Encuesta semanal" />
        <Card className="survey-state">
          <ClipboardCheck size={64} className="accent" />
          <h2>¡Gracias por responder!</h2>
          <p>Tu equipo médico revisará tus respuestas.</p>
          <div className={`level-card level-bg--${result} is-current`}>
            <div>
              <strong className={`level-text--${result}`}>{LEVEL_INFO[result].title}</strong>
              <p>{LEVEL_INFO[result].message}</p>
            </div>
            <LevelFace level={result} size={48} />
          </div>
          <p className="muted">Próxima encuesta: <b>{formatShortDate(next)}</b></p>
          <button className="btn btn--primary btn--block" onClick={() => navigate('/paciente/semaforo')}>Ver mi semáforo</button>
        </Card>
      </div>
    )
  }

  if (!status.available && step === 'intro') {
    return (
      <div className="page">
        <PageHeader title="Encuesta semanal" />
        <Card className="survey-state">
          <ClipboardCheck size={64} className="accent" />
          <h2>Ya has respondido esta encuesta</h2>
          <p>Próxima encuesta disponible:</p>
          <strong className="big-date">{formatShortDate(status.next!.toISOString())}</strong>
          <p className="muted">Si antes tienes síntomas nuevos, revisa el semáforo o escribe a tu equipo.</p>
        </Card>
      </div>
    )
  }

  if (step === 'intro') {
    return (
      <div className="page">
        <PageHeader title="Encuesta semanal" />
        <Card className="survey-state">
          <ClipboardList size={64} className="accent" />
          <h2>Aún no has respondido</h2>
          <p>Cuéntanos cómo has estado esta semana. Con tus respuestas actualizamos tu semáforo y tu médico sigue tu evolución.</p>
          <button className="btn btn--primary btn--block" onClick={() => setStep('questions')}>Empezar</button>
          <span className="meta"><Clock size={16} /> 5 minutos</span>
        </Card>
      </div>
    )
  }

  const isComment = index === surveyQuestions.length
  const answered = isComment || answers[question.id] !== undefined

  return (
    <div className="page">
      <PageHeader title="Encuesta semanal" subtitle={`Pregunta ${index + 1} de ${total}`} />
      <div className="progress"><span style={{ width: `${((index + 1) / total) * 100}%` }} /></div>

      <Card className="form">
        {isComment ? (
          <>
            <label className="form__label" htmlFor="comment">¿Algo más que quieras contarle a tu médico? (opcional)</label>
            <textarea id="comment" rows={4} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Escribe aquí…" />
          </>
        ) : (
          <>
            <p className="form__label">{question.text}</p>
            {question.help && <small className="muted">{question.help}</small>}
            <div className="options">
              {question.options.map((o, i) => (
                <label key={o.label} className={`option${answers[question.id] === i ? ' is-active' : ''}`}>
                  <input
                    type="radio"
                    name={question.id}
                    checked={answers[question.id] === i}
                    onChange={() => setAnswers({ ...answers, [question.id]: i })}
                  />
                  {o.label}
                </label>
              ))}
            </div>
          </>
        )}
      </Card>

      <div className="row">
        {index > 0 && <button className="btn btn--ghost" onClick={() => setIndex(index - 1)}>Atrás</button>}
        {isComment ? (
          <button className="btn btn--primary grow" onClick={send}>Enviar</button>
        ) : (
          <button className="btn btn--primary grow" disabled={!answered} onClick={() => setIndex(index + 1)}>Siguiente</button>
        )}
      </div>
    </div>
  )
}

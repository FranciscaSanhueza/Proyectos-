import { useNavigate } from 'react-router-dom'
import { Bell, ClipboardCheck, ClipboardList, Settings, ShieldCheck } from 'lucide-react'
import { Card } from '../../components/ui'
import { LevelFace } from '../../components/LevelFace'
import { KIND_LABEL } from '../../components/CalendarMonth'
import { SupportCard } from '../../components/Support'
import { HIGH_WORRY } from '../../data/mock'
import { LEVEL_INFO, currentLevel, formatShortDate, recoveryWeek, surveyStatus, toDayKey } from '../../utils'
import { usePatient } from './usePatient'

export function Inicio() {
  const { patient, patientId, plan, responses, reminders } = usePatient()
  const navigate = useNavigate()

  const level = currentLevel(responses, patientId)
  const survey = surveyStatus(responses, patientId)
  const today = toDayKey(new Date())
  const upcoming = reminders
    .filter((r) => r.patientId === patientId && r.date >= today)
    .sort((a, b) => (a.date + (a.time ?? '')).localeCompare(b.date + (b.time ?? '')))
    .slice(0, 3)

  return (
    <div className="page">
      <header className="greeting">
        <div>
          <p className="greeting__hello">Inicio</p>
          <h1>Hola, {patient.name.split(' ')[0]}</h1>
          <p className="muted">Semana {recoveryWeek(plan)} de recuperación</p>
        </div>
        <button className="icon-btn" onClick={() => navigate('/paciente/ajustes')} aria-label="Ajustes">
          <Settings size={20} />
        </button>
      </header>

      <Card className={`home-card level-bg--${level}`} onClick={() => navigate('/paciente/semaforo')}>
        <div>
          <small>Mi semáforo</small>
          <strong className={`level-text--${level}`}>{LEVEL_INFO[level].title}</strong>
          <span>{LEVEL_INFO[level].message}</span>
        </div>
        <LevelFace level={level} size={56} />
      </Card>

      {level === 'rojo' && (
        <button className="btn btn--danger btn--block" onClick={() => navigate('/paciente/semaforo')}>
          Tu semáforo está en rojo: ver qué hacer
        </button>
      )}

      {survey.last && !survey.available && survey.last.answers.animo === HIGH_WORRY && <SupportCard />}

      <Card className="home-card" onClick={() => navigate('/paciente/encuesta')}>
        <div>
          <small>Encuesta semanal</small>
          {survey.available ? (
            <>
              <strong className="accent">¡Disponible!</strong>
              <span>Responde en 5 minutos cómo te has sentido esta semana.</span>
            </>
          ) : (
            <>
              <strong>Ya respondida</strong>
              <span>Próxima encuesta: {formatShortDate(survey.next!.toISOString())}</span>
            </>
          )}
        </div>
        <span className="home-card__icon">
          {survey.available ? <ClipboardList size={40} /> : <ClipboardCheck size={40} />}
        </span>
      </Card>

      <Card className="home-card" onClick={() => navigate('/paciente/calendario')}>
        <div>
          <small>Recordatorios</small>
          {upcoming.length === 0 && <span>No tienes recordatorios próximos.</span>}
          <ul className="mini-list">
            {upcoming.map((r) => (
              <li key={r.id}>
                <i className={`dot kind--${r.kind}`} />
                <span>
                  <b>{r.date === today ? 'Hoy' : formatShortDate(r.date + 'T12:00')}</b>
                  {r.time && ` · ${r.time}`} — {r.title}
                  <em> ({KIND_LABEL[r.kind]})</em>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <span className="home-card__icon"><Bell size={36} /></span>
      </Card>

      <p className="trust">
        <ShieldCheck size={16} /> Información validada por tu equipo médico
      </p>
    </div>
  )
}

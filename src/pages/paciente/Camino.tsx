import { Lock } from 'lucide-react'
import { Card, PageHeader, SectionTitle } from '../../components/ui'
import { recoveryMilestones } from '../../data/mock'
import { daysSince, toDayKey } from '../../utils'
import { usePatient } from './usePatient'

/** Camino de recuperación (hitos) y logros que se desbloquean. */
export function Camino() {
  const { patientId, plan, responses, checkIns, careLogs, questions } = usePatient()
  const days = daysSince(plan.procedureDate)
  const surveys = responses.filter((r) => r.patientId === patientId).length
  const myCheckIns = checkIns.filter((c) => c.patientId === patientId)
  const fullCareDays = careLogs.filter(
    (l) => l.patientId === patientId && plan.cares.length > 0 && plan.cares.every((c) => l.done.includes(c)),
  ).length

  // Racha de días seguidos con check-in, terminando hoy o ayer.
  let streak = 0
  const d = new Date()
  if (!myCheckIns.some((c) => c.date === toDayKey(d))) d.setDate(d.getDate() - 1)
  while (myCheckIns.some((c) => c.date === toDayKey(d))) {
    streak++
    d.setDate(d.getDate() - 1)
  }

  const badges = [
    { emoji: '🌱', title: 'Primer paso', text: 'Activaste tu app', got: true },
    { emoji: '📋', title: 'Constante', text: 'Respondiste 2 encuestas', got: surveys >= 2 },
    { emoji: '🔥', title: 'Racha de 3', text: '3 días seguidos de check-in', got: streak >= 3 },
    { emoji: '🌸', title: 'Autocuidado', text: 'Completaste tus cuidados de un día', got: fullCareDays >= 1 },
    { emoji: '💬', title: 'Preparada', text: 'Anotaste preguntas para tu control', got: questions.some((q) => q.patientId === patientId) },
    { emoji: '🗓️', title: 'Un mes', text: '28 días de recuperación', got: days >= 28 },
  ]
  const got = badges.filter((b) => b.got).length

  return (
    <div className="page stagger">
      <PageHeader title="Mi camino" subtitle={`Día ${days} de tu recuperación`} back />

      <SectionTitle>Mis logros ({got}/{badges.length})</SectionTitle>
      <div className="badges">
        {badges.map((b) => (
          <div key={b.title} className={`badge-card${b.got ? ' is-got' : ''}`}>
            <span className="badge-card__emoji">{b.got ? b.emoji : <Lock size={20} />}</span>
            <strong>{b.title}</strong>
            <small>{b.text}</small>
          </div>
        ))}
      </div>
      {streak > 0 && <p className="streak">🔥 Llevas <b>{streak}</b> día{streak > 1 ? 's' : ''} seguido{streak > 1 ? 's' : ''} contándonos cómo estás</p>}

      <SectionTitle>Hitos de recuperación</SectionTitle>
      <Card>
        <ol className="timeline">
          {recoveryMilestones.map((m, i) => {
            const next = recoveryMilestones[i + 1]
            const state = days >= m.day ? (next && days < next.day ? 'now' : 'done') : 'todo'
            return (
              <li key={m.day} className={`timeline__item is-${state}`}>
                <span className="timeline__dot" />
                <div>
                  <small>{m.day === 0 ? 'Día 0' : `Día ${m.day}`}{state === 'now' ? ' · estás aquí' : ''}</small>
                  <strong>{m.title}</strong>
                  <p>{m.detail}</p>
                </div>
              </li>
            )
          })}
        </ol>
        <p className="muted small-gap">Los tiempos son referenciales: sigue siempre las indicaciones de tu plan.</p>
      </Card>
    </div>
  )
}

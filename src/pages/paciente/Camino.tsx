import { useEffect, useRef, useState } from 'react'
import { Lock } from 'lucide-react'
import { Card, PageHeader, SectionTitle } from '../../components/ui'
import { recoveryMilestones } from '../../data/mock'
import { daysSince, toDayKey } from '../../utils'
import { PathMap } from '../../components/PathMap'
import { BodyWeek } from '../../components/BodyWeek'
import { Celebrate } from '../../components/Celebrate'
import { medStatus } from '../../components/Meds'
import { playSound } from '../../sound'
import { usePatient } from './usePatient'

interface Badge {
  id: string
  emoji: string
  title: string
  text: string
  got: boolean
}

/** Camino de recuperación ilustrado, «qué pasa en mi cuerpo» y medallas. */
export function Camino() {
  const { patientId, plan, responses, checkIns, careLogs, questions, diary, medLogs, prefs, markNotified } = usePatient()
  const days = daysSince(plan.procedureDate)
  const today = toDayKey(new Date())
  const surveys = responses.filter((r) => r.patientId === patientId).length
  const myCheckIns = checkIns.filter((c) => c.patientId === patientId)
  const diaryDays = diary.filter((e) => e.patientId === patientId).length
  const fullCareDays = careLogs.filter(
    (l) => l.patientId === patientId && plan.cares.length > 0 && plan.cares.every((c) => l.done.includes(c)),
  ).length
  const regularMeds = (plan.meds ?? []).filter((m) => !m.asNeeded && medStatus(m, today).state === 'active')
  const medsToday =
    regularMeds.length > 0 &&
    regularMeds.every((m) => (medLogs.find((l) => l.patientId === patientId && l.medId === m.id && l.date === today)?.taken ?? 0) >= m.perDay)

  // Racha de días seguidos con check-in, terminando hoy o ayer.
  let streak = 0
  const d = new Date()
  if (!myCheckIns.some((c) => c.date === toDayKey(d))) d.setDate(d.getDate() - 1)
  while (myCheckIns.some((c) => c.date === toDayKey(d))) {
    streak++
    d.setDate(d.getDate() - 1)
  }

  const badges: Badge[] = [
    { id: 'inicio', emoji: '🌱', title: 'Primer paso', text: 'Activaste tu app', got: true },
    { id: 'diario3', emoji: '📝', title: 'Me escucho', text: '3 días registrados en «Mi día»', got: diaryDays >= 3 },
    { id: 'diario7', emoji: '📆', title: 'Una semana', text: '7 días registrados en «Mi día»', got: diaryDays >= 7 },
    { id: 'meds', emoji: '💊', title: 'Al día', text: 'Tomaste todas tus dosis de hoy', got: medsToday },
    { id: 'encuestas', emoji: '📋', title: 'Constante', text: 'Respondiste 2 encuestas', got: surveys >= 2 },
    { id: 'racha', emoji: '🔥', title: 'Racha de 3', text: '3 días seguidos contándonos cómo estás', got: streak >= 3 },
    { id: 'cuidados', emoji: '🌸', title: 'Autocuidado', text: 'Completaste tus cuidados de un día', got: fullCareDays >= 1 },
    { id: 'preguntas', emoji: '💬', title: 'Preparada', text: 'Anotaste preguntas para tu control', got: questions.some((q) => q.patientId === patientId) },
    { id: 'mes', emoji: '🗓️', title: 'Un mes', text: '28 días de recuperación', got: days >= 28 },
  ]
  const got = badges.filter((b) => b.got).length

  // Medallas nuevas: se muestran una vez con brillo, lluvia y sonido.
  const fresh = badges.filter((b) => b.got && !prefs.notified.includes(`medal-${b.id}`))
  const [toast, setToast] = useState<Badge[] | null>(null)
  const done = useRef(false)
  useEffect(() => {
    if (done.current || fresh.length === 0) return
    done.current = true
    setToast(fresh)
    markNotified(fresh.map((b) => `medal-${b.id}`))
    setTimeout(() => playSound('medal'), 250)
  }, [fresh, markNotified])

  return (
    <div className="page stagger">
      <PageHeader title="Mi camino" subtitle={`Día ${days} de tu recuperación`} back />

      {toast && (
        <div className="overlay medal-toast" role="dialog" aria-modal="true" aria-label="Nueva medalla" onClick={() => setToast(null)}>
          <Celebrate count={18} />
          <div className="medal-toast__card" onClick={(e) => e.stopPropagation()}>
            <span className="medal-toast__medal" aria-hidden="true">{toast[0].emoji}</span>
            <small>{toast.length > 1 ? `¡${toast.length} medallas nuevas!` : '¡Medalla nueva!'}</small>
            <strong>{toast[0].title}</strong>
            <p>{toast[0].text}</p>
            {toast.length > 1 && <p className="muted">También: {toast.slice(1).map((b) => `${b.emoji} ${b.title}`).join(' · ')}</p>}
            <button className="btn btn--primary btn--block" onClick={() => setToast(null)} autoFocus>¡Genial!</button>
          </div>
        </div>
      )}

      <SectionTitle>Mi camino ilustrado</SectionTitle>
      <Card>
        <PathMap milestones={recoveryMilestones} days={days} />
        <p className="muted small-gap">Toca cada parada para ver qué pasa. Los tiempos son referenciales: sigue siempre las indicaciones de tu plan.</p>
      </Card>

      <SectionTitle>
        <span id="cuerpo" className="anchor" />
        ¿Qué pasa en mi cuerpo esta semana?
      </SectionTitle>
      <Card>
        <BodyWeek week={Math.floor(days / 7) + 1} />
      </Card>

      <SectionTitle>Mis medallas ({got}/{badges.length})</SectionTitle>
      <div className="badges">
        {badges.map((b) => (
          <div key={b.id} className={`badge-card${b.got ? ' is-got' : ''}`}>
            <span className="badge-card__emoji">{b.got ? b.emoji : <Lock size={20} />}</span>
            <strong>{b.title}</strong>
            <small>{b.text}</small>
          </div>
        ))}
      </div>
      {streak > 0 && <p className="streak">🔥 Llevas <b>{streak}</b> día{streak > 1 ? 's' : ''} seguido{streak > 1 ? 's' : ''} contándonos cómo estás</p>}
    </div>
  )
}

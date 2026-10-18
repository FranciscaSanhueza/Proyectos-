import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Bell, BookOpen, CalendarClock, ChevronRight, ClipboardCheck, ClipboardList, Flame, Flower2, HeartPulse, MessageCircle, MessageCircleQuestion, Route, Settings, ShieldCheck, Sparkles, type LucideIcon } from 'lucide-react'
import { Card, SectionTitle, SwitchProfileButton } from '../../components/ui'
import { LevelFace } from '../../components/LevelFace'
import { KIND_LABEL } from '../../components/CalendarMonth'
import { SupportCard } from '../../components/Support'
import { MOODS, MoodPicker } from '../../components/MoodPicker'
import { ProgressRing } from '../../components/ProgressRing'
import { Celebrate } from '../../components/Celebrate'
import { ReadAloud } from '../../components/ReadAloud'
import { HIGH_WORRY, affirmations, staff } from '../../data/mock'
import { LEVEL_INFO, checkInStreak, currentLevel, daysSince, formatShortDate, haptic, recoveryWeek, surveyStatus, toDayKey } from '../../utils'
import { usePatient } from './usePatient'

const RECOVERY_DAYS = 42 // ~6 semanas hasta el control

const HERO_MESSAGE = {
  verde: 'Vas muy bien 💪',
  amarillo: 'Estamos atentas contigo 💛',
  rojo: 'Hoy cuídate primero ❤️',
} as const

const EXPLORE = [
  { to: '/paciente/calma', icon: Flower2, title: 'Rincón de calma', text: 'Respira y relájate', tone: 'pink' },
  { to: '/paciente/aprende', icon: BookOpen, title: 'Aprende', text: 'Juego mito o verdad', tone: 'lilac' },
  { to: '/paciente/preguntas', icon: MessageCircleQuestion, title: 'Mis preguntas', text: 'Para tu control', tone: 'mint' },
  { to: '/paciente/camino', icon: Route, title: 'Mi camino', text: 'Hitos y logros', tone: 'peach' },
] as const

interface Step {
  icon: LucideIcon
  tone: 'danger' | 'primary' | 'calm' | 'done'
  eyebrow: string
  title: string
  text: string
  to?: string
  cta?: string
}

const DAY_MS = 24 * 60 * 60 * 1000

export function Inicio() {
  const { patient, patientId, plan, responses, reminders, checkIns, careLogs, messages, questions, checkIn } = usePatient()
  const navigate = useNavigate()
  const [party, setParty] = useState(0)

  const level = currentLevel(responses, patientId)
  const survey = surveyStatus(responses, patientId)
  const today = toDayKey(new Date())
  const todayMood = checkIns.find((c) => c.patientId === patientId && c.date === today)?.mood
  const careDone = careLogs.find((l) => l.patientId === patientId && l.date === today)?.done.filter((c) => plan.cares.includes(c)).length ?? 0
  const days = daysSince(plan.procedureDate)
  const upcoming = reminders
    .filter((r) => r.patientId === patientId && r.date >= today)
    .sort((a, b) => (a.date + (a.time ?? '')).localeCompare(b.date + (b.time ?? '')))
    .slice(0, 3)

  const streak = checkInStreak(checkIns.filter((c) => c.patientId === patientId).map((c) => c.date))
  const controlIn = Math.ceil((new Date(plan.nextControl).getTime() - Date.now()) / DAY_MS)
  const unreadFrom = staff.find((m) =>
    messages.some((x) => x.patientId === patientId && x.staffId === m.id && x.from === 'medico' && !x.read),
  )
  const pendingQuestions = questions.filter((q) => q.patientId === patientId && !q.answered).length

  // «Tu siguiente paso»: una sola acción, la más importante para hoy.
  const step: Step =
    level === 'rojo'
      ? { icon: AlertTriangle, tone: 'danger', eyebrow: 'Importante', title: 'Tu semáforo está en rojo', text: 'Revisa qué hacer ahora. Si tienes sangrado abundante, fiebre o dolor intenso, acude a urgencias.', to: '/paciente/semaforo', cta: 'Ver qué hacer' }
      : unreadFrom
        ? { icon: MessageCircle, tone: 'primary', eyebrow: 'Nuevo mensaje', title: `${unreadFrom.name} te respondió`, text: 'Lee la respuesta de tu equipo de salud.', to: `/paciente/chat/${unreadFrom.id}`, cta: 'Leer mensaje' }
        : survey.available
          ? { icon: ClipboardList, tone: 'primary', eyebrow: 'Esta semana', title: 'Responde tu encuesta', text: 'Son 5 minutos. Así actualizamos tu semáforo y tu médica sigue tu evolución.', to: '/paciente/encuesta', cta: 'Responder ahora' }
          : controlIn >= 0 && controlIn <= 7
            ? { icon: CalendarClock, tone: 'calm', eyebrow: 'Se acerca tu control', title: controlIn === 0 ? 'Tu control es hoy' : `Tu control es en ${controlIn} ${controlIn === 1 ? 'día' : 'días'}`, text: pendingQuestions ? `Tienes ${pendingQuestions} ${pendingQuestions === 1 ? 'pregunta anotada' : 'preguntas anotadas'}. Llévalas junto a tu resumen.` : 'Anota tus dudas para no olvidarlas en la consulta.', to: '/paciente/preguntas', cta: 'Preparar mi control' }
            : careDone < plan.cares.length
              ? { icon: HeartPulse, tone: 'calm', eyebrow: 'Cuidados de hoy', title: `Te ${plan.cares.length - careDone === 1 ? 'falta 1 cuidado' : `faltan ${plan.cares.length - careDone} cuidados`}`, text: 'Márcalos a medida que los cumples. ¡Cada uno suma a tu recuperación!', to: '/paciente/plan', cta: 'Ver mis cuidados' }
              : { icon: Sparkles, tone: 'done', eyebrow: '¡Todo al día! 🌸', title: affirmations[new Date().getDate() % affirmations.length], text: 'Completaste lo de hoy. Descansa y date un respiro.', to: '/paciente/calma', cta: 'Ir al Rincón de calma' }
  const StepIcon = step.icon

  const hour = new Date().getHours()
  const hello = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="page page--home stagger">
      {party > 0 && <Celebrate key={party} />}

      <header className="hero">
        <div className="hero__top">
          <div>
            <p className="hero__eyebrow">{hello}</p>
            <h1>{patient.name.split(' ')[0]} 🌷</h1>
            <p className="hero__sub">Semana {recoveryWeek(plan)} de tu recuperación</p>
          </div>
          <div className="hero__actions">
            <SwitchProfileButton />
            <button className="icon-btn icon-btn--glass" onClick={() => navigate('/paciente/ajustes')} aria-label="Ajustes">
              <Settings size={20} />
            </button>
          </div>
        </div>
        {streak >= 2 && (
          <p className="hero__streak pop-in">
            <Flame size={15} /> Registraste cómo te sientes {streak} días seguidos. ¡Sigue así!
          </p>
        )}
        <div className="hero__progress">
          <ProgressRing value={days / RECOVERY_DAYS}>
            <strong>{Math.min(days, RECOVERY_DAYS)}</strong>
            <small>días</small>
          </ProgressRing>
          <div>
            <strong>{HERO_MESSAGE[level]}</strong>
            <ReadAloud
              label="Escuchar mi día"
              text={`${hello}, ${patient.name.split(' ')[0]}. Estás en la semana ${recoveryWeek(plan)} de tu recuperación. Tu semáforo está en ${LEVEL_INFO[level].title}: ${LEVEL_INFO[level].message} ${survey.available ? 'Tienes la encuesta semanal disponible.' : ''} Llevas ${careDone} de ${plan.cares.length} cuidados de hoy. ${upcoming.length ? `Próximo recordatorio: ${upcoming[0].title}.` : ''} Tu próximo control es el ${formatShortDate(plan.nextControl)}.`}
            />
            <p>{days === 0 ? 'Hoy comienza tu recuperación' : `Llevas ${days} ${days === 1 ? 'día' : 'días'} de recuperación`}. {controlIn > 0 ? `Tu control es en ${controlIn} ${controlIn === 1 ? 'día' : 'días'} (${formatShortDate(plan.nextControl)}).` : `Próximo control: ${formatShortDate(plan.nextControl)}.`}</p>
          </div>
        </div>
      </header>

      <button
        className={`next-step next-step--${step.tone}`}
        onClick={() => {
          haptic()
          if (step.to) navigate(step.to)
        }}
      >
        <span className="next-step__icon"><StepIcon size={24} /></span>
        <span className="next-step__body">
          <small>Tu siguiente paso · {step.eyebrow}</small>
          <strong>{step.title}</strong>
          <span>{step.text}</span>
        </span>
        {step.cta && (
          <span className="next-step__cta">
            <span>{step.cta}</span> <ChevronRight size={18} />
          </span>
        )}
      </button>

      <Card className="checkin home-half">
        <p className="form__label">¿Cómo te sientes hoy?</p>
        <MoodPicker
          value={todayMood}
          onPick={(m) => {
            checkIn(patientId, today, m)
            if (m >= 4) setParty((n) => n + 1)
          }}
        />
        {todayMood && <p className="checkin__reply pop-in">{MOODS[todayMood - 1].reply}</p>}
        {todayMood && todayMood <= 2 && (
          <button className="btn btn--ghost btn--block" onClick={() => navigate('/paciente/calma')}>Ir al Rincón de calma</button>
        )}
      </Card>

      <Card className={`home-card home-half level-bg--${level}`} onClick={() => navigate('/paciente/semaforo')}>
        <div>
          <small>Mi semáforo</small>
          <strong className={`level-text--${level}`}>{LEVEL_INFO[level].title}</strong>
          <span>{LEVEL_INFO[level].message}</span>
        </div>
        <LevelFace level={level} size={56} />
      </Card>

      {survey.last && !survey.available && survey.last.answers.animo === HIGH_WORRY && <SupportCard />}

      <div className="duo home-half">
        <Card className="mini-card" onClick={() => navigate('/paciente/encuesta')}>
          {survey.available ? <ClipboardList size={26} className="accent" /> : <ClipboardCheck size={26} className="level-text--verde" />}
          <small>Encuesta semanal</small>
          <strong className={survey.available ? 'accent' : ''}>{survey.available ? '¡Disponible!' : 'Respondida'}</strong>
          {!survey.available && <span className="muted">Próxima: {formatShortDate(survey.next!.toISOString())}</span>}
        </Card>
        <Card className="mini-card" onClick={() => navigate('/paciente/plan')}>
          <ProgressRing value={plan.cares.length ? careDone / plan.cares.length : 0} size={44} stroke={6}>
            <small>{careDone}/{plan.cares.length}</small>
          </ProgressRing>
          <small>Cuidados de hoy</small>
          <strong>{careDone === plan.cares.length ? '¡Completos! 🌸' : 'Márcalos aquí'}</strong>
        </Card>
      </div>

      <Card className="home-card home-half" onClick={() => navigate('/paciente/calendario')}>
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
        <span className="home-card__icon"><Bell size={32} /></span>
      </Card>

      <SectionTitle>Para ti</SectionTitle>
      <div className="explore">
        {EXPLORE.map(({ to, icon: Icon, title, text, tone }) => (
          <button key={to} className={`explore__item explore__item--${tone}`} onClick={() => navigate(to)}>
            <Icon size={26} />
            <strong>{title}</strong>
            <small>{text}</small>
          </button>
        ))}
      </div>

      <p className="trust">
        <ShieldCheck size={16} /> Información validada por tu equipo médico
      </p>
    </div>
  )
}

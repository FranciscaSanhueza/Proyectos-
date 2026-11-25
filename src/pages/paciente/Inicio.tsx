import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AlarmClock, AlertTriangle, Bell, LineChart, Pill, Check, BookOpen, CalendarClock, ChevronRight, ClipboardList, Flame, Flower2, HeartPulse, MessageCircle, MessageCircleQuestion, Route, Settings, ShieldCheck, Sparkles, type LucideIcon } from 'lucide-react'
import { Card, SectionTitle, SwitchProfileButton } from '../../components/ui'
import { LevelFace } from '../../components/LevelFace'
import { KIND_LABEL } from '../../components/CalendarMonth'
import { SupportCard } from '../../components/Support'
import { ProgressRing } from '../../components/ProgressRing'
import { Celebrate } from '../../components/Celebrate'
import { StoriesBar, StoryViewer } from '../../components/Stories'
import { SymptomSearch } from '../../components/SymptomSearch'
import { DayCard } from '../../components/DayCard'
import { DayRings } from '../../components/DayRings'
import { useDailyStories } from './useStories'
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
  { to: '/paciente/evolucion', icon: LineChart, title: 'Mi evolución', text: 'Gráfico y calendario', tone: 'sky' },
  { to: '/paciente/camino', icon: Route, title: 'Mi camino', text: 'Avance, cuerpo y medallas', tone: 'peach' },
  { to: '/paciente/plan#medicamentos', icon: Pill, title: 'Medicamentos', text: 'Marca cada dosis', tone: 'mint' },
  { to: '/paciente/calma', icon: Flower2, title: 'Rincón de calma', text: 'Respira y relájate', tone: 'pink' },
  { to: '/paciente/aprende', icon: BookOpen, title: 'Aprende', text: 'Juego mito o verdad', tone: 'lilac' },
  { to: '/paciente/preguntas', icon: MessageCircleQuestion, title: 'Mis preguntas', text: 'Para tu control', tone: 'lemon' },
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
  const { patient, patientId, plan, responses, reminders, checkIns, careLogs, messages, questions, symptomLogs, diary, prefs, setPrefs, markNotified, toggleReminderDone, snoozeReminder } = usePatient()
  const stories = useDailyStories()
  const [storyAt, setStoryAt] = useState<number | null>(null)
  const navigate = useNavigate()
  const { hash } = useLocation()
  const [party, setParty] = useState(0)
  // «Registrar mi día» desde otras pantallas: baja directo a la tarjeta.
  useEffect(() => {
    if (hash === '#mi-dia') setTimeout(() => document.getElementById('mi-dia')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
  }, [hash])

  const level = currentLevel(responses, patientId, symptomLogs, diary)
  const survey = surveyStatus(responses, patientId)
  const today = toDayKey(new Date())
  const seenKey = (id: string) => `story-${id}-${today}`
  const seen = stories.filter((st) => prefs.notified.includes(seenKey(st.id))).map((st) => st.id)
  const todayMood = checkIns.find((c) => c.patientId === patientId && c.date === today)?.mood
  const todayEntry = diary.find((e) => e.patientId === patientId && e.date === today)
  const dayDone = [todayMood, todayEntry?.pain, todayEntry?.bleeding, todayEntry?.temp].filter((v) => v !== undefined).length
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
            : dayDone < 4
              ? { icon: HeartPulse, tone: 'calm', eyebrow: 'Mi día', title: dayDone === 0 ? 'Registra cómo estás hoy' : 'Termina tu registro de hoy', text: 'Ánimo, dolor, sangrado y temperatura: un toque cada uno, menos de 10 segundos.', to: '#mi-dia', cta: 'Registrar' }
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

      <StoriesBar stories={stories} seen={seen} onOpen={setStoryAt} />
      {storyAt !== null && (
        <StoryViewer
          stories={stories}
          start={storyAt}
          onClose={() => setStoryAt(null)}
          onSeen={(id) => !prefs.notified.includes(seenKey(id)) && markNotified([seenKey(id)])}
        />
      )}

      <button
        className={`next-step next-step--${step.tone}`}
        onClick={() => {
          haptic()
          if (step.to?.startsWith('#')) document.getElementById(step.to.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          else if (step.to) navigate(step.to)
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

      <SymptomSearch />

      <DayCard patientId={patientId} onMood={(m) => m >= 4 && setParty((n) => n + 1)} />

      <Card className={`home-card home-half level-bg--${level}`} onClick={() => navigate('/paciente/semaforo')}>
        <div>
          <small>Mi semáforo</small>
          <strong className={`level-text--${level}`}>{LEVEL_INFO[level].title}</strong>
          <span>{LEVEL_INFO[level].message}</span>
        </div>
        <LevelFace level={level} size={56} />
      </Card>

      {survey.last && !survey.available && survey.last.answers.animo === HIGH_WORRY && <SupportCard />}

      <DayRings
        onComplete={() => setParty((n) => n + 1)}
        rings={[
          { key: 'dia', label: 'Mi día', detail: dayDone === 4 ? 'Registrado hoy' : `${dayDone} de 4 datos · toca para registrar`, value: dayDone / 4, color: '#ec5f9b', onClick: () => document.getElementById('mi-dia')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) },
          { key: 'cuidados', label: 'Cuidados de hoy', detail: `${careDone} de ${plan.cares.length} marcados · toca para verlos`, value: plan.cares.length ? careDone / plan.cares.length : 1, color: '#9a5fd0', onClick: () => navigate('/paciente/plan') },
          { key: 'encuesta', label: 'Encuesta de la semana', detail: survey.available ? 'Disponible · 5 min' : `Lista ✓ · la próxima es el ${formatShortDate(survey.next!.toISOString())}`, value: survey.available ? 0 : 1, color: '#23a6a0', onClick: () => navigate('/paciente/encuesta') },
        ]}
      />

      <div className="card reminders-card home-half">
        <div className="reminders-card__head">
          <p className="form__label"><Bell size={18} className="accent" /> Recordatorios</p>
          <button className="link-btn" onClick={() => navigate('/paciente/calendario')}>Ver calendario</button>
        </div>
        {upcoming.length === 0 && <span className="muted">No tienes recordatorios próximos.</span>}
        <ul className="rem-list">
          {upcoming.map((r) => (
            <li key={r.id} className={`rem-item${r.done ? ' is-done' : ''}`}>
              <i className={`dot kind--${r.kind}`} />
              <span className="grow">
                <b>{r.date === today ? 'Hoy' : formatShortDate(r.date + 'T12:00')}</b>
                {r.time && ` · ${r.time}`} — {r.title}
                <em> ({KIND_LABEL[r.kind]})</em>
              </span>
              {r.date === today && (
                <span className="rem-item__actions">
                  <button className={`rem-btn${r.done ? ' is-on' : ''}`} onClick={() => { haptic(); toggleReminderDone(r.id) }} aria-pressed={!!r.done}>
                    <Check size={15} /> Hecho
                  </button>
                  {!r.done && (
                    <button className="rem-btn" onClick={() => { haptic(); snoozeReminder(r.id) }} title="Posponer 1 hora">
                      <AlarmClock size={15} /> 1 h
                    </button>
                  )}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

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

      <button className="simple-invite" onClick={() => setPrefs({ simpleMode: true })}>
        ¿Prefieres una vista más simple? <b>Activa el modo simple</b> con 3 botones grandes.
      </button>

      <p className="trust">
        <ShieldCheck size={16} /> Información validada por tu equipo médico
      </p>
    </div>
  )
}

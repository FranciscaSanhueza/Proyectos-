import { useNavigate } from 'react-router-dom'
import { BarChart3, BellRing, Check, ChevronRight, ClipboardCheck, ClipboardList, MessageCircle, Moon, ShieldAlert, Sun, UserPlus, Users } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { currentDoctor } from '../../data/mock'
import { SwitchProfileButton } from '../../components/ui'
import { LevelFace } from '../../components/LevelFace'
import type { Level } from '../../types'
import { LEVEL_INFO, currentLevel, formatDateTime, surveyStatus } from '../../utils'

export function Panel() {
  const { patients, responses, messages, plans, alerts, reviewAlert, prefs, setPrefs } = useApp()
  const navigate = useNavigate()

  const active = patients.filter((p) => p.status === 'activa')
  const levelOf = (id: string) => currentLevel(responses, id)
  const count = (l: Level) => active.filter((p) => levelOf(p.id) === l).length
  const nameOf = (id: string) => patients.find((p) => p.id === id)?.name ?? ''

  const newAlerts = alerts
    .filter((a) => !a.reviewed)
    .sort((a, b) => (a.level === b.level ? b.at.localeCompare(a.at) : a.level === 'rojo' ? -1 : 1))
  const unread = messages.filter((m) => m.staffId === currentDoctor.id && m.from === 'paciente' && !m.read).length
  const toValidate = active.filter((p) => !plans.find((x) => x.patientId === p.id)?.validated)
  const surveyDue = active.filter((p) => surveyStatus(responses, p.id).available)

  // Tareas del día, cada una con el botón que la resuelve.
  const tasks = [
    { icon: MessageCircle, n: unread, label: unread === 1 ? 'duda sin responder' : 'dudas sin responder', hint: 'Pacientes esperando tu respuesta en el chat', cta: 'Responder', to: '/medico/mensajes' },
    { icon: ShieldAlert, n: toValidate.length, label: toValidate.length === 1 ? 'plan por validar' : 'planes por validar', hint: 'La paciente lo verá cuando lo valides', cta: 'Validar', to: '/medico/pacientes?filtro=validar' },
    { icon: ClipboardCheck, n: surveyDue.length, label: surveyDue.length === 1 ? 'encuesta sin responder' : 'encuestas sin responder', hint: 'Pacientes que aún no responden esta semana', cta: 'Ver quiénes', to: '/medico/pacientes?filtro=encuesta' },
  ]
  const pending = newAlerts.length + tasks.reduce((n, t) => n + t.n, 0)

  const shortcuts = [
    { icon: Users, title: 'Mis pacientes', text: 'Lista, búsqueda y perfiles', to: '/medico/pacientes' },
    { icon: UserPlus, title: 'Nueva paciente', text: 'Crear ficha y código de la app', to: '/medico/pacientes/nueva' },
    { icon: MessageCircle, title: 'Dudas', text: 'Todas las conversaciones', to: '/medico/mensajes' },
    { icon: BarChart3, title: 'Métricas', text: 'Indicadores del seguimiento', to: '/medico/metricas' },
  ]

  const hour = new Date().getHours()
  const hello = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="page">
      <header className="hero hero--doctor">
        <div className="hero__top">
          <div>
            <p className="hero__eyebrow">{hello}</p>
            <h1>{currentDoctor.name}</h1>
            <p className="hero__sub">{currentDoctor.role} · {active.length} {active.length === 1 ? 'paciente' : 'pacientes'} en seguimiento</p>
          </div>
          <div className="hero__actions">
            <SwitchProfileButton />
            <button
              className="icon-btn icon-btn--glass"
              onClick={() => setPrefs({ theme: prefs.theme === 'noche' ? 'lavanda' : 'noche' })}
              aria-label={prefs.theme === 'noche' ? 'Usar modo claro' : 'Usar modo noche'}
              title={prefs.theme === 'noche' ? 'Modo claro' : 'Modo noche'}
            >
              {prefs.theme === 'noche' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
        <p className="hero__hint">Tus pacientes según su semáforo · toca un color para verlas</p>
        <div className="stats">
          {(['rojo', 'amarillo', 'verde'] as Level[]).map((l) => (
            <button key={l} className={`stat level-bg--${l}`} onClick={() => navigate(`/medico/pacientes?filtro=${l}`)}>
              <LevelFace level={l} size={26} />
              <strong>{count(l)}</strong>
              <small>{LEVEL_INFO[l].title} <ChevronRight size={12} /></small>
            </button>
          ))}
        </div>
        <p className="hero__summary">
          {pending === 0 ? '¡Estás al día! No tienes pendientes por ahora ✨' : `Tienes ${pending} ${pending === 1 ? 'pendiente' : 'pendientes'} hoy. Sigue los pasos de abajo en orden.`}
        </p>
      </header>

      <section className="doc-step">
        <h2 className="doc-step__title"><span className="doc-step__num">1</span> Revisa las alertas del semáforo</h2>
        {newAlerts.length === 0 ? (
          <p className="doc-step__empty"><Check size={18} /> Sin alertas nuevas. Las encuestas en amarillo o rojo aparecerán aquí.</p>
        ) : (
          <div className="stack">
            {newAlerts.map((a) => (
              <div key={a.id} className={`card alert-card level-bg--${a.level}`}>
                <div className="alert-card__head">
                  <LevelFace level={a.level} size={40} />
                  <div className="grow">
                    <strong>{nameOf(a.patientId)}</strong>
                    <small>Encuesta en {LEVEL_INFO[a.level].title.toLowerCase()} · {formatDateTime(a.at)}</small>
                  </div>
                  <BellRing size={18} className={`level-text--${a.level}`} />
                </div>
                <div className="alert-card__actions">
                  <button className="btn btn--primary" onClick={() => navigate(`/medico/pacientes/${a.patientId}?tab=encuestas`)}>
                    <ClipboardList size={18} /> Ver encuesta
                  </button>
                  <button className="btn btn--ghost" onClick={() => reviewAlert(a.id)} aria-label="Marcar como revisada">
                    <Check size={18} /> Ya la revisé
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="doc-step">
        <h2 className="doc-step__title"><span className="doc-step__num">2</span> Resuelve las tareas de hoy</h2>
        <div className="stack">
          {tasks.map(({ icon: Icon, n, label, hint, cta, to }) => (
            <button key={label} className={`card task-card${n === 0 ? ' is-done' : ''}`} onClick={() => navigate(to)}>
              <span className="task-card__icon"><Icon size={20} /></span>
              <span className="task-card__text">
                <strong><b>{n}</b> {label}</strong>
                <small>{n === 0 ? 'Todo al día' : hint}</small>
              </span>
              {n === 0 ? (
                <Check size={20} className="level-text--verde" />
              ) : (
                <span className="task-card__cta">{cta} <ChevronRight size={16} /></span>
              )}
            </button>
          ))}
        </div>
      </section>

      <section className="doc-step">
        <h2 className="doc-step__title"><span className="doc-step__num">3</span> Accesos rápidos</h2>
        <div className="shortcuts">
          {shortcuts.map(({ icon: Icon, title, text, to }) => (
            <button key={to} className="shortcut" onClick={() => navigate(to)}>
              <span className="shortcut__icon"><Icon size={22} /></span>
              <strong>{title}</strong>
              <small>{text}</small>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

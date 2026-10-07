import { useNavigate } from 'react-router-dom'
import { BellRing, Check, ClipboardCheck, LogOut, MessageCircle, ShieldAlert, UserPlus, Users } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { currentDoctor } from '../../data/mock'
import { Card, SectionTitle } from '../../components/ui'
import { LevelFace } from '../../components/LevelFace'
import type { Level } from '../../types'
import { LEVEL_INFO, currentLevel, formatDateTime, surveyStatus } from '../../utils'

export function Panel() {
  const { patients, responses, messages, plans, alerts, reviewAlert, logout } = useApp()
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

  const tasks = [
    { icon: ShieldAlert, n: toValidate.length, label: 'planes por validar', to: '/medico/pacientes?filtro=validar' },
    { icon: MessageCircle, n: unread, label: 'dudas sin responder', to: '/medico/mensajes' },
    { icon: ClipboardCheck, n: surveyDue.length, label: 'encuestas pendientes', to: '/medico/pacientes?filtro=encuesta' },
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
            <p className="hero__sub">{currentDoctor.role} · {active.length} pacientes en seguimiento</p>
          </div>
          <button className="icon-btn icon-btn--glass" onClick={() => { logout(); navigate('/') }} aria-label="Cerrar sesión">
            <LogOut size={20} />
          </button>
        </div>
        <div className="stats">
          {(['rojo', 'amarillo', 'verde'] as Level[]).map((l) => (
            <button key={l} className={`stat level-bg--${l}`} onClick={() => navigate(`/medico/pacientes?filtro=${l}`)}>
              <LevelFace level={l} size={26} />
              <strong>{count(l)}</strong>
              <small>{LEVEL_INFO[l].title}</small>
            </button>
          ))}
        </div>
      </header>

      {newAlerts.length > 0 && (
        <>
          <SectionTitle>
            <BellRing size={18} className="accent" /> Alertas de encuestas
          </SectionTitle>
          <div className="stack">
            {newAlerts.map((a) => (
              <div key={a.id} className={`card alert-row level-bg--${a.level}`}>
                <LevelFace level={a.level} size={36} />
                <button className="alert-row__text" onClick={() => navigate(`/medico/pacientes/${a.patientId}?tab=encuestas`)}>
                  <strong>{nameOf(a.patientId)} · {LEVEL_INFO[a.level].title}</strong>
                  <small>{formatDateTime(a.at)} · ver encuesta</small>
                </button>
                <button className="icon-btn" onClick={() => reviewAlert(a.id)} aria-label="Marcar como revisada" title="Marcar como revisada">
                  <Check size={18} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <SectionTitle>Para hoy</SectionTitle>
      <div className="stack">
        {tasks.map(({ icon: Icon, n, label, to }) => (
          <Card key={label} className={`task-row${n === 0 ? ' is-done' : ''}`} onClick={() => navigate(to)}>
            <span className="task-row__icon"><Icon size={20} /></span>
            <span className="grow"><b>{n}</b> {label}</span>
            {n === 0 && <Check size={18} className="level-text--verde" />}
          </Card>
        ))}
      </div>

      <div className="quick-actions">
        <button className="btn btn--primary" onClick={() => navigate('/medico/pacientes')}>
          <Users size={18} /> Ver pacientes
        </button>
        <button className="btn btn--ghost" onClick={() => navigate('/medico/pacientes/nueva')}>
          <UserPlus size={18} /> Nueva paciente
        </button>
      </div>
    </div>
  )
}

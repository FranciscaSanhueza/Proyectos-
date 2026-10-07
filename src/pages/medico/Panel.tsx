import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { currentDoctor, patients } from '../../data/mock'
import { Badge, Card, SectionTitle } from '../../components/ui'
import { LevelFace } from '../../components/LevelFace'
import type { Level } from '../../types'
import { LEVEL_INFO, currentLevel, formatShortDate, latestResponse, recoveryWeek, surveyStatus } from '../../utils'

const RANK: Record<Level, number> = { rojo: 0, amarillo: 1, verde: 2 }

export function Panel() {
  const { responses, messages, plans, logout } = useApp()
  const navigate = useNavigate()

  const rows = patients
    .map((p) => {
      const plan = plans.find((x) => x.patientId === p.id)!
      return {
        p,
        plan,
        level: currentLevel(responses, p.id),
        last: latestResponse(responses, p.id),
        surveyDue: surveyStatus(responses, p.id).available,
        unread: messages.filter((m) => m.patientId === p.id && m.staffId === currentDoctor.id && m.from === 'paciente' && !m.read).length,
      }
    })
    .sort((a, b) => RANK[a.level] - RANK[b.level])

  const count = (l: Level) => rows.filter((r) => r.level === l).length
  const pendingPlans = rows.filter((r) => !r.plan.validated).length

  return (
    <div className="page">
      <header className="greeting">
        <div>
          <p className="greeting__hello">Panel de seguimiento</p>
          <h1>{currentDoctor.name}</h1>
          <p className="muted">{currentDoctor.role}</p>
        </div>
        <button className="icon-btn" onClick={() => { logout(); navigate('/') }} aria-label="Cerrar sesión">
          <LogOut size={20} />
        </button>
      </header>

      <div className="stats">
        {(['rojo', 'amarillo', 'verde'] as Level[]).map((l) => (
          <Card key={l} className={`level-bg--${l}`}>
            <LevelFace level={l} size={28} />
            <strong>{count(l)}</strong>
            <small>{LEVEL_INFO[l].title}</small>
          </Card>
        ))}
      </div>

      {pendingPlans > 0 && (
        <p className="notice">{pendingPlans} plan(es) de recuperación pendiente(s) de validar.</p>
      )}

      <SectionTitle>Pacientes en seguimiento</SectionTitle>
      <div className="stack">
        {rows.map(({ p, plan, level, last, surveyDue, unread }) => (
          <Card key={p.id} className={`list-row level-border--${level}`} onClick={() => navigate(`/medico/pacientes/${p.id}`)}>
            <LevelFace level={level} size={40} />
            <div className="list-row__text">
              <strong>{p.name}</strong>
              <small>{plan.procedure} · semana {recoveryWeek(plan)}</small>
              <small>{last ? `Última encuesta: ${formatShortDate(last.at)}` : 'Sin encuestas'}{surveyDue ? ' · pendiente' : ''}</small>
            </div>
            <div className="list-row__end">
              {!plan.validated && <Badge tone="warning">Validar plan</Badge>}
              {unread > 0 && <Badge tone="primary">{unread} msj</Badge>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

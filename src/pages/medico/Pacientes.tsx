import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Flag, Search, UserPlus } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { currentDoctor } from '../../data/mock'
import { Avatar, Badge, Card, Empty, PageHeader } from '../../components/ui'
import { LevelFace } from '../../components/LevelFace'
import type { Level } from '../../types'
import { currentLevel, formatShortDate, latestResponse, recoveryWeek, surveyStatus } from '../../utils'

const FILTERS = [
  { id: 'todas', label: 'Todas' },
  { id: 'rojo', label: 'Rojo' },
  { id: 'amarillo', label: 'Amarillo' },
  { id: 'verde', label: 'Verde' },
  { id: 'prioridad', label: 'Prioridad alta' },
  { id: 'validar', label: 'Plan por validar' },
  { id: 'encuesta', label: 'Encuesta pendiente' },
  { id: 'alta', label: 'Dadas de alta' },
] as const
type Filter = (typeof FILTERS)[number]['id']

const SORTS = { semaforo: 'Semáforo', nombre: 'Nombre', semana: 'Semana de recuperación' } as const
type Sort = keyof typeof SORTS
const RANK: Record<Level, number> = { rojo: 0, amarillo: 1, verde: 2 }

export function Pacientes() {
  const { patients, plans, responses, messages } = useApp()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<Sort>('semaforo')
  const filter = (params.get('filtro') as Filter) ?? 'todas'

  const rows = patients.map((p) => {
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

  const term = q.trim().toLowerCase()
  const list = rows
    .filter(({ p }) => (filter === 'alta' ? p.status === 'alta' : p.status === 'activa'))
    .filter((r) => {
      switch (filter) {
        case 'rojo':
        case 'amarillo':
        case 'verde':
          return r.level === filter
        case 'prioridad':
          return r.p.priority === 'alta'
        case 'validar':
          return !r.plan.validated
        case 'encuesta':
          return r.surveyDue
        default:
          return true
      }
    })
    .filter(({ p, plan }) =>
      !term ||
      [p.name, p.rut, plan.procedure, plan.diagnosis, ...p.tags].some((x) => x.toLowerCase().includes(term)),
    )
    .sort((a, b) => {
      if (sort === 'nombre') return a.p.name.localeCompare(b.p.name)
      if (sort === 'semana') return recoveryWeek(a.plan) - recoveryWeek(b.plan)
      return RANK[a.level] - RANK[b.level] || (a.p.priority === 'alta' ? -1 : 1)
    })

  return (
    <div className="page">
      <PageHeader
        title="Mis pacientes"
        subtitle={`${patients.filter((p) => p.status === 'activa').length} en seguimiento`}
        action={
          <button className="icon-btn icon-btn--primary" onClick={() => navigate('/medico/pacientes/nueva')} aria-label="Nueva paciente">
            <UserPlus size={20} />
          </button>
        }
      />

      <label className="search">
        <Search size={18} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre, RUT, diagnóstico o etiqueta…" />
      </label>

      <div className="chips-scroll" role="tablist" aria-label="Filtros">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={filter === f.id}
            className={`chip${filter === f.id ? ' is-active' : ''}`}
            onClick={() => setParams(f.id === 'todas' ? {} : { filtro: f.id }, { replace: true })}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="row list-tools">
        <span className="muted">{list.length} resultado{list.length === 1 ? '' : 's'}</span>
        <select className="select-sm" value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Ordenar por">
          {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>Ordenar: {v}</option>)}
        </select>
      </div>

      {list.length === 0 && <Empty>No hay pacientes con este filtro.</Empty>}
      <div className="stack">
        {list.map(({ p, plan, level, last, surveyDue, unread }) => (
          <Card key={p.id} className={`patient-card level-border--${level}`} onClick={() => navigate(`/medico/pacientes/${p.id}`)}>
            <div className="patient-card__avatar">
              <Avatar name={p.name} size={46} />
              <span className="patient-card__face"><LevelFace level={level} size={20} /></span>
            </div>
            <div className="list-row__text">
              <strong>
                {p.name} {p.priority === 'alta' && <Flag size={14} className="level-text--rojo" aria-label="Prioridad alta" />}
              </strong>
              <small>{plan.procedure} · semana {recoveryWeek(plan)}</small>
              <small>{last ? `Última encuesta: ${formatShortDate(last.at)}` : 'Sin encuestas'}{surveyDue ? ' · pendiente' : ''}</small>
              {p.tags.length > 0 && (
                <span className="tag-list">
                  {p.tags.map((t) => <span key={t} className="tag">{t}</span>)}
                </span>
              )}
            </div>
            <div className="list-row__end">
              {!plan.validated && <Badge tone="warning">Validar</Badge>}
              {unread > 0 && <Badge tone="primary">{unread} msj</Badge>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

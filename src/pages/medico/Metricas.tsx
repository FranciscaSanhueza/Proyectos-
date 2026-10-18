import { useNavigate } from 'react-router-dom'
import { BellRing, ClipboardCheck, Download, HeartPulse, Info, MessageCircle, ShieldCheck, Smile } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { currentDoctor } from '../../data/mock'
import { Card, PageHeader, SectionTitle } from '../../components/ui'
import { LevelFace } from '../../components/LevelFace'
import type { Level } from '../../types'
import { LEVEL_INFO, currentLevel, toDayKey } from '../../utils'

const DAY = 24 * 60 * 60 * 1000
const HOUR = 60 * 60 * 1000

const pct = (n: number, total: number) => (total ? Math.round((n / total) * 100) : 0)
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null)
const hours = (ms: number | null) => (ms === null ? '—' : ms < HOUR ? `${Math.max(1, Math.round(ms / 60000))} min` : `${(ms / HOUR).toFixed(1)} h`)

/** Indicadores para la institución: adherencia, alertas y tiempos de respuesta. */
export function Metricas() {
  const { patients, responses, messages, plans, alerts, careLogs, checkIns, symptomLogs } = useApp()
  const navigate = useNavigate()
  const now = Date.now()

  const active = patients.filter((p) => p.status === 'activa')
  const activeIds = new Set(active.map((p) => p.id))

  // Adherencia a la encuesta semanal: respondió en los últimos 7 días.
  const answeredWeek = active.filter((p) => responses.some((r) => r.patientId === p.id && now - +new Date(r.at) < 7 * DAY))
  const adherence = pct(answeredWeek.length, active.length)

  // Encuestas recibidas por semana (últimas 4).
  const weeks = [3, 2, 1, 0].map((w) => {
    const from = now - (w + 1) * 7 * DAY
    const to = now - w * 7 * DAY
    const n = responses.filter((r) => activeIds.has(r.patientId) && +new Date(r.at) >= from && +new Date(r.at) < to).length
    return { label: w === 0 ? 'Esta' : `-${w}`, n }
  })
  const maxWeek = Math.max(1, ...weeks.map((w) => w.n))

  // Alertas del semáforo y tiempo hasta que el equipo las revisa.
  const recentAlerts = alerts.filter((a) => now - +new Date(a.at) < 30 * DAY)
  const reviewed = recentAlerts.filter((a) => a.reviewed)
  const reviewTime = avg(reviewed.filter((a) => a.reviewedAt).map((a) => +new Date(a.reviewedAt!) - +new Date(a.at)))

  // Dudas del chat: tiempo hasta la primera respuesta del equipo.
  const patientMsgs = messages.filter((m) => m.from === 'paciente' && activeIds.has(m.patientId))
  const answerDelays: number[] = []
  let unanswered = 0
  patientMsgs.forEach((m) => {
    const reply = messages
      .filter((x) => x.patientId === m.patientId && x.staffId === m.staffId && x.from === 'medico' && x.at > m.at)
      .sort((a, b) => a.at.localeCompare(b.at))[0]
    if (reply) answerDelays.push(+new Date(reply.at) - +new Date(m.at))
    else unanswered++
  })
  const answerTime = avg(answerDelays)

  // Cumplimiento de cuidados en los últimos 7 días.
  const last7 = Array.from({ length: 7 }, (_, i) => toDayKey(new Date(now - (i + 1) * DAY)))
  const careRates: number[] = []
  active.forEach((p) => {
    const cares = plans.find((x) => x.patientId === p.id)?.cares ?? []
    if (!cares.length) return
    last7.forEach((d) => {
      const done = careLogs.find((l) => l.patientId === p.id && l.date === d)?.done.filter((c) => cares.includes(c)).length ?? 0
      careRates.push(done / cares.length)
    })
  })
  const careRate = Math.round((avg(careRates) ?? 0) * 100)

  const moods = checkIns.filter((c) => activeIds.has(c.patientId) && last7.includes(c.date)).map((c) => c.mood)
  const mood = avg(moods)

  const validated = active.filter((p) => plans.find((x) => x.patientId === p.id)?.validated).length
  const levels: Level[] = ['rojo', 'amarillo', 'verde']
  const byLevel = (l: Level) => active.filter((p) => currentLevel(responses, p.id, symptomLogs) === l).length

  const kpis = [
    { icon: ClipboardCheck, value: `${adherence}%`, label: 'Adherencia a la encuesta semanal', goal: 'Meta ≥ 80%', ok: adherence >= 80 },
    { icon: BellRing, value: hours(reviewTime), label: 'Tiempo medio en revisar alertas', goal: 'Meta < 24 h', ok: reviewTime !== null && reviewTime < 24 * HOUR },
    { icon: MessageCircle, value: hours(answerTime), label: 'Tiempo medio de respuesta a dudas', goal: unanswered ? `${unanswered} sin responder` : 'Meta < 24 h', ok: answerTime !== null && answerTime < 24 * HOUR && unanswered === 0 },
    { icon: HeartPulse, value: `${careRate}%`, label: 'Cuidados diarios cumplidos (7 días)', goal: 'Meta ≥ 70%', ok: careRate >= 70 },
    { icon: Smile, value: mood === null ? '—' : `${mood.toFixed(1)}/5`, label: 'Ánimo promedio (7 días)', goal: `${moods.length} registros`, ok: mood !== null && mood >= 3 },
    { icon: ShieldCheck, value: `${validated}/${active.length}`, label: 'Planes validados por el equipo', goal: 'Meta: todos', ok: validated === active.length },
  ]

  const exportCsv = () => {
    const rows = [
      ['Indicador', 'Valor', 'Referencia'],
      ...kpis.map((k) => [k.label, k.value, k.goal]),
      ['Pacientes en seguimiento', String(active.length), ''],
      ...levels.map((l) => [`Semáforo ${LEVEL_INFO[l].title}`, String(byLevel(l)), '']),
      ['Alertas últimos 30 días', String(recentAlerts.length), `${reviewed.length} revisadas`],
      ...weeks.map((w) => [`Encuestas semana ${w.label}`, String(w.n), '']),
    ]
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(';')).join('\n')
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `cervix-b-indicadores-${toDayKey(new Date())}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page metrics">
      <PageHeader
        title="Métricas"
        subtitle={`Indicadores del seguimiento · ${currentDoctor.name}`}
        action={
          <button className="icon-btn icon-btn--primary" onClick={exportCsv} aria-label="Descargar indicadores (CSV)" title="Descargar CSV">
            <Download size={18} />
          </button>
        }
      />

      <p className="metrics__note">
        <Info size={16} /> Datos de demostración calculados en este dispositivo. Con un servidor real, la institución vería aquí a todas sus pacientes.
      </p>

      <div className="kpis">
        {kpis.map(({ icon: Icon, value, label, goal, ok }) => (
          <Card key={label} className={`kpi${ok ? ' kpi--ok' : ' kpi--warn'}`}>
            <span className="kpi__icon"><Icon size={20} /></span>
            <strong>{value}</strong>
            <span>{label}</span>
            <small>{ok ? '✓ ' : '• '}{goal}</small>
          </Card>
        ))}
      </div>

      <div className="metrics__grid">
        <Card>
          <SectionTitle>Encuestas recibidas por semana</SectionTitle>
          <div className="bars" role="img" aria-label={weeks.map((w) => `Semana ${w.label}: ${w.n}`).join(', ')}>
            {weeks.map((w) => (
              <div key={w.label} className="bars__col">
                <b>{w.n}</b>
                <span className="bars__bar" style={{ height: `${(w.n / maxWeek) * 100}%` }} />
                <small>{w.label === 'Esta' ? 'Esta sem.' : `Sem ${w.label}`}</small>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle>Semáforo de las pacientes</SectionTitle>
          <div className="level-split">
            {levels.map((l) => (
              <button key={l} className={`level-split__row level-bg--${l}`} onClick={() => navigate(`/medico/pacientes?filtro=${l}`)}>
                <LevelFace level={l} size={28} />
                <span className="grow">{LEVEL_INFO[l].title}</span>
                <b>{byLevel(l)}</b>
                <span className="level-split__track"><span style={{ width: `${pct(byLevel(l), active.length)}%` }} /></span>
              </button>
            ))}
          </div>
          <small className="muted">
            {recentAlerts.length} alertas en los últimos 30 días · {reviewed.length} revisadas ({pct(reviewed.length, recentAlerts.length)}%)
          </small>
        </Card>
      </div>

      <Card className="metrics__value">
        <SectionTitle>¿Qué aporta a la institución?</SectionTitle>
        <ul>
          <li><b>Detección temprana:</b> las encuestas en amarillo o rojo llegan como alerta al panel del equipo.</li>
          <li><b>Menos consultas evitables:</b> las dudas frecuentes se resuelven con el semáforo, la guía y Kitty.</li>
          <li><b>Trazabilidad:</b> cada duda y respuesta queda registrada en un canal oficial, no en mensajería personal.</li>
          <li><b>Gestión:</b> estos indicadores se pueden descargar (CSV) para reportes de calidad.</li>
        </ul>
      </Card>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, Search } from 'lucide-react'
import { LevelFace } from '../../components/LevelFace'
import { EvolutionChart } from '../../components/EvolutionChart'
import { ReadAloud } from '../../components/ReadAloud'
import { YellowNotice } from '../../components/Support'
import { Card, PageHeader, SectionTitle } from '../../components/ui'
import { symptomGuide } from '../../data/mock'
import type { Level } from '../../types'
import { LEVEL_INFO, currentLevel, formatShortDate, latestResponse } from '../../utils'
import { usePatient } from './usePatient'

const LEVELS: Level[] = ['verde', 'amarillo', 'rojo']

export function Semaforo() {
  const { patientId, plan, responses } = usePatient()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const level = currentLevel(responses, patientId)
  const last = latestResponse(responses, patientId)

  const matches = symptomGuide.filter((s) => s.symptom.toLowerCase().includes(q.trim().toLowerCase()))

  return (
    <div className="page">
      <PageHeader
        title="Semáforo"
        subtitle={last ? `Según tu encuesta del ${formatShortDate(last.at)}` : 'Aún no respondes tu primera encuesta'}
      />

      <ReadAloud text={`Tu semáforo está en ${LEVEL_INFO[level].title}. ${LEVEL_INFO[level].message}`} label="Escuchar mi estado" />

      <div className="stack">
        {LEVELS.map((l) => (
          <div key={l} className={`level-card level-bg--${l}${l === level ? ' is-current' : ''}`}>
            <div>
              <strong className={`level-text--${l}`}>{LEVEL_INFO[l].title}</strong>
              <p>{LEVEL_INFO[l].message}</p>
              {l === level && <b className="level-card__now">Tu estado actual</b>}
            </div>
            <LevelFace level={l} size={52} muted={l !== level} />
          </div>
        ))}
      </div>

      {level === 'amarillo' && <YellowNotice />}
      {level === 'rojo' && (
        <a className="btn btn--danger btn--block" href="tel:131">
          <Phone size={18} /> Llamar al SAMU (131)
        </a>
      )}

      <SectionTitle>Mi evolución</SectionTitle>
      <Card>
        <EvolutionChart responses={responses.filter((r) => r.patientId === patientId)} plan={plan} />
      </Card>

      <SectionTitle>¿Tu síntoma es verde, amarillo o rojo?</SectionTitle>
      <label className="search">
        <Search size={18} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ej: sangrado, fiebre, dolor…" />
      </label>
      <div className="stack">
        {matches.map((s) => (
          <div key={s.symptom} className={`guide-row level-border--${s.level}`}>
            <LevelFace level={s.level} size={30} />
            <div>
              <strong>{s.symptom}</strong>
              <small>{s.advice}</small>
            </div>
          </div>
        ))}
        {matches.length === 0 && (
          <p className="empty">
            No encontramos ese síntoma. <button className="link-btn" onClick={() => navigate('/paciente/chat')}>Pregúntale a tu equipo</button>
          </p>
        )}
      </div>
      <p className="trust">Clasificación validada por médicos especialistas.</p>
    </div>
  )
}

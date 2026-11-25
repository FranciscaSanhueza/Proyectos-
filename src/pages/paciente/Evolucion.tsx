import { useNavigate } from 'react-router-dom'
import { PencilLine, TrendingDown, TrendingUp } from 'lucide-react'
import { Card, PageHeader, SectionTitle } from '../../components/ui'
import { DiaryTrend, MonthHeatmap } from '../../components/DiaryCharts'
import { ReadAloud } from '../../components/ReadAloud'
import { diaryLevel, toDayKey } from '../../utils'
import { usePatient } from './usePatient'

const DAY = 24 * 60 * 60 * 1000

/** Mi evolución: cómo va la recuperación día a día (registros de «Mi día»). */
export function Evolucion() {
  const { patientId, diary, checkIns } = usePatient()
  const navigate = useNavigate()
  const mine = diary.filter((e) => e.patientId === patientId)
  const myMoods = checkIns.filter((c) => c.patientId === patientId)

  const lastDays = (from: number, to: number) => {
    const keys = Array.from({ length: to - from }, (_, i) => toDayKey(new Date(Date.now() - (from + i) * DAY)))
    return mine.filter((e) => keys.includes(e.date))
  }
  const week = lastDays(0, 7)
  const prevWeek = lastDays(7, 14)
  const avg = (xs: DiaryEntry[]) => {
    const p = xs.map((e) => e.pain).filter((v): v is number => v !== undefined)
    return p.length ? p.reduce((a, b) => a + b, 0) / p.length : null
  }
  const painNow = avg(week)
  const painBefore = avg(prevWeek)
  const two = lastDays(0, 14)
  const greens = two.filter((e) => diaryLevel(e) === 'verde').length
  const trend = painNow !== null && painBefore !== null ? painNow - painBefore : null

  return (
    <div className="page stagger">
      <PageHeader title="Mi evolución" subtitle="Cómo va tu recuperación, día a día" back />

      <ReadAloud
        label="Escuchar mi resumen"
        text={`Registraste ${two.length} de los últimos 14 días. ${greens} días en verde. ${painNow !== null ? `Tu dolor promedio esta semana es ${painNow.toFixed(1)} de 10.` : ''} ${trend !== null ? (trend < 0 ? 'Va bajando respecto de la semana pasada.' : trend > 0 ? 'Subió respecto de la semana pasada.' : 'Se mantiene igual que la semana pasada.') : ''}`}
      />

      <div className="evo-stats">
        <div className="evo-stat">
          <strong>{two.length}<small>/14</small></strong>
          <span>días registrados</span>
        </div>
        <div className="evo-stat">
          <strong className="level-text--verde">{greens}</strong>
          <span>días en verde</span>
        </div>
        <div className="evo-stat">
          <strong>{painNow === null ? '—' : painNow.toFixed(1)}<small>/10</small></strong>
          <span>
            dolor promedio
            {trend !== null && trend !== 0 && (
              <em className={trend < 0 ? 'evo-good' : 'evo-bad'}>
                {trend < 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />} {trend < 0 ? 'bajando' : 'subiendo'}
              </em>
            )}
          </span>
        </div>
      </div>

      <SectionTitle>Últimos 14 días</SectionTitle>
      <Card>
        <DiaryTrend entries={mine} checkIns={myMoods} />
        <p className="muted small-gap">Toca un día para ver el detalle.</p>
      </Card>

      <SectionTitle>Mi mes en colores</SectionTitle>
      <Card>
        <MonthHeatmap entries={mine} checkIns={myMoods} />
      </Card>

      <button className="btn btn--primary btn--block" onClick={() => navigate('/paciente#mi-dia')}>
        <PencilLine size={18} /> Registrar mi día
      </button>
    </div>
  )
}

type DiaryEntry = ReturnType<typeof usePatient>['diary'][number]

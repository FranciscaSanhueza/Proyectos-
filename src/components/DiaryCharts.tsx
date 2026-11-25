import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { CheckIn, DiaryEntry, Level } from '../types'
import { BLEEDING_LABELS, LEVEL_INFO, TEMP_LABELS, diaryLevel, toDayKey } from '../utils'
import { MOODS } from './MoodPicker'
import { LevelFace } from './LevelFace'

const DAY = 24 * 60 * 60 * 1000
const weekday = new Intl.DateTimeFormat('es-CL', { weekday: 'narrow' })
const longDay = new Intl.DateTimeFormat('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })
const monthFmt = new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' })
const dateOf = (key: string) => new Date(key + 'T12:00')

/** Detalle de un día: lo que se registró y su color. */
function DayDetail({ date, entry, mood }: { date: string; entry?: DiaryEntry; mood?: CheckIn['mood'] }) {
  const level: Level | null = entry ? diaryLevel(entry) : null
  return (
    <div className={`dchart__detail${level ? ` level-bg--${level}` : ''}`} aria-live="polite">
      {level ? <LevelFace level={level} size={34} /> : <span className="dchart__none" aria-hidden="true">·</span>}
      <div>
        <strong>{longDay.format(dateOf(date))}{level && <span className={`level-text--${level}`}> · {LEVEL_INFO[level].title}</span>}</strong>
        {entry || mood ? (
          <span>
            {[
              mood && `Ánimo ${MOODS[mood - 1].emoji} ${MOODS[mood - 1].label.toLowerCase()}`,
              entry?.pain !== undefined && `Dolor ${entry.pain}/10`,
              entry?.bleeding !== undefined && `Sangrado: ${BLEEDING_LABELS[entry.bleeding].toLowerCase()}`,
              entry?.temp !== undefined && `Temperatura: ${TEMP_LABELS[entry.temp].toLowerCase()}`,
            ]
              .filter(Boolean)
              .join(' · ')}
            {entry?.note && <em> «{entry.note}»</em>}
          </span>
        ) : (
          <span>Sin registro este día.</span>
        )}
      </div>
    </div>
  )
}

/**
 * Evolución día a día: color de cada día, dolor (0–10) y sangrado (0–3).
 * Dos gráficos chicos con el mismo eje de días (cada uno con su propia escala).
 */
export function DiaryTrend({
  entries,
  checkIns = [],
  days = 14,
}: {
  entries: DiaryEntry[]
  checkIns?: CheckIn[]
  days?: number
}) {
  const keys = Array.from({ length: days }, (_, i) => toDayKey(new Date(Date.now() - (days - 1 - i) * DAY)))
  const byDay = new Map(entries.map((e) => [e.date, e]))
  const moodByDay = new Map(checkIns.map((c) => [c.date, c.mood]))
  const lastWithData = [...keys].reverse().find((k) => byDay.has(k)) ?? keys[keys.length - 1]
  const [sel, setSel] = useState(lastWithData)

  const W = 340
  const padL = 26
  const step = (W - padL - 6) / days
  const x = (i: number) => padL + step * i + step / 2
  const H1 = 112
  const y1 = (v: number) => 10 + (1 - v / 10) * (H1 - 26)
  const H2 = 70
  const y2 = (v: number) => 6 + (1 - v / 3) * (H2 - 20)

  // Línea de dolor con cortes donde no hay registro.
  const segments: string[] = []
  let cur = ''
  keys.forEach((k, i) => {
    const p = byDay.get(k)?.pain
    if (p === undefined) {
      if (cur) segments.push(cur)
      cur = ''
    } else cur += `${cur ? 'L' : 'M'}${x(i).toFixed(1)} ${y1(p).toFixed(1)}`
  })
  if (cur) segments.push(cur)
  const lastPainIdx = keys.map((k) => byDay.get(k)?.pain).reduce<number>((acc, v, i) => (v !== undefined ? i : acc), -1)

  const select = (k: string) => setSel(k)
  const hit = (H: number) =>
    keys.map((k, i) => (
      <rect
        key={k}
        x={padL + step * i}
        y={0}
        width={step}
        height={H}
        fill="transparent"
        className="dchart__hit"
        onClick={() => select(k)}
        onMouseEnter={() => select(k)}
      />
    ))
  const selIdx = keys.indexOf(sel)

  return (
    <div className="dchart">
      {/* Color de cada día */}
      <div className="dchart__strip" role="listbox" aria-label="Color de cada día">
        {keys.map((k) => {
          const e = byDay.get(k)
          const lv = e ? diaryLevel(e) : null
          return (
            <button
              key={k}
              role="option"
              aria-selected={sel === k}
              aria-label={`${longDay.format(dateOf(k))}: ${lv ? LEVEL_INFO[lv].title : 'sin registro'}`}
              className={`dchart__cell${lv ? ` dchart__cell--${lv}` : ''}${sel === k ? ' is-sel' : ''}`}
              onClick={() => select(k)}
            >
              <i />
              <small>{weekday.format(dateOf(k))}</small>
              <small>{dateOf(k).getDate()}</small>
            </button>
          )
        })}
      </div>

      <p className="dchart__title">Dolor <small>(0 a 10)</small></p>
      <svg className="dchart__svg" viewBox={`0 0 ${W} ${H1}`} role="img" aria-label={`Dolor de los últimos ${days} días`}>
        {[0, 5, 10].map((v) => (
          <g key={v}>
            <line x1={padL} x2={W} y1={y1(v)} y2={y1(v)} className="dchart__grid" />
            <text x={padL - 6} y={y1(v) + 4} className="dchart__axis" textAnchor="end">{v}</text>
          </g>
        ))}
        {selIdx >= 0 && <rect x={padL + step * selIdx} y={0} width={step} height={H1 - 12} className="dchart__selband" rx={6} />}
        {segments.map((d) => <path key={d} d={d} className="dchart__line" />)}
        {keys.map((k, i) => {
          const p = byDay.get(k)?.pain
          return p === undefined ? null : <circle key={k} cx={x(i)} cy={y1(p)} r={k === sel ? 6 : 4} className="dchart__dot" />
        })}
        {lastPainIdx >= 0 && (
          <text x={x(lastPainIdx)} y={y1(byDay.get(keys[lastPainIdx])!.pain!) - 10} className="dchart__label" textAnchor="middle">
            {byDay.get(keys[lastPainIdx])!.pain}
          </text>
        )}
        {hit(H1)}
      </svg>

      <p className="dchart__title">Sangrado <small>(nada → abundante)</small></p>
      <svg className="dchart__svg" viewBox={`0 0 ${W} ${H2}`} role="img" aria-label={`Sangrado de los últimos ${days} días`}>
        <line x1={padL} x2={W} y1={y2(0)} y2={y2(0)} className="dchart__base" />
        <text x={padL - 6} y={y2(3) + 4} className="dchart__axis" textAnchor="end">💧3</text>
        <text x={padL - 6} y={y2(0) + 4} className="dchart__axis" textAnchor="end">0</text>
        {selIdx >= 0 && <rect x={padL + step * selIdx} y={0} width={step} height={H2 - 12} className="dchart__selband" rx={6} />}
        {keys.map((k, i) => {
          const b = byDay.get(k)?.bleeding
          if (b === undefined) return null
          const h = Math.max(3, y2(0) - y2(b))
          const bw = Math.min(14, step - 6)
          return <rect key={k} x={x(i) - bw / 2} y={y2(0) - h} width={bw} height={h} rx={4} className="dchart__bar" />
        })}
        {hit(H2)}
      </svg>

      <DayDetail date={sel} entry={byDay.get(sel)} mood={moodByDay.get(sel)} />

      <details className="dchart__table">
        <summary>Ver como tabla</summary>
        <table>
          <thead>
            <tr><th>Día</th><th>Color</th><th>Dolor</th><th>Sangrado</th><th>Temperatura</th></tr>
          </thead>
          <tbody>
            {[...keys].reverse().map((k) => {
              const e = byDay.get(k)
              return (
                <tr key={k}>
                  <td>{dateOf(k).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}</td>
                  <td>{e ? LEVEL_INFO[diaryLevel(e)].title : '—'}</td>
                  <td>{e?.pain ?? '—'}</td>
                  <td>{e?.bleeding !== undefined ? BLEEDING_LABELS[e.bleeding] : '—'}</td>
                  <td>{e?.temp !== undefined ? TEMP_LABELS[e.temp] : '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </details>
    </div>
  )
}

/** Calendario del mes: cada día pintado según cómo estuvo (como la app Daylio). */
export function MonthHeatmap({ entries, checkIns = [] }: { entries: DiaryEntry[]; checkIns?: CheckIn[] }) {
  const now = new Date()
  const [month, setMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1))
  const [sel, setSel] = useState<string | null>(null)
  const byDay = new Map(entries.map((e) => [e.date, e]))
  const moodByDay = new Map(checkIns.map((c) => [c.date, c.mood]))
  const first = new Date(month)
  const offset = (first.getDay() + 6) % 7 // lunes primero
  const daysIn = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const today = toDayKey(now)
  const counts = { verde: 0, amarillo: 0, rojo: 0 }
  const cells = Array.from({ length: daysIn }, (_, i) => {
    const key = toDayKey(new Date(month.getFullYear(), month.getMonth(), i + 1))
    const e = byDay.get(key)
    const lv = e ? diaryLevel(e) : null
    if (lv) counts[lv]++
    return { key, day: i + 1, lv, mood: moodByDay.get(key) }
  })

  return (
    <div className="heat">
      <div className="heat__head">
        <button className="icon-btn" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Mes anterior"><ChevronLeft size={18} /></button>
        <strong>{monthFmt.format(month).replace(/^./, (c) => c.toUpperCase())}</strong>
        <button className="icon-btn" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Mes siguiente"><ChevronRight size={18} /></button>
      </div>
      <div className="heat__grid">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => <span key={i} className="heat__wd">{d}</span>)}
        {Array.from({ length: offset }, (_, i) => <span key={`e${i}`} />)}
        {cells.map((c) => (
          <button
            key={c.key}
            className={`heat__day${c.lv ? ` heat__day--${c.lv}` : ''}${c.key === today ? ' is-today' : ''}${sel === c.key ? ' is-sel' : ''}`}
            onClick={() => setSel(c.key)}
            aria-label={`${longDay.format(dateOf(c.key))}: ${c.lv ? LEVEL_INFO[c.lv].title : 'sin registro'}`}
            disabled={c.key > today}
          >
            <span>{c.day}</span>
            {c.mood && <small aria-hidden="true">{MOODS[c.mood - 1].emoji}</small>}
          </button>
        ))}
      </div>
      <ul className="heat__legend">
        <li><i className="heat__key heat__key--verde" /> Verde · {counts.verde}</li>
        <li><i className="heat__key heat__key--amarillo" /> Amarillo · {counts.amarillo}</li>
        <li><i className="heat__key heat__key--rojo" /> Rojo · {counts.rojo}</li>
        <li><i className="heat__key" /> Sin registro</li>
      </ul>
      {sel && <DayDetail date={sel} entry={byDay.get(sel)} mood={moodByDay.get(sel)} />}
    </div>
  )
}

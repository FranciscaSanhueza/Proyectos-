import { useLayoutEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'

export interface Milestone {
  day: number
  title: string
  detail: string
}

const PATH = 'M60 24 C 300 40, 300 110, 170 130 S 30 210, 170 240 S 310 330, 170 360 S 40 430, 280 470'

/**
 * Camino ilustrado de la recuperación: hitos repartidos por el camino y una figura
 * que avanza según los días desde el procedimiento.
 */
export function PathMap({ milestones, days }: { milestones: Milestone[]; days: number }) {
  const ref = useRef<SVGPathElement>(null)
  const [pts, setPts] = useState<{ x: number; y: number }[]>([])
  const [me, setMe] = useState({ x: 60, y: 24 })
  const [progressLen, setProgressLen] = useState(0)
  const [total, setTotal] = useState(1)
  const [open, setOpen] = useState<number | null>(null)
  const n = milestones.length

  // Fracción del camino recorrida (los hitos van a igual distancia; entre hitos se interpola por días).
  let k = 0
  while (k < n - 1 && days >= milestones[k + 1].day) k++
  const segFrac = k < n - 1 ? Math.min(1, (days - milestones[k].day) / (milestones[k + 1].day - milestones[k].day)) : 0
  const frac = Math.min(1, (k + segFrac) / (n - 1))
  const current = days >= milestones[n - 1].day ? n - 1 : k

  useLayoutEffect(() => {
    const p = ref.current
    if (!p) return
    const len = p.getTotalLength()
    setTotal(len)
    setPts(milestones.map((_, i) => p.getPointAtLength((len * i) / (n - 1))))
    const pos = p.getPointAtLength(len * frac)
    setMe({ x: pos.x, y: pos.y })
    // Animación: el tramo recorrido se dibuja al entrar.
    requestAnimationFrame(() => setProgressLen(len * frac))
  }, [milestones, n, frac])

  const shown = open ?? current
  return (
    <div className="path">
      <svg viewBox="0 0 340 500" className="path__svg" role="img" aria-label={`Vas en el día ${days} de tu recuperación: ${milestones[current].title}`}>
        <defs>
          <linearGradient id="path-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7a4b94" />
            <stop offset="1" stopColor="#d9609c" />
          </linearGradient>
        </defs>
        {/* Decoración: flores y nubes simples */}
        <g className="path__deco" aria-hidden="true">
          <circle cx="300" cy="200" r="34" />
          <circle cx="40" cy="330" r="26" />
          <circle cx="310" cy="420" r="20" />
          <text x="292" y="92" fontSize="22">🌿</text>
          <text x="20" y="168" fontSize="20">🌼</text>
          <text x="300" y="300" fontSize="20">🌷</text>
          <text x="30" y="470" fontSize="20">🌿</text>
        </g>
        <path ref={ref} d={PATH} className="path__road" />
        <path d={PATH} className="path__road-line" />
        <path d={PATH} className="path__done" stroke="url(#path-grad)" strokeDasharray={`${progressLen} ${total}`} />
        {pts.map((pt, i) => {
          const state = i < current ? 'done' : i === current ? 'now' : 'todo'
          return (
            <g
              key={i}
              className={`path__stop path__stop--${state}${shown === i ? ' is-open' : ''}`}
              transform={`translate(${pt.x} ${pt.y})`}
              onClick={() => setOpen(i)}
              role="button"
              tabIndex={0}
              aria-label={`Día ${milestones[i].day}: ${milestones[i].title}`}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setOpen(i)}
            >
              <circle r="15" />
              {state === 'done' ? <Check x={-8} y={-8} width={16} height={16} strokeWidth={3} /> : <text y="5" textAnchor="middle">{i + 1}</text>}
              <text className="path__day" x={pt.x > 170 ? -22 : 22} y="5" textAnchor={pt.x > 170 ? 'end' : 'start'}>
                {milestones[i].day === 0 ? 'Día 0' : `Día ${milestones[i].day}`}
              </text>
            </g>
          )
        })}
        <g className="path__me" style={{ transform: `translate(${me.x}px, ${me.y - 30}px)` }} aria-hidden="true">
          <circle r="20" />
          <text y="7" textAnchor="middle" fontSize="20">🌷</text>
          <text className="path__me-label" y="-27" textAnchor="middle">Tú · día {days}</text>
        </g>
      </svg>
      <div className="path__card pop-in" key={shown} aria-live="polite">
        <small>{milestones[shown].day === 0 ? 'Día 0' : `Día ${milestones[shown].day}`}{shown === current ? ' · estás aquí' : shown < current ? ' · ya pasaste por aquí ✓' : ''}</small>
        <strong>{milestones[shown].title}</strong>
        <p>{milestones[shown].detail}</p>
      </div>
    </div>
  )
}

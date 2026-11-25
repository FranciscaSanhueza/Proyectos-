import { haptic } from '../utils'
import { playSound } from '../sound'

const LABELS = ['Sin dolor', 'Muy leve', 'Leve', 'Leve', 'Moderado', 'Moderado', 'Fuerte', 'Fuerte', 'Muy fuerte', 'Muy fuerte', 'Insoportable']
const QUICK = [0, 2, 4, 6, 8, 10]

/** Color de 0 (verde) a 10 (rojo). */
export const painColor = (v: number) => `hsl(${Math.round(120 - v * 12)} 68% 46%)`

/** Carita de dolor: sonríe en 0 y se va poniendo triste hasta 10 (con lágrima). */
export function PainFace({ value, size = 56 }: { value: number; size?: number }) {
  const t = value / 10
  const curve = 14 - t * 28 // + sonrisa, − tristeza
  const brow = t * 6
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="pain-face">
      <circle cx="32" cy="32" r="30" fill={painColor(value)} />
      <path d={`M18 ${22 - brow} l9 ${brow}`} stroke="#1f1b2b" strokeWidth="3" strokeLinecap="round" opacity={t > 0.35 ? 1 : 0} />
      <path d={`M46 ${22 - brow} l-9 ${brow}`} stroke="#1f1b2b" strokeWidth="3" strokeLinecap="round" opacity={t > 0.35 ? 1 : 0} />
      <circle cx="23" cy="28" r="3.6" fill="#1f1b2b" />
      <circle cx="41" cy="28" r="3.6" fill="#1f1b2b" />
      <path d={`M20 ${43 - curve / 3} Q32 ${43 + curve} 44 ${43 - curve / 3}`} fill="none" stroke="#1f1b2b" strokeWidth="3.5" strokeLinecap="round" />
      {value >= 9 && <path d="M43 33 q3 6 0 8 q-3 -2 0 -8z" fill="#7fc8ff" />}
    </svg>
  )
}

/** Escala de dolor 0–10: un toque en una carita o deslizar para afinar. */
export function PainScale({ value, onChange }: { value?: number; onChange: (v: number) => void }) {
  const set = (v: number) => {
    haptic(10)
    playSound('tap')
    onChange(v)
  }
  return (
    <div className="pain">
      <div className="pain__faces" role="radiogroup" aria-label="Dolor de 0 a 10">
        {QUICK.map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={value === v}
            aria-label={`${v} de 10: ${LABELS[v]}`}
            className={`pain__face${value !== undefined && Math.abs(value - v) <= 1 ? ' is-near' : ''}${value === v ? ' is-on' : ''}`}
            onClick={() => set(v)}
          >
            <PainFace value={v} size={40} />
            <small>{v}</small>
          </button>
        ))}
      </div>
      <input
        className="pain__slider"
        type="range"
        min={0}
        max={10}
        step={1}
        value={value ?? 0}
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerUp={() => playSound('tap')}
        aria-label="Ajustar dolor de 0 a 10"
        aria-valuetext={value === undefined ? 'Sin registrar' : `${value} de 10: ${LABELS[value]}`}
      />
      <p className="pain__value" aria-live="polite">
        {value === undefined ? 'Toca una carita' : (<><b style={{ color: painColor(value) }}>{value}/10</b> · {LABELS[value]}</>)}
      </p>
    </div>
  )
}

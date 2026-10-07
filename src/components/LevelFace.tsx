import type { Level } from '../types'

const mouth: Record<Level, string> = {
  verde: 'M20 38 Q32 48 44 38',
  amarillo: 'M21 41 H43',
  rojo: 'M20 45 Q32 35 44 45',
}

/** Carita del semáforo (verde / amarillo / rojo), como en el póster. */
export function LevelFace({ level, size = 48, muted = false }: { level: Level; size?: number; muted?: boolean }) {
  return (
    <svg
      className={`face face--${level}${muted ? ' face--muted' : ''}`}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={`Semáforo ${level}`}
    >
      <circle cx="32" cy="32" r="29" />
      <circle cx="23" cy="26" r="3.5" className="face__ink" />
      <circle cx="41" cy="26" r="3.5" className="face__ink" />
      <path d={mouth[level]} className="face__mouth" />
    </svg>
  )
}

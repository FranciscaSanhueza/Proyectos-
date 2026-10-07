import { useEffect, useState } from 'react'

const SHAPES = ['💜', '✨', '🌸', '💗', '⭐']

/**
 * Pequeña lluvia de corazones para celebrar un logro. Se monta con una `key`
 * distinta cada vez que se quiere repetir. Respeta «reducir movimiento».
 */
export function Celebrate({ count = 14 }: { count?: number }) {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 1800)
    return () => clearTimeout(t)
  }, [])
  if (!visible) return null
  return (
    <div className="celebrate" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          style={{
            left: `${5 + Math.random() * 90}%`,
            animationDelay: `${Math.random() * 0.35}s`,
            fontSize: `${16 + Math.random() * 14}px`,
            ['--drift' as string]: `${(Math.random() - 0.5) * 80}px`,
          }}
        >
          {SHAPES[i % SHAPES.length]}
        </span>
      ))}
    </div>
  )
}

import { useRef, useState, type PointerEvent } from 'react'
import { ChevronsRight, Phone } from 'lucide-react'
import { haptic } from '../utils'

/**
 * «Desliza para llamar»: evita llamadas por error (como el kit de seguridad de Uber).
 * Con teclado, Enter sobre el botón también llama.
 */
export function SlideToCall({ phone, label }: { phone: string; label: string }) {
  const track = useRef<HTMLDivElement>(null)
  const start = useRef<number | null>(null)
  const [x, setX] = useState(0)
  const [done, setDone] = useState(false)

  const max = () => (track.current ? track.current.clientWidth - 60 : 200)
  const call = () => {
    setDone(true)
    haptic([20, 60, 40])
    window.location.href = `tel:${phone}`
    setTimeout(() => {
      setDone(false)
      setX(0)
    }, 1800)
  }

  const onDown = (e: PointerEvent) => {
    start.current = e.clientX - x
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }
  const onMove = (e: PointerEvent) => {
    if (start.current === null) return
    setX(Math.max(0, Math.min(max(), e.clientX - start.current)))
  }
  const onUp = () => {
    if (start.current === null) return
    start.current = null
    if (x > max() * 0.85) call()
    else setX(0)
  }

  const progress = x / max()
  return (
    <div className={`slide-call${done ? ' is-done' : ''}`} ref={track}>
      <span className="slide-call__fill" style={{ width: `${x + 56}px` }} />
      <span className="slide-call__label" style={{ opacity: 1 - progress * 1.4 }}>
        {done ? 'Llamando…' : label} <ChevronsRight size={18} />
      </span>
      <button
        className="slide-call__thumb"
        style={{ transform: `translateX(${x}px)`, transition: start.current === null ? 'transform 0.3s ease' : 'none' }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={(e) => e.key === 'Enter' && call()}
        aria-label={`${label}. Desliza el botón hacia la derecha o presiona Enter.`}
      >
        <Phone size={22} />
      </button>
    </div>
  )
}

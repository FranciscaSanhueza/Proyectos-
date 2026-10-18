import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { haptic } from '../utils'

export interface StorySlide {
  /** Fondo: lavanda, rosa, menta, durazno, cielo o noche. */
  tone: 'lavanda' | 'rosa' | 'menta' | 'durazno' | 'cielo' | 'noche'
  emoji?: string
  eyebrow?: string
  big?: string
  title: string
  text?: string
  /** Contenido extra al pie (botones para compartir, ir a una pantalla…). */
  footer?: ReactNode
}

export interface Story {
  id: string
  label: string
  emoji: string
  slides: StorySlide[]
}

const DURATION = 6000

/** Visor a pantalla completa (como las historias de Instagram): toca a la derecha para avanzar, a la izquierda para volver. */
export function StoryViewer({
  stories,
  start = 0,
  onClose,
  onSeen,
}: {
  stories: Story[]
  start?: number
  onClose: () => void
  onSeen?: (id: string) => void
}) {
  const [s, setS] = useState(start)
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const touchY = useRef<number | null>(null)
  const story = stories[s]
  const slide = story?.slides[i]

  const next = useCallback(() => {
    haptic(8)
    setElapsed(0)
    if (i + 1 < story.slides.length) setI(i + 1)
    else if (s + 1 < stories.length) {
      setS(s + 1)
      setI(0)
    } else onClose()
  }, [i, s, story, stories.length, onClose])

  const prev = useCallback(() => {
    haptic(8)
    setElapsed(0)
    if (i > 0) setI(i - 1)
    else if (s > 0) {
      setS(s - 1)
      setI(stories[s - 1].slides.length - 1)
    } else setI(0)
  }, [i, s, stories])

  useEffect(() => {
    if (story) onSeen?.(story.id)
  }, [story, onSeen])

  // Avance automático; se pausa al mantener presionado.
  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setElapsed((e) => e + 100), 100)
    return () => clearInterval(t)
  }, [paused, s, i])
  useEffect(() => {
    if (elapsed >= DURATION) next()
  }, [elapsed, next])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [next, prev, onClose])

  if (!story || !slide) return null

  return createPortal(
    <div className="story" role="dialog" aria-modal="true" aria-label={`Historia: ${story.label}`}>
      <div className={`story__card story--${slide.tone}`} key={`${s}-${i}`}>
        <div className="story__bars">
          {story.slides.map((_, k) => (
            <span key={k}>
              <i style={{ width: k < i ? '100%' : k === i ? `${Math.min(100, (elapsed / DURATION) * 100)}%` : '0%' }} />
            </span>
          ))}
        </div>
        <div className="story__top">
          <span className="story__who">
            <span className="story__avatar">{story.emoji}</span> {story.label}
          </span>
          <button className="story__close" onClick={onClose} aria-label="Cerrar historia">
            <X size={22} />
          </button>
        </div>

        <div
          className="story__body"
          onPointerDown={() => setPaused(true)}
          onPointerUp={() => setPaused(false)}
          onPointerLeave={() => setPaused(false)}
          onTouchStart={(e) => (touchY.current = e.touches[0].clientY)}
          onTouchEnd={(e) => {
            if (touchY.current !== null && e.changedTouches[0].clientY - touchY.current > 90) onClose()
            touchY.current = null
          }}
        >
          <button className="story__tap story__tap--prev" onClick={prev} aria-label="Anterior" />
          <button className="story__tap story__tap--next" onClick={next} aria-label="Siguiente" />
          <div className="story__content">
            {slide.emoji && <span className="story__emoji">{slide.emoji}</span>}
            {slide.eyebrow && <small className="story__eyebrow">{slide.eyebrow}</small>}
            {slide.big && <strong className="story__big">{slide.big}</strong>}
            <h2>{slide.title}</h2>
            {slide.text && <p>{slide.text}</p>}
          </div>
        </div>
        {slide.footer && (
          <div className="story__footer" onPointerDown={() => setPaused(true)}>
            {slide.footer}
          </div>
        )}
        <p className="story__hint">Toca a la derecha para avanzar · mantén presionado para pausar</p>
      </div>
    </div>,
    document.body,
  )
}

/** Fila de círculos con las historias (los vistos se muestran en gris). */
export function StoriesBar({ stories, seen, onOpen }: { stories: Story[]; seen: string[]; onOpen: (index: number) => void }) {
  return (
    <div className="stories" role="list" aria-label="Historias del día">
      {stories.map((st, k) => (
        <button key={st.id} role="listitem" className={`stories__item${seen.includes(st.id) ? ' is-seen' : ''}`} onClick={() => onOpen(k)}>
          <span className="stories__ring">
            <span className="stories__emoji">{st.emoji}</span>
          </span>
          <small>{st.label}</small>
        </button>
      ))}
    </div>
  )
}

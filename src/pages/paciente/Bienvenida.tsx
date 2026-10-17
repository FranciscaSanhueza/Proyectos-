import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { CalendarHeart, ChevronLeft, ChevronRight, ClipboardList, HeartHandshake, MessageCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { LevelFace } from '../../components/LevelFace'
import { ReadAloud } from '../../components/ReadAloud'
import { catSvg } from '../../bot/cat'
import { haptic } from '../../utils'

export const onboardingKey = (patientId: string) => `onboarding-${patientId}`

interface Slide {
  art: ReactNode
  title: string
  text: string
  tone: string
}

/** Bienvenida guiada: se muestra la primera vez que una paciente entra (y se puede repetir desde Ajustes). */
export function Bienvenida() {
  const { session, patients, markNotified, prefs } = useApp()
  const navigate = useNavigate()
  const [i, setI] = useState(0)
  const [dir, setDir] = useState<1 | -1>(1)
  const touch = useRef<number | null>(null)

  const patient = patients.find((p) => p.id === session?.patientId)

  const slides: Slide[] = [
    {
      tone: 'lilac',
      art: <HeartHandshake size={88} strokeWidth={1.6} />,
      title: `¡Hola, ${patient?.name.split(' ')[0] ?? ''}! 🌷`,
      text: 'Cérvix-B te acompaña desde el alta hasta tu control. Tu equipo de salud está contigo en cada paso.',
    },
    {
      tone: 'mint',
      art: (
        <div className="onb__faces">
          <LevelFace level="verde" size={64} />
          <LevelFace level="amarillo" size={64} />
          <LevelFace level="rojo" size={64} />
        </div>
      ),
      title: 'Tu semáforo de síntomas',
      text: 'Verde: lo esperado, sigue tu plan. Amarillo: escribe a tu equipo. Rojo: acude a urgencias o llama al 131.',
    },
    {
      tone: 'peach',
      art: <ClipboardList size={88} strokeWidth={1.6} />,
      title: 'Una encuesta de 5 minutos',
      text: 'Cada semana respondes cómo te sientes. Con eso actualizamos tu semáforo y tu médica sigue tu evolución.',
    },
    {
      tone: 'pink',
      art: <CalendarHeart size={88} strokeWidth={1.6} />,
      title: 'Tu plan y recordatorios',
      text: 'Marca tus cuidados de cada día y revisa tus controles y medicamentos en el calendario.',
    },
    {
      tone: 'lilac',
      art: (
        <div className="onb__duo">
          <span className="onb__chat"><MessageCircle size={56} strokeWidth={1.6} /></span>
          <span className="onb__cat" dangerouslySetInnerHTML={{ __html: catSvg(84) }} />
        </div>
      ),
      title: '¿Dudas? Estamos aquí',
      text: 'Escríbele a tu equipo por el chat o pregúntale a Kitty, el gatito, en cualquier momento. 🐾',
    },
  ]

  const last = i === slides.length - 1
  const go = (n: number) => {
    if (n < 0 || n >= slides.length) return
    haptic()
    setDir(n > i ? 1 : -1)
    setI(n)
  }
  const finish = () => {
    if (patient && !prefs.notified.includes(onboardingKey(patient.id))) markNotified([onboardingKey(patient.id)])
    navigate('/paciente', { replace: true })
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(i + 1)
      if (e.key === 'ArrowLeft') go(i - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!patient) return <Navigate to="/" replace />
  const s = slides[i]

  return (
    <div
      className={`onb onb--${s.tone}`}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current === null) return
        const dx = e.changedTouches[0].clientX - touch.current
        if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1))
        touch.current = null
      }}
    >
      <div className="onb__top">
        <span className="onb__brand">Cérvix-B</span>
        {!last && <button className="link-btn" onClick={finish}>Saltar</button>}
      </div>

      <div className={`onb__slide onb__slide--${dir === 1 ? 'next' : 'prev'}`} key={i} aria-live="polite">
        <div className="onb__art">{s.art}</div>
        <h1>{s.title}</h1>
        <p>{s.text}</p>
        <ReadAloud text={`${s.title}. ${s.text}`} />
      </div>

      <div className="onb__dots" role="tablist" aria-label="Pasos">
        {slides.map((_, n) => (
          <button key={n} role="tab" aria-selected={n === i} aria-label={`Paso ${n + 1}`} className={n === i ? 'is-active' : ''} onClick={() => go(n)} />
        ))}
      </div>

      <div className="onb__nav">
        {i > 0 ? (
          <button className="icon-btn" onClick={() => go(i - 1)} aria-label="Anterior"><ChevronLeft size={22} /></button>
        ) : (
          <span />
        )}
        {last ? (
          <button className="btn btn--primary grow" onClick={finish}>Comenzar</button>
        ) : (
          <button className="btn btn--primary grow" onClick={() => go(i + 1)}>
            Siguiente <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  )
}

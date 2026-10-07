import { useEffect, useRef, useState } from 'react'
import { CloudRain, Hand, Pause, Play, RefreshCw, Sparkles, Wind } from 'lucide-react'
import { Card, PageHeader, SectionTitle } from '../../components/ui'
import { Breathing } from '../../components/Support'
import { Celebrate } from '../../components/Celebrate'
import { affirmations } from '../../data/mock'

const GROUNDING = [
  { n: 5, sense: 'cosas que puedes ver', emoji: '👀' },
  { n: 4, sense: 'cosas que puedes tocar', emoji: '✋' },
  { n: 3, sense: 'sonidos que puedes escuchar', emoji: '👂' },
  { n: 2, sense: 'olores que puedes sentir', emoji: '🌿' },
  { n: 1, sense: 'cosa por la que te sientes agradecida', emoji: '💜' },
]

/** Ejercicio 5-4-3-2-1 para volver al presente cuando aparece la angustia. */
function Grounding() {
  const [step, setStep] = useState(-1)
  const [taps, setTaps] = useState(0)
  if (step === -1) {
    return (
      <button className="btn btn--ghost btn--block" onClick={() => setStep(0)}>
        <Hand size={18} /> Empezar ejercicio 5-4-3-2-1
      </button>
    )
  }
  if (step >= GROUNDING.length) {
    return (
      <div className="grounding pop-in">
        <Celebrate />
        <strong>¡Muy bien! 🌸</strong>
        <p>Volviste al presente. Tómate un momento antes de seguir con tu día.</p>
        <button className="link-btn" onClick={() => { setStep(-1); setTaps(0) }}>Repetir</button>
      </div>
    )
  }
  const g = GROUNDING[step]
  return (
    <div className="grounding" key={step}>
      <span className="grounding__emoji">{g.emoji}</span>
      <p>Nombra <b>{g.n}</b> {g.sense}</p>
      <div className="grounding__dots" aria-label={`${taps} de ${g.n}`}>
        {Array.from({ length: g.n }, (_, i) => (
          <span key={i} className={i < taps ? 'is-on' : ''} />
        ))}
      </div>
      <button
        className="btn btn--primary btn--block"
        onClick={() => {
          if (taps + 1 >= g.n) {
            setStep(step + 1)
            setTaps(0)
          } else setTaps(taps + 1)
        }}
      >
        Listo, una más ({taps + 1}/{g.n})
      </button>
    </div>
  )
}

/** Tarjeta que se da vuelta con una frase de ánimo distinta. */
function Affirmation() {
  const [i, setI] = useState(() => Math.floor(Math.random() * affirmations.length))
  const [flip, setFlip] = useState(false)
  const next = () => {
    setFlip(true)
    setTimeout(() => {
      setI((x) => (x + 1) % affirmations.length)
      setFlip(false)
    }, 280)
  }
  return (
    <button className={`affirmation${flip ? ' is-flipping' : ''}`} onClick={next} aria-live="polite">
      <Sparkles size={22} />
      <p>“{affirmations[i]}”</p>
      <small><RefreshCw size={12} /> Toca para otra frase</small>
    </button>
  )
}

/** Sonido suave tipo lluvia generado en el navegador (sin archivos de audio). */
function RainSound() {
  const [on, setOn] = useState(false)
  const [volume, setVolume] = useState(0.4)
  const ctxRef = useRef<{ ctx: AudioContext; gain: GainNode } | null>(null)

  useEffect(() => () => { ctxRef.current?.ctx.close() }, [])
  useEffect(() => { if (ctxRef.current) ctxRef.current.gain.gain.value = volume * 0.5 }, [volume])

  const toggle = async () => {
    if (on) {
      await ctxRef.current?.ctx.suspend()
      setOn(false)
      return
    }
    if (!ctxRef.current) {
      const ctx = new AudioContext()
      // Ruido café (brown noise): suave y parecido a la lluvia.
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      let last = 0
      for (let k = 0; k < data.length; k++) {
        const white = Math.random() * 2 - 1
        last = (last + 0.02 * white) / 1.02
        data[k] = last * 3.5
      }
      const src = ctx.createBufferSource()
      src.buffer = buffer
      src.loop = true
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = 900
      const gain = ctx.createGain()
      gain.gain.value = volume * 0.5
      src.connect(filter).connect(gain).connect(ctx.destination)
      src.start()
      ctxRef.current = { ctx, gain }
    } else {
      await ctxRef.current.ctx.resume()
    }
    setOn(true)
  }

  return (
    <div className="sound">
      <button className={`sound__play${on ? ' is-on' : ''}`} onClick={toggle} aria-label={on ? 'Pausar sonido' : 'Reproducir sonido'}>
        {on ? <Pause size={22} /> : <Play size={22} />}
      </button>
      <div className="grow">
        <strong><CloudRain size={16} /> Lluvia suave</strong>
        <input type="range" min={0} max={1} step={0.05} value={volume} onChange={(e) => setVolume(Number(e.target.value))} aria-label="Volumen" />
      </div>
      {on && <span className="sound__wave" aria-hidden="true"><i /><i /><i /><i /></span>}
    </div>
  )
}

export function Calma() {
  const [breathing, setBreathing] = useState(false)
  return (
    <div className="page stagger">
      <PageHeader title="Rincón de calma" subtitle="Un espacio para ti, cuando lo necesites" back />

      <Affirmation />

      <SectionTitle><Wind size={18} className="accent" /> Respiración guiada</SectionTitle>
      <Card>
        {breathing ? (
          <Breathing onDone={() => setBreathing(false)} />
        ) : (
          <>
            <p className="muted">Inhala 4 segundos, sostén 4 y exhala 6. Ayuda a bajar la ansiedad en 1 minuto.</p>
            <button className="btn btn--primary btn--block small-gap" onClick={() => setBreathing(true)}>Comenzar</button>
          </>
        )}
      </Card>

      <SectionTitle><Hand size={18} className="accent" /> Vuelve al presente</SectionTitle>
      <Card>
        <Grounding />
      </Card>

      <SectionTitle><CloudRain size={18} className="accent" /> Sonido relajante</SectionTitle>
      <Card>
        <RainSound />
      </Card>

      <p className="muted center">Si la angustia no pasa, conversa con tu equipo o llama a Salud Responde 600 360 7777.</p>
    </div>
  )
}

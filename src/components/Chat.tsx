import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Check, CheckCheck, Clock, Mic, Pause, Play, SendHorizontal, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { Message, Role } from '../types'
import { formatDate, formatTime, haptic } from '../utils'

// Respuestas rápidas para escribir con un toque.
const quickReplies: Record<Role, string[]> = {
  paciente: [
    'Tengo sangrado leve, ¿es verde, amarillo o rojo?',
    'Tengo dolor, ¿qué puedo tomar?',
    '¿Puedo retomar mis actividades?',
  ],
  medico: [
    'Es verde 💚: es esperable, sigue tu plan.',
    'Es amarillo 💛: te llamaremos para evaluarte.',
    'Es rojo ❤️: acude a urgencias ahora.',
  ],
}

const MAX_AUDIO_S = 60
const canRecord = () => typeof window !== 'undefined' && 'MediaRecorder' in window && !!navigator.mediaDevices?.getUserMedia
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s) % 60).padStart(2, '0')}`

/** Burbuja de mensaje de voz con reproducir/pausar (como WhatsApp). */
function AudioBubble({ src, duration = 0 }: { src: string; duration?: number }) {
  const audio = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [t, setT] = useState(0)
  return (
    <div className="voice">
      <button
        className="voice__play"
        onClick={() => (playing ? audio.current?.pause() : audio.current?.play())}
        aria-label={playing ? 'Pausar audio' : 'Reproducir audio'}
      >
        {playing ? <Pause size={18} /> : <Play size={18} />}
      </button>
      <span className="voice__track">
        <span style={{ width: `${duration ? Math.min(100, (t / duration) * 100) : 0}%` }} />
      </span>
      <small>{mmss(playing || t ? t : duration)}</small>
      <audio
        ref={audio}
        src={src}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false)
          setT(0)
        }}
        onTimeUpdate={(e) => setT(e.currentTarget.currentTime)}
      />
    </div>
  )
}

/** Grabación de voz: toca el micrófono, habla y envía (máximo 1 minuto). */
function useRecorder(onDone: (dataUrl: string, seconds: number) => void) {
  const rec = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const started = useRef(0)
  const cancelled = useRef(false)
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!recording) return
    const id = setInterval(() => {
      const s = (Date.now() - started.current) / 1000
      setSeconds(s)
      if (s >= MAX_AUDIO_S) rec.current?.stop()
    }, 200)
    return () => clearInterval(id)
  }, [recording])

  const start = async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const r = new MediaRecorder(stream, { audioBitsPerSecond: 24000 })
      chunks.current = []
      cancelled.current = false
      r.ondataavailable = (e) => e.data.size && chunks.current.push(e.data)
      r.onstop = () => {
        stream.getTracks().forEach((tr) => tr.stop())
        setRecording(false)
        const secs = (Date.now() - started.current) / 1000
        if (cancelled.current || secs < 0.6) return
        const reader = new FileReader()
        reader.onload = () => onDone(String(reader.result), Math.round(secs))
        reader.readAsDataURL(new Blob(chunks.current, { type: r.mimeType || 'audio/webm' }))
      }
      rec.current = r
      started.current = Date.now()
      setSeconds(0)
      r.start()
      setRecording(true)
      haptic(15)
    } catch {
      setError('No pudimos usar el micrófono. Revisa el permiso en tu navegador.')
    }
  }
  const stop = () => rec.current?.state === 'recording' && rec.current.stop()
  const cancel = () => {
    cancelled.current = true
    stop()
  }
  return { recording, seconds, error, start, stop, cancel }
}

export function Chat({ patientId, staffId, me }: { patientId: string; staffId: string; me: Role }) {
  const { messages, sendMessage, markThreadRead } = useApp()
  const [text, setText] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const thread = messages.filter((m) => m.patientId === patientId && m.staffId === staffId)
  const voice = useRecorder((audio, duration) => sendMessage({ patientId, staffId, from: me, text: `🎤 Mensaje de voz (${mmss(duration)})`, audio, duration }))

  useEffect(() => {
    markThreadRead(patientId, staffId, me)
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [thread.length, patientId, staffId])

  const send = (value: string) => {
    const clean = value.trim()
    if (!clean) return
    haptic(10)
    sendMessage({ patientId, staffId, from: me, text: clean })
    setText('')
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    send(text)
  }

  const ticks = (m: Message) =>
    m.read ? (
      <CheckCheck size={15} className="ticks ticks--read" aria-label="Leído" />
    ) : (
      <Check size={15} className="ticks" aria-label="Enviado" />
    )

  let lastDay = ''
  return (
    <div className="chat">
      {me === 'paciente' && (
        <p className="chat__sla">
          <Clock size={14} /> Tu equipo responde en horario hábil, normalmente en menos de 24 horas.
        </p>
      )}
      <div className="chat__list">
        {thread.map((m) => {
          const day = formatDate(m.at)
          const showDay = day !== lastDay
          lastDay = day
          const mine = m.from === me
          return (
            <div key={m.id}>
              {showDay && <div className="chat__day">{day}</div>}
              <div className={`bubble ${mine ? 'bubble--me' : 'bubble--them'}`}>
                {m.audio ? <AudioBubble src={m.audio} duration={m.duration} /> : <p>{m.text}</p>}
                <time>
                  {formatTime(m.at)} {mine && ticks(m)}
                </time>
              </div>
            </div>
          )
        })}
        {thread.length === 0 && <p className="empty">Aún no hay mensajes. ¡Escribe el primero!</p>}
        <div ref={endRef} />
      </div>
      <div className="chat__quick">
        {quickReplies[me].map((q) => (
          <button key={q} className="chip" onClick={() => send(q)}>
            {q}
          </button>
        ))}
      </div>
      {voice.error && <p className="form__error">{voice.error}</p>}
      {voice.recording ? (
        <div className="chat__composer chat__composer--rec" role="status">
          <button className="icon-btn" type="button" onClick={voice.cancel} aria-label="Cancelar audio">
            <Trash2 size={20} />
          </button>
          <span className="rec">
            <i className="rec__dot" /> Grabando… {mmss(voice.seconds)} <small>/ 1:00</small>
          </span>
          <button className="icon-btn icon-btn--primary" type="button" onClick={voice.stop} aria-label="Enviar audio">
            <SendHorizontal size={20} />
          </button>
        </div>
      ) : (
        <form className="chat__composer" onSubmit={onSubmit}>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe tu duda…" aria-label="Mensaje" />
          {!text.trim() && canRecord() ? (
            <button className="icon-btn icon-btn--primary" type="button" onClick={voice.start} aria-label="Grabar mensaje de voz">
              <Mic size={20} />
            </button>
          ) : (
            <button className="icon-btn icon-btn--primary" type="submit" aria-label="Enviar" disabled={!text.trim()}>
              <SendHorizontal size={20} />
            </button>
          )}
        </form>
      )}
    </div>
  )
}

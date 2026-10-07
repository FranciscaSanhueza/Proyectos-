import { useEffect, useRef, useState, type FormEvent } from 'react'
import { SendHorizontal } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { Role } from '../types'
import { formatDate, formatTime } from '../utils'

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

export function Chat({ patientId, staffId, me }: { patientId: string; staffId: string; me: Role }) {
  const { messages, sendMessage, markThreadRead } = useApp()
  const [text, setText] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const thread = messages.filter((m) => m.patientId === patientId && m.staffId === staffId)

  useEffect(() => {
    markThreadRead(patientId, staffId, me)
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [thread.length, patientId, staffId])

  const send = (value: string) => {
    const clean = value.trim()
    if (!clean) return
    sendMessage({ patientId, staffId, from: me, text: clean })
    setText('')
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    send(text)
  }

  let lastDay = ''
  return (
    <div className="chat">
      <div className="chat__list">
        {thread.map((m) => {
          const day = formatDate(m.at)
          const showDay = day !== lastDay
          lastDay = day
          return (
            <div key={m.id}>
              {showDay && <div className="chat__day">{day}</div>}
              <div className={`bubble ${m.from === me ? 'bubble--me' : 'bubble--them'}`}>
                <p>{m.text}</p>
                <time>{formatTime(m.at)}</time>
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
      <form className="chat__composer" onSubmit={onSubmit}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe tu duda…" aria-label="Mensaje" />
        <button className="icon-btn icon-btn--primary" type="submit" aria-label="Enviar" disabled={!text.trim()}>
          <SendHorizontal size={20} />
        </button>
      </form>
    </div>
  )
}

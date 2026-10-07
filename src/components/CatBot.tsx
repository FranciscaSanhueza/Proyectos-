import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { mountCatBot } from '../bot/widget'

/** Kitty en la app de la paciente: responde dudas y guarda preguntas para el control. */
export function CatBot() {
  const { session, questions, addQuestion } = useApp()
  const { pathname } = useLocation()
  const unmountRef = useRef<(() => void) | null>(null)

  // Valores siempre actuales para el widget (que se monta una sola vez).
  const latest = useRef({ session, questions, addQuestion })
  latest.current = { session, questions, addQuestion }

  useEffect(() => {
    unmountRef.current = mountCatBot({
      audience: 'app',
      className: 'cb-in-app',
      pendingQuestions: () => {
        const { session, questions } = latest.current
        return questions.filter((q) => q.patientId === session?.patientId && !q.answered).map((q) => q.text)
      },
      onSaveQuestion: (text) => {
        const { session, questions, addQuestion } = latest.current
        const id = session?.patientId
        if (id && !questions.some((q) => q.patientId === id && q.text === text)) addQuestion(id, text)
      },
    })
    return () => unmountRef.current?.()
  }, [])

  // En el chat con el equipo y en la encuesta el botón estorbaría: se oculta.
  useEffect(() => {
    const hide = /^\/paciente\/(chat\/|encuesta)/.test(pathname)
    document.querySelector('.cb-root')?.classList.toggle('is-hidden', hide)
  }, [pathname])

  return null
}

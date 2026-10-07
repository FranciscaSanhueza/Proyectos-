import { useState } from 'react'
import { BookOpen, Check, ChevronDown, Gamepad2, X } from 'lucide-react'
import { Card, PageHeader, SectionTitle } from '../../components/ui'
import { Celebrate } from '../../components/Celebrate'
import { ReadAloud } from '../../components/ReadAloud'
import { learnCards, mythQuiz } from '../../data/mock'

/** Juego «¿Mito o verdad?» con explicación después de cada respuesta. */
function MythQuiz() {
  const [i, setI] = useState(0)
  const [answer, setAnswer] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)

  if (i >= mythQuiz.length) {
    return (
      <div className="quiz__end pop-in">
        <Celebrate />
        <span className="quiz__trophy">🏆</span>
        <strong>¡Terminaste! {score} de {mythQuiz.length} correctas</strong>
        <p className="muted">Ahora sabes más sobre tu salud. ¡Bien hecho!</p>
        <button className="btn btn--ghost" onClick={() => { setI(0); setScore(0); setAnswer(null) }}>Jugar de nuevo</button>
      </div>
    )
  }

  const q = mythQuiz[i]
  const pick = (v: boolean) => {
    if (answer !== null) return
    setAnswer(v)
    if (v === q.truth) setScore((s) => s + 1)
  }
  const correct = answer === q.truth

  return (
    <div className="quiz" key={i}>
      <div className="quiz__progress">
        {mythQuiz.map((_, k) => <span key={k} className={k < i ? 'is-done' : k === i ? 'is-now' : ''} />)}
      </div>
      <p className="quiz__statement">“{q.statement}”</p>
      <div className="quiz__options">
        <button
          className={`quiz__btn quiz__btn--myth${answer === false ? ' is-picked' : ''}${answer !== null && !q.truth ? ' is-right' : ''}`}
          onClick={() => pick(false)}
          disabled={answer !== null}
        >
          <X size={20} /> Mito
        </button>
        <button
          className={`quiz__btn quiz__btn--truth${answer === true ? ' is-picked' : ''}${answer !== null && q.truth ? ' is-right' : ''}`}
          onClick={() => pick(true)}
          disabled={answer !== null}
        >
          <Check size={20} /> Verdad
        </button>
      </div>
      {answer !== null && (
        <div className={`quiz__feedback pop-in ${correct ? 'is-correct' : 'is-wrong'}`}>
          <strong>{correct ? '¡Correcto! 🎉' : 'Casi 💜'} Es {q.truth ? 'verdad' : 'un mito'}.</strong>
          <p>{q.explain}</p>
          <button className="btn btn--primary btn--block" onClick={() => { setI(i + 1); setAnswer(null) }}>
            {i + 1 < mythQuiz.length ? 'Siguiente' : 'Ver resultado'}
          </button>
        </div>
      )}
    </div>
  )
}

export function Aprende() {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <div className="page stagger">
      <PageHeader title="Aprende" subtitle="Información clara y validada por tu equipo" back />

      <SectionTitle><Gamepad2 size={18} className="accent" /> ¿Mito o verdad?</SectionTitle>
      <Card>
        <MythQuiz />
      </Card>

      <SectionTitle><BookOpen size={18} className="accent" /> Lo que necesitas saber</SectionTitle>
      <div className="stack">
        {learnCards.map((c) => {
          const isOpen = open === c.id
          return (
            <div key={c.id} className={`learn${isOpen ? ' is-open' : ''}`}>
              <button className="learn__head" onClick={() => setOpen(isOpen ? null : c.id)} aria-expanded={isOpen}>
                <span className="learn__emoji">{c.emoji}</span>
                <strong className="grow">{c.title}</strong>
                <ChevronDown size={20} className="learn__chev" />
              </button>
              <div className="learn__body">
                <div>
                  <p>{c.body}</p>
                  <ReadAloud text={`${c.title}. ${c.body}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

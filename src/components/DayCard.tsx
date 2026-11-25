import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronRight, Droplet, NotebookPen, Thermometer } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { CheckIn, DiaryEntry } from '../types'
import { BLEEDING_LABELS, LEVEL_INFO, TEMP_LABELS, diaryLevel, haptic, toDayKey } from '../utils'
import { levelSound, playSound } from '../sound'
import { MOODS, MoodPicker } from './MoodPicker'
import { PainScale } from './PainScale'
import { LevelFace } from './LevelFace'
import { UrgentAlert } from './Support'

const NEXT = {
  verde: 'Todo dentro de lo esperado. ¡Bien hecho por registrarlo!',
  amarillo: 'Avisamos a tu equipo. Escríbeles para que te orienten.',
  rojo: 'Señal de alarma: acude a urgencias o llama al 131.',
} as const

/**
 * «Mi día»: registro diario en un toque por dato (ánimo, dolor, sangrado y temperatura).
 * Se guarda solo, sin botón «Guardar».
 */
export function DayCard({ patientId, onMood }: { patientId: string; onMood?: (m: CheckIn['mood']) => void }) {
  const { diary, checkIns, saveDiary, checkIn } = useApp()
  const navigate = useNavigate()
  const today = toDayKey(new Date())
  const entry = diary.find((e) => e.patientId === patientId && e.date === today)
  const mood = checkIns.find((c) => c.patientId === patientId && c.date === today)?.mood
  const [urgent, setUrgent] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const [note, setNote] = useState(entry?.note ?? '')

  const done = [mood, entry?.pain, entry?.bleeding, entry?.temp].filter((v) => v !== undefined).length
  const level = entry ? diaryLevel(entry) : 'verde'

  const save = (changes: Partial<Omit<DiaryEntry, 'patientId' | 'date' | 'updatedAt'>>) => {
    const next = { ...entry, ...changes }
    const nextLevel = diaryLevel(next)
    const filled = [mood, next.pain, next.bleeding, next.temp].filter((v) => v !== undefined).length
    saveDiary(patientId, today, changes)
    haptic(nextLevel === 'rojo' ? [30, 60, 30] : 12)
    if (nextLevel !== level && nextLevel !== 'verde') playSound(levelSound(nextLevel))
    else playSound(filled === 4 && done < 4 ? 'success' : 'ding')
    if (nextLevel === 'rojo' && level !== 'rojo') setUrgent(true)
  }

  return (
    <section className="card day home-half" id="mi-dia" aria-labelledby="mi-dia-title">
      {urgent && (
        <div className="overlay">
          <UrgentAlert onClose={() => setUrgent(false)} />
        </div>
      )}
      <div className="day__head">
        <h2 id="mi-dia-title">Mi día</h2>
        <span className={`day__count${done === 4 ? ' is-full' : ''}`}>{done === 4 ? <><Check size={14} /> Listo</> : `${done} de 4`}</span>
      </div>
      <p className="day__lead">Un toque por cada dato. Se guarda solo.</p>

      <div className="day__row">
        <p className="day__label">¿Cómo te sientes?</p>
        <MoodPicker
          value={mood}
          onPick={(m) => {
            checkIn(patientId, today, m)
            playSound(done === 3 && mood === undefined ? 'success' : 'ding')
            onMood?.(m)
          }}
        />
        {mood && <p className="day__reply pop-in">{MOODS[mood - 1].reply}</p>}
      </div>

      <div className="day__row">
        <p className="day__label">Dolor</p>
        <PainScale value={entry?.pain} onChange={(v) => save({ pain: v })} />
      </div>

      <div className="day__row">
        <p className="day__label"><Droplet size={16} /> Sangrado</p>
        <div className="day__chips" role="radiogroup" aria-label="Sangrado">
          {BLEEDING_LABELS.map((label, i) => (
            <button
              key={label}
              type="button"
              role="radio"
              aria-checked={entry?.bleeding === i}
              className={`day__chip day__chip--${i === 3 ? 'rojo' : i === 2 ? 'amarillo' : 'verde'}${entry?.bleeding === i ? ' is-on' : ''}`}
              onClick={() => save({ bleeding: i as DiaryEntry['bleeding'] })}
            >
              <span className="day__drops" aria-hidden="true">{i === 0 ? '—' : '💧'.repeat(i)}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="day__row">
        <p className="day__label"><Thermometer size={16} /> Temperatura</p>
        <div className="day__chips day__chips--3" role="radiogroup" aria-label="Temperatura">
          {TEMP_LABELS.map((label, i) => (
            <button
              key={label}
              type="button"
              role="radio"
              aria-checked={entry?.temp === i}
              className={`day__chip day__chip--${i === 2 ? 'rojo' : i === 1 ? 'amarillo' : 'verde'}${entry?.temp === i ? ' is-on' : ''}`}
              onClick={() => save({ temp: i as DiaryEntry['temp'] })}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {noteOpen ? (
        <textarea
          className="day__note"
          rows={2}
          value={note}
          autoFocus
          placeholder="¿Algo más? (opcional)"
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => note.trim() !== (entry?.note ?? '') && save({ note: note.trim() })}
          aria-label="Nota del día"
        />
      ) : (
        <button type="button" className="link-btn day__add-note" onClick={() => setNoteOpen(true)}>
          <NotebookPen size={15} /> {entry?.note ? 'Ver mi nota' : 'Agregar una nota'}
        </button>
      )}

      {entry && (entry.pain !== undefined || entry.bleeding !== undefined || entry.temp !== undefined) && (
        <div className={`day__result level-bg--${level} pop-in`} key={level}>
          <LevelFace level={level} size={36} />
          <div className="grow">
            <strong className={`level-text--${level}`}>Tu día: {LEVEL_INFO[level].title}</strong>
            <span>{NEXT[level]}</span>
          </div>
          {level === 'amarillo' && (
            <button className="btn btn--primary" onClick={() => navigate('/paciente/chat/d1')}>Escribir</button>
          )}
        </div>
      )}

      <button type="button" className="day__link" onClick={() => navigate('/paciente/evolucion')}>
        Ver mi evolución <ChevronRight size={16} />
      </button>
    </section>
  )
}

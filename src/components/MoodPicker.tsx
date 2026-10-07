import type { CheckIn } from '../types'

export const MOODS = [
  { emoji: '😣', label: 'Muy mal', reply: 'Siento que estés pasando un mal día. Tu equipo está para ti: escríbeles si algo te preocupa 💜' },
  { emoji: '🙁', label: 'Mal', reply: 'Gracias por contarnos. Date permiso para descansar hoy. ¿Probamos un ejercicio de calma?' },
  { emoji: '😐', label: 'Regular', reply: 'Un día a la vez. Recuerda revisar tus cuidados de hoy.' },
  { emoji: '🙂', label: 'Bien', reply: '¡Qué bueno! Sigue así, tu cuerpo está sanando.' },
  { emoji: '😄', label: 'Muy bien', reply: '¡Nos alegra mucho! Celebra cada avance 🎉' },
] as const

/** Selector de ánimo con cinco caritas. */
export function MoodPicker({ value, onPick }: { value?: CheckIn['mood']; onPick: (m: CheckIn['mood']) => void }) {
  return (
    <div className="mood-picker" role="radiogroup" aria-label="¿Cómo te sientes hoy?">
      {MOODS.map((m, i) => {
        const mood = (i + 1) as CheckIn['mood']
        return (
          <button
            key={m.label}
            role="radio"
            aria-checked={value === mood}
            aria-label={m.label}
            className={`mood-picker__opt${value === mood ? ' is-active' : ''}${value && value !== mood ? ' is-dim' : ''}`}
            onClick={() => onPick(mood)}
          >
            <span className="mood-picker__emoji">{m.emoji}</span>
            <small>{m.label}</small>
          </button>
        )
      })}
    </div>
  )
}

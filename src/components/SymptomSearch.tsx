import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { symptomGuide } from '../data/mock'
import { isRedFlag, normalize } from '../bot/engine'
import { LEVEL_INFO } from '../utils'
import { LevelFace } from './LevelFace'

// Palabras de todos los días → término de la guía de síntomas.
const SYNONYMS: [RegExp, string][] = [
  [/duel|dolor|colic|punzad|retorcij/, 'dolor'],
  [/sangr|manch|regla|hemorr|coagul|toalla/, 'sangrado'],
  [/fiebr|temperatur|calentur|caliente|escalofri/, 'temperatura fiebre'],
  [/flujo|olor|secreci|descarg|amarill|cafe/, 'flujo'],
]

const LEVEL_ORDER = { rojo: 0, amarillo: 1, verde: 2 } as const

/** «¿Qué te preocupa?»: busca en la guía de síntomas con palabras simples (como Google). */
export function SymptomSearch() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const text = normalize(q)
  const terms = SYNONYMS.filter(([re]) => re.test(text)).flatMap(([, t]) => t.split(' '))
  const results = text.length < 3
    ? []
    : symptomGuide
        .filter((g) => {
          const s = normalize(g.symptom)
          return terms.some((t) => s.includes(t)) || text.split(' ').some((w) => w.length > 3 && s.includes(w))
        })
        .sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level])
        .slice(0, 4)
  const urgent = text.length >= 3 && isRedFlag(text)

  return (
    <div className="worry">
      <label className="worry__bar">
        <Search size={20} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="¿Qué te preocupa? Ej: me duele, manché…"
          aria-label="¿Qué te preocupa? Escribe un síntoma"
          enterKeyHint="search"
        />
        {q && (
          <button className="worry__clear" onClick={() => setQ('')} aria-label="Borrar búsqueda">
            <X size={18} />
          </button>
        )}
      </label>

      {text.length >= 3 && (
        <div className="worry__results pop-in" aria-live="polite">
          {urgent && (
            <div className="worry__urgent">
              <strong>Esto puede ser una urgencia</strong>
              <span>Acude a urgencias o llama al 131.</span>
              <a className="btn btn--danger btn--block" href="tel:131">Llamar al 131</a>
            </div>
          )}
          {results.map((g) => (
            <div key={g.symptom} className={`worry__item level-border--${g.level}`}>
              <LevelFace level={g.level} size={30} />
              <div>
                <strong>{g.symptom} · <span className={`level-text--${g.level}`}>{LEVEL_INFO[g.level].title}</span></strong>
                <small>{g.advice}</small>
              </div>
            </div>
          ))}
          {results.length === 0 && !urgent && <p className="muted">No encontré ese síntoma en la guía.</p>}
          <div className="worry__more">
            <button className="btn btn--ghost" onClick={() => window.dispatchEvent(new CustomEvent('kitty:ask', { detail: q }))}>
              🐾 Preguntarle a Kitty
            </button>
            <button className="btn btn--ghost" onClick={() => navigate('/paciente/chat/d1')}>Escribir a mi equipo</button>
          </div>
        </div>
      )}
    </div>
  )
}

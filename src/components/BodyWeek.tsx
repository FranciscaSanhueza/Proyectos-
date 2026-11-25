import { useState } from 'react'
import { ReadAloud } from './ReadAloud'

// Ilustración simplificada y referencial de la cicatrización tras una conización.
// Debe revisarla el equipo de salud antes de usarse con pacientes reales.
const WEEKS = [
  { label: 'Semana 1', cover: 0, crust: false, text: 'La zona tratada está en reparación. Es esperable un flujo café o con restos y una molestia leve, tipo cólico.' },
  { label: 'Semana 2', cover: 0.2, crust: true, text: 'Se forma una costra que se desprende cerca del día 10 a 14: puede aumentar un poco el sangrado. Si es abundante (más que una regla), es rojo.' },
  { label: 'Semana 3', cover: 0.45, crust: false, text: 'Tejido nuevo empieza a cubrir la zona tratada. El flujo y el sangrado suelen disminuir.' },
  { label: 'Semana 4', cover: 0.75, crust: false, text: 'La cicatrización avanza. Según te indique tu médico, podrás retomar de a poco algunas actividades.' },
  { label: 'Semana 5 y 6', cover: 1, crust: false, text: 'La zona está casi cicatrizada. Se acerca tu control, donde revisarán tu evolución y el resultado de la biopsia.' },
]

function Illustration({ cover, crust }: { cover: number; crust: boolean }) {
  const r = 46
  return (
    <svg viewBox="0 0 200 200" className="body__svg" aria-hidden="true">
      <circle cx="100" cy="100" r="92" className="body__outer" />
      <circle cx="100" cy="100" r="66" className="body__mid" />
      {/* Zona tratada (rojiza) que el tejido nuevo (rosado) va cubriendo */}
      <circle cx="100" cy="100" r={r} className="body__treated" />
      {/* Tejido nuevo: anillo que crece desde el borde hacia el centro */}
      {cover > 0 && <circle cx="100" cy="100" r={r - (r * cover) / 2} strokeWidth={r * cover} className="body__new" />}
      {crust && (
        <g className="body__crust">
          <circle cx="78" cy="82" r="6" />
          <circle cx="122" cy="88" r="5" />
          <circle cx="112" cy="122" r="6" />
          <circle cx="82" cy="118" r="4" />
        </g>
      )}
      <ellipse cx="100" cy="100" rx="11" ry="7" className="body__os" />
      {cover >= 1 && (
        <g className="body__spark">
          <text x="140" y="58" fontSize="20">✨</text>
          <text x="40" y="160" fontSize="16">✨</text>
        </g>
      )}
    </svg>
  )
}

/** «¿Qué pasa en mi cuerpo esta semana?»: dibujo simple de la cicatrización por semana. */
export function BodyWeek({ week }: { week: number }) {
  const current = Math.min(WEEKS.length - 1, Math.max(0, week - 1))
  const [i, setI] = useState(current)
  const w = WEEKS[i]
  return (
    <div className="body">
      <div className="body__tabs" role="tablist" aria-label="Semana">
        {WEEKS.map((x, k) => (
          <button key={x.label} role="tab" aria-selected={k === i} className={`body__tab${k === i ? ' is-on' : ''}${k === current ? ' is-now' : ''}`} onClick={() => setI(k)}>
            {x.label.replace('Semana ', 'S')}
          </button>
        ))}
      </div>
      <div className="body__main pop-in" key={i}>
        <Illustration cover={w.cover} crust={w.crust} />
        <div>
          <strong>{w.label}{i === current && ' · tu semana'}</strong>
          <p>{w.text}</p>
          <ReadAloud text={`${w.label}. ${w.text}`} />
        </div>
      </div>
      <ul className="body__legend">
        <li><i className="body__key body__key--treated" /> Zona tratada</li>
        <li><i className="body__key body__key--new" /> Tejido nuevo</li>
        {w.crust && <li><i className="body__key body__key--crust" /> Costra</li>}
      </ul>
      <p className="muted body__note">Dibujo simplificado y referencial. Cada recuperación es distinta: sigue las indicaciones de tu equipo de salud.</p>
    </div>
  )
}

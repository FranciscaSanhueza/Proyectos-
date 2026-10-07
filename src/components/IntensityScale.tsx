import { Activity, ClipboardCheck, Droplet, Heart, Thermometer, Waves, type LucideIcon } from 'lucide-react'
import type { SurveyIcon } from '../types'

export const QUESTION_ICON: Record<SurveyIcon, LucideIcon> = {
  sangrado: Droplet,
  dolor: Activity,
  fiebre: Thermometer,
  flujo: Waves,
  plan: ClipboardCheck,
  animo: Heart,
}

/**
 * Escala visual de 0 a 3 para que la paciente compare la intensidad de cada
 * opción sin depender solo del texto (p. ej. cuántas gotas de sangrado).
 */
export function IntensityScale({ icon, intensity }: { icon: SurveyIcon; intensity: number }) {
  const Icon = QUESTION_ICON[icon]
  return (
    <span className={`intensity intensity--${intensity}`} aria-hidden="true">
      {intensity === 0 ? (
        <span className="intensity__none">—</span>
      ) : (
        Array.from({ length: 3 }, (_, i) => (
          <Icon key={i} size={16} className={i < intensity ? 'is-on' : 'is-off'} />
        ))
      )}
    </span>
  )
}

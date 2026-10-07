import { ENTRIES, type Audience, type BotAction } from './knowledge'

export interface BotReply {
  text: string
  actions?: BotAction[]
  urgent?: boolean
  /** No encontró respuesta: la pregunta puede guardarse para el equipo. */
  unknown?: boolean
}

/** Minúsculas, sin tildes ni signos. */
export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9ñ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const has = (text: string, words: string[]) => words.some((w) => text.includes(w))

/**
 * Señales de alarma: ante la duda, Kitty deriva a urgencias. Es preferible
 * una derivación de más que una de menos.
 */
function isRedFlag(t: string): boolean {
  const bleeding = has(t, ['sangr', 'hemorrag'])
  const heavy = has(t, ['abundant', 'mucho', 'muchisim', 'harto', 'empap', 'chorro', 'coagulo', 'no para', 'no se detiene', 'cada hora', 'por hora'])
  const fever = has(t, ['fiebre', 'temperatura'])
  const high = /\b(38|39|40)\b/.test(t) || has(t, ['fiebre alta', 'mucha fiebre'])
  const pain = has(t, ['dolor', 'duele'])
  const severe = has(t, ['intens', 'fuerte', 'insoport', 'horrible', 'no se pasa', 'no cede', 'no me deja', 'muy mal'])
  return (
    (bleeding && heavy) ||
    (fever && high) ||
    (pain && severe) ||
    has(t, ['mal olor', 'hediond', 'desmay', 'perdi el conocimiento', 'me voy a desmayar'])
  )
}

const URGENT: BotReply = {
  urgent: true,
  text:
    '🔴 **Esto puede ser una señal de alarma.**\n\n' +
    'Acude a un servicio de urgencias o llama al **131 (SAMU)**. Si puedes, avisa también a tu equipo de salud.\n\n' +
    'No esperes a ver si pasa. 💜',
  actions: [{ label: '📞 Llamar al 131', href: 'tel:131' }],
}

function score(text: string, tokens: string[], keys: string[]): number {
  let total = 0
  for (const key of keys) {
    if (key.includes(' ')) {
      if (text.includes(key)) total += 3
    } else if (key.length <= 4) {
      // Claves cortas solo con palabra exacta (evita «pap» en «papel»).
      if (tokens.includes(key)) total += 1.5
    } else if (tokens.some((tk) => tk.startsWith(key))) {
      total += 1 + Math.min(key.length, 10) / 20
    }
  }
  return total
}

/** Elige la mejor respuesta de la base de conocimiento. */
export function reply(question: string, audience: Audience): BotReply {
  const t = normalize(question)
  if (!t) return { text: '¿Me cuentas tu duda? 🐾' }
  if (isRedFlag(t)) return URGENT

  const tokens = t.split(' ')
  let best: { s: number; i: number } = { s: 0, i: -1 }
  ENTRIES.forEach((e, i) => {
    if (e.only && e.only !== audience) return
    const s = score(t, tokens, e.keys)
    if (s > best.s) best = { s, i }
  })

  if (best.i === -1 || best.s < 1) {
    return {
      unknown: true,
      text:
        audience === 'app'
          ? 'Mmm… 🐾 no tengo una respuesta segura para eso, y prefiero no adivinar sobre tu salud.\n\nPuedo guardar tu pregunta para tu próximo control o puedes escribirle a tu equipo.'
          : 'Mmm… 🐾 todavía no sé responder eso.\n\nPrueba preguntándome por el proyecto, el semáforo o el VPH, o revisa las secciones del sitio.',
      actions:
        audience === 'app'
          ? [{ label: '📝 Guardar en Mis preguntas', save: true }, { label: '💬 Escribir a mi equipo', href: '#/paciente/chat' }]
          : [{ label: '¿Qué es Cérvix-B?', ask: '¿Qué es Cérvix-B?' }, { label: 'Probar la app', href: './app/' }],
    }
  }
  const e = ENTRIES[best.i]
  return { text: e.text, actions: e.actions?.[audience] }
}

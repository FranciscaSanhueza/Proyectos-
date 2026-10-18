import { useNavigate } from 'react-router-dom'
import type { Story } from '../../components/Stories'
import { ShareButtons } from '../../components/ShareButtons'
import { MOODS } from '../../components/MoodPicker'
import { affirmations, dailyTips, mythQuiz } from '../../data/mock'
import { LEVEL_INFO, currentLevel, toDayKey } from '../../utils'
import { usePatient } from './usePatient'

const DAY = 24 * 60 * 60 * 1000

/** Datos de los últimos 7 días para «Tu semana» (como Spotify Wrapped). */
export function useWeekSummary() {
  const { patient, patientId, plan, responses, checkIns, careLogs, symptomLogs } = usePatient()
  const days = Array.from({ length: 7 }, (_, k) => toDayKey(new Date(Date.now() - k * DAY)))
  const level = currentLevel(responses, patientId, symptomLogs)
  const moods = checkIns.filter((c) => c.patientId === patientId && days.includes(c.date)).map((c) => c.mood)
  const moodAvg = moods.length ? moods.reduce((a, b) => a + b, 0) / moods.length : null
  const careRate = plan.cares.length
    ? Math.round(
        (days.reduce((n, d) => n + (careLogs.find((l) => l.patientId === patientId && l.date === d)?.done.filter((c) => plan.cares.includes(c)).length ?? 0), 0) /
          (plan.cares.length * days.length)) *
          100,
      )
    : 0
  const controlIn = Math.max(0, Math.ceil((new Date(plan.nextControl).getTime() - Date.now()) / DAY))
  const moodFace = moodAvg ? MOODS[Math.round(moodAvg) - 1] : null
  const shareText =
    `Mi semana en Cérvix-B 💜\n` +
    `• Semáforo: ${LEVEL_INFO[level].title}\n` +
    `• Cuidados cumplidos: ${careRate}%\n` +
    (moodFace ? `• Ánimo: ${moodFace.emoji} ${moodFace.label} (registrado ${moods.length} de 7 días)\n` : '') +
    `• Faltan ${controlIn} días para mi control\n` +
    `¡Gracias por acompañarme! 🌷`
  return { firstName: patient.name.split(' ')[0], level, moods, moodFace, careRate, controlIn, shareText }
}

export function useWeekStory(): Story {
  const w = useWeekSummary()
  return {
    id: 'semana',
    label: 'Tu semana',
    emoji: '✨',
    slides: [
      { tone: 'noche', emoji: '✨', eyebrow: 'Tu semana en Cérvix-B', title: `${w.firstName}, mira todo lo que hiciste por ti`, text: 'Un resumen de tus últimos 7 días.' },
      {
        tone: w.level === 'rojo' ? 'rosa' : w.level === 'amarillo' ? 'durazno' : 'menta',
        eyebrow: 'Tu semáforo',
        big: LEVEL_INFO[w.level].title,
        title: LEVEL_INFO[w.level].message,
        text: w.level === 'verde' ? 'Tu recuperación va como se espera. ¡Sigue así!' : 'Tu equipo de salud está atento a ti.',
      },
      { tone: 'lavanda', eyebrow: 'Tus cuidados', big: `${w.careRate}%`, title: 'de tus cuidados cumplidos', text: w.careRate >= 70 ? '¡Excelente constancia! 🌸' : 'Cada cuidado cuenta: márcalos en Mi plan.' },
      w.moodFace
        ? { tone: 'cielo', eyebrow: 'Tu ánimo', big: w.moodFace.emoji, title: `Te has sentido «${w.moodFace.label.toLowerCase()}»`, text: `Registraste cómo te sientes ${w.moods.length} de 7 días.` }
        : { tone: 'cielo', eyebrow: 'Tu ánimo', big: '💭', title: 'Cuéntanos cómo te sientes', text: 'Marca tu ánimo cada día en el Inicio.' },
      { tone: 'durazno', eyebrow: 'Tu próximo control', big: String(w.controlIn), title: w.controlIn === 1 ? 'día para tu control' : 'días para tu control', text: 'Anota tus dudas en «Mis preguntas» para no olvidarlas.' },
      {
        tone: 'rosa',
        emoji: '💌',
        title: '¿Quieres contarle a alguien?',
        text: 'Comparte tu avance con tu pareja o tu familia.',
        footer: <ShareButtons title="Mi semana en Cérvix-B" text={w.shareText} light />,
      },
    ],
  }
}

/** Historias del día para el Inicio (como Instagram). */
export function useDailyStories(): Story[] {
  const navigate = useNavigate()
  const week = useWeekStory()
  const n = Math.floor(Date.now() / DAY)
  const tip = dailyTips[n % dailyTips.length]
  const tip2 = dailyTips[(n + 3) % dailyTips.length]
  const myth = mythQuiz[n % mythQuiz.length]
  const phrase = affirmations[n % affirmations.length]

  return [
    {
      id: 'consejo',
      label: 'Consejo',
      emoji: '💡',
      slides: [
        { tone: 'menta', emoji: tip.emoji, eyebrow: 'Consejo del día', title: tip.title, text: tip.text },
        { tone: 'cielo', emoji: tip2.emoji, eyebrow: 'Otro consejo', title: tip2.title, text: tip2.text },
      ],
    },
    {
      id: 'mito',
      label: '¿Mito?',
      emoji: '🤔',
      slides: [
        { tone: 'lavanda', emoji: '🤔', eyebrow: '¿Mito o verdad?', title: `“${myth.statement}”`, text: 'Piénsalo… toca a la derecha para ver la respuesta.' },
        {
          tone: myth.truth ? 'menta' : 'rosa',
          emoji: myth.truth ? '✅' : '❌',
          eyebrow: 'Respuesta',
          title: myth.truth ? 'Es verdad' : 'Es un mito',
          text: myth.explain,
          footer: (
            <button className="btn btn--white btn--block" onClick={() => navigate('/paciente/aprende')}>
              Jugar más en Aprende
            </button>
          ),
        },
      ],
    },
    week,
    {
      id: 'animo',
      label: 'Ánimo',
      emoji: '💜',
      slides: [
        {
          tone: 'rosa',
          emoji: '🌷',
          eyebrow: 'Frase del día',
          title: phrase,
          text: 'Repítela en voz alta. Te la mereces.',
          footer: (
            <button className="btn btn--white btn--block" onClick={() => navigate('/paciente/calma')}>
              Ir al Rincón de calma
            </button>
          ),
        },
      ],
    },
  ]
}

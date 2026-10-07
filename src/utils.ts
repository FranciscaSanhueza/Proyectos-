import type { Level, RecoveryPlan, SurveyQuestion, SurveyResponse } from './types'

const dateFmt = new Intl.DateTimeFormat('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })
const longDateFmt = new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })
const timeFmt = new Intl.DateTimeFormat('es-CL', { hour: '2-digit', minute: '2-digit' })

export const formatDate = (iso: string) => dateFmt.format(new Date(iso))
export const formatShortDate = (iso: string) => longDateFmt.format(new Date(iso))
export const formatTime = (iso: string) => timeFmt.format(new Date(iso))
export const formatDateTime = (iso: string) => `${formatDate(iso)} · ${formatTime(iso)}`

/** Fecha local en formato YYYY-MM-DD (sin desfase por zona horaria). */
export const toDayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const initials = (name: string) =>
  name
    .replace(/^(Dra?\.|Mat\.)\s+/, '')
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()

export const normalizeRut = (rut: string) => rut.replace(/[^0-9kK]/g, '').toUpperCase()

// ---- Semáforo ----

const LEVEL_RANK: Record<Level, number> = { verde: 0, amarillo: 1, rojo: 2 }

export const worstLevel = (levels: Level[]): Level =>
  levels.reduce<Level>((worst, l) => (LEVEL_RANK[l] > LEVEL_RANK[worst] ? l : worst), 'verde')

export const levelFromAnswers = (questions: SurveyQuestion[], answers: Record<string, number>): Level =>
  worstLevel(
    questions.flatMap((q) => {
      const level = q.options[answers[q.id]]?.level
      return level ? [level] : []
    }),
  )

export const LEVEL_INFO: Record<Level, { title: string; message: string; emoji: string }> = {
  verde: { title: 'Verde', message: 'Síntomas esperados. Sigue tu plan.', emoji: '🙂' },
  amarillo: { title: 'Amarillo', message: 'Contacta a tu equipo de salud.', emoji: '😐' },
  rojo: { title: 'Rojo', message: 'Acude a urgencias inmediatamente.', emoji: '☹️' },
}

// ---- Encuesta semanal ----

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

export const latestResponse = (responses: SurveyResponse[], patientId: string) =>
  responses
    .filter((r) => r.patientId === patientId)
    .sort((a, b) => b.at.localeCompare(a.at))[0]

/** Estado de la encuesta: disponible si no se ha respondido en los últimos 7 días. */
export const surveyStatus = (responses: SurveyResponse[], patientId: string) => {
  const last = latestResponse(responses, patientId)
  if (!last) return { available: true, next: null as Date | null, last }
  const next = new Date(new Date(last.at).getTime() + WEEK_MS)
  return { available: next.getTime() <= Date.now(), next, last }
}

/** Nivel actual del semáforo: el de la última encuesta respondida (verde si no hay). */
export const currentLevel = (responses: SurveyResponse[], patientId: string): Level =>
  latestResponse(responses, patientId)?.level ?? 'verde'

/** Semana de recuperación (1, 2, …) contada desde el procedimiento. */
export const recoveryWeek = (plan: RecoveryPlan) =>
  Math.max(1, Math.floor((Date.now() - new Date(plan.procedureDate).getTime()) / WEEK_MS) + 1)

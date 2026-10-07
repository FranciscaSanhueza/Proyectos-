export type Role = 'paciente' | 'medico'

/** Niveles del semáforo de síntomas. */
export type Level = 'verde' | 'amarillo' | 'rojo'

export interface Patient {
  id: string
  name: string
  rut: string
  /** Código que entrega el médico en la consulta/alta para activar la app. */
  code: string
  age: number
  phone: string
  email?: string
  /** Etiquetas libres que define el médico (p. ej. «Primera conización»). */
  tags: string[]
  /** Notas privadas del equipo médico (la paciente no las ve). */
  notes: string
  /** En seguimiento o dada de alta. */
  status: 'activa' | 'alta'
  /** Prioridad de seguimiento que elige el médico. */
  priority: 'normal' | 'alta'
}

export interface StaffMember {
  id: string
  name: string
  role: string
}

/** Plan de recuperación personalizado, elaborado y validado por el médico. */
export interface RecoveryPlan {
  patientId: string
  procedure: string
  diagnosis: string
  procedureDate: string // ISO
  nextControl: string // ISO
  cares: string[] // Cuidados de hoy
  warnings: string[] // Cuándo consultar
  validated: boolean
  validatedBy: string
  updatedAt: string // ISO
}

export interface Message {
  id: string
  patientId: string
  staffId: string
  from: Role
  text: string
  at: string // ISO
  read: boolean
}

export interface SurveyOption {
  label: string
  level?: Level // Opciones sin nivel no afectan el semáforo
  /** Intensidad 0–3 para la escala visual y el gráfico de evolución. */
  intensity: number
}

export type SurveyIcon = 'sangrado' | 'dolor' | 'fiebre' | 'flujo' | 'plan' | 'animo'

export interface SurveyQuestion {
  id: SurveyIcon
  text: string
  help?: string
  options: SurveyOption[]
}

export interface SurveyResponse {
  id: string
  patientId: string
  at: string // ISO
  answers: Record<string, number> // id pregunta -> índice opción
  comment: string
  level: Level
}

export type ReminderKind = 'control' | 'medicamento' | 'cuidado' | 'encuesta'

export interface Reminder {
  id: string
  patientId: string
  date: string // YYYY-MM-DD
  time?: string // HH:MM
  title: string
  kind: ReminderKind
  createdBy: Role
}

/** Guía de síntomas validada por especialistas. */
export interface SymptomGuide {
  symptom: string
  level: Level
  advice: string
}

/** Aviso al equipo médico cuando una encuesta da amarillo o rojo. */
export interface Alert {
  id: string
  patientId: string
  level: Exclude<Level, 'verde'>
  at: string // ISO
  reviewed: boolean
}

export type TextSize = 'normal' | 'grande' | 'muy-grande'

export type Theme = 'lavanda' | 'rosa' | 'menta'

/** Check-in diario de ánimo (1 = muy mal … 5 = muy bien). */
export interface CheckIn {
  patientId: string
  date: string // YYYY-MM-DD
  mood: 1 | 2 | 3 | 4 | 5
}

/** Cuidados del plan marcados como hechos en un día. */
export interface CareLog {
  patientId: string
  date: string // YYYY-MM-DD
  done: string[] // textos de los cuidados cumplidos
}

/** Pregunta que la paciente quiere hacer en su próximo control. */
export interface PatientQuestion {
  id: string
  patientId: string
  text: string
  at: string // ISO
  answered: boolean
}

/** Preferencias del dispositivo (accesibilidad y notificaciones). */
export interface Prefs {
  textSize: TextSize
  theme: Theme
  /** Reduce animaciones (además de la preferencia del sistema). */
  calmMotion: boolean
  notifications: boolean
  /** Claves de avisos ya mostrados, para no repetirlos. */
  notified: string[]
}

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
}

export interface SurveyQuestion {
  id: string
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

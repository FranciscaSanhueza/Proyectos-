import type {
  Message,
  Patient,
  RecoveryPlan,
  Reminder,
  StaffMember,
  SurveyQuestion,
  SurveyResponse,
  SymptomGuide,
} from '../types'

// Datos de ejemplo para el prototipo. Los contenidos clínicos (preguntas,
// umbrales del semáforo y guía de síntomas) son referenciales y deben ser
// revisados y validados por el equipo médico antes de usarse con pacientes.

const daysFromNow = (d: number, h = 10, m = 0) => {
  const date = new Date()
  date.setDate(date.getDate() + d)
  date.setHours(h, m, 0, 0)
  return date.toISOString()
}

const dayKey = (d: number) => daysFromNow(d).slice(0, 10)

export const staff: StaffMember[] = [
  { id: 'd1', name: 'Dra. Camila Rojas', role: 'Ginecóloga tratante' },
  { id: 'd2', name: 'Mat. Fernanda Pérez', role: 'Matrona' },
]

/** Profesional que usa la vista médico en el prototipo. */
export const currentDoctor = staff[0]

export const patients: Patient[] = [
  { id: 'p1', name: 'María González', rut: '12.345.678-9', code: 'CERVIX1', age: 34, phone: '+56 9 1234 5678' },
  { id: 'p2', name: 'Javiera Muñoz', rut: '15.432.198-K', code: 'CERVIX2', age: 41, phone: '+56 9 8765 4321' },
  { id: 'p3', name: 'Daniela Soto', rut: '19.876.543-2', code: 'CERVIX3', age: 28, phone: '+56 9 5555 1212' },
]

const defaultCares = [
  'Descanso relativo',
  'Evitar esfuerzo intenso y levantar peso',
  'No usar tampones ni tener relaciones sexuales por 4 semanas',
  'Ducha diaria; evitar tina y piscina',
  'Observar sangrado o flujo',
  'Registrar síntomas en la encuesta semanal',
]

const defaultWarnings = [
  'Dolor intenso que no cede con analgésicos',
  'Fiebre sobre 38 °C',
  'Sangrado abundante (más que una regla)',
  'Flujo con mal olor',
]

export const initialPlans: RecoveryPlan[] = [
  {
    patientId: 'p1',
    procedure: 'Conización cervical (LEEP)',
    diagnosis: 'Lesión precancerosa · NIE III',
    procedureDate: daysFromNow(-6),
    nextControl: daysFromNow(24, 9, 30),
    cares: defaultCares,
    warnings: defaultWarnings,
    validated: true,
    validatedBy: 'Dra. Camila Rojas',
    updatedAt: daysFromNow(-6),
  },
  {
    patientId: 'p2',
    procedure: 'Conización cervical (LEEP)',
    diagnosis: 'Lesión precancerosa · NIE II',
    procedureDate: daysFromNow(-15),
    nextControl: daysFromNow(12, 11),
    cares: defaultCares,
    warnings: defaultWarnings,
    validated: true,
    validatedBy: 'Dra. Camila Rojas',
    updatedAt: daysFromNow(-15),
  },
  {
    patientId: 'p3',
    procedure: 'Biopsia por colposcopía',
    diagnosis: 'En estudio · VPH alto riesgo',
    procedureDate: daysFromNow(-2),
    nextControl: daysFromNow(20, 10),
    cares: ['Descanso relativo por 24 h', 'No usar tampones por 1 semana', 'Observar sangrado'],
    warnings: defaultWarnings,
    validated: false,
    validatedBy: '',
    updatedAt: daysFromNow(-2),
  },
]

export const surveyQuestions: SurveyQuestion[] = [
  {
    id: 'sangrado',
    text: '¿Has tenido sangrado vaginal esta semana?',
    options: [
      { label: 'No', level: 'verde' },
      { label: 'Leve o manchado', level: 'verde' },
      { label: 'Moderado, como una regla', level: 'amarillo' },
      { label: 'Abundante (empapo más de una toalla por hora)', level: 'rojo' },
    ],
  },
  {
    id: 'dolor',
    text: '¿Has sentido dolor en la parte baja del abdomen?',
    options: [
      { label: 'No', level: 'verde' },
      { label: 'Leve, se pasa con analgésico', level: 'verde' },
      { label: 'Moderado y persistente', level: 'amarillo' },
      { label: 'Intenso, no se pasa con analgésico', level: 'rojo' },
    ],
  },
  {
    id: 'fiebre',
    text: '¿Has tenido fiebre?',
    help: 'Si puedes, mide tu temperatura con un termómetro.',
    options: [
      { label: 'No', level: 'verde' },
      { label: 'Entre 37,5 °C y 38 °C', level: 'amarillo' },
      { label: 'Sobre 38 °C', level: 'rojo' },
    ],
  },
  {
    id: 'flujo',
    text: '¿Cómo ha sido tu flujo vaginal?',
    options: [
      { label: 'Normal o café oscuro (es esperable)', level: 'verde' },
      { label: 'Amarillento o más abundante de lo normal', level: 'amarillo' },
      { label: 'Con mal olor', level: 'rojo' },
    ],
  },
  {
    id: 'plan',
    text: '¿Has podido seguir los cuidados de tu plan?',
    options: [{ label: 'Sí, todos' }, { label: 'Algunos' }, { label: 'No he podido' }],
  },
  {
    id: 'animo',
    text: '¿Cómo te has sentido emocionalmente?',
    options: [{ label: 'Tranquila' }, { label: 'Algo preocupada' }, { label: 'Muy preocupada o angustiada' }],
  },
]

export const initialResponses: SurveyResponse[] = [
  {
    id: 'sr1',
    patientId: 'p2',
    at: daysFromNow(-1, 20),
    answers: { sangrado: 2, dolor: 1, fiebre: 0, flujo: 1, plan: 1, animo: 1 },
    comment: 'El sangrado aumentó un poco desde ayer.',
    level: 'amarillo',
  },
  {
    id: 'sr2',
    patientId: 'p2',
    at: daysFromNow(-8, 19),
    answers: { sangrado: 1, dolor: 1, fiebre: 0, flujo: 0, plan: 0, animo: 0 },
    comment: '',
    level: 'verde',
  },
  {
    id: 'sr3',
    patientId: 'p3',
    at: daysFromNow(-1, 12),
    answers: { sangrado: 1, dolor: 0, fiebre: 0, flujo: 0, plan: 0, animo: 1 },
    comment: '',
    level: 'verde',
  },
]

export const symptomGuide: SymptomGuide[] = [
  { symptom: 'Flujo café oscuro o con restos', level: 'verde', advice: 'Es esperable las primeras semanas. Sigue tu plan.' },
  { symptom: 'Sangrado leve o manchado', level: 'verde', advice: 'Es normal hasta 2–3 semanas después del procedimiento.' },
  { symptom: 'Dolor leve tipo cólico', level: 'verde', advice: 'Puedes usar el analgésico indicado en tu plan.' },
  { symptom: 'Sangrado como una regla', level: 'amarillo', advice: 'Contacta a tu equipo de salud por el chat o teléfono.' },
  { symptom: 'Flujo amarillento o abundante', level: 'amarillo', advice: 'Contacta a tu equipo de salud para evaluar una infección.' },
  { symptom: 'Temperatura entre 37,5 y 38 °C', level: 'amarillo', advice: 'Controla tu temperatura y avisa a tu equipo de salud.' },
  { symptom: 'Sangrado abundante', level: 'rojo', advice: 'Acude a urgencias inmediatamente.' },
  { symptom: 'Fiebre sobre 38 °C', level: 'rojo', advice: 'Acude a urgencias inmediatamente.' },
  { symptom: 'Dolor intenso que no cede', level: 'rojo', advice: 'Acude a urgencias inmediatamente.' },
  { symptom: 'Flujo con mal olor', level: 'rojo', advice: 'Acude a urgencias: puede ser una infección.' },
]

export const initialMessages: Message[] = [
  { id: 'm1', patientId: 'p1', staffId: 'd1', from: 'medico', text: 'Hola María, el procedimiento salió muy bien. Tu plan de recuperación ya está en la app.', at: daysFromNow(-6, 13), read: true },
  { id: 'm2', patientId: 'p1', staffId: 'd1', from: 'paciente', text: 'Gracias doctora. Tengo sangrado leve, ¿este síntoma es verde, amarillo o rojo?', at: daysFromNow(-2, 11, 40), read: true },
  { id: 'm3', patientId: 'p1', staffId: 'd1', from: 'medico', text: 'Es verde 💚: un sangrado leve es esperable las primeras semanas. Si aumenta a más que una regla, pasa a rojo y debes ir a urgencias.', at: daysFromNow(-1, 8, 5), read: false },
  { id: 'm4', patientId: 'p1', staffId: 'd2', from: 'medico', text: 'Hola María, soy Fernanda, la matrona. Cualquier duda sobre tus cuidados puedes escribirme aquí.', at: daysFromNow(-5, 10), read: true },
  { id: 'm5', patientId: 'p2', staffId: 'd1', from: 'paciente', text: 'Doctora, el sangrado aumentó un poco, ¿debo preocuparme?', at: daysFromNow(0, 7, 50), read: false },
  { id: 'm6', patientId: 'p3', staffId: 'd1', from: 'paciente', text: '¿Cuándo estará el resultado de la biopsia?', at: daysFromNow(-1, 19, 20), read: false },
]

export const initialReminders: Reminder[] = [
  { id: 'r1', patientId: 'p1', date: dayKey(0), time: '09:00', title: 'Paracetamol 500 mg si hay dolor', kind: 'medicamento', createdBy: 'medico' },
  { id: 'r2', patientId: 'p1', date: dayKey(1), title: 'Responder encuesta semanal', kind: 'encuesta', createdBy: 'medico' },
  { id: 'r3', patientId: 'p1', date: dayKey(8), title: 'Encuesta semanal', kind: 'encuesta', createdBy: 'medico' },
  { id: 'r4', patientId: 'p1', date: dayKey(22), title: 'Retomar actividad física suave', kind: 'cuidado', createdBy: 'medico' },
  { id: 'r5', patientId: 'p1', date: dayKey(24), time: '09:30', title: 'Control post conización', kind: 'control', createdBy: 'medico' },
  { id: 'r6', patientId: 'p2', date: dayKey(12), time: '11:00', title: 'Control post conización', kind: 'control', createdBy: 'medico' },
  { id: 'r7', patientId: 'p3', date: dayKey(20), time: '10:00', title: 'Entrega resultado biopsia', kind: 'control', createdBy: 'medico' },
]

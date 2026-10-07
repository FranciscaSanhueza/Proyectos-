import type {
  Message,
  Patient,
  RecoveryPlan,
  Reminder,
  StaffMember,
  SurveyQuestion,
  Alert,
  CheckIn,
  PatientQuestion,
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

export const initialPatients: Patient[] = [
  { id: 'p1', name: 'María González', rut: '12.345.678-9', code: 'CERVIX1', age: 34, phone: '+56 9 1234 5678', email: 'maria.gonzalez@correo.cl', tags: ['Primera conización'], notes: 'Muy ansiosa con el resultado de la biopsia. Reforzar contención en el control.', status: 'activa', priority: 'normal' },
  { id: 'p2', name: 'Javiera Muñoz', rut: '15.432.198-K', code: 'CERVIX2', age: 41, phone: '+56 9 8765 4321', tags: ['Sangrado aumentado'], notes: '', status: 'activa', priority: 'alta' },
  { id: 'p3', name: 'Daniela Soto', rut: '19.876.543-2', code: 'CERVIX3', age: 28, phone: '+56 9 5555 1212', tags: ['Biopsia en estudio'], notes: 'Desea embarazo a futuro: conversar en control.', status: 'activa', priority: 'normal' },
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
    procedureDate: daysFromNow(-20),
    nextControl: daysFromNow(24, 9, 30),
    cares: defaultCares,
    warnings: defaultWarnings,
    validated: true,
    validatedBy: 'Dra. Camila Rojas',
    updatedAt: daysFromNow(-20),
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
    help: 'Piensa en cuántas toallas higiénicas has necesitado.',
    options: [
      { label: 'No', level: 'verde', intensity: 0 },
      { label: 'Leve o manchado (manchas la toalla)', level: 'verde', intensity: 1 },
      { label: 'Moderado, como una regla', level: 'amarillo', intensity: 2 },
      { label: 'Abundante (empapo más de una toalla por hora)', level: 'rojo', intensity: 3 },
    ],
  },
  {
    id: 'dolor',
    text: '¿Has sentido dolor en la parte baja del abdomen?',
    options: [
      { label: 'No', level: 'verde', intensity: 0 },
      { label: 'Leve, se pasa con analgésico', level: 'verde', intensity: 1 },
      { label: 'Moderado y persistente', level: 'amarillo', intensity: 2 },
      { label: 'Intenso, no se pasa con analgésico', level: 'rojo', intensity: 3 },
    ],
  },
  {
    id: 'fiebre',
    text: '¿Has tenido fiebre?',
    help: 'Si puedes, mide tu temperatura con un termómetro.',
    options: [
      { label: 'No (menos de 37,5 °C)', level: 'verde', intensity: 0 },
      { label: 'Entre 37,5 °C y 38 °C', level: 'amarillo', intensity: 2 },
      { label: 'Sobre 38 °C', level: 'rojo', intensity: 3 },
    ],
  },
  {
    id: 'flujo',
    text: '¿Cómo ha sido tu flujo vaginal?',
    options: [
      { label: 'Normal o café oscuro (es esperable)', level: 'verde', intensity: 0 },
      { label: 'Amarillento o más abundante de lo normal', level: 'amarillo', intensity: 2 },
      { label: 'Con mal olor', level: 'rojo', intensity: 3 },
    ],
  },
  {
    id: 'plan',
    text: '¿Has podido seguir los cuidados de tu plan?',
    options: [
      { label: 'Sí, todos', intensity: 0 },
      { label: 'Algunos', intensity: 1 },
      { label: 'No he podido', intensity: 3 },
    ],
  },
  {
    id: 'animo',
    text: '¿Cómo te has sentido emocionalmente?',
    options: [
      { label: 'Tranquila', intensity: 0 },
      { label: 'Algo preocupada', intensity: 1 },
      { label: 'Muy preocupada o angustiada', intensity: 3 },
    ],
  },
]

/** Índice de la opción "Muy preocupada" en la pregunta de ánimo. */
export const HIGH_WORRY = 2

export const initialResponses: SurveyResponse[] = [
  {
    id: 'sp1',
    patientId: 'p1',
    at: daysFromNow(-15, 21),
    answers: { sangrado: 2, dolor: 1, fiebre: 0, flujo: 0, plan: 1, animo: 2 },
    comment: 'Estoy nerviosa por el resultado de la biopsia.',
    level: 'amarillo',
  },
  {
    id: 'sp2',
    patientId: 'p1',
    at: daysFromNow(-8, 20),
    answers: { sangrado: 1, dolor: 1, fiebre: 0, flujo: 0, plan: 0, animo: 1 },
    comment: '',
    level: 'verde',
  },
  {
    id: 'sr0',
    patientId: 'p2',
    at: daysFromNow(-15, 18),
    answers: { sangrado: 1, dolor: 2, fiebre: 0, flujo: 0, plan: 0, animo: 2 },
    comment: 'Me preocupa no saber si es normal.',
    level: 'amarillo',
  },
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
  { id: 'm1', patientId: 'p1', staffId: 'd1', from: 'medico', text: 'Hola María, el procedimiento salió muy bien. Tu plan de recuperación ya está en la app.', at: daysFromNow(-20, 13), read: true },
  { id: 'm2', patientId: 'p1', staffId: 'd1', from: 'paciente', text: 'Gracias doctora. Tengo sangrado leve, ¿este síntoma es verde, amarillo o rojo?', at: daysFromNow(-2, 11, 40), read: true },
  { id: 'm3', patientId: 'p1', staffId: 'd1', from: 'medico', text: 'Es verde 💚: un sangrado leve es esperable las primeras semanas. Si aumenta a más que una regla, pasa a rojo y debes ir a urgencias.', at: daysFromNow(-1, 8, 5), read: false },
  { id: 'm4', patientId: 'p1', staffId: 'd2', from: 'medico', text: 'Hola María, soy Fernanda, la matrona. Cualquier duda sobre tus cuidados puedes escribirme aquí.', at: daysFromNow(-19, 10), read: true },
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

export const initialAlerts: Alert[] = [
  { id: 'al1', patientId: 'p2', level: 'amarillo', at: daysFromNow(-1, 20), reviewed: false },
]

export const initialCheckIns: CheckIn[] = [
  { patientId: 'p1', date: dayKey(-3), mood: 3 },
  { patientId: 'p1', date: dayKey(-2), mood: 4 },
  { patientId: 'p1', date: dayKey(-1), mood: 4 },
]

export const initialQuestions: PatientQuestion[] = [
  { id: 'q1', patientId: 'p1', text: '¿Cuándo puedo volver a hacer ejercicio?', at: daysFromNow(-3), answered: false },
  { id: 'q2', patientId: 'p1', text: '¿Cuándo tendré el resultado de la biopsia?', at: daysFromNow(-2), answered: false },
]

/** Hitos típicos de la recuperación (días desde el procedimiento). Referenciales: cada plan lo ajusta el médico. */
export const recoveryMilestones = [
  { day: 0, title: 'Procedimiento', detail: 'Hoy diste un paso importante para cuidar tu salud.' },
  { day: 1, title: 'Primeros días de reposo', detail: 'Descanso relativo. Es normal un poco de dolor tipo cólico y flujo café.' },
  { day: 7, title: 'Primera semana', detail: 'El flujo café o con restos es esperable. Responde tu primera encuesta.' },
  { day: 12, title: 'Cicatrización', detail: 'Cerca del día 10–14 puede aumentar un poco el sangrado al desprenderse la costra. Si es abundante, es rojo.' },
  { day: 28, title: 'Cuatro semanas', detail: 'Según indique tu médico, podrás retomar relaciones sexuales, tampones y piscina.' },
  { day: 42, title: 'Control y resultado', detail: 'Revisarán el resultado de la biopsia y tu evolución.' },
  { day: 180, title: 'Control a los 6 meses', detail: 'Seguimiento con PAP y/o test de VPH para confirmar que todo va bien.' },
]

export const learnCards = [
  {
    id: 'vph',
    emoji: '🦠',
    title: '¿Qué es el VPH?',
    body: 'El virus papiloma humano es muy común: la mayoría de las personas lo tendrá alguna vez. Casi siempre el cuerpo lo elimina solo en 1–2 años. Algunos tipos, si persisten, pueden causar cambios en el cuello del útero.',
  },
  {
    id: 'nie',
    emoji: '🔬',
    title: '¿Qué es una lesión precancerosa?',
    body: 'Son cambios en las células del cuello del útero (también llamados NIE o CIN). No son cáncer: se tratan justamente para evitar que algún día lo sean.',
  },
  {
    id: 'cono',
    emoji: '🩺',
    title: '¿Qué es la conización?',
    body: 'Es un procedimiento breve en que se retira la zona del cuello del útero con células alteradas. Esa muestra se analiza (biopsia) para confirmar que se sacó toda la lesión.',
  },
  {
    id: 'recup',
    emoji: '🌱',
    title: '¿Qué es normal en la recuperación?',
    body: 'Flujo café o con restos, sangrado leve y un poco de dolor tipo cólico durante algunas semanas. Revisa tu semáforo si algo te preocupa.',
  },
  {
    id: 'control',
    emoji: '📅',
    title: '¿Por qué son importantes los controles?',
    body: 'Los controles con PAP y test de VPH confirman que la lesión no vuelve. Asistir a ellos es la mejor forma de cuidarte.',
  },
]

export const mythQuiz = [
  {
    statement: 'Tener VPH significa que tendré cáncer.',
    truth: false,
    explain: 'La mayoría de las infecciones por VPH se eliminan solas. Las lesiones se tratan para prevenir el cáncer.',
  },
  {
    statement: 'Es normal tener flujo café algunas semanas después de la conización.',
    truth: true,
    explain: 'Es parte de la cicatrización. Si tiene mal olor o hay fiebre, consulta.',
  },
  {
    statement: 'Después de una conización no podré tener hijos.',
    truth: false,
    explain: 'La mayoría de las mujeres puede embarazarse después. Si lo estás planeando, conversa con tu médico sobre los cuidados.',
  },
  {
    statement: 'Solo las personas con muchas parejas sexuales tienen VPH.',
    truth: false,
    explain: 'El VPH es muy común y puede transmitirse incluso con una sola pareja. No es motivo de culpa.',
  },
  {
    statement: 'Debo seguir yendo a mis controles aunque me sienta bien.',
    truth: true,
    explain: 'Los controles detectan a tiempo si la lesión vuelve, aunque no haya síntomas.',
  },
  {
    statement: 'El condón protege 100% contra el VPH.',
    truth: false,
    explain: 'Reduce mucho el riesgo, pero no lo elimina porque el virus está en la piel de la zona genital.',
  },
]

export const affirmations = [
  'Mi cuerpo está sanando, un día a la vez.',
  'Pedir ayuda también es cuidarme.',
  'Hice lo correcto al tratarme a tiempo.',
  'Está bien sentir miedo; no estoy sola.',
  'Cada control es un acto de amor propio.',
  'Respiro, me suelto y confío en mi proceso.',
]

/** Plan inicial para una paciente nueva (el médico lo ajusta y valida). */
export const newPlan = (patientId: string, procedure: string, diagnosis: string, procedureDate: string): RecoveryPlan => {
  const control = new Date(procedureDate)
  control.setDate(control.getDate() + 42)
  return {
    patientId,
    procedure,
    diagnosis,
    procedureDate,
    nextControl: control.toISOString(),
    cares: defaultCares,
    warnings: defaultWarnings,
    validated: false,
    validatedBy: '',
    updatedAt: new Date().toISOString(),
  }
}

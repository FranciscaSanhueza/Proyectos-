// Base de conocimiento de Copito.
//
// Contenido referencial, coherente con la app y los informes del equipo.
// Debe ser revisado por profesionales de salud antes de usarse con pacientes
// reales. Copito no diagnostica: orienta y deriva al equipo de salud.

export type Audience = 'sitio' | 'app'

export interface BotAction {
  label: string
  /** Enlace (en la app, rutas tipo «#/paciente/semaforo»). */
  href?: string
  /** Envía esta pregunta a Copito. */
  ask?: string
  /** Guarda la pregunta en «Mis preguntas» (solo app). */
  save?: boolean
}

export interface Entry {
  id: string
  /** Raíces o frases (sin tildes, en minúscula). Las frases valen más. */
  keys: string[]
  text: string
  actions?: Partial<Record<Audience, BotAction[]>>
  /** Si se define, la respuesta solo existe en ese contexto. */
  only?: Audience
}

const APP = (path: string) => `#/paciente/${path}`

export const ENTRIES: Entry[] = [
  // ---------- Conversación ----------
  {
    id: 'hola',
    keys: ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'holi', 'hey', 'alo'],
    text: '¡Miau! 🐾 Hola, soy **Copito**. Pregúntame sobre tu recuperación, el VPH o cómo usar Cérvix-B.',
  },
  {
    id: 'quien',
    keys: ['quien eres', 'que eres', 'como te llamas', 'tu nombre', 'eres un bot', 'eres real', 'copito'],
    text: 'Soy **Copito**, el gatito de Cérvix-B 🐱. Respondo dudas frecuentes con información referencial. No soy médico: ante cualquier duda sobre tu caso, tu equipo de salud tiene la última palabra.',
  },
  {
    id: 'gracias',
    keys: ['gracias', 'muchas gracias', 'te pasaste', 'genial', 'perfecto', 'buenisimo', 'ok gracias'],
    text: '¡De nada! Purr… 💜 Si te surge otra duda, aquí estaré.',
  },
  {
    id: 'chao',
    keys: ['chao', 'adios', 'nos vemos', 'hasta luego'],
    text: '¡Hasta pronto! Cuídate mucho 🐾',
  },
  {
    id: 'miau',
    keys: ['miau', 'gato', 'gatito', 'michi'],
    text: '¡Miau, miau! 😺 Además de ronronear, puedo ayudarte con dudas sobre tu recuperación.',
  },

  // ---------- Síntomas y recuperación ----------
  {
    id: 'sangrado',
    keys: ['sangr', 'sangre', 'manch', 'hemorrag', 'regla'],
    text:
      'Después de una conización es esperable un **sangrado leve o manchado** durante algunas semanas 🟢.\n\n' +
      '• Si es **como una regla**, es amarillo 🟡: contacta a tu equipo.\n' +
      '• Si es **abundante** (empapas más de una toalla por hora), es rojo 🔴: acude a urgencias.\n\n' +
      'Cerca del día 10–14 puede aumentar un poco al desprenderse la costra.',
    actions: { app: [{ label: 'Ver mi semáforo', href: APP('semaforo') }] },
  },
  {
    id: 'flujo',
    keys: ['flujo', 'secrecion', 'cafe', 'restos', 'olor', 'amarill'],
    text:
      'Un **flujo café o con restos** es parte normal de la cicatrización 🟢.\n\n' +
      '• Flujo amarillento o más abundante de lo normal: amarillo 🟡, avisa a tu equipo.\n' +
      '• Flujo **con mal olor**: rojo 🔴, puede ser una infección y debes consultar en urgencias.',
  },
  {
    id: 'dolor',
    keys: ['dolor', 'duele', 'colico', 'calambre', 'molestia', 'analgesic', 'paracetamol', 'ibuprofeno', 'remedio', 'pastilla'],
    text:
      'Un **dolor leve tipo cólico** es esperable los primeros días 🟢. Usa el analgésico que indicó tu médico en tu plan, en la dosis indicada.\n\n' +
      'Si el dolor es moderado y no se pasa, es amarillo 🟡. Si es **intenso y no cede con analgésicos**, es rojo 🔴: acude a urgencias.',
    actions: { app: [{ label: 'Ver Mi plan', href: APP('plan') }] },
  },
  {
    id: 'fiebre',
    keys: ['fiebre', 'temperatura', 'termometro', 'escalofrio', 'afiebrada'],
    text:
      'Mide tu temperatura con termómetro 🌡️.\n\n' +
      '• Entre **37,5 y 38 °C**: amarillo 🟡, avisa a tu equipo.\n' +
      '• **Sobre 38 °C**: rojo 🔴, acude a urgencias.',
  },
  {
    id: 'costra',
    keys: ['costra', 'cicatriz', 'cicatrizacion', 'dia 10', 'dia 14', 'cuanto dura', 'cuanto demora', 'recuperacion'],
    text:
      'La recuperación suele tomar algunas semanas. Lo típico:\n\n' +
      '• **Días 1–3:** reposo relativo, molestia leve y flujo café.\n' +
      '• **Días 10–14:** puede aumentar un poco el sangrado al caer la costra.\n' +
      '• **Semana 4:** según tu médico, retomas actividades.\n' +
      '• **Control:** revisan tu evolución y el resultado de la biopsia.\n\n' +
      'Son tiempos referenciales: sigue siempre tu plan.',
    actions: { app: [{ label: 'Ver Mi camino', href: APP('camino') }] },
  },
  {
    id: 'sexo',
    keys: ['relaciones', 'sexual', 'sexo', 'pareja', 'intim', 'coito'],
    text:
      'En general se recomienda **no tener relaciones sexuales por unas 4 semanas** después de una conización, para que el cuello del útero cicatrice. El plazo exacto lo indica tu médico 💜.\n\n' +
      'Es una duda muy común y no tienes por qué sentir vergüenza de preguntarla.',
    actions: { app: [{ label: 'Anotar para mi control', save: true }] },
  },
  {
    id: 'tampon',
    keys: ['tampon', 'copa menstrual', 'copita', 'piscina', 'tina', 'banera', 'nadar', 'mar', 'playa'],
    text:
      'Mientras cicatrizas (en general unas **4 semanas**): usa toallas higiénicas en vez de tampones o copa, y evita tina, piscina y mar. La **ducha diaria sí** está permitida 🚿.',
  },
  {
    id: 'ducha',
    keys: ['ducha', 'duchar', 'banar', 'higiene', 'lavar', 'aseo', 'jabon'],
    text: 'Puedes **ducharte normalmente** todos los días 🚿. Evita duchas vaginales, tina y piscina mientras cicatrizas.',
  },
  {
    id: 'ejercicio',
    keys: ['ejercicio', 'deporte', 'gimnasio', 'gym', 'correr', 'esfuerzo', 'peso', 'cargar', 'levantar', 'actividad fisica', 'caminar', 'bicicleta', 'bici', 'yoga', 'pilates', 'bailar'],
    text:
      'Los primeros días se recomienda **reposo relativo**: caminar está bien, pero evita esfuerzos intensos y levantar peso 🏋️‍♀️❌.\n\n' +
      'Retomar el ejercicio antes de tiempo puede provocar sangrado, así que confirma el momento con tu médico (suele ser alrededor de la semana 4).',
    actions: { app: [{ label: 'Anotar para mi control', save: true }] },
  },
  {
    id: 'trabajo',
    keys: ['trabajo', 'trabajar', 'licencia', 'clases', 'estudiar', 'manejar', 'conducir'],
    text: 'Muchas pacientes retoman actividades livianas en pocos días, pero depende de tu trabajo y del procedimiento. Si tu trabajo implica esfuerzo físico, pregúntale a tu médico por licencia o reposo 📝.',
    actions: { app: [{ label: 'Anotar para mi control', save: true }] },
  },
  {
    id: 'comida',
    keys: ['comer', 'comida', 'alimentacion', 'aliment', 'dieta', 'tomar agua', 'hidrat', 'estren'],
    text:
      'No hay una dieta especial después de una conización. Ayuda:\n\n' +
      '• **Tomar bastante agua** 💧\n' +
      '• Comer **fibra** (frutas, verduras, legumbres) para evitar el estreñimiento y no hacer fuerza al ir al baño.\n' +
      '• Una alimentación variada para apoyar la cicatrización.\n\n' +
      'Si tienes indicaciones especiales por otra condición, sigue las de tu médico.',
  },
  {
    id: 'alcohol',
    keys: ['alcohol', 'cerveza', 'vino', 'fumar', 'cigarro', 'tabaco'],
    text: 'Es mejor evitar el alcohol mientras tomas analgésicos y durante los primeros días. **Fumar** se asocia a que el VPH persista: dejarlo es una gran ayuda para tu salud 🚭. Tu equipo puede orientarte.',
  },

  // ---------- VPH, lesiones y controles ----------
  {
    id: 'vph',
    keys: ['vph', 'papiloma', 'virus', 'hpv'],
    text:
      'El **VPH (virus papiloma humano)** es muy común: la mayoría de las personas lo tendrá alguna vez y casi siempre el cuerpo lo elimina solo en 1–2 años.\n\n' +
      'Algunos tipos, si persisten, pueden causar cambios en el cuello del útero. Por eso los controles son tan importantes. **Tener VPH no es motivo de culpa** 💜.',
    actions: { app: [{ label: 'Jugar ¿Mito o verdad?', href: APP('aprende') }] },
  },
  {
    id: 'contagio',
    keys: ['contagi', 'transmit', 'pegar', 'pegue', 'condon', 'preservativo', 'infidel'],
    text:
      'El VPH se transmite por contacto sexual y es tan común que **puede pasar incluso con una sola pareja**. No significa infidelidad.\n\n' +
      'El condón reduce el riesgo, pero no lo elimina por completo. Puedes conversar con tu médico si tu pareja debería consultar.',
  },
  {
    id: 'cancer',
    keys: ['cancer', 'tengo cancer', 'es cancer', 'me voy a morir', 'grave', 'nie', 'precancer', 'lesion', 'displasia', 'cin'],
    text:
      'Una **lesión precancerosa (NIE I, II o III) no es cáncer** 💜. Son cambios en las células del cuello del útero que se tratan justamente para que nunca lleguen a serlo.\n\n' +
      'Tratarte a tiempo fue la mejor decisión. Si tienes dudas sobre tu diagnóstico, pregúntale a tu médico: tienes derecho a entenderlo.',
    actions: { app: [{ label: 'Anotar para mi control', save: true }] },
  },
  {
    id: 'conizacion',
    keys: ['conizacion', 'cono', 'leep', 'asa', 'procedimiento', 'operacion', 'cirugia'],
    text: 'La **conización** es un procedimiento breve en que se retira la zona del cuello del útero con células alteradas. Esa muestra se analiza (biopsia) para confirmar que se sacó toda la lesión.',
  },
  {
    id: 'biopsia',
    keys: ['biopsia', 'resultado', 'patologia', 'margen', 'informe'],
    text: 'El resultado de la biopsia suele estar en algunas semanas y lo revisan contigo en tu **control**. Si te preocupa, anótalo en «Mis preguntas» para no olvidarlo 📝.',
    actions: { app: [{ label: 'Anotar para mi control', save: true }] },
  },
  {
    id: 'control',
    keys: ['control', 'controles', 'pap', 'papanicolaou', 'seguimiento', 'cada cuanto', 'proximo control'],
    text:
      'Después del tratamiento vienen **controles con PAP y/o test de VPH** (por ejemplo, alrededor de los 6 meses) para confirmar que la lesión no vuelve. ' +
      'Ir a los controles aunque te sientas bien es la mejor forma de cuidarte 🗓️.',
    actions: { app: [{ label: 'Ver mis recordatorios', href: APP('calendario') }] },
  },
  {
    id: 'embarazo',
    keys: ['embaraz', 'hijos', 'guagua', 'bebe', 'fertilidad', 'quedar embarazada'],
    text: 'La mayoría de las mujeres **puede embarazarse** después de una conización. Si lo estás planeando, conversa con tu médico sobre cuándo y qué cuidados tener 🤰.',
    actions: { app: [{ label: 'Anotar para mi control', save: true }] },
  },
  {
    id: 'vacuna',
    keys: ['vacuna', 'vacunar', 'gardasil'],
    text: 'La vacuna contra el VPH protege contra los tipos más peligrosos del virus. Si te conviene vacunarte después del tratamiento es algo que debes conversar con tu médico 💉.',
    actions: { app: [{ label: 'Anotar para mi control', save: true }] },
  },

  // ---------- Emociones ----------
  {
    id: 'emocion',
    keys: ['miedo', 'ansiedad', 'ansios', 'angusti', 'nerviosa', 'preocupada', 'triste', 'llorar', 'sola', 'estres', 'no puedo dormir', 'verguenza', 'pudor'],
    text:
      'Lo que sientes es muy normal 💜. Muchas mujeres viven este proceso con miedo o vergüenza, y no estás sola.\n\n' +
      'Puedes probar una respiración guiada, escribirle a tu equipo o llamar a **Salud Responde: 600 360 7777**.',
    actions: {
      app: [
        { label: 'Ir al Rincón de calma', href: APP('calma') },
        { label: 'Hablar con la matrona', href: APP('chat/d2') },
      ],
    },
  },

  // ---------- Uso de la app ----------
  {
    id: 'semaforo',
    keys: ['semaforo', 'verde', 'rojo', 'que color', 'colores'],
    text:
      'El **semáforo de síntomas** te dice qué hacer:\n\n' +
      '🟢 **Verde:** síntomas esperados, sigue tu plan.\n' +
      '🟡 **Amarillo:** contacta a tu equipo de salud.\n' +
      '🔴 **Rojo:** acude a urgencias inmediatamente.\n\n' +
      'Se actualiza con tu encuesta semanal.',
    actions: { app: [{ label: 'Ver mi semáforo', href: APP('semaforo') }], sitio: [{ label: 'Ver la demo del semáforo', href: '#demo' }] },
  },
  {
    id: 'encuesta',
    keys: ['encuesta', 'cuestionario', 'preguntas semanales', 'semanal'],
    text: 'La **encuesta semanal** toma unos 5 minutos: respondes cómo han estado tu sangrado, dolor, temperatura, flujo y ánimo, y tu semáforo se actualiza. Tu equipo médico ve tus respuestas 📋.',
    actions: { app: [{ label: 'Ir a la encuesta', href: APP('encuesta') }] },
  },
  {
    id: 'chat',
    keys: ['hablar con', 'escribir', 'contactar', 'doctora', 'doctor', 'medico', 'matrona', 'equipo de salud'],
    text: 'Puedes escribirle a tu médica o a tu matrona en el **Chat** de la app 💬. Responden en horario hábil. Recuerda: el chat no es para urgencias.',
    actions: { app: [{ label: 'Abrir el chat', href: APP('chat') }] },
  },
  {
    id: 'recordatorios',
    keys: ['recordatorio', 'calendario', 'agenda', 'hora', 'cita', 'cuando es mi'],
    text: 'En **Calendario** ves tus controles, medicamentos, cuidados y encuestas por colores. También puedes agregar tus propios recordatorios 🗓️.',
    actions: { app: [{ label: 'Abrir el calendario', href: APP('calendario') }] },
  },
  {
    id: 'plan',
    keys: ['mi plan', 'cuidados', 'indicaciones', 'que debo hacer', 'reposo'],
    text: 'En **Mi plan** está tu plan de recuperación validado por tu médico: tu procedimiento, tus cuidados de hoy (que puedes marcar) y cuándo consultar 📋.',
    actions: { app: [{ label: 'Ver Mi plan', href: APP('plan') }] },
  },
  {
    id: 'mis-preguntas',
    keys: ['mis preguntas', 'anotar', 'apuntar', 'no olvidar', 'olvido'],
    text: 'En **Mis preguntas** anotas dudas para tu próximo control, y tu médica puede verlas antes de la consulta 📝. Si yo no sé algo, puedo guardarlo ahí por ti.',
    actions: { app: [{ label: 'Abrir Mis preguntas', href: APP('preguntas') }] },
  },
  {
    id: 'ajustes',
    keys: ['letra', 'tamano de letra', 'letra grande', 'color de la app', 'cambiar color', 'notificacion', 'aviso', 'instalar'],
    text: 'En **Ajustes** (el engranaje en Inicio) puedes agrandar la letra, cambiar los colores (Lavanda, Rosa o Menta), activar avisos e instalar la app en tu celular ⚙️.',
    actions: { app: [{ label: 'Abrir Ajustes', href: APP('ajustes') }] },
  },
  {
    id: 'codigo',
    keys: ['codigo', 'clave', 'contrasena', 'entrar', 'ingresar', 'login', 'acceso', 'rut'],
    text: 'Para entrar usas tu **RUT** y el **código** que te entrega tu médico en la consulta. Si lo perdiste, pídeselo a tu equipo de salud. En el prototipo puedes usar «Usar paciente de prueba».',
  },
  {
    id: 'privacidad',
    keys: ['privacidad', 'privado', 'datos', 'confidencial', 'quien ve', 'seguro', 'anonim'],
    text: 'Tu información es **confidencial**: solo tú y tu equipo de salud la ven. En este prototipo los datos son de ejemplo y se guardan solo en tu dispositivo 🔒.',
  },

  // ---------- Sobre el proyecto (sitio web) ----------
  {
    id: 'proyecto',
    keys: ['que es cervix', 'cervix', 'de que se trata', 'proyecto', 'para que sirve', 'que hace la app', 'objetivo'],
    text:
      '**Cérvix-B** es un prototipo para acompañar a mujeres tratadas por lesiones precancerosas de cuello uterino (NIE I–III) entre el alta y su control.\n\n' +
      'Tiene un plan validado por el médico, una encuesta semanal de 5 minutos, un semáforo de síntomas y un canal seguro con el equipo de salud.',
    actions: { sitio: [{ label: 'Ver la propuesta', href: '#propuesta' }, { label: 'Probar la app', href: './app/' }] },
  },
  {
    id: 'problema',
    keys: ['problema', 'por que', 'desafio', 'necesidad', 'abandono'],
    text:
      'En nuestra investigación vimos que, tras el alta, muchas pacientes reciben **indicaciones generales** («haga reposo»), tienen poco tiempo para preguntar y el **estigma del VPH** las lleva a callar o buscar respuestas en redes sociales.',
    actions: { sitio: [{ label: 'Ver el desafío', href: '#desafio' }] },
    only: 'sitio',
  },
  {
    id: 'equipo',
    keys: ['equipo', 'quienes son', 'integrantes', 'autores', 'universidad', 'curso'],
    text: 'Somos el equipo **Cérvix-B**: Victoria Cubelli, Amaro Rojas, Maximiliano Rozas, Francisca Sanhueza, Josefa Vergara y Julio Villarroel (CD1201, Sección 10, FCFM, Universidad de Chile) 👩‍🔬.',
    actions: { sitio: [{ label: 'Ver el equipo', href: '#equipo' }] },
    only: 'sitio',
  },
  {
    id: 'probar',
    keys: ['probar', 'prototipo', 'descargar', 'usar la app', 'donde esta la app', 'link'],
    text: 'Puedes probar el prototipo en tu navegador: entra con «Usar paciente de prueba» o «Soy profesional de salud». Todos los datos son ficticios 📱.',
    actions: { sitio: [{ label: 'Abrir la app', href: './app/' }] },
    only: 'sitio',
  },
  {
    id: 'validacion',
    keys: ['validad', 'resultados', 'prueba', 'funciona', 'evidencia', 'experimento'],
    text:
      'Validamos el **problema** con entrevistas a pacientes y profesionales, y 4 pacientes con NIE apoyaron la idea del semáforo.\n\n' +
      'Las **pruebas de usabilidad aún están pendientes**: todavía no tenemos resultados con usuarias, y lo diremos tal cual cuando los tengamos.',
    actions: { sitio: [{ label: 'Ver validación', href: '#validacion' }] },
    only: 'sitio',
  },
  {
    id: 'instituciones',
    keys: ['institucion', 'hospital', 'clinica', 'cesfam', 'publico', 'implementar', 'fonasa', 'isapre', 'consultorio'],
    text:
      'Cérvix-B busca integrarse al **alta**: el equipo entrega un código, valida el plan y luego ve alertas y evolución. ' +
      'En el sistema público ayudaría a cubrir la falta de seguimiento; en el privado, reemplazaría canales informales como WhatsApp por uno oficial y seguro.',
    actions: { sitio: [{ label: 'Ver propuesta para instituciones', href: '#instituciones' }] },
  },
  {
    id: 'costo',
    keys: ['cuesta', 'precio', 'costo', 'pagar', 'gratis', 'valor'],
    text: 'Cérvix-B es un **prototipo académico** y no se cobra. El modelo de implementación en instituciones aún está en diseño.',
  },
]

/** Sugerencias iniciales según el contexto. */
export const SUGGESTIONS: Record<Audience, string[]> = {
  app: ['¿Es normal sangrar?', '¿Cuándo puedo tener relaciones?', '¿Qué es el VPH?', '¿Qué significa el semáforo?'],
  sitio: ['¿Qué es Cérvix-B?', '¿Cómo funciona el semáforo?', '¿Está validada?', '¿Cómo se implementaría en un hospital?'],
}

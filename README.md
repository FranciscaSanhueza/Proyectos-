# Cérvix B · App de seguimiento post-procedimiento

El repositorio contiene dos partes que se publican juntas:

- **Sitio web del proyecto** (`index.html`, `site/`): cuenta el desafío, la propuesta, el prototipo, la validación, los aprendizajes, la propuesta para instituciones públicas y privadas, y los próximos pasos. Su contenido proviene de los informes y actividades del equipo (Hito 2, Tarea 5, Hito 1 y actividades 5–7) y no inventa resultados.
- **App** (`app/`, `src/`): el prototipo interactivo, publicado en `/app/`.

### Kitty, el gatito que responde dudas 🐱

Un chatbot con forma de gato blanco en pixel art, presente en el sitio y en la app (`src/bot/`).

- Responde con una **base de conocimiento propia** (`src/bot/knowledge.ts`): síntomas, cuidados, VPH, controles, emociones, uso de la app y el proyecto. No usa servicios externos ni inventa respuestas.
- **Detecta señales de alarma** (sangrado abundante, fiebre sobre 38 °C, dolor intenso, mal olor, desmayo) y deriva a urgencias / 131.
- En la app muestra las **preguntas pendientes** de «Mis preguntas» para responderlas, y si no sabe algo ofrece **guardarlo para el control** o escribir al equipo.
- El contenido es referencial y debe ser validado por profesionales antes de usarse con pacientes.

Prototipo de app móvil para acompañar a pacientes con **lesiones precancerosas de cuello uterino (VPH)** después de su procedimiento (conización, biopsia), mejorando la comunicación médico–paciente.

> Proyecto del curso Desafíos · Sección 10 – E6 · FCFM Universidad de Chile
> Victoria Cubelli · Amaro Rojas · Maximiliano Rozas · Francisca Sanhueza · Josefa Vergara · Julio Villaroel

## Funcionalidades

### Vista paciente (barra inferior: Inicio · Calendario · Semáforo · Chat · Mi plan)

1. **Acceso con alta médica**: la paciente entra con su RUT y el código que le entrega el médico en la consulta.
2. **Inicio**: resumen con *Mi semáforo*, estado de la *Encuesta semanal* y próximos *Recordatorios*.
3. **Semáforo de síntomas**: verde (sigue tu plan), amarillo (contacta a tu equipo), rojo (urgencias). Incluye un buscador de síntomas que dice si un síntoma es verde, amarillo o rojo.
4. **Encuesta semanal (5 min)**: preguntas paso a paso; al responder se recalcula el semáforo y se informa la fecha de la próxima encuesta.
5. **Calendario de recordatorios**: controles, medicamentos, cuidados y encuestas por color; la paciente puede agregar los suyos.
6. **Chat de dudas** con la médica tratante y la matrona, con preguntas rápidas como «¿este síntoma es verde, amarillo o rojo?».
7. **Mi plan**: plan de recuperación personalizado (procedimiento, diagnóstico, semana de recuperación, próximo control, cuidados de hoy y señales de alarma), validado por el médico.

### Mejoras (v2)

- **Alerta roja inmediata**: si la encuesta da rojo, aparece una pantalla de urgencia (llamar al 131, ver urgencias cercanas) y el equipo médico recibe una alerta en su panel. En amarillo se avisa al equipo y se ofrece escribirle.
- **Mi evolución**: gráfico semana a semana con el semáforo y la intensidad de sangrado, dolor y preocupación (vista paciente y vista médica).
- **Encuesta visual**: cada opción muestra una escala de intensidad (gotas, termómetro, etc.) y un botón «Escuchar pregunta».
- **Apoyo emocional**: si la paciente está muy preocupada, se ofrecen respiración guiada, chat con la matrona y Salud Responde.
- **Accesibilidad**: tamaño de letra (normal, grande, muy grande) y lectura en voz alta del plan y del semáforo.
- **App instalable (PWA)** con avisos de recordatorios y encuesta (se muestran al abrir la app; los avisos con la app cerrada requieren un servidor).
- **Publicación automática** en GitHub Pages.

### Mejoras (v3): experiencia más cálida e interactiva

- **Diseño renovado** con transiciones suaves entre pantallas, tarjetas que aparecen en cascada y botones con respuesta táctil. Se pueden desactivar en Ajustes (y se respeta «reducir movimiento» del sistema).
- **Temas de color** a elección: Lavanda, Rosa y Menta.
- **Inicio renovado**: saludo según la hora, anillo con los días de recuperación y **check-in diario de ánimo** con mensajes de apoyo y celebración.
- **Cuidados del día** que se marcan como hechos, con barra de progreso.
- **Rincón de calma**: frases de ánimo, respiración guiada, ejercicio 5-4-3-2-1 y sonido de lluvia.
- **Aprende**: juego «¿Mito o verdad?» y fichas sobre el VPH, las lesiones, la conización y los controles.
- **Mis preguntas**: lista para llevar al control (el médico la ve en el perfil).
- **Mi camino**: hitos de la recuperación y logros que se desbloquean.

### Mejoras (v4): instituciones, demo y accesibilidad

- **Métricas para la institución** (vista profesional → Métricas): adherencia a la encuesta semanal, tiempo medio en revisar alertas y en responder dudas, cuidados cumplidos, ánimo promedio y planes validados, con metas de referencia. Se descargan en **CSV** para reportes de calidad.
- **Resumen en PDF** de cada paciente (plan, ánimo y cuidados de 7 días, encuestas, preguntas para el control; las notas privadas solo en la vista profesional). Se abre desde *Mi plan*, *Mis preguntas* o el perfil de la paciente y se guarda con «Imprimir → Guardar como PDF».
- **Probar demo** desde la web: `app/#/demo/paciente` y `app/#/demo/medico` abren la app directo en esa vista (`?reiniciar=1` deja los datos como nuevos).
- **Modo presentación**: botón «Reiniciar demo» en la pantalla de ingreso.
- **Accesibilidad**: tema de **alto contraste**, botones «Escuchar» en Inicio, semáforo, calendario y chat, y página **Otros idiomas** (`app/#/idiomas`) con el semáforo, las señales de alarma y los cuidados en **inglés y criollo haitiano**, con audio. Las traducciones son referenciales y deben revisarlas facilitadores interculturales; los videos en Lengua de Señas Chilena quedan pendientes.

### Mejoras (v5): más llamativa, útil y cuidada

- **Bienvenida guiada**: la primera vez que una paciente entra ve un recorrido de 5 pasos (semáforo, encuesta, plan, chat y Kitty), con audio y deslizable. Se repite desde Ajustes y vuelve a aparecer con «Reiniciar demo».
- **Tu siguiente paso** en el Inicio: una tarjeta muestra la acción más importante del día (semáforo rojo → mensaje nuevo del equipo → encuesta disponible → control en los próximos 7 días → cuidados pendientes → mensaje de ánimo).
- **Racha** de días seguidos registrando el ánimo y **cuenta regresiva** al próximo control.
- **Modo noche** (tema oscuro) en Ajustes, y botón luna/sol en el panel del médico.
- **Pantalla de ingreso renovada** con el semáforo y Kitty.
- **Vibración suave** al marcar el ánimo, los cuidados y las respuestas de la encuesta (se desactiva con «Animaciones suaves»).
- **Plantillas de plan** para el médico (conización LEEP, crioterapia, colposcopía con biopsia): completan cuidados, señales de alarma y fecha de control. Contenido referencial que debe validar el equipo clínico.
- El globo «¿Dudas?» de Kitty aparece una sola vez por visita para no tapar el contenido.

### Mejoras (v6): interacciones que todos conocen

Inspiradas en apps de uso diario y adaptadas al seguimiento post-procedimiento:

- **Historias del día** (como Instagram): consejo, «¿mito o verdad?», **Tu semana** y frase de ánimo, a pantalla completa.
- **Tu semana** (como Spotify Wrapped): resumen animado de 7 días al terminar la encuesta, para guardar o compartir.
- **«Hoy noté…»** (como las reacciones de WhatsApp o Flo): registrar sangrado, dolor, fiebre o flujo con un toque; en amarillo o rojo avisa al equipo y actualiza el semáforo por 24 horas.
- **Buscador «¿Qué te preocupa?»** (como Google): entiende palabras simples («me duele», «manché») y muestra si es verde, amarillo o rojo.
- **Anillos del día** (como el Apple Watch): ánimo, cuidados y encuesta, con celebración al cerrarlos.
- **Botón «Ayuda» y deslizar para llamar al 131** (como el kit de seguridad de Uber), urgencias cercanas y Salud Responde.
- **Modo simple** (como el modo fácil de Android): Inicio con 3 botones grandes.
- **Activación por QR** (como WhatsApp Web): el médico muestra un QR y la paciente entra sin escribir RUT ni código (`#/activar?rut=…&code=…`).
- **Chat con mensajes de voz, ✓✓ de leído** y tiempo de respuesta esperado (como WhatsApp).
- **Recordatorios con «Hecho» y «Posponer 1 h»** (como Google Calendar o Medisafe).
- **Mito o verdad deslizando** la tarjeta (como Tinder).
- **Compartir por WhatsApp** el resumen y «Tu semana» con la pareja o la familia.

> Los audios y registros se guardan en el dispositivo (demo). Para que lleguen a otro celular se necesita el servidor pendiente.

### Vista profesional de salud

- **Inicio**: alertas, conteo por semáforo y tareas del día (planes por validar, dudas, encuestas pendientes).
- **Mis pacientes**: búsqueda por nombre, RUT, diagnóstico o etiqueta; filtros (rojo, amarillo, verde, prioridad alta, plan por validar, encuesta pendiente, dadas de alta) y orden.
- **Nueva paciente**: crea la ficha y su plan inicial, y genera el código para activar la app.
- **Perfil de cada paciente**: resumen (última encuesta, ánimo de la semana, cuidados cumplidos, evolución, preguntas para el control y notas privadas) y edición de datos, prioridad, etiquetas, notas y estado (alta).

- Panel de pacientes ordenado por semáforo (primero las rojas, luego las amarillas).
- Editor del **plan de recuperación** con botón *Validar plan*.
- Historial de **encuestas** con cada respuesta coloreada según su nivel.
- **Chat** con respuestas rápidas para clasificar el síntoma.
- **Recordatorios** que se crean para la paciente y aparecen en su calendario.

## Cómo correrla

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev       # sitio en http://localhost:5173 y app en http://localhost:5173/app/
npm run build     # genera la versión de producción en dist/
```

En la pantalla de ingreso, toca **«Paciente»** (María, datos de prueba) o **«Profesional»** (Dra. Camila Rojas). También puedes entrar con RUT `12.345.678-9` y código `CERVIX1`. El botón **«Cambiar perfil»**, arriba en el Inicio de cada vista, vuelve a la pantalla de ingreso para probar la otra.

Los datos son de ejemplo y se guardan en el navegador (`localStorage`).

## Publicarla en internet (GitHub Pages)

1. En GitHub: **Settings → Pages → Build and deployment → Source: «GitHub Actions»**.
2. Cada push publica la app automáticamente (pestaña **Actions**). Si el primer intento falló porque Pages no estaba activado, entra a **Actions → «Publicar en GitHub Pages» → Run workflow**.
3. El sitio queda en `https://franciscasanhueza.github.io/Proyectos-/` y la app en `https://franciscasanhueza.github.io/Proyectos-/app/`. Abre la app en el celular y usa «Agregar a pantalla de inicio» para instalarla. Los enlaces antiguos a la app (`…/Proyectos-/#/paciente`) redirigen solos a `/app/`.

## Pendientes

- [ ] **Backend real** (por ejemplo, Firebase o Supabase) con inicio de sesión seguro, para que médico y paciente compartan los mismos datos entre dispositivos.
- [ ] **Notificaciones push** que lleguen con la app cerrada (requieren el servidor anterior).
- [ ] **Validación clínica** de las preguntas, umbrales del semáforo y guía de síntomas por médicos especialistas.
- [ ] **Revisión de traducciones** (inglés y criollo haitiano) por facilitadores interculturales y **videos en Lengua de Señas Chilena**.
- [ ] **Pruebas de usabilidad** con pacientes para completar la sección de resultados de la web.

## Estructura

```
src/
  data/mock.ts          Datos de ejemplo: pacientes, planes, preguntas, guía de síntomas
  context/AppContext.tsx Estado global (futuro: llamadas a un backend)
  utils.ts              Fechas, cálculo del semáforo y de la encuesta semanal
  components/           UI reutilizable (carita del semáforo, calendario, chat…)
  pages/paciente/       Pantallas de la paciente
  pages/medico/         Pantallas del profesional
  styles.css            Estilos y paleta (variables CSS en :root)
```

## ⚠️ Contenido clínico

Las preguntas de la encuesta, los umbrales del semáforo y la guía de síntomas (`src/data/mock.ts`) son **referenciales** y deben ser revisados y validados por médicos especialistas antes de usarse con pacientes reales.

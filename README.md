# Cérvix B · App de seguimiento post-procedimiento

El repositorio contiene dos partes que se publican juntas:

- **Sitio web del proyecto** (`index.html`, `site/`): cuenta el desafío, la propuesta, el prototipo, la validación, los aprendizajes, la propuesta para instituciones públicas y privadas, y los próximos pasos. Su contenido proviene de los informes y actividades del equipo (Hito 2, Tarea 5, Hito 1 y actividades 5–7) y no inventa resultados.
- **App** (`app/`, `src/`): el prototipo interactivo, publicado en `/app/`.

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

Para probar la vista paciente usa **«Usar paciente de prueba»** (RUT `12.345.678-9`, código `CERVIX1`). Para la vista médica, pulsa **«Soy profesional de salud»**.

Los datos son de ejemplo y se guardan en el navegador (`localStorage`).

## Publicarla en internet (GitHub Pages)

1. En GitHub: **Settings → Pages → Build and deployment → Source: «GitHub Actions»**.
2. Cada push publica la app automáticamente (pestaña **Actions**). Si el primer intento falló porque Pages no estaba activado, entra a **Actions → «Publicar en GitHub Pages» → Run workflow**.
3. El sitio queda en `https://franciscasanhueza.github.io/Proyectos-/` y la app en `https://franciscasanhueza.github.io/Proyectos-/app/`. Abre la app en el celular y usa «Agregar a pantalla de inicio» para instalarla. Los enlaces antiguos a la app (`…/Proyectos-/#/paciente`) redirigen solos a `/app/`.

## Pendientes

- [ ] **Backend real** (por ejemplo, Firebase o Supabase) con inicio de sesión seguro, para que médico y paciente compartan los mismos datos entre dispositivos.
- [ ] **Notificaciones push** que lleguen con la app cerrada (requieren el servidor anterior).
- [ ] **Validación clínica** de las preguntas, umbrales del semáforo y guía de síntomas por médicos especialistas.

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

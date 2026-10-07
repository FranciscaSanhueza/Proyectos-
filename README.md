# Cérvix B · App de seguimiento post-procedimiento

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

### Vista profesional de salud

- Panel de pacientes ordenado por semáforo (primero las rojas, luego las amarillas).
- Editor del **plan de recuperación** con botón *Validar plan*.
- Historial de **encuestas** con cada respuesta coloreada según su nivel.
- **Chat** con respuestas rápidas para clasificar el síntoma.
- **Recordatorios** que se crean para la paciente y aparecen en su calendario.

## Cómo correrla

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev       # abre http://localhost:5173
npm run build     # genera la versión de producción en dist/
```

Para probar la vista paciente usa **«Usar paciente de prueba»** (RUT `12.345.678-9`, código `CERVIX1`). Para la vista médica, pulsa **«Soy profesional de salud»**.

Los datos son de ejemplo y se guardan en el navegador (`localStorage`).

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

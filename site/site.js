// Interactividad del sitio web de Cérvix-B (sin dependencias).
import { mountCatBot } from '../src/bot/widget.ts'

const $ = (s, el = document) => el.querySelector(s)
const $$ = (s, el = document) => [...el.querySelectorAll(s)]
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---------- Navegación: menú móvil, sombra y sección activa ---------- */

const nav = $('#nav')
const toggle = $('#nav-toggle')
const links = $('#nav-links')
toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open')
  toggle.setAttribute('aria-expanded', String(open))
})
$$('a', links).forEach((a) => a.addEventListener('click', () => {
  nav.classList.remove('is-open')
  toggle.setAttribute('aria-expanded', 'false')
}))

const toTop = $('#to-top')
const onScroll = () => {
  nav.classList.toggle('is-scrolled', scrollY > 10)
  toTop.classList.toggle('is-visible', scrollY > 900)
}
addEventListener('scroll', onScroll, { passive: true })
onScroll()
toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }))

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return
      $$('a', links).forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id))
    })
  },
  { rootMargin: '-45% 0px -50% 0px' },
)
$$('main section[id]').forEach((s) => sectionObserver.observe(s))

/* ---------- Barra de progreso de lectura ---------- */

const progress = document.createElement('div')
progress.className = 'progress'
progress.setAttribute('aria-hidden', 'true')
document.body.prepend(progress)
const updateProgress = () => {
  const max = document.documentElement.scrollHeight - innerHeight
  progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`
}
addEventListener('scroll', updateProgress, { passive: true })
addEventListener('resize', updateProgress)
updateProgress()

/* ---------- Aparición al hacer scroll y contadores ---------- */

// Las tarjetas de estas grillas aparecen una tras otra.
const STAGGER = ['.stats', '.problems', '.quotes', '.needs__grid', '.pillars', '.decisions__grid', '.status-grid', '.learnings', '.actors', '.risks__grid', '.roadmap', '.team', '.evolution', '.journey', '.artifacts']
STAGGER.forEach((sel) =>
  $$(sel).forEach((grid) => {
    grid.classList.add('stagger')
    ;[...grid.children].forEach((child, i) => child.style.setProperty('--i', String(i)))
  }),
)

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return
      e.target.classList.add('is-visible')
      revealObserver.unobserve(e.target)
    })
  },
  { threshold: 0.12 },
)
$$('.reveal, .stagger').forEach((el) => revealObserver.observe(el))

const fmt = new Intl.NumberFormat('es-CL')
const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return
      countObserver.unobserve(e.target)
      const el = e.target
      const to = Number(el.dataset.to)
      const pre = el.dataset.prefix ?? ''
      const suf = el.dataset.suffix ?? ''
      if (reduceMotion) return
      const start = performance.now()
      const dur = 1400
      const tick = (now) => {
        const t = Math.min(1, (now - start) / dur)
        const eased = 1 - Math.pow(1 - t, 3)
        el.textContent = pre + fmt.format(Math.round(to * eased)) + suf
        if (t < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })
  },
  { threshold: 0.6 },
)
$$('.count').forEach((el) => countObserver.observe(el))

/* ---------- Parallax suave en el hero ---------- */

if (!reduceMotion) {
  const layers = [
    [$('.blob--1'), 0.18],
    [$('.blob--2'), -0.12],
    [$('.hero__phones'), -0.08],
  ]
  let ticking = false
  addEventListener(
    'scroll',
    () => {
      if (ticking || scrollY > innerHeight * 1.2) return
      ticking = true
      requestAnimationFrame(() => {
        layers.forEach(([el, k]) => el && (el.style.transform = `translate3d(0, ${scrollY * k}px, 0)`))
        ticking = false
      })
    },
    { passive: true },
  )
}

/** Cambio de contenido con transición nativa del navegador cuando existe. */
const smoothly = (update) => {
  if (!reduceMotion && document.startViewTransition) document.startViewTransition(update)
  else update()
}

/* ---------- Demo del semáforo ---------- */

// Mismos contenidos referenciales que la guía de síntomas de la app.
const SYMPTOMS = [
  { s: 'Flujo café oscuro', l: 'verde', a: 'Es esperable las primeras semanas. Sigue tu plan.' },
  { s: 'Sangrado leve o manchado', l: 'verde', a: 'Es normal durante la cicatrización. Sigue tu plan.' },
  { s: 'Dolor leve tipo cólico', l: 'verde', a: 'Puedes usar el analgésico indicado en tu plan.' },
  { s: 'Sangrado como una regla', l: 'amarillo', a: 'Contacta a tu equipo de salud por el chat o por teléfono.' },
  { s: 'Flujo amarillento', l: 'amarillo', a: 'Contacta a tu equipo para evaluar una posible infección.' },
  { s: 'Temperatura 37,5–38 °C', l: 'amarillo', a: 'Controla tu temperatura y avisa a tu equipo de salud.' },
  { s: 'Sangrado abundante', l: 'rojo', a: 'Acude a urgencias inmediatamente.' },
  { s: 'Fiebre sobre 38 °C', l: 'rojo', a: 'Acude a urgencias inmediatamente.' },
  { s: 'Dolor intenso que no cede', l: 'rojo', a: 'Acude a urgencias inmediatamente.' },
]
const LABEL = { verde: 'Verde', amarillo: 'Amarillo', rojo: 'Rojo' }
const chips = $('.demo__chips')
const result = $('.demo__result')
SYMPTOMS.forEach((item, i) => {
  const b = document.createElement('button')
  b.className = 'chip'
  b.type = 'button'
  b.textContent = item.s
  b.addEventListener('click', () => {
    $$('.chip', chips).forEach((c) => c.classList.toggle('is-active', c === b))
    $$('.lamp', result).forEach((l) => l.classList.toggle('is-on', l.classList.contains('lamp--' + item.l)))
    result.dataset.level = item.l
    $('#demo-title').textContent = `${item.s}: ${LABEL[item.l]}`
    $('#demo-advice').textContent = item.a
    result.classList.remove('pulse')
    void result.offsetWidth
    result.classList.add('pulse')
  })
  chips.append(b)
  if (i === 0) b.dataset.first = 'true'
})

/* ---------- Gráfico de ideas (Actividad 5.1) ---------- */

const IDEAS = [
  { n: 'App con semáforo de síntomas', f: 4, i: 5, top: true },
  { n: 'Plataforma web con encuesta y panel médico', f: 4, i: 4, top: true },
  { n: 'SMS con preguntas cerradas', f: 4, i: 3, top: true },
  { n: 'Telemedicina semanal con matrona', f: 2, i: 4 },
  { n: 'Grupo de apoyo entre pares', f: 2, i: 3 },
  { n: 'Pulsera con botón de alerta', f: 1, i: 3 },
  { n: 'Póster con lenguaje claro + QR', f: 5, i: 2 },
]
const chart = $('#ideas-chart')
IDEAS.forEach((d) => {
  const row = document.createElement('div')
  row.className = 'idea' + (d.top ? ' idea--top' : '')
  row.setAttribute('role', 'row')
  row.innerHTML = `
    <span class="idea__name" role="cell">${d.n}${d.top ? ' <em>finalista</em>' : ''}</span>
    <span class="idea__bars" role="cell" aria-label="Factibilidad ${d.f} de 5, impacto ${d.i} de 5">
      <span class="bar bar--f" style="--v:${d.f / 5}"><b>${d.f}</b></span>
      <span class="bar bar--i" style="--v:${d.i / 5}"><b>${d.i}</b></span>
    </span>`
  chart.append(row)
})

/* ---------- Matriz de soluciones existentes (Tarea 5) ---------- */

const ATTRS = ['Claridad y lenguaje empático', 'Acompañamiento proactivo', 'Espacio confidencial', 'Contención emocional', 'Trazabilidad NIE']
const SOLUTIONS = [
  { n: 'Guía clínica MINSAL', v: ['no', 'no', 'no', 'no', 'parcial'] },
  { n: 'App «Contigo»', v: ['parcial', 'si', 'parcial', 'parcial', 'no'] },
  { n: 'App Escapa ELPO', v: ['no', 'no', 'no', 'no', 'no'] },
  { n: 'Cuidados post cirugía (FALP)', v: ['si', 'parcial', 'parcial', 'si', 'no'] },
  { n: 'Visor 360° (INCANCER)', v: ['parcial', 'si', 'parcial', 'parcial', 'parcial'] },
]
const WORD = { si: 'Cumple', parcial: 'Parcial', no: 'No cumple' }
const table = $('#matrix-table')
table.innerHTML = `
  <thead><tr><th scope="col">Solución</th>${ATTRS.map((a) => `<th scope="col">${a}</th>`).join('')}</tr></thead>
  <tbody>${SOLUTIONS.map(
    (s) => `<tr><th scope="row">${s.n}</th>${s.v.map((v) => `<td><span class="cell cell--${v}">${WORD[v]}</span></td>`).join('')}</tr>`,
  ).join('')}</tbody>`

/* ---------- Galería del prototipo ---------- */

const SCREENS = {
  paciente: [
    { img: 'inicio', t: 'Inicio', d: 'Saludo, días de recuperación, check-in diario de ánimo, semáforo, encuesta, cuidados de hoy y recordatorios.' },
    { img: 'semaforo', t: 'Semáforo de síntomas', d: 'Estado actual según la última encuesta, evolución semana a semana y buscador «¿tu síntoma es verde, amarillo o rojo?».' },
    { img: 'encuesta', t: 'Encuesta semanal', d: 'Una pregunta por pantalla, escala visual de intensidad y botón para escuchar la pregunta.' },
    { img: 'alerta', t: 'Alerta roja', d: 'Si la encuesta da rojo, la app indica acudir a urgencias, permite llamar al 131 y avisa al equipo médico.' },
    { img: 'plan', t: 'Mi plan', d: 'Plan validado por el médico con cuidados que se marcan cada día y señales de alarma.' },
    { img: 'calendario', t: 'Recordatorios', d: 'Controles, medicamentos, cuidados y encuestas en un calendario por colores.' },
    { img: 'chat', t: 'Chat de dudas', d: 'Canal con la médica y la matrona, con preguntas rápidas como «¿es verde, amarillo o rojo?».' },
    { img: 'calma', t: 'Rincón de calma', d: 'Frases de ánimo, respiración guiada, ejercicio 5-4-3-2-1 y sonido relajante.' },
    { img: 'aprende', t: 'Aprende', d: 'Juego «¿Mito o verdad?» y fichas sobre VPH, lesiones, conización y controles.' },
    { img: 'camino', t: 'Mi camino', d: 'Hitos de la recuperación y logros que se desbloquean para motivar la constancia.' },
  ],
  medico: [
    { img: 'medico-inicio', t: 'Inicio del equipo', d: 'Pacientes por color del semáforo, alertas de encuestas y tareas del día.' },
    { img: 'medico-pacientes', t: 'Mis pacientes', d: 'Lista con búsqueda, filtros (rojo, prioridad, plan por validar…) y orden.' },
    { img: 'medico-perfil', t: 'Perfil de la paciente', d: 'Resumen con ánimo de la semana, cuidados cumplidos, evolución, preguntas para el control y notas privadas.' },
    { img: 'medico-plan', t: 'Plan personalizado', d: 'El médico ajusta procedimiento, cuidados y señales de alarma, y valida el plan antes del alta.' },
  ],
}
let set = 'paciente'
const stageImg = $('#stage-img')
const thumbs = $('#thumbs')
const show = (i) => {
  const s = SCREENS[set][i]
  const swap = () => {
    stageImg.src = `./img/app-${s.img}.webp`
    stageImg.alt = `Pantalla de la app: ${s.t}`
    $('#stage-title').textContent = s.t
    $('#stage-text').textContent = s.d
    $$('button', thumbs).forEach((b, j) => b.classList.toggle('is-active', i === j))
  }
  smoothly(swap)
}

// Inclinación 3D suave del teléfono al mover el mouse.
const stagePhone = $('.phone--stage')
if (!reduceMotion && matchMedia('(hover: hover)').matches) {
  stagePhone.addEventListener('mousemove', (e) => {
    const r = stagePhone.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    stagePhone.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 8}deg)`
  })
  stagePhone.addEventListener('mouseleave', () => (stagePhone.style.transform = ''))
}
const renderThumbs = () => {
  thumbs.innerHTML = ''
  SCREENS[set].forEach((s, i) => {
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'thumb'
    b.textContent = s.t
    b.addEventListener('click', () => show(i))
    thumbs.append(b)
  })
  show(0)
}
$$('.gtab').forEach((tab) =>
  tab.addEventListener('click', () => {
    set = tab.dataset.set
    $$('.gtab').forEach((t) => {
      t.classList.toggle('is-active', t === tab)
      t.setAttribute('aria-selected', String(t === tab))
    })
    renderThumbs()
  }),
)
renderThumbs()

/* ---------- Público / privado ---------- */

$$('.switch__btn').forEach((btn) =>
  btn.addEventListener('click', () =>
    smoothly(() => {
      $$('.switch__btn').forEach((b) => {
        b.classList.toggle('is-active', b === btn)
        b.setAttribute('aria-selected', String(b === btn))
      })
      $$('.inst').forEach((p) => {
        const on = p.dataset.panel === btn.dataset.inst
        p.hidden = !on
        if (on) $$('.reveal', p).forEach((el) => el.classList.add('is-visible'))
      })
    }),
  ),
)

/* ---------- Equipo ---------- */

const TEAM = ['Victoria Cubelli', 'Amaro Rojas', 'Maximiliano Rozas', 'Francisca Sanhueza', 'Josefa Vergara', 'Julio Villarroel']
const team = $('#team')
TEAM.forEach((name, i) => {
  const initials = name.split(' ').map((p) => p[0]).join('')
  const el = document.createElement('div')
  el.className = 'member'
  el.style.setProperty('--d', `${i * 0.06}s`)
  el.innerHTML = `<span class="member__avatar">${initials}</span><strong>${name}</strong>`
  team.append(el)
})

/* ---------- Lightbox ---------- */

const lb = $('#lightbox')
$$('[data-lightbox]').forEach((fig) => {
  fig.tabIndex = 0
  const open = () => {
    $('img', lb).src = fig.dataset.lightbox
    $('img', lb).alt = $('img', fig).alt
    lb.hidden = false
    $('button', lb).focus()
  }
  fig.addEventListener('click', open)
  fig.addEventListener('keydown', (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), open()))
})
const closeLb = () => (lb.hidden = true)
lb.addEventListener('click', (e) => e.target !== $('img', lb) && closeLb())
addEventListener('keydown', (e) => e.key === 'Escape' && closeLb())

/* ---------- Copito, el gatito que responde dudas ---------- */

mountCatBot({ audience: 'sitio' })

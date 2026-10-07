// Widget de chat de Kitty, sin frameworks: se usa igual en el sitio web
// (JavaScript simple) y en la app (montado desde React).
import './widget.css'
import { catSvg } from './cat'
import { reply, type BotReply } from './engine'
import { SUGGESTIONS, type Audience, type BotAction } from './knowledge'

export interface CatBotOptions {
  audience: Audience
  /** Preguntas pendientes de «Mis preguntas» (solo app). */
  pendingQuestions?: () => string[]
  /** Guarda una pregunta en «Mis preguntas» (solo app). */
  onSaveQuestion?: (question: string) => void
  /** Clase extra para posicionar el botón (p. ej. sobre la barra de la app). */
  className?: string
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

/** Texto con **negritas** y saltos de línea, siempre escapado. */
const format = (s: string) => escapeHtml(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>')

const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

export function mountCatBot(opts: CatBotOptions): () => void {
  const root = document.createElement('div')
  root.className = `cb-root ${opts.className ?? ''}`
  root.innerHTML = `
    <button class="cb-launcher" type="button" aria-label="Abrir chat con Kitty" aria-expanded="false">
      <span class="cb-launcher__cat">${catSvg(52)}</span>
      <span class="cb-hint">¿Dudas? ¡Miau! 🐾</span>
    </button>
    <section class="cb-panel" role="dialog" aria-label="Chat con Kitty" hidden>
      <header class="cb-head">
        <span class="cb-head__cat">${catSvg(46)}</span>
        <div class="cb-head__text">
          <strong>Kitty</strong>
          <small>Respuestas referenciales · no reemplaza a tu equipo</small>
        </div>
        <button class="cb-close" type="button" aria-label="Cerrar chat">×</button>
      </header>
      <div class="cb-log" aria-live="polite"></div>
      <div class="cb-chips"></div>
      <form class="cb-form">
        <input class="cb-input" type="text" placeholder="Escribe tu duda…" aria-label="Tu pregunta" autocomplete="off" maxlength="300" />
        <button class="cb-send" type="submit" aria-label="Enviar">➤</button>
      </form>
    </section>`
  document.body.append(root)

  const $ = <T extends Element>(s: string) => root.querySelector(s) as T
  const launcher = $<HTMLButtonElement>('.cb-launcher')
  const panel = $<HTMLElement>('.cb-panel')
  const log = $<HTMLDivElement>('.cb-log')
  const chips = $<HTMLDivElement>('.cb-chips')
  const form = $<HTMLFormElement>('.cb-form')
  const input = $<HTMLInputElement>('.cb-input')
  const headCat = $<HTMLElement>('.cb-head__cat')

  let started = false
  let busy = false
  let lastQuestion = ''
  const timers: number[] = []

  const scrollDown = () => log.scrollTo({ top: log.scrollHeight, behavior: reduceMotion() ? 'auto' : 'smooth' })

  const addUser = (text: string) => {
    const el = document.createElement('div')
    el.className = 'cb-msg cb-msg--me'
    el.textContent = text
    log.append(el)
    scrollDown()
  }

  const runAction = (a: BotAction) => {
    if (a.ask) return ask(a.ask)
    if (a.save) {
      if (!lastQuestion || !opts.onSaveQuestion) return
      opts.onSaveQuestion(lastQuestion)
      addBot({ text: `¡Listo! Guardé «${lastQuestion}» en **Mis preguntas** para tu próximo control 📝` })
    }
  }

  const addBot = (r: BotReply) => {
    const el = document.createElement('div')
    el.className = `cb-msg cb-msg--bot${r.urgent ? ' cb-msg--urgent' : ''}`
    el.innerHTML = `<div>${format(r.text)}</div>`
    const actions = (r.actions ?? []).filter((a) => !a.save || opts.onSaveQuestion)
    if (actions.length) {
      const row = document.createElement('div')
      row.className = 'cb-actions'
      actions.forEach((a) => {
        let node: HTMLElement
        if (a.href) {
          const link = document.createElement('a')
          link.href = a.href
          link.addEventListener('click', () => {
            // Dentro de la página: cerrar el chat para ver el destino.
            if (a.href!.startsWith('#')) close()
          })
          node = link
        } else {
          node = document.createElement('button')
          ;(node as HTMLButtonElement).type = 'button'
          node.addEventListener('click', () => runAction(a))
        }
        node.className = 'cb-action'
        node.textContent = a.label
        row.append(node)
      })
      el.append(row)
    }
    log.append(el)
    scrollDown()
  }

  const setChips = (list: string[], label?: string) => {
    chips.innerHTML = ''
    if (label) {
      const l = document.createElement('span')
      l.className = 'cb-chips__label'
      l.textContent = label
      chips.append(l)
    }
    list.forEach((q) => {
      const b = document.createElement('button')
      b.type = 'button'
      b.className = 'cb-chip'
      b.textContent = q.length > 60 ? q.slice(0, 57) + '…' : q
      b.title = q
      b.addEventListener('click', () => ask(q))
      chips.append(b)
    })
  }

  /** Simula que Kitty escribe (boca abierta + puntos) antes de responder. */
  function ask(q: string) {
    const text = q.trim()
    if (!text || busy) return
    busy = true
    lastQuestion = text
    addUser(text)
    input.value = ''
    const typing = document.createElement('div')
    typing.className = 'cb-msg cb-msg--bot cb-typing'
    typing.innerHTML = '<span></span><span></span><span></span>'
    log.append(typing)
    headCat.classList.add('is-talking')
    scrollDown()
    const r = reply(text, opts.audience)
    const delay = reduceMotion() ? 50 : Math.min(1400, 450 + r.text.length * 4)
    timers.push(
      window.setTimeout(() => {
        typing.remove()
        headCat.classList.remove('is-talking')
        addBot(r)
        busy = false
        refreshChips()
      }, delay),
    )
  }

  const refreshChips = () => {
    const pending = opts.pendingQuestions?.() ?? []
    if (pending.length) setChips(pending.slice(0, 4), 'Tus dudas pendientes:')
    else setChips(SUGGESTIONS[opts.audience])
  }

  const greet = () => {
    started = true
    const pending = opts.pendingQuestions?.() ?? []
    addBot({
      text:
        '¡Miau! Soy **Kitty** 🐾, el gatito de Cérvix-B.\n\n' +
        (opts.audience === 'app'
          ? 'Puedo responder dudas sobre tu recuperación, el VPH y cómo usar la app. Si notas algo grave, te diré que vayas a urgencias.'
          : 'Puedo contarte de qué se trata el proyecto, cómo funciona la app y resolver dudas frecuentes.'),
    })
    if (pending.length) {
      addBot({
        text: `Tienes **${pending.length} ${pending.length === 1 ? 'pregunta anotada' : 'preguntas anotadas'}** para tu control. Toca una y te cuento lo que sé 👇`,
      })
    }
    refreshChips()
  }

  function open() {
    panel.hidden = false
    root.classList.add('is-open')
    launcher.setAttribute('aria-expanded', 'true')
    if (!started) greet()
    else refreshChips()
    setTimeout(() => input.focus({ preventScroll: true }), 50)
  }
  function close() {
    root.classList.remove('is-open')
    launcher.setAttribute('aria-expanded', 'false')
    timers.push(window.setTimeout(() => (panel.hidden = true), reduceMotion() ? 0 : 220))
  }

  launcher.addEventListener('click', () => (root.classList.contains('is-open') ? close() : open()))
  $<HTMLButtonElement>('.cb-close').addEventListener('click', () => {
    close()
    launcher.focus()
  })
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    ask(input.value)
  })
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && root.classList.contains('is-open')) {
      close()
      launcher.focus()
    }
  }
  document.addEventListener('keydown', onKey)

  // El globito «¿Dudas?» aparece un momento al cargar.
  timers.push(window.setTimeout(() => root.classList.add('show-hint'), 1500))
  timers.push(window.setTimeout(() => root.classList.remove('show-hint'), 7500))

  return () => {
    timers.forEach(clearTimeout)
    document.removeEventListener('keydown', onKey)
    root.remove()
  }
}

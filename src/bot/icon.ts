// Ícono de Lía, la asistente de Cérvix-B: círculo con globo de chat y corazón.

let n = 0

/** SVG del ícono circular (sirve en el botón del chat, su encabezado y la bienvenida). */
export function chatIcon(size = 56, title = 'Lía, asistente de Cérvix-B'): string {
  const id = `lia-g${n++}`
  const label = title ? `role="img" aria-label="${title}"` : 'aria-hidden="true"'
  return `<svg class="lia-icon" width="${size}" height="${size}" viewBox="0 0 64 64" ${label}>
    <defs>
      <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#7a4b94"/>
        <stop offset="1" stop-color="#d9609c"/>
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="32" fill="url(#${id})"/>
    <path d="M17 22.5c0-3.6 2.9-6.5 6.5-6.5h17c3.6 0 6.5 2.9 6.5 6.5v12c0 3.6-2.9 6.5-6.5 6.5H30l-7.6 6.3c-.9.8-2.4.1-2.4-1.1V41c-1.8-1.1-3-3.1-3-5.4Z" fill="#fff"/>
    <path d="M32 36.5s-7-4.3-7-8.9c0-2.2 1.7-3.9 3.8-3.9 1.4 0 2.6.8 3.2 1.9.6-1.1 1.8-1.9 3.2-1.9 2.1 0 3.8 1.7 3.8 3.9 0 4.6-7 8.9-7 8.9Z" fill="url(#${id})"/>
  </svg>`
}

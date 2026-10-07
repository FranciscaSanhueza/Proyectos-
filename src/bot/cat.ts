// Kitty: gatito blanco en pixel art (20 × 16), dibujado con rectángulos SVG.
// Leyenda: o contorno · w blanco · s sombra · p rosado · e ojo · c collar · y cascabel

const GRID = [
  '...o........o.......',
  '..owo......owo......',
  '..owpo....opwo......',
  '..owwoooooowwo......',
  '.owwwwwwwwwwwwo.....',
  '.owwewwwwwwewwo.....',
  '.owwewwwwwwewwo.....',
  '.owswwwppwwwswo.....',
  '..owwwowwowwwo......',
  '..occcccyccccco..oo.',
  '..owwwwwwwwwwwo.owwo',
  '..owwwwwwwwwwwo.owo.',
  '.owwwwwwwwwwwwwoowo.',
  '.owwwwwwwwwwwwwwwo..',
  '.owwwowwwwowwwwwo...',
  '..ooo.oooo.ooooo....',
]

const COLORS: Record<string, string> = {
  o: '#3b2f4a',
  w: '#ffffff',
  s: '#e2daec',
  p: '#f4a4c4',
  e: '#1e1a28',
  c: '#7a4b94',
  y: '#f5c83c',
}

/** SVG del gato. Los ojos parpadean, la cola se mueve y la boca se abre al «hablar». */
export function catSvg(size = 48, title = 'Kitty, el gato de Cérvix-B'): string {
  const body: string[] = []
  const tail: string[] = []
  const eyes: string[] = []
  GRID.forEach((row, y) => {
    ;[...row].forEach((ch, x) => {
      if (ch === '.') return
      const rect = `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${COLORS[ch]}"/>`
      if (ch === 'e') eyes.push(rect)
      else if (x >= 15 && y >= 9 && y <= 13) tail.push(rect)
      else body.push(rect)
    })
  })
  // Boca abierta (se muestra mientras escribe).
  const mouth = `<g class="cb-mouth"><rect x="7" y="8" width="2" height="1" fill="#e86a9a"/></g>`
  return `<svg class="cb-cat" width="${size}" height="${Math.round((size * 16) / 20)}" viewBox="0 0 20 16" shape-rendering="crispEdges" role="img" aria-label="${title}">
<g class="cb-tail">${tail.join('')}</g>${body.join('')}<g class="cb-eyes">${eyes.join('')}</g>${mouth}</svg>`
}

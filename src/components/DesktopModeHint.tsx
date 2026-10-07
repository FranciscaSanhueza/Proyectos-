import { useState } from 'react'
import { Monitor, X } from 'lucide-react'

const KEY = 'cervixb-hide-desktop-hint'

/**
 * En un teléfono con «Sitio de escritorio» activado el navegador dibuja la
 * página a ~980 px de ancho y todo se ve diminuto. Lo detectamos (pantalla
 * táctil pequeña + ventana muy ancha) y explicamos cómo desactivarlo.
 */
function isPhoneInDesktopMode() {
  try {
    const touch = matchMedia('(pointer: coarse)').matches
    const smallScreen = Math.min(screen.width, screen.height) < 600
    return touch && smallScreen && window.innerWidth > 800
  } catch {
    return false
  }
}

export function DesktopModeHint() {
  const [hidden, setHidden] = useState(() => {
    try {
      return sessionStorage.getItem(KEY) === '1'
    } catch {
      return false
    }
  })
  if (hidden || !isPhoneInDesktopMode()) return null

  const close = () => {
    setHidden(true)
    try {
      sessionStorage.setItem(KEY, '1')
    } catch {
      // Sin almacenamiento: se oculta solo en esta vista.
    }
  }

  return (
    <div className="desktop-hint" role="status">
      <Monitor size={22} />
      <p>
        Estás viendo la <b>versión de escritorio</b>. Para ver la app a tamaño normal, abre el menú <b>⋮</b> del navegador y
        desactiva <b>«Sitio de escritorio»</b>.
      </p>
      <button onClick={close} aria-label="Cerrar aviso">
        <X size={18} />
      </button>
    </div>
  )
}

import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { LifeBuoy } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { haptic } from '../utils'
import { HelpSheet } from './Help'

/** Botón «Ayuda» siempre a mano (salvo en el chat, la encuesta y el modo simple, que ya lo tiene). */
export function HelpFab() {
  const { pathname } = useLocation()
  const { prefs } = useApp()
  const [open, setOpen] = useState(false)
  const hidden = pathname.includes('/chat/') || pathname.endsWith('/encuesta') || (prefs.simpleMode && pathname === '/paciente')
  return (
    <>
      {!hidden && (
        <button
          className="help-fab"
          onClick={() => {
            haptic([15, 30, 15])
            setOpen(true)
          }}
          aria-label="Necesito ayuda: urgencias y 131"
        >
          <LifeBuoy size={20} /> Ayuda
        </button>
      )}
      <HelpSheet open={open} onClose={() => setOpen(false)} />
    </>
  )
}

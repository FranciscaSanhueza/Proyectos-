import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { LifeBuoy, MapPin, MessageCircle, PhoneCall, X } from 'lucide-react'
import { SlideToCall } from './SlideToCall'

/** Hoja de ayuda: llamar al 131 deslizando, urgencias cercanas, Salud Responde y el equipo. */
export function HelpSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return createPortal(
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="help-title" onClick={(e) => e.stopPropagation()}>
        <span className="sheet__grab" aria-hidden />
        <div className="sheet__head">
          <h2 id="help-title"><LifeBuoy size={22} /> ¿Necesitas ayuda?</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar"><X size={20} /></button>
        </div>
        <p className="sheet__lead">
          Si tienes <b>sangrado abundante, fiebre sobre 38 °C o dolor intenso</b>, es una urgencia.
        </p>
        <SlideToCall phone="131" label="Desliza para llamar al SAMU 131" />
        <a className="sheet__row" href="https://www.google.com/maps/search/servicio+de+urgencia+cerca+de+mi" target="_blank" rel="noreferrer">
          <span className="sheet__icon sheet__icon--map"><MapPin size={20} /></span>
          <span><strong>Urgencias cercanas</strong><small>Abre el mapa con el servicio de urgencia más cercano</small></span>
        </a>
        <a className="sheet__row" href="tel:6003607777">
          <span className="sheet__icon"><PhoneCall size={20} /></span>
          <span><strong>Salud Responde</strong><small>600 360 7777 · orientación las 24 horas</small></span>
        </a>
        <button
          className="sheet__row"
          onClick={() => {
            onClose()
            navigate('/paciente/chat/d1')
          }}
        >
          <span className="sheet__icon"><MessageCircle size={20} /></span>
          <span><strong>Escribir a mi equipo</strong><small>Para dudas que no son urgentes</small></span>
        </button>
      </div>
    </div>,
    document.body,
  )
}

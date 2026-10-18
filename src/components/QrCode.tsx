import { useMemo } from 'react'
import { createPortal } from 'react-dom'
import qrcode from 'qrcode-generator'
import { QrCode as QrIcon, X } from 'lucide-react'

/** Código QR en SVG (negro sobre blanco para que cualquier cámara lo lea). */
export function QrCode({ value, size = 220 }: { value: string; size?: number }) {
  const path = useMemo(() => {
    const qr = qrcode(0, 'M')
    qr.addData(value)
    qr.make()
    const n = qr.getModuleCount()
    let d = ''
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c + 4} ${r + 4}h1v1h-1z`
    return { d, n: n + 8 }
  }, [value])
  return (
    <svg className="qr" width={size} height={size} viewBox={`0 0 ${path.n} ${path.n}`} role="img" aria-label="Código QR para activar la app" shapeRendering="crispEdges">
      <rect width={path.n} height={path.n} fill="#fff" />
      <path d={path.d} fill="#111" />
    </svg>
  )
}

/** Enlace que activa la app de una paciente al escanearlo con la cámara del celular. */
export const activationUrl = (rut: string, code: string) =>
  `${location.origin}${location.pathname}#/activar?rut=${encodeURIComponent(rut)}&code=${encodeURIComponent(code)}`

/** Ventana con el QR que el médico muestra en la consulta (como WhatsApp Web). */
export function QrModal({ name, rut, code, onClose }: { name: string; rut: string; code: string; onClose: () => void }) {
  return createPortal(
    <div className="sheet-backdrop sheet-backdrop--center" onClick={onClose}>
      <div className="qr-modal pop-in" role="dialog" aria-modal="true" aria-labelledby="qr-title" onClick={(e) => e.stopPropagation()}>
        <button className="icon-btn qr-modal__close" onClick={onClose} aria-label="Cerrar"><X size={20} /></button>
        <span className="qr-modal__icon"><QrIcon size={22} /></span>
        <h2 id="qr-title">Activar la app de {name.split(' ')[0]}</h2>
        <p>Pídele que apunte la <b>cámara de su celular</b> a este código y toque el enlace que aparece.</p>
        <QrCode value={activationUrl(rut, code)} />
        <p className="qr-modal__code">
          ¿No tiene cámara? Ingresa con su RUT y el código <b>{code}</b>
        </p>
      </div>
    </div>,
    document.body,
  )
}

import { useEffect } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { normalizeRut } from '../utils'

/** Entrada por QR: #/activar?rut=…&code=… inicia sesión de la paciente sin escribir nada. */
export function Activar() {
  const [params] = useSearchParams()
  const { patients, login, session } = useApp()
  const rut = params.get('rut') ?? ''
  const code = (params.get('code') ?? '').toUpperCase()
  const patient = patients.find((p) => normalizeRut(p.rut) === normalizeRut(rut) && p.code.toUpperCase() === code && p.status === 'activa')

  useEffect(() => {
    if (patient) login({ role: 'paciente', patientId: patient.id })
    // Solo al abrir el enlace.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (patient && session?.patientId === patient.id) return <Navigate to="/paciente" replace />
  if (patient) return null
  return (
    <div className="login">
      <div className="card activar">
        <h1>No pudimos activar tu app</h1>
        <p>El código QR no es válido o ya no está vigente. Pídele uno nuevo a tu equipo de salud o ingresa con tu RUT y código.</p>
        <Link className="btn btn--primary btn--block" to="/">Ir al inicio de sesión</Link>
      </div>
    </div>
  )
}

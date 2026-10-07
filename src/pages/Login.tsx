import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Stethoscope, UserRound } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { normalizeRut } from '../utils'

export function Login() {
  const { login, patients } = useApp()
  const navigate = useNavigate()
  const [rut, setRut] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const patient = patients.find(
      (p) => normalizeRut(p.rut) === normalizeRut(rut) && p.code.toUpperCase() === code.trim().toUpperCase() && p.status === 'activa',
    )
    if (!patient) {
      setError('RUT o código incorrecto. Revisa el código que te entregó tu médico.')
      return
    }
    login({ role: 'paciente', patientId: patient.id })
    navigate('/paciente')
  }

  const enterAsDemoPatient = () => {
    login({ role: 'paciente', patientId: patients[0].id })
    navigate('/paciente')
  }
  const enterAsDoctor = () => {
    login({ role: 'medico' })
    navigate('/medico')
  }

  return (
    <div className="login">
      <div className="login__hero">
        <div className="login__logo">
          <Heart size={34} fill="currentColor" />
        </div>
        <h1>¡Bienvenida!</h1>
        <p>Te acompañamos paso a paso durante tu recuperación.</p>
      </div>

      <div className="quick-access">
        <p className="quick-access__title">Probar el prototipo como…</p>
        <div className="quick-access__grid">
          <button className="quick-card" onClick={enterAsDemoPatient}>
            <span className="quick-card__icon"><UserRound size={24} /></span>
            <strong>Paciente</strong>
            <small>María (datos de prueba)</small>
          </button>
          <button className="quick-card quick-card--doctor" onClick={enterAsDoctor}>
            <span className="quick-card__icon"><Stethoscope size={24} /></span>
            <strong>Profesional</strong>
            <small>Dra. Camila Rojas</small>
          </button>
        </div>
      </div>

      <p className="login__or">o ingresa con tu código</p>

      <form className="login__form" onSubmit={submit}>
        <label htmlFor="rut">Ingresa tu RUT</label>
        <input id="rut" value={rut} onChange={(e) => setRut(e.target.value)} placeholder="12.345.678-9" autoComplete="username" />

        <label htmlFor="code">Ingresa el código entregado por tu médico</label>
        <input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Ej: CERVIX1" autoCapitalize="characters" />

        {error && <p className="form__error">{error}</p>}

        <button className="btn btn--primary btn--block" type="submit" disabled={!rut || !code}>
          Acceder
        </button>
      </form>

      <p className="login__foot">Prototipo académico · Cérvix B · FCFM Universidad de Chile</p>
    </div>
  )
}

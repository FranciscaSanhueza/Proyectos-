import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Stethoscope } from 'lucide-react'
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

  const demo = () => {
    setRut(patients[0].rut)
    setCode(patients[0].code)
    setError('')
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

      <form className="login__form" onSubmit={submit}>
        <label htmlFor="rut">Ingresa tu RUT</label>
        <input id="rut" value={rut} onChange={(e) => setRut(e.target.value)} placeholder="12.345.678-9" autoComplete="username" />

        <label htmlFor="code">Ingresa el código entregado por tu médico</label>
        <input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Ej: CERVIX1" autoCapitalize="characters" />

        {error && <p className="form__error">{error}</p>}

        <button className="btn btn--primary btn--block" type="submit" disabled={!rut || !code}>
          Acceder
        </button>
        <button type="button" className="link-btn" onClick={demo}>
          Usar paciente de prueba
        </button>
      </form>

      <button
        className="role-card"
        onClick={() => {
          login({ role: 'medico' })
          navigate('/medico')
        }}
      >
        <span className="role-card__icon"><Stethoscope size={22} /></span>
        <span>
          <strong>Soy profesional de salud</strong>
          <small>Configura planes, revisa encuestas y responde dudas</small>
        </span>
      </button>

      <p className="login__foot">Prototipo académico · Cérvix B · FCFM Universidad de Chile</p>
    </div>
  )
}

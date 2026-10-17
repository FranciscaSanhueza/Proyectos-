import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Languages, RotateCcw, Stethoscope, UserRound } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { normalizeRut } from '../utils'
import { catSvg } from '../bot/cat'

export function Login() {
  const { login, patients, resetAll } = useApp()
  const navigate = useNavigate()
  const [rut, setRut] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [resetDone, setResetDone] = useState(false)

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
  // Modo presentación: deja los datos de prueba como al inicio antes de cada demo.
  const resetForDemo = () => {
    if (!window.confirm('¿Reiniciar la demo? Se borran los cambios hechos en este dispositivo y vuelven los datos de prueba.')) return
    resetAll()
    setRut('')
    setCode('')
    setError('')
    setResetDone(true)
  }
  const enterAsDoctor = () => {
    login({ role: 'medico' })
    navigate('/medico')
  }

  return (
    <div className="login">
      <div className="login__hero">
        <span className="login__bubble login__bubble--a" aria-hidden />
        <span className="login__bubble login__bubble--b" aria-hidden />
        <div className="login__brand">
          <span className="login__logo"><Heart size={26} fill="currentColor" /></span>
          Cérvix-B
        </div>
        <h1>¡Bienvenida!</h1>
        <p>Te acompañamos paso a paso desde el alta hasta tu control.</p>
        <ul className="login__pills" aria-label="Semáforo de síntomas">
          <li><i className="dot-l dot-l--verde" /> Esperado</li>
          <li><i className="dot-l dot-l--amarillo" /> Consulta</li>
          <li><i className="dot-l dot-l--rojo" /> Urgencia</li>
        </ul>
        <span className="login__cat" aria-hidden dangerouslySetInnerHTML={{ __html: catSvg(52, '') }} />
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

      <div className="login__demo">
        <button className="link-btn" onClick={() => navigate('/idiomas')}>
          <Languages size={15} /> English · Kreyòl ayisyen
        </button>
        <button className="link-btn" onClick={resetForDemo}>
          <RotateCcw size={15} /> Reiniciar demo (modo presentación)
        </button>
        {resetDone && <small className="pop-in">Listo: la demo quedó como nueva ✨</small>}
      </div>

      <p className="login__foot">Prototipo académico · Cérvix B · FCFM Universidad de Chile</p>
    </div>
  )
}

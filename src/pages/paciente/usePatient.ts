import { useApp } from '../../context/AppContext'

/** Datos de la paciente con sesión iniciada. */
export function usePatient() {
  const app = useApp()
  const patientId = app.session!.patientId!
  const patient = app.patients.find((p) => p.id === patientId)!
  const plan = app.plans.find((p) => p.patientId === patientId)!
  return { ...app, patientId, patient, plan }
}

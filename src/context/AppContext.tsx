import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Alert, Message, Prefs, RecoveryPlan, Reminder, Role, SurveyResponse } from '../types'
import { initialAlerts, initialMessages, initialPlans, initialReminders, initialResponses } from '../data/mock'

// Estado global de la app. Por ahora vive en el navegador (localStorage);
// cuando exista un backend, estas funciones pasan a llamar a la API.

interface Session {
  role: Role
  /** Paciente que inició sesión (solo en la vista paciente). */
  patientId?: string
}

interface State {
  session: Session | null
  messages: Message[]
  plans: RecoveryPlan[]
  responses: SurveyResponse[]
  reminders: Reminder[]
  alerts: Alert[]
  prefs: Prefs
}

interface AppContextValue extends State {
  login: (session: Session) => void
  logout: () => void
  sendMessage: (m: Omit<Message, 'id' | 'at' | 'read'>) => void
  markThreadRead: (patientId: string, staffId: string, reader: Role) => void
  submitSurvey: (r: Omit<SurveyResponse, 'id' | 'at'>) => void
  addReminder: (r: Omit<Reminder, 'id'>) => void
  removeReminder: (id: string) => void
  savePlan: (plan: RecoveryPlan) => void
  reviewAlert: (id: string) => void
  setPrefs: (p: Partial<Prefs>) => void
  markNotified: (keys: string[]) => void
  resetDemo: () => void
}

const STORAGE_KEY = 'cervixb-state-v3'

const initialState: State = {
  session: null,
  messages: initialMessages,
  plans: initialPlans,
  responses: initialResponses,
  reminders: initialReminders,
  alerts: initialAlerts,
  prefs: { textSize: 'normal', notifications: false, notified: [] },
}

function loadState(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...initialState, ...JSON.parse(raw) }
  } catch {
    // Almacenamiento no disponible: se usan los datos de ejemplo.
  }
  return initialState
}

const uid = () => Math.random().toString(36).slice(2, 10)

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(loadState)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Ignorar: la app funciona igual sin persistencia.
    }
  }, [state])

  const value: AppContextValue = {
    ...state,
    login: (session) => setState((s) => ({ ...s, session })),
    logout: () => setState((s) => ({ ...s, session: null })),
    sendMessage: (m) =>
      setState((s) => ({
        ...s,
        messages: [...s.messages, { ...m, id: uid(), at: new Date().toISOString(), read: false }],
      })),
    markThreadRead: (patientId, staffId, reader) =>
      setState((s) => {
        const pending = s.messages.some(
          (m) => m.patientId === patientId && m.staffId === staffId && m.from !== reader && !m.read,
        )
        if (!pending) return s
        return {
          ...s,
          messages: s.messages.map((m) =>
            m.patientId === patientId && m.staffId === staffId && m.from !== reader ? { ...m, read: true } : m,
          ),
        }
      }),
    submitSurvey: (r) =>
      setState((s) => {
        const at = new Date().toISOString()
        const { level } = r
        // Amarillo o rojo: se avisa al equipo médico en su panel.
        const alerts =
          level === 'verde' ? s.alerts : [{ id: uid(), patientId: r.patientId, level, at, reviewed: false }, ...s.alerts]
        return { ...s, alerts, responses: [{ ...r, id: uid(), at }, ...s.responses] }
      }),
    addReminder: (r) => setState((s) => ({ ...s, reminders: [...s.reminders, { ...r, id: uid() }] })),
    removeReminder: (id) => setState((s) => ({ ...s, reminders: s.reminders.filter((r) => r.id !== id) })),
    savePlan: (plan) =>
      setState((s) => ({
        ...s,
        plans: s.plans.map((p) => (p.patientId === plan.patientId ? plan : p)),
      })),
    reviewAlert: (id) =>
      setState((s) => ({ ...s, alerts: s.alerts.map((a) => (a.id === id ? { ...a, reviewed: true } : a)) })),
    setPrefs: (p) => setState((s) => ({ ...s, prefs: { ...s.prefs, ...p } })),
    markNotified: (keys) =>
      setState((s) => ({ ...s, prefs: { ...s.prefs, notified: [...s.prefs.notified, ...keys].slice(-200) } })),
    resetDemo: () => setState({ ...initialState, session: state.session, prefs: state.prefs }),
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>')
  return ctx
}

import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CalendarDays, ClipboardList, Home, LayoutDashboard, MessageCircle, Smile, Users } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { useApp } from './context/AppContext'
import { currentDoctor } from './data/mock'
import type { Role } from './types'
import { Layout } from './components/Layout'
import { CatBot } from './components/CatBot'
import { Login } from './pages/Login'
import { Inicio } from './pages/paciente/Inicio'
import { Semaforo } from './pages/paciente/Semaforo'
import { Encuesta } from './pages/paciente/Encuesta'
import { Calendario } from './pages/paciente/Calendario'
import { ChatDudas, ChatHilo } from './pages/paciente/ChatDudas'
import { MiPlan } from './pages/paciente/MiPlan'
import { Ajustes } from './pages/paciente/Ajustes'
import { Calma } from './pages/paciente/Calma'
import { Aprende } from './pages/paciente/Aprende'
import { Preguntas } from './pages/paciente/Preguntas'
import { Camino } from './pages/paciente/Camino'
import { useReminderNotifications } from './pages/paciente/useReminderNotifications'
import { Panel } from './pages/medico/Panel'
import { PacienteDetalle } from './pages/medico/PacienteDetalle'
import { Pacientes } from './pages/medico/Pacientes'
import { NuevaPaciente } from './pages/medico/NuevaPaciente'
import { Mensajes } from './pages/medico/Mensajes'

function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { session } = useApp()
  if (session?.role !== role) return <Navigate to="/" replace />
  return children
}

function PacienteLayout() {
  const { session, messages } = useApp()
  const unread = messages.filter((m) => m.patientId === session?.patientId && m.from === 'medico' && !m.read).length
  useReminderNotifications()
  // Mismo orden que la barra del prototipo: inicio, calendario, semáforo, chat, mi plan.
  return (
    <>
      <CatBot />
      <Layout
        nav={[
          { to: '/paciente', label: 'Inicio', icon: Home, end: true },
          { to: '/paciente/calendario', label: 'Calendario', icon: CalendarDays },
          { to: '/paciente/semaforo', label: 'Semáforo', icon: Smile },
          { to: '/paciente/chat', label: 'Chat', icon: MessageCircle, badge: unread },
          { to: '/paciente/plan', label: 'Mi plan', icon: ClipboardList },
        ]}
      />
    </>
  )
}

function MedicoLayout() {
  const { messages, alerts } = useApp()
  const unread = messages.filter((m) => m.staffId === currentDoctor.id && m.from === 'paciente' && !m.read).length
  const pendingAlerts = alerts.filter((a) => !a.reviewed).length
  return (
    <Layout
      nav={[
        { to: '/medico', label: 'Inicio', icon: LayoutDashboard, end: true, badge: pendingAlerts },
        { to: '/medico/pacientes', label: 'Pacientes', icon: Users },
        { to: '/medico/mensajes', label: 'Dudas', icon: MessageCircle, badge: unread },
      ]}
    />
  )
}

export function App() {
  const { session, prefs } = useApp()

  // Preferencias de Ajustes: tamaño de letra, tema de color y animaciones.
  useEffect(() => {
    const root = document.documentElement
    root.dataset.text = prefs.textSize
    root.dataset.theme = prefs.theme
    root.dataset.motion = prefs.calmMotion ? 'calm' : 'full'
  }, [prefs.textSize, prefs.theme, prefs.calmMotion])

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={session ? <Navigate to={`/${session.role}`} replace /> : <Login />} />

        <Route path="/paciente" element={<RequireRole role="paciente"><PacienteLayout /></RequireRole>}>
          <Route index element={<Inicio />} />
          <Route path="calendario" element={<Calendario />} />
          <Route path="semaforo" element={<Semaforo />} />
          <Route path="encuesta" element={<Encuesta />} />
          <Route path="chat" element={<ChatDudas />} />
          <Route path="chat/:staffId" element={<ChatHilo />} />
          <Route path="plan" element={<MiPlan />} />
          <Route path="ajustes" element={<Ajustes />} />
          <Route path="calma" element={<Calma />} />
          <Route path="aprende" element={<Aprende />} />
          <Route path="preguntas" element={<Preguntas />} />
          <Route path="camino" element={<Camino />} />
        </Route>

        <Route path="/medico" element={<RequireRole role="medico"><MedicoLayout /></RequireRole>}>
          <Route index element={<Panel />} />
          <Route path="pacientes" element={<Pacientes />} />
          <Route path="pacientes/nueva" element={<NuevaPaciente />} />
          <Route path="pacientes/:id" element={<PacienteDetalle />} />
          <Route path="mensajes" element={<Mensajes />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}

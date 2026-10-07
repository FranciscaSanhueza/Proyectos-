import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CalendarDays, ClipboardList, Home, LayoutDashboard, MessageCircle, Smile } from 'lucide-react'
import type { ReactNode } from 'react'
import { useApp } from './context/AppContext'
import { currentDoctor } from './data/mock'
import type { Role } from './types'
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { Inicio } from './pages/paciente/Inicio'
import { Semaforo } from './pages/paciente/Semaforo'
import { Encuesta } from './pages/paciente/Encuesta'
import { Calendario } from './pages/paciente/Calendario'
import { ChatDudas, ChatHilo } from './pages/paciente/ChatDudas'
import { MiPlan } from './pages/paciente/MiPlan'
import { Panel } from './pages/medico/Panel'
import { PacienteDetalle } from './pages/medico/PacienteDetalle'
import { Mensajes } from './pages/medico/Mensajes'

function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { session } = useApp()
  if (session?.role !== role) return <Navigate to="/" replace />
  return children
}

function PacienteLayout() {
  const { session, messages } = useApp()
  const unread = messages.filter((m) => m.patientId === session?.patientId && m.from === 'medico' && !m.read).length
  // Mismo orden que la barra del prototipo: inicio, calendario, semáforo, chat, mi plan.
  return (
    <Layout
      nav={[
        { to: '/paciente', label: 'Inicio', icon: Home, end: true },
        { to: '/paciente/calendario', label: 'Calendario', icon: CalendarDays },
        { to: '/paciente/semaforo', label: 'Semáforo', icon: Smile },
        { to: '/paciente/chat', label: 'Chat', icon: MessageCircle, badge: unread },
        { to: '/paciente/plan', label: 'Mi plan', icon: ClipboardList },
      ]}
    />
  )
}

function MedicoLayout() {
  const { messages } = useApp()
  const unread = messages.filter((m) => m.staffId === currentDoctor.id && m.from === 'paciente' && !m.read).length
  return (
    <Layout
      nav={[
        { to: '/medico', label: 'Pacientes', icon: LayoutDashboard, end: true },
        { to: '/medico/mensajes', label: 'Dudas', icon: MessageCircle, badge: unread },
      ]}
    />
  )
}

export function App() {
  const { session } = useApp()
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
        </Route>

        <Route path="/medico" element={<RequireRole role="medico"><MedicoLayout /></RequireRole>}>
          <Route index element={<Panel />} />
          <Route path="pacientes/:id" element={<PacienteDetalle />} />
          <Route path="mensajes" element={<Mensajes />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}

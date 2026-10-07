import { useNavigate, useParams } from 'react-router-dom'
import { Chat } from '../../components/Chat'
import { Avatar, Badge, Card, PageHeader } from '../../components/ui'
import { staff } from '../../data/mock'
import { formatDate } from '../../utils'
import { usePatient } from './usePatient'

export function ChatDudas() {
  const { patientId, messages } = usePatient()
  const navigate = useNavigate()

  return (
    <div className="page">
      <PageHeader title="Chat dudas" subtitle="Tu equipo de salud responde en horario hábil" />
      <p className="notice">Este chat no es para urgencias. Si tu semáforo está en rojo, acude a urgencias o llama al 131.</p>
      <div className="stack">
        {staff.map((s) => {
          const thread = messages.filter((m) => m.patientId === patientId && m.staffId === s.id)
          const last = thread[thread.length - 1]
          const unread = thread.filter((m) => m.from === 'medico' && !m.read).length
          return (
            <Card key={s.id} className="list-row" onClick={() => navigate(`/paciente/chat/${s.id}`)}>
              <Avatar name={s.name} />
              <div className="list-row__text">
                <strong>{s.name}</strong>
                <small>{last ? last.text : s.role}</small>
              </div>
              <div className="list-row__end">
                {last && <time>{formatDate(last.at)}</time>}
                {unread > 0 && <Badge tone="primary">{unread}</Badge>}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export function ChatHilo() {
  const { staffId } = useParams()
  const { patientId } = usePatient()
  const member = staff.find((s) => s.id === staffId) ?? staff[0]
  return (
    <div className="page page--chat">
      <PageHeader title={member.name} subtitle={member.role} back />
      <Chat patientId={patientId} staffId={member.id} me="paciente" />
    </div>
  )
}

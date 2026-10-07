import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { currentDoctor } from '../../data/mock'
import { Avatar, Badge, Card, Empty, PageHeader } from '../../components/ui'
import { formatDate } from '../../utils'

export function Mensajes() {
  const { messages, patients } = useApp()
  const navigate = useNavigate()

  const threads = patients
    .map((p) => {
      const thread = messages.filter((m) => m.patientId === p.id && m.staffId === currentDoctor.id)
      return {
        patient: p,
        last: thread[thread.length - 1],
        unread: thread.filter((m) => m.from === 'paciente' && !m.read).length,
      }
    })
    .filter((t) => t.last)
    .sort((a, b) => b.last.at.localeCompare(a.last.at))

  return (
    <div className="page">
      <PageHeader title="Dudas de pacientes" subtitle="Responde y clasifica: verde, amarillo o rojo" />
      {threads.length === 0 && <Empty>No hay conversaciones.</Empty>}
      <div className="stack">
        {threads.map(({ patient, last, unread }) => (
          <Card key={patient.id} className="list-row" onClick={() => navigate(`/medico/pacientes/${patient.id}?tab=chat`)}>
            <Avatar name={patient.name} />
            <div className="list-row__text">
              <strong>{patient.name}</strong>
              <small>{last.from === 'medico' ? 'Tú: ' : ''}{last.text}</small>
            </div>
            <div className="list-row__end">
              <time>{formatDate(last.at)}</time>
              {unread > 0 && <Badge tone="primary">{unread}</Badge>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

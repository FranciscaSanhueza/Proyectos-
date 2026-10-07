import { AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react'
import { Card, PageHeader, SectionTitle } from '../../components/ui'
import { formatShortDate, recoveryWeek } from '../../utils'
import { usePatient } from './usePatient'

export function MiPlan() {
  const { plan } = usePatient()

  return (
    <div className="page">
      <PageHeader title="Mi plan" subtitle={`Actualización: ${formatShortDate(plan.updatedAt)}`} />

      {plan.validated ? (
        <p className="trust trust--box"><ShieldCheck size={18} /> Plan revisado y validado por {plan.validatedBy}</p>
      ) : (
        <p className="notice">Tu médico aún está revisando este plan. Te avisaremos cuando esté validado.</p>
      )}

      <SectionTitle>Plan actual</SectionTitle>
      <Card>
        <dl className="plan-facts">
          <dt>Procedimiento</dt>
          <dd>{plan.procedure}</dd>
          <dt>Diagnóstico</dt>
          <dd>{plan.diagnosis}</dd>
          <dt>Semana</dt>
          <dd>{recoveryWeek(plan)} de recuperación</dd>
          <dt>Próximo control</dt>
          <dd>{formatShortDate(plan.nextControl)}</dd>
        </dl>
      </Card>

      <SectionTitle>Cuidados de hoy</SectionTitle>
      <Card>
        <ul className="plan-list">
          {plan.cares.map((c) => (
            <li key={c}><CheckCircle2 size={18} className="accent" /> {c}</li>
          ))}
        </ul>
      </Card>

      <SectionTitle>Consulta si aparece</SectionTitle>
      <Card className="plan-warn">
        <ul className="plan-list">
          {plan.warnings.map((w) => (
            <li key={w}><AlertTriangle size={18} /> {w}</li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

import { useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { showNotification } from '../../notifications'
import { surveyStatus, toDayKey } from '../../utils'

/**
 * Muestra los avisos del día (recordatorios y encuesta disponible) una sola
 * vez, al abrir la app o al volver a ella.
 */
export function useReminderNotifications() {
  const { session, prefs, reminders, responses, markNotified } = useApp()
  const patientId = session?.patientId

  useEffect(() => {
    if (!patientId || !prefs.notifications) return

    const check = () => {
      const today = toDayKey(new Date())
      const pending: { key: string; title: string; body: string }[] = reminders
        .filter((r) => r.patientId === patientId && r.date === today)
        .map((r) => ({ key: `rem-${r.id}`, title: 'Recordatorio de hoy', body: `${r.time ? r.time + ' · ' : ''}${r.title}` }))
      if (surveyStatus(responses, patientId).available) {
        pending.push({ key: `survey-${today}`, title: 'Encuesta semanal disponible', body: 'Cuéntanos cómo te has sentido (5 minutos).' })
      }
      const fresh = pending.filter((n) => !prefs.notified.includes(n.key))
      if (fresh.length === 0) return
      fresh.forEach((n) => showNotification(n.title, n.body, n.key))
      markNotified(fresh.map((n) => n.key))
    }

    check()
    const onVisible = () => document.visibilityState === 'visible' && check()
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [patientId, prefs.notifications, prefs.notified.length, reminders.length, responses.length])
}

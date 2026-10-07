// Avisos del sistema (recordatorios y encuesta semanal).
//
// En el prototipo los avisos se muestran cuando la app se abre o vuelve a
// primer plano. Para recibirlos con la app cerrada se necesita un servidor
// que envíe notificaciones push (siguiente etapa, junto con el backend).

export const notificationsSupported = () => typeof window !== 'undefined' && 'Notification' in window

export async function requestNotificationPermission(): Promise<boolean> {
  if (!notificationsSupported()) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  return (await Notification.requestPermission()) === 'granted'
}

export async function showNotification(title: string, body: string, tag: string) {
  if (!notificationsSupported() || Notification.permission !== 'granted') return
  const options: NotificationOptions = { body, tag, icon: './icon-192.png', badge: './icon-192.png' }
  try {
    const reg = await navigator.serviceWorker?.getRegistration()
    if (reg) {
      await reg.showNotification(title, options)
      return
    }
  } catch {
    // Sin service worker: se usa la API básica.
  }
  new Notification(title, options)
}

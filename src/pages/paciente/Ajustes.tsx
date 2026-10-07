import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Download, LogOut, Palette, RotateCcw, Sparkles, Type } from 'lucide-react'
import { Card, PageHeader, SectionTitle } from '../../components/ui'
import { notificationsSupported, requestNotificationPermission, showNotification } from '../../notifications'
import type { TextSize, Theme } from '../../types'
import { usePatient } from './usePatient'

const SIZES: { id: TextSize; label: string }[] = [
  { id: 'normal', label: 'Normal' },
  { id: 'grande', label: 'Grande' },
  { id: 'muy-grande', label: 'Muy grande' },
]

const THEMES: { id: Theme; label: string; colors: [string, string] }[] = [
  { id: 'lavanda', label: 'Lavanda', colors: ['#7a4b94', '#fbe3f3'] },
  { id: 'rosa', label: 'Rosa', colors: ['#c2457f', '#ffe4ef'] },
  { id: 'menta', label: 'Menta', colors: ['#2a8a7e', '#dff5ef'] },
]

// Evento de Chrome/Android para ofrecer "Instalar app".
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
}

const isIOS = typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent)
const isStandalone = typeof window !== 'undefined' && window.matchMedia?.('(display-mode: standalone)').matches

export function Ajustes() {
  const { patient, prefs, setPrefs, logout, resetDemo } = usePatient()
  const navigate = useNavigate()
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null)
  const [notifMsg, setNotifMsg] = useState('')

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setInstallEvent(e as InstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  const toggleNotifications = async () => {
    if (prefs.notifications) {
      setPrefs({ notifications: false })
      setNotifMsg('Avisos desactivados.')
      return
    }
    const ok = await requestNotificationPermission()
    if (!ok) {
      setNotifMsg('Tu navegador no permitió los avisos. Puedes activarlos en la configuración del navegador.')
      return
    }
    setPrefs({ notifications: true })
    setNotifMsg('¡Listo! Te avisaremos de tus recordatorios y de la encuesta semanal.')
    showNotification('Cérvix B', 'Así se verán tus recordatorios 💜', 'cervixb-test')
  }

  return (
    <div className="page stagger">
      <PageHeader title="Ajustes" subtitle={patient.name} back />

      <SectionTitle><Palette size={18} className="accent" /> Colores de la app</SectionTitle>
      <Card>
        <div className="themes" role="radiogroup" aria-label="Tema de color">
          {THEMES.map((t) => (
            <button
              key={t.id}
              role="radio"
              aria-checked={prefs.theme === t.id}
              className={`theme-opt${prefs.theme === t.id ? ' is-active' : ''}`}
              onClick={() => setPrefs({ theme: t.id })}
            >
              <span className="theme-opt__swatch" style={{ background: `linear-gradient(135deg, ${t.colors[0]} 50%, ${t.colors[1]} 50%)` }} />
              {t.label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="setting-row">
        <Sparkles size={22} className="accent" />
        <div className="grow">
          <strong>Animaciones suaves</strong>
          <small className="muted">Desactívalas si te marean o prefieres una app más quieta.</small>
        </div>
        <button
          role="switch"
          aria-checked={!prefs.calmMotion}
          aria-label="Animaciones"
          className={`switch${!prefs.calmMotion ? ' is-on' : ''}`}
          onClick={() => setPrefs({ calmMotion: !prefs.calmMotion })}
        >
          <span />
        </button>
      </Card>

      <SectionTitle>Tamaño de la letra</SectionTitle>
      <Card>
        <div className="segmented" role="radiogroup" aria-label="Tamaño de la letra">
          {SIZES.map((s) => (
            <button
              key={s.id}
              role="radio"
              aria-checked={prefs.textSize === s.id}
              className={`segmented__opt segmented__opt--${s.id}${prefs.textSize === s.id ? ' is-active' : ''}`}
              onClick={() => setPrefs({ textSize: s.id })}
            >
              <Type size={16} /> {s.label}
            </button>
          ))}
        </div>
        <p className="muted small-gap">También puedes usar los botones «Escuchar» para oír tu plan, tu semáforo y las preguntas.</p>
      </Card>

      <SectionTitle>Avisos</SectionTitle>
      <Card className="setting-row">
        <Bell size={22} className="accent" />
        <div className="grow">
          <strong>Recordatorios y encuesta</strong>
          <small className="muted">
            {notificationsSupported() ? 'Recibe un aviso con tus recordatorios del día.' : 'Tu navegador no admite avisos.'}
          </small>
        </div>
        <button
          role="switch"
          aria-checked={prefs.notifications}
          aria-label="Activar avisos"
          className={`switch${prefs.notifications ? ' is-on' : ''}`}
          onClick={toggleNotifications}
          disabled={!notificationsSupported()}
        >
          <span />
        </button>
      </Card>
      {notifMsg && <p className="muted" role="status">{notifMsg}</p>}

      {!isStandalone && (
        <>
          <SectionTitle>Instalar en tu celular</SectionTitle>
          <Card className="setting-row">
            <Download size={22} className="accent" />
            <div className="grow">
              {installEvent ? (
                <>
                  <strong>Agrega Cérvix B a tu pantalla de inicio</strong>
                  <button className="btn btn--primary small-gap" onClick={() => installEvent.prompt()}>Instalar app</button>
                </>
              ) : isIOS ? (
                <small>En iPhone: toca <b>Compartir</b> y luego <b>«Agregar a inicio»</b>.</small>
              ) : (
                <small>En Android: abre el menú <b>⋮</b> del navegador y toca <b>«Instalar app»</b> o <b>«Agregar a la pantalla principal»</b>.</small>
              )}
            </div>
          </Card>
        </>
      )}

      <SectionTitle>Cuenta</SectionTitle>
      <div className="stack">
        <button className="btn btn--ghost btn--block" onClick={() => { logout(); navigate('/') }}>
          <LogOut size={18} /> Cerrar sesión / cambiar perfil
        </button>
        <button className="btn btn--ghost btn--block" onClick={resetDemo}>
          <RotateCcw size={18} /> Restablecer datos de ejemplo
        </button>
      </div>
    </div>
  )
}

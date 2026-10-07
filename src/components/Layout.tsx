import { NavLink, Outlet, useLocation } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  badge?: number
  /** Activo solo con la ruta exacta (para la pestaña de inicio). */
  end?: boolean
}

export function Layout({ nav }: { nav: NavItem[] }) {
  const { pathname } = useLocation()
  return (
    <div className="app-shell">
      {/* La key reinicia la animación de entrada en cada cambio de pantalla. */}
      <main className="app-content page-enter" key={pathname}>
        <Outlet />
      </main>
      <nav className="bottom-nav" aria-label="Navegación principal">
        {nav.map(({ to, label, icon: Icon, badge, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `bottom-nav__item${isActive ? ' is-active' : ''}`}>
            <span className="bottom-nav__icon">
              <Icon size={22} />
              {!!badge && <span className="dot-badge">{badge}</span>}
            </span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

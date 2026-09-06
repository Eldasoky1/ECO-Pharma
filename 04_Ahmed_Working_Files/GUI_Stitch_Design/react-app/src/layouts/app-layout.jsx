import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Boxes,
  Pill,
  Users,
  BarChart3,
  Settings,
  Search,
  Bell,
  Menu,
  Moon,
  Sun,
  HelpCircle,
  LogOut,
  Plus,
  Activity
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '../lib/utils'
import { useTheme } from '../components/theme-provider'
import { SpecularButton } from '../components/specular-button'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/inventory', label: 'Inventory', icon: Boxes },
  { to: '/prescriptions', label: 'Prescriptions', icon: Pill },
  { to: '/patients', label: 'Patients', icon: Users },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings }
]

function ThemeToggle({ className }) {
  const { theme, setTheme } = useTheme()
  const dark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      aria-label="Toggle dark mode"
      aria-pressed={dark}
      className={cn(
        'p-2 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer active:opacity-80',
        className
      )}
    >
      {dark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}

export default function AppLayout() {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="bg-background text-on-background flex h-screen overflow-hidden antialiased">
      <nav className="bg-surface-container-low flex flex-col h-full py-4 border-r border-outline-variant w-72 hidden md:flex flex-shrink-0 z-20">
        <div className="px-8 mb-8">
          <div className="flex items-center gap-4">
            <img className="w-12 h-12 rounded-full object-cover" src="/img/img_1.jpg" alt="Branch avatar" />
            <div>
              <h2 className="text-lg font-semibold text-primary">Main Branch</h2>
              <p className="text-xs text-primary">System Active</p>
            </div>
          </div>
        </div>

        <ul className="flex flex-col gap-2 px-2 flex-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-full mx-2 transition-colors duration-200',
                    isActive
                      ? 'bg-secondary-container text-on-secondary-container font-medium'
                      : 'text-on-surface-variant hover:bg-surface-variant'
                  )
                }
              >
                <Icon size={20} aria-hidden="true" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="px-2 mt-auto">
          <SpecularButton
            size="sm"
            className="w-full mb-4"
            onClick={() => navigate('/inventory')}
          >
            <Plus size={18} />
            New Prescription
          </SpecularButton>
          <ul className="flex flex-col gap-2">
            <li>
              <NavLink
                to="/settings"
                className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-surface-variant rounded-full mx-2 transition-colors duration-200"
              >
                <HelpCircle size={18} aria-hidden="true" />
                <span className="text-sm">Help Center</span>
              </NavLink>
            </li>
            <li>
              <Link
                to="/login"
                className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-surface-variant rounded-full mx-2 transition-colors duration-200"
              >
                <LogOut size={18} aria-hidden="true" />
                <span className="text-sm">Sign Out</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <nav className="absolute left-0 top-0 h-full w-72 bg-surface-container-low flex flex-col py-4 border-r border-outline-variant">
            <div className="px-8 mb-8 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-primary">Main Branch</h2>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="p-2 rounded-full text-on-surface-variant hover:bg-surface-variant"
              >
                <Menu size={20} />
              </button>
            </div>
            <ul className="flex flex-col gap-2 px-2">
              {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-4 py-3 rounded-full mx-2 transition-colors duration-200',
                        isActive
                          ? 'bg-secondary-container text-on-secondary-container font-medium'
                          : 'text-on-surface-variant hover:bg-surface-variant'
                      )
                    }
                  >
                    <Icon size={20} aria-hidden="true" />
                    <span>{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}

      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        <header className="bg-surface-container dark:bg-surface-container border-b border-outline-variant flex justify-between items-center w-full px-6 md:px-10 h-16 flex-shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-on-surface-variant p-2"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <h1 className="text-lg font-bold text-primary">
              Smart Eco-Pharma Hub
            </h1>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
              aria-hidden="true"
            />
            <input
              className="w-full bg-surface-container-high border-none rounded-full py-2 pl-10 pr-4 text-sm text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface outline-none transition-all"
              placeholder="Search records, patients..."
              type="text"
              aria-label="Search"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              className="p-2 text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer rounded-full"
              aria-label="Live sensors"
            >
              <Activity size={20} />
            </button>
            <button
              className="p-2 text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer rounded-full relative"
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
            </button>
            <Link to="/settings">
              <img
                src="/img/img_2.jpg"
                alt="Pharmacist profile avatar"
                className="ml-2 w-8 h-8 rounded-full object-cover border border-outline-variant block"
              />
            </Link>
            <ThemeToggle className="ml-1" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}

import { Bell, Palette, Shield, User } from 'lucide-react'
import { SpecularButton } from '../components/specular-button'
import { useTheme } from '../components/theme-provider'

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-7 rounded-full transition-colors ${
        checked ? 'bg-primary' : 'bg-outline'
      }`}
    >
      <span
        className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
      <div className="p-5 border-b border-outline-variant flex items-center gap-2 bg-surface-container-low/50">
        <Icon size={18} className="text-primary" aria-hidden="true" />
        <h3 className="font-medium text-on-surface">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )
}

function Row({ label, desc, children }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-on-surface">{label}</p>
        <p className="text-sm text-on-surface-variant">{desc}</p>
      </div>
      {children}
    </div>
  )
}

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const dark = theme === 'dark'

  return (
    <div className="relative max-w-3xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-on-background">Settings</h2>
        <p className="text-sm text-on-surface-variant mt-1">
          Manage branch profile, appearance, and notification preferences.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Section icon={User} title="Profile">
          <div className="flex items-center gap-4">
            <img
              src="/img/img_2.jpg"
              alt="Profile avatar"
              className="w-16 h-16 rounded-full object-cover border border-outline-variant"
            />
            <div>
              <p className="font-medium text-on-surface">Dr. Sarah Jenkins</p>
              <p className="text-sm text-on-surface-variant">Pharmacist · Main Branch</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-on-surface-variant mb-1" htmlFor="s-name">
                Full Name
              </label>
              <input
                id="s-name"
                defaultValue="Dr. Sarah Jenkins"
                className="w-full bg-surface-container-high border border-outline-variant text-on-surface text-sm rounded-full py-2.5 px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-on-surface-variant mb-1" htmlFor="s-email">
                Email
              </label>
              <input
                id="s-email"
                defaultValue="s.jenkins@ecopharma.local"
                className="w-full bg-surface-container-high border border-outline-variant text-on-surface text-sm rounded-full py-2.5 px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
          </div>
          <SpecularButton size="sm" className="mt-2">
            Save Changes
          </SpecularButton>
        </Section>

        <Section icon={Palette} title="Appearance">
          <Row
            label="Dark mode"
            desc="Uses the M3 teal palette in both themes."
          >
            <Toggle checked={dark} onChange={(v) => setTheme(v ? 'dark' : 'light')} label="Toggle dark mode" />
          </Row>
        </Section>

        <Section icon={Bell} title="Notifications">
          <Row label="Critical stock alerts" desc="Warn when stock falls below threshold.">
            <Toggle checked onChange={() => {}} label="Critical stock alerts" />
          </Row>
          <Row label="Temperature variances" desc="Notify on fridge/cold-chain excursions.">
            <Toggle checked onChange={() => {}} label="Temperature variance alerts" />
          </Row>
          <Row label="Weekly PV digest" desc="Email summary of pharmacovigilance signals.">
            <Toggle checked={false} onChange={() => {}} label="Weekly PV digest" />
          </Row>
        </Section>

        <Section icon={Shield} title="Security">
          <Row label="Two-factor authentication" desc="Add an extra layer of security.">
            <SpecularButton variant="neutral" size="sm">
              Enable
            </SpecularButton>
          </Row>
          <Row label="Session timeout" desc="Automatically sign out after inactivity.">
            <SpecularButton variant="ghost" size="sm">
              Configure
            </SpecularButton>
          </Row>
        </Section>
      </div>
    </div>
  )
}

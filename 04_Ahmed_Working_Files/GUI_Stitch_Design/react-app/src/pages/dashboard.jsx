import { useNavigate } from 'react-router-dom'
import {
  Pill,
  Wallet,
  TriangleAlert,
  BellRing,
  FlaskConical,
  Syringe,
  TrendingDown,
  Thermometer,
  ShieldCheck,
  Truck,
  Plus,
  Sparkles
} from 'lucide-react'
import { SpecularButton } from '../components/specular-button'

const CRITICAL_STOCK = [
  { name: 'Amoxicillin 500mg', sku: 'AMX-500-CP', level: '12 units', threshold: '50 units', critical: true, icon: FlaskConical, tone: 'error' },
  { name: 'Insulin Glargine 100u/mL', sku: 'INS-GL-100', level: '5 vials', threshold: '20 vials', critical: true, icon: Syringe, tone: 'tertiary' },
  { name: 'Lisinopril 10mg', sku: 'LIS-10-TB', level: '140 units', threshold: '150 units', critical: false, icon: Pill, tone: 'neutral' },
  { name: 'Atorvastatin 20mg', sku: 'ATO-20-TB', level: '85 units', threshold: '100 units', critical: false, icon: Pill, tone: 'neutral' }
]

const ALERTS = [
  {
    title: 'Fridge B Temp Variance',
    body: 'Temperature recorded at 9°C. Target is 2-8°C. Immediate action required to prevent spoilage.',
    time: '10 mins ago',
    tone: 'error',
    icon: Thermometer
  },
  {
    title: 'Controlled Substance Log',
    body: 'Daily reconciliation pending for Schedule II vault. Signature required.',
    time: '45 mins ago',
    tone: 'tertiary',
    icon: ShieldCheck
  },
  {
    title: 'Delivery Delayed',
    body: 'McKesson order #88492 delayed by 2 hours due to transit issues.',
    time: '2 hours ago',
    tone: 'secondary',
    icon: Truck
  }
]

const toneStyles = {
  error: 'bg-error-container text-on-error-container',
  tertiary: 'bg-tertiary text-on-tertiary',
  secondary: 'bg-secondary text-on-secondary'
}

function KpiCard({ title, value, sub, icon: Icon, tone }) {
  const tones = {
    primary: 'bg-primary-container text-on-primary-container',
    secondary: 'bg-secondary-container text-on-secondary-container',
    surface: 'bg-surface-container border border-outline-variant text-on-surface',
    error: 'bg-error-container text-on-error-container'
  }
  const badge = {
    primary: 'bg-surface-container-lowest/30',
    secondary: 'bg-surface-container-lowest/50',
    surface: 'bg-tertiary-container text-on-tertiary-container',
    error: 'bg-surface-container-lowest/40'
  }
  return (
    <div
      className={`${tones[tone]} rounded-xl p-5 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden`}
    >
      <div className="flex justify-between items-start z-10">
        <span className="text-xs uppercase tracking-wider opacity-80">{title}</span>
        <div className={`${badge[tone]} p-1.5 rounded-lg`}>
          <Icon size={20} aria-hidden="true" />
        </div>
      </div>
      <div className="z-10 flex items-baseline gap-2">
        <h3 className="text-3xl font-bold">{value}</h3>
        <span className="text-xs opacity-80">{sub}</span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="relative">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-xl font-semibold text-on-background">Operational Overview</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Real-time metrics and alerts for Main Branch.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard title="Total Active Drugs" value="2,408" sub="Formulary" icon={Pill} tone="primary" />
        <KpiCard title="Total Stock Value" value="$48.2k" sub="+2.4%" icon={Wallet} tone="secondary" />
        <KpiCard title="Low Stock Items" value="14" sub="Require reorder" icon={TriangleAlert} tone="surface" />
        <KpiCard title="Active Alerts" value="3" sub="Requires attention" icon={BellRing} tone="error" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-low/50">
            <h3 className="font-medium text-on-surface">Critical Stock Inventory</h3>
            <SpecularButton variant="ghost" size="sm" onClick={() => navigate('/inventory')}>
              View All
            </SpecularButton>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface">
                  <th className="py-3 px-4 text-xs text-on-surface-variant font-medium">Medication</th>
                  <th className="py-3 px-4 text-xs text-on-surface-variant font-medium">SKU</th>
                  <th className="py-3 px-4 text-xs text-on-surface-variant font-medium">Current Level</th>
                  <th className="py-3 px-4 text-xs text-on-surface-variant font-medium">Threshold</th>
                  <th className="py-3 px-4 text-xs text-on-surface-variant font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm text-on-surface">
                {CRITICAL_STOCK.map((row) => (
                  <tr key={row.sku} className="border-b border-surface-variant hover:bg-surface-container-low transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                            row.tone === 'error'
                              ? 'bg-error-container text-on-error-container'
                              : row.tone === 'tertiary'
                                ? 'bg-tertiary-container text-on-tertiary-container'
                                : 'bg-surface-container-high text-on-surface'
                          }`}
                        >
                          <row.icon size={16} aria-hidden="true" />
                        </div>
                        <span className="font-medium">{row.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant">{row.sku}</td>
                    <td className="py-3 px-4">
                      {row.critical ? (
                        <span className="inline-flex items-center gap-1 text-error font-medium">
                          <TrendingDown size={14} aria-hidden="true" />
                          {row.level}
                        </span>
                      ) : (
                        <span className="font-medium">{row.level}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant">{row.threshold}</td>
                    <td className="py-3 px-4 text-right">
                      <SpecularButton variant="ghost" size="sm" radius={999}>
                        Reorder
                      </SpecularButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden flex-1 flex flex-col">
            <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-low/50">
              <h3 className="font-medium text-on-surface flex items-center gap-2">
                <TriangleAlert size={18} className="text-error" aria-hidden="true" />
                Recent Alerts
              </h3>
            </div>
            <div className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto max-h-[400px]">
              {ALERTS.map((alert) => (
                <div
                  key={alert.title}
                  className={`p-3 rounded-lg bg-surface-container border border-outline-variant flex gap-3 items-start ${
                    alert.tone === 'error' ? 'bg-error-container/40 border-error/20' : ''
                  }`}
                >
                  <div className={`${toneStyles[alert.tone]} rounded-full w-8 h-8 flex items-center justify-center shrink-0 mt-0.5`}>
                    <alert.icon size={16} aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">{alert.title}</h4>
                    <p className="text-sm text-on-surface-variant mt-0.5">{alert.body}</p>
                    <span className={`text-xs mt-2 block ${alert.tone === 'error' ? 'text-error' : 'text-on-surface-variant'}`}>
                      {alert.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="h-24" />

      <div className="absolute bottom-6 right-6 flex gap-3 z-50">
        <SpecularButton variant="neutral" size="sm" onClick={() => navigate('/interaction-check')}>
          <Sparkles size={16} />
          <span className="hidden md:inline">AI Analysis</span>
        </SpecularButton>
        <SpecularButton size="md" onClick={() => navigate('/inventory')}>
          <Plus size={18} />
          New Record
        </SpecularButton>
      </div>
    </div>
  )
}

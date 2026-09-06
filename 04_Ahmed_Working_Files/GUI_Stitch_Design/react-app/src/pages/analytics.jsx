import { TrendingUp, FlaskConical, FileText } from 'lucide-react'
import { SpecularButton } from '../components/specular-button'

const MONTHLY = [
  { label: 'Jan', value: 142 },
  { label: 'Feb', value: 168 },
  { label: 'Mar', value: 155 },
  { label: 'Apr', value: 191 },
  { label: 'May', value: 176 },
  { label: 'Jun', value: 214 },
  { label: 'Jul', value: 232 },
  { label: 'Aug', value: 205 },
  { label: 'Sep', value: 248 },
  { label: 'Oct', value: 266 },
  { label: 'Nov', value: 241 },
  { label: 'Dec', value: 289 }
]

const SIGNALS = [
  { title: 'Elevated paracetamol dispensing', detail: '+18% vs 30-day baseline', tone: 'warning' },
  { title: 'Potential interaction: Amoxicillin + Allopurinol', detail: '2 new cases flagged this week', tone: 'error' },
  { title: 'Fridge B temperature trend normalising', detail: 'After maintenance on 08/12', tone: 'ok' }
]

const toneDot = {
  warning: 'bg-warning',
  error: 'bg-error',
  ok: 'bg-success'
}

export default function Analytics() {
  const max = Math.max(...MONTHLY.map((m) => m.value))

  return (
    <div className="relative">
      <div className="mb-6 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h2 className="text-xl font-semibold text-on-background">Analytics</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Pharmacovigilance insights and dispensing trends.
          </p>
        </div>
        <SpecularButton variant="neutral" size="sm">
          <FileText size={16} />
          Export Report
        </SpecularButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-primary-container text-on-primary-container rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="bg-surface-container-lowest/30 p-2.5 rounded-lg">
            <TrendingUp size={20} aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider opacity-80">Monthly Dispensed</p>
            <p className="text-2xl font-bold">2,893</p>
          </div>
        </div>
        <div className="bg-secondary-container text-on-secondary-container rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="bg-surface-container-lowest/50 p-2.5 rounded-lg">
            <FlaskConical size={20} aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider opacity-80">Interactions Checked</p>
            <p className="text-2xl font-bold">11,420</p>
          </div>
        </div>
        <div className="bg-surface-container border border-outline-variant text-on-surface rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="bg-tertiary-container text-on-tertiary-container p-2.5 rounded-lg">
            <FileText size={20} aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-on-surface-variant">PV Reports</p>
            <p className="text-2xl font-bold">47</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="p-5 border-b border-outline-variant bg-surface-container-low/50">
            <h3 className="font-medium text-on-surface">Dispensing Trend (2026)</h3>
          </div>
          <div className="p-5">
            <div className="flex items-end justify-between gap-2 h-48">
              {MONTHLY.map((m) => (
                <div key={m.label} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full rounded-t-md bg-primary/80 dark:bg-primary" style={{ height: `${(m.value / max) * 100}%` }} />
                  <span className="text-xs text-on-surface-variant">{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-outline-variant bg-surface-container-low/50">
            <h3 className="font-medium text-on-surface">Pharmacovigilance Signals</h3>
          </div>
          <div className="flex-1 p-4 flex flex-col gap-2">
            {SIGNALS.map((s) => (
              <div key={s.title} className="p-3 rounded-lg bg-surface-container border border-outline-variant flex gap-3 items-start">
                <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${toneDot[s.tone]}`} />
                <div>
                  <h4 className="text-sm font-bold text-on-surface">{s.title}</h4>
                  <p className="text-sm text-on-surface-variant mt-0.5">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

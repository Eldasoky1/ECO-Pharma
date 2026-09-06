import { Plus, Pill } from 'lucide-react'
import { SpecularButton } from '../components/specular-button'

const PRESCRIPTIONS = [
  { id: 'RX-1042', patient: 'Emily Carter', drug: 'Amoxicillin 500mg', dose: '500mg ×3 daily', date: '2026-08-14', status: 'pending' },
  { id: 'RX-1041', patient: 'James Wu', drug: 'Metformin 850mg', dose: '850mg ×2 daily', date: '2026-08-14', status: 'filled' },
  { id: 'RX-1040', patient: 'Sofia Reyes', drug: 'Insulin Glargine', dose: '20 units nightly', date: '2026-08-13', status: 'filled' },
  { id: 'RX-1039', patient: 'Omar Haddad', drug: 'Atorvastatin 20mg', dose: '20mg nightly', date: '2026-08-13', status: 'flagged' },
  { id: 'RX-1038', patient: 'Nora Ali', drug: 'Lisinopril 10mg', dose: '10mg daily', date: '2026-08-12', status: 'filled' },
  { id: 'RX-1037', patient: 'Tom Baker', drug: 'Omeprazole 20mg', dose: '20mg daily', date: '2026-08-12', status: 'pending' }
]

const STATUS = {
  pending: { label: 'Pending', cls: 'bg-surface-container-high text-on-surface' },
  filled: { label: 'Filled', cls: 'bg-secondary-container text-on-secondary-container' },
  flagged: { label: 'Needs Review', cls: 'bg-error-container text-on-error-container' }
}

export default function Prescriptions() {
  return (
    <div className="relative">
      <div className="mb-6 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h2 className="text-xl font-semibold text-on-background">Prescriptions</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Manage and dispense patient prescriptions with interaction checks.
          </p>
        </div>
        <SpecularButton size="md">
          <Plus size={18} />
          New Prescription
        </SpecularButton>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-surface">
                <th className="py-3 px-4 text-xs text-on-surface-variant font-medium">Rx ID</th>
                <th className="py-3 px-4 text-xs text-on-surface-variant font-medium">Patient</th>
                <th className="py-3 px-4 text-xs text-on-surface-variant font-medium">Medication</th>
                <th className="py-3 px-4 text-xs text-on-surface-variant font-medium">Dosage</th>
                <th className="py-3 px-4 text-xs text-on-surface-variant font-medium">Date</th>
                <th className="py-3 px-4 text-xs text-on-surface-variant font-medium">Status</th>
                <th className="py-3 px-4 text-xs text-on-surface-variant font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-on-surface">
              {PRESCRIPTIONS.map((rx) => (
                <tr key={rx.id} className="border-b border-surface-variant hover:bg-surface-container-low transition-colors">
                  <td className="py-3 px-4 font-medium text-primary">{rx.id}</td>
                  <td className="py-3 px-4">{rx.patient}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center shrink-0">
                        <Pill size={16} aria-hidden="true" />
                      </div>
                      {rx.drug}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-on-surface-variant">{rx.dose}</td>
                  <td className="py-3 px-4 text-on-surface-variant">{rx.date}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${STATUS[rx.status].cls}`}>
                      {STATUS[rx.status].label}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <SpecularButton variant="ghost" size="sm" radius={999}>
                      Dispense
                    </SpecularButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

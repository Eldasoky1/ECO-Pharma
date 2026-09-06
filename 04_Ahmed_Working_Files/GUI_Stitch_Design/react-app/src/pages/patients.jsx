import { Users } from 'lucide-react'
import { SpecularButton } from '../components/specular-button'

const PATIENTS = [
  { name: 'Emily Carter', id: 'PT-2210', age: 34, meds: 4, allergies: 'Penicillin', lastVisit: '2026-08-10', status: 'active' },
  { name: 'James Wu', id: 'PT-2209', age: 52, meds: 6, allergies: 'None', lastVisit: '2026-08-11', status: 'active' },
  { name: 'Sofia Reyes', id: 'PT-2208', age: 28, meds: 2, allergies: 'Sulfa', lastVisit: '2026-08-09', status: 'active' },
  { name: 'Omar Haddad', id: 'PT-2207', age: 61, meds: 8, allergies: 'Codeine', lastVisit: '2026-08-07', status: 'flagged' },
  { name: 'Nora Ali', id: 'PT-2206', age: 45, meds: 3, allergies: 'None', lastVisit: '2026-08-05', status: 'active' },
  { name: 'Tom Baker', id: 'PT-2205', age: 71, meds: 5, allergies: 'Aspirin', lastVisit: '2026-08-02', status: 'active' }
]

export default function Patients() {
  return (
    <div className="relative">
      <div className="mb-6 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h2 className="text-xl font-semibold text-on-background">Patients</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Patient profiles, medication lists, and allergy records.
          </p>
        </div>
        <SpecularButton size="md">
          <Users size={18} />
          Add Patient
        </SpecularButton>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-surface">
                <th className="py-3 px-4 text-xs text-on-surface-variant font-medium">Patient</th>
                <th className="py-3 px-4 text-xs text-on-surface-variant font-medium">ID</th>
                <th className="py-3 px-4 text-xs text-on-surface-variant font-medium">Age</th>
                <th className="py-3 px-4 text-xs text-on-surface-variant font-medium">Active Meds</th>
                <th className="py-3 px-4 text-xs text-on-surface-variant font-medium">Allergies</th>
                <th className="py-3 px-4 text-xs text-on-surface-variant font-medium">Last Visit</th>
                <th className="py-3 px-4 text-xs text-on-surface-variant font-medium">Status</th>
                <th className="py-3 px-4 text-xs text-on-surface-variant font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-on-surface">
              {PATIENTS.map((p) => (
                <tr key={p.id} className="border-b border-surface-variant hover:bg-surface-container-low transition-colors">
                  <td className="py-3 px-4 font-medium">{p.name}</td>
                  <td className="py-3 px-4 text-on-surface-variant">{p.id}</td>
                  <td className="py-3 px-4 text-on-surface-variant">{p.age}</td>
                  <td className="py-3 px-4">{p.meds}</td>
                  <td className="py-3 px-4 text-on-surface-variant">{p.allergies}</td>
                  <td className="py-3 px-4 text-on-surface-variant">{p.lastVisit}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        p.status === 'flagged'
                          ? 'bg-error-container text-on-error-container'
                          : 'bg-secondary-container text-on-secondary-container'
                      }`}
                    >
                      {p.status === 'flagged' ? 'Needs Review' : 'Active'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <SpecularButton variant="ghost" size="sm" radius={999}>
                      View
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

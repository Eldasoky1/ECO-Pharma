import { useState } from 'react'
import { Plus, Search, Boxes, TriangleAlert, Package } from 'lucide-react'
import { SpecularButton } from '../components/specular-button'

const ROWS = [
  { name: 'Amoxicillin 500mg', sku: 'AMX-500-CP', category: 'Antibiotic', level: 12, threshold: 50, status: 'critical', location: 'A-12' },
  { name: 'Insulin Glargine 100u/mL', sku: 'INS-GL-100', category: 'Endocrine', level: 5, threshold: 20, status: 'critical', location: 'F-02' },
  { name: 'Lisinopril 10mg', sku: 'LIS-10-TB', category: 'Cardiovascular', level: 140, threshold: 150, status: 'low', location: 'B-04' },
  { name: 'Atorvastatin 20mg', sku: 'ATO-20-TB', category: 'Cardiovascular', level: 85, threshold: 100, status: 'low', location: 'B-05' },
  { name: 'Metformin 850mg', sku: 'MET-850-TB', category: 'Endocrine', level: 420, threshold: 100, status: 'ok', location: 'C-01' },
  { name: 'Omeprazole 20mg', sku: 'OME-20-CP', category: 'GI', level: 260, threshold: 80, status: 'ok', location: 'C-07' },
  { name: 'Paracetamol 500mg', sku: 'PAR-500-TB', category: 'Analgesic', level: 810, threshold: 200, status: 'ok', location: 'D-02' }
]

const STATUS = {
  critical: { label: 'Critical', cls: 'bg-error-container text-on-error-container' },
  low: { label: 'Low', cls: 'bg-tertiary-container text-on-tertiary-container' },
  ok: { label: 'In Stock', cls: 'bg-secondary-container text-on-secondary-container' }
}

export default function Inventory() {
  const [query, setQuery] = useState('')
  const rows = ROWS.filter(
    (r) =>
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.sku.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="relative">
      <div className="mb-6 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h2 className="text-xl font-semibold text-on-background">Inventory</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Drug catalogue and stock levels for Main Branch.
          </p>
        </div>
        <SpecularButton size="md">
          <Plus size={18} />
          New Record
        </SpecularButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-primary-container text-on-primary-container rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="bg-surface-container-lowest/30 p-2.5 rounded-lg">
            <Boxes size={20} aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider opacity-80">Catalogue Items</p>
            <p className="text-2xl font-bold">2,408</p>
          </div>
        </div>
        <div className="bg-surface-container border border-outline-variant text-on-surface rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="bg-tertiary-container text-on-tertiary-container p-2.5 rounded-lg">
            <TriangleAlert size={20} aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-on-surface-variant">Below Threshold</p>
            <p className="text-2xl font-bold">14</p>
          </div>
        </div>
        <div className="bg-secondary-container text-on-secondary-container rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="bg-surface-container-lowest/50 p-2.5 rounded-lg">
            <Package size={20} aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider opacity-80">Distinct SKUs</p>
            <p className="text-2xl font-bold">1,136</p>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="p-5 border-b border-outline-variant flex flex-wrap items-center gap-4 bg-surface-container-low/50">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-hidden="true" />
            <input
              className="w-full bg-surface-container-high border-none rounded-full py-2 pl-10 pr-4 text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none transition-all"
              placeholder="Search by name or SKU..."
              type="text"
              aria-label="Search inventory"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-surface">
                <th className="py-3 px-4 text-xs text-on-surface-variant font-medium">Medication</th>
                <th className="py-3 px-4 text-xs text-on-surface-variant font-medium">SKU</th>
                <th className="py-3 px-4 text-xs text-on-surface-variant font-medium">Category</th>
                <th className="py-3 px-4 text-xs text-on-surface-variant font-medium">Stock Level</th>
                <th className="py-3 px-4 text-xs text-on-surface-variant font-medium">Threshold</th>
                <th className="py-3 px-4 text-xs text-on-surface-variant font-medium">Status</th>
                <th className="py-3 px-4 text-xs text-on-surface-variant font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-on-surface">
              {rows.map((row) => {
                const pct = Math.round((row.level / row.threshold) * 100)
                return (
                  <tr key={row.sku} className="border-b border-surface-variant hover:bg-surface-container-low transition-colors">
                    <td className="py-3 px-4 font-medium">{row.name}</td>
                    <td className="py-3 px-4 text-on-surface-variant">{row.sku}</td>
                    <td className="py-3 px-4 text-on-surface-variant">{row.category}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{row.level} units</span>
                        <div className="w-20 h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                          <div
                            className={`h-full rounded-full ${row.status === 'critical' ? 'bg-error' : row.status === 'low' ? 'bg-tertiary' : 'bg-primary'}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant">{row.threshold} units</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${STATUS[row.status].cls}`}>
                        {STATUS[row.status].label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <SpecularButton variant="ghost" size="sm" radius={999}>
                        Reorder
                      </SpecularButton>
                    </td>
                  </tr>
                )
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-on-surface-variant">
                    No records match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

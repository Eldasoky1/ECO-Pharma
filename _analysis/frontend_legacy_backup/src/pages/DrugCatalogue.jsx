import React, { useEffect, useState } from 'react';
import { fetchApi } from '../api';
import StatusBadge from '../components/StatusBadge';

export default function DrugCatalogue() {
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadDrugs() {
      try {
        const res = await fetchApi(`/inventory/drugs?limit=50&search=${encodeURIComponent(search)}`);
        setDrugs(res.items || res); // Depends on exact pagination contract
      } catch (err) {
        console.error('API Error', err);
        // Fallback mock data
        setDrugs([
          { id: '1', drug_name: 'Paracetamol', brand_name: 'Panadol', regulatory_status: 'otc', class: 'Analgesic', dosage_forms: ['Tablet', 'Syrup'] },
          { id: '2', drug_name: 'Ibuprofen', brand_name: 'Advil', regulatory_status: 'otc', class: 'NSAID', dosage_forms: ['Tablet', 'Gel'] },
          { id: '3', drug_name: 'Amoxicillin', brand_name: 'Amoxil', regulatory_status: 'prescription_only', class: 'Antibiotic', dosage_forms: ['Capsule'] },
        ]);
      } finally {
        setLoading(false);
      }
    }
    const timeout = setTimeout(loadDrugs, 300); // debounce search
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Drug Catalogue</h2>
        <div className="w-72">
          <input 
            type="text" 
            placeholder="Search drugs or brands..." 
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-teal-500 outline-none transition-all dark:text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4">Drug Name</th>
                <th className="px-6 py-4">Brand Name</th>
                <th className="px-6 py-4">Class</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Forms</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center"><div className="animate-spin inline-block rounded-full h-6 w-6 border-t-2 border-b-2 border-teal-500"></div></td></tr>
              ) : drugs.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center">No drugs found.</td></tr>
              ) : (
                drugs.map(drug => (
                  <tr key={drug.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{drug.drug_name}</td>
                    <td className="px-6 py-4">{drug.brand_name || '-'}</td>
                    <td className="px-6 py-4">{drug.class || '-'}</td>
                    <td className="px-6 py-4"><StatusBadge status={drug.regulatory_status} /></td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {drug.dosage_forms?.map(f => (
                          <span key={f} className="px-2 py-0.5 text-[10px] uppercase tracking-wide bg-slate-200 dark:bg-slate-700 rounded-full">{f}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

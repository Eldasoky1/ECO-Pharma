import React from "react";
import {
  ArrowLeft,
  Pill,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Trash2,
  Edit,
  ExternalLink,
  ShieldAlert,
  Clock,
  Sparkles,
} from "lucide-react";
import { useApp } from "../context/AppContext";

export const DrugDetailView: React.FC = () => {
  const {
    drugs,
    selectedDrugId,
    setCurrentView,
    navigateToEditDrug,
    deleteDrug,
  } = useApp();

  const drug = drugs.find((d) => d.id === selectedDrugId) || drugs[1]; // default to Lisinopril 10mg

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${drug.genericName} from the database?`)) {
      deleteDrug(drug.id);
    }
  };

  const isInStock = drug.currentStock > drug.reorderThreshold;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <button
          onClick={() => setCurrentView("inventory")}
          className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1 font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Inventory</span>
        </button>
        <span>/</span>
        <span className="text-slate-700 dark:text-slate-300 font-medium">{drug.category}</span>
        <span>/</span>
        <span className="text-slate-900 dark:text-slate-100 font-semibold">{drug.genericName} {drug.availableDosages[0]}</span>
      </div>

      {/* Main Header Area */}
      <div className="bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-[#123021]/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 shadow-xs">
            <Pill className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {drug.genericName} {drug.availableDosages[0]} Tablets
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isInStock
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "bg-rose-100 text-rose-800 border border-rose-200"
                }`}
              >
                {isInStock ? "In Stock" : "Low Stock"}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-[#0b2418] text-slate-700 dark:text-slate-300 border border-slate-200">
                {drug.regulatoryStatus}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 max-w-3xl leading-relaxed">
              {drug.description ||
                "Selective ACE inhibitor used to manage hypertension, congestive heart failure, and acute myocardial infarction."}
            </p>
          </div>
        </div>

        {/* Action Buttons Top Right */}
        <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
          <button
            onClick={() => setCurrentView("pharmacovigilance")}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>View AI Reports</span>
          </button>

          <button
            onClick={() => navigateToEditDrug(drug.id)}
            className="px-3.5 py-2 bg-slate-100 dark:bg-[#0b2418] hover:bg-slate-200 dark:hover:bg-[#123021] text-slate-800 dark:text-slate-200 border border-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          <button
            onClick={handleDelete}
            className="px-3 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Delete record"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Grid of details: Left (Active Ingredients & Guidelines), Right (Current Inventory & Known Interactions) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Ingredients & Formulation Card */}
          <div className="bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-[#123021]/80 p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-[#123021] flex items-center justify-between">
              <span>Active Ingredients & Formulation</span>
              <span className="text-[11px] font-normal text-slate-400 font-mono">NDC: {drug.ndc}</span>
            </h2>

            {drug.activeIngredients && (
              <div className="space-y-2">
                {drug.activeIngredients.map((ai) => (
                  <div key={ai.name} className="p-3 bg-slate-50/90 dark:bg-[#0b2418]/90 rounded-xl border border-slate-100 dark:border-[#123021]">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{ai.name}</span>
                      <span className="font-bold text-emerald-700 font-mono">{ai.amount}</span>
                    </div>
                    {ai.percentage && (
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full"
                          style={{ width: `${ai.percentage}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-2.5 bg-slate-50/90 dark:bg-[#0b2418]/90 rounded-xl border border-slate-100 dark:border-[#123021]">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Drug Class</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mt-0.5">{drug.therapeuticClass}</span>
              </div>
              <div className="p-2.5 bg-slate-50/90 dark:bg-[#0b2418]/90 rounded-xl border border-slate-100 dark:border-[#123021]">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Format</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mt-0.5">{drug.format || "Oral Tablet"}</span>
              </div>
              <div className="p-2.5 bg-slate-50/90 dark:bg-[#0b2418]/90 rounded-xl border border-slate-100 dark:border-[#123021]">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Color / Shape</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mt-0.5">{drug.colorShape || "Pink / Round"}</span>
              </div>
              <div className="p-2.5 bg-slate-50/90 dark:bg-[#0b2418]/90 rounded-xl border border-slate-100 dark:border-[#123021]">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Imprint Code</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono block mt-0.5">{drug.imprintCode || "L 10"}</span>
              </div>
            </div>
          </div>

          {/* Administration & Guidelines */}
          <div className="bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-[#123021]/80 p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-[#123021]">
              Administration & Guidelines
            </h2>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50/90 dark:bg-[#0b2418]/90 rounded-xl border border-slate-100 dark:border-[#123021] space-y-1">
                <span className="font-bold text-slate-900 dark:text-slate-100 block text-xs">Standard Adult Dosage</span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {drug.standardAdultDosage || "10mg orally once daily at the same time each day."}
                </p>
              </div>

              <div className="p-3 bg-slate-50/90 dark:bg-[#0b2418]/90 rounded-xl border border-slate-100 dark:border-[#123021] space-y-1">
                <span className="font-bold text-slate-900 dark:text-slate-100 block text-xs">Food Interactions</span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {drug.foodInteractions || "May be administered with or without food."}
                </p>
              </div>

              {drug.renalAdjustment && (
                <div className="p-3 bg-slate-50/90 dark:bg-[#0b2418]/90 rounded-xl border border-slate-100 dark:border-[#123021] space-y-1">
                  <span className="font-bold text-slate-900 dark:text-slate-100 block text-xs">Renal Adjustments</span>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{drug.renalAdjustment}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Current Inventory Batches */}
          <div className="bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-[#123021]/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#123021]">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Current Inventory</h2>
              <button
                onClick={() => setCurrentView("inventory")}
                className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <span>View Full</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="seph-table">
                <thead>
                  <tr>
                    <th>Batch No</th>
                    <th>Location</th>
                    <th>Qty</th>
                    <th className="text-right">Expiry</th>
                  </tr>
                </thead>
                <tbody>
                  {(drug.batches || []).map((batch) => (
                    <tr key={batch.batchNo}>
                      <td className="font-mono font-semibold text-slate-800 dark:text-slate-200">{batch.batchNo}</td>
                      <td className="text-slate-600 dark:text-slate-400">{batch.location}</td>
                      <td className="font-bold text-slate-900 dark:text-slate-100">
                        {batch.status === "Low" || batch.status === "Critical" ? (
                          <span className="text-rose-600">{batch.quantity}</span>
                        ) : (
                          batch.quantity
                        )}
                      </td>
                      <td className="text-right font-mono text-slate-500 text-[11px]">
                        {batch.expiryDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Known Interactions */}
          <div className="bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-[#123021]/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#123021]">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Known Interactions</h2>
              <button
                onClick={() => setCurrentView("interaction-kb")}
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                Database →
              </button>
            </div>

            <div className="space-y-3">
              {(drug.knownInteractions || []).map((ki) => (
                <div
                  key={ki.drugName}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 dark:border-[#123021]/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{ki.drugName}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        ki.severity === "MAJOR"
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : "bg-slate-200 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {ki.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{ki.notes}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

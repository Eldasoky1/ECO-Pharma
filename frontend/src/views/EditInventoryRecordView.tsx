import React, { useState } from "react";
import {
  ArrowLeft,
  AlertCircle,
  Save,
  Building,
  Calendar,
  Layers,
  FileText,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { PageHeader } from "../components/PageHeader";

export const EditInventoryRecordView: React.FC = () => {
  const {
    drugs,
    editDrugId,
    setCurrentView,
    updateDrug,
    showToast,
  } = useApp();

  const drug = drugs.find((d) => d.id === editDrugId) || drugs[0]; // defaults to Amoxicillin

  const [currentQty, setCurrentQty] = useState<number | string>(drug.currentStock);
  const [reorderPoint, setReorderPoint] = useState<number>(drug.reorderThreshold || 100);
  const [optimalStock, setOptimalStock] = useState<number>(drug.optimalStock || 500);
  const [supplier, setSupplier] = useState<string>(drug.primarySupplier || "PharmaCorp Inc.");
  const [expiryDate, setExpiryDate] = useState<string>("2024-11-15");
  const [adjustmentNotes, setAdjustmentNotes] = useState<string>("");

  const qtyNumber = Number(currentQty);
  const isNegative = qtyNumber < 0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNegative) {
      alert("Validation Error: Quantity cannot be negative.");
      return;
    }

    updateDrug(drug.id, {
      currentStock: qtyNumber,
      reorderThreshold: reorderPoint,
      optimalStock: optimalStock,
      primarySupplier: supplier,
    });

    setCurrentView("inventory");
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <button
          onClick={() => setCurrentView("inventory")}
          className="hover:text-slate-900 dark:hover:text-white font-medium"
        >
          Inventory
        </button>
        <span>&gt;</span>
        <span className="text-slate-700 dark:text-slate-300 font-medium">{drug.genericName} 500mg</span>
        <span>&gt;</span>
        <span className="text-slate-900 dark:text-slate-100 font-semibold">Edit Record</span>
      </div>

      {/* Header */}
      <PageHeader
        eyebrow="Inventory"
        icon={FileText}
        title="Edit Inventory Record"
        subtitle={
          <>
            Update stock details for{" "}
            <span className="font-mono text-slate-700 dark:text-slate-300">{drug.sku}</span>.
          </>
        }
      />

      <form onSubmit={handleSave} className="bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-emerald-500/15 p-6 shadow-xs space-y-6 text-xs">
        {/* Read-only Medication Info */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 dark:border-[#123021]/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Medication Name</span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 block mt-0.5">
              {drug.genericName} {drug.availableDosages[0]} Capsules
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">SKU / NDC</span>
            <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 block mt-0.5">
              {drug.sku} • {drug.ndc}
            </span>
          </div>
        </div>

        {/* Quantity Field with validation matching screenshot */}
        <div>
          <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
            Current Quantity <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            value={currentQty}
            onChange={(e) => setCurrentQty(e.target.value)}
            className={`w-full h-10 px-3 bg-white border rounded-xl outline-none font-bold text-sm transition-colors ${
              isNegative
                ? "border-rose-500 bg-rose-50/40 text-rose-900 focus:border-rose-600 ring-1 ring-rose-500"
                : "border-slate-200 focus:border-emerald-600 text-slate-900 dark:text-slate-100"
            }`}
          />
          {isNegative && (
            <p className="text-rose-600 font-semibold text-xs mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Quantity cannot be negative.</span>
            </p>
          )}
        </div>

        {/* Stock Thresholds */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Reorder Point</label>
            <input
              type="number"
              min="0"
              value={reorderPoint}
              onChange={(e) => setReorderPoint(Number(e.target.value))}
              className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl focus:border-emerald-600 outline-none text-slate-900 dark:text-slate-100 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Optimal Stock</label>
            <input
              type="number"
              min="0"
              value={optimalStock}
              onChange={(e) => setOptimalStock(Number(e.target.value))}
              className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl focus:border-emerald-600 outline-none text-slate-900 dark:text-slate-100 font-medium"
            />
          </div>
        </div>

        {/* Primary Supplier & Expiry Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Primary Supplier</label>
            <select
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl focus:border-emerald-600 outline-none text-slate-900 dark:text-slate-100 font-medium"
            >
              <option value="PharmaCorp Inc.">PharmaCorp Inc.</option>
              <option value="HealthSupplies LLC">HealthSupplies LLC</option>
              <option value="Global Meds">Global Meds</option>
              <option value="Pfizer / Viatris">Pfizer / Viatris</option>
              <option value="McKesson Distribution">McKesson Distribution</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Next Expiry Date</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl focus:border-emerald-600 outline-none text-slate-900 dark:text-slate-100 font-medium"
            />
          </div>
        </div>

        {/* Reason for manual adjustment */}
        <div>
          <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Adjustment Notes</label>
          <textarea
            value={adjustmentNotes}
            onChange={(e) => setAdjustmentNotes(e.target.value)}
            rows={3}
            placeholder="Reason for manual adjustment (e.g. Broken packaging audit, dispensing reconciliation, physical cycle count difference)..."
            className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:border-emerald-600 outline-none text-slate-900 dark:text-slate-100 leading-relaxed"
          />
        </div>

        {/* Buttons */}
        <div className="pt-4 border-t border-slate-100 dark:border-[#123021] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setCurrentView("inventory")}
            className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 dark:hover:bg-[#123021] dark:bg-[#0b2418] text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isNegative}
            className={`px-6 py-2.5 rounded-xl font-bold text-white transition-all flex items-center gap-2 ${
              isNegative
                ? "bg-slate-300 cursor-not-allowed text-slate-500"
                : "bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 shadow-md shadow-emerald-900/20 cursor-pointer"
            }`}
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};

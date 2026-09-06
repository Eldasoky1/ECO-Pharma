import React, { useState } from "react";
import { X, Pill, ShieldAlert, Check, Plus, User, Stethoscope } from "lucide-react";
import { useApp } from "../context/AppContext";

export const NewPrescriptionModal: React.FC = () => {
  const {
    isPrescriptionModalOpen,
    setIsPrescriptionModalOpen,
    drugs,
    interactions,
    showToast,
  } = useApp();

  const [patientName, setPatientName] = useState("Eleanor Vance");
  const [patientDob, setPatientDob] = useState("1964-08-12");
  const [selectedDrug, setSelectedDrug] = useState(drugs[0]?.genericName || "Amoxicillin");
  const [dosage, setDosage] = useState("500mg");
  const [frequency, setFrequency] = useState("TID (Three times daily)");
  const [quantity, setQuantity] = useState(30);
  const [refills, setRefills] = useState(2);
  const [prescriber, setPrescriber] = useState("Dr. Robert Davis, MD (Lic #MD-77821)");
  const [currentMeds, setCurrentMeds] = useState<string[]>(["Warfarin"]);

  if (!isPrescriptionModalOpen) return null;

  // Real-time contraindication flag check
  const activeInteractions = interactions.filter(
    (int) =>
      (int.drugA.toLowerCase() === selectedDrug.toLowerCase() &&
        currentMeds.some((m) => m.toLowerCase().includes(int.drugB.toLowerCase()))) ||
      (int.drugB.toLowerCase() === selectedDrug.toLowerCase() &&
        currentMeds.some((m) => m.toLowerCase().includes(int.drugA.toLowerCase())))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(
      `Prescription queued for ${patientName}`,
      `${selectedDrug} ${dosage} (Qty: ${quantity}, ${refills} refills). Authorized by ${prescriber}.`,
      "success"
    );
    setIsPrescriptionModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white/70 dark:bg-[#071a11]/70 backdrop-blur-xl rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200/90 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900/95 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Pill className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">New Prescription Order</h3>
              <p className="text-xs text-slate-400">Electronic Prescribing & Safety Verification</p>
            </div>
          </div>
          <button
            onClick={() => setIsPrescriptionModalOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Patient Details */}
          <div className="p-3 bg-slate-50/90 dark:bg-[#0b2418]/90 rounded-xl border border-slate-200/80 dark:border-[#123021]/80 space-y-2.5">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider text-[10px]">
              <User className="w-3.5 h-3.5 text-slate-500" />
              Patient Profile
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Patient Full Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 dark:text-slate-100 focus:border-emerald-600 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={patientDob}
                  onChange={(e) => setPatientDob(e.target.value)}
                  className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 dark:text-slate-100 focus:border-emerald-600 outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                Concomitant Medications on File
              </label>
              <div className="flex flex-wrap gap-1.5">
                {currentMeds.map((med) => (
                  <span
                    key={med}
                    className="bg-slate-200 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-medium text-[11px] flex items-center gap-1"
                  >
                    {med}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Medication Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Prescribed Drug</label>
              <select
                value={selectedDrug}
                onChange={(e) => setSelectedDrug(e.target.value)}
                className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 dark:text-slate-100 focus:border-emerald-600 outline-none font-medium"
              >
                {drugs.map((d) => (
                  <option key={d.id} value={d.genericName}>
                    {d.genericName} ({d.therapeuticClass})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Dosage & Strength</label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 dark:text-slate-100 focus:border-emerald-600 outline-none"
                placeholder="e.g. 500mg"
              />
            </div>
          </div>

          {/* Posology */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 dark:text-slate-100 focus:border-emerald-600 outline-none"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Refills</label>
              <input
                type="number"
                value={refills}
                onChange={(e) => setRefills(Number(e.target.value))}
                className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 dark:text-slate-100 focus:border-emerald-600 outline-none"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Frequency</label>
              <input
                type="text"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 dark:text-slate-100 focus:border-emerald-600 outline-none"
              />
            </div>
          </div>

          {/* Prescriber */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-slate-500" />
              Authorizing Prescriber
            </label>
            <input
              type="text"
              value={prescriber}
              onChange={(e) => setPrescriber(e.target.value)}
              className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 dark:text-slate-100 focus:border-emerald-600 outline-none"
            />
          </div>

          {/* Live Interaction Warning Alert Box */}
          {activeInteractions.length > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Clinical Interaction Warning</span>
              </div>
              {activeInteractions.map((int) => (
                <p key={int.id} className="text-rose-700 text-[11px] leading-relaxed">
                  <strong>{int.drugA} + {int.drugB}:</strong> {int.clinicalSummary} ({int.riskGrade})
                </p>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-[#123021] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsPrescriptionModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#0b2418] hover:bg-slate-200 dark:hover:bg-[#123021] rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-emerald-900/20 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Authorize & Dispense</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

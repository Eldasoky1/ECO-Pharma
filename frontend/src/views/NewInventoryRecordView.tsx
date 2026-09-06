import React, { useState } from "react";
import {
  ArrowLeft,
  Barcode,
  Save,
  Check,
  Building,
  Layers,
  ShieldAlert,
  Snowflake,
  Recycle,
  Sparkles,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { PageHeader } from "../components/PageHeader";

export const NewInventoryRecordView: React.FC = () => {
  const { setCurrentView, addDrug, showToast } = useApp();

  const [genericName, setGenericName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [strength, setStrength] = useState("");
  const [form, setForm] = useState("Capsule");
  const [category, setCategory] = useState<any>("Antibiotics");
  const [initialQty, setInitialQty] = useState(100);
  const [reorderPoint, setReorderPoint] = useState(30);
  const [supplier, setSupplier] = useState("PharmaCorp Inc.");
  const [ndcInput, setNdcInput] = useState("");
  
  // Classifications
  const [requiresRefrigeration, setRequiresRefrigeration] = useState(false);
  const [controlledSubstance, setControlledSubstance] = useState(false);
  const [ecoDisposalRequired, setEcoDisposalRequired] = useState(true);

  // Barcode simulation
  const handleScanBarcode = () => {
    setNdcInput("00093-7182-01");
    setGenericName("Doxycycline Hyclate");
    setBrandName("Vibramycin");
    setStrength("100mg");
    setForm("Capsule");
    setCategory("Antibiotics");
    setInitialQty(250);
    setReorderPoint(50);
    setEcoDisposalRequired(true);
    showToast("Barcode Scanned: NDC 00093-7182-01 matched.", undefined, "info");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!genericName.trim()) {
      alert("Please enter a Generic Name.");
      return;
    }

    const brandNames = brandName.trim()
      ? brandName.split(",").map((s) => s.trim())
      : [genericName];

    addDrug({
      genericName: genericName.trim(),
      brandNames,
      therapeuticClass: `${category} Agent`,
      category,
      dosageForms: [form],
      availableDosages: [strength || "Standard"],
      regulatoryStatus: controlledSubstance ? "Controlled (C-II)" : "Rx Only",
      currentStock: initialQty,
      stockUnit: "units",
      reorderThreshold: reorderPoint,
      optimalStock: Math.max(initialQty * 2, 500),
      sku: `SKU-${genericName.slice(0, 4).toUpperCase()}-${strength || "STD"}-${form.slice(0, 3).toUpperCase()}`,
      ndc: ndcInput || "00093-0000-00",
      primarySupplier: supplier,
      storageRequirement: requiresRefrigeration ? "Cold Storage (2-8°C)" : "Ambient (15-25°C)",
      requiresRefrigeration,
      controlledSubstance,
      ecoDisposalRequired,
      description: `Central formulary registered ${genericName} (${strength || "standard dosage"}).`,
      activeIngredients: [
        { name: genericName, amount: strength || "100mg", percentage: 95 },
      ],
      batches: [
        {
          batchNo: `BT-${Math.floor(1000 + Math.random() * 9000)}`,
          location: requiresRefrigeration ? "Cold Storage B" : "Aisle 1, Shelf C",
          quantity: initialQty,
          expiryDate: "2026-10-31",
          status: "Normal",
        },
      ],
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header with back navigation */}
      <div className="flex items-start gap-3">
        <button
          onClick={() => setCurrentView("inventory")}
          className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 dark:hover:bg-[#123021] dark:bg-[#0b2418] text-slate-600 dark:text-slate-400 transition-colors mt-1"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <PageHeader
          eyebrow="Inventory"
          icon={Barcode}
          title="New Inventory Record"
          subtitle="Add a new material or drug to the central database."
          className="flex-1"
        />
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Barcode / Quick Lookup Bar */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold block">Scan Barcode / Auto-Fill NDC</span>
              <span className="text-[11px] text-slate-400 block">
                Instant FDA National Drug Code directory matching
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={ndcInput}
              onChange={(e) => setNdcInput(e.target.value)}
              placeholder="Search NDC, Generic, or Brand..."
              className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder:text-emerald-100/70 focus:border-emerald-300 outline-none w-full sm:w-56"
            />
            <button
              type="button"
              onClick={handleScanBarcode}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate Scan</span>
            </button>
          </div>
        </div>

        {/* Form Body: Left Material Details, Right (Stock Parameters & Classification) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Material Details */}
          <div className="lg:col-span-7 bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-emerald-500/15 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-[#123021] flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-700" />
              <span>Material Details</span>
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Generic Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={genericName}
                  onChange={(e) => setGenericName(e.target.value)}
                  placeholder="e.g. Amoxicillin, Lisinopril, Metformin"
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-[#071a11]/50 border border-slate-200 dark:border-[#123021] rounded-xl focus:bg-white focus:border-emerald-600 outline-none text-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">Brand Name(s)</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Amoxil, Trimox"
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-[#071a11]/50 border border-slate-200 dark:border-[#123021] rounded-xl focus:bg-white focus:border-emerald-600 outline-none text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">Strength</label>
                  <input
                    type="text"
                    value={strength}
                    onChange={(e) => setStrength(e.target.value)}
                    placeholder="e.g. 500mg, 10mg/mL"
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-[#071a11]/50 border border-slate-200 dark:border-[#123021] rounded-xl focus:bg-white focus:border-emerald-600 outline-none text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">Dosage Form</label>
                  <select
                    value={form}
                    onChange={(e) => setForm(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-[#071a11]/50 border border-slate-200 dark:border-[#123021] rounded-xl focus:bg-white focus:border-emerald-600 outline-none text-slate-900 dark:text-slate-100 font-medium"
                  >
                    <option value="Capsule">Capsule</option>
                    <option value="Oral Tablet">Oral Tablet</option>
                    <option value="Extended Release Tablet">Extended Release Tablet</option>
                    <option value="Oral Suspension">Oral Suspension</option>
                    <option value="Injectable Vial">Injectable Vial</option>
                    <option value="Topical Ointment">Topical Ointment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">Therapeutic Class</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-[#071a11]/50 border border-slate-200 dark:border-[#123021] rounded-xl focus:bg-white focus:border-emerald-600 outline-none text-slate-900 dark:text-slate-100 font-medium"
                >
                  <option value="Antibiotics">Antibiotics</option>
                  <option value="Statins">Statins</option>
                  <option value="Analgesics">Analgesics</option>
                  <option value="Antihypertensives">Antihypertensives</option>
                  <option value="Antidiabetics">Antidiabetics</option>
                  <option value="Cardiovascular">Cardiovascular</option>
                  <option value="Other">Other Category</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">Primary Supplier</label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="e.g. PharmaCorp Inc., McKesson"
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-[#071a11]/50 border border-slate-200 dark:border-[#123021] rounded-xl focus:bg-white focus:border-emerald-600 outline-none text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Stock Parameters & Classification */}
          <div className="lg:col-span-5 space-y-6">
            {/* Stock Parameters Card */}
            <div className="bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-emerald-500/15 p-6 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-[#123021]">
                Stock Parameters
              </h2>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">Initial Qty</label>
                  <input
                    type="number"
                    min="0"
                    value={initialQty}
                    onChange={(e) => setInitialQty(Math.max(0, Number(e.target.value)))}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-[#071a11]/50 border border-slate-200 dark:border-[#123021] rounded-xl focus:bg-white focus:border-emerald-600 outline-none text-slate-900 dark:text-slate-100 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">Reorder Point</label>
                  <input
                    type="number"
                    min="0"
                    value={reorderPoint}
                    onChange={(e) => setReorderPoint(Math.max(0, Number(e.target.value)))}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-[#071a11]/50 border border-slate-200 dark:border-[#123021] rounded-xl focus:bg-white focus:border-emerald-600 outline-none text-slate-900 dark:text-slate-100 font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Classification Card */}
            <div className="bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-emerald-500/15 p-6 shadow-xs space-y-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-[#123021]">
                Classification
              </h2>
              <div className="space-y-3 text-xs">
                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 dark:border-[#123021]/80 cursor-pointer hover:bg-slate-100 dark:hover:bg-[#123021] dark:bg-[#0b2418]/80 transition-colors">
                  <input
                    type="checkbox"
                    checked={requiresRefrigeration}
                    onChange={(e) => setRequiresRefrigeration(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
                  />
                  <div className="flex items-center gap-2">
                    <Snowflake className="w-4 h-4 text-teal-600" />
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">Requires Refrigeration</span>
                      <span className="text-[11px] text-slate-500">2°C - 8°C Cold Chain Tracking</span>
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 dark:border-[#123021]/80 cursor-pointer hover:bg-slate-100 dark:hover:bg-[#123021] dark:bg-[#0b2418]/80 transition-colors">
                  <input
                    type="checkbox"
                    checked={controlledSubstance}
                    onChange={(e) => setControlledSubstance(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 accent-rose-600"
                  />
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">Controlled Substance</span>
                      <span className="text-[11px] text-slate-500">Schedule II Vault Log Required</span>
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 dark:border-[#123021]/80 cursor-pointer hover:bg-slate-100 dark:hover:bg-[#123021] dark:bg-[#0b2418]/80 transition-colors">
                  <input
                    type="checkbox"
                    checked={ecoDisposalRequired}
                    onChange={(e) => setEcoDisposalRequired(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
                  />
                  <div className="flex items-center gap-2">
                    <Recycle className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">Eco-Disposal Required</span>
                      <span className="text-[11px] text-slate-500">Hazardous Waste Protocol</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => setCurrentView("inventory")}
            className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 dark:hover:bg-[#123021] dark:bg-[#0b2418] text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-900/20 flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Record</span>
          </button>
        </div>
      </form>
    </div>
  );
};

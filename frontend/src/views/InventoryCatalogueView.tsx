import React, { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Download,
  AlertCircle,
  Pill,
  ExternalLink,
  Edit2,
  CheckCircle2,
  Layers,
  ChevronRight,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { PageHeader } from "../components/PageHeader";

export const InventoryCatalogueView: React.FC = () => {
  const {
    drugs,
    setCurrentView,
    navigateToDrugDetail,
    navigateToEditDrug,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("All");
  const [selectedRegStatus, setSelectedRegStatus] = useState<string>("All");

  const classes = [
    "All",
    "Antibiotics",
    "Statins",
    "Analgesics",
    "Antihypertensives",
    "Antidiabetics",
  ];

  const regStatuses = [
    "All",
    "Rx Only",
    "OTC",
    "Controlled",
  ];

  const filteredDrugs = drugs.filter((drug) => {
    const matchesSearch =
      drug.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drug.brandNames.some((b) => b.toLowerCase().includes(searchQuery.toLowerCase())) ||
      drug.therapeuticClass.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drug.sku.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClass =
      selectedClass === "All" ||
      drug.category === selectedClass ||
      drug.therapeuticClass.toLowerCase().includes(selectedClass.toLowerCase());

    const matchesReg =
      selectedRegStatus === "All" ||
      (selectedRegStatus === "Controlled"
        ? drug.controlledSubstance || drug.regulatoryStatus.includes("Controlled")
        : drug.regulatoryStatus.toLowerCase().includes(selectedRegStatus.toLowerCase()));

    return matchesSearch && matchesClass && matchesReg;
  });

  const handleExportCSV = () => {
    const headers = ["Generic Name", "Brand Names", "Therapeutic Class", "Dosages", "Status", "Stock Qty", "SKU"];
    const rows = filteredDrugs.map((d) => [
      d.genericName,
      `"${d.brandNames.join(", ")}"`,
      `"${d.therapeuticClass}"`,
      `"${d.availableDosages.join(", ")}"`,
      d.regulatoryStatus,
      d.currentStock,
      d.sku,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `eco_pharma_catalogue_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Catalogue exported to CSV.", undefined, "info");
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Title & Actions */}
      <PageHeader
        eyebrow="Inventory"
        icon={Layers}
        title="Drug Catalogue"
        subtitle="Manage inventory, check statuses, and review dosage forms."
      >
        <button
          onClick={handleExportCSV}
          className="px-3 py-2 bg-white/60 dark:bg-[#0b2418]/70 backdrop-blur border border-slate-200 dark:border-[#123021] hover:border-emerald-500/60 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export</span>
        </button>

        <button
          onClick={() => setCurrentView("new-inventory")}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-emerald-900/20 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Drug</span>
        </button>
      </PageHeader>

      {/* Filter and Search Bar Card */}
      <div className="bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-[#123021]/80 p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by drug name, brand, class, or SKU..."
              className="w-full h-10 pl-10 pr-4 text-xs bg-slate-50/90 dark:bg-[#0b2418]/90 border border-slate-200/80 dark:border-[#123021]/80 rounded-xl focus:bg-white focus:border-emerald-600 outline-none transition-all"
            />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-[#123021] text-xs">
          {/* Therapeutic Class Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Class:</span>
            {classes.map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selectedClass === cls
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold"
                    : "bg-slate-100 dark:bg-[#0b2418] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#123021]"
                }`}
              >
                {cls}
              </button>
            ))}
          </div>

          {/* Regulatory Status Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Status:</span>
            {regStatuses.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedRegStatus(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selectedRegStatus === st
                    ? "bg-emerald-700 text-white font-semibold"
                    : "bg-slate-100 dark:bg-[#0b2418] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#123021]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Catalogue Table */}
      <div className="bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-[#123021]/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="seph-table">
            <thead>
              <tr>
                <th>Drug Name & Brand</th>
                <th>Class</th>
                <th>Available Dosages</th>
                <th>Regulatory Status</th>
                <th>Stock / Threshold</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrugs.map((drug) => {
                const isLow = drug.currentStock <= drug.reorderThreshold;
                const stockPct = Math.min(100, (drug.currentStock / drug.optimalStock) * 100);

                return (
                  <tr key={drug.id}>
                    {/* Drug Name & Brand */}
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#0b2418] text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
                          <Pill className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <button
                            onClick={() => navigateToDrugDetail(drug.id)}
                            className="font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-700 text-left text-xs leading-tight"
                          >
                            {drug.genericName}
                          </button>
                          <div className="text-[11px] text-slate-500">
                            {drug.brandNames.join(", ")}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Class */}
                    <td>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{drug.therapeuticClass}</span>
                    </td>

                    {/* Dosages */}
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {drug.availableDosages.map((ds) => (
                          <span
                            key={ds}
                            className="bg-slate-100 dark:bg-[#0b2418] text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium"
                          >
                            {ds}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Regulatory Status */}
                    <td>
                      {drug.controlledSubstance ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          <AlertCircle className="w-3 h-3" />
                          {drug.regulatoryStatus}
                        </span>
                      ) : drug.regulatoryStatus === "OTC" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                          <CheckCircle2 className="w-3 h-3" />
                          OTC
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-[#0b2418] text-slate-700 dark:text-slate-300 border border-slate-200">
                          Rx Only
                        </span>
                      )}
                    </td>

                    {/* Stock level bar */}
                    <td>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className={`font-bold ${isLow ? "text-rose-600" : "text-slate-800 dark:text-slate-200"}`}>
                            {drug.currentStock} {drug.stockUnit}
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            Min: {drug.reorderThreshold}
                          </span>
                        </div>
                        <div className="w-28 h-1.5 bg-slate-100 dark:bg-[#0b2418] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isLow ? "bg-rose-500" : "bg-emerald-600"
                            }`}
                            style={{ width: `${stockPct}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigateToDrugDetail(drug.id)}
                          className="px-2.5 py-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#123021] dark:bg-[#0b2418] rounded-lg text-xs font-semibold transition-colors"
                          title="View detailed monograph and interaction profile"
                        >
                          View
                        </button>
                        <button
                          onClick={() => navigateToEditDrug(drug.id)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#123021] dark:bg-[#0b2418] rounded-lg transition-colors"
                          title="Edit stock record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="seph-table-foot px-4 py-3 flex items-center justify-between text-xs">
          <span>
            Showing <strong>{filteredDrugs.length}</strong> of <strong>{drugs.length}</strong> catalogued items
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Last batch sync: 2 mins ago
          </span>
        </div>
      </div>
    </div>
  );
};

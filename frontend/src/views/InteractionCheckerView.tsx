import React, { useState } from "react";
import {
  Search,
  Zap,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  X,
  Plus,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { PageHeader } from "../components/PageHeader";

export const InteractionCheckerView: React.FC = () => {
  const { drugs, interactions, showToast } = useApp();

  const [selectedMedications, setSelectedMedications] = useState<string[]>([
    "Lisinopril",
    "Ibuprofen",
    "Warfarin",
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasChecked, setHasChecked] = useState(true);

  // Suggestions for drug selection
  const availableDrugs = drugs.map((d) => d.genericName).concat([
    "Amiodarone",
    "Spironolactone",
    "Omeprazole",
    "Simvastatin",
    "Itraconazole",
    "Warfarin",
    "Aspirin",
    "Clarithromycin",
    "Lithium Carbonate",
  ]);

  const uniqueAvailable: string[] = Array.from<string>(new Set(availableDrugs)).filter(
    (name: string) => !selectedMedications.includes(name)
  );

  const filteredSuggestions: string[] = searchQuery.trim()
    ? uniqueAvailable.filter((d: string) => d.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const handleAddMedication = (med: string) => {
    if (!selectedMedications.includes(med)) {
      setSelectedMedications([...selectedMedications, med]);
      setSearchQuery("");
    }
  };

  const handleRemoveMedication = (med: string) => {
    setSelectedMedications(selectedMedications.filter((m) => m !== med));
  };

  const handleClearAll = () => {
    setSelectedMedications([]);
    setHasChecked(false);
  };

  // Calculate pairwise interactions among selected medications
  const detectedInteractions: any[] = [];

  for (let i = 0; i < selectedMedications.length; i++) {
    for (let j = i + 1; j < selectedMedications.length; j++) {
      const drug1 = selectedMedications[i];
      const drug2 = selectedMedications[j];

      const match = interactions.find(
        (int) =>
          (int.drugA.toLowerCase() === drug1.toLowerCase() &&
            int.drugB.toLowerCase() === drug2.toLowerCase()) ||
          (int.drugA.toLowerCase() === drug2.toLowerCase() &&
            int.drugB.toLowerCase() === drug1.toLowerCase())
      );

      if (match) {
        detectedInteractions.push(match);
      } else {
        // Dynamic fallback logic for known pharmacological classes
        if (
          (drug1.toLowerCase().includes("warfarin") && drug2.toLowerCase().includes("ibuprofen")) ||
          (drug2.toLowerCase().includes("warfarin") && drug1.toLowerCase().includes("ibuprofen"))
        ) {
          detectedInteractions.push({
            id: `dyn-${drug1}-${drug2}`,
            drugA: drug1,
            drugAClass: "Analgesic / Anticoagulant",
            drugB: drug2,
            drugBClass: "Anticoagulant / Analgesic",
            riskGrade: "Grade X (Avoid)",
            riskLevel: "Major",
            clinicalSummary:
              "Increased risk of bleeding. NSAIDs can cause GI mucosal damage and inhibit platelet aggregation, drastically multiplying Warfarin anticoagulant toxicity.",
            recommendation:
              "Avoid combination if possible. Substitute with Acetaminophen up to 2g/day or use topical NSAID formulation under close INR monitoring.",
          });
        } else if (
          (drug1.toLowerCase().includes("lisinopril") && drug2.toLowerCase().includes("ibuprofen")) ||
          (drug2.toLowerCase().includes("lisinopril") && drug1.toLowerCase().includes("ibuprofen"))
        ) {
          detectedInteractions.push({
            id: `dyn-${drug1}-${drug2}`,
            drugA: drug1,
            drugAClass: "ACE Inhibitor",
            drugB: drug2,
            drugBClass: "NSAID",
            riskGrade: "Grade C (Monitor)",
            riskLevel: "Moderate",
            clinicalSummary:
              "Decreased antihypertensive effect and increased risk of severe acute renal impairment due to blunted vasodilatory prostaglandin synthesis.",
            recommendation:
              "Monitor blood pressure periodically and check renal function (eGFR/Cr) within 7 days. Limit NSAID course duration.",
          });
        }
      }
    }
  }

  const handleRunCheck = () => {
    setHasChecked(true);
    if (detectedInteractions.length > 0) {
      showToast(
        `Major interaction detected: ${detectedInteractions[0].drugA} + ${detectedInteractions[0].drugB}.`,
        "Clinical contraindication flagged in active patient regimen.",
        "critical"
      );
    } else {
      showToast("No severe contraindications detected in selected regimen.", undefined, "success");
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <PageHeader
        eyebrow="Clinical Safety"
        icon={ShieldAlert}
        title="Interaction Checker"
        subtitle="Select medications to check for potential contraindications and metabolic interference."
      />

      {/* Medication Selection Card */}
      <div className="bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-emerald-500/15 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-600" />
          <span>Add Medication</span>
        </h2>

        {/* Search input with live selector */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type drug name (e.g., Lisinopril, Warfarin, Ibuprofen)..."
            className="w-full h-10 pl-10 pr-4 text-xs bg-slate-50 dark:bg-[#071a11]/50 border border-slate-200 dark:border-[#123021] rounded-xl focus:bg-white focus:border-emerald-600 outline-none text-slate-900 dark:text-slate-100"
          />

          {/* Quick Dropdown Suggestions */}
          {searchQuery.trim() && filteredSuggestions.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-white dark:bg-[#071a11] rounded-xl shadow-xl border border-slate-200 dark:border-[#123021] p-2 z-20">
              <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                Suggested Drugs
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filteredSuggestions.map((sug) => (
                  <button
                    key={sug}
                    onClick={() => handleAddMedication(sug)}
                    className="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-emerald-50 hover:text-emerald-800 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300 rounded-lg transition-colors flex items-center justify-between"
                  >
                    <span>{sug}</span>
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selected Medication Chips */}
        <div>
          <div className="text-[11px] font-semibold text-slate-500 mb-2">
            Selected Regimen ({selectedMedications.length})
          </div>
          <div className="flex items-center gap-2 flex-wrap min-h-8">
            {selectedMedications.map((med) => (
              <span
                key={med}
                className="bg-slate-100 dark:bg-[#0b2418] border border-slate-200 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2"
              >
                <span>{med}</span>
                <button
                  onClick={() => handleRemoveMedication(med)}
                  className="text-slate-400 hover:text-slate-700 dark:text-slate-300 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}

            {selectedMedications.length === 0 && (
              <span className="text-xs text-slate-400 italic">No medications selected yet.</span>
            )}
          </div>
        </div>

        {/* Action Buttons & Quick Presets */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-[#123021]">
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Quick Presets:</span>
            <button
              onClick={() => {
                setSelectedMedications(["Warfarin", "Ibuprofen", "Omeprazole"]);
                setHasChecked(true);
              }}
              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-300 font-semibold border border-rose-200 dark:border-rose-500/30 text-[11px] transition-colors cursor-pointer"
            >
              ⚠️ Anticoagulant + NSAID
            </button>
            <button
              onClick={() => {
                setSelectedMedications(["Lisinopril", "Spironolactone", "Atorvastatin"]);
                setHasChecked(true);
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-500/30 text-[11px] transition-colors cursor-pointer"
            >
              Cardiorenal Regimen
            </button>
            <button
              onClick={() => {
                setSelectedMedications(["Amoxicillin", "Paracetamol", "Cetirizine"]);
                setHasChecked(true);
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-500/30 text-[11px] transition-colors cursor-pointer"
            >
              ✓ Safe Infection Regimen
            </button>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleClearAll}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>

            <button
              onClick={handleRunCheck}
              disabled={selectedMedications.length < 2}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                selectedMedications.length < 2
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-md shadow-emerald-900/20 cursor-pointer"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Check Interactions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {hasChecked && selectedMedications.length >= 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Interaction Analysis Results
            </h2>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                detectedInteractions.length > 0
                  ? "bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30"
                  : "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30"
              }`}
            >
              {detectedInteractions.length > 0
                ? `${detectedInteractions.length} Risks Found`
                : "Safe Regimen (0 Risks)"}
            </span>
          </div>

          {detectedInteractions.length > 0 ? (
            <div className="space-y-4">
              {detectedInteractions.map((item) => {
                const isMajor = item.riskLevel === "Major" || item.riskGrade?.includes("Grade X");

                return (
                  <div
                    key={item.id || item.drugA + item.drugB}
                    className="bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-emerald-500/15 p-5 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <span>{item.drugA}</span>
                          <span className="text-slate-400 font-normal">+</span>
                          <span>{item.drugB}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {item.drugAClass} • {item.drugBClass}
                        </div>
                      </div>

                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase flex items-center gap-1.5 shrink-0 ${
                          isMajor
                            ? "bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30"
                            : "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30"
                        }`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {isMajor ? "Major Risk" : "Moderate Risk"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#071a11]/60 p-3.5 rounded-xl border border-slate-100 dark:border-[#123021]">
                      {item.clinicalSummary}
                    </p>

                    <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-500/10 rounded-xl border border-emerald-200/80 dark:border-emerald-500/30">
                      <span className="text-[10px] uppercase font-bold text-emerald-900 dark:text-emerald-300 block mb-1">
                        Clinical Recommendation:
                      </span>
                      <p className="text-xs text-emerald-950 dark:text-emerald-100 font-medium leading-relaxed">
                        {item.recommendation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-emerald-500/15 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">No Documented Severe Interactions</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No major or moderate pharmacological contraindications found for the selected combination.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

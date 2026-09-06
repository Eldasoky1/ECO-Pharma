import React, { useState } from "react";
import {
  Search,
  BookOpen,
  AlertTriangle,
  Info,
  CheckCircle2,
  FlaskConical,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { PageHeader } from "../components/PageHeader";
import { DrugInteraction } from "../types";

export const InteractionKnowledgeBaseView: React.FC = () => {
  const { interactions, setCurrentView } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<"All" | "High" | "Moderate" | "Minor">("All");
  const [activeModalInteraction, setActiveModalInteraction] = useState<DrugInteraction | null>(null);

  const filteredInteractions = interactions.filter((item) => {
    const matchesSearch =
      item.drugA.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.drugB.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.interactionType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.drugAClass.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.drugBClass.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRisk =
      selectedRiskFilter === "All" ||
      (selectedRiskFilter === "High" && (item.riskGrade.includes("Grade X") || item.riskGrade.includes("Grade D"))) ||
      (selectedRiskFilter === "Moderate" && item.riskGrade.includes("Grade C")) ||
      (selectedRiskFilter === "Minor" && (item.riskGrade.includes("Grade A") || item.riskGrade.includes("Grade B")));

    return matchesSearch && matchesRisk;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Title Header */}
      <PageHeader
        eyebrow="Clinical Safety"
        icon={BookOpen}
        title="Interaction Knowledge Base"
        subtitle={
          <>
            Comprehensive database of drug-drug interactions, risk assessments, and clinical evidence.
            Consult primary literature for unverified combinations.
          </>
        }
      />

      {/* Search & Filter Bar */}
      <div className="bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-emerald-500/15 p-4 shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by generic or brand name, mechanism, or therapeutic class..."
            className="w-full h-10 pl-10 pr-4 text-xs bg-slate-50 dark:bg-[#071a11]/50 border border-slate-200 dark:border-[#123021] rounded-xl focus:bg-white focus:border-emerald-600 outline-none text-slate-900 dark:text-slate-100 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 dark:border-[#123021] text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Risk Grade:</span>
          <button
            onClick={() => setSelectedRiskFilter("All")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              selectedRiskFilter === "All"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                : "bg-slate-100 dark:bg-[#0b2418] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#123021]"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedRiskFilter("High")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              selectedRiskFilter === "High"
                ? "bg-rose-600 text-white"
                : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
            }`}
          >
            High (X/D)
          </button>
          <button
            onClick={() => setSelectedRiskFilter("Moderate")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              selectedRiskFilter === "Moderate"
                ? "bg-amber-600 text-white"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
            }`}
          >
            Moderate (C)
          </button>
          <button
            onClick={() => setSelectedRiskFilter("Minor")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              selectedRiskFilter === "Minor"
                ? "bg-emerald-700 text-white"
                : "bg-slate-100 dark:bg-[#0b2418] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#123021]"
            }`}
          >
            Minor (A/B)
          </button>
        </div>
      </div>

      {/* Interactions Table */}
      <div className="bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-emerald-500/15 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="seph-table">
            <thead>
              <tr>
                <th>Drug A</th>
                <th>Drug B</th>
                <th>Interaction Type</th>
                <th>Risk Badge</th>
                <th>Evidence</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredInteractions.map((item) => {
                const isGradeX = item.riskGrade.includes("Grade X");
                const isGradeD = item.riskGrade.includes("Grade D");
                const isGradeC = item.riskGrade.includes("Grade C");
                const isGradeA = item.riskGrade.includes("Grade A");

                return (
                  <tr key={item.id}>
                    {/* Drug A */}
                    <td>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{item.drugA}</div>
                      <div className="text-[11px] text-slate-500">{item.drugAClass}</div>
                    </td>

                    {/* Drug B */}
                    <td>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{item.drugB}</div>
                      <div className="text-[11px] text-slate-500">{item.drugBClass}</div>
                    </td>

                    {/* Interaction Type */}
                    <td className="max-w-xs">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{item.interactionType}</span>
                    </td>

                    {/* Risk Badge */}
                    <td>
                      {isGradeX ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          Grade X (Avoid)
                        </span>
                      ) : isGradeD ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-3 h-3 text-rose-500" />
                          Grade D (Modify)
                        </span>
                      ) : isGradeC ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-[#0b2418] text-slate-800 dark:text-slate-200 border border-slate-300">
                          <Info className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                          Grade C (Monitor)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-[#0b2418] text-slate-600 dark:text-slate-400 border border-slate-200">
                          <CheckCircle2 className="w-3 h-3 text-slate-400" />
                          Grade A (No Action)
                        </span>
                      )}
                    </td>

                    {/* Evidence Strength */}
                    <td>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                        <FlaskConical className="w-3 h-3 text-teal-600" />
                        {item.evidenceStrength}
                      </span>
                    </td>

                    {/* Action Button */}
                    <td className="text-right">
                      <button
                        onClick={() => setActiveModalInteraction(item)}
                        className="px-3 py-1 bg-slate-100 dark:bg-[#0b2418] hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination bar matching screenshot */}
        <div className="seph-table-foot px-4 py-3 flex items-center justify-between text-xs">
          <span>
            Showing <strong>1-4</strong> of <strong>1,248</strong> interactions
          </span>

          <div className="flex items-center gap-1.5">
            <button className="p-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 dark:hover:bg-[#123021] dark:bg-[#0b2418] text-slate-600 dark:text-slate-400 cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono font-semibold text-slate-800 dark:text-slate-200">1</span>
            <button className="p-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 dark:hover:bg-[#123021] dark:bg-[#0b2418] text-slate-600 dark:text-slate-400 cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Interaction Detail Modal */}
      {activeModalInteraction && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200/80 dark:border-emerald-500/15 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">
                  {activeModalInteraction.drugA} + {activeModalInteraction.drugB}
                </h3>
                <span className="text-xs text-slate-400">Clinical Mechanism & Pharmacological Risk</span>
              </div>
              <button
                onClick={() => setActiveModalInteraction(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Risk Grade</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">{activeModalInteraction.riskGrade}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Evidence Tier</span>
                  <span className="font-bold text-teal-700 text-xs">{activeModalInteraction.evidenceStrength}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">Clinical Summary</span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 dark:border-[#123021]">
                  {activeModalInteraction.clinicalSummary}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">Biochemical Mechanism</span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 dark:border-[#123021]">
                  {activeModalInteraction.mechanism}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">Recommended Action</span>
                <p className="text-slate-800 dark:text-slate-200 font-semibold bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/80 leading-relaxed">
                  {activeModalInteraction.recommendation}
                </p>
              </div>

              {activeModalInteraction.managementPlan && (
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">Clinical Protocol Steps</span>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                    {activeModalInteraction.managementPlan.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 dark:border-[#123021] flex justify-end">
              <button
                onClick={() => setActiveModalInteraction(null)}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs rounded-xl transition-colors"
              >
                Close Monograph
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

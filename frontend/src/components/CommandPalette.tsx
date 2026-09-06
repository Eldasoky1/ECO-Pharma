import React, { useState, useEffect } from "react";
import {
  Search,
  Zap,
  Boxes,
  Activity,
  Radio,
  Bell,
  ShoppingBag,
  Plus,
  ArrowRight,
  Sparkles,
  X,
  FileText,
  Thermometer,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { BrandLogo } from "./BrandLogo";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const {
    drugs,
    navigateToDrugDetail,
    setCurrentView,
    setIsPrescriptionModalOpen,
    sensors,
    alerts,
  } = useApp();

  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      } else if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredDrugs = query.trim()
    ? drugs.filter(
        (d) =>
          d.genericName.toLowerCase().includes(query.toLowerCase()) ||
          d.brandNames.some((b) => b.toLowerCase().includes(query.toLowerCase())) ||
          d.therapeuticClass.toLowerCase().includes(query.toLowerCase()) ||
          d.sku.toLowerCase().includes(query.toLowerCase())
      )
    : drugs.slice(0, 4);

  const quickNavigation = [
    {
      title: "Interactive Drug Interaction Checker",
      desc: "Screen multi-drug regimens for contraindications",
      view: "interaction-checker" as const,
      icon: Zap,
      category: "Clinical Intelligence",
    },
    {
      title: "AI Pharmacovigilance Suite",
      desc: "Analyze adverse events with patient pharmacokinetic modeling",
      view: "pharmacovigilance" as const,
      icon: Activity,
      category: "Clinical Intelligence",
    },
    {
      title: "Live IoT Storage Sensors & Telemetry",
      desc: "Monitor cold storage zones, fridges, and NIST calibrations",
      view: "live-sensors" as const,
      icon: Radio,
      category: "Operations",
    },
    {
      title: "System Alerts & CAPA Logs",
      desc: `${alerts.filter((a) => !a.acknowledged).length} unacknowledged operational notices`,
      view: "alerts" as const,
      icon: Bell,
      category: "Operations",
    },
    {
      title: "OTC Inventory & Front-of-Store",
      desc: "Manage over-the-counter stocks and expiry dates",
      view: "otc-inventory" as const,
      icon: ShoppingBag,
      category: "Operations",
    },
  ].filter(
    (item) =>
      !query.trim() ||
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.desc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-16 md:pt-24 p-4 animate-in fade-in duration-150">
      <div className="bg-white/70 dark:bg-[#071a11]/70 backdrop-blur-xl rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150">
        {/* Top Search Input */}
        <div className="p-4 border-b border-slate-200/80 dark:border-[#123021]/80 flex items-center gap-3 bg-slate-50/85">
          <Search className="w-5 h-5 text-emerald-600 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search medications, clinical tools, telemetry, or actions... (Esc to close)"
            className="w-full bg-transparent text-slate-900 dark:text-slate-100 text-sm font-medium outline-none placeholder:text-slate-400"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#123021]/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="p-3 overflow-y-auto space-y-4 text-xs divide-y divide-slate-100">
          {/* Quick Action Button */}
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1">
              Quick Clinical Action
            </div>
            <button
              onClick={() => {
                onClose();
                setIsPrescriptionModalOpen(true);
              }}
              className="w-full p-2.5 rounded-xl hover:bg-emerald-50 text-left flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-800">
                    Dispense New Prescription
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Open patient intake & prescription dispatch modal
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 opacity-0 group-hover:opacity-100 flex items-center gap-1">
                <span>Dispatch</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>
          </div>

          {/* Medications Matches */}
          <div className="pt-3">
            <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1">
              Pharmaceutical Catalog ({filteredDrugs.length})
            </div>
            <div className="space-y-1">
              {filteredDrugs.map((drug) => (
                <button
                  key={drug.id}
                  onClick={() => {
                    onClose();
                    navigateToDrugDetail(drug.id);
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#123021] dark:bg-[#0b2418] text-left flex items-center justify-between group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#0b2418] group-hover:bg-white text-slate-700 dark:text-slate-300 flex items-center justify-center border border-slate-200">
                      <Boxes className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {drug.genericName}{" "}
                        <span className="font-normal text-slate-500">
                          ({drug.brandNames.join(", ")})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{drug.therapeuticClass}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-400">{drug.sku}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {drug.currentStock} {drug.stockUnit}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation & Clinical Tools */}
          {quickNavigation.length > 0 && (
            <div className="pt-3">
              <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1">
                Clinical Navigation & Telemetry
              </div>
              <div className="space-y-1">
                {quickNavigation.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        onClose();
                        setCurrentView(item.view);
                      }}
                      className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#123021] dark:bg-[#0b2418] text-left flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#0b2418] group-hover:bg-white text-slate-700 dark:text-slate-300 flex items-center justify-center border border-slate-200">
                          <Icon className="w-4 h-4 text-teal-600" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-800">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-slate-500">{item.desc}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 dark:text-slate-200 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              Use <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono">↑</kbd> <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono">↓</kbd> to navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono">Enter</kbd> to select
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-emerald-800">
            <BrandLogo variant="icon" size="sm" />
            <span>Smart Eco-Pharma Hub</span>
          </div>
        </div>
      </div>
    </div>
  );
};

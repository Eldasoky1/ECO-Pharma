import React from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { useApp } from "../context/AppContext";

export const ToastBanner: React.FC = () => {
  const { toast, setToast, setCurrentView } = useApp();

  if (!toast) return null;

  const isCritical = toast.type === "critical";

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div
        className={`p-4 rounded-xl shadow-lg border backdrop-blur-md flex items-start gap-3 text-sm ${
          isCritical
            ? "bg-slate-900/93 text-white border-slate-700/80 shadow-slate-950/40"
            : toast.type === "success"
            ? "bg-emerald-900/93 text-white border-emerald-700/80 shadow-emerald-950/40"
            : "bg-slate-800/93 text-white border-slate-700/80"
        }`}
      >
        <div className="shrink-0 mt-0.5">
          {isCritical ? (
            <AlertCircle className="w-5 h-5 text-rose-400" />
          ) : toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <Info className="w-5 h-5 text-sky-400" />
          )}
        </div>

        <div className="flex-1 pr-2">
          <div className="font-semibold text-xs leading-snug">{toast.title}</div>
          {toast.description && (
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.description}</p>
          )}
          {isCritical && (
            <button
              onClick={() => {
                setCurrentView("interaction-checker");
                setToast(null);
              }}
              className="mt-2 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 underline block"
            >
              Open Interaction Checker →
            </button>
          )}
        </div>

        <button
          onClick={() => setToast(null)}
          className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

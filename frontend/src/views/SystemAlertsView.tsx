import React, { useState } from "react";
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Thermometer,
  ShieldCheck,
  Package,
  RefreshCw,
  Clock,
  MapPin,
  Truck,
  X,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { PageHeader } from "../components/PageHeader";

export const SystemAlertsView: React.FC = () => {
  const { alerts, acknowledgeAlert, dismissAlert, showToast } = useApp();

  const [activeLogModalAlertId, setActiveLogModalAlertId] = useState<string | null>(null);
  const [actionLogText, setActionLogText] = useState(
    "Inspected Cold Storage Unit B. Compressor cycle rebooted; auxiliary cooling fan engaged. Biologicals temperature verified at 5.1°C."
  );

  const pendingActionCount = alerts.filter((a) => a.actionRequired && !a.acknowledged).length;

  const handleConfirmActionLog = () => {
    if (activeLogModalAlertId) {
      acknowledgeAlert(activeLogModalAlertId, actionLogText);
      setActiveLogModalAlertId(null);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header matching screenshot */}
      <PageHeader
        eyebrow="Operations"
        icon={Bell}
        title="System Alerts"
        subtitle="Review and acknowledge operational notifications."
      >
        {pendingActionCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold self-start sm:self-auto dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-300" />
            <span>{pendingActionCount} Action Required</span>
          </div>
        )}
      </PageHeader>

      {/* Alerts Feed Cards */}
      <div className="space-y-4">
        {alerts.map((alert) => {
          const isCritical = alert.type === "CRITICAL TEMPERATURE" || alert.type === "CRITICAL" || alert.severity === "critical";
          const isLowStock = alert.type === "LOW STOCK";
          const isVerification = alert.type === "VERIFICATION";
          const isSystemUpdate = alert.type === "SYSTEM UPDATE";
          const isDeliveryDelayed = alert.type === "DELIVERY DELAYED";

          const typePalette = {
            badge: isCritical
              ? "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30"
              : isLowStock
              ? "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30"
              : isVerification
              ? "bg-teal-100 text-teal-800 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/30"
              : isSystemUpdate
              ? "bg-slate-200 text-slate-800 dark:bg-[#0b2418] dark:text-slate-200"
              : isDeliveryDelayed
              ? "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30"
              : "bg-slate-200 text-slate-800 dark:bg-[#0b2418] dark:text-slate-200",
            border: isCritical ? "border-rose-300 dark:border-rose-500/30" : "",
            iconWrap: isCritical
              ? "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
              : isLowStock
              ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
              : isVerification
              ? "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300"
              : isSystemUpdate
              ? "bg-slate-100 dark:bg-[#0b2418] text-slate-700 dark:text-slate-300"
              : isDeliveryDelayed
              ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
              : "bg-slate-100 dark:bg-[#0b2418] text-slate-700 dark:text-slate-300",
          };

          return (
            <div
              key={alert.id}
              className={`rounded-2xl border p-5 shadow-xs transition-all ${
                alert.acknowledged
                  ? "bg-slate-50 border-slate-200 opacity-70 dark:bg-[#0b2418] dark:border-[#123021]"
                  : isCritical
                  ? "bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl border-rose-300 ring-1 ring-rose-200 dark:border-rose-500/30 dark:ring-rose-500/20"
                  : "bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl border border-slate-200/80 dark:border-emerald-500/15"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  {/* Icon badge */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                      typePalette.iconWrap
                    }`}
                  >
                    {isCritical ? (
                      <Thermometer className="w-5 h-5" />
                    ) : isLowStock ? (
                      <Package className="w-5 h-5" />
                    ) : isVerification ? (
                      <ShieldCheck className="w-5 h-5" />
                    ) : isSystemUpdate ? (
                      <RefreshCw className="w-5 h-5" />
                    ) : isDeliveryDelayed ? (
                      <Truck className="w-5 h-5" />
                    ) : (
                      <Bell className="w-5 h-5" />
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wide border ${
                          typePalette.badge
                        }`}
                      >
                        {alert.type}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {alert.timeAgo}
                      </span>
                      {alert.acknowledged && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded dark:text-emerald-300 dark:bg-emerald-500/15">
                          Acknowledged
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 pt-0.5">{alert.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">{alert.description}</p>

                    {alert.location && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>Location: {alert.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {alert.secondaryActionText && !alert.acknowledged && (
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-semibold hover:bg-slate-100 dark:hover:bg-[#123021] dark:bg-[#0b2418] rounded-xl transition-colors cursor-pointer"
                    >
                      {alert.secondaryActionText}
                    </button>
                  )}

                  {!alert.acknowledged ? (
                    isCritical ? (
                      <button
                        onClick={() => setActiveLogModalAlertId(alert.id)}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm shadow-rose-900/20 transition-all cursor-pointer"
                      >
                        {alert.actionButtonText || "Acknowledge & Log Action"}
                      </button>
                    ) : (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        {alert.actionButtonText || "Acknowledge"}
                      </button>
                    )
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Logged</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compliance Log Action Modal */}
      {activeLogModalAlertId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200/80 dark:border-emerald-500/15 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-rose-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-rose-200" />
                <h3 className="font-bold text-sm">Corrective Action Audit Log</h3>
              </div>
              <button
                onClick={() => setActiveLogModalAlertId(null)}
                className="text-rose-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Document required corrective and preventive action (CAPA) under Good Storage and
                Distribution Practices (GDP):
              </p>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Pharmacist Action Taken</label>
                <textarea
                  value={actionLogText}
                  onChange={(e) => setActionLogText(e.target.value)}
                  rows={4}
                  className="w-full p-3 bg-slate-50 dark:bg-[#071a11]/50 border border-slate-200 dark:border-[#123021] rounded-xl focus:border-rose-600 outline-none text-slate-900 dark:text-slate-100 leading-relaxed"
                />
              </div>

              <div className="p-3 bg-rose-50 dark:bg-rose-500/10 rounded-xl border border-rose-200 dark:border-rose-500/30 text-rose-900 dark:text-rose-200 text-[11px]">
                <strong>Digital Signature:</strong> Dr. Sarah Jenkins, Lead Pharmacist (Timestamp:{" "}
                {new Date().toLocaleTimeString()})
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 dark:border-[#123021] dark:bg-[#071a11]/60 flex justify-end gap-2">
              <button
                onClick={() => setActiveLogModalAlertId(null)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-[#123021] dark:bg-[#0b2418]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmActionLog}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                Sign & Acknowledge Excursion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

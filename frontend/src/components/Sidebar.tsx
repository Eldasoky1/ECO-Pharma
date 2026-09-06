import React, { useState } from "react";
import {
  LayoutDashboard,
  Boxes,
  BookOpen,
  Zap,
  Activity,
  Radio,
  Bell,
  ShoppingBag,
  Settings,
  HelpCircle,
  LogOut,
  Plus,
  ShieldCheck,
  Leaf,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { ViewMode } from "../types";

export const Sidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    alerts,
    sensors,
    setIsPrescriptionModalOpen,
    logout,
  } = useApp();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const activeAlertsCount = alerts.filter((a) => !a.acknowledged).length;
  const criticalSensorsCount = sensors.filter(
    (s) => s.status === "High Temp" || s.status === "Low Temp" || s.status === "Low Batt"
  ).length;

  interface NavItem {
    id: ViewMode;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeColor?: string;
    isAi?: boolean;
  }

  const clinicalNavItems: NavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "inventory", label: "Drug Inventory", icon: Boxes },
    { id: "interaction-checker", label: "Interaction Checker", icon: Zap },
    {
      id: "pharmacovigilance",
      label: "AI Pharmacovigilance",
      icon: Activity,
      isAi: true,
    },
    { id: "interaction-kb", label: "Interaction KB", icon: BookOpen },
  ];

  const operationsNavItems: NavItem[] = [
    {
      id: "live-sensors",
      label: "IoT Cold Storage",
      icon: Radio,
      badge: criticalSensorsCount > 0 ? `${criticalSensorsCount}` : undefined,
      badgeColor: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40",
    },
    { id: "otc-inventory", label: "OTC Inventory", icon: ShoppingBag },
    {
      id: "alerts",
      label: "System Alerts",
      icon: Bell,
      badge: activeAlertsCount > 0 ? activeAlertsCount : undefined,
      badgeColor: "bg-rose-500 text-white font-bold",
    },
    { id: "settings", label: "System Settings", icon: Settings },
  ];

  const renderNavButton = (item: NavItem) => {
    const isActive =
      currentView === item.id ||
      (item.id === "inventory" &&
        (currentView === "drug-detail" ||
          currentView === "new-inventory" ||
          currentView === "edit-inventory"));
    const Icon = item.icon;

    return (
      <button
        key={item.id}
        onClick={() => setCurrentView(item.id)}
        title={isCollapsed ? item.label : undefined}
        className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between px-3'} py-2.5 rounded-xl text-xs font-medium transition-all duration-300 group relative cursor-pointer ${
          isActive
            ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/20 font-semibold"
            : "text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-[#0b2418]/80 hover:text-emerald-800 dark:hover:text-white"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-1.5 rounded-lg transition-colors ${
              isActive
                ? "bg-white/20 text-white"
                : "bg-slate-200/50 text-slate-500 dark:bg-[#0b2418] dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:bg-emerald-50 dark:group-hover:bg-[#123021]/60"
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>
          {!isCollapsed && <span className="truncate whitespace-nowrap">{item.label}</span>}
        </div>

        {!isCollapsed && (
          <div className="flex items-center gap-1.5 shrink-0">
            {item.isAi && (
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 ${
                  isActive
                    ? "bg-emerald-500 text-white"
                    : "bg-teal-100 text-teal-700 border border-teal-200 dark:bg-teal-950/80 dark:text-teal-300 dark:border-teal-800/60"
                }`}
              >
                <Sparkles className="w-2.5 h-2.5" />
                <span>AI</span>
              </span>
            )}

            {item.badge !== undefined && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full border ${
                  item.badgeColor || "bg-slate-100 text-slate-600 border-slate-200 dark:bg-[#0b2418] dark:text-slate-200 dark:border-[#123021]"
                }`}
              >
                {item.badge}
              </span>
            )}
          </div>
        )}
        
        {/* Tooltip for collapsed mode badges */}
        {isCollapsed && item.badge !== undefined && (
          <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
        )}
      </button>
    );
  };

  return (
    <aside 
      className={`relative bg-white/70 dark:bg-[#03130c]/60 backdrop-blur-xl text-slate-700 dark:text-slate-300 flex flex-col shrink-0 border-r border-white/20 dark:border-[#0b2418]/80 select-none transition-all duration-500 ease-in-out shadow-[4px_0_24px_-10px_rgba(0,0,0,0.1)] dark:shadow-none z-20 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
      style={{ minHeight: "calc(100vh - 4rem)" }}
    >
      {/* Collapse Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-white dark:bg-[#0b2418] border border-slate-200 dark:border-[#123021] rounded-full p-1 shadow-sm text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 z-50 transition-transform cursor-pointer"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Branch & System status badge */}
      <div className={`p-4 border-b border-slate-200/50 dark:border-[#0b2418]/80 transition-all duration-300 ${isCollapsed ? 'items-center flex flex-col px-2' : 'space-y-3'}`}>
        {!isCollapsed ? (
          <div className="flex items-center justify-between bg-white/50 dark:bg-[#0b2418]/80 backdrop-blur-sm rounded-xl p-2.5 border border-slate-200/50 dark:border-[#123021]/60 shadow-sm">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </div>
              <div className="truncate">
                <span className="text-xs font-semibold text-slate-800 dark:text-white block leading-tight truncate">
                  Main Clinical Branch
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono leading-tight truncate">
                  21 CFR Part 11 Active
                </span>
              </div>
            </div>
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          </div>
        ) : (
          <div className="flex items-center justify-center bg-white/50 dark:bg-[#0b2418]/80 rounded-xl p-2.5 border border-slate-200/50 dark:border-[#123021]/60 shadow-sm w-full mb-3">
             <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>
        )}

        {/* + New Prescription Button */}
        <button
          onClick={() => setIsPrescriptionModalOpen(true)}
          title={isCollapsed ? "New Prescription" : undefined}
          className={`flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:from-emerald-700 active:to-teal-700 text-white font-bold transition-all shadow-md shadow-emerald-900/20 cursor-pointer ${
            isCollapsed ? "w-10 h-10 rounded-full p-0" : "w-full text-xs py-2.5 px-3 rounded-xl"
          }`}
        >
          <Plus className={isCollapsed ? "w-5 h-5" : "w-4 h-4"} />
          {!isCollapsed && <span>New Prescription</span>}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-3 space-y-5 overflow-y-auto overflow-x-hidden scrollbar-hide">
        {/* Clinical Suite */}
        <div>
          {!isCollapsed && (
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2 flex items-center justify-between whitespace-nowrap">
              <span>Clinical Intelligence</span>
            </div>
          )}
          <div className="space-y-1">
            {clinicalNavItems.map((item) => renderNavButton(item))}
          </div>
        </div>

        {/* Operations & Telemetry */}
        <div>
          {!isCollapsed && (
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2 flex items-center justify-between whitespace-nowrap">
              <span>Operations & Telemetry</span>
            </div>
          )}
          <div className="space-y-1">
            {operationsNavItems.map((item) => renderNavButton(item))}
          </div>
        </div>

        {/* Eco-Compliance Storage Metric Widget */}
        {!isCollapsed && (
          <div className="mx-1 mt-4 p-3 rounded-xl bg-gradient-to-br from-emerald-50/80 to-teal-50/50 dark:from-emerald-950/70 dark:to-[#0b2418]/85 backdrop-blur-sm border border-emerald-100 dark:border-emerald-800/40 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-300 text-[11px]">
                <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Eco-Storage Index</span>
              </div>
              <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">99.4%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-[#0b2418]/90 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full w-[99.4%]" />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              100% Eco-Neutral Disposal • Zero excursions
            </p>
          </div>
        )}
      </nav>

      {/* Footer Navigation items */}
      <div className={`p-3 border-t border-slate-200/50 dark:border-[#0b2418]/80 transition-all ${isCollapsed ? 'space-y-2 flex flex-col items-center' : 'space-y-1'}`}>
        <button
          onClick={() => {
            alert(
              "Smart Eco-Pharma Hub Clinical Support\n\nEmergency Hotline: +1 (800) 555-PHARMA\nNIST Calibration & Cold-Chain Desk: ext. 402\nDocumentation: https://docs.smart-eco-pharma.internal"
            );
          }}
          title={isCollapsed ? "Clinical Helpdesk" : undefined}
          className={`flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2 w-full'} text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0b2418] rounded-lg transition-colors cursor-pointer`}
        >
          <HelpCircle className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Clinical Helpdesk</span>}
        </button>

        <button
          onClick={() => {
            logout();
          }}
          title={isCollapsed ? "Sign Out" : undefined}
          className={`flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2 w-full'} text-xs font-medium text-rose-600 dark:text-rose-400/90 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};



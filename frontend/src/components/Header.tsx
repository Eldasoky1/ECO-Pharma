import React, { useState, useEffect } from "react";
import {
  Search,
  Bell,
  Settings,
  Radio,
  AlertTriangle,
  ChevronDown,
  X,
  ExternalLink,
  Command,
  Moon,
  Sun,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { BrandLogo } from "./BrandLogo";
import { CommandPalette } from "./CommandPalette";
import { UserAvatar } from "./UserAvatar";
import { circularThemeToggle } from "../utils/themeTransition";

export const Header: React.FC = () => {
  const {
    userProfile,
    setCurrentView,
    alerts,
    sensors,
    drugs,
    navigateToDrugDetail,
    setIsPrescriptionModalOpen,
    theme,
    toggleTheme,
  } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Global shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const activeAlertsCount = alerts.filter((a) => !a.acknowledged).length;

  const filteredDrugs = searchQuery.trim()
    ? drugs.filter(
        (d) =>
          d.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.brandNames.some((b) => b.toLowerCase().includes(searchQuery.toLowerCase())) ||
          d.sku.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <>
      <header className="h-16 border-b border-slate-200/80 dark:border-[#123021]/80 bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        {/* Brand Identity & Mobile trigger with official logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView("dashboard")}
            className="flex items-center group text-left cursor-pointer focus:outline-none hover:opacity-90 transition-opacity"
            title="Smart Eco-Pharma Hub - Return to Dashboard"
          >
            <BrandLogo variant="horizontal" size="md" />
          </button>
        </div>

        {/* Global Search Bar with Quick Launch */}
        <div className="relative flex-1 max-w-lg mx-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              placeholder="Search medications, clinical interactions, SKUs..."
              className="w-full h-10 pl-10 pr-14 text-xs md:text-sm bg-white/80 hover:bg-white dark:bg-[#0b2418]/70 dark:hover:bg-[#123021]/70 focus:bg-white dark:focus:bg-[#0b2418] border border-slate-200/85 hover:border-slate-300/90 dark:border-[#123021]/80 dark:hover:border-[#1a3a29] focus:border-emerald-600 dark:focus:border-emerald-500 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm transition-all outline-none"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-400 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => setIsCommandPaletteOpen(true)}
                className="hidden md:flex items-center gap-1 absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-500 dark:text-slate-400 border border-slate-200/85 rounded-md px-1.5 py-0.5 bg-white/90 hover:bg-slate-100 dark:bg-[#123021]/80 dark:hover:bg-[#123021] transition-colors shadow-2xs"
                title="Open Command Palette (⌘K)"
              >
                <span>⌘K</span>
              </button>
            )}
          </div>

          {/* Live Search Suggestions Dropdown */}
          {isSearchFocused && searchQuery.trim() && (
            <div className="absolute top-full mt-1.5 left-0 right-0 bg-white/70 dark:bg-[#071a11]/70 backdrop-blur-xl rounded-xl shadow-xl border border-slate-200/90 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="p-2 border-b border-slate-100 dark:border-[#123021] text-[11px] font-semibold uppercase text-slate-400 px-3">
                Medication Results ({filteredDrugs.length})
              </div>
              <div className="max-h-64 overflow-y-auto">
                {filteredDrugs.length > 0 ? (
                  filteredDrugs.map((drug) => (
                    <button
                      key={drug.id}
                      onClick={() => {
                        navigateToDrugDetail(drug.id);
                        setSearchQuery("");
                      }}
                      className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-slate-100/80 dark:hover:bg-[#0b2418]/60 transition-colors text-left border-b border-slate-50 dark:border-[#0b2418] last:border-0"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {drug.genericName}{" "}
                          <span className="font-normal text-slate-500">
                            ({drug.brandNames.join(", ")})
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{drug.therapeuticClass}</span>
                          <span>•</span>
                          <span className="font-mono text-slate-400">{drug.sku}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {drug.currentStock} {drug.stockUnit}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No matching medications found for "{searchQuery}".
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Controls & Profile */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Theme Toggle */}
          <button
            onClick={(e) => circularThemeToggle(toggleTheme, e.clientX, e.clientY)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10 rounded-lg relative transition-colors focus:outline-none cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          {/* Live Sensor Broadcast status pill */}
          <button
            onClick={() => setCurrentView("live-sensors")}
            className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50/90 hover:bg-emerald-100/90 border border-emerald-200/80 text-emerald-800 text-xs font-medium transition-colors cursor-pointer"
            title="View Real-Time Cold Storage & Zone Telemetry"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span className="tracking-tight">Live Sensors</span>
            <span className="bg-emerald-200/70 text-emerald-900 text-[10px] font-mono px-1.5 rounded-sm">
              {sensors.filter((s) => s.status === "Stable").length}/{sensors.length} OK
            </span>
          </button>

          {/* Notifications Bell Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsAlertsOpen(!isAlertsOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-[#0b2418] rounded-lg relative transition-colors focus:outline-none cursor-pointer"
              aria-label="View system alerts"
            >
              <Bell className="w-5 h-5" />
              {activeAlertsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {isAlertsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white/70 dark:bg-[#071a11]/70 backdrop-blur-xl rounded-xl shadow-xl border border-slate-200/90 z-50 overflow-hidden">
                <div className="p-3 bg-slate-50/90 dark:bg-[#0b2418]/90 border-b border-slate-200/80 dark:border-[#123021]/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      System Alerts ({activeAlertsCount} Active)
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setIsAlertsOpen(false);
                      setCurrentView("alerts");
                    }}
                    className="text-xs text-emerald-700 font-semibold hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {alerts.slice(0, 4).map((alert) => (
                    <div key={alert.id} className="p-3 hover:bg-slate-100/80 dark:hover:bg-[#0b2418]/60 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            alert.severity === "critical"
                              ? "bg-rose-100 text-rose-800"
                              : alert.severity === "warning"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {alert.type}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">{alert.timeAgo}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">{alert.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5">
                        {alert.description}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t border-slate-100 dark:border-[#123021] bg-slate-50/90 dark:bg-[#0b2418]/90 text-center">
                  <button
                    onClick={() => {
                      setIsAlertsOpen(false);
                      setCurrentView("alerts");
                    }}
                    className="text-xs text-slate-700 dark:text-slate-300 font-medium hover:text-emerald-700 cursor-pointer"
                  >
                    Manage all operational notices →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* System Settings Icon */}
          <button
            onClick={() => setCurrentView("settings")}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-[#0b2418] rounded-lg transition-colors focus:outline-none cursor-pointer"
            title="System Settings & Endpoints"
          >
            <Settings className="w-5 h-5" />
          </button>

          <div className="h-6 w-px bg-slate-200 mx-0.5 hidden sm:block" />

          {/* User Profile Capsule */}
          <button
            onClick={() => setCurrentView("settings")}
            className="flex items-center gap-2.5 p-1 sm:px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#0b2418] transition-colors text-left focus:outline-none cursor-pointer"
          >
            <UserAvatar
              name={userProfile.name}
              avatarUrl={userProfile.avatarUrl}
              size="sm"
              shape="circle"
            />
            <div className="hidden md:block">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight flex items-center gap-1">
                {userProfile.name}
              </div>
              <div className="text-[11px] text-slate-500 leading-tight truncate max-w-[120px]">
                {userProfile.title}
              </div>
            </div>
          </button>
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </>
  );
};

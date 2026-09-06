import React, { useState } from "react";
import {
  Activity,
  Copy,
  Check,
  Edit2,
  ArrowRight,
  FileText,
  Users,
  Boxes,
  ClipboardList,
  Server,
  Settings,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { PageHeader } from "../components/PageHeader";
import { UserAvatar } from "../components/UserAvatar";

export const SystemSettingsView: React.FC = () => {
  const { userProfile, setCurrentView, showToast } = useApp();

  const [baseUrl, setBaseUrl] = useState("https://api.smart-eco-pharma.com/v2");
  const [environment, setEnvironment] = useState("Production");
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(baseUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast("Base URL copied to clipboard.", undefined, "info");
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Title */}
      <PageHeader
        eyebrow="Administration"
        icon={Settings}
        title="System Settings"
        subtitle="Manage integration endpoints, account details, and system health."
      />

      {/* Top 2 Cards: API Connection Health & User Profile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* API Connection Health Card */}
        <div className="bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-[#123021]/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#123021]">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>API Connection Health</span>
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              Connected
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs pt-1">
            <div className="p-3 bg-slate-50/90 dark:bg-[#0b2418]/90 rounded-xl border border-slate-100 dark:border-[#123021]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Latency</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono mt-1 block">24ms</span>
            </div>

            <div className="p-3 bg-slate-50/90 dark:bg-[#0b2418]/90 rounded-xl border border-slate-100 dark:border-[#123021]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Last Sync</span>
              <span className="text-xs font-semibold text-emerald-700 mt-1 block">Just now</span>
            </div>

            <div className="p-3 bg-slate-50/90 dark:bg-[#0b2418]/90 rounded-xl border border-slate-100 dark:border-[#123021]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Uptime</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono mt-1 block">99.98%</span>
            </div>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-[#123021]/80 p-6 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <UserAvatar name={userProfile.name} avatarUrl={userProfile.avatarUrl} size="lg" />
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 leading-tight">
                {userProfile.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{userProfile.title}</p>
              <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                  {userProfile.licenseNumber}
                </span>
                {userProfile.branch && (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {userProfile.branch}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setCurrentView("account-settings")}
            className="px-3.5 py-2 bg-slate-100 dark:bg-[#0b2418]/90 hover:bg-slate-200 dark:hover:bg-[#123021] text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Row: Endpoint Configuration & Operations Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Endpoint Configuration (Left 6 cols) */}
        <div className="lg:col-span-6 bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-[#123021]/80 p-6 shadow-xs space-y-4 text-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 pb-3 border-b border-slate-100 dark:border-[#123021] flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-600" />
            <span>Endpoint Configuration</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Production Base URL</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  className="w-full h-10 pl-3 pr-10 bg-slate-50/90 dark:bg-[#0b2418]/90 border border-slate-200/80 dark:border-[#123021]/80 rounded-xl font-mono text-xs text-slate-900 dark:text-slate-100 focus:bg-white focus:border-emerald-600 outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="absolute right-2 text-slate-400 hover:text-slate-700 dark:text-slate-300 p-1 rounded-md"
                  title="Copy URL"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Active Environment</label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50/90 dark:bg-[#0b2418]/90 border border-slate-200/80 dark:border-[#123021]/80 rounded-xl text-slate-900 dark:text-slate-100 font-semibold focus:border-emerald-600 outline-none"
              >
                <option value="Production">Production (Primary Cluster)</option>
                <option value="Staging">Staging (Pre-release Verification)</option>
                <option value="Sandbox">Sandbox (Clinical Simulation)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4 Operations Metrics Cards (Right 6 cols) matching screenshot */}
        <div className="lg:col-span-6 grid grid-cols-2 gap-4">
          {/* Active Prescriptions */}
          <div className="bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-[#123021]/80 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Active Prescriptions
              </span>
              <ClipboardList className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">1,204</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Dispensed this cycle</p>
            </div>
          </div>

          {/* Total Patients */}
          <div className="bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-[#123021]/80 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Patients
              </span>
              <Users className="w-4 h-4 text-teal-600" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">8,430</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Central panel records</p>
            </div>
          </div>

          {/* Low Stock Items */}
          <div className="bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-[#123021]/80 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Low Stock Items
              </span>
              <Boxes className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">452</div>
              <p className="text-[11px] text-slate-500 mt-0.5">All branch depots</p>
            </div>
          </div>

          {/* Logs Processed */}
          <div className="bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-[#123021]/80 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Logs Processed
              </span>
              <FileText className="w-4 h-4 text-teal-600" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">32k</div>
              <p className="text-[11px] text-slate-500 mt-0.5">21 CFR Audit entries</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

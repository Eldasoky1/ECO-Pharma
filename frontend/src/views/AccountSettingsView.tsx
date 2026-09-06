import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  User,
  BellRing,
  Moon,
  Sun,
  Save,
  UserRound,
  BadgeCheck,
  Building2,
  Smartphone,
  Mail,
  ShieldCheck,
  Activity,
  KeyRound,
  Eye,
  EyeOff,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { PageHeader } from "../components/PageHeader";
import { UserAvatar } from "../components/UserAvatar";
import { AvatarPicker } from "../components/AvatarPicker";
import { PasswordStrength } from "../components/PasswordStrength";
import { evaluatePassword } from "../utils/password";
import { verifyPassword, updatePassword } from "../lib/supabase";

const inputClass =
  "w-full h-10 px-3 bg-slate-50 dark:bg-[#071a11]/50 border border-slate-200 dark:border-[#123021] rounded-xl focus:bg-white focus:border-emerald-600 outline-none text-slate-900 dark:text-slate-100 font-medium text-sm transition-colors";

export const AccountSettingsView: React.FC = () => {
  const { userProfile, setUserProfile, setCurrentView, showToast, theme, toggleTheme, autoRefreshSensors, setAutoRefreshSensors } = useApp();

  const [editAvatar, setEditAvatar] = useState(userProfile.avatarUrl);
  const [editName, setEditName] = useState(userProfile.name);
  const [editTitle, setEditTitle] = useState(userProfile.title);
  const [editBranch, setEditBranch] = useState(userProfile.branch);
  const [editLicense, setEditLicense] = useState(userProfile.licenseNumber);
  const [editPhone, setEditPhone] = useState(userProfile.phone);
  const [editEmail, setEditEmail] = useState(userProfile.email);
  const [notifyHighRisk, setNotifyHighRisk] = useState(true);
  const [notifyStock, setNotifyStock] = useState(true);
  const [notifyTelemetry, setNotifyTelemetry] = useState(true);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [revealCurrent, setRevealCurrent] = useState(false);
  const [lastSetPassword, setLastSetPassword] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUserProfile((prev) => ({
      ...prev,
      avatarUrl: editAvatar,
      name: editName,
      title: editTitle,
      branch: editBranch,
      licenseNumber: editLicense,
      phone: editPhone,
      email: editEmail,
    }));
    showToast("Account settings saved.", undefined, "success");
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);

    if (!newPassword) {
      setPwError("Enter a new password first.");
      return;
    }

    // Unchanged password on resubmit? Fluidly reveal the current-password gate instead of a plain reset.
    if (lastSetPassword && newPassword === lastSetPassword && !revealCurrent) {
      setRevealCurrent(true);
      return;
    }

    if (revealCurrent && !currentPassword) {
      setPwError("Enter your current password to confirm this change.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }

    const { meetsAll } = evaluatePassword(newPassword);
    if (!meetsAll) {
      setPwError("Password does not meet the strength requirements below.");
      return;
    }

    setPwBusy(true);
    try {
      if (revealCurrent) {
        const ok = await verifyPassword(userProfile.email, currentPassword);
        if (!ok) {
          setPwError("Current password is incorrect.");
          return;
        }
      }
      await updatePassword(newPassword);
      setLastSetPassword(newPassword);
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
      setRevealCurrent(false);
      setPwSuccess("Password updated instantly in the database.");
      showToast("Password updated successfully.", undefined, "success");
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Failed to update password.");
    } finally {
      setPwBusy(false);
    }
  };

  const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void }> = ({ checked, onChange }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
        checked ? "bg-emerald-600" : "bg-slate-300 dark:bg-[#123021]"
      }`}
      aria-pressed={checked}
    >
      <span
        className={`block w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );

  const ToggleRow: React.FC<{ icon: React.ReactNode; label: string; description: string; checked: boolean; onChange: (v: boolean) => void }> = ({
    icon,
    label,
    description,
    checked,
    onChange,
  }) => (
    <div className="flex items-center justify-between gap-4 p-3.5 bg-slate-50/70 dark:bg-[#0b2418]/60 border border-slate-100 dark:border-[#123021] rounded-xl">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-white dark:bg-[#0b2418] border border-slate-200 dark:border-[#123021] flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
          {icon}
        </div>
        <div>
          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{label}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">{description}</div>
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
      {/* Page header + back to settings */}
      <div className="flex items-start gap-3">
        <button
          onClick={() => setCurrentView("settings")}
          className="p-2 rounded-xl bg-white/60 dark:bg-[#0b2418]/80 border border-slate-200 dark:border-[#123021] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#123021] transition-colors cursor-pointer mt-1"
          title="Back to System Settings"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <PageHeader
          eyebrow="Administration"
          icon={UserRound}
          title="Account Settings"
          subtitle="Manage your pharmacist identity, roles, and notification preferences."
          className="flex-1"
        />
      </div>

      {/* Account hero card */}
      <div className="bg-gradient-to-br from-teal-800/80 to-emerald-900/80 backdrop-blur-xl text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-white/5 rounded-full blur-lg pointer-events-none" />
        <div className="flex items-center gap-4 relative">
          <UserAvatar name={editName || userProfile.name} avatarUrl={editAvatar} size="xl" shape="circle" />
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold tracking-tight">{editName || "Pharmacist"}</h2>
            <p className="text-xs text-teal-100/90">{editTitle || "Pharmacist"}</p>
            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold bg-white/10 border border-white/15 px-2 py-0.5 rounded-md">
                <BadgeCheck className="w-3 h-3 text-teal-200" />
                {editLicense || "LIC-000000"}
              </span>
              {editBranch && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-white/10 border border-white/15 px-2 py-0.5 rounded-md">
                  <Building2 className="w-3 h-3 text-teal-200" />
                  {editBranch}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile identity card */}
        <div className="bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-[#123021]/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#123021]">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              Pharmacist Identity
            </h3>
          </div>

          <AvatarPicker
            name={editName || userProfile.name}
            value={editAvatar}
            onChange={setEditAvatar}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5 text-xs flex items-center gap-1.5">
                <UserRound className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Full Name
              </label>
              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={inputClass} required />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5 text-xs flex items-center gap-1.5">
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Title & Role
              </label>
              <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className={inputClass} required />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5 text-xs flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Branch Location
              </label>
              <input type="text" value={editBranch} onChange={(e) => setEditBranch(e.target.value)} className={inputClass} />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5 text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Board License Number
              </label>
              <input type="text" value={editLicense} onChange={(e) => setEditLicense(e.target.value)} className={`${inputClass} font-mono`} required />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5 text-xs flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Email Address
              </label>
              <input
                type="text"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full h-10 px-3 bg-slate-100 dark:bg-[#0b2418]/50 border border-slate-200 dark:border-[#123021] rounded-xl text-slate-500 dark:text-slate-400 outline-none cursor-not-allowed font-medium text-sm"
                readOnly
                disabled
              />
              <p className="text-[11px] text-slate-400 mt-1">Managed by Supabase Auth (SSO).</p>
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5 text-xs flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Phone Number
              </label>
              <input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Password & Security */}
        <div className="bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-[#123021]/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#123021]">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-600" />
              Password & Security
            </h3>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 px-2 py-0.5 rounded-full">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600" />
              </span>
              Supabase Auth
            </span>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5 text-xs flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPw ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPwSuccess(null);
                    }}
                    placeholder="12+ chars, upper, lower, digit, symbol"
                    className={`${inputClass} pr-10 font-mono ${revealCurrent ? "opacity-60" : ""}`}
                    disabled={pwBusy}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw((v) => !v)}
                    aria-label={showNewPw ? "Hide new password" : "Show new password"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <PasswordStrength password={newPassword} />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5 text-xs flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPw ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat the new password"
                    className={`${inputClass} pr-10 font-mono ${revealCurrent ? "opacity-60" : ""}`}
                    disabled={pwBusy}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw((v) => !v)}
                    aria-label={showConfirmPw ? "Hide confirmation" : "Show confirmation"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Fluidly revealed current-password gate when the password is unchanged */}
            <AnimatePresence initial={false}>
              {revealCurrent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 28 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-xl border border-emerald-300/60 dark:border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-500/[0.07] p-3.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      <KeyRound className="w-3.5 h-3.5" />
                      Looks like the password is unchanged.
                    </div>
                    <p className="mt-1 text-[11px] text-emerald-700/80 dark:text-emerald-300/70">
                      Enter your current password to confirm a quick reset, then save again — the change applies to
                      the database immediately.
                    </p>
                    <div className="relative mt-3">
                      <input
                        type={showCurrentPw ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Current password"
                        className={`${inputClass} pr-10 font-mono`}
                        disabled={pwBusy}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPw((v) => !v)}
                        aria-label={showCurrentPw ? "Hide current password" : "Show current password"}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                      >
                        {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {pwError && (
              <div className="flex items-center gap-2 text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/25 rounded-xl px-3.5 py-2.5">
                <AlertCircle className="w-3.5 h-3.5" />
                {pwError}
              </div>
            )}
            {pwSuccess && (
              <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 rounded-xl px-3.5 py-2.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {pwSuccess}
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-1">
              <p className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:block">
                Uses your active session — no re-login needed.
              </p>
              <button
                type="submit"
                disabled={pwBusy}
                className="ml-auto inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:active:bg-emerald-700 active:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-md shadow-slate-900/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pwBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                {revealCurrent ? "Confirm & Update" : "Update Password"}
              </button>
            </div>
          </form>
        </div>

        {/* Preferences */}
        <div className="bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-[#123021]/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#123021]">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BellRing className="w-4 h-4 text-emerald-600" />
              Notification Preferences
            </h3>
          </div>

          <div className="space-y-2.5">
            <ToggleRow
              icon={<ShieldCheck className="w-3.5 h-3.5" />}
              label="Critical risk & temperature excursions"
              description="Immediate alert for major or critical pharmacology/sensor events."
              checked={notifyHighRisk}
              onChange={setNotifyHighRisk}
            />
            <ToggleRow
              icon={<Activity className="w-3.5 h-3.5" />}
              label="Live sensor telemetry polling"
              description="Auto-refresh cold storage readings while viewing the dashboard."
              checked={autoRefreshSensors}
              onChange={setAutoRefreshSensors}
            />
            <ToggleRow
              icon={<BellRing className="w-3.5 h-3.5" />}
              label="Low stock & reorder alerts"
              description="Notify when stock falls below reorder thresholds."
              checked={notifyStock}
              onChange={setNotifyStock}
            />
            <ToggleRow
              icon={<Activity className="w-3.5 h-3.5" />}
              label="Delivery & system update notices"
              description="Non-critical operational updates such as shipment slips and model refreshes."
              checked={notifyTelemetry}
              onChange={setNotifyTelemetry}
            />
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-[#123021]/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#123021]">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Appearance
            </h3>
          </div>

          <div className="flex items-center justify-between gap-4 p-3.5 bg-slate-50/70 dark:bg-[#0b2418]/60 border border-slate-100 dark:border-[#123021] rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white dark:bg-[#0b2418] border border-slate-200 dark:border-[#123021] flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                {theme === "light" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Theme</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Choose comfortable viewing brightness.</div>
              </div>
            </div>
            <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#0b2418] border border-slate-200 dark:border-[#123021] rounded-xl">
              <button
                type="button"
                onClick={() => theme === "dark" && toggleTheme()}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                  theme === "light" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                }`}
              >
                <Sun className="w-3.5 h-3.5" /> Light
              </button>
              <button
                type="button"
                onClick={() => theme === "light" && toggleTheme()}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                  theme === "dark" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                }`}
              >
                <Moon className="w-3.5 h-3.5" /> Dark
              </button>
            </div>
          </div>
        </div>

        {/* Sticky save bar */}
        <div className="flex items-center justify-between gap-3 sticky bottom-4 bg-white/80 dark:bg-[#071a11]/80 backdrop-blur-xl border border-slate-200/80 dark:border-[#123021]/80 rounded-2xl p-3.5 shadow-lg">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
            Changes sync to your local profile instantly.
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={() => setCurrentView("settings")}
              className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 dark:text-slate-300 dark:bg-[#0b2418] font-semibold text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-[#123021] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-900/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
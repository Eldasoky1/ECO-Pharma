import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Loader2,
  Radio,
  Sparkles,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  RefreshCw,
  AlertTriangle,
  Moon,
  Sun,
  Globe,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { BrandLogo } from "../components/BrandLogo";
import { AvatarPicker } from "../components/AvatarPicker";
import Silk from "../components/Silk";
import { PasswordStrength } from "../components/PasswordStrength";
import { circularThemeToggle } from "../utils/themeTransition";
import {
  requestSignupCode,
  verifySignupCode,
  requestResetCode,
  resetPassword,
  authErrorMessage,
} from "../api";
import { evaluatePassword } from "../utils/password";

type AuthMode = "signin" | "signup";
type AuthScreen = "signin" | "signup" | "signup-code" | "forgot-email" | "forgot-code" | "forgot-password";

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const isValidEmail = (value: string): boolean => EMAIL_RE.test(value.trim());

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const RESEND_SECONDS = 60;

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.length > 2 ? local.slice(0, 2) : local.slice(0, 1);
  return `${visible}${"*".repeat(Math.max(0, local.length - visible.length))}@${domain}`;
}

export const AuthView: React.FC = () => {
  const { currentView, setCurrentView, beginAuth, completeAuth, showToast, navigateWithTransition, theme, toggleTheme } = useApp();

  const [mode, setMode] = useState<AuthMode>(currentView === "signup" ? "signup" : "signin");
  const [screen, setScreen] = useState<AuthScreen>(mode === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailMask, setEmailMask] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const [showDuplicate, setShowDuplicate] = useState(false);

  const [revealSignin, setRevealSignin] = useState(false);
  const [revealNew, setRevealNew] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const pillarColors = useMemo(
    () =>
      theme === "dark"
        ? { top: "#0a7a6c", bottom: "#9df2df" }
        : { top: "#12826f", bottom: "#5ee0c4" },
    [theme]
  );

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setInterval(() => {
      setResendIn((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendIn]);

  const isSignup = mode === "signup";
  const isForgot = screen.startsWith("forgot");

  const switchMode = (m: AuthMode) => {
    if (isSubmitting || isExiting) return;
    setMode(m);
    setScreen(m);
    setFormError(null);
    setCode("");
    setNewPassword("");
    setConfirmPassword("");
    setCurrentView(m);
  };

  const toScreen = (s: AuthScreen) => {
    setScreen(s);
    setFormError(null);
    setCode("");
  };

  const startCountdown = () => setResendIn(RESEND_SECONDS);

  const finishAuth = (title: string, description: string, next: () => Promise<void>) => {
    setIsExiting(true);
    showToast(title, description, "success");
    window.setTimeout(() => {
      next().catch(() => setIsExiting(false));
    }, 700);
  };

  // ── Sign in ──────────────────────────────────────────────────────────────
  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isExiting) return;
    setFormError(null);
    setIsSubmitting(true);
    try {
      await beginAuth(email.trim(), password, { mode: "signin" });
      setIsSubmitting(false);
      finishAuth("Signed in successfully.", `Welcome back, ${email.split("@")[0]}.`, async () => completeAuth());
    } catch (err) {
      setIsSubmitting(false);
      setFormError(err instanceof Error ? err.message : "Sign-in failed. Please check your email and password.");
    }
  };

  // ── Sign up ──────────────────────────────────────────────────────────────
  const signupStrength = evaluatePassword(password);

  const handleSignupRequest = async () => {
    if (isSubmitting || isExiting) return;
    setFormError(null);
    if (!isValidEmail(email)) {
      setFormError("Enter a valid email address (e.g. name@example.com).");
      return;
    }
    if (!signupStrength.meetsAll) {
      setFormError("Complete every password requirement below before creating your account.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await requestSignupCode(email.trim());
      setIsSubmitting(false);
      if (res.exists) {
        setShowDuplicate(true);
        return;
      }
      setEmailMask(res.maskedEmail ?? maskEmail(email.trim()));
      setDevCode(res.devCode ?? null);
      setCode("");
      toScreen("signup-code");
      startCountdown();
    } catch (err) {
      setIsSubmitting(false);
      setFormError(authErrorMessage(err));
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSignupRequest();
  };

  const handleVerifySignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isExiting) return;
    if (code.length !== 8) {
      setFormError("Enter the 8-digit code sent to your email.");
      return;
    }
    setFormError(null);
    setIsSubmitting(true);
    try {
      await verifySignupCode({
        email: email.trim(),
        code,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password,
      });
      setIsSubmitting(false);
      finishAuth("Account created.", `Welcome to Smart Eco-Pharma Hub${firstName ? `, ${firstName}` : ""}.`, async () => {
        await beginAuth(email.trim(), password, { mode: "signin", firstName: firstName.trim(), lastName: lastName.trim(), avatarUrl });
        completeAuth();
      });
    } catch (err) {
      setIsSubmitting(false);
      setFormError(authErrorMessage(err));
    }
  };

  const handleResendSignup = async () => {
    if (resendIn > 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await requestSignupCode(email.trim());
      if (res.exists) {
        setShowDuplicate(true);
        return;
      }
      setDevCode(res.devCode ?? null);
      startCountdown();
      setFormError(null);
    } catch (err) {
      setFormError(authErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Forgot / reset password ──────────────────────────────────────────────
  const startForgot = (prefillEmail: string) => {
    if (prefillEmail) setEmail(prefillEmail);
    setNewPassword("");
    setConfirmPassword("");
    setCode("");
    setDevCode(null);
    setFormError(null);
    toScreen("forgot-email");
  };

  const handleForgotEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setFormError(null);
    if (!isValidEmail(email)) {
      setFormError("Enter a valid email address (e.g. name@example.com).");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await requestResetCode(email.trim());
      setIsSubmitting(false);
      setEmailMask(res.maskedEmail ?? maskEmail(email.trim()));
      setDevCode(res.devCode ?? null);
      setCode("");
      toScreen("forgot-code");
      startCountdown();
    } catch (err) {
      setIsSubmitting(false);
      setFormError(authErrorMessage(err));
    }
  };

  const handleForgotCodeContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 8) {
      setFormError("Enter the 8-digit code sent to your email.");
      return;
    }
    setFormError(null);
    toScreen("forgot-password");
  };

  const resetStrength = evaluatePassword(newPassword);

  const handleForgotComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isExiting) return;
    setFormError(null);
    if (!resetStrength.meetsAll) {
      setFormError("Complete every password requirement below before continuing.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError("Passwords do not match. Please re-enter your new password.");
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPassword({ email: email.trim(), code, newPassword });
      setIsSubmitting(false);
      finishAuth("Password updated.", "Signing you in with your new password…", async () => {
        await beginAuth(email.trim(), newPassword, { mode: "signin" });
        completeAuth();
      });
    } catch (err) {
      setIsSubmitting(false);
      setFormError(authErrorMessage(err));
    }
  };

  const handleResendReset = async () => {
    if (resendIn > 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await requestResetCode(email.trim());
      setDevCode(res.devCode ?? null);
      setFormError(null);
      setCode("");
      startCountdown();
    } catch (err) {
      setFormError(authErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full h-12 px-4 rounded-xl border bg-white/80 dark:bg-white/5 border-slate-200 dark:border-white/10 outline-none text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:bg-white dark:focus:bg-white/[0.07] focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300";

  const passwordClass = `${inputClass} pr-12`;

  const codeInputClass =
    "w-full h-16 rounded-xl border bg-white/80 dark:bg-white/5 border-slate-200 dark:border-white/10 outline-none text-center font-mono text-2xl font-bold tracking-[0.6em] text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300";

  const secondaryButtonClass =
    "inline-flex items-center justify-center gap-2 h-12 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:border-emerald-300 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all duration-300 cursor-pointer disabled:opacity-60";

  const primaryButtonClass =
    "w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:from-emerald-700 active:to-teal-700 text-white text-sm font-bold shadow-lg shadow-emerald-900/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer";

  const errorBanner = (
    <AnimatePresence initial={false}>
      {formError && (
        <motion.div
          key="auth-error"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="mt-4 rounded-xl border border-red-300/70 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
        >
          {formError}
        </motion.div>
      )}
    </AnimatePresence>
  );

  const devCodeHint = devCode && (
    <div className="mt-3 rounded-xl border border-amber-300/70 bg-amber-50 px-3.5 py-2.5 text-[11px] font-medium text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
      Development build — no email provider configured, so the code is shown here:
      <strong className="ml-1 font-mono tracking-widest">{devCode}</strong>
      <br />
      Add <code className="font-mono">RESEND_API_KEY</code> or SMTP settings to the backend <code className="font-mono">.env</code> to email it instead.
    </div>
  );

  const resendRow = (onResend: () => void) => (
    <div className="mt-4 flex items-center justify-center gap-2">
      <span className="text-[11px] text-slate-500 dark:text-slate-400">Didn't get it?</span>
      <button
        type="button"
        onClick={onResend}
        disabled={resendIn > 0 || isSubmitting}
        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 disabled:cursor-not-allowed disabled:text-slate-400 dark:disabled:text-slate-600 transition-colors cursor-pointer"
      >
        <RefreshCw className={`w-3 h-3 ${resendIn > 0 ? "" : ""} ${isSubmitting ? "animate-spin" : ""}`} />
        {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
      </button>
    </div>
  );

  const codeBlock = (onContinue: (e: React.FormEvent) => Promise<void> | void, label: string, onBack: () => void) => (
    <>
      <div className="mt-6 flex items-center justify-between">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors cursor-pointer">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          <KeyRound className="w-3 h-3" /> Step 1 of 2
        </span>
      </div>

      <div className="mt-5 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 shadow-lg shadow-emerald-900/25">
          <Mail className="w-5 h-5 text-white" />
        </div>
        <p className="mt-3 text-sm font-bold text-slate-800 dark:text-white">Enter the 8-digit code</p>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
          We emailed a verification code to <strong className="text-emerald-600 dark:text-emerald-400">{emailMask}</strong>.
          {label === "forgot" && " Use it to finish resetting your password."}
        </p>
      </div>

      {errorBanner}
      {devCodeHint}

      <form onSubmit={(e) => void onContinue(e)} className="mt-6 flex flex-col gap-4">
        <div>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
            placeholder="••••••••"
            autoFocus
            inputMode="numeric"
            autoComplete="one-time-code"
            className={codeInputClass}
          />
        </div>
        <button type="submit" disabled={isSubmitting || isExiting || code.length !== 8} className={primaryButtonClass}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying…
            </>
          ) : (
            <>
              {label === "forgot" ? "Verify code and continue" : "Verify and create account"}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {resendRow(label === "forgot" ? handleResendReset : handleResendSignup)}
    </>
  );

  const forgotPasswordNewPasswordBlock = (
    <>
      <div className="mt-6 flex items-center justify-between">
        <button type="button" onClick={() => toScreen("forgot-code")} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors cursor-pointer">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          <KeyRound className="w-3 h-3" /> Step 2 of 2
        </span>
      </div>

      <div className="mt-5 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 shadow-lg shadow-emerald-900/25">
          <KeyRound className="w-5 h-5 text-white" />
        </div>
        <p className="mt-3 text-sm font-bold text-slate-800 dark:text-white">Choose a new password</p>
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">For <strong className="text-emerald-600 dark:text-emerald-400">{emailMask}</strong>.</p>
      </div>

      {errorBanner}

      <form onSubmit={handleForgotComplete} className="mt-6 flex flex-col gap-4">
        <div>
          <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">New Password</label>
          <div className="relative">
            <input
              type={revealNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="new-password"
              className={passwordClass}
            />
            <button
              type="button"
              onClick={() => setRevealNew((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
              aria-label={revealNew ? "Hide password" : "Show password"}
            >
              {revealNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <PasswordStrength password={newPassword} />
        </div>

        <div>
          <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your new password"
            autoComplete="new-password"
            className={`${inputClass} ${confirmPassword && confirmPassword !== newPassword ? "border-red-400 focus:border-red-400 focus:ring-red-500/10" : ""}`}
          />
          {confirmPassword && confirmPassword !== newPassword && (
            <p className="mt-1.5 ml-1 text-[10px] font-medium text-red-500 dark:text-red-400">Passwords do not match.</p>
          )}
        </div>

        <button type="submit" disabled={isSubmitting || isExiting} className={primaryButtonClass}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Updating…
            </>
          ) : (
            <>
              Set New Password
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </>
  );

  const duplicateEmailModal = (
    <AnimatePresence>
      {showDuplicate && (
        <motion.div
          key="duplicate-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center p-6"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDuplicate(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-sm rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-[#02140d]/95 backdrop-blur-2xl p-7 shadow-2xl"
          >
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-500/15">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="mt-4 text-lg font-black text-slate-900 dark:text-white">Email already registered</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                <strong className="text-slate-700 dark:text-slate-200">{email.trim()}</strong> already has an account on
                Smart Eco-Pharma Hub. Would you like to log in instead, or reset its password?
              </p>

              <div className="mt-6 flex w-full flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowDuplicate(false);
                    switchMode("signin");
                  }}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold shadow-lg shadow-emerald-900/25 transition-all duration-300 cursor-pointer"
                >
                  Log In with this email
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDuplicate(false);
                    startForgot(email.trim());
                  }}
                  className={`${secondaryButtonClass} w-full`}
                >
                  Reset the password
                </button>
                <button
                  type="button"
                  onClick={() => setShowDuplicate(false)}
                  className="w-full h-10 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <motion.div
      initial={false}
      animate={isExiting ? { opacity: 0, scale: 1.05, filter: "blur(10px)" } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.65, ease: "easeInOut" }}
      className="min-h-screen w-full flex text-slate-900 dark:text-white"
    >
      {/* Theme toggle — dark & white modes */}
      <button
        type="button"
        aria-label={theme === "light" ? "Switch to dark mode" : "Switch to white mode"}
        onClick={(e) => circularThemeToggle(toggleTheme, e.clientX, e.clientY)}
        className="fixed top-5 right-5 z-[70] flex items-center justify-center w-11 h-11 rounded-full border border-slate-200/80 dark:border-white/15 bg-white/85 dark:bg-white/10 backdrop-blur-lg text-slate-600 dark:text-emerald-300 hover:scale-105 hover:text-emerald-600 dark:hover:text-emerald-200 shadow-lg shadow-black/5 transition-all duration-300 cursor-pointer"
      >
        {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </button>

      {/* Right brand panel — aurora, form is now LEFT on desktop */}
      <div className="hidden lg:flex lg:order-2 relative w-[44%] xl:w-[48%] items-center justify-center overflow-hidden">
        <div
          className={`absolute inset-0 ${
            theme === "dark"
              ? "bg-gradient-to-b from-[#04130d] via-[#0a3a2c] to-[#02100b]"
              : "bg-gradient-to-b from-[#eefcf6] via-[#d9f9ec] to-[#eefaf4]"
          }`}
        />
        {theme === "dark" && (
          <>
            <div className="absolute inset-0">
              <Silk
                speed={3.4}
                scale={1.1}
                color="#4adea5"
                noiseIntensity={1.6}
                rotation={0.4}
                lightMode={false}
              />
            </div>
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/70 via-black/10 to-black/40" />
          </>
        )}
        <div
          className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-24 lg:w-40 ${
            theme === "dark"
              ? "bg-gradient-to-r from-[#05100b] via-[#05100b]/40 to-transparent"
              : "bg-gradient-to-r from-white via-white/45 to-transparent"
          }`}
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="relative z-10 flex flex-col items-center max-w-md px-10 xl:px-14 text-center"
        >
          <motion.div
            variants={itemVariants}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-bold uppercase tracking-widest backdrop-blur ${
              theme === "dark"
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                : "border-emerald-600/30 bg-emerald-600/5 text-emerald-700"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Secure Clinical Portal
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className={`mt-6 text-4xl xl:text-5xl font-black tracking-tight leading-[1.12] ${
              theme === "dark" ? "text-white" : "text-slate-900"
            }`}
          >
            Every dose accounted for.
            <br />
            <span
              className={
                theme === "dark"
                  ? "bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent"
                  : "bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent"
              }
            >
              Every degree monitored.
            </span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className={`mt-5 text-sm leading-relaxed ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}
          >
            Sign in to orchestrate inventory, cold-chain telemetry and AI-driven safety across your entire pharmacy
            network.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-10 grid grid-cols-3 gap-6">
            {[
              { value: "124+", label: "IoT Sensors" },
              { value: "99.98%", label: "Chain Integrity" },
              { value: "42%", label: "Less Waste" },
            ].map((s) => (
              <div key={s.label}>
                <div className={`text-xl font-black ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{s.value}</div>
                <div
                  className={`mt-1 text-[10px] font-bold uppercase tracking-wider ${
                    theme === "dark" ? "text-emerald-200/70" : "text-emerald-700/80"
                  }`}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div
            variants={itemVariants}
            className={`mt-8 inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide ${
              theme === "dark" ? "text-emerald-200/70" : "text-emerald-700/80"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            www.smart-eco-pharma.com
          </motion.div>
        </motion.div>
      </div>

      {/* Left form panel */}
      <div className="flex-1 lg:order-first relative flex items-center justify-center p-6 sm:p-10 overflow-hidden">
        <div className="seph-aurora absolute -top-32 right-[-10rem] h-96 w-96 rounded-full bg-emerald-400/15 dark:bg-emerald-500/10 blur-[100px] pointer-events-none" />
        <div
          className="seph-aurora absolute bottom-[-12rem] left-[-8rem] h-96 w-96 rounded-full bg-teal-400/15 dark:bg-teal-500/10 blur-[100px] pointer-events-none"
          style={{ animationDelay: "-7s" }}
        />

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="relative z-10 w-full max-w-md">
          <motion.div variants={itemVariants} className="mb-8 flex flex-col items-center gap-1.5">
            <BrandLogo variant="full" size="lg" />
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <Globe className="w-3 h-3" /> www.smart-eco-pharma.com
            </span>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h1 className="text-2xl font-black tracking-tight text-center">
              {isForgot ? "Reset your password" : isSignup ? "Create your account" : "Welcome back"}
            </h1>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 text-center">
              {isForgot
                ? "We'll email you an 8-digit code to verify it's you."
                : isSignup
                  ? "Verify your email with an 8-digit code to join the network."
                  : "Access your Smart Eco-Pharma Hub dashboard."}
            </p>
          </motion.div>

          {!isForgot && (
            <motion.div
              variants={itemVariants}
              className="relative mt-7 grid grid-cols-2 gap-1 p-1 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur"
            >
              {(["signin", "signup"] as AuthMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className={`relative py-2.5 rounded-xl text-xs font-bold transition-colors duration-300 cursor-pointer ${
                    mode === m
                      ? "text-white"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  {mode === m && (
                    <motion.span
                      layoutId="auth-tab-pill"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      className="absolute inset-0 rounded-xl bg-emerald-600 shadow-md shadow-emerald-900/25"
                    />
                  )}
                  <span className="relative z-10">{m === "signin" ? "Sign In" : "Create Account"}</span>
                </button>
              ))}
            </motion.div>
          )}

          {screen === "signin" && !isForgot && (
            <>
              {errorBanner}
              <form onSubmit={handleSignin} className="mt-6 flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@smart-eco-pharma.com"
                    autoComplete="email"
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Password</label>
                  <div className="relative">
                    <input
                      type={revealSignin ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      autoComplete="current-password"
                      required
                      className={passwordClass}
                    />
                    <button
                      type="button"
                      onClick={() => setRevealSignin((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                      aria-label={revealSignin ? "Hide password" : "Show password"}
                    >
                      {revealSignin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-[#1a3a29] text-emerald-600 focus:ring-emerald-500/30 dark:bg-[#071a11]/50"
                    />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => startForgot(email.trim())}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-3 h-3" /> Secure Portal · 8-digit email verification enabled
                </div>

                <button type="submit" disabled={isSubmitting || isExiting} className={primaryButtonClass}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Authenticating…
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {screen === "signup" && !isForgot && (
            <>
              {errorBanner}
              <form onSubmit={handleSignupSubmit} className="mt-6 flex flex-col gap-4">
                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    isSignup ? "max-h-96 opacity-100 mt-0" : "max-h-0 opacity-0 -mt-2"
                  }`}
                >
                  <div className="mb-4">
                    <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">
                      Profile Photo <span className="font-normal text-slate-400">(optional)</span>
                    </label>
                    <AvatarPicker
                      name={`${firstName || ""} ${lastName || ""}`.trim() || "New Pharmacist"}
                      value={avatarUrl}
                      onChange={setAvatarUrl}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Sarah"
                        autoComplete="given-name"
                        required
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Jenkins"
                        autoComplete="family-name"
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@smart-eco-pharma.com"
                    autoComplete="email"
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Password</label>
                  <div className="relative">
                    <input
                      type={revealSignin ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      autoComplete="new-password"
                      required
                      minLength={12}
                      className={passwordClass}
                    />
                    <button
                      type="button"
                      onClick={() => setRevealSignin((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                      aria-label={revealSignin ? "Hide password" : "Show password"}
                    >
                      {revealSignin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <PasswordStrength password={password} />
                </div>

                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 ml-1">
                  After submitting, we'll email you an <strong>8-digit code</strong> to verify this address.
                </p>

                <button type="submit" disabled={isSubmitting || isExiting} className={primaryButtonClass}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending verification code…
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {screen === "signup-code" && codeBlock(handleVerifySignup, "signup", () => switchMode("signup"))}

          {screen === "forgot-email" && (
            <>
              <div className="mt-6 flex items-center justify-between">
                <button type="button" onClick={() => switchMode("signin")} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors cursor-pointer">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to sign in
                </button>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  <Mail className="w-3 h-3" /> Step 1 of 3
                </span>
              </div>
              {errorBanner}
              <form onSubmit={handleForgotEmail} className="mt-6 flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@smart-eco-pharma.com"
                    autoComplete="email"
                    required
                    className={inputClass}
                  />
                  <p className="mt-1.5 ml-1 text-[10px] text-slate-500 dark:text-slate-400">
                    We'll send an 8-digit code to this address.
                  </p>
                </div>
                <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending code…
                    </>
                  ) : (
                    <>
                      Send 8-digit code
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {screen === "forgot-code" && codeBlock(handleForgotCodeContinue, "forgot", () => toScreen("forgot-email"))}

          {screen === "forgot-password" && forgotPasswordNewPasswordBlock}

          <div className={`${isForgot ? "mt-6" : "mt-8"} flex items-center justify-between`}>
            <button
              type="button"
              onClick={() => navigateWithTransition("landing")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to home
            </button>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <Radio className="w-3 h-3 text-emerald-500" />
              <Sparkles className="w-3 h-3 text-teal-500" />
              v0.1.0 · Encrypted
            </span>
          </div>
        </motion.div>
      </div>

      {duplicateEmailModal}
    </motion.div>
  );
};
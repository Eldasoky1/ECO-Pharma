import React, { useEffect } from "react";
import { motion } from "motion/react";
import { Leaf } from "lucide-react";

interface AuthSplashProps {
  onDone: () => void;
}

/** Branded interstitial shown between successful authentication and the
 *  dashboard reveal. Mounts over the already-loading dashboard, holds briefly,
 *  then blurs away. */
export const AuthSplash: React.FC<AuthSplashProps> = ({ onDone }) => {
  useEffect(() => {
    const t = window.setTimeout(onDone, 1700);
    return () => window.clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      key="auth-splash"
      exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
      transition={{ duration: 0.55, ease: "easeInOut" }}
      className="fixed inset-0 z-[150] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#03130d] via-[#051c13] to-[#02100b]"
    >
      {/* Expanding concentric rings */}
      {[0, 0.35].map((delay) => (
        <motion.span
          key={delay}
          initial={{ scale: 0.3, opacity: 0.7 }}
          animate={{ scale: 2.6, opacity: 0 }}
          transition={{ duration: 1.4, delay, ease: "easeOut" }}
          className="absolute h-72 w-72 rounded-full border border-emerald-400/40"
        />
      ))}

      <div className="relative flex flex-col items-center gap-6">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
          className="flex items-center gap-3"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-900/50 ring-1 ring-white/20">
            <Leaf className="w-7 h-7 text-white" />
          </div>
          <div className="text-left">
            <p className="text-xl font-black tracking-tight text-white leading-tight">
              Smart Eco-Pharma Hub
            </p>
            <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-300/80">
              Clinical Workspace
            </p>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-xs font-medium text-emerald-100/60"
        >
          Preparing your dashboard…
        </motion.p>

        <div className="h-1 w-52 overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ x: "-110%" }}
            animate={{ x: "260%" }}
            transition={{ duration: 1.25, ease: "easeInOut" }}
            className="h-full w-1/2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
          />
        </div>
      </div>

      {/* Corner accents */}
      <div className="absolute top-6 left-6 h-8 w-8 border-l-2 border-t-2 border-emerald-500/40 rounded-tl-lg" />
      <div className="absolute top-6 right-6 h-8 w-8 border-r-2 border-t-2 border-emerald-500/40 rounded-tr-lg" />
      <div className="absolute bottom-6 left-6 h-8 w-8 border-l-2 border-b-2 border-emerald-500/40 rounded-bl-lg" />
      <div className="absolute bottom-6 right-6 h-8 w-8 border-r-2 border-b-2 border-emerald-500/40 rounded-br-lg" />
    </motion.div>
  );
};

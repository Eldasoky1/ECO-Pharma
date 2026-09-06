import React, { useRef } from "react";
import { motion } from "motion/react";
import {
  Thermometer,
  BellRing,
  TrendingUp,
  Radio,
  Leaf,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";

const SENSORS = [
  { id: "CS-204", loc: "Branch A · Refrigeration", temp: "2.1°C", tone: "bg-emerald-500", battery: "96%" },
  { id: "CS-311", loc: "Branch B · Deep Freeze", temp: "-18.4°C", tone: "bg-emerald-500", battery: "88%" },
  { id: "CS-118", loc: "Depot C · Cold Room", temp: "5.6°C", tone: "bg-amber-500", battery: "62%" },
];

const BARS = [34, 52, 41, 66, 58, 78, 70, 92, 84, 100];

export const HeroDashboardMock = () => {
  const tiltRef = useRef<HTMLDivElement>(null);

  const handleTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = tiltRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1200px) rotateX(${(-py * 3.5).toFixed(2)}deg) rotateY(${(px * 5).toFixed(2)}deg)`;
  };

  const resetTilt = () => {
    if (tiltRef.current) tiltRef.current.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg)";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 56 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-4xl mx-auto mt-16"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -inset-x-8 -top-10 bottom-20 bg-gradient-to-r from-emerald-500/20 via-teal-400/15 to-emerald-500/20 blur-3xl rounded-full" />

      {/* Tilt wrapper (plain div so motion float lives on the inner child) */}
      <div
        ref={tiltRef}
        onMouseMove={handleTilt}
        onMouseLeave={resetTilt}
        className="relative transition-transform duration-200 ease-out will-change-transform"
        style={{ transformStyle: "preserve-3d" }}
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          <div className="rounded-3xl border border-slate-200/80 dark:border-emerald-500/25 bg-white/85 dark:bg-[#03130c]/85 backdrop-blur-2xl shadow-[0_48px_140px_-40px_rgba(16,185,129,0.5)] dark:shadow-[0_40px_110px_-30px_rgba(0,0,0,0.85)] overflow-hidden text-left">
            {/* Window chrome */}
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-slate-200/70 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400/90" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400/90" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/90" />
              </div>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-[#0b2418] text-[10px] font-mono text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                hub.eco-pharma · operations
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-600/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                <Radio className="w-3 h-3 animate-pulse" />
                LIVE
              </span>
            </div>

            {/* Metric tiles */}
            <div className="grid sm:grid-cols-3 gap-px bg-slate-200/70 dark:bg-white/10">
              {[
                { icon: TrendingUp, label: "Stock Value", value: "$48.2k", delta: "+2.4%", accent: "text-emerald-600 dark:text-emerald-400" },
                { icon: Thermometer, label: "Cold-Chain Integrity", value: "99.98%", delta: "124 sensors", accent: "text-teal-600 dark:text-teal-300" },
                { icon: BellRing, label: "Active Alerts", value: "3", delta: "1 critical", accent: "text-rose-600 dark:text-rose-400" },
              ].map((tile) => (
                <div key={tile.label} className="bg-white/60 dark:bg-[#0b2418]/40 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {tile.label}
                    </span>
                    <tile.icon className={`w-3.5 h-3.5 ${tile.accent}`} />
                  </div>
                  <div className="mt-2 flex items-end justify-between gap-2">
                    <span className="text-xl font-black font-mono text-slate-900 dark:text-slate-100 tracking-tight">
                      {tile.value}
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold font-mono text-emerald-700 dark:text-emerald-300">
                      <ArrowUpRight className="w-3 h-3" />
                      {tile.delta}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Body: sensors + telemetry chart + alerts */}
            <div className="p-5 grid lg:grid-cols-5 gap-4">
              {/* Sensor feed */}
              <div className="lg:col-span-3">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Cold-Chain Feed
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-300 flex items-center gap-1">
                    <Radio className="w-3 h-3" /> 124 endpoints
                  </span>
                </div>
                <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden">
                  {SENSORS.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between gap-3 px-3.5 py-2.5 border-b border-slate-100 dark:border-white/5 last:border-b-0 bg-white/50 dark:bg-transparent"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-2 h-2 rounded-full ${s.tone} shrink-0`} />
                        <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-200">{s.id}</span>
                        <span className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 truncate">{s.loc}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-100">{s.temp}</span>
                        <span className="hidden md:block w-12 h-1 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                          <span
                            className={`block h-full rounded-full ${s.tone}`}
                            style={{ width: s.battery.replace("%", "%") }}
                          />
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{s.battery}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Telemetry bars */}
                <div className="mt-3 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/50 dark:bg-transparent px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Telemetry Throughput
                    </span>
                    <span className="text-[10px] font-bold font-mono text-emerald-600 dark:text-emerald-300">98.4k msg/min</span>
                  </div>
                  <div className="flex items-end gap-1.5 h-14">
                    {BARS.map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                        style={{ height: `${h}%` }}
                        className="flex-1 origin-bottom rounded-t bg-gradient-to-t from-emerald-600/40 to-emerald-500"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Alerts + eco chip */}
              <div className="lg:col-span-2 space-y-3">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Triage Queue
                </span>
                <div className="rounded-2xl border border-rose-200/80 dark:border-rose-500/30 bg-rose-50/70 dark:bg-rose-500/10 p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-rose-900 dark:text-rose-200">Temp excursion · Depot C</span>
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">Critical</span>
                  </div>
                  <p className="mt-1 text-[10px] text-rose-700/80 dark:text-rose-300/70 leading-relaxed">
                    Sensor CS-118 peaked at 8.2°C for 4 min. CAPA log opened.
                  </p>
                </div>
                <div className="rounded-2xl border border-amber-200/80 dark:border-amber-500/30 bg-amber-50/70 dark:bg-amber-500/10 p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200">Delivery delayed · Carrier 7</span>
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">Moderate</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-amber-100 dark:bg-amber-500/20 overflow-hidden">
                    <span className="block h-full w-2/3 rounded-full bg-amber-500" />
                  </div>
                </div>

                {/* Eco footprint */}
                <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-500/10 p-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300" />
                      <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-200">Waste reduced</span>
                    </div>
                    <span className="text-[11px] font-black font-mono text-emerald-700 dark:text-emerald-300">42%</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 overflow-hidden">
                    <span className="block h-full w-[42%] rounded-full bg-emerald-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HeroDashboardMock;
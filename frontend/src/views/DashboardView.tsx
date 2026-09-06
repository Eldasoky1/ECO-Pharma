import React, { useRef, useState } from "react";
import { motion } from "motion/react";
import {
  Boxes,
  TrendingUp,
  AlertTriangle,
  Bell,
  ArrowDownRight,
  ArrowUpRight,
  Thermometer,
  Shield,
  Truck,
  Plus,
  Zap,
  Activity,
  ChevronRight,
  RefreshCw,
  Leaf,
  CheckCircle2,
  Radio,
  Clock,
  Sparkles,
  Package,
} from "lucide-react";
import { useApp } from "../context/AppContext";

const VELOCITY_DAYS = [
  "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun",
  "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun",
];
const VELOCITY_DATA = [286, 312, 298, 341, 377, 355, 402, 388, 415, 397, 438, 452, 431, 468];
const VELOCITY_CEILING = 360;
const BAR_W = 720;
const BAR_H = 168;
const BAR_PAD = { l: 34, r: 6, t: 14, b: 22 };
const Y_MIN = 200;
const Y_MAX = 500;
const Y_TICKS = [200, 300, 400, 500];

const barY = (v: number) =>
  BAR_PAD.t + (1 - (v - Y_MIN) / (Y_MAX - Y_MIN)) * (BAR_H - BAR_PAD.t - BAR_PAD.b);

const InventoryVelocityChart: React.FC = () => {
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const n = VELOCITY_DATA.length;
  const plotW = BAR_W - BAR_PAD.l - BAR_PAD.r;
  const slot = plotW / n;
  const barW = Math.min(26, slot * 0.58);
  const baseY = BAR_H - BAR_PAD.b;
  const ceilingY = barY(VELOCITY_CEILING);

  const barCX = (i: number) => BAR_PAD.l + i * slot + slot / 2;

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const el = svgRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0) return;
    const px = ((e.clientX - rect.left) / rect.width) * BAR_W;
    const i = Math.round((px - BAR_PAD.l) / slot - 0.5);
    setHover(i >= 0 && i < n ? i : null);
  };

  return (
    <div className="rounded-2xl bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl border border-slate-200/80 dark:border-emerald-500/15 shadow-xs p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-emerald-500/10">
        <div className="flex items-center gap-2">
          <h2 className="text-[13px] font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            Discharge Velocity
          </h2>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
            <TrendingUp className="w-3 h-3" /> +14.6% MoM
          </span>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-[3px] bg-gradient-to-b from-emerald-400 to-teal-600" />
            Units dispatched
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 border-t-2 border-dashed border-amber-500/70" />
            Ceiling 360/day
          </span>
        </div>
      </div>

      <div className="relative mt-3">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${BAR_W} ${BAR_H}`}
          className="w-full h-auto block"
          onMouseMove={handleMove}
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>
            <linearGradient id="barHot" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>

          {Y_TICKS.map((t) => (
            <g key={t}>
              <line
                x1={BAR_PAD.l}
                x2={BAR_W - BAR_PAD.r}
                y1={barY(t)}
                y2={barY(t)}
                stroke="currentColor"
                className="text-slate-200/70 dark:text-emerald-500/10"
                strokeWidth="1"
              />
              <text
                x={BAR_PAD.l - 8}
                y={barY(t) + 3}
                textAnchor="end"
                className="fill-slate-400 text-[9px] font-mono"
              >
                {t}
              </text>
            </g>
          ))}

          {VELOCITY_DAYS.map((d, i) =>
            i % 2 === 1 ? (
              <text
                key={`${d}-${i}`}
                x={barCX(i)}
                y={BAR_H - 6}
                textAnchor="middle"
                className="fill-slate-400 text-[9px] font-mono"
              >
                {d}
              </text>
            ) : null
          )}

          {hover !== null && (
            <line
              x1={barCX(hover)}
              x2={barCX(hover)}
              y1={BAR_PAD.t}
              y2={baseY}
              stroke="#10b981"
              strokeWidth="1"
              strokeDasharray="3 3"
              opacity="0.5"
            />
          )}

          <line
            x1={BAR_PAD.l}
            x2={BAR_W - BAR_PAD.r}
            y1={ceilingY}
            y2={ceilingY}
            stroke="#f59e0b"
            strokeWidth="1.25"
            strokeDasharray="5 5"
          />

          {VELOCITY_DATA.map((v, i) => {
            const cx = barCX(i);
            const x = cx - barW / 2;
            const y = barY(v);
            const over = v > VELOCITY_CEILING;
            const overH = over ? Math.max(2, ceilingY - y) : 0;
            const baseH = Math.max(2, baseY - barY(Math.min(v, VELOCITY_CEILING)));
            const active = hover === i;
            const op = active ? 1 : 0.82;
            return (
              <g key={i}>
                <motion.rect
                  x={x}
                  y={barY(Math.min(v, VELOCITY_CEILING))}
                  width={barW}
                  height={baseH}
                  rx={3}
                  fill={over ? "#34d399" : "url(#barGrad)"}
                  opacity={op}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  style={{ transformOrigin: `${x + barW / 2}px ${baseY}px` }}
                  transition={{ duration: 0.5, delay: i * 0.03, ease: "easeOut" }}
                />
                {over && (
                  <motion.rect
                    x={x}
                    y={y}
                    width={barW}
                    height={overH}
                    rx={3}
                    fill="url(#barHot)"
                    opacity={op}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    style={{ transformOrigin: `${x + barW / 2}px ${ceilingY}px` }}
                    transition={{ duration: 0.5, delay: i * 0.03, ease: "easeOut" }}
                  />
                )}
                {active && (
                  <g>
                    <rect
                      x={cx - 16}
                      y={Math.max(4, y - 21)}
                      width={32}
                      height={16}
                      rx={4}
                      fill={over ? "#f59e0b" : "#10b981"}
                    />
                    <text
                      x={cx}
                      y={Math.max(4, y - 21) + 12}
                      textAnchor="middle"
                      className="fill-white text-[9px] font-mono font-bold"
                    >
                      {v}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="pt-2.5 mt-2 border-t border-slate-100 dark:border-emerald-500/10 flex items-center justify-between text-[10px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <RefreshCw className="w-3 h-3 text-slate-400" />
          Auto-replenishment syncs every 15 min with McKesson EDI
        </span>
        <span className="inline-flex items-center gap-1 font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/30">
          Peak: 468 units · Sun
        </span>
      </div>
    </div>
  );
};

export const DashboardView: React.FC = () => {
  const {
    drugs,
    alerts,
    sensors,
    setCurrentView,
    navigateToDrugDetail,
    reorderDrug,
    acknowledgeAlert,
    setIsPrescriptionModalOpen,
  } = useApp();

  const activeAlerts = alerts.filter((a) => !a.acknowledged);

  // Critical stock items
  const criticalItems = [
    {
      id: "amoxicillin-500",
      name: "Amoxicillin 500mg",
      sku: "AMX-500-CP",
      current: 12,
      unit: "caps",
      threshold: 50,
      percentage: 24,
      isVeryLow: true,
      category: "Antibiotics",
    },
    {
      id: "insulin-glargine-100",
      name: "Insulin Glargine 100u/mL",
      sku: "INS-GL-100",
      current: 5,
      unit: "vials",
      threshold: 20,
      percentage: 25,
      isVeryLow: true,
      category: "Cold-Chain / Antidiabetic",
    },
    {
      id: "lisinopril-10",
      name: "Lisinopril 10mg",
      sku: "LIS-10-TB",
      current: 140,
      unit: "tabs",
      threshold: 150,
      percentage: 93,
      isVeryLow: false,
      category: "Antihypertensives",
    },
    {
      id: "atorvastatin-20",
      name: "Atorvastatin 20mg",
      sku: "ATO-20-TB",
      current: 85,
      unit: "tabs",
      threshold: 100,
      percentage: 85,
      isVeryLow: false,
      category: "Statins",
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Title & Branch Subtitle with Live Environmental Status Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-[#123021]/80 p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Operational Overview
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Node
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time pharmacovigilance, cold storage telemetry, and stock metrics for Main Branch.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setCurrentView("live-sensors")}
            className="px-3.5 py-2 bg-slate-50/90 dark:bg-[#0b2418]/90 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 dark:text-slate-300 hover:text-emerald-800 text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
          >
            <Thermometer className="w-4 h-4 text-emerald-600" />
            <span>Zone Telemetry</span>
            <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
              3.8°C Avg
            </span>
          </button>

          <button
            onClick={() => setIsPrescriptionModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-emerald-950/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Dispense Order</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Active Drugs */}
        <div className="group relative overflow-hidden rounded-2xl bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl border border-slate-200/80 dark:border-[#123021]/80 p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-500/40">
          <div className="bg-gradient-to-r from-teal-500 to-emerald-500 -mx-5 -mt-5 mb-4 px-5 py-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-white/90 uppercase">
                Total Active Drugs
              </span>
              <div className="p-2 rounded-xl bg-white/15 text-white backdrop-blur-xs">
                <Boxes className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div>
            <div className="text-3xl font-black font-mono text-slate-900 dark:text-slate-100 tracking-tight">2,408</div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
              <span>Across 14 categories</span>
              <span className="inline-flex items-center gap-0.5 font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 px-1.5 py-0.5 rounded-full">
                <ArrowUpRight className="w-3 h-3" /> 99.8%
              </span>
            </div>
          </div>
        </div>

        {/* Total Stock Value */}
        <div className="group relative overflow-hidden rounded-2xl bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl border border-slate-200/80 dark:border-[#123021]/80 p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md hover:border-teal-300 dark:hover:border-teal-500/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              Total Stock Value
            </span>
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-200/80 dark:border-teal-500/30">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black font-mono text-slate-900 dark:text-slate-100 tracking-tight">$48.2k</div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                <ArrowUpRight className="w-3 h-3" /> +2.4%
              </span>
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Synced 12m ago</span>
            </p>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="group relative overflow-hidden rounded-2xl bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl border border-slate-200/80 dark:border-[#123021]/80 p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md hover:border-amber-300 dark:hover:border-amber-500/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              Low Stock Items
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-500/30">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black font-mono text-slate-900 dark:text-slate-100 tracking-tight">14</div>
            <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400 mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
              <span>4 items below critical buffer</span>
            </p>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-50/80 to-white/70 dark:from-rose-950/30 dark:to-[#03130c]/60 backdrop-blur-xl border border-rose-200/80 dark:border-rose-500/25 p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md hover:border-rose-400 dark:hover:border-rose-500/50">
          <div className="flex items-center justify-between z-10">
            <span className="text-[11px] font-bold tracking-wider text-rose-800 dark:text-rose-300 uppercase">
              Active Alerts
            </span>
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-500/30">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 z-10">
            <div className="flex items-end gap-2">
              <div className="text-3xl font-black font-mono text-rose-950 dark:text-rose-200 tracking-tight">
                {activeAlerts.length}
              </div>
              <span className="mb-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30 font-mono">
                Active
              </span>
            </div>
            <p className="text-[11px] font-medium text-rose-700/80 dark:text-rose-300/70 mt-1">
              Requires immediate triage
            </p>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-rose-500/10 rounded-full blur-xl pointer-events-none" />
        </div>
      </div>

      {/* Environmental & Eco-Pharma Health Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cold Storage Safe Envelope */}
        <div className="p-4 rounded-2xl bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl border border-slate-200/80 dark:border-[#123021]/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Cold-Chain Envelope</div>
              <div className="text-[11px] text-slate-500 font-mono">Nominal: 2.0°C – 8.0°C</div>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>100% In-Range</span>
            </span>
          </div>
        </div>

        {/* Eco-Disposal Compliance */}
        <div className="p-4 rounded-2xl bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl border border-slate-200/80 dark:border-[#123021]/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Eco-Disposal Compliance</div>
              <div className="text-[11px] text-slate-500">Zero non-compliant waste</div>
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-slate-100">142 kg</span>
            <div className="text-[10px] text-emerald-700 font-medium">Recycled this QTR</div>
          </div>
        </div>

        {/* DEA / Reg Audit Sync */}
        <div className="p-4 rounded-2xl bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl border border-slate-200/80 dark:border-[#123021]/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">21 CFR Part 11 Vault</div>
              <div className="text-[11px] text-slate-500 font-mono">Reconciliation OK</div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#0b2418] px-2 py-0.5 rounded font-mono">
              Audit Ready
            </span>
          </div>
        </div>
      </div>

      {/* Two Main Columns: Velocity Chart + Critical Stock (Left) / Alerts (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <InventoryVelocityChart />

          {/* Critical Stock Inventory */}
          <div className="bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-[#123021]/80 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#123021]">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Critical Stock Inventory
                </h2>
                <p className="text-[11px] text-slate-400">
                  Items requiring immediate replenishment dispatch
                </p>
              </div>
              <button
                onClick={() => setCurrentView("inventory")}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Catalog</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="seph-table">
                <thead>
                  <tr>
                    <th>Medication & SKU</th>
                    <th>Stock Level</th>
                    <th>Threshold</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {criticalItems.map((item) => (
                    <tr key={item.sku} className="group">
                      <td>
                        <button
                          onClick={() => navigateToDrugDetail(item.id)}
                          className="font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-700 text-left block"
                        >
                          {item.name}
                        </button>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[10px] text-slate-400">{item.sku}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#0b2418] text-slate-600 dark:text-slate-400">
                            {item.category}
                          </span>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="w-32 space-y-1">
                          <div className="flex items-center justify-between font-mono text-[11px] font-bold">
                            <span className={item.isVeryLow ? "text-rose-600" : "text-slate-900 dark:text-slate-100"}>
                              {item.current} {item.unit}
                            </span>
                            <span className="text-slate-400 text-[10px]">{item.percentage}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-[#0b2418] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                item.isVeryLow ? "bg-rose-500" : "bg-amber-500"
                              }`}
                              style={{ width: `${Math.min(item.percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-slate-500 font-mono">
                        {item.threshold} {item.unit}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => reorderDrug(item.id, 200)}
                          className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[11px] rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer"
                        >
                          Reorder
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-[#123021] flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-slate-400" />
              <span>Automated replenishment synced with McKesson EDI</span>
            </span>
            <span className="font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              PO #AUTO-9412
            </span>
          </div>
        </div>
        </div>

        {/* Recent Alerts Panel (Right 5 cols) */}
        <div className="lg:col-span-5 bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-[#123021]/80 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#123021]">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">Recent Alerts</h2>
                <p className="text-[11px] text-slate-400">Audit-logged clinical and environmental events</p>
              </div>
              <button
                onClick={() => setCurrentView("alerts")}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {/* Alert 1: Fridge B Temp */}
              <div className="p-3.5 bg-amber-50/80 dark:bg-amber-500/10 rounded-xl border border-amber-200/80 dark:border-amber-500/30 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center text-amber-700 dark:text-amber-300 shrink-0 mt-0.5">
                  <Thermometer className="w-4 h-4" />
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100">Fridge B Temp Variance</span>
                    <span className="text-[10px] text-slate-400 font-mono">10m ago</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mt-1 text-[11px] leading-relaxed">
                    Temperature recorded at 9°C. Target is 2-8°C. Immediate calibration check required.
                  </p>
                </div>
              </div>

              {/* Alert 2: Controlled Substance Log */}
              <div className="p-3.5 bg-slate-50/90 dark:bg-[#0b2418]/90 rounded-xl border border-slate-200/80 dark:border-[#123021]/80 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100">Controlled Substance Log</span>
                    <span className="text-[10px] text-slate-400 font-mono">45m ago</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mt-1 text-[11px] leading-relaxed">
                    Daily reconciliation pending for Schedule II vault. Authorized signature required.
                  </p>
                </div>
              </div>

              {/* Alert 3: Delivery Delayed */}
              <div className="p-3.5 bg-slate-50/90 dark:bg-[#0b2418]/90 rounded-xl border border-slate-200/80 dark:border-[#123021]/80 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Truck className="w-4 h-4" />
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100">Consolidated Delivery Update</span>
                    <span className="text-[10px] text-slate-400 font-mono">3h ago</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mt-1 text-[11px] leading-relaxed">
                    McKesson green-route shipment #88492 ETA updated to 14:30.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-[#123021] flex items-center justify-between text-[11px] text-slate-500">
            <span>21 CFR Part 11 Audit Trail Active</span>
            <button
              onClick={() => setCurrentView("alerts")}
              className="text-emerald-700 font-bold hover:underline cursor-pointer"
            >
              Acknowledge All →
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Floating Bar */}
      <div className="bg-white/80 dark:bg-[#03130c]/60 backdrop-blur-md text-slate-800 dark:text-white rounded-2xl p-4 shadow-xl border border-slate-200/80 dark:border-emerald-500/20 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <div>
            <div className="text-xs font-bold flex items-center gap-1.5">
              <span>Quick Clinical & Inventory Dispatch</span>
              <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-500/30">
                Hotkeys active
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Run pharmacokinetic safety checks and catalog additions with one click.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setCurrentView("interaction-checker")}
            className="px-3.5 py-2 rounded-xl bg-white/60 dark:bg-[#0b2418]/70 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-slate-700 dark:text-white text-xs font-semibold border border-slate-200 dark:border-emerald-500/15 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>Interaction Check</span>
          </button>

          <button
            onClick={() => setCurrentView("pharmacovigilance")}
            className="px-3.5 py-2 rounded-xl bg-white/60 dark:bg-[#0b2418]/70 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-slate-700 dark:text-white text-xs font-semibold border border-slate-200 dark:border-emerald-500/15 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>AI Pharmacovigilance</span>
          </button>

          <button
            onClick={() => setCurrentView("new-inventory")}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:from-emerald-700 active:to-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-900/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Record</span>
          </button>
        </div>
      </div>
    </div>
  );
};


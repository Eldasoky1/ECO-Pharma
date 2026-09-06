import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, animate } from "motion/react";
import {
  Leaf,
  ShieldCheck,
  Activity,
  Boxes,
  Radio,
  ArrowRight,
  ArrowUpRight,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Thermometer,
  Users,
  BellRing,
  RefreshCcw,
  ShoppingBag,
  ClipboardCheck,
  Moon,
  Sun,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { BrandLogo } from "../components/BrandLogo";
import { circularThemeToggle } from "../utils/themeTransition";
import { Beams } from "../components/Beams";
import { HeroDashboardMock } from "../components/HeroDashboardMock";

interface TeamCard {
  id: string;
  name: string;
  role: string;
  bio: string;
  initials: string;
  photoUrl?: string;
}

const TEAM: TeamCard[] = [
  {
    id: "t1",
    name: "Ahmed El-Dasouky",
    role: "ENG · Technical Governance & AI",
    bio: "Applied AI Engineer. Owns the FastAPI backend, Supabase/RLS schema, MCP server, CI/CD and the full React dashboard.",
    initials: "AD",
    photoUrl: "/team/Ahmed.jpeg",
  },
  {
    id: "t2",
    name: "Omar Hindawy",
    role: "ENG · Project Management & Python",
    bio: "Translates medical rules into Python, manages sprint handovers and compiles the core algorithms into shippable modules.",
    initials: "OH",
  },
  {
    id: "t3",
    name: "Eman Ayman",
    role: "DR · Biological QA",
    bio: "Drafts QC protocols and defines the purity-classification framework that every drug record and sensor reading is checked against.",
    initials: "EA",
    photoUrl: "/team/Eman.jpeg",
  },
  {
    id: "t4",
    name: "Fatma Mohamed",
    role: "DR · Clinical Pharmacy & Inventory",
    bio: "Builds the Egyptian OTC master list and defines inventory thresholds and reorder rules for every branch.",
    initials: "FM",
    photoUrl: "/team/fatma.jpeg",
  },
  {
    id: "t5",
    name: "Mohamed Ibrahim",
    role: "DR · Pharmacovigilance & AI",
    bio: "Designs the interaction-risk engine prompts, digitizes 42 products / 20 interaction pairs and generates graded risk inference.",
    initials: "MI",
    photoUrl: "/team/mohamed.jpeg",
  },
  {
    id: "t6",
    name: "Fagr Ahmed",
    role: "ENG · Mechatronics Simulation",
    bio: "Designs Wokwi circuits and Arduino decision logic that emit JSON telemetry for cold-chain and inventory sensing.",
    initials: "FA",
    photoUrl: "/team/fagr.jpeg",
  },
  {
    id: "t7",
    name: "Aya Abd-Elazim",
    role: "ENG · Frontend/Backend Services",
    bio: "Initializes repos, wires Python services into the API and ships the free-tier cloud stack the hub runs on.",
    initials: "AA",
    photoUrl: "/team/Aya.jpeg",
  },
  {
    id: "t8",
    name: "Zeina Wael",
    role: "ENG · Cybersecurity",
    bio: "Models the Packet Tracer topology and applies ACL/VLAN controls plus conceptual attacks to harden the virtual network.",
    initials: "ZW",
  },
];

const NAV_LINKS = [
  { label: "About", id: "about" },
  { label: "Platform", id: "platform" },
  { label: "Services", id: "services" },
  { label: "Team", id: "team" },
  { label: "Impact", id: "impact" },
];

const MARQUEE_ITEMS = [
  "Cold-Chain Intelligence",
  "AI Pharmacovigilance",
  "Zero-Waste Logistics",
  "Real-Time Telemetry",
  "Green Pharmacy Operations",
  "21 CFR Part 11 Compliant",
];

const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children,
  delay = 0,
  className,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

function CountUp({
  target,
  suffix = "",
  decimals = 0,
}: {
  target: number;
  suffix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    const controls = animate(0, target, {
      duration: 2,
      ease: "easeOut",
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = v.toFixed(decimals) + suffix;
      },
    });
    return () => controls.stop();
  }, [started, target, suffix, decimals]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setStarted(true)),
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return <span ref={ref}>0{suffix}</span>;
}

export const LandingView: React.FC = () => {
  const { navigateWithTransition, theme, toggleTheme, showToast } = useApp();
  const [loaderDone, setLoaderDone] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamCard | null>(null);
  const [reqForm, setReqForm] = useState({ name: "", email: "", org: "", message: "" });

  const heroRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const teamScrollRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef({ active: false, startX: 0, startLeft: 0, moved: false });
  const [teamIndex, setTeamIndex] = useState(0);
  const [teamProgress, setTeamProgress] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setLoaderDone(true), 1000);
    return () => clearTimeout(t);
  }, []);

  const goTo = (view: "signin" | "signup", e?: React.MouseEvent): void => {
    setExiting(true);
    navigateWithTransition(view, e ? { x: e.clientX, y: e.clientY } : undefined);
  };
  const scrollToId = (id: string) => {
    setNavOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleHeroMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = heroRef.current;
    if (!el || rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      el.style.setProperty("--my", `${e.clientY - rect.top}px`);
      rafRef.current = null;
    });
  };

  const handleTeamScroll = () => {
    const el = teamScrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setTeamProgress(max > 0 ? Math.min(1, el.scrollLeft / max) : 0);
    const card = el.querySelector<HTMLElement>("[data-team-card]");
    if (card) {
      const idx = Math.round(el.scrollLeft / (card.offsetWidth + 20));
      setTeamIndex(Math.min(TEAM.length - 1, Math.max(0, idx)));
    }
  };

  const teamGoto = (index: number) => {
    const el = teamScrollRef.current;
    const card = el?.querySelector<HTMLElement>("[data-team-card]");
    if (!el || !card) return;
    const clamped = Math.max(0, Math.min(TEAM.length - 1, index));
    el.scrollTo({ left: clamped * (card.offsetWidth + 20), behavior: "smooth" });
  };

  const scrollTeam = (dir: number) => teamGoto(teamIndex + dir);

  const onTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = teamScrollRef.current;
    if (!el) return;
    dragStateRef.current = { active: true, startX: e.clientX, startLeft: el.scrollLeft, moved: false };
  };

  const onTrackPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = teamScrollRef.current;
    const d = dragStateRef.current;
    if (!el || !d.active) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 6) d.moved = true;
    el.scrollLeft = d.startLeft - dx;
    handleTeamScroll();
  };

  const endTrackDrag = () => {
    const d = dragStateRef.current;
    if (!d.active) return;
    d.active = false;
    const el = teamScrollRef.current;
    if (d.moved && el) {
      const card = el.querySelector<HTMLElement>("[data-team-card]");
      if (card) {
        teamGoto(Math.round(el.scrollLeft / (card.offsetWidth + 20)));
      }
    }
  };

  const openTeamProfile = (member: TeamCard) => {
    if (dragStateRef.current.moved) {
      dragStateRef.current.moved = false;
      return;
    }
    setSelectedTeam(member);
  };

  const submitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setRequestOpen(false);
    setReqForm({ name: "", email: "", org: "", message: "" });
    showToast(
      "Demo request received.",
      "Our clinical team will reach out within one business day.",
      "success"
    );
  };

  const heroMask =
    "radial-gradient(200px circle at var(--mx,-999px) var(--my,-999px), black 0%, transparent 72%)";

  return (
    <motion.div
      initial={false}
      animate={exiting ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen text-slate-900 dark:text-white"
    >
      {/* Page loader */}
      <AnimatePresence>
        {!loaderDone && (
          <motion.div
            key="loader"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-[#02100b]"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="animate-pulse">
                <BrandLogo variant="full" size="lg" />
              </div>
              <div className="h-1 w-40 overflow-hidden rounded-full bg-slate-200/80 dark:bg-[#0b2418]">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 0.9, ease: "easeInOut" }}
                  className="h-full w-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {theme === "dark" && (
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <Beams
            beamWidth={3}
            beamHeight={30}
            beamNumber={33}
            lightColor="#05d993"
            speed={2.2}
            noiseIntensity={1.6}
            scale={0.22}
            rotation={34}
            beamColor="#000000"
            backgroundColor="#000000"
          />
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-40 border-b border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-[#02100b]/70 backdrop-blur-2xl dark:backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <button
            onClick={() => scrollToId("top")}
            className="flex items-center cursor-pointer hover:opacity-90 transition-opacity"
            title="Smart Eco-Pharma Hub"
          >
            <BrandLogo variant="horizontal" size="md" />
          </button>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <button
                key={l.id}
                onClick={() => scrollToId(l.id)}
                className="text-xs font-semibold uppercase tracking-wider text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 transition-colors cursor-pointer"
              >
                {l.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => circularThemeToggle(toggleTheme, e.clientX, e.clientY)}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white transition-colors cursor-pointer"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <button
              onClick={(e) => goTo("signin", e)}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-900/20 transition-colors cursor-pointer"
            >
              Sign In
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setNavOpen(true)}
              aria-label="Open menu"
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-[#0b2418] transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        id="top"
        ref={heroRef}
        onMouseMove={handleHeroMove}
        className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-28 pb-28 overflow-hidden"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-50"
          style={{
            background:
              "radial-gradient(420px circle at var(--mx,-999px) var(--my,-999px), rgba(16,185,129,0.16), transparent 65%)",
          }}
        />
        <Reveal className="relative z-10 flex flex-col items-center text-center max-w-5xl">
          <div className="relative mb-7 flex flex-col items-center justify-center">
            <span className="pointer-events-none absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/20 dark:bg-emerald-500/15 blur-3xl" />
            <BrandLogo
              variant="full"
              size="lg"
              theme={theme === "dark" ? "dark" : "light"}
            />
          </div>

          <span className="mb-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-300/60 dark:border-emerald-500/30 bg-emerald-50/80 dark:bg-emerald-500/10 text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            HIPAA &amp; 21 CFR Part 11 Compliant Infrastructure
          </span>

          <div className="relative select-none">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.06]">
              Pharmacy operations,
              <br />
              reimagined sustainably.
            </h1>
            <h1
              aria-hidden
              className="absolute inset-0 text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.06] pointer-events-none"
              style={{ WebkitMaskImage: heroMask, maskImage: heroMask }}
            >
              <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
                Pharmacy operations,
                <br />
                reimagined sustainably.
              </span>
            </h1>
          </div>

          <p className="mt-6 max-w-2xl text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Smart Eco-Pharma Hub unifies inventory intelligence, cold-chain telemetry, AI
            interaction checking and pharmacovigilance into a single green platform for modern
            pharmacy networks.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={(e) => goTo("signin", e)}
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-900/25 transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              Sign In to Portal
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setRequestOpen(true)}
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl border border-slate-300 dark:border-white/15 bg-white/60 dark:bg-white/5 backdrop-blur-lg text-sm font-bold text-slate-800 dark:text-slate-100 hover:border-emerald-500/60 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              Request a Demo
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-500" /> Live IoT Telemetry
            </span>
            <span className="inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" /> AI Clinical Guardrails
            </span>
            <span className="inline-flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-500" /> Zero-Waste Logistics
            </span>
          </div>
        </Reveal>

        <HeroDashboardMock />

        <motion.button
          onClick={() => scrollToId("about")}
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-8 z-10 p-2 text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer"
          aria-label="Scroll down"
        >
          <ChevronRight className="w-6 h-6 rotate-90" />
        </motion.button>
      </section>

      {/* Marquee band */}
      <div className="border-y border-slate-200 dark:border-white/10 bg-white/50 dark:bg-[#04170f]/80 py-4 overflow-hidden">
        <style>{`
          @keyframes seph-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
          .seph-marquee-track { animation: seph-marquee 30s linear infinite; }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
        <div className="seph-marquee-track flex w-max items-center whitespace-nowrap">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span
              key={i}
              className="mx-8 inline-flex items-center gap-8 text-xs font-bold uppercase tracking-[0.3em] text-emerald-700 dark:text-emerald-300/90"
            >
              {item}
              <Leaf className="w-3.5 h-3.5 text-emerald-500/70" />
            </span>
          ))}
        </div>
      </div>

      {/* About */}
      <section id="about" className="pb-24 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-start">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-4">
              About the platform
            </p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              One hub for every medicine, sensor and decision — engineered for a lighter
              footprint.
            </h2>
          </Reveal>
          <Reveal delay={0.12} className="space-y-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              From receiving dock to patient handoff, Smart Eco-Pharma Hub keeps every branch of
              your network in sync. Stock, expiry and cold-chain data flow through one operational
              picture, so teams act earlier and waste less.
            </p>
            <ul className="space-y-3">
              {[
                "Unified inventory across branches with predictive reordering",
                "124-sensor cold-chain network with instant critical alerts",
                "AI interaction engine embedded in everyday workflows",
                "Compliance-grade audit trail on every action",
              ].map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="mt-14 max-w-7xl mx-auto px-4 sm:px-6">
          <Reveal>
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-[#0a2016]/50 backdrop-blur-2xl dark:backdrop-blur-3xl px-7 py-6 sm:px-10">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Built to the standards that matter
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {[
                  "HIPAA Compliant",
                  "21 CFR Part 11",
                  "GMP Aligned",
                  "GDPR-Ready",
                  "ISO 27001",
                ].map((cert) => (
                  <span
                    key={cert}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-300/50 dark:border-emerald-500/25 bg-emerald-50/80 dark:bg-emerald-500/10 text-[11px] font-bold text-slate-700 dark:text-emerald-200"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Platform bento */}
      <section id="platform" className="pb-24 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Reveal className="mb-12 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-3">
              The Platform
            </p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Modules that carry the whole operation.
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
            {[
              {
                icon: Boxes,
                title: "Inventory Intelligence",
                copy: "Live stock levels, expiry forecasting and batch traceability across every branch.",
              },
              {
                icon: Thermometer,
                title: "Cold-Chain Telemetry",
                copy: "Temperature, humidity and battery health streamed from sensors in real time.",
              },
              {
                icon: Sparkles,
                title: "AI Interaction Engine",
                copy: "Clinical-grade interaction checks woven directly into dispensing workflows.",
              },
              {
                icon: ShieldCheck,
                title: "Pharmacovigilance Copilot",
                copy: "Structured adverse-event reporting with AI triage suggestions and audit logs.",
              },
            ].map((card, i) => (
              <Reveal key={card.title} delay={i * 0.08}>
                <div
                  onMouseMove={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    e.currentTarget.style.setProperty("--sx", `${e.clientX - r.left}px`);
                    e.currentTarget.style.setProperty("--sy", `${e.clientY - r.top}px`);
                  }}
                  className="group relative h-full rounded-3xl border border-slate-200/80 dark:border-emerald-500/15 bg-white/80 dark:bg-[#0a2016]/60 backdrop-blur-2xl dark:backdrop-blur-3xl p-7 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:border-emerald-500/50 hover:shadow-[0_24px_60px_-24px_rgba(16,185,129,0.45)] cursor-default"
                >
                  {/* Cursor spotlight */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background:
                        "radial-gradient(260px circle at var(--sx, 50%) var(--sy, 50%), rgba(16,185,129,0.14), transparent 70%)",
                    }}
                  />
                  {/* Top hairline */}
                  <div className="absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative flex items-start justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-900/25 ring-1 ring-white/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                      <card.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] font-black tracking-[0.3em] text-slate-300 dark:text-emerald-500/40 pt-1">
                      0{i + 1}
                    </span>
                  </div>

                  <h3 className="relative font-bold text-base mb-2">{card.title}</h3>
                  <p className="relative text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {card.copy}
                  </p>

                  <div className="relative mt-6 flex items-center justify-between">
                    <div className="h-1 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 opacity-50 group-hover:w-16 group-hover:opacity-100 transition-all duration-500" />
                    <ArrowUpRight className="w-4 h-4 text-emerald-500 opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500" />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="pb-24 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-3 gap-5">
          {[
            {
              icon: RefreshCcw,
              title: "Predictive Reordering",
              copy: "Demand signals turn into purchase orders before shelves run dry.",
            },
            {
              icon: ShoppingBag,
              title: "OTC Catalogue Management",
              copy: "Curated over-the-counter ranges with stock parity across locations.",
            },
            {
              icon: ClipboardCheck,
              title: "Compliance Audit Trail",
              copy: "Every alert acknowledgement and override logged to regulatory standard.",
            },
          ].map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08}>
              <div
                onMouseMove={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty("--sx", `${e.clientX - r.left}px`);
                  e.currentTarget.style.setProperty("--sy", `${e.clientY - r.top}px`);
                }}
                className="group relative h-full rounded-3xl border border-slate-200/80 dark:border-teal-500/15 bg-white/80 dark:bg-[#081c13]/70 backdrop-blur-2xl dark:backdrop-blur-3xl p-7 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:border-teal-500/50 hover:shadow-[0_24px_60px_-24px_rgba(20,184,166,0.45)]"
              >
                {/* Cursor spotlight */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background:
                      "radial-gradient(240px circle at var(--sx, 50%) var(--sy, 50%), rgba(20,184,166,0.13), transparent 70%)",
                  }}
                />
                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-teal-500/10 to-transparent rounded-bl-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative flex items-start justify-between mb-5">
                  <div className="w-11 h-11 rounded-2xl border border-teal-500/40 bg-teal-500/10 flex items-center justify-center group-hover:bg-teal-500 group-hover:border-teal-500 transition-colors duration-500">
                    <s.icon className="w-5 h-5 text-teal-600 dark:text-teal-300 group-hover:text-white transition-colors duration-500" />
                  </div>
                  <span className="text-[10px] font-black tracking-[0.3em] text-slate-300 dark:text-teal-500/40 pt-1">
                    S.0{i + 1}
                  </span>
                </div>
                <h3 className="relative font-bold mb-2">{s.title}</h3>
                <p className="relative text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {s.copy}
                </p>
                <div className="relative mt-6 h-px w-full bg-gradient-to-r from-teal-500/40 to-transparent scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-700" />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Impact */}
      <section id="impact" className="py-24 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Reveal>
            <div className="group relative rounded-[2rem] border border-slate-200/80 dark:border-white/10 bg-gradient-to-b from-white/70 to-white/40 dark:from-[#071a12]/70 dark:to-[#04130c]/40 backdrop-blur-2xl dark:backdrop-blur-3xl p-8 sm:p-12 shadow-xl shadow-emerald-950/5 overflow-hidden">
              <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />
              <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-400/10 blur-3xl rounded-full pointer-events-none" />
              <div className="absolute -bottom-28 -left-28 w-96 h-96 bg-teal-400/10 blur-3xl rounded-full pointer-events-none" />

              <div className="relative mb-10">
                <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  Impact by the numbers
                </p>
                <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight">
                  Measured results. Real savings.
                </h2>
                <p className="mt-2 max-w-md text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Every figure below streams live from the Smart Eco-Pharma Hub network — no estimates,
                  no averages.
                </p>
              </div>

              <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {[
                  { icon: Radio, target: 124, suffix: "+", label: "IoT Sensors Streaming" },
                  { icon: Thermometer, target: 99.98, suffix: "%", decimals: 2, label: "Cold-Chain Integrity" },
                  { icon: Leaf, target: 42, suffix: "%", label: "Waste Reduction" },
                  { icon: Boxes, target: 18, suffix: "k", label: "Medications Tracked" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
                    className="relative"
                  >
                    <div className="group/stat relative h-full rounded-2xl border border-slate-200/80 dark:border-emerald-500/15 bg-white/80 dark:bg-[#0a2016]/60 backdrop-blur-2xl dark:backdrop-blur-3xl p-5 shadow-sm hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-950/10 transition-all duration-300">
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-emerald-500/60 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300" />
                      <div className="flex items-center justify-between">
                        <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-900/25">
                          <stat.icon className="w-4 h-4 text-white" />
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          <span className="text-emerald-500 dark:text-emerald-400">●</span> Live
                        </span>
                      </div>
                      <div className="mt-4 text-3xl sm:text-4xl font-black tracking-tight">
                        <CountUp target={stat.target} suffix={stat.suffix} decimals={stat.decimals ?? 0} />
                      </div>
                      <div className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {stat.label}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <p className="relative mt-8 flex items-center justify-between flex-wrap gap-3 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Live figures streamed from the Smart Eco-Pharma Hub network.
                </span>
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600" />
                  </span>
                  Updating now
                </span>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="relative pb-24 scroll-mt-16 overflow-hidden">
        <div className="pointer-events-none absolute -top-24 right-[10%] h-80 w-80 rounded-full bg-emerald-400/10 dark:bg-emerald-500/5 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 left-[5%] h-72 w-72 rounded-full bg-teal-400/10 dark:bg-teal-500/5 blur-[110px]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(circle_at_1px_1px,rgba(16,185,129,0.18)_1px,transparent_0)] [background-size:28px_28px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <Reveal className="mb-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-3">
                <Users className="w-3.5 h-3.5" />
                The Team · 08 Specialists
              </p>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.08]">
                The minds behind
                <br />
                the <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 bg-clip-text text-transparent">mission</span>.
              </h2>
              <p className="mt-3 max-w-md text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Pharmacists, data scientists and sustainability leads shipping a greener, safer supply chain across
                every branch.
              </p>
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/25 bg-emerald-50 dark:bg-emerald-500/10 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="w-3 h-3" /> Clinical-first
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-500/25 bg-teal-50 dark:bg-teal-500/10 text-[10px] font-bold text-teal-700 dark:text-teal-300">
                  <Activity className="w-3 h-3" /> Network-wide
                </span>
              </div>
            </div>
            <div className="hidden sm:flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollTeam(-1)}
                  aria-label="Scroll team left"
                  className="group/btn p-3 rounded-2xl border border-slate-300 dark:border-white/15 text-slate-600 dark:text-slate-300 hover:border-emerald-500/60 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 group-hover/btn:-translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={() => scrollTeam(1)}
                  aria-label="Scroll team right"
                  className="group/btn p-3 rounded-2xl border border-slate-300 dark:border-white/15 text-slate-600 dark:text-slate-300 hover:border-emerald-500/60 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Drag to explore
              </span>
            </div>
          </Reveal>

          <div
            ref={teamScrollRef}
            onScroll={handleTeamScroll}
            onPointerDown={onTrackPointerDown}
            onPointerMove={onTrackPointerMove}
            onPointerUp={endTrackDrag}
            onPointerLeave={endTrackDrag}
            className="no-scrollbar flex gap-5 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 cursor-grab active:cursor-grabbing"
            style={{ touchAction: "pan-y" }}
          >
            {TEAM.map((member, i) => (
              <motion.button
                key={member.id}
                data-team-card
                onClick={() => openTeamProfile(member)}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
                className="group relative shrink-0 snap-start w-[360px] rounded-[2rem] p-px text-left cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 transition-all shadow-lg shadow-emerald-950/10 hover:shadow-[0_30px_80px_-18px_rgba(16,185,129,0.45)]"
                style={{
                  background:
                    theme === "dark"
                      ? "linear-gradient(150deg, rgba(16,185,129,0.65), rgba(255,255,255,0.07) 38%, rgba(16,185,129,0.22) 70%, rgba(45,212,191,0.55))"
                      : "linear-gradient(150deg, rgba(16,185,129,0.6), rgba(255,255,255,0.6) 38%, rgba(16,185,129,0.2) 70%, rgba(45,212,191,0.45))",
                }}
              >
                <span className="pointer-events-none absolute inset-px rounded-[calc(2rem-1px)] bg-white/95 dark:bg-[#081a12]/95 backdrop-blur-2xl dark:backdrop-blur-3xl transition-colors duration-500 group-hover:bg-white dark:group-hover:bg-[#0a2116]" />
                <span className="pointer-events-none absolute -top-14 -right-14 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="pointer-events-none absolute top-4 right-5 z-10 select-none font-mono text-base font-black tracking-tighter text-emerald-600/25 dark:text-emerald-300/30">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="relative z-10 flex flex-col">
                  {member.photoUrl ? (
                    <div className="relative overflow-hidden rounded-t-[30px]">
                      <img
                        src={member.photoUrl}
                        alt={member.name}
                        loading="lazy"
                        className="h-60 w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                      />
                      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-emerald-950/70 via-emerald-950/10 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
                      <span className="pointer-events-none absolute bottom-2.5 left-3.5 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white/95 backdrop-blur-lg">
                        {member.role}
                      </span>
                      <span className="pointer-events-none absolute bottom-2.5 right-3.5 inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-1 text-[10px] font-bold text-emerald-300 backdrop-blur-lg">
                        <Radio className="w-3 h-3" /> {member.id.toUpperCase()}
                      </span>
                    </div>
                  ) : (
                    <div className="relative h-60 overflow-hidden rounded-t-[30px]">
                      <span
                        className="seph-spin-slow absolute -inset-6 pointer-events-none"
                        style={{
                          background:
                            "conic-gradient(from 120deg, transparent, rgba(52,211,153,0.55), rgba(45,212,191,0.25) 55%, transparent 72%)",
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800" />
                      <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-teal-300/25 blur-3xl" />
                      <div className="relative flex h-full w-full flex-col items-center justify-center gap-1">
                        <span className="text-6xl font-black tracking-tight text-white drop-shadow-lg">
                          {member.initials}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-teal-100/80">
                          {member.role}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="p-6 pb-5">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_2px_rgba(16,185,129,0.5)]" />
                      <p className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                        {member.name}
                      </p>
                    </div>
                    <div className="mt-3 h-px bg-gradient-to-r from-emerald-500/60 via-emerald-500/15 to-transparent" />
                    <p className="mt-3 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                      {member.bio}
                    </p>
                  </div>
                </div>

                <div className="relative mx-5 mt-4 flex items-center justify-between border-t border-slate-100 dark:border-emerald-500/10 px-1 pt-3.5 pb-5 text-[11px]">
                  <span className="font-mono text-slate-400">ID {member.id.toUpperCase()}</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600/10 dark:bg-emerald-400/10 px-2.5 py-1 font-bold text-emerald-600 dark:text-emerald-300 opacity-90 group-hover:bg-emerald-600 group-hover:text-white dark:group-hover:bg-emerald-500 transition-all duration-300">
                    View profile <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-4">
            <span className="shrink-0 font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400">
              {String(teamIndex + 1).padStart(2, "0")} <span className="font-normal text-slate-400">/</span> {String(TEAM.length).padStart(2, "0")}
            </span>
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-200/80 dark:bg-emerald-500/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                animate={{ width: `${teamProgress * 100}%` }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-white/10 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2 space-y-4">
            <BrandLogo variant="full" size="md" />
            <p className="max-w-sm text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              The sustainable operations hub for modern pharmacy networks. Inventory, cold chain,
              AI safety and compliance — in one green platform.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-4">Platform</p>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
              {NAV_LINKS.map((l) => (
                <li key={l.id}>
                  <button onClick={() => scrollToId(l.id)} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-4">Access</p>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button onClick={(e) => goTo("signin", e)} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">
                  Sign In
                </button>
              </li>
              <li>
                <button onClick={(e) => goTo("signup", e)} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">
                  Create Account
                </button>
              </li>
              <li>
                <button onClick={() => setRequestOpen(true)} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">
                  Request a Demo
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 pt-6 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-500">
          <span>Smart Eco-Pharma Hub v0.1.0 © 2026</span>
          <span>HIPAA &amp; 21 CFR Part 11 Compliant</span>
        </div>
      </footer>

      {/* Nav menu overlay */}
      <AnimatePresence>
        {navOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[80] bg-white dark:bg-[#02100b] flex flex-col"
          >
            <div className="h-16 px-4 sm:px-6 flex items-center justify-between border-b border-slate-200 dark:border-white/10">
              <BrandLogo variant="horizontal" size="md" />
              <button
                onClick={() => setNavOpen(false)}
                aria-label="Close menu"
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-[#0b2418] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 flex flex-col items-start justify-center gap-2 px-8">
              {[{ label: "Home", id: "top" }, ...NAV_LINKS].map((l, i) => (
                <motion.button
                  key={l.id}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + i * 0.06 }}
                  onClick={() => scrollToId(l.id)}
                  className="text-4xl font-black tracking-tight text-slate-800 hover:text-emerald-600 dark:text-white dark:hover:text-emerald-400 py-2 transition-colors cursor-pointer"
                >
                  {l.label}
                </motion.button>
              ))}
              <motion.button
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.44 }}
                onClick={(e) => goTo("signin", e)}
                className="mt-6 flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-900/25 transition-colors cursor-pointer"
              >
                Sign In to Portal
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Team zoom modal */}
      <AnimatePresence>
        {selectedTeam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
            onClick={() => setSelectedTeam(null)}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-lg" />
            <motion.div
              initial={{ opacity: 0, scale: 0.82, y: 48, filter: "blur(12px)" }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.9, y: 24, filter: "blur(8px)" }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-3xl overflow-hidden border border-emerald-300/20 bg-[#052e22] shadow-2xl"
            >
              <div className="relative w-full overflow-hidden bg-gradient-to-br from-emerald-700 via-teal-800 to-emerald-950">
                <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,rgba(126,255,225,0.35)_1px,transparent_0)] [background-size:22px_22px]" />
                <span className="pointer-events-none absolute -top-6 -right-2 select-none text-[7rem] font-black leading-none tracking-tighter text-white/10">
                  {selectedTeam.id.replace("t", "").padStart(2, "0")}
                </span>
                {selectedTeam.photoUrl ? (
                  <img
                    src={selectedTeam.photoUrl}
                    alt={selectedTeam.name}
                    className="relative block w-full max-h-[62vh] object-contain"
                  />
                ) : (
                  <div className="relative flex aspect-[5/4] items-center justify-center">
                    <div
                      className="seph-spin-slow absolute h-40 w-40 rounded-full"
                      style={{
                        background:
                          "conic-gradient(from 120deg, transparent, rgba(52,211,153,0.55), rgba(45,212,191,0.2) 55%, transparent 68%)",
                      }}
                    />
                    <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-xl shadow-emerald-950/40 ring-4 ring-white/20">
                      <span className="text-5xl font-black tracking-tight text-white">
                        {selectedTeam.initials}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelectedTeam(null)}
                aria-label="Close profile"
                className="absolute top-3 right-3 p-2 rounded-full bg-black/40 text-white/80 hover:bg-black/60 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="p-6">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-400/15 border border-emerald-300/25 text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                  {selectedTeam.role}
                </span>
                <h3 className="mt-2.5 text-xl font-black text-white">{selectedTeam.name}</h3>
                <p className="mt-3 text-xs text-slate-300 leading-relaxed">{selectedTeam.bio}</p>
                <p className="mt-4 pt-3 border-t border-emerald-300/15 font-mono text-[10px] uppercase tracking-widest text-emerald-300/70">
                  ID {selectedTeam.id.toUpperCase()} · Smart Eco-Pharma Hub Network
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Request demo modal */}
      <AnimatePresence>
        {requestOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[95] flex items-center justify-center p-4"
            onClick={() => setRequestOpen(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-lg" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 32 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#04170f] p-8 shadow-2xl"
            >
              <button
                onClick={() => setRequestOpen(false)}
                aria-label="Close request form"
                className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#0b2418] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-xl font-black tracking-tight">Request a demo</h3>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                Tell us about your pharmacy network and we will tailor a walkthrough.
              </p>
              <form onSubmit={submitRequest} className="mt-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold mb-1.5">Full Name</label>
                  <input
                    required
                    value={reqForm.name}
                    onChange={(e) => setReqForm({ ...reqForm, name: e.target.value })}
                    placeholder="Jane Smith"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 outline-none focus:border-emerald-500 text-slate-900 dark:text-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1.5">Work Email</label>
                  <input
                    required
                    type="email"
                    value={reqForm.email}
                    onChange={(e) => setReqForm({ ...reqForm, email: e.target.value })}
                    placeholder="jane@pharmacy.org"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 outline-none focus:border-emerald-500 text-slate-900 dark:text-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1.5">Organization</label>
                  <input
                    required
                    value={reqForm.org}
                    onChange={(e) => setReqForm({ ...reqForm, org: e.target.value })}
                    placeholder="Community Pharmacy Network"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 outline-none focus:border-emerald-500 text-slate-900 dark:text-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1.5">Message</label>
                  <textarea
                    rows={3}
                    value={reqForm.message}
                    onChange={(e) => setReqForm({ ...reqForm, message: e.target.value })}
                    placeholder="What would you like to see?"
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 outline-none focus:border-emerald-500 text-slate-900 dark:text-white resize-none transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-900/20 transition-colors cursor-pointer"
                >
                  Send Request
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Critical alerts indicator */}
      <div className="pointer-events-none fixed bottom-4 right-4 z-30 hidden lg:block">
        <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-emerald-500/20 bg-white/70 dark:bg-[#04170f]/70 backdrop-blur-lg text-[11px] font-semibold text-slate-600 dark:text-slate-300 shadow-lg">
          <BellRing className="w-3.5 h-3.5 text-emerald-500" />
          Cold-chain network nominal
          <Activity className="w-3.5 h-3.5 text-emerald-500" />
        </div>
      </div>
    </motion.div>
  );
};

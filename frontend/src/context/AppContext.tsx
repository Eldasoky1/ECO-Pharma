import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import {
  ViewMode,
  DrugItem,
  DrugInteraction,
  PharmacovigilanceReport,
  SensorNode,
  SystemAlertItem,
  OTCItem,
  UserProfile,
} from "../types";
import {
  initialDrugs,
  initialInteractions,
  initialPharmacovigilanceReports,
  initialSensors,
  initialSystemAlerts,
  initialOTCCatalogue,
  initialUserProfile,
} from "../data/initialData";
import { signIn, signUp, signOut, getUser, api, ApiError } from "../api";

interface ToastAlert {
  id: string;
  title: string;
  description?: string;
  type: "critical" | "warning" | "info" | "success";
}

interface AppContextType {
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  selectedDrugId: string | null;
  setSelectedDrugId: (id: string | null) => void;
  editDrugId: string | null;
  setEditDrugId: (id: string | null) => void;
  drugs: DrugItem[];
  interactions: DrugInteraction[];
  reports: PharmacovigilanceReport[];
  sensors: SensorNode[];
  alerts: SystemAlertItem[];
  otcItems: OTCItem[];
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  toast: ToastAlert | null;
  setToast: (toast: ToastAlert | null) => void;
  showToast: (title: string, description?: string, type?: "critical" | "warning" | "info" | "success") => void;
  autoRefreshSensors: boolean;
  setAutoRefreshSensors: (val: boolean) => void;
  isPrescriptionModalOpen: boolean;
  setIsPrescriptionModalOpen: (open: boolean) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  isLoading: boolean;
  isOffline: boolean;
  portalActive: boolean;
  portalOrigin: { x: number; y: number };
  authSplash: boolean;
  navigateWithTransition: (view: ViewMode, origin?: { x: number; y: number }) => void;
  dismissAuthSplash: () => void;
  beginAuth: (
    email: string,
    password: string,
    opts?: { mode?: "signin" | "signup"; firstName?: string; lastName?: string; avatarUrl?: string }
  ) => Promise<void>;
  completeAuth: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  addDrug: (drug: Omit<DrugItem, "id" | "lastUpdated">) => void;
  updateDrug: (id: string, updates: Partial<DrugItem>) => void;
  deleteDrug: (id: string) => void;
  reorderDrug: (id: string, amount?: number) => void;
  acknowledgeAlert: (id: string, logActionText?: string) => void;
  dismissAlert: (id: string) => void;
  addPharmacovigilanceReport: (report: Omit<PharmacovigilanceReport, "id">) => void;
  addOTCItem: (item: Omit<OTCItem, "id">) => void;
  refreshSensorReadings: () => void;
  navigateToDrugDetail: (drugId: string) => void;
  navigateToEditDrug: (drugId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const PROFILE_KEY = "seph_profile";

function readStoredProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    return { ...initialUserProfile, ...parsed };
  } catch {
    return null;
  }
}

// Backend response shape helpers
interface BackendDrug {
  id: string; drug_name: string; brand_name?: string; drug_class?: string;
  regulatory_status?: string; dosage_forms?: string[]; active_ingredients?: string;
  route_of_administration?: string; record_version?: number;
  created_at?: string; updated_at?: string;
}
interface BackendInteraction {
  id?: string; drug_a_id?: string; drug_b_id?: string;
  risk_grade?: string; clinical_consequence?: string;
  management_recommendation?: string; severity?: string;
}
interface BackendIoTReading {
  id?: string; reading_id?: string; device_id?: string; storage_location_id?: string;
  timestamp_utc?: string; sensor_payload?: { temperature_celsius?: number; humidity_percent?: number };
  device_status?: { battery_level_percent?: number; signal_quality?: number };
}
interface BackendIoTAlert {
  id: string; reading_id?: string; alert_type?: string; storage_location_id?: string;
  acknowledged?: boolean; created_at?: string;
}

function mapDrug(d: BackendDrug): DrugItem {
  const stockUnit = d.regulatory_status === "otc" ? "units" : "tablets";
  return {
    id: d.id,
    genericName: d.drug_name,
    brandNames: d.brand_name ? [d.brand_name] : [],
    therapeuticClass: d.drug_class ?? "",
    category: "Other" as DrugItem["category"],
    dosageForms: d.dosage_forms ?? [],
    availableDosages: [],
    regulatoryStatus: (d.regulatory_status === "otc" ? "OTC" : d.regulatory_status === "controlled" ? "Controlled (C-IV)" : "Rx Only") as DrugItem["regulatoryStatus"],
    currentStock: 0,
    stockUnit,
    reorderThreshold: 0,
    optimalStock: 0,
    sku: "",
    ndc: "",
    primarySupplier: "",
    storageRequirement: d.route_of_administration === "refrigeration" ? "Cold Storage (2-8°C)" : "Ambient (15-25°C)",
    requiresRefrigeration: false,
    controlledSubstance: false,
    ecoDisposalRequired: true,
    lastUpdated: (d.updated_at ?? d.created_at ?? "").split("T")[0],
    activeIngredients: d.active_ingredients ? [{ name: d.active_ingredients, amount: "" }] : undefined,
  };
}

function mapInteraction(i: BackendInteraction): DrugInteraction {
  return {
    id: i.id ?? `ix-${Math.random().toString(36).slice(2, 9)}`,
    drugA: i.drug_a_id ?? "",
    drugB: i.drug_b_id ?? "",
    drugAId: i.drug_a_id,
    drugBId: i.drug_b_id,
    drugAClass: "",
    drugBClass: "",
    interactionType: i.risk_grade ?? "",
    riskGrade: (i.risk_grade as DrugInteraction["riskGrade"]) ?? "Grade C (Monitor)",
    riskLevel: (i.severity === "MAJOR" ? "Major" : i.severity === "MODERATE" ? "Moderate" : "Minor") as DrugInteraction["riskLevel"],
    evidenceStrength: "Strong",
    mechanism: i.clinical_consequence ?? "",
    clinicalSummary: i.clinical_consequence ?? "",
    recommendation: i.management_recommendation ?? "",
  };
}

function mapSensor(r: BackendIoTReading): SensorNode {
  return {
    id: r.device_id ?? r.reading_id ?? Math.random().toString(36).slice(2, 9),
    location: r.storage_location_id ?? "",
    zone: r.storage_location_id ?? "",
    tempC: r.sensor_payload?.temperature_celsius ?? null,
    humidityPct: r.sensor_payload?.humidity_percent ?? null,
    batteryPct: r.device_status?.battery_level_percent ?? null,
    signalStrength: r.device_status?.signal_quality ?? "Medium",
    status: "Stable",
    targetRange: { tempMin: 2, tempMax: 8, humidMin: 30, humidMax: 65 },
    lastReadingTime: r.timestamp_utc ? new Date(r.timestamp_utc).toLocaleTimeString() : "N/A",
    trend: "stable",
  };
}

function mapAlert(a: BackendIoTAlert): SystemAlertItem {
  const isTemp = a.alert_type?.includes("temperature");
  return {
    id: a.id,
    type: (isTemp ? "TEMPERATURE" : "CRITICAL") as SystemAlertItem["type"],
    title: a.alert_type ?? "System Alert",
    description: `Alert at ${a.storage_location_id ?? "unknown location"}`,
    timestamp: a.created_at ?? new Date().toISOString(),
    timeAgo: "Just now",
    severity: "critical",
    actionRequired: !a.acknowledged,
    acknowledged: a.acknowledged ?? false,
  };
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const hasSession = Boolean(getUser !== undefined && localStorage.getItem("seph_token"));
  const [currentView, setCurrentView] = useState<ViewMode>(hasSession ? "dashboard" : "landing");
  const [selectedDrugId, setSelectedDrugId] = useState<string | null>(null);
  const [editDrugId, setEditDrugId] = useState<string | null>(null);
  const [drugs, setDrugs] = useState<DrugItem[]>(initialDrugs);
  const [interactions, setInteractions] = useState<DrugInteraction[]>(initialInteractions);
  const [reports, setReports] = useState<PharmacovigilanceReport[]>(initialPharmacovigilanceReports);
  const [sensors, setSensors] = useState<SensorNode[]>(initialSensors);
  const [alerts, setAlerts] = useState<SystemAlertItem[]>(initialSystemAlerts);
  const [otcItems, setOtcItems] = useState<OTCItem[]>(initialOTCCatalogue);
  const [userProfile, setUserProfile] = useState<UserProfile>(() => readStoredProfile() ?? initialUserProfile);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(hasSession);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [portalActive, setPortalActive] = useState<boolean>(false);
  const [portalOrigin, setPortalOrigin] = useState<{ x: number; y: number }>({
    x: typeof window !== "undefined" ? window.innerWidth / 2 : 400,
    y: typeof window !== "undefined" ? window.innerHeight / 2 : 300,
  });
  const [authSplash, setAuthSplash] = useState<boolean>(false);
  const lastPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent): void => {
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  const [toast, setToast] = useState<ToastAlert | null>(null);
  const [autoRefreshSensors, setAutoRefreshSensors] = useState<boolean>(true);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      return localStorage.getItem("seph_theme") === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  });

  const tickCount = useRef(0);

  // Check session validity + fetch data on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Validate token
      const user = await getUser().catch(() => null);
      if (cancelled) return;
      if (!user) {
        setIsAuthenticated(false);
        setCurrentView("landing");
        setIsLoading(false);
        return;
      }
      setIsAuthenticated(true);
      setUserProfile(prev => ({
        ...prev,
        email: user.email,
        name: prev.name !== initialUserProfile.name ? prev.name : user.email.split("@")[0],
      }));

      // Fetch data from FastAPI /api/v1/* endpoints in parallel
      const fetchOpts = { headers: {} as Record<string, string> };
      const token = localStorage.getItem("seph_token");
      if (token) fetchOpts.headers.Authorization = `Bearer ${token}`;

      const [drugsRes, interactionsRes, readingsRes, alertsRes, otcRes] = await Promise.allSettled([
        api<{ drugs: BackendDrug[]; total: number }>("/api/v1/inventory/drugs?limit=200", fetchOpts),
        api<{ interactions: BackendInteraction[]; total: number }>("/api/v1/interactions?limit=200", fetchOpts),
        api<{ readings: BackendIoTReading[]; total: number }>("/api/v1/iot/readings?limit=200", fetchOpts),
        api<{ alerts: BackendIoTAlert[]; total: number }>("/api/v1/iot/alerts?limit=200", fetchOpts),
        api<{ inventory: OTCItem[]; total: number }>("/api/v1/inventory/otc?limit=200", fetchOpts),
      ]);

      if (cancelled) return;

      if (drugsRes.status === "fulfilled" && drugsRes.value.drugs?.length) {
        setDrugs(drugsRes.value.drugs.map(mapDrug));
        setIsOffline(false);
      } else {
        setIsOffline(true);
      }
      if (interactionsRes.status === "fulfilled" && interactionsRes.value.interactions?.length) {
        setInteractions(interactionsRes.value.interactions.map(mapInteraction));
      }
      if (readingsRes.status === "fulfilled" && readingsRes.value.readings?.length) {
        setSensors(readingsRes.value.readings.map(mapSensor));
      }
      if (alertsRes.status === "fulfilled" && alertsRes.value.alerts?.length) {
        setAlerts(alertsRes.value.alerts.map(mapAlert));
      }
      if (otcRes.status === "fulfilled" && otcRes.value.inventory?.length) {
        setOtcItems(otcRes.value.inventory as OTCItem[]);
      }
    })().finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getCurrentViewSafe = () => currentView;

  useEffect(() => {
    try { localStorage.setItem("seph_theme", theme); } catch { /* ignore */ }
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Persist profile (avatar is a small base64 data URL kept locally — NOT in Supabase metadata)
  useEffect(() => {
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(userProfile)); } catch { /* ignore */ }
  }, [userProfile]);

  const toggleTheme = () => { setTheme(prev => prev === "light" ? "dark" : "light"); };

  // Periodic sensor jitter simulation (visual only)
  useEffect(() => {
    if (!autoRefreshSensors || !isAuthenticated) return;
    const interval = setInterval(() => {
      tickCount.current += 1;
      setSensors((prev) =>
        prev.map((s) => {
          if (s.status === "Offline") return s;
          const jitter = (Math.random() - 0.5) * 0.2;
          return { ...s, tempC: s.tempC !== null ? +(s.tempC + jitter).toFixed(1) : null, lastReadingTime: "Just now" };
        })
      );
    }, 6000);
    return () => clearInterval(interval);
  }, [autoRefreshSensors, isAuthenticated]);

  const showToast = (title: string, description?: string, type: ToastAlert["type"] = "info") => {
    setToast({ id: "toast-" + Date.now(), title, description, type });
  };

  // ---------- NAVIGATION (simplified — clean crossfade, no iris) ----------
  const navigateWithTransition = (view: ViewMode, _origin?: { x: number; y: number }): void => {
    if (view === currentView) return;
    setPortalActive(true);
    window.setTimeout(() => {
      setCurrentView(view);
      window.setTimeout(() => setPortalActive(false), 60);
    }, 60);
  };

  // ---------- AUTH (Supabase) ----------
  const beginAuth = async (
    email: string,
    password: string,
    opts?: { mode?: "signin" | "signup"; firstName?: string; lastName?: string; avatarUrl?: string }
  ): Promise<void> => {
    const isSignup = opts?.mode === "signup";
    const result = isSignup
      ? await signUp(email, password, { firstName: opts?.firstName, lastName: opts?.lastName })
      : await signIn(email, password);
    setUserProfile(prev => ({
      ...prev,
      email: result.user.email,
      name: `${opts?.firstName ?? ""} ${opts?.lastName ?? ""}`.trim() || result.user.email.split("@")[0],
      avatarUrl: opts?.avatarUrl ?? prev.avatarUrl,
    }));
  };

  const completeAuth = (): void => {
    setIsAuthenticated(true);
    setCurrentView("dashboard");
    setAuthSplash(true);
  };

  const dismissAuthSplash = (): void => { setAuthSplash(false); };

  const login = async (email: string, password: string): Promise<void> => {
    await beginAuth(email, password, { mode: "signin" });
    completeAuth();
  };

  const register = async (firstName: string, lastName: string, email: string, password: string): Promise<void> => {
    await beginAuth(email, password, { mode: "signup", firstName, lastName });
    completeAuth();
  };

  const logout = (): void => {
    signOut().catch(() => {});
    setIsAuthenticated(false);
    setCurrentView("landing");
    setAuthSplash(false);
  };

  // ---------- DATA ACTIONS (optimistic + fire-and-forget API) ----------
  const addDrug = (newDrugData: Omit<DrugItem, "id" | "lastUpdated">) => {
    const newId = `drug-${Date.now()}`;
    const newDrug: DrugItem = { ...newDrugData, id: newId, lastUpdated: new Date().toISOString().split("T")[0] };
    setDrugs((prev) => [newDrug, ...prev]);
    if (!isOffline) api("/api/v1/inventory/otc", { method: "POST", body: JSON.stringify({ drug_id: newId, stock_quantity: newDrug.currentStock, stock_unit: "tablets", storage_location_identifier: "main-pharmacy" }) }).catch(() => {});
    showToast(`Added ${newDrug.genericName} to catalog.`, undefined, "success");
    setSelectedDrugId(newId);
    setCurrentView("inventory");
  };

  const updateDrug = (id: string, updates: Partial<DrugItem>) => {
    setDrugs((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates, lastUpdated: new Date().toISOString().split("T")[0] } : d)));
    showToast("Medication details updated.", undefined, "success");
  };

  const deleteDrug = (id: string) => {
    const target = drugs.find((d) => d.id === id);
    setDrugs((prev) => prev.filter((d) => d.id !== id));
    if (!isOffline) api(`/api/v1/inventory/drugs/${id}`, { method: "DELETE" }).catch(() => {});
    showToast(`Removed ${target?.genericName || "item"}.`, undefined, "warning");
    setCurrentView("inventory");
  };

  const reorderDrug = (id: string, amount: number = 250) => {
    setDrugs((prev) => prev.map((d) => (d.id === id ? { ...d, currentStock: d.currentStock + amount } : d)));
    setAlerts((prev) => prev.map((a) => (a.title.toLowerCase().includes(id) || a.type === "LOW STOCK" ? { ...a, acknowledged: true } : a)));
    showToast(`Reorder PO generated: +${amount} units.`, undefined, "success");
  };

  const acknowledgeAlert = (id: string, logActionText?: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true, actionRequired: false } : a)));
    showToast("Alert acknowledged.", logActionText, "info");
  };

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    showToast("Alert dismissed.", undefined, "info");
  };

  const addPharmacovigilanceReport = (reportData: Omit<PharmacovigilanceReport, "id">) => {
    const newReport: PharmacovigilanceReport = { ...reportData, id: `pv-${Date.now()}` };
    setReports((prev) => [newReport, ...prev]);
    showToast("Pharmacovigilance report saved.", undefined, "success");
  };

  const addOTCItem = (itemData: Omit<OTCItem, "id">) => {
    const newItem: OTCItem = { ...itemData, id: `otc-${Date.now()}` };
    setOtcItems((prev) => [newItem, ...prev]);
    if (!isOffline) api("/api/v1/inventory/otc", { method: "POST", body: JSON.stringify({ drug_id: newItem.id, stock_quantity: newItem.stockQty ?? 0, stock_unit: "units", storage_location_identifier: newItem.location ?? "pharmacy-main" }) }).catch(() => {});
    showToast(`Added ${itemData.itemName} to OTC inventory.`, undefined, "success");
  };

  const refreshSensorReadings = () => {
    setSensors((prev) =>
      prev.map((s) => {
        if (s.status === "Offline") return s;
        const jitter = (Math.random() - 0.5) * 0.4;
        return { ...s, tempC: s.tempC !== null ? +(s.tempC + jitter).toFixed(1) : null, lastReadingTime: "Just now" };
      })
    );
    showToast("All sensors polled.", "Telemetry refreshed.", "info");
  };

  const navigateToDrugDetail = (drugId: string) => { setSelectedDrugId(drugId); setCurrentView("drug-detail"); };
  const navigateToEditDrug = (drugId: string) => { setEditDrugId(drugId); setCurrentView("edit-inventory"); };

  return (
    <AppContext.Provider
      value={{
        currentView, setCurrentView,
        selectedDrugId, setSelectedDrugId,
        editDrugId, setEditDrugId,
        drugs, interactions, reports, sensors, alerts, otcItems,
        userProfile, setUserProfile,
        isAuthenticated, setIsAuthenticated,
        toast, setToast, showToast,
        autoRefreshSensors, setAutoRefreshSensors,
        isPrescriptionModalOpen, setIsPrescriptionModalOpen,
        theme, toggleTheme, isLoading, isOffline,
        portalActive, portalOrigin, authSplash,
        navigateWithTransition, dismissAuthSplash,
        beginAuth, completeAuth, login, register, logout,
        addDrug, updateDrug, deleteDrug, reorderDrug,
        acknowledgeAlert, dismissAlert,
        addPharmacovigilanceReport, addOTCItem,
        refreshSensorReadings, navigateToDrugDetail, navigateToEditDrug,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
};

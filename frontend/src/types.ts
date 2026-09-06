export type ViewMode =
  | "landing"
  | "dashboard"
  | "inventory"
  | "drug-detail"
  | "new-inventory"
  | "edit-inventory"
  | "interaction-kb"
  | "interaction-checker"
  | "pharmacovigilance"
  | "live-sensors"
  | "alerts"
  | "otc-inventory"
  | "settings"
  | "account-settings"
  | "signin"
  | "signup";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  photoUrl?: string;
}

export interface DrugItem {
  id: string;
  genericName: string;
  brandNames: string[];
  therapeuticClass: string;
  category: "Antibiotics" | "Statins" | "Analgesics" | "Antihypertensives" | "Antidiabetics" | "Cardiovascular" | "Other";
  dosageForms: string[];
  availableDosages: string[];
  regulatoryStatus: "Rx Only" | "OTC" | "Controlled (C-II)" | "Controlled (C-IV)";
  currentStock: number;
  stockUnit: string;
  reorderThreshold: number;
  optimalStock: number;
  sku: string;
  ndc: string;
  primarySupplier: string;
  storageRequirement: "Ambient (15-25°C)" | "Cold Storage (2-8°C)" | "Deep Freeze (-20°C)";
  requiresRefrigeration: boolean;
  controlledSubstance: boolean;
  ecoDisposalRequired: boolean;
  lastUpdated: string;
  description?: string;
  activeIngredients?: {
    name: string;
    amount: string;
    percentage?: number;
  }[];
  format?: string;
  colorShape?: string;
  imprintCode?: string;
  standardAdultDosage?: string;
  foodInteractions?: string;
  renalAdjustment?: string;
  batches?: InventoryBatch[];
  knownInteractions?: {
    drugName: string;
    severity: "MAJOR" | "MODERATE" | "MINOR";
    notes: string;
  }[];
}

export interface InventoryBatch {
  batchNo: string;
  location: string;
  quantity: number;
  expiryDate: string;
  status?: "Normal" | "Low" | "Critical";
}

export interface DrugInteraction {
  id: string;
  drugA: string;
  drugAClass: string;
  drugB: string;
  drugBClass: string;
  drugAId?: string;
  drugBId?: string;
  interactionType: string;
  riskGrade: "Grade X (Avoid)" | "Grade D (Modify)" | "Grade C (Monitor)" | "Grade A (No Action)";
  riskLevel: "Major" | "Moderate" | "Minor" | "Safe";
  evidenceStrength: "Strong" | "Moderate" | "Emerging";
  mechanism: string;
  clinicalSummary: string;
  recommendation: string;
  managementPlan?: string[];
}

export interface PharmacovigilanceReport {
  id: string;
  title: string;
  targetDrug: string;
  concomitantDrug: string;
  riskLevel: "High Risk" | "Moderate Risk" | "Low Risk";
  date: string;
  summary: string;
  tokensUsed: number;
  details?: {
    mechanism: string;
    recommendedAction: string;
    reportedCasesCount: number;
    organSystem: string;
  };
}

export interface SensorNode {
  id: string;
  location: string;
  zone: string;
  tempC: number | null;
  humidityPct: number | null;
  batteryPct: number | null;
  signalStrength: number | "High" | "Medium" | "Low" | "Offline";
  status: "Stable" | "High Temp" | "Low Temp" | "Low Batt" | "Offline";
  targetRange: string | { tempMin: number; tempMax: number; humidMin: number; humidMax: number };
  lastReadingTime: string;
  trend?: "up" | "down" | "stable";
}

export interface SystemAlertItem {
  id: string;
  type: "CRITICAL TEMPERATURE" | "CRITICAL" | "TEMPERATURE" | "LOW STOCK" | "VERIFICATION" | "SYSTEM UPDATE" | "DELIVERY DELAYED";
  title: string;
  description: string;
  location?: string;
  timestamp: string;
  timeAgo: string;
  severity: "critical" | "warning" | "info";
  actionRequired: boolean;
  acknowledged: boolean;
  actionButtonText?: string;
  secondaryActionText?: string;
  metadata?: Record<string, any>;
}

export interface OTCItem {
  id: string;
  itemName: string;
  subCategory: string;
  stockQty: number;
  stockStatus: "Good" | "Low" | "Reorder";
  location: string;
  expiryDate: string;
  supplier: string;
}

export interface UserProfile {
  name: string;
  title: string;
  branch: string;
  email: string;
  avatarUrl: string;
  licenseNumber: string;
  phone: string;
}

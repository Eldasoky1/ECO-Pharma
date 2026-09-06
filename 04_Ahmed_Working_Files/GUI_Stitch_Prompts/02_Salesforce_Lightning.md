# Stitch Prompt — Salesforce Lightning (Smart Eco-Pharma Hub)

You are a senior enterprise UI designer. Generate a **desktop dashboard** (~1280–1440 px) for **Smart Eco-Pharma Hub**, a pharmacy operations platform. Apply the **Salesforce Lightning Design System** (SLDS) visual language — record-centric, component-driven, with deliberate "kinetics" motion. Build all **14 screens** below with the shared app shell on every logged-in screen.

## App overview
Small Egyptian pharmacy managing an OTC drug catalogue and live inventory, IoT cold-chain sensors (temperature/humidity/weight) per shelf, and a GPT-4o AI drug-interaction safety engine. Backend: FastAPI + Supabase REST API with bearer JWT.

## Lightning visual language
- **Surfaces:** SLDS neutral canvas (#f3f2f2) with white record cards, subtle 1px borders, soft elevation via light shadows. Cards and record layouts (2-column key-value grids).
- **Color:** Primary brand teal/green (`#0B9D8A`) — used for buttons/links/active nav; a lighter green tint for icon containers. Keep SLDS semantic status palette: error (red #ea001e), warning (amber #ffb75d), success (green), info (blue #0176d3).
- **Typography:** Salesforce Sans. 12–14px body, bold record titles, uppercase section labels in `slds-text-title_caps` (11px, letter-spaced).
- **Grid/spacing:** SLDS 4px grid basis, 8/16px rhythm; dense 12-row-height table cells; 16px card padding.
- **Shape:** gentle radius 4px, rounded badges (full pill) for statuses.
- **Motion (kinetics):** quick, purposeful transitions — 150–300 ms ease-in-out on hovers, drawer/modal slides, button ripples, alert feed item entrance. Use motion to draw attention to new alerts and AI-analysis completion.
- **Components:** SLDS DataTable, Badge (status pills), Card, FormLayout + input/select, Button (brand/neutral/destructive), Modal, Toast (sticky notification), Spinner, Tabset, Search, Action menu (kebab), Split view for list/detail.

## Stitch design-system settings
- colorMode: LIGHT · colorVariant: TONAL_SPOT · customColor: `#0B9D8A` · headlineFont + bodyFont: INTER (Salesforce Sans closest available) · roundness: ROUND_FOUR.

## App shell (Screens 2–14)
Lightning **app launcher / left nav** with grouped sections (Overview: Dashboard; Catalogue & Inventory: Drug Catalogue, OTC Inventory; Safety: Interaction Checker, AI Analysis, Interaction KB; Monitoring: Live Sensors, Alerts; System: Reports, Settings). Top bar: page title, environment badge, live connection indicator, user avatar with dropdown. Dense, record-centric layout.

## Status badge colors (SLDS Badges)
- `reorder_status`: normal → success green, low → warning amber, critical → error red, on_order → info blue
- `risk_grade`: grade_1_minimal → success green, grade_2_moderate → info blue, grade_3_severe → warning amber, grade_4_contraindicated → error red
- `regulatory_status`: prescription_only → error red, otc → success green, controlled → warning amber
- `evidence_level`: established → success green, theoretical → warning amber, case_report → info blue
- `alert_type`: temperature_out_of_range → error red, humidity_out_of_range → warning amber, inventory_threshold_breached → orange

## The 14 screens

**1. Login** — Centered SLDS Card on a teal gradient. FormLayout: email + password (show/hide), brand Button "Sign in", error toast area, footer "v0.1.0".

**2. Dashboard** — 4 KPI Cards (Total Drugs, Total Stock Units, Low/Critical Stock, Active Alerts) with delta chips. Critical-stock DataTable (drug, location, stock vs threshold, reorder Badge). Recent-alerts feed (5–8 cards, type Badge, location, time, "View all") with entrance motion. Latest sensor snapshot per location (temp/humidity + OK/out-of-range). Quick actions: "New inventory record", "Run interaction check", "Analyze pair (AI)".

**3. Drug Catalogue** — Lightning Search. DataTable: Drug name, Brand, Class, Regulatory status Badge, Dosage forms (chips), Route, Updated. Pagination footer. Row click → Screen 4.

**4. Drug Detail** — Record header (name/brand/class/status Badge) + 2-column FormLayout read-only: active ingredients, route, dosage forms chips, record_version, timestamps. Card: linked OTC inventory mini-table (location, stock, reorder Badge, expiry). Card: related interactions with risk Badges. Buttons: "View AI reports", "Delete" (destructive with confirm Modal).

**5. OTC Inventory** — Tabset or filter pills (all/normal/low/critical/on_order) + location Select. DataTable: Drug, Stock qty/unit, Min threshold, Reorder qty, Location, Expiry, Supplier, Reorder Badge, Actions kebab (Edit, reorder-status menu). "+ New record" brand button.

**6. Inventory Record Edit** — SLDS FormLayout form, all fields pre-filled: stock qty/unit, min threshold, reorder qty, max capacity, location, temp/humidity envelopes, batch expiry date, supplier, restock date, reorder-status Select. Save → PUT. Inline 422 validation errors under fields.

**7. New Inventory Record** — Empty SLDS form with searchable drug picker (Search + list). Required: drug_id, stock_quantity, stock_unit, storage_location_identifier, reorder_status.

**8. Interaction Knowledge Base** — Filters: drug search + risk-grade pills. DataTable: Drug A, Drug B, Interaction type, Risk Badge, Evidence Badge, Consequence, Mechanism, Management. Row click → Modal detail.

**9. Interaction Checker** — Multi-select drug picker (min 2 / max 10 counter, selected as Badge list). Brand Button "Check interactions". Results DataTable sorted grade_4 → grade_1 (highest risk first): pairs with consequence + management. Empty state card. On MAJOR/contraindicated result, error Toast: "Escalate to pharmacist".

**10. AI Pharmacovigilance Analyzer** — Drug A picker, Drug B picker, clinical-context textarea. "Analyze" → Spinner with message "Analyzing… 2–5 s". Result card: risk-grade Badge, consequence, management, evidence Badge, model, tokens. Error toast for 404/422/500.

**11. PV Reports** — Drug Select. Report cards list: date, interacting drug, risk Badge, consequence, management, evidence, model, tokens.

**12. Live Sensors** — Filters: location Select, from-timestamp date input. DataTable: Time (UTC), Device, Location, Temperature °C, Humidity %, Battery %, Signal, Alert-flag Badges, Sequence. Auto-refresh toggle.

**13. Alerts** — Toast-like alert cards: type Badge, location, reading link, created time, "Acknowledge" button (local toggle) with slide-in motion. Header: active count.

**14. Settings** — Connection card calling `GET /health` (status/version/environment with green/red indicator), API base URL, account info (email/role), data summary counts.

## Shared components
Lightning app-shell nav + top bar · KPI card · sortable/paginated DataTable · Search + filter pills/Selects · status Badge · FormLayout with inline 422 validation · Modal · Spinner states · empty states · Toasts for `{error, detail}`.

Generate all 14 screens at desktop width with consistent Lightning enterprise styling and kinetics motion. Keep the exact 14-screen structure — do not add or remove screens.

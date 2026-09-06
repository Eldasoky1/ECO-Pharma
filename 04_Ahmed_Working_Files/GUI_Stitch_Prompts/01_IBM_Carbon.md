# Stitch Prompt — IBM Carbon (Smart Eco-Pharma Hub)

You are a senior enterprise UI designer. Generate a **desktop dashboard** (~1280–1440 px) for **Smart Eco-Pharma Hub**, a pharmacy operations platform. Apply the **IBM Carbon Design System** visual language throughout. Build all **14 screens** described below with the shared app shell on every logged-in screen.

## App overview
Small Egyptian pharmacy that manages an OTC drug catalogue and live inventory, monitors IoT cold-chain sensors (temperature/humidity/weight) per storage shelf, and runs a GPT-4o AI drug-interaction safety engine. Backend is FastAPI + Supabase; every screen talks to a REST API with a bearer JWT.

## Carbon visual language
- **Surfaces:** Carbon layered white/gray card system — page background `Gray 10` (#f4f4f4), cards `Gray 0` (#ffffff), elevated layers slightly darker. Do NOT rely on heavy shadows; express hierarchy with surface color and 1px `Gray 20` borders.
- **Color:** Carbon interactive teal/green primary for the pharmacy brand (`#0B9D8A` with dark-mode text #fff). Semantic status colors stay locked to enums (below). Use Carbon "support" tones: support-error, support-warning, support-success, support-info.
- **Typography:** IBM Plex Sans. Dense, data-first scale: table cells 14px, table headers 12px uppercase, page titles 28px semibold.
- **Grid/spacing:** strict 8px spacing grid; dense table rows (32px); consistent 16px card padding.
- **Shape:** Carbon is crisp with minimal radius — 0–2px corners (rectangular), sharp enterprise feel.
- **Components:** Carbon DataTable (sortable columns, pagination), Carbon Tag (status pills), Carbon NumberInput, Carbon TextInput with 422 validation messages, Carbon Select, Carbon Button (primary/secondary/danger), Carbon Loading spinner, Carbon Notification (toast), Carbon Modal, Carbon Tabs, Carbon Search, Carbon ProgressIndicator for the AI analysis.

## Stitch design-system settings
- colorMode: LIGHT · colorVariant: TONAL_SPOT · customColor: `#0B9D8A` · headlineFont + bodyFont: IBM_PLEX_SANS · roundness: ROUND_FOUR.

## App shell (Screens 2–14)
Left **Carbon navigation sidebar** (grouped, `navigation` list): Overview (Dashboard); Catalogue & Inventory (Drug Catalogue, OTC Inventory); Safety (Interaction Checker, AI Analysis, Interaction KB); Monitoring (Live Sensors, Alerts); System (Reports, Settings). Top bar: page title, environment badge, live connection dot (green = `/health` ok), user avatar. Compact, data-dense.

## Status badge colors (Carbon Tags)
- `reorder_status`: normal → green, low → amber, critical → red, on_order → blue
- `risk_grade`: grade_1_minimal → green, grade_2_moderate → blue, grade_3_severe → amber, grade_4_contraindicated → red
- `regulatory_status`: prescription_only → red, otc → green, controlled → amber
- `evidence_level`: established → green, theoretical → amber, case_report → blue
- `alert_type`: temperature_out_of_range → red, humidity_out_of_range → amber, inventory_threshold_breached → orange

## The 14 screens

**1. Login** — Centered card on a teal/green gradient (`#0B9D8A` → dark). Carbon TextInputs for email + password (show/hide), Carbon Button "Sign in", error text area, footer "v0.1.0".

**2. Dashboard** — 4 Carbon KPI cards (Total Drugs, Total Stock Units, Low/Critical Stock, Active Alerts) with trend numbers. Left: critical-stock Carbon DataTable (drug, location, stock vs threshold, reorder Tag). Middle: recent alerts feed (5–8, type Tag, location, time, "View all"). Right: latest sensor snapshot per location (temp/humidity with OK/out-of-range flags). Quick actions row of buttons ("New inventory record", "Run interaction check", "Analyze pair (AI)").

**3. Drug Catalogue** — Carbon Search input (searches drug_name + brand_name). Carbon DataTable: Drug name, Brand, Class, Regulatory status Tag, Dosage forms (chips), Route, Updated. Carbon Pagination (limit/offset). Row click → Screen 4.

**4. Drug Detail** — Header with name/brand/class/status Tag. Carbon structured grid (key-value rows): active ingredients, route, dosage forms chips, record_version, created/updated. Below: linked OTC inventory mini-table (location, stock, reorder Tag, expiry); related interactions list with risk Tags; buttons "View AI reports", "Delete (soft)" (danger).

**5. OTC Inventory** — Carbon Tabs or Tag filters: all/normal/low/critical/on_order + location Carbon Select. Carbon DataTable: Drug, Stock qty/unit, Min threshold, Reorder qty, Location, Expiry, Supplier, Reorder Tag, Actions (Edit, reorder-status dropdown). "+ New record" button.

**6. Inventory Record Edit** — Carbon form (all fields pre-filled): stock qty/unit (NumberInput/TextInput), min threshold, reorder qty, max capacity, location, temp/humidity envelopes, batch expiry date picker, supplier, restock date, reorder-status Carbon Select. Save → PUT. Show 422 validation messages inline.

**7. New Inventory Record** — Same Carbon form empty, with searchable drug picker (Carbon Search + select list). Required: drug_id, stock_quantity, stock_unit, storage_location_identifier, reorder_status.

**8. Interaction Knowledge Base** — Filters: drug search, risk-grade Tag pills. Carbon DataTable: Drug A, Drug B, Interaction type, Risk Tag, Evidence Tag, Clinical consequence, Mechanism, Management. Row click → Carbon Modal detail.

**9. Interaction Checker** — Left: multi-select drug picker with min-2/max-10 counter (Carbon Tag list). "Check interactions" Carbon Button. Results: Carbon DataTable sorted highest risk first (grade_4 → grade_1) showing consequence + management. Empty state: "No known interactions between the selected drugs." On any MAJOR/contraindicated result show a Carbon danger Notification "Escalate to pharmacist".

**10. AI Pharmacovigilance Analyzer** — Drug A picker, Drug B picker, optional "clinical context" textarea. "Analyze" button triggers Carbon Loading state with progress message "Analyzing… 2–5 s". Result: Carbon structured grid with risk-grade Tag, clinical consequence, management recommendation, evidence Tag, model version, tokens used. Error banner for 404/422/500.

**11. PV Reports** — Drug Carbon Select. List of report cards: date, interacting drug, risk Tag, consequence, management, evidence, model, tokens.

**12. Live Sensors** — Filters: storage location Select, from-timestamp DatePicker. Carbon DataTable: Time (UTC), Device, Location, Temperature °C, Humidity %, Battery %, Signal, Alert-flag Tags, Sequence. Optional auto-refresh toggle.

**13. Alerts** — Carbon notification-list style cards: alert-type Tag, location, reading link, created time, "Acknowledge" Carbon Button (local toggle). Header: active count.

**14. Settings** — Carbon connection card calling `GET /health` (status ok/error with green/red indicator, version, environment), API base URL, account info (email/role), data summary counts (drugs, inventory, interactions, readings).

## Shared components
Carbon app-shell sidebar + top bar · KPI stat card · sortable/paginated Carbon DataTable · Carbon Search + filter Tags/Selects · status Tag pill · labeled form with inline 422 validation · Carbon Modal · Carbon Loading states · empty states · error toasts for `{error, detail}`.

Generate all 14 screens at desktop width with consistent Carbon enterprise styling. Keep the exact 14-screen structure — do not add or remove screens.

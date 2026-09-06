# Stitch Prompt — Google Material 3 (Smart Eco-Pharma Hub)

You are a senior product UI designer. Generate a **desktop dashboard** (~1280–1440 px) for **Smart Eco-Pharma Hub**, a pharmacy operations platform. Apply **Google Material 3 (Material You)** — dynamic color, tonal surfaces, motion, elevation — with a **teal/green seed color** for the clinical pharmacy brand. Build all **14 screens** below with the shared app shell on every logged-in screen.

## App overview
Small Egyptian pharmacy managing an OTC drug catalogue and live inventory, IoT cold-chain sensors (temperature/humidity/weight) per shelf, and a GPT-4o AI drug-interaction safety engine. Backend: FastAPI + Supabase REST API with bearer JWT.

## Material 3 visual language
- **Color (dynamic):** Seed `#0B9D8A` (teal/green) drives tonal palettes: **primary** teal on tonal-primary-container surfaces, **secondary** muted teal-gray, **tertiary** soft blue for emphasis. **Neutral** (N10–N100) slate surfaces for cards/page. Status colors fixed (not tonal): error-container red, warning amber, success green, info blue.
- **Surfaces:** Material elevation levels 1–3 — light tonal surface with soft, layered shadows; cards `surface-container-lowest/low`, rounded **12px**; app shell uses `surface-container`.
- **Typography:** Roboto / Google Sans. Type scale: Display/Headline (page titles, 24–28px), Title, Body (14–16px), Label (12–14px, letter-spaced). 
- **Shape:** rounded corners (ROUND_TWELVE) on cards and dialogs; **full-pill** on buttons, chips, badges, inputs (Material 3 pill inputs).
- **Motion:** Material easing/springs — FAB appears, cards lift on hover, bottom-sheet/drawer slides, alert items animate in, loading uses Material CircularProgressIndicator with determinate state for the 2–5 s AI call.
- **Components:** Material NavigationRail or NavigationDrawer (sidebar), Card, DataTable, FilterChip / AssistChip, FAB (Extended FAB for "+ New record"), TextField (outlined, pill) with error text for 422, SegmentedButton for filters, Badge, Snackbar, Dialog, LinearProgressIndicator/CircularProgress, AppBar with search.

## Stitch design-system settings
- colorMode: LIGHT · colorVariant: TONAL_SPOT · customColor: `#0B9D8A` · headlineFont + bodyFont: INTER (Roboto/Google Sans closest available) · roundness: ROUND_TWELVE.

## App shell (Screens 2–14)
Material **NavigationDrawer** (or NavigationRail) with grouped menu items + section labels (Overview: Dashboard; Catalogue & Inventory: Drug Catalogue, OTC Inventory; Safety: Interaction Checker, AI Analysis, Interaction KB; Monitoring: Live Sensors, Alerts; System: Reports, Settings). Material AppBar (TopAppBar) with page title, environment badge, connection status dot, avatar menu. Tonal primary surfaces.

## Status badge colors (Material Badges)
- `reorder_status`: normal → green (primary), low → amber, critical → red (error), on_order → blue (tertiary)
- `risk_grade`: grade_1_minimal → green, grade_2_moderate → blue, grade_3_severe → amber, grade_4_contraindicated → red
- `regulatory_status`: prescription_only → red, otc → green, controlled → amber
- `evidence_level`: established → green, theoretical → amber, case_report → blue
- `alert_type`: temperature_out_of_range → red, humidity_out_of_range → amber, inventory_threshold_breached → orange

## The 14 screens

**1. Login** — Centered Material Card on a tonal teal background. Outlined pill TextFields: email + password (show/hide), filled Button "Sign in", error text, footer "v0.1.0".

**2. Dashboard** — 4 KPI Cards (Total Drugs, Total Stock Units, Low/Critical Stock, Active Alerts) on tonal surfaces with icon chips. Critical-stock DataTable (drug, location, stock vs threshold, reorder Badge). Recent-alerts card list (5–8, type Badge, location, time, "View all") with entrance motion. Latest sensor snapshot per location (temp/humidity + OK/out-of-range). Extended FAB row of quick actions: "New inventory record", "Run interaction check", "Analyze pair (AI)".

**3. Drug Catalogue** — AppBar search field. Material DataTable: Drug name, Brand, Class, Regulatory status Badge, Dosage form chips, Route, Updated. Pagination. Row click → Screen 4.

**4. Drug Detail** — Header with name/brand/class/status Badge. Card grid (2-col): active ingredients, route, dosage-form chips, record_version, timestamps. Card: linked OTC inventory mini-table (location, stock, reorder Badge, expiry). Card: related interactions with risk Badges. Buttons: "View AI reports", "Delete" (Dialog confirm).

**5. OTC Inventory** — SegmentedButton / FilterChips: all/normal/low/critical/on_order + location dropdown. Material DataTable: Drug, Stock qty/unit, Min threshold, Reorder qty, Location, Expiry, Supplier, Reorder Badge, Actions (Edit, reorder-status menu). Extended FAB "+ New record".

**6. Inventory Record Edit** — Outlined TextField form (pre-filled): stock qty/unit, min threshold, reorder qty, max capacity, location, temp/humidity envelopes, batch expiry (date picker), supplier, restock date, reorder-status dropdown. Filled "Save" Button → PUT. 422 errors as red supporting text under fields.

**7. New Inventory Record** — Same empty Material form with searchable drug picker (dialog with search). Required: drug_id, stock_quantity, stock_unit, storage_location_identifier, reorder_status.

**8. Interaction Knowledge Base** — Filters: search field + risk-grade FilterChips. Material DataTable: Drug A, Drug B, Interaction type, Risk Badge, Evidence Badge, Consequence, Mechanism, Management. Row click → Dialog.

**9. Interaction Checker** — Multi-select drug picker (min 2 / max 10 counter, selected as AssistChips). Filled "Check interactions" Button. Results DataTable sorted grade_4 → grade_1 with consequence + management. Empty state illustration. On MAJOR/contraindicated result, error Snackbar: "Escalate to pharmacist".

**10. AI Pharmacovigilance Analyzer** — Drug A picker, Drug B picker, clinical-context TextField (multiline). "Analyze" → CircularProgress with message "Analyzing… 2–5 s". Result Card: risk-grade Badge, consequence, management, evidence Badge, model, tokens. Error Snackbar for 404/422/500.

**11. PV Reports** — Drug dropdown. List of report Cards: date, interacting drug, risk Badge, consequence, management, evidence, model, tokens.

**12. Live Sensors** — Filters: location dropdown, from-timestamp picker. Material DataTable: Time (UTC), Device, Location, Temperature °C, Humidity %, Battery %, Signal, Alert-flag Badges, Sequence. Auto-refresh toggle (switch).

**13. Alerts** — List of Cards: alert-type Badge, location, reading link, created time, "Acknowledge" TextButton (local toggle) with animate-in. Header: active count.

**14. Settings** — Connection Card calling `GET /health` (status/version/environment, green/red indicator), API base URL, account info (email/role), data summary counts.

## Shared components
Material NavigationDrawer + TopAppBar shell · KPI Card · DataTable (sortable/paginated) · Search + FilterChips · status Badge · outlined form with inline 422 errors · Dialog · progress indicators · empty states · Snackbars for `{error, detail}`.

Generate all 14 screens at desktop width with consistent Material 3 tonal design and motion. Keep the exact 14-screen structure — do not add or remove screens.

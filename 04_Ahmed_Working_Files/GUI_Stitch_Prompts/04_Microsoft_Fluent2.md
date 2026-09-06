# Stitch Prompt — Microsoft Fluent 2 (Smart Eco-Pharma Hub)

You are a senior enterprise UI designer. Generate a **desktop dashboard** (~1280–1440 px) for **Smart Eco-Pharma Hub**, a pharmacy operations platform. Apply the **Microsoft Fluent 2 Design System** — neutral/shared/brand palettes, elevation with depth, focused motion, cross-platform consistency. Build all **14 screens** below with the shared app shell on every logged-in screen.

## App overview
Small Egyptian pharmacy managing an OTC drug catalogue and live inventory, IoT cold-chain sensors (temperature/humidity/weight) per shelf, and a GPT-4o AI drug-interaction safety engine. Backend: FastAPI + Supabase REST API with bearer JWT.

## Fluent 2 visual language
- **Palette model:** Fluent separates **neutral** (grays — chrome/surfaces), **shared** (semantic status: red/amber/blue/green), and **brand** (teal/green `#0B9D8A`) colors. Brand used for primary actions, active nav, focus rings; shared status colors stay semantically locked to enums and never used decoratively.
- **Surfaces:** light neutral canvas (#ffffff / #fafafa) with subtle borders; elevation via soft shadows and 1px strokes; cards with 8px radius, generous 20–24px padding.
- **Typography:** Segoe UI Variable. Body 14px, titles 20–28px semibold, table headers 12px uppercase; comfortable line height for clarity.
- **Shape:** Fluent rounded-rect 8px on cards/buttons/inputs; smaller 4px radius on dense table cells; status badges pill-shaped.
- **Motion:** focused on hierarchy and attention, not decoration — quick 150–200 ms fades/transforms on hovers and drawer/modal reveals; subtle emphasis on the AI-analysis loading and new-alert arrival.
- **Components:** NavigationView (left nav with section headers), DataGrid (sortable, paginated), Badge, Dropdown, TextField/NumberField, DatePicker, Button (accent/secondary/standard/destructive), ProgressRing/ProgressBar (indeterminate + determinate), MessageBar (success/warning/error/info), Dialog, Persona/avatar, MenuFlyout (kebab), SearchBox.

## Stitch design-system settings
- colorMode: LIGHT · colorVariant: TONAL_SPOT · customColor: `#0B9D8A` · headlineFont + bodyFont: INTER (Segoe UI closest available) · roundness: ROUND_EIGHT.

## App shell (Screens 2–14)
Fluent **NavigationView** sidebar, grouped (Overview: Dashboard; Catalogue & Inventory: Drug Catalogue, OTC Inventory; Safety: Interaction Checker, AI Analysis, Interaction KB; Monitoring: Live Sensors, Alerts; System: Reports, Settings). Top bar: page title, environment badge, connection status dot, avatar menu. Clean neutral chrome with accent-colored active item.

## Status badge colors (Fluent Badges)
- `reorder_status`: normal → green, low → amber, critical → red, on_order → blue
- `risk_grade`: grade_1_minimal → green, grade_2_moderate → blue, grade_3_severe → amber, grade_4_contraindicated → red
- `regulatory_status`: prescription_only → red, otc → green, controlled → amber
- `evidence_level`: established → green, theoretical → amber, case_report → blue
- `alert_type`: temperature_out_of_range → red, humidity_out_of_range → amber, inventory_threshold_breached → orange

## The 14 screens

**1. Login** — Centered card on a subtle teal-gradient. TextFields: email + password (show/hide), accent "Sign in" Button, error MessageBar, footer "v0.1.0".

**2. Dashboard** — 4 stat cards (Total Drugs, Total Stock Units, Low/Critical Stock, Active Alerts) with small trend text. Critical-stock DataGrid (drug, location, stock vs threshold, reorder Badge). Recent-alerts MessageBar-style feed (5–8, type Badge, location, time, "View all"). Latest sensor snapshot per location (temp/humidity + OK/out-of-range). Quick actions: "New inventory record", "Run interaction check", "Analyze pair (AI)".

**3. Drug Catalogue** — SearchBox. DataGrid: Drug name, Brand, Class, Regulatory status Badge, Dosage forms (chips), Route, Updated. Pagination. Row click → Screen 4.

**4. Drug Detail** — Header: name/brand/class/status Badge. 2-column property grid: active ingredients, route, dosage-form chips, record_version, timestamps. Card: linked OTC inventory mini-DataGrid (location, stock, reorder Badge, expiry). Card: related interactions with risk Badges. Buttons: "View AI reports", "Delete" (standard → destructive Dialog confirm).

**5. OTC Inventory** — Filter pills (all/normal/low/critical/on_order) + location Dropdown. DataGrid: Drug, Stock qty/unit, Min threshold, Reorder qty, Location, Expiry, Supplier, Reorder Badge, Actions MenuFlyout (Edit, reorder-status). "+ New record" accent button.

**6. Inventory Record Edit** — Fluent form (pre-filled): stock qty/unit, min threshold, reorder qty, max capacity, location, temp/humidity envelopes, batch expiry DatePicker, supplier, restock date, reorder-status Dropdown. "Save" accent button → PUT. 422 errors under fields in red supporting text.

**7. New Inventory Record** — Same empty Fluent form with searchable drug picker (SearchBox + list). Required: drug_id, stock_quantity, stock_unit, storage_location_identifier, reorder_status.

**8. Interaction Knowledge Base** — Filters: search + risk-grade pills. DataGrid: Drug A, Drug B, Interaction type, Risk Badge, Evidence Badge, Consequence, Mechanism, Management. Row click → Dialog detail.

**9. Interaction Checker** — Multi-select drug picker (min 2 / max 10 counter, selected as Badges). "Check interactions" accent button. Results DataGrid sorted grade_4 → grade_1 with consequence + management. Empty state. On MAJOR/contraindicated, error MessageBar: "Escalate to pharmacist".

**10. AI Pharmacovigilance Analyzer** — Drug A picker, Drug B picker, clinical-context multiline TextField. "Analyze" → ProgressRing + "Analyzing… 2–5 s". Result card: risk-grade Badge, consequence, management, evidence Badge, model, tokens. Error MessageBar for 404/422/500.

**11. PV Reports** — Drug Dropdown. List of report cards: date, interacting drug, risk Badge, consequence, management, evidence, model, tokens.

**12. Live Sensors** — Filters: location Dropdown, from-timestamp DatePicker. DataGrid: Time (UTC), Device, Location, Temperature °C, Humidity %, Battery %, Signal, Alert-flag Badges, Sequence. Auto-refresh toggle.

**13. Alerts** — MessageBar-like alert cards: type Badge, location, reading link, created time, "Acknowledge" button (local toggle) with subtle reveal motion. Header: active count.

**14. Settings** — Connection card calling `GET /health` (status/version/environment, green/red indicator), API base URL, account info (email/role), data summary counts.

## Shared components
Fluent NavigationView shell + top bar · stat card · sortable/paginated DataGrid · SearchBox + filter pills/Dropdowns · status Badge · form with inline 422 errors · Dialog · ProgressRing/Bar states · empty states · MessageBars for `{error, detail}`.

Generate all 14 screens at desktop width with consistent Fluent 2 neutral/brand styling and restrained motion. Keep the exact 14-screen structure — do not add or remove screens.

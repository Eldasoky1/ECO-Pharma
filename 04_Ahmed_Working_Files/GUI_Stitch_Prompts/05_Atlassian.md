# Stitch Prompt — Atlassian Design System (Smart Eco-Pharma Hub)

You are a senior product UI designer. Generate a **desktop dashboard** (~1280–1440 px) for **Smart Eco-Pharma Hub**, a pharmacy operations platform. Apply the **Atlassian Design System** — intuitive tokens, elevation via shadows + color, semi-transparent (alpha) foregrounds, clear documentation-grade patterns. Build all **14 screens** below with the shared app shell on every logged-in screen.

## App overview
Small Egyptian pharmacy managing an OTC drug catalogue and live inventory, IoT cold-chain sensors (temperature/humidity/weight) per shelf, and a GPT-4o AI drug-interaction safety engine. Backend: FastAPI + Supabase REST API with bearer JWT.

## Atlassian visual language
- **Color:** Brand primary **teal/green** (`#0B9D8A`) with the Atlassian approach: use **alpha/semi-transparent** foreground tints for subtle fills (e.g., selected rows, badge backgrounds) so colors hold up across different surfaces. Neutral grays for surfaces (`#F7F8F9` canvas, white cards). Shared status colors: green (success), red (danger), amber (warning), blue (information) — used consistently and sparingly.
- **Surfaces & elevation:** elevation defined with a small set of tokens — one token below default surface for "sunken" inputs; shadows for cards/modals, and in light mode depth is mostly shadow-driven. Keep surfaces readable, low-contrast borders (`#E1E4E8`).
- **Typography:** Atlassian Sans (Charlie). Body 14px, headings 20–28px, table headers 12px uppercase letter-spaced, code/mono for IDs.
- **Shape:** Atlassian rounded 4px on controls, 8px on cards/modals, pill-shaped lozenge badges.
- **Motion:** calm and functional — 150–250 ms transitions on hover, drawer/modal fade-and-slide, gentle entrance for alert items and the AI-result reveal.
- **Components:** Atlassian navigation (top nav + left sidebar or just a clean sidebar), Table (sortable, with status Lozenge), Lozenge (status pill), Form + TextField/Select/DatePicker, Button (primary/secondary/subtle/danger), Dialog (modal), Flag/Toast (notifications), Spinner/LoadingPlaceholder, EmptyState (blank state illustrations), TabPanel, dropdown menu.

## Stitch design-system settings
- colorMode: LIGHT · colorVariant: TONAL_SPOT · customColor: `#0B9D8A` · headlineFont + bodyFont: INTER (Atlassian Sans closest available) · roundness: ROUND_FOUR.

## App shell (Screens 2–14)
Atlassian **left sidebar nav** grouped by section (Overview: Dashboard; Catalogue & Inventory: Drug Catalogue, OTC Inventory; Safety: Interaction Checker, AI Analysis, Interaction KB; Monitoring: Live Sensors, Alerts; System: Reports, Settings). Top bar: page title, environment badge, connection status dot, avatar. Clean white chrome with teal accents.

## Status badge colors (Atlassian Lozenge)
- `reorder_status`: normal → green, low → amber (moved), critical → red (moved), on_order → blue (new)
- `risk_grade`: grade_1_minimal → green (success), grade_2_moderate → blue (information), grade_3_severe → amber (warning), grade_4_contraindicated → red (danger)
- `regulatory_status`: prescription_only → red, otc → green, controlled → amber
- `evidence_level`: established → green, theoretical → amber, case_report → blue
- `alert_type`: temperature_out_of_range → red, humidity_out_of_range → amber, inventory_threshold_breached → orange

## The 14 screens

**1. Login** — Centered card on a soft teal gradient. TextFields: email + password (show/hide), primary "Sign in" Button, error Flag, footer "v0.1.0".

**2. Dashboard** — 4 stat cards (Total Drugs, Total Stock Units, Low/Critical Stock, Active Alerts) with small captions. Critical-stock Table (drug, location, stock vs threshold, reorder Lozenge). Recent-alerts feed (5–8, type Lozenge, location, time, "View all"). Latest sensor snapshot per location (temp/humidity + OK/out-of-range). Quick actions: "New inventory record", "Run interaction check", "Analyze pair (AI)".

**3. Drug Catalogue** — Search field. Table: Drug name, Brand, Class, Regulatory status Lozenge, Dosage forms (chips), Route, Updated. Pagination. Row click → Screen 4.

**4. Drug Detail** — Header: name/brand/class/status Lozenge. 2-column property grid: active ingredients, route, dosage-form chips, record_version, timestamps. Card: linked OTC inventory mini-table (location, stock, reorder Lozenge, expiry). Card: related interactions with risk Lozenge. Buttons: "View AI reports", "Delete" (danger with Dialog confirm).

**5. OTC Inventory** — Filter pills (all/normal/low/critical/on_order) + location Select. Table: Drug, Stock qty/unit, Min threshold, Reorder qty, Location, Expiry, Supplier, Reorder Lozenge, Actions dropdown (Edit, reorder-status). "+ New record" primary button.

**6. Inventory Record Edit** — Atlassian form (pre-filled): stock qty/unit, min threshold, reorder qty, max capacity, location, temp/humidity envelopes, batch expiry DatePicker, supplier, restock date, reorder-status Select. "Save" primary Button → PUT. Inline 422 errors in red supporting text.

**7. New Inventory Record** — Same empty form with searchable drug picker (search + list). Required: drug_id, stock_quantity, stock_unit, storage_location_identifier, reorder_status.

**8. Interaction Knowledge Base** — Filters: search + risk-grade pills. Table: Drug A, Drug B, Interaction type, Risk Lozenge, Evidence Lozenge, Consequence, Mechanism, Management. Row click → Dialog.

**9. Interaction Checker** — Multi-select drug picker (min 2 / max 10 counter, selected as Lozenge list). Primary "Check interactions" button. Results Table sorted grade_4 → grade_1 with consequence + management. EmptyState. On MAJOR/contraindicated, danger Flag: "Escalate to pharmacist".

**10. AI Pharmacovigilance Analyzer** — Drug A picker, Drug B picker, clinical-context textarea. "Analyze" → Spinner + "Analyzing… 2–5 s". Result card: risk-grade Lozenge, consequence, management, evidence Lozenge, model, tokens. Error Flag for 404/422/500.

**11. PV Reports** — Drug Select. Report cards: date, interacting drug, risk Lozenge, consequence, management, evidence, model, tokens.

**12. Live Sensors** — Filters: location Select, from-timestamp picker. Table: Time (UTC), Device, Location, Temperature °C, Humidity %, Battery %, Signal, Alert-flag Lozenge, Sequence. Auto-refresh toggle.

**13. Alerts** — Flag-style alert cards: type Lozenge, location, reading link, created time, "Acknowledge" subtle button (local toggle). Header: active count.

**14. Settings** — Connection card calling `GET /health` (status/version/environment, green/red indicator), API base URL, account info (email/role), data summary counts.

## Shared components
Atlassian sidebar shell + top bar · stat card · sortable/paginated Table · search + filter pills/Selects · Lozenge status badge · form with inline 422 errors · Dialog · Spinner/LoadingPlaceholder states · EmptyState · Flags/Toasts for `{error, detail}`.

Generate all 14 screens at desktop width with consistent Atlassian styling and calm motion. Keep the exact 14-screen structure — do not add or remove screens.

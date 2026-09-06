# Smart Eco-Pharma Hub — GUI Design Brief (for Stitch)

> Use this document to generate a detailed Stitch prompt. It defines the app, the design language, and **14 screens** with their exact data sources (API endpoints + fields). The Stitch generation prompt should ask for a **DESKTOP dashboard** app, ~1280–1440 px wide.

---

## 1. Product Summary (paste into any prompt)

**Smart Eco-Pharma Hub** is a pharmacy operations dashboard for a small Egyptian pharmacy. Staff manage an OTC drug catalogue and live inventory (stock levels, thresholds, storage locations, expiry, suppliers), monitor IoT cold-chain sensors (temperature / humidity / weight alerts per storage shelf), and run AI-assisted drug-interaction safety checks (a GPT-4o pharmacovigilance engine). The backend is FastAPI + Supabase; every screen below talks to the REST API with a Supabase JWT (`Authorization: Bearer <token>`).

**Users / roles:** Pharmacy manager & inventory lead (inventory, reorder), pharmacist (interaction checks, alerts), QA/QC analyst (purity), pharmacovigilance officer (AI analyses), and the manager who oversees everything on the dashboard.

**Design language:** clean clinical-pharmacy aesthetic. Primary color **teal/green (#0B9D8A ~ #10B981)**, supporting **red #EF4444** (critical / MAJOR), **amber #F59E0B** (moderate), **blue #3B82F6** (info/minor), **slate/gray neutrals**. White cards, soft shadows, rounded corners, a persistent left sidebar navigation, top app bar with user + connection status. Font: Inter. Every status value must use a colored badge (see Enums in §3).

---

## 2. Navigation / App Shell (shared across all logged-in screens)

- **Left sidebar** (collapsible) with grouped nav:
  - **Overview:** Dashboard
  - **Catalogue & Inventory:** Drug Catalogue · OTC Inventory
  - **Safety:** Interaction Checker · AI Analysis · Interaction KB
  - **Monitoring:** Live Sensors · Alerts
  - **System:** Reports · Settings
- **Top bar:** page title, environment badge (`production`/`dev`), live connection indicator (green dot when `/health` returns `status: ok`), user avatar/initials.
- Badges: use pill-style colored badges for every enum value.

---

## 3. Enum Reference (badge colors)

| Enum | Values & colors |
|---|---|
| `regulatory_status` | `prescription_only` (red), `otc` (green), `controlled` (amber) |
| `reorder_status` | `normal` (green), `low` (amber), `critical` (red), `on_order` (blue) |
| `risk_grade` | `grade_1_minimal` (green), `grade_2_moderate` (blue), `grade_3_severe` (amber), `grade_4_contraindicated` (red) |
| `evidence_level` | `established` (green), `theoretical` (amber), `case_report` (blue) |
| `interaction_type` | free text (e.g. `pharmacokinetic`, `pharmacodynamic`) — neutral slate badge |
| `alert_type` | `temperature_out_of_range` (red), `humidity_out_of_range` (amber), `inventory_threshold_breached` (orange) |

---

## 4. The 14 Screens

### Screen 1 — Login (no sidebar)
- **Purpose:** Sign in with Supabase Auth (email + password) to obtain the JWT used on every API call.
- **Layout:** Centered card on a teal/gradient background, logo + product name "Smart Eco-Pharma Hub", email field, password field (with show/hide), "Sign in" button, error message area, subtle footer "v0.1.0".

### Screen 2 — Dashboard
- **Purpose:** At-a-glance operational overview.
- **Content:**
  - 4 KPI cards: **Total Drugs**, **Total Stock Units**, **Low/Critical Stock count**, **Active Alerts count**.
  - **Stock health panel:** mini list of the most critical inventory (drug name, location, stock vs threshold, reorder badge).
  - **Recent alerts feed:** latest 5–8 unacknowledged alerts (type badge, location, time) with "View all →".
  - **Latest sensor snapshot:** last reading per storage location (temp/humidity + OK/out-of-range flags).
  - **Quick actions:** "New inventory record", "Run interaction check", "Analyze pair (AI)".
- **Data sources:** `GET /api/v1/inventory/drugs` (count), `GET /api/v1/inventory/otc` (stock, filter reorder_status), `GET /api/v1/iot/alerts` (active alerts), `GET /api/v1/iot/readings` (latest per location).

### Screen 3 — Drug Catalogue
- **Purpose:** Searchable, paginated master drug list.
- **Content:** search input (searches `drug_name` + `brand_name`), results table: **Drug name · Brand · Class · Regulatory status badge · Dosage forms (chips) · Route · Updated**; pagination controls (limit/offset); row click → Screen 4.
- **Data source:** `GET /api/v1/inventory/drugs?search=&limit=&offset=` → `{drugs, total, limit, offset}`.

### Screen 4 — Drug Detail
- **Purpose:** Full record for one drug.
- **Content:** header with name/brand/class/status badge; metadata grid: active ingredients, route, dosage forms (chips), `record_version`, timestamps; **linked OTC inventory** mini-table (location, stock, reorder badge, expiry); related **interactions** list (risk badges); "View AI reports" button → Screen 11; "Delete (soft)" action.
- **Data sources:** `GET /api/v1/inventory/drugs/{drug_id}`, `GET /api/v1/inventory/otc?` (by location), `GET /api/v1/interactions?drug_id=`, `DELETE /api/v1/inventory/drugs/{drug_id}`.

### Screen 5 — OTC Inventory
- **Purpose:** Live stock list with filters.
- **Content:** filter pills for reorder status (`all | normal | low | critical | on_order`) + location filter; table: **Drug · Stock qty/unit · Min threshold · Reorder qty · Location · Expiry · Supplier · Reorder badge · Actions** (Edit → Screen 6, quick reorder-status dropdown → PATCH). "+ New record" button → Screen 7.
- **Data sources:** `GET /api/v1/inventory/otc?reorder_status=&storage_location_id=&limit=&offset=`, `PATCH /api/v1/inventory/otc/{id}/reorder-status`.

### Screen 6 — Inventory Record Detail / Edit
- **Purpose:** View and edit one inventory record.
- **Content:** form pre-filled with all fields (drug (read-only), stock qty/unit, min threshold, reorder qty, max capacity, location, temp/humidity envelopes, batch expiry, supplier, restock date, reorder status select). Save → `PUT /api/v1/inventory/otc/{inventory_id}` (partial update semantics).
- **Data source:** `GET /api/v1/inventory/otc/{inventory_id}`, `PUT /api/v1/inventory/otc/{inventory_id}`.

### Screen 7 — New Inventory Record
- **Purpose:** Create an inventory record for an existing drug.
- **Layout:** form with drug picker (searchable list from `GET /api/v1/inventory/drugs`), and the same fields as Screen 6. Required: `drug_id`, `stock_quantity`, `stock_unit`, `storage_location_identifier`, `reorder_status`. Submit → `POST /api/v1/inventory/otc` (201) then navigate to Screen 6.
- **Data source:** `POST /api/v1/inventory/otc`.

### Screen 8 — Interaction Knowledge Base
- **Purpose:** Browse curated drug-pair interactions.
- **Content:** filters (drug, risk grade); table: **Drug A · Drug B · Interaction type · Risk badge · Evidence badge · Clinical consequence · Mechanism · Management**. Row click → detail drawer.
- **Data sources:** `GET /api/v1/interactions?drug_id=&risk_grade=`, `GET /api/v1/interactions/{interaction_id}`.

### Screen 9 — Interaction Checker (dispensing safety)
- **Purpose:** Pick 2–10 drugs from a basket and see all known pair interactions, highest risk first.
- **Content:** drug multi-select (searchable picker, enforce min 2 / max 10 with counter); "Check interactions" button; **results table** with each found pair sorted by risk (grade_4 → grade_1) with consequence + management; empty state "No known interactions between the selected drugs". "Escalate to pharmacist" call-to-action on any MAJOR/contraindicated result.
- **Data source:** `POST /api/v1/interactions/check` body `{drug_ids: string[]}` → `{pairs, total_pairs_found}`.

### Screen 10 — AI Pharmacovigilance Analyzer
- **Purpose:** Run the GPT-4o risk engine on one drug pair.
- **Content:** Drug A picker, Drug B picker, optional "clinical context" textarea; **Analyze** button with an explicit loading state ("Analyzing… 2–5 s", spinner) because the endpoint is slow; result card: risk grade badge, clinical consequence, management recommendation, evidence badge, model version, tokens used; error state for 404/422/500.
- **Data source:** `POST /api/v1/pharmacovigilance/analyze` body `{drug_a_id, drug_b_id, clinical_context?}`.

### Screen 11 — PV Reports
- **Purpose:** History of AI-generated reports for one drug.
- **Content:** drug picker; list of report cards: date, interacting drug, risk badge, consequence, management, evidence, model, tokens.
- **Data source:** `GET /api/v1/pharmacovigilance/reports/{drug_id}`.

### Screen 12 — Live Sensors (IoT Readings)
- **Purpose:** Ingested sensor readings.
- **Content:** filters (storage location, from timestamp); table: **Time (UTC) · Device · Location · Temperature °C · Humidity % · Battery % · Signal · Alert flags (badges) · Sequence**. Optional live-refresh toggle.
- **Data source:** `GET /api/v1/iot/readings?storage_location_id=&from_timestamp=&limit=`.

### Screen 13 — Alerts
- **Purpose:** Unacknowledged cold-chain/inventory alerts.
- **Content:** alert cards/table: alert type badge, location, reading link, created time, **Acknowledge** button (local state toggle). Header shows active count.
- **Data source:** `GET /api/v1/iot/alerts` → `{alerts, total}` (unacknowledged, newest first).

### Screen 14 — Settings
- **Purpose:** Connection & environment status.
- **Content:** **Connection card** (calls `GET /health` → status/version/environment with green/red indicator), API base URL, account info (email/role from JWT), data summary counts (drugs, inventory, interactions, readings).
- **Data sources:** `GET /health`, summary from the list endpoints.

---

## 5. Shared Components (request these in Stitch)

- Sidebar + top bar app shell (Screens 2–14)
- KPI stat card
- Data table with pagination + sortable column headers
- Search input and filter pills / selects
- Enum status badge (colored pill)
- Detail form with labeled fields + validation error display (422 error format: `{loc, msg, type}`)
- Modal / drawer for quick actions
- Loading spinner states (esp. AI analysis 2–5 s)
- Empty states and error banners (`{error, detail}` from API)

---

## 6. API Quick Reference (used by the agent to size each screen)

| Endpoint | Screen(s) |
|---|---|
| `GET /health` | 14 |
| `GET /api/v1/inventory/drugs` · `GET /api/v1/inventory/drugs/{drug_id}` · `DELETE /api/v1/inventory/drugs/{drug_id}` | 2, 3, 4, 7, 14 |
| `GET /api/v1/inventory/otc` · `GET /api/v1/inventory/otc/{inventory_id}` · `POST /api/v1/inventory/otc` · `PUT /api/v1/inventory/otc/{inventory_id}` · `PATCH /api/v1/inventory/otc/{inventory_id}/reorder-status` | 2, 4, 5, 6, 7, 14 |
| `GET /api/v1/interactions` · `GET /api/v1/interactions/{interaction_id}` · `POST /api/v1/interactions/check` | 4, 8, 9 |
| `POST /api/v1/pharmacovigilance/analyze` · `GET /api/v1/pharmacovigilance/reports/{drug_id}` | 10, 11 |
| `GET /api/v1/iot/readings` · `GET /api/v1/iot/alerts` | 2, 12, 13, 14 |

**Auth:** all endpoints except `/health` need `Authorization: Bearer <Supabase JWT>`.
**Error format:** `{ "error": "<code>", "detail": "<message>" }` with codes `not_found` (404) / `validation_error` (422) / `internal_error` (500).

---

*Screens total: **14**. Device: desktop. Generated for Stitch from the real API contract at `docs/api_contract.md` (v1.0, July 2026).*

# Smart Eco-Pharma Hub

> An AI-powered, zero-budget pharmaceutical workflow platform that combines an **OTC inventory & drug-catalogue system**, **IoT cold-chain sensor monitoring**, and a **GPT-4o pharmacovigilance / drug-interaction risk engine** — built end-to-end by an 8-person university team across 5 phases.

**Version:** 0.1.0 · **Repository:** [`Eldasoky1/ECO-Pharma`](https://github.com/Eldasoky1/ECO-Pharma) (private) · **Author:** Ahmed El-Desouky, Technical Governance & AI Architecture Lead

---

## Table of Contents

1. [What Is This Project?](#1-what-is-this-project)
2. [The Problem](#2-the-problem)
3. [Project Objectives](#3-project-objectives)
4. [Who Is It For](#4-who-is-it-for)
5. [Core Features](#5-core-features)
6. [System Architecture](#6-system-architecture)
7. [Technology Stack](#7-technology-stack)
8. [Database Design — Supabase / PostgreSQL](#8-database-design--supabase--postgresql)
9. [Backend API — FastAPI](#9-backend-api--fastapi)
10. [IoT Sensor Module](#10-iot-sensor-module)
11. [Pharma Data Module](#11-pharma-data-module)
12. [AI Interaction-Risk Module](#12-ai-interaction-risk-module)
13. [MCP Server](#13-mcp-server)
14. [Security Review](#14-security-review)
15. [CI/CD & Deployment](#15-cicd--deployment)
16. [Repository Structure](#16-repository-structure)
17. [Getting Started](#17-getting-started)
18. [Testing](#18-testing)
19. [Project Phases & Current Status](#19-project-phases--current-status)
20. [Team & Responsibilities](#20-team--responsibilities)
21. [Known Gaps & Open Decisions](#21-known-gaps--open-decisions)
22. [Roadmap — Next Steps](#22-roadmap--next-steps)
23. [Documentation Index](#23-documentation-index)
24. [Frontend / GUI Design — Stitch Dashboard Brief](#24-frontend--gui-design--stitch-dashboard-brief)

---

## 1. What Is This Project?

**Smart Eco-Pharma Hub** is a simulated pharmaceutical operations platform that demonstrates how a small pharmacy can digitally manage the complete lifecycle of over-the-counter (OTC) medicines:

1. **Know your stock** — a master drug catalogue plus a live OTC inventory that tracks quantities, storage locations, expiry, suppliers, and reorder thresholds (database + REST API).
2. **Protect your products** — IoT sensor devices (simulated on Wokwi with real Arduino firmware) continuously monitor the temperature, humidity, and shelf-weight of every storage location and raise alerts the moment a pharmaceutical storage condition is violated.
3. **Check before you dispense** — a GPT-4o-powered drug-interaction reasoning engine evaluates combinations of medicines against the pharmacy's own clinical reference guide and returns a structured risk assessment (MAJOR / MODERATE / MINOR / NONE_KNOWN) that can escalate straight to a pharmacist.
4. **Expose it to AI agents** — an MCP (Model Context Protocol) server lets external AI assistants query inventory, interactions, and risk grades directly.

The project is a **8-week, zero-budget, simulation-based** academic deliverable (EJUST), run through **Linear** for project management, **GitHub** for version control, **Supabase** (PostgreSQL + PostgREST) for storage, **Render** (free tier) for hosting, and **OpenRouter** for GPT-4o access.

The backend is complete: **7 database tables, 16 JWT-protected API endpoints, a GPT-4o pharmacovigilance pipeline, a 4-tool MCP server, a CI/CD pipeline, a working Arduino/Wokwi IoT simulator, a Python pharma-data module, and a full security review.** What remains is *domain validation* — getting the clinical specialists (pharmacist, QC lead, pharmacovigilance officer) to confirm the medical assumptions baked into the schema — and final deployment.

---

## 2. The Problem

Small pharmacies face four recurring operational risks:

| Risk | Consequence | How this project addresses it |
|---|---|---|
| **Cold-chain failure** | Vaccines and temperature-sensitive medicines degrade silently when fridges/freezers drift out of the 2–8 °C range or humidity leaves 30–65% RH. | Always-on IoT sensors per storage location detect violations in real time and raise alerts (with an audible buzzer on the device). |
| **Stock-outs & overstocking** | Running out of essential OTC products loses revenue and patient trust; overstocking wastes capital and shelf space. | Per-drug minimum stock thresholds and reorder quantities, tracked against live quantities, with `normal / low / critical / on_order` status. |
| **Drug-drug interaction mistakes** | Dispensing two interacting medicines can harm patients; minor interactions are easy to miss under pressure. | A reasoning engine that checks every pair against a curated interaction reference guide and flags MAJOR interactions for pharmacist escalation. |
| **Fragmented data** | Catalog, inventory, QC, and clinical data live in separate spreadsheets with no shared identity. | One PostgreSQL schema with row-level security ties catalogue, inventory, purity, interactions, and sensor readings together. |

---

## 3. Project Objectives

1. **Design a validated database schema** for a pharmacy (7 tables, 6+ enums, row-level security) that domain specialists (QA, clinical pharmacy, pharmacovigilance) explicitly sign off on.
2. **Build an IoT cold-chain monitoring system** — Arduino firmware + Wokwi circuit simulation that emits schema-compliant JSON payloads with timestamps, device status, and pre-computed alert flags.
3. **Build a FastAPI backend** exposing 16 JWT-authenticated REST endpoints for catalogue, inventory, interactions, IoT ingestion, and pharmacovigilance.
4. **Integrate GPT-4o** via OpenRouter for AI drug-interaction analysis with a strict, structured output schema and a 25-case validation test set.
5. **Expose the system to AI agents** through a read-only MCP server (4 tools).
6. **Harden the system** with a documented cybersecurity audit, a ranked gap list, and fixes for the highest-severity issues.
7. **Ship it** with Docker + GitHub Actions CI + Render free-tier deployment and seed data.

---

## 4. Who Is It For

The platform serves the **internal pharmacy team** through a web dashboard (frontend built by Aya) and **AI agents** through MCP. Each specialist owns a slice of the data:

| Team Member | Role | Domain of the System |
|---|---|---|
| Ahmed El-Desouky | Technical Governance & AI Architecture Lead | Everything — schema, API, AI pipeline, MCP, CI/CD, deployment |
| Dr. Mohamed Ibrahim | Pharmacovigilance & Regulatory Lead | `drug_interactions`, risk grading, AI interaction engine |
| Eman Ayman | QA / Quality Control Lead | `purity_classification` (analytical test methods) |
| Fatma Mohamed | Clinical Pharmacy / Inventory Lead | `otc_inventory` (thresholds, storage zones, expiry) |
| Fagr Ahmed | IoT / Hardware Engineer | Arduino/Wokwi firmware + sensor payloads |
| Omar Hindawi | Backend Developer | Python models, services, interaction/pharma-data logic |
| Zeina Wael | Cybersecurity Auditor | Security audit, gap sign-off |
| Aya El-Hariry | Frontend Developer | Dashboard UI over the API contract |

---

## 5. Core Features

- **Drug catalogue** (`drug_master`) — generic/brand names, class, regulatory status (`prescription_only` / `otc` / `controlled`), dosage forms, active ingredients, route of administration, optimistic-locking `record_version`, soft deletes.
- **OTC inventory** (`otc_inventory`) — stock quantity/unit, min-stock threshold, reorder quantity, max capacity, unique storage-location identifiers, storage temperature/humidity envelopes, batch expiry, supplier, reorder status.
- **QC / purity tracking** (`purity_classification`) — purity grade/percent, analytical test method (7-value enum: `hplc`, `gc`, `uv_vis`, `ftir`, `titration`, `mass_spectrometry`, `other`), test status, analyst, protocol reference.
- **Drug-interaction knowledge base** (`drug_interactions`) — ordered pairs, interaction type, risk grade, clinical consequence, evidence level, mechanism, management recommendation, plus the richer AI taxonomy (`severity`, `source`, `confidence`).
- **IoT sensor ingestion** — `POST /api/v1/iot/readings` with deduplication by `reading_id`, unknown-location alerting, and automatic reorder-status updates.
- **AI interaction analysis** — `POST /api/v1/pharmacovigilance/analyze` runs GPT-4o with a strict JSON schema and persists the assessment.
- **Agent tooling** — 4 read-only MCP tools for AI assistants.
- **Security** — JWT auth on every endpoint, row-level security in the DB, documented gap list, non-root Docker user.

---

## 6. System Architecture

```
                        ┌──────────────────────────────────────────────────────────┐
                        │                      FRONTEND (Aya)                       │
                        │               Supabase Auth (JWT) + Dashboard UI          │
                        └───────────────────────────────┬──────────────────────────┘
                                                        │  Bearer <JWT>
                                                        ▼
   ┌──────────────┐   JSON over Serial   ┌──────────────────────────────┐
   │  IoT DEVICE  │─────────────────────▶│      FASTAPI BACKEND          │
   │ (Arduino Uno)│  (Wokwi simulator /  │   main.py  · 16 endpoints     │
   │  DHT22       │   real hardware)     │   routers/ services/          │
   │  DS1307 RTC  │                      │   models/ repositories/       │
   │  HX711 load  │                      └──────┬──────────┬─────────────┘
   │  cell, buzzer│                             │          │
   └──────────────┘                       OpenRouter│    │ Supabase clients
                                             (GPT-4o)│    │ (anon + service-role)
                                                      ▼    ▼
                                   ┌───────────┐  ┌───────────────────────────┐
                                   │ OpenRouter│  │        SUPABASE            │
                                   │ GPT-4o    │  │ PostgreSQL 15 + PostgREST  │
                                   │ API       │  │ 7 tables · 6+ enums · RLS  │
                                   └───────────┘  │ row-level security         │
                                                  └───────────────────────────┘
                                   ┌───────────────────────────┐
                                   │   MCP SERVER (stdio)       │
                                   │ lookup_drug_inventory      │
                                   │ check_drug_interactions    │
                                   │ get_risk_grade             │
                                   │ get_iot_sensor_status      │
                                   └───────────────────────────┘
                                              ▲
                                              │ stdio
                                     AI agents (e.g. Claude Desktop)
```

### Data flow — main paths

1. **Team member → dashboard:** user logs in via Supabase Auth (frontend), the frontend calls `/api/v1/*` with a Supabase JWT, FastAPI validates it (`get_current_user`) and queries Supabase through RLS-aware clients.
2. **IoT device → alerts:** the Arduino/Wokwi device POSTs a JSON reading → FastAPI dedupes by `reading_id`, validates `storage_location_id` against `otc_inventory`, computes threshold alerts, writes to `iot_readings` / `iot_alerts`, and flips `reorder_status` when `inventory_threshold_breached`.
3. **AI agent → MCP:** an agent calls an MCP tool over stdio; the server queries Supabase (anon key) and returns `TextContent` JSON.
4. **AI pharmacovigilance → DB:** `pv_service` sends drug facts + optional clinical context to OpenRouter/GPT-4o, parses the structured response, and persists it to `drug_interactions`.

---

## 7. Technology Stack

| Layer | Technology | Notes |
|---|---|---|
| Language | Python 3.11 | Docker base image `python:3.11-slim` |
| API framework | FastAPI + Uvicorn | Async, Pydantic v2 validation |
| Database | Supabase (PostgreSQL 15 + PostgREST) | Free tier, RLS enforced at DB level |
| ORM / client | `supabase` Python client | Two clients: `anon_client` (RLS-aware) + `service_client` (service-role) |
| Auth | Supabase Auth JWT + PyJWT | HS256 decoding in `auth.py` |
| AI/LLM | GPT-4o via OpenRouter | `openai` SDK, `OPENROUTER_BASE_URL` |
| AI contract | MCP (`modelcontextprotocol`) | 4 read-only stdio tools |
| IoT | Arduino Uno + Wokwi | DHT22, DS1307 RTC, HX711 load cell, buzzer; ArduinoJson |
| CI/CD | GitHub Actions | ruff → mypy → pytest → docker build (on `main`) |
| Deploy | Render (free tier, Docker) | `render.yaml`, health check `/health` |
| Config | pydantic-settings + `.env` | 9 environment variables |

---

## 8. Database Design — Supabase / PostgreSQL

### 8.1 Tables (7)

| Table | Purpose | Domain Owner |
|---|---|---|
| `team_members` | Every person with system access; role, name, email | Architecture |
| `drug_master` | Master drug reference ("drug dictionary"); soft-deletable | Architecture |
| `purity_classification` | QA purity analyses per drug (test method, grade, status) | Eman Ayman |
| `otc_inventory` | Live stock, storage conditions, thresholds, reorder status | Fatma Mohamed |
| `drug_interactions` | Drug-pair interaction knowledge base + AI assessments | Dr. Mohamed Ibrahim |
| `iot_readings` | Raw sensor readings (payload + parsed env values) | IoT / Fajr |
| `iot_alerts` | Threshold violations raised from readings | IoT / Backend |

### 8.2 Enums

**`migration.sql`** (6):
- `team_role` — `architecture_lead, project_manager, qa_specialist, clinical_pharmacy, pharmacovigilance, frontend_engineer`
- `regulatory_status` — `prescription_only, otc, controlled`
- `qc_test_status` — `pass, fail, pending`
- `reorder_status_type` — `normal, low, critical, on_order`
- `risk_grade_type` — `grade_1_minimal, grade_2_moderate, grade_3_severe, grade_4_contraindicated` (⚠ placeholders — awaiting Dr. Mohamed's validation)
- `evidence_level_type` — `established, theoretical, case_report`

**`migration_002_eman_validation.sql`** (Eman):
- `test_method_type` — `hplc, gc, uv_vis, ftir, titration, mass_spectrometry, other` (+ `test_method_other_description` escape hatch)

**`migration_003_interaction_risk.sql`** (AI package adoption):
- `interaction_severity_type` — `MAJOR, MODERATE, MINOR, NONE_KNOWN`
- `interaction_source_type` — `verified_reference, inferred_pharmacology`
- `interaction_confidence_type` — `high, medium, low`

The AI taxonomy is stored in **new columns** (`severity`, `source`, `confidence`) added to `drug_interactions` so the richer LLM output is never lossy-mapped onto the legacy `risk_grade`/`evidence_level`.

### 8.3 Row-Level Security (RLS)

Every table has RLS enabled with role-based policies: `deny_anon`, `architecture_lead_full_access`, `team_member_read_all`, and per-domain write policies (`qa_specialist_writes_purity`, `clinical_pharmacy_writes_inventory`, `pharmacovigilance_writes_interactions`). IoT tables add read-for-authenticated and service-insert policies. A known RLS recursion bug in `team_members` was fixed in `fix_rls.sql`.

### 8.4 Migrations

| File | Contents | Status |
|---|---|---|
| `migration.sql` | 5 core tables, 6 enums, `updated_at` triggers, ~26 RLS policies | Written; live status to be confirmed |
| `iot_migration.sql` | `iot_readings` + `iot_alerts`, 6 policies | Written; `reading_id` updated to `TEXT` per proposal P1 |
| `migration_002_eman_validation.sql` | Eman's `test_method_type` enum override | Written — apply via Supabase SQL Editor |
| `migration_003_interaction_risk.sql` | AI severity/source/confidence columns | Written (merged via PR) |

---

## 9. Backend API — FastAPI

- **Base URL:** `https://smart-eco-pharma.onrender.com` (production) / `http://localhost:8000` (dev)
- **Auth:** `Authorization: Bearer <Supabase JWT>` on all endpoints except `/health` and `/docs`.
- **Error format:** `{ "error": "<code>", "detail": "<message>" }` with codes `not_found` (404), `validation_error` (422), `internal_error` (500).

### Endpoint map (16)

| # | Method & Path | Purpose |
|---|---|---|
| 1 | `GET /health` | Health check (no auth) |
| 2 | `GET /api/v1/inventory/drugs` | Paginated + searchable drug catalogue |
| 3 | `GET /api/v1/inventory/drugs/{drug_id}` | Single drug |
| 4 | `DELETE /api/v1/inventory/drugs/{drug_id}` | Soft-delete drug |
| 5 | `GET /api/v1/inventory/otc` | Paginated OTC inventory (filter by reorder status / location) |
| 6 | `GET /api/v1/inventory/otc/{inventory_id}` | Single inventory record |
| 7 | `POST /api/v1/inventory/otc` | Create inventory record |
| 8 | `PUT /api/v1/inventory/otc/{inventory_id}` | Update inventory (partial) |
| 9 | `PATCH /api/v1/inventory/otc/{inventory_id}/reorder-status` | Quick reorder-status change |
| 10 | `GET /api/v1/interactions` | Paginated interaction list (filter by drug / risk grade) |
| 11 | `GET /api/v1/interactions/{interaction_id}` | Single interaction |
| 12 | `POST /api/v1/interactions/check` | Batch check 2–10 drugs → all pairs, highest risk first |
| 13 | `POST /api/v1/iot/readings` | Ingest sensor reading (dedupe by `reading_id`) |
| 14 | `GET /api/v1/iot/readings` | Readings (filter by location / from-timestamp) |
| 15 | `GET /api/v1/iot/alerts` | Unacknowledged alerts, newest first |
| 16 | `POST /api/v1/pharmacovigilance/analyze` | GPT-4o interaction analysis (2–5 s latency) |
| 17 | `GET /api/v1/pharmacovigilance/reports/{drug_id}` | AI-generated reports for a drug |

*(17 routes total counting `/health`; the four routers register 16 JWT-protected endpoints.)*

### Service layer (`smart_eco_pharma/services/`)

- `inventory_service.py` — catalogue + OTC inventory business logic.
- `interaction_service.py` — pair queries, basket checks.
- `iot_service.py` — ingestion, dedup, unknown-location alerts, reorder-status updates.
- `pv_service.py` — GPT-4o pipeline via OpenRouter (prompt build → call → parse → persist).

---

## 10. IoT Sensor Module

### 10.1 Firmware (`iot/firmware/sketch.ino`, by Fagr)

- **Hardware:** Arduino Uno + DHT22 (temp/humidity) + DS1307 RTC (UTC timestamps) + HX711 load cell (shelf weight) + buzzer (alert annunciator).
- **Behavior:** reads sensors, computes alert flags **on-device** (`temp < 2.0 || temp > 8.0`; `humidity < 30 || humidity > 65`; weight < 500 g), increments a monotonic sequence, emits one compact JSON line over Serial, and sounds the buzzer on any violation.
- **Identity:** `device_id = WOKWI-SIM-001`, `storage_location_id = SHELF-A3-B2`, composite `reading_id = WOKWI-SIM-001-YYYYMMDDHHMMSS-SEQ`.
- **Wokwi:** circuit `iot/firmware/wokwi_diagram.json`; simulator URLs in `wokwi_project_info.txt`.

### 10.2 Payload contract (`iot/iot_sensor_schema.json`)

10 required top-level fields: `schema_version`, `reading_id`, `device_id`, `storage_location_id`, `sequence_number`, `timestamp_utc`, `transmission_mode` (`serial` | `http_post`), `sensor_payload`, `device_status`, `alert_flags`. `additionalProperties: false`.

```json
{
  "schema_version": "1.0.0",
  "reading_id": "WOKWI-SIM-001-20260715103000-142",
  "device_id": "WOKWI-SIM-001",
  "storage_location_id": "SHELF-A3-B2",
  "sequence_number": 142,
  "timestamp_utc": "2026-07-15T10:30:00Z",
  "transmission_mode": "serial",
  "sensor_payload": {
    "temperature_celsius": 4.5,
    "humidity_percent": 45.0,
    "inventory_trigger": false,
    "light_lux": 250.0,
    "door_open": false
  },
  "device_status": {
    "battery_level_percent": 87,
    "signal_quality": 92,
    "firmware_version": "1.0.0"
  },
  "alert_flags": {
    "temperature_out_of_range": false,
    "humidity_out_of_range": false,
    "inventory_threshold_breached": false
  }
}
```

### 10.3 Known IoT open items

- **Payload size:** compact serialization measures ~567 bytes vs the schema's stated "<512 bytes" and the `StaticJsonDocument<512>` buffer → must be runtime-verified with `doc.measureJson()` and remedied (dynamic document, trimmed fields, or shorter `reading_id`).
- **`reading_id` type:** resolved to `TEXT` in the committed migration (proposal P1) so fresh DBs accept the composite string.
- **Alert FK:** `iot_alerts.reading_id` FK now points at `iot_readings(reading_id)` (natural key) to match `create_alert`'s insert.
- **Sim defaults:** the shipped `diagram.json` seeds DHT22 at 53.7 °C / 100% → permanent alarm state (leftover test data).

---

## 11. Pharma Data Module

Omar's Python package (`pharma_data/`, mirrored in `07_Pharma_Data_Module/source_from_Omar/`) implements the medical rules for Egyptian OTC products:

| File | Purpose |
|---|---|
| `drug_classification.py` | CSV loader + dataclasses `Drug`, `StorageRequirements`, `DrugProfile` (49 products) |
| `interaction_check.py` | 54 product-pair interaction lookups (`MAJOR`/`MODERATE`/`MINOR`) with alias bridging |
| `inventory_rules.py` | Reorder + storage-environment rules (temp/humidity tolerance) |
| `test_interaction_check.py` / `test_inventory_rules.py` | 10 pytest cases |
| `Egyptian_OTC_Drugs_With_Tolerances_V4_1_.csv` | Canonical 10-column / 49-row master list (target temp, tolerance, bin) |
| `Smart Eco-Pharma Hub (1.Fatma).csv` | Older 8-column / 42-row variant (to be deprecated) |

**Open reconciliation items:** 4 MINOR interactions not transcribed (Duphalac, Oplex+Prospan, Zyrtec/Telfast+Motilium, Betadine thyroid-test note), product-name drift (`VoltarenEmulgel` vs `Voltaren Emulgel`), 3 CSVs / 2 schemas to consolidate, and — critically — **no shared product ID** across modules (see R1).

---

## 12. AI Interaction-Risk Module

Dr. Mohamed's pharmacovigilance package (`03_Interaction_Risk_Module/`, committed as `smart_eco_pharma/interaction_risk/`) is an OpenAI **Structured Outputs** harness that turns the pharmacy's reference guide into a machine-checked risk assessor.

| File | Purpose |
|---|---|
| `system_prompt.txt` | "Interaction Risk Reasoning Engine" — role, tool contract (`lookup_product`, `get_known_interaction`), 4-tier severity scale, escalation rules |
| `output_schema.json` | Strict JSON Schema (9 top-level props, 7 per-interaction fields) |
| `pharmacy_reference_data.json` | Digitized reference guide — 42 products (P01–P42), 20 interactions (5 MAJOR / 8 MODERATE / 7 MINOR) |
| `interaction_test_set.json` | 25 ground-truth cases (5 major / 7 moderate / 4 minor / 4 negative / 5 edge) |
| `test_harness.py` | CLI runner that executes the 25 tests against the live model |
| `Interaction_Risk_Prompt_Templates.md` | 3 query shapes: pairwise / basket / unlisted-product |
| `START_HERE.md` | 5-step rollout plan |

**Severity scale:** `MAJOR` (serious risk, avoid) · `MODERATE` (monitor/adjust) · `MINOR` (awareness only) · `NONE_KNOWN` (no meaningful overlap). Each finding also carries `source` (`verified_reference` | `inferred_pharmacology`) and `confidence` (`high`/`medium`/`low`). The model must escalate to a pharmacist on any MAJOR or inferred finding and must **not** answer from memory when a tool can verify the fact.

**Seed script** (`smart_eco_pharma/seed_data.py`) loads `pharmacy_reference_data.json` into `drug_master` (42 products) + `drug_interactions` (expanded product pairs) with deterministic UUID5s, mapping `severity → risk_grade` (MAJOR→grade_4 … NONE_KNOWN→grade_1).

> **Model decision pending:** the harness was built for `gpt-4o-2024-08-06`, which OpenAI is retiring. The repo copy is already OpenRouter-adapted; the final model + key path must be decided before the 25/25 validation run.

---

## 13. MCP Server

`smart_eco_pharma/mcp_server/server.py` exposes **4 read-only tools** over stdio for AI agents:

| Tool | Purpose | Source module |
|---|---|---|
| `lookup_drug_inventory` | OTC stock, reorder status, storage for a drug | `tools/inventory_tools.py` |
| `check_drug_interactions` | Batch interaction check for 2–5 drugs | `tools/interaction_tools.py` |
| `get_risk_grade` | Single-pair risk-grade query | `tools/risk_grade_tools.py` |
| `get_iot_sensor_status` | Latest sensor readings per storage location | `tools/risk_grade_tools.py` |

Schema definitions: `docs/mcp_tool_schemas.json`.

---

## 14. Security Review

Documented in `security/` and managed as ranked, exploitable gaps:

| Severity | Total | FIXED | PARTIALLY | OPEN | ACCEPTED |
|---|---|---|---|---|---|
| HIGH | 3 | 2 | 1 | 0 | 0 |
| MEDIUM | 7 | 1 | 1 | 4 | 1 |
| LOW | 5 | 1 | 0 | 3 | 2 |
| **Total** | **15** | **4** | **2** | **7** | **3** |

**Key fixed gaps:** GAP-001 JWT auth on all 16 endpoints · GAP-003 old OpenRouter key removed (rotate in dashboard) · GAP-010 `iot_readings` table-name consistency · GAP-015 Docker `.env.example` copy removed.

**Key open gaps:** GAP-004 LLM response not Pydantic-validated before DB write · GAP-005/014 prompt injection + missing `max_length` on `clinical_context` · GAP-006 caller-provided `alert_flags` trusted · GAP-008 no rate limiting (accepted) · GAP-009 IoT RLS `WITH CHECK (true)` too permissive · GAP-011 `service_client` used for a read · GAP-012 `/health` leaks version/env.

**Zero-budget accepted risks:** shared Supabase tenancy, no WAF/DDoS (Render free tier), no paid monitoring, no automated secrets rotation, shared GitHub runners.

> ⚠ **Security flag:** `TEAM_CREDENTIALS.md` (team initial passwords) is tracked in git history — recommend rotating credentials and removing the file.

---

## 15. CI/CD & Deployment

- **CI (`.github/workflows/ci.yml`):** on every push/PR → `ruff check` → `mypy` → `pytest` → Docker build (build job only on `main`).
- **Docker (`Dockerfile`):** multi-stage `python:3.11-slim`, non-root `appuser`, `uvicorn smart_eco_pharma.main:app`.
- **Render (`render.yaml`):** free-tier Docker web service, health check `/health`, env vars injected at runtime (never baked into the image).
- **Env vars:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENROUTER_API_KEY`, `OPENROUTER_BASE_URL`, `APP_ENV`, `APP_VERSION`, `CORS_ORIGINS`, `GPT_MODEL`.

Deployment is **Phase 5 = PENDING** (Docker/Render/CI are ready; seed data + env provisioning + go-live remain).

---

## 16. Repository Structure

```
ECO PHARMA/
├── README.md                      ← this file
├── .env.example                   # env template (no secrets)
├── .env                           # LOCAL ONLY — never committed
├── Dockerfile / render.yaml / requirements.txt
├── fix_rls.sql                    # team_members RLS recursion fix
├── PHASE_PROGRESS_REPORT.md       # v0.1.0 status by phase
├── TEAM_HANDOFF.md                # team task matrix + repo map
├── TEAM_CREDENTIALS.md            # ⚠ LOCAL ONLY — never commit
├── .github/workflows/ci.yml       # CI pipeline
│
├── 00_Project_Overview/           # integration_summary.md, SAP plan
├── 01_From_Linear/                # Linear issue → status pointers
├── 02_From_Repo/                  # pointers to canonical repo paths
├── 03_Interaction_Risk_Module/    # Dr. Mohamed's AI risk package (+ source_from_Mohamed)
├── 04_Ahmed_Working_Files/        # migration proposals, seed, scratch
├── 05_Reports_And_Comms/          # session reports, action matrix
├── 06_IoT_Module/                 # Fajr's firmware + wokwi reference (+ source_from_Fajr)
├── 07_Pharma_Data_Module/         # Omar's module + review (+ source_from_Omar)
├── _analysis/                     # raw sub-agent findings (01–13)
│
├── smart_eco_pharma/              # ★ BACKEND
│   ├── main.py / config.py / database.py / auth.py / seed_data.py
│   ├── models/                    # Pydantic v2 (drug, inventory, interaction, iot, pv)
│   ├── repositories/              # Supabase query layers
│   ├── services/                  # business logic incl. pv_service.py
│   ├── routers/                   # 4 routers / 16 JWT endpoints
│   ├── mcp_server/                # 4-tool MCP server
│   ├── interaction_risk/          # Mohamed's package (committed)
│   ├── schema/                    # migrations + schema_contract.md + assumption_log.md
│   └── tests/                     # 16 tests / 4 files
│
├── iot/                           # payload schema, examples, handoff, firmware/
├── pharma_data/                   # Omar's package (repo-root mirror)
├── docs/                          # GAPS.md, api_contract.md, mcp_tool_schemas.json
└── security/                      # architecture_summary.md, gap_list.md, audit_signoff.md
```

---

## 17. Getting Started

### Prerequisites
- Python 3.11+
- A Supabase project (free tier) — URL + anon key + service-role key
- An OpenRouter API key
- (Optional) Docker for containerized runs

### Setup

```bash
# 1. Clone (private repo — authenticated access required)
git clone https://github.com/Eldasoky1/ECO-Pharma.git
cd "ECO PHARMA"

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
#  → fill in SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, OPENROUTER_API_KEY

# 4. Apply the database schema (Supabase SQL Editor)
#    → run smart_eco_pharma/schema/migration.sql
#    → run smart_eco_pharma/schema/iot_migration.sql
#    → run smart_eco_pharma/schema/migration_002_eman_validation.sql
#    → run smart_eco_pharma/schema/migration_003_interaction_risk.sql
#    → run fix_rls.sql (if team_members RLS is already enabled)

# 5. Seed reference data (42 products + interaction pairs)
python -m smart_eco_pharma.seed_data

# 6. Run the API
uvicorn smart_eco_pharma.main:app --reload
#    → http://localhost:8000/docs (Swagger UI)
```

### Docker

```bash
docker build -t smart-eco-pharma .
docker run -p 8000:8000 --env-file .env smart-eco-pharma
```

---

## 18. Testing

The test suite covers every service layer (16 tests / 4 files):

```bash
ruff check smart_eco_pharma/
mypy smart_eco_pharma/ --ignore-missing-imports
pytest smart_eco_pharma/tests/ -v --tb=short
```

| Test file | Tests | Covers |
|---|---|---|
| `test_interactions.py` | 4 | Interaction queries & basket checks |
| `test_inventory.py` | 5 | Drug catalogue + OTC inventory logic |
| `test_iot_ingestion.py` | 4 | Ingestion, dedup, alerts |
| `test_pv_pipeline.py` | 3 | GPT-4o pipeline scaffolding |

Plus Omar's module tests (10), and the AI harness's 25-case validation set (`interaction_test_set.json`, pending the model decision).

---

## 19. Project Phases & Current Status

| Phase | Scope | Status | Highlights |
|---|---|---|---|
| **1 — Medical Data Foundation** | Schema, enums, RLS, contracts | ✅ COMPLETE | 7 tables, schema contract, 20+ assumptions; domain sign-off in progress |
| **2 — Hardware Simulation** | IoT payload contract + Arduino/Wokwi | ✅ COMPLETE (firmware done) | DHT22/DS1307/HX711 firmware, 10-field payload |
| **3 — Software & Cloud Integration** | FastAPI, GPT-4o, MCP, CI/CD | ✅ COMPLETE | 16 endpoints, 4 MCP tools, 16 tests, Docker/Render ready |
| **4 — Cybersecurity** | Audit prep + fixes | 🔄 IN PROGRESS | 15 gaps (4 fixed / 2 partial / 7 open / 3 accepted) |
| **5 — Deployment & Production** | Render deploy, seed, go-live | ⏳ PENDING | Docker + render.yaml + CI ready |

**Phase 1 domain sign-off status:** Eman ✅ VALIDATED · Fatma ⏳ PENDING · Dr. Mohamed ⏳ PENDING (`risk_grade` enum) · Fagr ⏳ PENDING (payload size / reading_id).

---

## 20. Team & Responsibilities

| Team Member | Role | System Domain | Status |
|---|---|---|---|
| Ahmed El-Desouky | Governance & AI Lead | Schema, API, AI pipeline, MCP, CI/CD, deploy | 🔧 Owner |
| Eman Ayman | QA / QC Lead | `purity_classification`, test methods | ✅ VALIDATED |
| Fatma Mohamed | Clinical Pharmacy | `otc_inventory` thresholds & storage | ⏳ PENDING |
| Dr. Mohamed Ibrahim | Pharmacovigilance | `drug_interactions`, risk grades, AI engine | ⏳ PENDING |
| Fagr Ahmed | IoT Engineer | Arduino/Wokwi firmware | ✅ FIRMWARE DONE |
| Omar Hindawi | Backend Developer | Python models/services, `pharma_data` | ✅ CODE DONE (PR #2) |
| Zeina Wael | Cybersecurity | Audit, gap sign-off | ⏳ WAITING |
| Aya El-Hariry | Frontend | Dashboard over API contract | 📖 AWARENESS |

**Workflow rules:** reviews/decisions → reply to Ahmed (Linear) · code → push to GitHub + PR, Ahmed reviews & merges · migrations → `.sql` in `smart_eco_pharma/schema/`, Ahmed applies via Supabase SQL Editor.

---

## 21. Known Gaps & Open Decisions

### 21.1 Domain / clinical gaps (`docs/GAPS.md`)

1. `risk_grade` enum values are **placeholders** — Dr. Mohamed must validate (patient-safety critical).
2. `purity_grade` values undefined — Eman must define classification labels.
3. `min_stock_threshold` values undefined — Fatma must set per-drug reorder triggers.
4. `interaction_type` taxonomy undefined — Dr. Mohamed must define categories.
5–8. Supabase credential confirmation, OpenRouter quota check, QC/purity backend not yet built, Fatma's `migration_003_fatma_validation.sql` not yet created.

### 21.2 Cross-module integration conflicts (`00_Project_Overview/integration_summary.md`)

| # | Conflict | Reconciliation proposal (not yet applied) |
|---|---|---|
| R1 | No shared product ID (CSV name vs P01–P42 vs `storage_location_id`) | Introduce a canonical product ID as the single join key |
| R2 | `VoltarenEmulgel 100g` (Omar) vs `Voltaren Emulgel 100g` (Mohamed/docx) | Adopt docx spelling; keep alias fallback |
| R3 | Omar `MAJOR/MODERATE/MINOR` (no NONE_KNOWN) vs Mohamed 4-value enum | Map `None` → `NONE_KNOWN` at the boundary |
| R4 | Omar 16/20 minor pairs vs Mohamed 20/20 | Backfill Omar's 4 missing MINOR entries |
| R5 | Location scheme `B1-ZN2-SH1-BN1` (Omar) vs `SHELF-A3-B2` (Fajr) | Map schemes at ingestion; or adopt one contract-wide |
| R6 | IoT payload ~567B > 512B limit | DynamicJsonDocument / trim fields / shorten `reading_id` |
| R7 | `reading_id` UUID vs TEXT drift + alert FK bug | Committed migration updated (proposal P1) ✅ |
| R8 | `inventory_trigger` (weight bool) vs `min_stock_threshold` (unit count) | Decide the reorder contract |
| R9 | `transmission_mode` note said `"realtime"` (not in enum) | Fix handoff note → `"serial"` |

### 21.3 Repo hygiene

- `TEAM_CREDENTIALS.md` tracked in git history → rotate + remove.
- Docs-reference `test_drug.py` does not exist (actual: interactions/inventory/iot_ingestion/pv_pipeline).
- `security/architecture_summary.md` is stale (says "no JWT" while code has it on all 16 endpoints).
- Linear duplicate issues EJU-14 vs EJU-20 for Dr. Mohamed's scope.

---

## 22. Roadmap — Next Steps

1. **Review & merge PR #2** (`integrate-mohamed-fajr-omar-2026-08-12`) into `main`.
2. **Model decision** (GPT-4o retired → current model + OpenAI vs OpenRouter) — unblocks the 25/25 harness.
3. **Collect domain sign-off** from Fatma, Dr. Mohamed, Fagr (R1–R9 + GAPS 1–4).
4. **Apply remaining migrations** to Supabase (002, 003) and verify RLS.
5. **Close open security gaps** (GAP-004/005/006/009/011/012/014) then schedule Zeina's audit.
6. **Seed + deploy to Render**; smoke-test `/health` and the IoT ingestion path end-to-end.
7. **Wire Mohamed's package into `pv_service`** (Structured Outputs + schema swap).
8. **Deliverables (EJU-19):** final report, video, artifacts.

---

## 23. Documentation Index

| Document | What it covers |
|---|---|
| `TEAM_HANDOFF.md` | Team task matrix, full repo map, per-person actions |
| `PHASE_PROGRESS_REPORT.md` | Phase-by-phase status (v0.1.0) |
| `smart_eco_pharma/schema/schema_contract.md` | Single source of truth for every DB table |
| `smart_eco_pharma/schema/assumption_log.md` | 20 domain assumptions awaiting validation |
| `iot/assumption_log.md` | 12 IoT assumptions |
| `docs/api_contract.md` | Full API docs (for the frontend) |
| `docs/mcp_tool_schemas.json` | MCP tool JSON schemas |
| `docs/GAPS.md` | Domain gaps & action items |
| `security/architecture_summary.md` | Architecture & data flow for security review |
| `security/gap_list.md` | 15 ranked security gaps |
| `security/audit_signoff.md` | Pre-audit checklist (DRAFT) |
| `03_Interaction_Risk_Module/START_HERE.md` | AI risk engine rollout plan |
| `00_Project_Overview/integration_summary.md` | Cross-module reconciliation (R1–R9) |
| `04_Ahmed_Working_Files/migration_proposals_supabase_2026-08-13.md` | Applied schema proposals (P1–P4) |

---

## 24. Frontend / GUI Design — Stitch Dashboard Brief

### 24.1 The Idea (full explanation)

The entire platform — drug catalogue, live OTC inventory, cold-chain IoT monitoring, the AI drug-interaction engine, and the MCP agent layer — is a **fully working backend** with no human interface of its own. It exposes 16 JWT-protected REST endpoints and 4 MCP tools, but every one of those capabilities is currently reachable only through Swagger UI or an AI agent. There is no screen a pharmacist, inventory lead, or manager can open to *see* stock levels, *act* on a temperature alert, or *run* a drug-interaction check.

The **GUI idea** is to close that gap with a browser-based **operations dashboard** that gives every team role a visual home for the slice of the system they own:

- The **manager / dashboard owner** gets an at-a-glance overview — stock health, active alerts, live sensor conditions, and quick actions — so problems surface before they become emergencies.
- The **clinical pharmacy / inventory lead** (Fatma) manages stock records end-to-end: search the catalogue, create/edit inventory records, and flip reorder status (`normal / low / critical / on_order`) with one click.
- The **pharmacist** runs the **Interaction Checker** (basket of 2–10 drugs → every known pair sorted by risk) and can escalate any MAJOR/contraindicated result, backed by the GPT-4o **AI Analyzer** for new or uncertain pairs.
- The **pharmacovigilance officer** (Dr. Mohamed) browses the interaction knowledge base and reviews past AI reports per drug.
- The **IoT / QC leads** (Fagr, Eman) watch live sensor readings and the unacknowledged alert feed, so a fridge drifting out of the 2–8 °C band is seen and acknowledged immediately.

Because the frontend is driven entirely by the documented REST API (`docs/api_contract.md`), the dashboard is **contract-first**: every screen maps 1:1 to an endpoint, every field a screen shows is a field the API already returns, and every status it colors is a value the API already enforces (see the enums below). No backend work is required to build it.

The UI is produced with **Stitch** (an AI GUI generator) from a design brief — `04_Ahmed_Working_Files/GUI_Design_Brief.md` — which is the exact input an AI agent turns into a Stitch generation prompt. The brief defines the visual language, the app shell (sidebar + top bar), **14 screens**, shared components, and the endpoint map, so the generated screens stay consistent and implementable.

**Design language:** clean clinical-pharmacy aesthetic — primary teal/green (`#0B9D8A`–`#10B981`), red `#EF4444` (critical / MAJOR), amber `#F59E0B` (moderate), blue `#3B82F6` (info / minor), slate neutrals; white cards, soft shadows, rounded corners, persistent left sidebar, top bar with user + live connection status; font **Inter**; **desktop** width ~1280–1440 px.

### 24.2 Status badge colors (enums rendered as pills)

| Enum | Values & colors |
|---|---|
| `regulatory_status` | `prescription_only` (red) · `otc` (green) · `controlled` (amber) |
| `reorder_status` | `normal` (green) · `low` (amber) · `critical` (red) · `on_order` (blue) |
| `risk_grade` | `grade_1_minimal` (green) · `grade_2_moderate` (blue) · `grade_3_severe` (amber) · `grade_4_contraindicated` (red) |
| `evidence_level` | `established` (green) · `theoretical` (amber) · `case_report` (blue) |
| `alert_type` | `temperature_out_of_range` (red) · `humidity_out_of_range` (amber) · `inventory_threshold_breached` (orange) |

### 24.3 The 14 screens

| # | Screen | What it does | API |
|---|---|---|---|
| 1 | **Login** | Supabase email/password sign-in → obtains the JWT for every call | Supabase Auth |
| 2 | **Dashboard** | KPI cards (drugs, stock units, low/critical stock, active alerts), critical-stock panel, recent alerts feed, latest sensor snapshot per location, quick actions | `GET inventory/drugs`, `GET inventory/otc`, `GET iot/alerts`, `GET iot/readings` |
| 3 | **Drug Catalogue** | Searchable (`drug_name`/`brand_name`), paginated master drug table with status badges + dosage-form chips | `GET inventory/drugs` |
| 4 | **Drug Detail** | Full record + linked OTC inventory, related interactions, AI reports link, soft-delete | `GET/DELETE inventory/drugs/{id}`, `GET interactions`, `GET inventory/otc` |
| 5 | **OTC Inventory** | Filterable stock list (reorder-status pills, location), quick reorder-status change, edit/new actions | `GET inventory/otc`, `PATCH .../reorder-status` |
| 6 | **Inventory Record Edit** | View/edit one record (partial update semantics) | `GET/PUT inventory/otc/{id}` |
| 7 | **New Inventory Record** | Create form with searchable drug picker | `POST inventory/otc` |
| 8 | **Interaction Knowledge Base** | Browse/filter drug-pair interactions by drug or risk grade, detail drawer | `GET interactions`, `GET interactions/{id}` |
| 9 | **Interaction Checker** | Basket of 2–10 drugs → all pairs sorted highest-risk first, escalate CTA | `POST interactions/check` |
| 10 | **AI Analyzer** | Drug A + Drug B + optional clinical context → GPT-4o assessment (2–5 s loading state) | `POST pharmacovigilance/analyze` |
| 11 | **PV Reports** | AI report history for a selected drug | `GET pharmacovigilance/reports/{drug_id}` |
| 12 | **Live Sensors** | Ingested readings filtered by location / timestamp, alert-flag badges | `GET iot/readings` |
| 13 | **Alerts** | Unacknowledged alerts, type badges, acknowledge action | `GET iot/alerts` |
| 14 | **Settings** | Connection status (`/health`), API base URL, account info, data counts | `GET /health` + list endpoints |

### 24.4 Shared components (request in the Stitch prompt)

Sidebar + top-bar app shell · KPI stat card · sortable/paginated data table · search + filter pills · enum status badge · labeled detail form with 422 validation-error display · modal/drawer for quick actions · loading spinners (esp. the 2–5 s AI call) · empty states · error banners for `{error, detail}`.

### 24.5 Endpoint map

| Endpoint | Screens |
|---|---|
| `GET /health` | 14 |
| `GET/PUT/POST/DELETE /api/v1/inventory/drugs` · `/inventory/otc` | 2–7, 14 |
| `GET /api/v1/interactions` · `POST /api/v1/interactions/check` | 4, 8, 9 |
| `POST /api/v1/pharmacovigilance/analyze` · `GET /api/v1/pharmacovigilance/reports/{drug_id}` | 10, 11 |
| `GET /api/v1/iot/readings` · `GET /api/v1/iot/alerts` | 2, 12–14 |

**Auth:** all endpoints except `/health` require `Authorization: Bearer <Supabase JWT>`. **Errors:** `{ "error": <code>, "detail": <message> }` with `not_found` / `validation_error` / `internal_error`.

> 📌 The authoritative brief lives at **`04_Ahmed_Working_Files/GUI_Design_Brief.md`** — hand that file to an AI agent to produce a detailed Stitch generation prompt.

---

*Project: Smart Eco-Pharma Hub · Version 0.1.0 · Maintained by Ahmed El-Desouky · Repository: https://github.com/Eldasoky1/ECO-Pharma*

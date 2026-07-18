# Smart Eco-Pharma Hub — Team Handoff Document

**Project:** Smart Eco-Pharma Hub Backend
**Date:** 2026-07-18
**Prepared by:** Ahmed El-Desouky, Technical Governance & AI Architecture Lead
**Status:** Phase 1–3 Complete | Phase 4 Pending Domain Validation
**Repo:** https://github.com/Eldasoky1/ECO-Pharma

---

## Executive Summary

The backend infrastructure is complete: database schema (7 tables), FastAPI API (16 endpoints with JWT auth), GPT-4o pharmacovigilance pipeline, MCP server (4 tools), CI/CD pipeline, and security review. What remains is **domain validation** — confirming that our technical assumptions match your professional expertise.

Each team member below has specific assumptions that require your sign-off before we proceed to deployment.

---

## Team Responsibility Table — Who Works on What

**Find your name below. The "Files" column tells you exactly which files to open and review/work on.**

| Team Member | Role | Status | Files You Must Review | Your Action |
|---|---|---|---|---|
| **Eman Ayman** | QA / Quality Control | ✅ VALIDATED (test_method done) | `smart_eco_pharma/schema/schema_contract.md` (section 3: purity_classification) | Confirm the 7 enum values cover your analytical methods. Reply if any method is missing. |
| **Fatma Mohamed** | Clinical Pharmacy / Inventory | ⏳ PENDING | `smart_eco_pharma/schema/schema_contract.md` (section 4: otc_inventory), `smart_eco_pharma/schema/assumption_log.md`, `iot/assumption_log.md` | Validate 10 assumptions (storage format, temperature zones, thresholds). Reply with decisions. |
| **Dr. Mohamed Ibrahim** | Pharmacovigilance | ⏳ PENDING | `smart_eco_pharma/schema/schema_contract.md` (section 5: drug_interactions), `smart_eco_pharma/schema/assumption_log.md`, `docs/GAPS.md` | Validate or correct `risk_grade` enum values. **Patient safety critical.** |
| **Fagr Ahmed** | IoT / Hardware Engineer | ⏳ PENDING | `iot/iot_sensor_schema.json`, `iot/iot_example_normal.json`, `iot/iot_example_alert.json`, `iot/fagr_handoff_note.md`, `iot/assumption_log.md` | Confirm sensor data format matches Wokwi simulator. Sign off IoT contract. |
| **Zeina Wael** | Cybersecurity Auditor | ⏳ WAITING | `security/architecture_summary.md`, `security/gap_list.md`, `security/audit_signoff.md`, `smart_eco_pharma/auth.py` | Review fixed gaps. Schedule audit when HIGH/MEDIUM gaps are closed. |
| **Omar Hindawi** | Backend Developer | 📖 AWARENESS | `smart_eco_pharma/schema/schema_contract.md`, `docs/api_contract.md`, `docs/GAPS.md` | Review schema + API. QC endpoints not scoped yet. |
| **Aya El-Hariry** | Frontend Developer | 📖 AWARENESS | `smart_eco_pharma/schema/schema_contract.md`, `docs/api_contract.md`, `docs/GAPS.md` | Review schema + API for UI form design. |
| **Ahmed El-Desouky** | Technical Governance & AI Lead | 🔧 OWNER | ALL FILES | Run migration SQL, deploy to Render, collect team responses. |

---

## Quick File Reference — Full Repo Map

| Folder | File | What It Is | Who Needs It |
|---|---|---|---|
| `smart_eco_pharma/schema/` | `migration.sql` | Original schema (5 tables, 6 enums, RLS) | Ahmed (already run) |
| `smart_eco_pharma/schema/` | `migration_002_eman_validation.sql` | **NEW** — Eman's test_method enum override | **Eman** (run in SQL Editor) |
| `smart_eco_pharma/schema/` | `iot_migration.sql` | IoT tables (iot_readings, iot_alerts) | Ahmed (already run) |
| `smart_eco_pharma/schema/` | `schema_contract.md` | Human-readable field model (all 5 tables) | **Everyone** |
| `smart_eco_pharma/schema/` | `assumption_log.md` | 20 domain assumptions | Eman, Fatma, Dr. Mohamed |
| `iot/` | `iot_sensor_schema.json` | IoT payload contract (JSON Schema) | **Fagr** |
| `iot/` | `iot_example_normal.json` | Example normal sensor reading | **Fagr** |
| `iot/` | `iot_example_alert.json` | Example alert sensor reading | **Fagr** |
| `iot/` | `fagr_handoff_note.md` | Integration guide for Arduino | **Fagr** |
| `iot/` | `assumption_log.md` | 12 IoT assumptions | Fagr, Fatma |
| `docs/` | `GAPS.md` | Known gaps & action items | Ahmed, Dr. Mohamed |
| `docs/` | `api_contract.md` | 16 API endpoints documentation | Omar, Aya |
| `docs/` | `mcp_tool_schemas.json` | MCP tool definitions | Ahmed |
| `security/` | `architecture_summary.md` | System architecture & data flow | **Zeina** |
| `security/` | `gap_list.md` | 15 security gaps with status | **Zeina**, Ahmed |
| `security/` | `audit_signoff.md` | Audit sign-off document (DRAFT) | **Zeina**, Ahmed |
| `smart_eco_pharma/` | `main.py` | FastAPI app entry point | Omar |
| `smart_eco_pharma/` | `auth.py` | JWT authentication | Zeina, Omar |
| `smart_eco_pharma/` | `config.py` | Settings (env vars) | Omar |
| `smart_eco_pharma/` | `database.py` | Supabase client setup | Omar |
| `smart_eco_pharma/models/` | `drug.py` | Drug Pydantic models | Omar |
| `smart_eco_pharma/models/` | `inventory.py` | Inventory Pydantic models | Omar |
| `smart_eco_pharma/models/` | `interaction.py` | Interaction Pydantic models | Omar |
| `smart_eco_pharma/models/` | `iot.py` | IoT Pydantic models | Omar |
| `smart_eco_pharma/models/` | `pharmacovigilance.py` | GPT-4o pipeline models | Omar |
| `smart_eco_pharma/routers/` | `inventory.py` | Inventory API endpoints | Omar |
| `smart_eco_pharma/routers/` | `interactions.py` | Interaction API endpoints | Omar |
| `smart_eco_pharma/routers/` | `iot_ingestion.py` | IoT ingestion endpoints | Omar |
| `smart_eco_pharma/routers/` | `pharmacovigilance.py` | PV GPT-4o endpoints | Omar |
| `smart_eco_pharma/services/` | `inventory_service.py` | Inventory business logic | Omar |
| `smart_eco_pharma/services/` | `iot_service.py` | IoT business logic | Omar |
| `smart_eco_pharma/services/` | `pv_service.py` | GPT-4o pipeline service | Omar |
| `smart_eco_pharma/mcp_server/` | `server.py` | MCP server (4 tools) | Ahmed |
| `smart_eco_pharma/tests/` | `test_inventory.py` | Inventory tests (6 tests) | Omar |
| `smart_eco_pharma/tests/` | `test_iot_ingestion.py` | IoT tests (4 tests) | Omar |
| `smart_eco_pharma/tests/` | `test_drug.py` | Drug tests (3 tests) | Omar |
| `smart_eco_pharma/tests/` | `test_pv_pipeline.py` | Pipeline tests (3 tests) | Omar |
| Root | `Dockerfile` | Container build config | Ahmed |
| Root | `render.yaml` | Render.com deployment | Ahmed |
| Root | `requirements.txt` | Python dependencies | Omar |
| Root | `.github/workflows/ci.yml` | CI/CD pipeline | Ahmed |
| Root | `TEAM_HANDOFF.md` | This document | **Everyone** |
| Root | `TEAM_CREDENTIALS.md` | Login credentials | **Everyone** (keep secure) |
| Root | `PHASE_PROGRESS_REPORT.md` | Full progress report | Ahmed |

---

## 1. Eman Ayman — Quality Control Lead ✅ VALIDATED

**Phase:** 1 — Schema Design (Purity Classification)
**Status:** `test_method` override COMPLETE — migration ready to apply.

**What was done:**
- `test_method` converted from free-text to controlled enum (`test_method_type`)
- 7 values: `hplc`, `gc`, `uv_vis`, `ftir`, `titration`, `mass_spectrometry`, `other`
- New escape-hatch column: `test_method_other_description` (for when `test_method = 'other'`)
- `purity_grade`, `purity_percent`, `unit`, `qc_protocol_ref` — confirmed as-is, untouched

**Your action NOW:**
1. Run `migration_002_eman_validation.sql` in Supabase SQL Editor:
   → https://supabase.com/dashboard/project/drzrxfmrxiitopjamchh/sql/new
2. Confirm the 7 enum values cover your team's standard analytical methods
3. If you need additional methods added permanently, reply and I'll create a migration to extend the enum

**Files to review:**
- `smart_eco_pharma/schema/schema_contract.md` — Section 3 (purity_classification) — updated for your review
- `smart_eco_pharma/schema/migration_002_eman_validation.sql` — the SQL to run

---

## 2. Fatma Mohamed — Clinical Pharmacist

**Phase:** 1 — Schema Design (Inventory & Storage) + Phase 2 — IoT Integration
**What I need from you:** Validate inventory thresholds, storage location conventions, and IoT environmental ranges. These decisions affect both the database schema and the IoT sensor alert logic.

**Assumptions to validate:**

| # | Assumption | Your Decision Needed |
|---|---|---|
| ASSUMPTION-006 | `dosage_forms` stored as PostgreSQL array (TEXT[]) | Is array storage sufficient, or do you need metadata per dosage form? |
| ASSUMPTION-008 | `min_stock_threshold` is a single integer per inventory record | Do you need different thresholds per storage location or drug class? |
| ASSUMPTION-009 | `reorder_quantity` is a fixed integer per record | Should the system auto-calculate based on dispensing history? |
| ASSUMPTION-010 | `storage_location_identifier` is free-text (e.g. "SHELF-A3-B2") | Do you need hierarchical locations (building > room > shelf > bin)? |
| ASSUMPTION-011 | Storage temp range: NUMERIC(4,1) — supports 2.0°C to 8.0°C | Do you need different ranges per storage zone? |
| ASSUMPTION-012 | Storage humidity range: 30% to 65% RH | Do you use different humidity ranges per zone? |
| IOT-001 | Cold chain range: 2.0°C to 8.0°C (WHO standard) | Do you also store room-temperature drugs (15–25°C)? |
| IOT-002 | Humidity range: 30% to 65% RH (USP <659>) | Confirm humidity range per storage zone |
| IOT-005 | Default storage_location_id: "SHELF-A3-B2" | Confirm the exact location_id string in your database |
| IOT-012 | Inventory trigger maps to `min_stock_threshold` | Confirm physical sensor threshold aligns with database threshold |

**Files to review:**
- `smart_eco_pharma/schema/schema_contract.md` — Sections: Drug Master, OTC Inventory
- `smart_eco_pharma/schema/assumption_log.md` — ASSUMPTION-006, 008–012
- `iot/assumption_log.md` — IOT-ASSUMPTION-001, 002, 005, 012

**Action required:** Reply with your decisions. Confirm or override each assumption with your preferred values.

---

## 3. Dr. Mohamed Ibrahim — Pharmacovigilance & Regulatory Lead

**Phase:** 1 — Schema Design (Drug Interactions & Regulatory) + Phase 3 — GPT-4o Pipeline
**What I need from you:** Validate the drug interaction taxonomy, risk grading system, and evidence classification. **This is patient safety critical** — the risk_grade enum directly affects clinical decision support.

**Assumptions to validate:**

| # | Assumption | Your Decision Needed |
|---|---|---|
| ASSUMPTION-007 | `regulatory_status` ENUM: prescription_only, otc, controlled | Do you need additional categories (herbal, supplement, vaccine)? |
| ASSUMPTION-013 | `interaction_type` is free-text (pharmacokinetic, pharmacodynamic) | Provide your preferred taxonomy for ENUM conversion |
| ASSUMPTION-014 | **PLACEHOLDER** `risk_grade` enum: grade_1_minimal through grade_4_contraindicated | **CRITICAL: Validate or replace the entire grading system** |
| ASSUMPTION-015 | `evidence_level` ENUM: established, theoretical, case_report | Do you need a more granular evidence hierarchy? |
| ASSUMPTION-016 | `clinical_consequence` is free-text | Should this be decomposed into structured fields (severity, onset, reversibility)? |
| ASSUMPTION-019 | Soft delete on drug_master (deleted_at timestamp) | Do you require physical deletion for regulatory reasons? |
| ASSUMPTION-020 | Self-interaction CHECK constraint (drug_a_id != drug_b_id) | Do you need self-interaction records for overdose modeling? |

**Files to review:**
- `smart_eco_pharma/schema/schema_contract.md` — Sections: Drug Interactions, Risk Grade Enum
- `smart_eco_pharma/schema/assumption_log.md` — ASSUMPTION-007, 013–016, 019, 020
- `smart_eco_pharma/docs/GAPS.md` — Gap #1 (risk_grade) and Gap #4 (interaction_type)

**Action required:** Reply with your decisions. **Especially ASSUMPTION-014** — the risk_grade values are placeholders that must be replaced before the pharmacovigilance pipeline goes live.

---

## 4. Fagr — IoT/Hardware Engineer

**Phase:** 2 — IoT Sensor Integration
**What I need from you:** Validate the IoT payload contract and Arduino implementation assumptions. These determine whether the Wokwi simulator output matches what the backend expects.

**Assumptions to validate:**

| # | Assumption | Your Decision Needed |
|---|---|---|
| IOT-003 | Transmission modes: serial + http_post | Which mode will you implement first? |
| IOT-004 | Device ID: "WOKWI-SIM-001" | Confirm the device_id in your Arduino sketch |
| IOT-006 | Timestamp: placeholder (no RTC module) | Will you add a DS3231 RTC module? |
| IOT-007 | Sequence number persists via EEPROM | Confirm Wokwi supports EEPROM simulation |
| IOT-008 | Alert flags computed on Arduino | Confirm you implement alert logic in sketch |
| IOT-009 | Payload size < 512 bytes minified | Confirm actual minified payload size |
| IOT-011 | Duplicate detection via UUID reading_id | Confirm you generate unique UUIDs per reading |

**Files to review:**
- `iot/iot_sensor_schema.json` — Complete payload schema (JSON Schema draft-07)
- `iot/iot_example_normal.json` — Example normal reading
- `iot/iot_example_alert.json` — Example alert reading
- `iot/fagr_handoff_note.md` — Integration guide for your Arduino implementation
- `iot/assumption_log.md` — IOT-ASSUMPTION-003, 004, 006–009, 011

**Action required:** Reply with your decisions. Confirm device_id, transmission mode, and payload size.

---

## 5. Zeina Wael — Cybersecurity Auditor

**Phase:** 4 — Security Review
**What I need from you:** Review the security audit documentation and conduct the cybersecurity audit once gaps are closed.

**Current security status:**
- 3 gaps FIXED (JWT auth, table name alignment, Dockerfile cleanup)
- 2 gaps PARTIALLY FIXED (IoT device auth, storage_location validation)
- 8 gaps OPEN (see gap_list.md for details)

**Files to review:**
- `security/architecture_summary.md` — System architecture and data flow
- `security/gap_list.md` — All 15 gaps with current status
- `security/audit_signoff.md` — Audit sign-off document (DRAFT)
- `smart_eco_pharma/auth.py` — JWT authentication implementation

**Action required:** Review the fixed gaps. Schedule the audit once all HIGH and MEDIUM gaps are closed. The pre-audit checklist in `audit_signoff.md` tracks remaining items.

---

## 6. Ahmed El-Desouky — Technical Governance & AI Architecture Lead

**Phase:** All Phases — Owner
**What you must do:**

| # | Task | Priority | Status |
|---|---|---|---|
| 1 | ~~Revoke old OpenRouter API key~~ | HIGH | COMPLETED |
| 2 | Add yourself to `team_members` table in Supabase SQL Editor | HIGH | COMPLETED |
| 3 | Set Render env vars (SUPABASE_URL, keys, CORS_ORIGINS) | HIGH | COMPLETED |
| 4 | Collect domain validation responses from team | HIGH | IN PROGRESS |
| 5 | Deploy to Render.com (Dockerfile + render.yaml ready) | MEDIUM | IN PROGRESS |

**SQL to add yourself to team_members:**
```sql
INSERT INTO team_members (id, email, full_name, role)
VALUES (
  auth.uid(),
  'your-email@example.com',
  'Ahmed El-Desouky',
  'technical_lead'
);
```

---

## Timeline

| Milestone | Owner | Deadline |
|---|---|---|
| Domain validation responses collected | Ahmed | Week 1 |
| Risk grade enum validated | Dr. Mohamed | Week 1 |
| Purity fields validated | Eman | Week 1 |
| Inventory thresholds confirmed | Fatma | Week 1 |
| IoT payload contract confirmed | Fagr | Week 1 |
| All HIGH/MEDIUM security gaps closed | Ahmed | Week 2 |
| Cybersecurity audit | Zeina | Week 2 |
| Production deployment | Ahmed | Week 3 |

---

**Questions?** Contact Ahmed El-Desouky at your-email@example.com

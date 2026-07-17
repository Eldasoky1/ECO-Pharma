# Smart Eco-Pharma Hub — Team Handoff Document

**Project:** Smart Eco-Pharma Hub Backend
**Date:** 2026-07-15
**Prepared by:** Ahmed El-Desouky, Technical Governance & AI Architecture Lead
**Status:** Phase 1–3 Complete | Phase 4 Pending Domain Validation

---

## Executive Summary

The backend infrastructure is complete: database schema (7 tables), FastAPI API (16 endpoints with JWT auth), GPT-4o pharmacovigilance pipeline, MCP server (4 tools), CI/CD pipeline, and security review. What remains is **domain validation** — confirming that our technical assumptions match your professional expertise.

Each team member below has specific assumptions that require your sign-off before we proceed to deployment.

---

## 1. Eman Ayman — Quality Control Lead

**Phase:** 1 — Schema Design (Purity Classification)
**What I need from you:** Validate the purity/QC field definitions in the database schema. These fields directly impact how you record and query quality control data.

**Assumptions to validate:**

| # | Assumption | Your Decision Needed |
|---|---|---|
| ASSUMPTION-001 | `purity_grade` is free-text (e.g. "USP Grade", "Analytical Grade") | Should this be a fixed ENUM or free-text? |
| ASSUMPTION-002 | `purity_percent` uses NUMERIC(5,2) — supports up to 999.99% | Do you need higher precision (e.g. 99.999% for ultra-pure standards)? |
| ASSUMPTION-003 | `purity_percent` unit defaults to "%" | Do you use concentration-based metrics (mg/mL) instead? |
| ASSUMPTION-004 | `qc_protocol_ref` is free-text (e.g. "QC-PROT-001") | Should this link to digital documents or remain a reference string? |
| ASSUMPTION-005 | `test_method` is free-text (e.g. "HPLC", "UV Spectroscopy") | Should this be a controlled vocabulary (ENUM) or free-text? |

**Files to review:**
- `smart_eco_pharma/schema/schema_contract.md` — Human-readable field model (Section: Purity Classification)
- `smart_eco_pharma/schema/assumption_log.md` — ASSUMPTION-001 through 005

**Action required:** Reply with your decisions for each assumption. Mark as VALIDATED or OVERRIDE with your preferred values.

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
| 2 | Add yourself to `team_members` table in Supabase SQL Editor | HIGH | PENDING |
| 3 | Set Render env vars (SUPABASE_URL, keys, CORS_ORIGINS) | HIGH | PENDING |
| 4 | Collect domain validation responses from team | HIGH | IN PROGRESS |
| 5 | Deploy to Render.com (Dockerfile + render.yaml ready) | MEDIUM | PENDING |

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

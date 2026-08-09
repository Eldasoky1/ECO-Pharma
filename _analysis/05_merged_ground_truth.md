# 05 — Merged Ground Truth (Merge-Agent-1)

**Inputs:** `01_linear_findings.md` (Sub-Agent A) · `02_github_findings.md` (Sub-Agent B) · `04_archive_review.md` (Sub-Agent D)
**Purpose:** Single cross-source truth per person/issue — Linear status vs repo evidence vs verified status + discrepancy notes.
**Generated:** 2026-08-09

---

## 1. Verified status legend

| Status | Meaning |
|---|---|
| ✅ DONE | Evidence exists in repo/Linear AND matches claims |
| ⚠️ PARTIAL | Work exists but incomplete / not applied / docs vs code mismatch |
| ⏳ BLOCKED/WAITING | Pending on another person, decision, or missing account |
| ❌ UNVERIFIED | No evidence anywhere (no repo file, no Linear record, no archive) |

---

## 2. Per-person merged matrix

| Person | Linear status | Repo / archive evidence | Verified status | Discrepancy / note |
|---|---|---|---|---|
| **Ahmed El-Desoky** | EJU-5, EJU-7, EJU-9 **Done** (07-17); EJU-8/10/19 Backlog | **Entire repo** — 9/9 commits, 100% his authorship; backend (16 endpoints, 4 routers/services/repos, 5 models, 4 MCP tools, 16 tests), schema (migration.sql, iot_migration.sql, migration_002), IoT contract + Fagr firmware, security docs, CI/CD, Dockerfile, render.yaml | ✅ DONE for built infra; ⚠️ **no Linear report posted** on any of his issues | EJU-9 "Done" predates Dr. Mohamed's prompt-package integration → net-new work unreported. `security/architecture_summary.md` stale ("no JWT"), PHASE_PROGRESS claims `alert_type` enum (doesn't exist), README 1-line stub |
| **Eman Ayman** | EJU-12 **Done** (07-21) | `migration_002_eman_validation.sql` (test_method_type enum, 7 values) committed by Ahmed (ef7fff2); schema_contract §3 updated | ⚠️ PARTIAL | Migration **created but NOT applied** to Supabase — file must run in SQL Editor. No QA/purity backend wired (GAPS #7) |
| **Dr. Fatma Mohamed** | EJU-13 **Done** (07-17) | Threshold values confirmed on Linear (temp_tolerance 2.0/3.0, humidity_tolerance 5.0, 07-17); **no migration_003_fatma_validation.sql exists** | ⚠️ PARTIAL | GAPS #3/#8 open — her validation SQL not yet created/committed |
| **Dr. Mohamed Ibrahim** | EJU-20 **Done** (07-18, self-created); **EJU-14 Backlog** | Full interaction-risk package in `temp_mohamed/` + `extracted_Mohamed_Ahmed_folder/` (system_prompt.txt, output_schema.json, pharmacy_reference_data.json: 42 products / 20 interactions, interaction_test_set.json: 25 cases, test_harness.py, prompt templates, START_HERE) | ⚠️ PARTIAL | **Duplicate issue ambiguity (EJU-14 vs EJU-20)**; package **never attached to Linear and not committed to git**. `risk_grade_type`/`evidence_level_type` enums still PLACEHOLDER. Omar blocked on this handover (08-06) |
| **Fagr Ahmed** | EJU-15 Backlog (no account) | `iot/firmware/*` committed (sketch.ino 194 lines, Wokwi diagram, libraries, README) | ⚠️ PARTIAL | **`reading_id` UUID-vs-string mismatch** (`models/iot.py:31` UUID vs `iot_sensor_schema.json` "any string") → his `WOKWI-SIM-001-…` payloads would be rejected; payload-size + format still OPEN (TEAM_HANDOFF IOT-009/011) |
| **Omar Hindawi** | EJU-11 **In Progress**; reports posted (07-16 x2, 08-07) | No code pushed to repo (no commits/branches) | ⚠️ PARTIAL | Phase 1 Progress Report exists on Linear (10/10 tests); **code not in GitHub** — handover to Aya pending; blocked on Dr. Mohamed's data (EJU-14) |
| **Aya El-Hariry** | EJU-16 Backlog (no account) | No commits | ❌ UNVERIFIED | Awaiting Omar handover + backend integration |
| **Zeina Wael** | EJU-17 Backlog (no account) | Reads `security/*` (authored by Ahmed); audit NOT done | ❌ UNVERIFIED | `audit_signoff.md` DRAFT — pre-audit checklist 8/14 unchecked |
| **Eman Ayman (backend side)** | — | No pure QC/purity model/repository/router/endpoint exists | ⚠️ PARTIAL | GAPS #7: `purity_classification` schema exists, backend missing |

---

## 3. Issue-level ground truth (project view)

| Issue | Title | Claimed (Linear) | Evidence in repo/archive | Verified | Discrepancy |
|---|---|---|---|---|---|
| EJU-6 | Project Setup | Backlog (parent) | README + TEAM_HANDOFF + structure exist | ✅ | README is 1-line stub |
| EJU-5 | Constraints & Schema/RLS | Done 07-17 | migration.sql (5 tables, 6 enums, ~26 RLS), fix_rls.sql | ⚠️ | Migration **applied status unverifiable** (no schema_migrations table); `team_role` enum won't accept TEAM_CREDENTIALS role names |
| EJU-7 | API & Data Contracts | Done 07-17 | docs/api_contract.md (16 endpoints), mcp_tool_schemas.json | ✅ | — |
| EJU-8 | Guide Integration & Reviews | Backlog | GAPS.md, TEAM_HANDOFF (271 lines) | ⚠️ | Ongoing; no review log |
| EJU-9 | GPT-4o & MCP Server | Done 07-17 | pv_service.py (OpenRouter GPT-4o), mcp_server (4 tools) | ⚠️ | **Predates Mohamed's package**; needs integration (prompt swap, Structured Outputs, lookup_product/get_known_interaction tools); GAP-004/005/006 open |
| EJU-10 | Security & Final Narrative | Backlog | security/gap_list.md (15 gaps: 4 FIXED, 2 PARTIAL, 7 OPEN, 3 accepted) | ⚠️ | architecture_summary.md stale; audit DRAFT |
| EJU-11 | Omar — Python + Sprint | In Progress | — (no repo code) | ⚠️ | Code only in Linear reports |
| EJU-12 | Eman — QC/Purity | Done 07-21 | migration_002 (unapplied) | ⚠️ | Migration not run; no purity endpoint |
| EJU-13 | Fatma — OTC/Inventory | Done 07-17 | threshold CSV values on Linear | ⚠️ | migration_003 missing |
| EJU-14 | Dr. Mohamed — PV research | Backlog | Archive package (out-of-band) | ⚠️ | Duplicate of EJU-20; not attached |
| EJU-20 | Dr. Mohamed — PV (dup) | Done 07-18 | Archive package | ⚠️ | Same scope as EJU-14 |
| EJU-15 | Fagr — Wokwi/Arduino | Backlog | firmware committed | ⚠️ | reading_id mismatch; no account |
| EJU-16 | Aya — Backend/Dashboard | Backlog | — | ❌ | No account |
| EJU-17 | Zeina — Network/Security | Backlog | — | ❌ | No account |
| EJU-19 | Final Deliverables | Backlog | PHASE_PROGRESS_REPORT.md (v0.1.0) | ⚠️ | Phase 5 PENDING |

---

## 4. Consolidated gap register (dedup across sources)

| # | Gap | Source(s) | Owner | Blocking? |
|---|---|---|---|---|
| G-01 | `risk_grade_type`/`evidence_level_type` enums are placeholders — need Dr. Mohamed's validation (archive = the validation) | B §5b1, D §4.1–4.2 | Ahmed + Dr. Mohamed | **Yes** (pv_service, schema contract) |
| G-02 | `migration_002_eman_validation.sql` created but not applied | B §5b2 | Ahmed/Eman (SQL Editor) | Yes (Supabase state) |
| G-03 | `migration_003_fatma_validation.sql` does not exist | B §5b1, A (EJU-13) | Fatma/Ahmed | Yes |
| G-04 | Dr. Mohamed's package not committed / not attached to Linear | B §5b7, D §5 | Ahmed | Yes |
| G-05 | `reading_id` UUID vs string mismatch — rejects Fagr firmware | B §5d2 | Ahmed | Yes (IoT) |
| G-06 | `team_role` enum vs TEAM_CREDENTIALS role casts (INSERT would fail) | B §5d3 | Ahmed | Yes (seed/onboarding) |
| G-07 | `clinical_consequence` NOT NULL but archive never emits it → pv_service KeyError | D §4.3 | Ahmed | Yes (PV path) |
| G-08 | MCP tools `lookup_product` + `get_known_interaction` don't exist (name/ingredient, group-aware) | D §4.5 | Ahmed | Yes (integration) |
| G-09 | `pv_service` uses json_object + old 5-key parse; needs Structured Outputs + 13-key schema | D §4.7 | Ahmed | Yes |
| G-10 | Model decision (GPT-4o retired vs GPT-5.x) + key path (OpenAI vs OpenRouter) undecided | D §5.1–5.2, A | Ahmed + Dr. Mohamed | **Yes** (harness can't run as-is) |
| G-11 | No seed script for catalog(42)/interactions(20) into DB; group rules need expansion | D §5.5 | Ahmed | Yes (integration) |
| G-12 | No QC/purity backend (model/repo/router/endpoint) despite schema | B §5b4 | Ahmed/Eman | Medium |
| G-13 | Open security gaps: GAP-004/005/006/008/009/011/012/014 | B §5b3 | Ahmed/Zeina | Medium (deploy) |
| G-14 | Deployment not done: Render, seed, `.env` provisioning; PHASE_PROGRESS Phase 5 PENDING | B §5b5 | Ahmed/Aya | Medium |
| G-15 | `security/architecture_summary.md` stale (no-JWT claim, old table name) | B §5d1, §5d8 | Ahmed | Low |
| G-16 | PHASE_PROGRESS claims `alert_type` enum; TEAM_HANDOFF lists non-existent `test_drug.py`; README stub | B §5d4–5d6 | Ahmed | Low |
| G-17 | Existing tests assert old enum values → will break on severity swap | D §4.6/5.8 | Ahmed | When doing G-01 |
| G-18 | Harness needs `OPENAI_API_KEY`; project is OpenRouter-only | D §5.1 | Ahmed | For validation phase |
| G-19 | Duplicate Linear issues EJU-14 vs EJU-20 for Dr. Mohamed scope | A §6.2 | Ahmed | Low (hygiene) |
| G-20 | Omar's code not pushed to GitHub (only Linear reports) | A §4, B §4 | Omar/Ahmed | Medium (repo completeness) |

---

## 5. Bottom line

- **Infrastructure is done and single-authored (Ahmed);** the repo is genuinely complete for Phase 1–3 scaffolding.
- The **real blockers are integration & domain validation**, concentrated in the pharmacovigilance epic: model decision (G-10), Dr. Mohamed's package adoption (G-04, G-01), schema migration (G-07, G-09), and the 2 new MCP tools (G-08), plus two concrete DB/code bugs (G-05 reading_id, G-06 team_role).
- Every person's status on Linear differs from verifiable repo/archive evidence by at least one discrepancy — the Linear-Reporter's report must present **verified** status, not Linear claims.

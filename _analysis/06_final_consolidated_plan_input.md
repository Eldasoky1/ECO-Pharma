# 06 — Final Consolidated Plan Input (Merge-Agent-2)

**Inputs:** `05_merged_ground_truth.md` (Merge-Agent-1) · `03_session_reconciliation.md` (Sub-Agent C)
**Purpose:** De-duplicated, prioritized, verifiable task list for Ahmed (SAP-Agent source). Each task = one concrete deliverable with evidence + status + dependency.
**Generated:** 2026-08-09

---

## 1. De-duplication rules applied

- G-01 and G-10 (both Dr. Mohamed validation / model decision) kept separate — distinct decisions.
- G-17 folded INTO G-09 (test updates are part of the PV integration) — not a standalone task.
- `temp_mohamed/` duplicate of `_analysis/extracted_Mohamed_Ahmed_folder/` — merged into one "commit package" task (T-06); no double handling.
- EJU-14 vs EJU-20 (duplicate issues) — one hygiene task (T-14).
- Reading_id (G-05) + firmware payload questions merged into one IoT fix task (T-05).

---

## 2. Consolidated task list (Ahmed's actions, prioritized)

### P0 — Must do (blocking everything in pharmacovigilance epic)

| # | Task | Evidence / source | Depends on |
|---|---|---|---|
| T-01 | **Decide model + key path**: GPT-4o (retired) vs GPT-5.x; OpenAI key vs OpenRouter passthrough of `json_schema` strict | G-10, D §5.1–5.2, START_HERE step 1 | — |
| T-02 | **Apply migrations to Supabase** (SQL Editor): `migration.sql`, `iot_migration.sql`, `migration_002_eman_validation.sql` | G-02, G-05 (migration side), current DB state (team_members=6, all else 0) | — |
| T-03 | **Adopt Dr. Mohamed's interaction-risk package**: swap `pv_service.py` system prompt → `system_prompt.txt`; switch `response_format` json_object → Structured Outputs (13-key schema); fix `clinical_consequence` NOT NULL (nullable/synthesize) | G-04, G-07, G-09, D §4.3/4.7 | T-01 |
| T-04 | **Schema migration `migration_003_*`**: new severity values (MAJOR/MODERATE/MINOR/NONE_KNOWN or mapping), `confidence` column, `source`, `clinical_consequence` nullability, group-rule storage; update models + `_RISK_SORT_ORDER` + tests | G-01, G-17, D §4.1–4.2 | T-01 |
| T-05 | **Fix `reading_id` UUID-vs-string mismatch** (models/iot.py:31, iot_migration.sql, iot_repository.py vs iot_sensor_schema.json) so Fagr's `WOKWI-SIM-…` payloads pass; close IOT-009/011 (payload size) | G-05 | — |

### P1 — High

| # | Task | Evidence / source | Depends on |
|---|---|---|---|
| T-06 | **Commit Dr. Mohamed's package** (7 files) + `_analysis/` into repo on a new branch; move into production layout (e.g. `smart_eco_pharma/interaction_risk/`) | G-04, session reconciliation §1 | — |
| T-07 | **Add MCP tools `lookup_product` + `get_known_interaction`** (name/ingredient-string, group-aware, return `matched_rule`) in `mcp_server/tools/` + register in `server.py` | G-08, D §4.5 | T-04 |
| T-08 | **Seed script**: 42 products → `drug_master` (serialize `active_ingredients` array), 20 interactions (group-expanded) → `drug_interactions`; pharmacist/clinical review sign-off | G-11, D §5.5 | T-04 |
| T-09 | **Run validation harness** against live model (after T-01): 25/25 test set; port harness + test set into repo as regression suite | G-10, G-18 | T-01 |
| T-10 | **Fix `team_role` enum vs TEAM_CREDENTIALS** role casts (`technical_lead/qc_lead/pharmacist/iot_engineer` invalid) — reconcile enum or credential SQL + RLS keys | G-06 | — |

### P2 — Medium

| # | Task | Evidence / source | Depends on |
|---|---|---|---|
| T-11 | **QC/purity backend**: model/repository/router/endpoint for `purity_classification` | G-12 (GAPS #7) | — |
| T-12 | **Close open security gaps**: GAP-004 (LLM response validation), GAP-005 (prompt injection), GAP-006 (caller-provided alert flags), GAP-008 (rate limit), GAP-009 (IoT RLS), GAP-011/012/014; then run Zeina's audit | G-13 | T-03 (for 004/005) |
| T-13 | **Deploy**: Render web service + seed + `.env` provisioning; Phase 5 of PHASE_PROGRESS_REPORT | G-14 | T-02, T-08 |
| T-14 | **Linear hygiene**: resolve EJU-14 vs EJU-20 duplicate for Dr. Mohamed scope | G-19 | — |

### P3 — Low / hygiene (doc fixes, no code)

| # | Task | Evidence / source |
|---|---|---|
| T-15 | Rewrite `security/architecture_summary.md` auth section (JWT exists; correct `iot_readings` table name) | G-15 |
| T-16 | Fix PHASE_PROGRESS `alert_type` enum claim; remove phantom `test_drug.py` from TEAM_HANDOFF; write real README | G-16 |

---

## 3. PARKED (requires a teammate or external decision — NOT Ahmed-only)

| Item | Who | Reason | Source |
|---|---|---|---|
| `migration_003_fatma_validation.sql` | Fatma | Her domain validation, GAPS #8 | G-03 |
| Final `risk_grade` severity decision | Dr. Mohamed | Clinical authority; his package is the input | G-01 |
| Omar's Phase-1 code → GitHub push | Omar/Ahmed | Code lives only in Linear reports; repo incomplete | G-20 |
| Aya's frontend/dashboard integration | Aya | Awaiting Omar handover | EJU-16 |
| Zeina's security audit sign-off | Zeina | Audit checklist 8/14 unchecked | EJU-17 |
| Render deployment authorization | Ahmed/user | Deferred by user decision | G-14 |
| Model decision confirmation | Ahmed + Dr. Mohamed | START_HERE step 1 | G-10 |

---

## 4. Report scope (for Linear-Reporter, de-duplicated)

**Report content:** Verified cross-source status (Linear vs GitHub vs archive) + the 16 task plan + park list.
**Must NOT include (already posted):** Omar's Phase 1 Progress Report (EJU-11, 08-07), Omar's v3 progress (07-16), Omar's execution plan (07-16), Ahmed's kickoff status update (07-12), EJU-12/EJU-13 Q&A threads, Omar's EJU-14 blocker comment.
**New value delivered by this report:** the only cross-source verified matrix + consolidated task plan; first report from Ahmed on EJU-9/EJU-5/EJU-7 follow-up work.

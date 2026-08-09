# Sub-Agent B — Repo-Analyst: Raw Findings

**Scope:** READ-ONLY git analysis + GitHub API probe + file-tree/completeness map.
**Repo:** `C:\Users\engAh\OneDrive\Desktop\ECO PHARMA`
**Remote:** `https://github.com/Eldasoky1/ECO-Pharma.git`
**Generated:** 2026-08-09

---

## 1. Repo Overview (branches, remote, contributors)

| Item | Value |
|---|---|
| Current branch | `main` (only branch — local AND remote) |
| Remote | `origin → https://github.com/Eldasoky1/ECO-Pharma.git` |
| Default branch | `main` (confirmed via `git ls-remote`: `refs/heads/main → 0c44f5f`) |
| Tags | none |
| Remote refs | only `refs/heads/main` (no `refs/pull/*`, no feature branches, no tags) |
| Local ↔ remote sync | in sync — remote HEAD == local HEAD == `0c44f5f9657` |
| Total commits | 9 (all on `main`, date range 2026-07-15 → 2026-07-19) |
| Contributors (`git shortlog -sne --all`) | **1 author: `El-Dasoky <ahmed.320240024@ejust.edu.eg>` — 9 commits (100%)** |
| Working tree | clean, except untracked: `_analysis/` (this work) and `temp_mohamed/` (Dr. Mohamed's WIP validation package — NOT committed) |

### GitHub API status (important caveat)
- **The repo is PRIVATE.** Anonymous `https://api.github.com/repos/Eldasoky1/ECO-Pharma` → **404 Not Found**; GitHub user `Eldasoky1` exists publicly (name "El-Dasoky", 8 public repos, created 2025-11-27) but ECO-Pharma is not among them.
- The GitHub MCP tools (`github_list_commits`, `github_list_pull_requests`, `github_get_file_contents`, `github_search_code`, `github_list_issues`) all fail on this repo: "Not Found" / "Authentication Failed: Requires authentication". The configured token has **no access** to this private repo.
- `gh` CLI is not installed; no `GITHUB_TOKEN`/`GH_TOKEN` env vars set.
- **Consequence:** open PRs / issues / contributors from the API **could not be enumerated**. Authoritative source here is the **local git history** (verified identical to remote via `git ls-remote`). Because only `main` exists remotely and HEADs match, there are **no open PRs and no branches to inspect**; issues cannot be confirmed (no API access). Everything else below is from the working tree + git history, which are fully authoritative for content.

---

## 2. Full Commit Log (all 9 commits — 100% authored by Ahmed El-Desoky aka "El-Dasoky")

| Hash | Date (UTC+2) | Author | Message | Files changed |
|---|---|---|---|---|
| `0c44f5f` | 2026-07-19 23:47 | El-Dasoky | Update TEAM_HANDOFF.md: add Deliver To column; update Wokwi project info with both URLs | `TEAM_HANDOFF.md`, `iot/firmware/wokwi_project_info.txt` |
| `4bb6156` | 2026-07-19 23:35 | El-Dasoky | Merge branch 'main' of github.com:Eldasoky1/ECO-Pharma | — |
| `55c3ed7` | 2026-07-19 23:34 | El-Dasoky | Add Fagr's IoT firmware (Arduino sketch, Wokwi diagram, docs); update schema & examples to match actual implementation; update TEAM_HANDOFF.md with Fagr's progress | `TEAM_HANDOFF.md`, `iot/firmware/README.md`, `iot/firmware/libraries.txt`, `iot/firmware/sketch.ino`, `iot/firmware/wokwi_diagram.json`, `iot/firmware/wokwi_project_info.txt`, `iot/iot_example_alert.json`, `iot/iot_example_normal.json`, `iot/iot_sensor_schema.json` |
| `dd9577f` | 2026-07-18 14:38 | El-Dasoky | Update task statuses in TEAM_HANDOFF.md | `TEAM_HANDOFF.md` |
| `2894fb2` | 2026-07-18 14:22 | El-Dasoky | Update TEAM_HANDOFF.md: add team responsibility table, full repo map, update Eman status to VALIDATED | `TEAM_HANDOFF.md` |
| `ef7fff2` | 2026-07-18 14:20 | El-Dasoky | Add migration_002: Eman's test_method_type enum override; update schema_contract.md and GAPS.md | `docs/GAPS.md`, `smart_eco_pharma/schema/migration_002_eman_validation.sql`, `smart_eco_pharma/schema/schema_contract.md` |
| `ab454f2` | 2026-07-17 22:07 | El-Dasoky | Merge branch 'main' of github.com:Eldasoky1/ECO-Pharma | — |
| `fbdbb79` | 2026-07-17 21:59 | El-Dasoky | Smart Eco-Pharma Hub v0.1.0 | **Bulk commit — whole backend + schema + docs + iot + security + CI/CD** (all 60+ tracked files except README) |
| `9517043` | 2026-07-15 15:57 | El-Dasoky | Initial commit | `README.md` |

> Per-folder change weight: `smart_eco_pharma/` 44 file-changes, `iot/` 14, `TEAM_HANDOFF.md` 5, `docs/` 4, `security/` 3, root files 1 each.

---

## 3. File / Folder Structure Map (top 3 levels, with completeness)

```
ECO PHARMA/
├── README.md                     [1 line, empty stub — placeholder only]
├── .env.example                  [9 vars, no secrets — good]
├── .env                          [LOCAL, untracked, ignored; gap_list says key was removed, user must rotate]
├── .gitignore, .pytest_cache/, .ruff_cache/
├── Dockerfile                    [multi-stage py3.11-slim, non-root; GAP-015 fix applied]
├── render.yaml                   [Render.com free-tier web service config]
├── requirements.txt              [14 deps: fastapi, uvicorn, supabase, pydantic, openai, PyJWT, MCP, ruff/mypy/pytest]
├── fix_rls.sql                   [RLS recursion fix on team_members]
├── PHASE_PROGRESS_REPORT.md      [v0.1.0 status report, dated 2026-07-15]
├── TEAM_HANDOFF.md               [team task matrix, repo map, per-person actions — 271 lines]
├── TEAM_CREDENTIALS.md           [Supabase login creds for 6 members + INSERT SQL — DO NOT commit to public]
│
├── .github/workflows/ci.yml      [ruff → mypy → pytest → docker build on main; runs on push & PR-to-main]
│
├── smart_eco_pharma/             ★ backend — COMPLETE
│   ├── main.py                   [FastAPI app, 4 routers registered under /api/v1/*, /health, exception handlers]
│   ├── config.py                 [pydantic-settings, env vars, CORS parse]
│   ├── database.py               [anon + service Supabase clients]
│   ├── auth.py                   [JWT validation dependency (Supabase HS256), get_current_user]
│   ├── models/                   [Pydantic v2 — COMPLETE]
│   │   ├── drug.py               [DrugDetail/DrugList/DrugCreate]
│   │   ├── inventory.py          [OTCInventory models + ReorderStatus]
│   │   ├── interaction.py        [InteractionCheck (2–10 drugs), InteractionDetail]
│   │   ├── iot.py                [IoTSensorReadingRequest… NB: reading_id typed as UUID]
│   │   └── pharmacovigilance.py  [PVAnalysis/Response, ReportList]
│   ├── repositories/             [Supabase query layers — COMPLETE]
│   │   ├── drug_repository.py, inventory_repository.py, interaction_repository.py, iot_repository.py
│   ├── services/                 [business logic — COMPLETE]
│   │   ├── inventory_service.py, interaction_service.py, iot_service.py, pv_service.py (GPT-4o via OpenRouter)
│   ├── routers/                  [16 JWT-protected endpoints — COMPLETE]
│   │   ├── inventory.py (8), interactions.py (3), iot_ingestion.py (3), pharmacovigilance.py (2)
│   ├── mcp_server/               [COMPLETE]
│   │   ├── server.py             [4 read-only tools: lookup_drug_inventory, check_drug_interactions, get_risk_grade, get_iot_sensor_status]
│   │   └── tools/{inventory,interaction,risk_grade}_tools.py
│   ├── tests/                    [16 tests / 4 files — COMPLETE; TEAM_HANDOFF also references test_drug.py which DOES NOT EXIST]
│   │   ├── test_interactions.py (4), test_inventory.py (5), test_iot_ingestion.py (4), test_pv_pipeline.py (3)
│   └── schema/                   [DB contract — migrations written, NOT confirmed applied]
│       ├── migration.sql         [5 tables, 6 enums, triggers, ~26 RLS policies]
│       ├── iot_migration.sql     [2 tables iot_readings/iot_alerts + 6 RLS policies]
│       ├── migration_002_eman_validation.sql [Eman's test_method_type enum override — NOT YET APPLIED]
│       ├── schema_contract.md    [single source of truth — 5 tables, per-member ownership]
│       └── assumption_log.md     [20 domain assumptions]
│
├── iot/                          [Phase 2 — COMPLETE (backend contract) + FIRMWARE DONE]
│   ├── iot_sensor_schema.json    [payload JSON Schema; reading_id now "any unique string, UUID NOT required"]
│   ├── iot_example_normal.json / iot_example_alert.json
│   ├── assumption_log.md         [12 IoT assumptions, all OPEN]
│   ├── fagr_handoff_note.md      [integration guide]
│   └── firmware/                 [Fagr's work — committed by Ahmed]
│       ├── sketch.ino (194 lines, Arduino Uno + DHT22 + DS1307 + HX711 + buzzer, JSON over Serial)
│       ├── wokwi_diagram.json, libraries.txt, wokwi_project_info.txt [2 Wokwi URLs]
│       └── README.md             [pin map, thresholds, limitations, open questions]
│
├── docs/
│   ├── GAPS.md                   [8 gaps; Phase 1 sign-off status table]
│   ├── api_contract.md           [16 endpoints doc for Aya — COMPLETE]
│   └── mcp_tool_schemas.json     [4 MCP tool schemas]
│
├── security/
│   ├── architecture_summary.md   [⚠ STALE: still says "no JWT validation exists" — contradicts current code]
│   ├── gap_list.md               [15 gaps: 4 FIXED, 2 PARTIALLY, 7 OPEN, 3 accepted risks; summary table]
│   └── audit_signoff.md          [DRAFT — audit NOT conducted, pre-audit checklist 8/14 unchecked]
│
├── temp_mohamed/                 [⚠ UNTRACKED — Dr. Mohamed's WIP, not in git]
│   └── Interaction_Risk_Prompt_Templates.md, interaction_test_set.json (25 Qs),
│       output_schema.json, pharmacy_reference_data.json, system_prompt.txt, test_harness.py, START_HERE.md
│
└── _analysis/                    [UNTRACKED — agent analysis workspace incl. this file]
```

---

## 4. Per-Person Completed-Work Matrix (file paths + commit evidence)

> Every commit in the repo is authored by **Ahmed El-Desoky (`El-Dasoky <ahmed.320240024@ejust.edu.eg>`)**. Other team members' contributions exist only as content *attributed* in docs/commits, never as separate git authors.

| Person | Role | Work present in repo | Evidence / commit | Status in docs vs repo |
|---|---|---|---|---|
| **Ahmed El-Desoky** | Architect / owner | **The entire repo** — backend (`smart_eco_pharma/`), schema, docs, security, CI/CD, IoT contract | All 9 commits (`fbdbb79` bulk v0.1.0; `ef7fff2`; `55c3ed7`; docs updates) | Owner — ✅ all infra built |
| **Eman Ayman** | QA | `smart_eco_pharma/schema/migration_002_eman_validation.sql` (test_method → 7-value enum `test_method_type` + `test_method_other_description`), `schema_contract.md` §3 updated | `ef7fff2` (authored by Ahmed, "Eman's schema validation") | Docs say ✅ VALIDATED; **migration file created but NOT run in Supabase** (action item in TEAM_HANDOFF) |
| **Fagr Ahmed** | IoT/Hardware | `iot/firmware/*` (sketch.ino 194 lines, wokwi_diagram.json, libraries.txt, wokwi_project_info.txt, README.md); `iot_sensor_schema.json` relaxed to accept composite `reading_id` | `55c3ed7` (authored by Ahmed, "Add Fagr's IoT firmware") | Docs say ✅ FIRMWARE DONE; **payload-size + reading_id format still OPEN questions** |
| **Fatma Mohamed** | Clinical pharmacy | No files authored. Pending: `migration_003_fatma_validation.sql` (NOT created), threshold decisions | — | ⏳ PENDING (GAPS #3, #8; 10 assumptions) |
| **Dr. Mohamed Ibrahim** | Pharmacovigilance | No committed files. **WIP sits untracked in `temp_mohamed/`** (25-question test set, risk prompt templates, reference data, harness) — must be committed | untracked, no commit | ⏳ PENDING — `risk_grade` enum still PLACEHOLDER (GAPS #1, #4; ASSUMPTION-014) |
| **Zeina Wael** | Cybersecurity | No files authored; reads `security/*` (authored by Ahmed). Audit NOT done | — | ⏳ WAITING — pre-audit checklist 8/14 unchecked; `audit_signoff.md` still DRAFT |
| **Omar Hindawi** | Backend | Awareness only — no commits, no branches | — | 📖 no code pushed |
| **Aya El-Hariry** | Frontend | Awareness only — no commits, no branches | — | 📖 no code pushed |

---

## 5. Ahmed-Specific Section

### 5a. Completed files (100% his authorship — ready to reuse)

- **Backend (complete, testable):** `smart_eco_pharma/main.py`, `config.py`, `database.py`, `auth.py`; all 5 `models/*.py`; all 4 `repositories/*.py`; all 4 `services/*.py`; all 4 `routers/*.py` (16 JWT endpoints); `mcp_server/server.py` + 3 tool modules (4 MCP tools); `tests/*` (16 tests / 4 files).
- **Schema (written, unapplied):** `schema/migration.sql` (5 tables), `schema/iot_migration.sql` (2 tables), `schema/migration_002_eman_validation.sql`, `schema/schema_contract.md`, `schema/assumption_log.md`, root `fix_rls.sql`.
- **IoT contract:** `iot/iot_sensor_schema.json`, `iot/iot_example_normal.json`, `iot/iot_example_alert.json`, `iot/assumption_log.md`, `iot/fagr_handoff_note.md`, `iot/firmware/*` (Fagr's, committed by him).
- **Docs:** `docs/GAPS.md`, `docs/api_contract.md`, `docs/mcp_tool_schemas.json`, `TEAM_HANDOFF.md`, `TEAM_CREDENTIALS.md`, `PHASE_PROGRESS_REPORT.md`, `README.md` (stub).
- **Security:** `security/architecture_summary.md`, `security/gap_list.md`, `security/audit_signoff.md`.
- **Deploy/CI:** `Dockerfile`, `render.yaml`, `requirements.txt`, `.env.example`, `.github/workflows/ci.yml`.

### 5b. Remaining gaps / pending work (incomplete items visible in repo)

1. **Domain validation incomplete** (the stated purpose of Phase 4):
   - Fatma: `migration_003_fatma_validation.sql` **does not exist** (GAPS #8).
   - Dr. Mohamed: `risk_grade` enum values are **PLACEHOLDERS** (`grade_1_minimal…grade_4_contraindicated`) — patient-safety critical (GAPS #1, schema_contract §5, `pv_service.py:48`). His validation kit is stranded untracked in `temp_mohamed/`.
   - Fagr: `reading_id` format + payload size **still OPEN** (TEAM_HANDOFF IOT-009/011).
2. **`migration_002_eman_validation.sql` created but NOT applied** to Supabase (Eman's action item in TEAM_HANDOFF §1).
3. **Open security gaps** (gap_list.md): GAP-004 LLM response unvalidated, GAP-005 prompt injection, GAP-006 caller-provided alert flags, GAP-008 no rate limiting, GAP-009 permissive IoT RLS `WITH CHECK (true)`, GAP-011/012/014 (service_client leak, /health info leak, no max_length on clinical_context). Audit not performed; `audit_signoff.md` DRAFT.
4. **No QC/purity backend:** `purity_classification` has schema + migration but **no model/repository/router/endpoint** (GAPS #7).
5. **Deployment not done:** no evidence of Render deploy, seed data, or `.env` provisioning; `PHASE_PROGRESS_REPORT.md` Phase 5 = PENDING.
6. **Missing file referenced in docs:** `smart_eco_pharma/tests/test_drug.py` (TEAM_HANDOFF repo map lists it; it does not exist).
7. **`temp_mohamed/` uncommitted** — must be reviewed, committed, and wired to the pipeline.

### 5c. Exact files/branches to REUSE (Ahmed's)

- **Branch:** `main` only — no feature branches to merge; new work should branch from `main`.
- **Reuse as-is:** the full `smart_eco_pharma/` backend, `mcp_server/`, `tests/`, `Dockerfile`, `render.yaml`, `.github/workflows/ci.yml`, `docs/api_contract.md`, `docs/mcp_tool_schemas.json`, `iot/` contract + `firmware/`, `security/gap_list.md`.
- **Reuse after fixes:** `migration.sql`/`iot_migration.sql`/`migration_002_eman_validation.sql` (apply + verify); `TEAM_CREDENTIALS.md` (see §5d); `security/architecture_summary.md` (rewrite auth section); `iot/firmware/sketch.ino` + `models/iot.py` (see §5d); `temp_mohamed/*` (commit + integrate).

### 5d. Stated-vs-actual discrepancies (docs vs repo)

1. **`security/architecture_summary.md` is stale** — states "no JWT validation middleware exists" and "no authentication required on IoT endpoint", but `auth.py` + `Depends(get_current_user)` now protect **all 16 endpoints** (`gap_list.md` already records GAP-001/GAP-002 FIXED/PARTIAL).
2. **IoT `reading_id` mismatch — ingestion will reject Fagr's firmware:**
   - `iot_sensor_schema.json:32` + TEAM_HANDOFF: backend "accepts any unique string — UUID NOT required".
   - But `models/iot.py:31` types `reading_id: UUID`, `iot_migration.sql:3` uses `reading_id UUID UNIQUE`, and `iot_repository.py:31,40` does `UUID(reading_id)`.
   - Firmware emits composite `WOKWI-SIM-001-YYYYMMDDHHMMSS-SEQUENCE` → **fails Pydantic UUID validation → all readings rejected**. Must pick one: relax model+DB to TEXT or make firmware emit a UUID.
3. **`team_role` enum doesn't cover credential roles:** `migration.sql` enum = `architecture_lead, project_manager, qa_specialist, clinical_pharmacy, pharmacovigilance, frontend_engineer`, but `TEAM_CREDENTIALS.md` INSERT casts `technical_lead, qc_lead, pharmacist, iot_engineer` → **that SQL will fail** (invalid enum value) and RLS policies key on `architecture_lead/qa_specialist/clinical_pharmacy/pharmacovigilance`. Role names need reconciling.
4. **PHASE_PROGRESS_REPORT claims an `alert_type` enum** — no such enum exists; `iot_alerts.alert_type` is plain TEXT. (Also actual enum type names are `reorder_status_type`, `risk_grade_type`, `qc_test_status`.)
5. **TEAM_HANDOFF lists `test_drug.py`** in the repo map — file does not exist (actual: interactions/inventory/iot_ingestion/pv_pipeline).
6. **README.md is a 1-line stub** despite PHASE_PROGRESS claiming documentation complete.
7. **Migration applied-status unknown/implied:** docs say `migration.sql`/`iot_migration.sql` "already run" by Ahmed; `migration_002` explicitly not yet applied. No `schema_migrations` table or `migrations/` folder to verify programmatically.
8. **`architecture_summary.md` still references old `iot_sensor_readings`** table name in data-flow section (GAP-010 says code was fixed to `iot_readings`; this doc wasn't).

---

## 6. Bottom line

- One author (**Ahmed El-Desoky**, ejust email) built the entire repo across 9 commits on a single `main` branch, 2026-07-15 → 07-19. No PRs/branches/issues visible (repo private; API inaccessible; remote has only `main`).
- Backend, IoT contract, security review docs, CI/CD are **complete and high quality**; the blocking work is **domain validation (Fatma, Dr. Mohamed, Fagr confirmations), applying migration_002, closing GAP-004/005/006, and deployment**.
- Two concrete code-level bugs to fix before anything talks to the DB or the simulator: the `reading_id` UUID-vs-string mismatch and the `team_role` enum / TEAM_CREDENTIALS role mismatch.
- Dr. Mohamed's validation work exists only as an untracked `temp_mohamed/` folder — commit it.

# Action Matrix — Who Does What Next (2026-08-09)

> After today's session (professional report: `2026-08-09_professional_report.md`).
> **Delivery rule:** Reviews/decisions → **reply to Ahmed** (Linear/email). Code → **push to GitHub on a branch + open PR** — Ahmed reviews and merges. New migrations → put the `.sql` in `smart_eco_pharma/schema/` and tell Ahmed to apply via Supabase.
> Column `Depends On` = needs that person's output first.

## Now (Ahmed, immediate)

| # | Task | Files involved (repo) | Definition of Done | Depends On |
|---|---|---|---|---|
| 1 | Review & merge PR #1 | `TEAM_HANDOFF.md`, `05_Reports_And_Comms/`, `_analysis/`, `smart_eco_pharma/schema/migration_003_interaction_risk.sql` | Merged to `main` | — |
| 2 | Finalize model decision → set `OPENROUTER_MODEL` (harness) + `GPT_MODEL` (pv_service) | `smart_eco_pharma/config.py`, `smart_eco_pharma/interaction_risk/test_harness.py`, `.env` | Harness runs on chosen model, not legacy GPT-4o | Dr. Mohamed (sign-off) |
| 3 | Seed script (42 products / 20 interactions) | `smart_eco_pharma/schema/` (new seed file), `pharmacy_reference_data.json` | DB non-empty; verified by query | — |
| 4 | MCP `lookup_product` + `get_known_interaction` tools | `smart_eco_pharma/mcp_server/tools/inventory_tools.py`, `interaction_tools.py` | Tools callable from MCP; tested | — |
| 5 | Deploy to Render (env + seed) | `Dockerfile`, `render.yaml`, `.env` | Live endpoint smoke-tested | — |

## This week (team)

| Team Member | Role | Files They Will Work With (repo) | Next task | Deliver To (When Done) | Depends On |
|---|---|---|---|---|---|
| **Dr. Mohamed Ibrahim** | Pharmacovigilance & AI Research | `03_Interaction_Risk_Module/output_schema.json`, `smart_eco_pharma/schema/schema_contract.md` §5, `smart_eco_pharma/schema/assumption_log.md`, `docs/GAPS.md` | Confirm severity + `NONE_KNOWN` representation; decide EJU-14 vs EJU-20 | **Reply to Ahmed** (Linear EJU-14) | — |
| **Fatma Mohamed** | Clinical Pharmacy / Inventory | `smart_eco_pharma/schema/schema_contract.md` §4, `smart_eco_pharma/schema/assumption_log.md`, `iot/assumption_log.md` | Submit `migration_003_fatma_validation.sql` (tolerance schema) | **Send `.sql` to Ahmed** → Ahmed applies + verifies | — |
| **Eman Ayman** | QA / Quality Control | `smart_eco_pharma/schema/migration_002_eman_validation.sql`, `smart_eco_pharma/schema/schema_contract.md` §3 | Confirm `test_method_type` (already applied) works in deployed DB | **Reply to Ahmed** | — |
| **Fagr Ahmed** | IoT / Hardware Engineer | `iot/firmware/sketch.ino`, `iot/firmware/wokwi_diagram.json`, `iot/firmware/README.md`, `iot/iot_sensor_schema.json`, `iot/iot_example_normal.json`, `iot/iot_example_alert.json` | Confirm Wokwi string payloads (`WOKWI-SIM-001-…`) ingest against TEXT `reading_id` (now supported) | **Reply to Ahmed** + push firmware updates via PR | Ahmed (deploy) |
| **Omar Hindawi** | Backend Developer | `smart_eco_pharma/models/*.py`, `smart_eco_pharma/routers/*.py`, `smart_eco_pharma/services/*.py`, `docs/api_contract.md` | Push Phase 1 code; align risk output to `severity`/`source`/`confidence` | **Push to GitHub** — branch + PR → Ahmed merges | Dr. Mohamed |
| **Aya El-Hariry** | Frontend Developer | `docs/api_contract.md`, `docs/mcp_tool_schemas.json`, `smart_eco_pharma/schema/schema_contract.md` | Wire `severity`/`source`/`confidence` + archive-style risk display | **Push to GitHub** — branch + PR → Ahmed merges | Ahmed (deploy) |
| **Zeina Wael** | Cybersecurity Auditor | `security/architecture_summary.md`, `security/gap_list.md`, `security/audit_signoff.md`, `smart_eco_pharma/auth.py` | Security audit of new columns + RLS on `drug_interactions` | **Reply to Ahmed** (sign-off) or push to GitHub | — |

## Backlog / stretch

| Owner | Task | Files involved (repo) | Definition of Done | Depends On |
|---|---|---|---|---|
| **Ahmed** | Close GAP-004/005/006/008/009/011/012/014; refresh stale docs | `docs/GAPS.md`, `TEAM_HANDOFF.md`, `PHASE_PROGRESS_REPORT.md`, `README.md`, `security/architecture_summary.md` | Docs updated; gaps closed or re-scoped | All of the above |
| **Ahmed + Dr. Mohamed** | Run full 25/25 harness on final model | `smart_eco_pharma/interaction_risk/test_harness.py`, `interaction_test_set.json` | 25/25 pass recorded | Model decision |

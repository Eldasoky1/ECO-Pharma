# Action Matrix — Who Does What Next (2026-08-09)

> After today's session (full report: `2026-08-09_full_session_report.md`).
> Column `Depends On` = needs that person's output first.

## Now (immediate, today/tomorrow)

| Owner | Must do now | Evidence / Definition of Done | Depends On |
|---|---|---|---|
| **Ahmed** | 1) Commit uncommitted Supabase-adoption work (10 files + `migration_003_interaction_risk.sql`) and open the PR | Branch pushed; PR URL returned; CI passes | — |
| **Ahmed** | 2) Finalize model decision → set `OPENROUTER_MODEL` (harness) + `GPT_MODEL` (pv_service) | Harness runs with chosen model, not legacy GPT-4o | Dr. Mohamed (sign-off) |
| **Ahmed** | 3) Add seed script (42 products / 20 interactions) so `drug_interactions` is non-empty | Script committed; DB verified by query | — |
| **Ahmed** | 4) Add MCP `lookup_product` + `get_known_interaction` tools | Tools callable from MCP; tested | — |
| **Ahmed** | 5) Deploy to Render (env + seed) | Live endpoint smoke-tested | — |

## This week

| Owner | Must do | Evidence / Definition of Done | Depends On |
|---|---|---|---|
| **Dr. Mohamed** | Confirm severity + `NONE_KNOWN` representation & EJU-14 vs EJU-20 (reply on EJU-14 comment) | Signed-off decision recorded | — |
| **Fatma** | Submit `migration_003_fatma_validation.sql` (tolerance/validation schema) | File in `schema/`; applied + verified via query | — |
| **Eman** | Confirm `test_method_type` migration behaves correctly in deployed DB | Live query on `purity_classification.test_method` | — |
| **Fagr** | Confirm Wokwi payloads (`WOKWI-SIM-001-…`) ingest against TEXT `reading_id` | A row with a string `reading_id` in `iot_readings` | Ahmed (deploy) |
| **Omar** | Push Phase 1 code; align any risk output with new `severity`/`source`/`confidence` columns | Code on GitHub; tests 10/10 on branch | Dr. Mohamed |
| **Aya** | Frontend integration of new fields (severity/source/confidence) in UI + archive-style risk display | Screens wired; demo visible | Ahmed (deploy) |
| **Zeina** | Security audit of new columns + RLS on `drug_interactions` | Advisory/screen report filed | — |

## Backlog / stretch

| Owner | Must do | Evidence / Definition of Done | Depends On |
|---|---|---|---|
| **Ahmed** | Close GAP-004/005/006/008/009/011/012/014; refresh stale docs (TEAM_HANDOFF, PHASE_PROGRESS, README, architecture_summary) | Docs updated; gaps closed or re-scoped | All of the above |
| **Ahmed + Dr. Mohamed** | Run full 25/25 harness on final model | 25/25 pass recorded | Model decision |

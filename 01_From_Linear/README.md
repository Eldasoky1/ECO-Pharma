# 01 — From Linear

This folder is a pointer layer for the **Smart Eco-Pharma Hub** Linear project
(`https://linear.app/ejust`, team `EJU`). Canonical issue data lives in Linear;
this folder maps each issue to where its evidence sits in the workspace.

## Issue → evidence map

| Issue | Title | Status | Evidence location |
|---|---|---|---|
| EJU-6 | Project Setup & Execution Plan | Backlog | `00_Project_Overview/`, `TEAM_HANDOFF.md` |
| EJU-5 | Constraints & Schema/RLS | Done | `smart_eco_pharma/schema/migration.sql`, `fix_rls.sql` |
| EJU-7 | API & Data Contracts | Done | `docs/api_contract.md`, `docs/mcp_tool_schemas.json` |
| EJU-8 | Guide Integration & Reviews | Backlog | `docs/GAPS.md`, `TEAM_HANDOFF.md` |
| EJU-9 | Integrate GPT-4o & Build MCP Server | Done | `smart_eco_pharma/services/pv_service.py`, `smart_eco_pharma/mcp_server/` |
| EJU-10 | Support Security & Final Narrative | Backlog | `security/` |
| EJU-19 | Final Deliverables | Backlog | `PHASE_PROGRESS_REPORT.md` |
| EJU-11 | Omar — Python & Sprint Mgmt | In Progress | Linear (reports); code not yet in repo |
| EJU-12 | Eman — QC/Purity | Done | `smart_eco_pharma/schema/migration_002_eman_validation.sql` |
| EJU-13 | Fatma — OTC/Inventory | Done | Linear (tolerance CSV); `migration_003` pending |
| EJU-14 | Dr. Mohamed — PV Research | Backlog | `03_Interaction_Risk_Module/` |
| EJU-20 | Dr. Mohamed — PV (dup) | Done | `03_Interaction_Risk_Module/` |
| EJU-15 | Fagr — Wokwi/Arduino | Backlog | `iot/firmware/` |
| EJU-16 | Aya — Backend/Dashboard | Backlog | — |
| EJU-17 | Zeina — Network/Security | Backlog | — |

## Notes
- Duplicate issues: **EJU-14 vs EJU-20** both cover Dr. Mohamed's pharmacovigilance scope (see `_analysis/05_merged_ground_truth.md`).
- Existing Linear reports (do not duplicate): Omar's Phase 1 Progress Report (EJU-11, 08-07), Omar's v3 progress (07-16), Ahmed's Kickoff status update (07-12).

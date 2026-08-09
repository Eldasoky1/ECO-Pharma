# 07 — SAP-Agent Execution Plan

**Input:** `06_final_consolidated_plan_input.md` (16 tasks + park list)
**Outputs:** (1) reorganized OneDrive workspace, (2) updated GitHub repo, (3) new non-duplicate Linear report.
**Generated:** 2026-08-09

---

## Phase A — Workspace organization (executed by Orchestrator now)

### A1. Folder structure (create in `C:\Users\engAh\OneDrive\Desktop\ECO PHARMA`)

```
ECO PHARMA/
├── 00_Project_Overview/        → 07_SAP_Agent_Execution_Plan.md, README, PHASE_PROGRESS_REPORT.md, TEAM_HANDOFF.md, TEAM_CREDENTIALS.md (NOTE: creds stay LOCAL, do not commit)
├── 01_From_Linear/             → mirrors of issue scope (empty placeholders + pointer to Linear)
├── 02_From_Repo/               → docs/, security/, iot/ contract, smart_eco_pharma/ (moved)
├── 03_Interaction_Risk_Module/ → Mohamed's package (7 files) + integration notes
├── 04_Ahmed_Working_Files/     → scratch for Ahmed's new code (migrations, seed, MCP tools)
├── 05_Reports_And_Comms/       → Linear reports (incl. the new one)
└── _analysis/                  → raw sub-agent notes (kept as-is, untracked)
```

> **Decision (SAP-Agent):** MOVE is a *view* reorganization. To keep git history clean, the canonical code stays under its current paths; the top-level `00–05` folders are **overlays that reference / duplicate select content**. Per rule "never delete/overwrite", nothing is deleted — only added/copied where it adds value.

### A2. Moves (this session)
1. Move `temp_mohamed/*` → `03_Interaction_Risk_Module/` (7 files, dedupe with extracted copy).
2. Move `_analysis/extracted_Mohamed_Ahmed_folder/*` → `03_Interaction_Risk_Module/` (identical files — use one canonical set).
3. Keep `_analysis/` for raw analysis only (01–07 .md files).
4. `_analysis/07_SAP_Agent_Execution_Plan.md` → also copy into `00_Project_Overview/`.

### A3. Placeholders / pointers
- `01_From_Linear/README.md` — table: issue → status → where evidence lives.
- `02_From_Repo/README.md` — map to existing repo paths (no duplication of 60+ files).
- `05_Reports_And_Comms/` — holds the drafted Linear report text for approval.

---

## Phase B — Repo update (Repo-Updater; confirmation gate)

### B1. Branch
- Name: `ahmed-eldesoky/progress-update-2026-08-09` (branch from `main`).

### B2. Commit content (proposal — user reviews)
1. `smart_eco_pharma/interaction_risk/` — Mohamed's 7 files (canonical copy from `03_Interaction_Risk_Module/`).
2. `_analysis/` → `.analysis/`? **NO** — analysis stays out of repo unless user requests; instead commit a condensed `docs/AGENT_SESSION_2026-08-09.md` summarizing findings (or defer).
3. **Do NOT commit:** `.env`, `TEAM_CREDENTIALS.md`, `00_Project_Overview/TEAM_CREDENTIALS.md` (secrets).
4. Optional: seed/`migration_003_*` drafts — only if created this session (not yet).

### B3. Commit message (draft)
```
Add Dr. Mohamed's interaction-risk package + agent session notes

- Integrate Interaction Risk prompt/schema/reference-data/test-set/harness
  (7 files) under smart_eco_pharma/interaction_risk/
- Document cross-source status (Linear vs GitHub vs archive) for Phase 1-3
- Prepares migration_003 (severity), MCP lookup_product/get_known_interaction,
  seed script (see docs/AGENT_SESSION_2026-08-09.md)

Branch: ahmed-eldesoky/progress-update-2026-08-09
```

### B4. Push & PR (only after user confirms)
- `git push -u origin ahmed-eldesoky/progress-update-2026-08-09`
- PR title: `Dr. Mohamed interaction-risk integration + session report (2026-08-09)`
- PR body = condensed report; assign reviewer Ahmed; base `main`.
- ⚠️ PRIVATE repo + no API token → PR may need to be created via web/`gh` by user. Orchestrator will attempt; if API fails, hand user the exact command.

---

## Phase C — Linear report (Linear-Reporter; confirmation gate)

### C1. Where to post
- Primary: **EJU-9** (Integrate GPT-4o & Build MCP Server — Done but unreported) as a **comment** (progress report), OR a new issue. Recommend: comment on EJU-9 + comment on EJU-14 (attach Mohamed package reference). Decide with user.

### C2. Content (de-duplicated — see 06 §4)
- Verified status matrix (Linear vs GitHub vs archive) — condensed.
- 16-task plan (P0/P1/P2/P3) + park list.
- Blockers: model decision, OPENAI_API_KEY, migrations not applied, EJU-14/20 duplicate.
- Links/references to existing reports (do not re-quote Omar's).

### C3. Approvals required before posting
1. User approves report text.
2. User approves target issue(s).

---

## Phase D — Final summary
- "Actions Taken vs Actions Blocked" checklist delivered to user in chat.
- Note: `.env`/creds never committed; `TEAM_CREDENTIALS.md` excluded from git.

---

## Phase E — Deferred (needs user/teammate)
- Render deploy, Supabase SQL Editor runs, model decision, OpenAI key provisioning, Fatma migration_003, Omar code push, Zeina audit, Aya integration.

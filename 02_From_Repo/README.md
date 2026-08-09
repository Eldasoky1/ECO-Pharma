# 02 — From Repo

Pointer layer for canonical repo content. Files are NOT duplicated here —
they live at the paths shown below (repository root `C:\Users\engAh\OneDrive\Desktop\ECO PHARMA`).

## Map

| Area | Canonical path |
|---|---|
| Backend (FastAPI, 16 JWT endpoints) | `smart_eco_pharma/` |
| MCP server (4 tools) | `smart_eco_pharma/mcp_server/` |
| Schema migrations (Phase 1–2) | `smart_eco_pharma/schema/` |
| IoT contract + firmware (Fagr) | `iot/` |
| Docs & API contract | `docs/` |
| Security review | `security/` |
| CI/CD + deploy | `.github/workflows/ci.yml`, `Dockerfile`, `render.yaml`, `requirements.txt` |

## Interaction Risk Module (Dr. Mohamed)
- Canonical copy moved to `03_Interaction_Risk_Module/` (see that folder).

## Git notes
- Single `main` branch; 9 commits, all authored by Ahmed El-Desoky.
- `TEAM_CREDENTIALS.md` and `.env` are LOCAL ONLY — never commit.
- Known bugs (see `_analysis/02_github_findings.md` §5d): `reading_id` UUID mismatch; `team_role` enum vs credential roles.

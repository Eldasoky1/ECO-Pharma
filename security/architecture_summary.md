# Smart Eco-Pharma Hub — Architecture Summary for Security Review

## 1. System Overview

The Smart Eco-Pharma Hub is a backend platform that manages pharmaceutical drug catalogues, OTC inventory levels, drug-drug interaction databases, IoT cold-chain sensor ingestion, and AI-powered pharmacovigilance analysis. It serves a small internal team (architecture lead, project manager, QA specialist, clinical pharmacy, pharmacovigilance officer, frontend engineer) through a web dashboard and exposes an MCP server for AI agent tool-use. The system stores drug master records, purity classifications, inventory stock with storage conditions, drug interaction risk grades (including GPT-4o-generated assessments), IoT temperature/humidity sensor readings, and alert records. It runs on a zero-budget stack: FastAPI on Render (free tier), Supabase free tier (PostgreSQL 15+), OpenRouter for GPT-4o API access, and GitHub Actions for CI.

## 2. System Components

| Component | Role | Internet-Facing | Third-Party |
|---|---|---|---|
| FastAPI (Render free tier) | REST API serving all business logic, hosted via Docker | Yes — public URL with `/health`, `/api/v1/*` endpoints | No |
| Supabase (PostgreSQL + PostgREST) | Persistent data store for all tables; RLS enforced at DB level | Yes — Supabase project URL used by backend | Yes — Supabase |
| OpenRouter / GPT-4o API | LLM provider for pharmacovigilance drug-interaction analysis | No — outbound HTTPS only | Yes — OpenRouter |
| MCP Server (stdio transport) | Model Context Protocol server exposing read-only tools for AI agents | No — local stdio only | No |
| GitHub Actions CI | Lint (ruff), type-check (mypy), test (pytest), Docker build on main | No — runner-hosted | Yes — GitHub runners |
| Wokwi IoT Simulator | Simulates edge sensor devices transmitting readings to the ingestion endpoint | No — generates outbound HTTP POST | Yes — Wokwi (simulated device) |

## 3. Data Flow

### (a) Team member accessing dashboard

1. User authenticates on the frontend (Supabase Auth — outside this backend's scope).
2. Frontend sends HTTP request to `https://<render-url>/api/v1/inventory/drugs` (and similar endpoints).
3. FastAPI receives the request. Currently, **no JWT validation middleware exists** in the backend; RLS is the only access control layer.
4. FastAPI calls Supabase via `anon_client` (which carries the Supabase anonymous key, subject to RLS).
5. Supabase PostgREST evaluates RLS policies based on `auth.uid()` in the request context.
6. Response returned to frontend.

### (b) IoT sensor reading

1. Wokwi simulator (or real device) sends `POST /api/v1/iot/readings` with a JSON body containing `reading_id`, `device_id`, `storage_location_id`, `sensor_payload`, `alert_flags`, etc.
2. FastAPI receives the request. **No authentication is required** on this endpoint.
3. `IoTService.ingest_reading()` calls `iot_repository.store_reading()`.
4. Repository uses `service_client` (bypasses RLS) to check for duplicate `reading_id` and insert the row into `iot_readings`.
5. If `alert_flags` indicate threshold breaches, `iot_repository.create_alert()` inserts into `iot_alerts` (also via `service_client`).
6. If `inventory_threshold_breached` is true, `inventory_repository.update_reorder_status()` updates `otc_inventory` via `service_client`.
7. Response returned to the IoT device.

### (c) AI agent using MCP

1. An AI agent (e.g., Claude Desktop) connects to the MCP server via stdio transport.
2. MCP server registers three read-only tools: `lookup_drug_inventory`, `check_drug_interactions`, `get_risk_grade`.
3. Agent calls a tool (e.g., `get_risk_grade` with `drug_a_id` and `drug_b_id`).
4. MCP server creates a Supabase client using `SUPABASE_ANON_KEY` and queries the relevant table.
5. Results returned as `TextContent` JSON to the agent.

## 4. Trust Boundaries

### Internet boundary

The FastAPI application on Render is the only internet-exposed component. All `/api/v1/*` endpoints and `/health` are publicly accessible without authentication. Supabase is accessed only by the backend (server-side) and by the frontend (client-side, via Supabase Auth — outside scope).

### Authentication boundary

**Currently undefined in the backend.** The FastAPI app has no JWT validation middleware, no `Depends(get_current_user)` dependency, and no session verification. The entire authentication boundary relies on Supabase RLS policies, which check `auth.uid()` — but since the backend uses `anon_client` and `service_client` without passing user JWTs, RLS is effectively not enforced for backend-originated requests. Authentication is only enforced if the frontend passes a user's Supabase JWT to the backend, which is not implemented.

### Database boundary

Supabase Row-Level Security (RLS) is the primary data-access control. Tables `team_members`, `drug_master`, `purity_classification`, `otc_inventory`, `drug_interactions` have RLS enabled with `deny_anon` policies and role-based policies. Tables `iot_readings` and `iot_alerts` have RLS enabled but with a `service_insert` policy using `WITH CHECK (true)`, meaning any authenticated session can insert. The `service_client` (service-role key) bypasses all RLS.

### Third-party API boundary

Data leaves the system when GPT-4o is called via OpenRouter. The pharmacovigilance pipeline sends drug names, active ingredients, drug classes, routes of administration, and optional clinical context text to OpenRouter's API. The LLM response (risk grade, clinical consequence, etc.) is parsed and persisted. The OpenRouter API key is stored in environment variables and `.env`.

## 5. What Is NOT in Scope

| Missing Control | Reason |
|---|---|
| Web Application Firewall (WAF) | Zero-budget constraint — Render free tier does not include WAF |
| Network-layer firewall / security groups | Render free tier does not expose network configuration |
| Paid monitoring or alerting (Datadog, Sentry, etc.) | Zero-budget constraint — no paid observability tools |
| DDoS protection / rate limiting | No CDN, no Cloudflare, no rate-limit middleware in FastAPI |
| Secrets rotation | No automated key rotation for Supabase or OpenRouter keys |
| Penetration testing | Budget and timeline constraint — this document serves as the pre-audit readiness review |
| Frontend security review | Frontend is outside the scope of this backend security review |
| Supabase Auth implementation | Handled client-side in the frontend; backend trusts RLS |

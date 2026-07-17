# Smart Eco-Pharma Hub — Security Gap List

Ranked by exploitability (most exploitable first). Each gap maps to specific files, endpoints, or configurations in the codebase.

---

## GAP-001 | No JWT Authentication on Any API Endpoint

| Field | Value |
|---|---|
| **Exploitability** | HIGH |
| **Status** | FIXED |
| **Files** | `auth.py`, `routers/inventory.py`, `routers/interactions.py`, `routers/iot_ingestion.py`, `routers/pharmacovigilance.py` |
| **Description** | No FastAPI dependency or middleware validates JWTs. Every endpoint under `/api/v1/*` is callable by any HTTP client without credentials. |
| **Resolution** | Implemented `auth.py` with `get_current_user` dependency using PyJWT + Supabase JWT decoding. All 16 endpoints across 4 routers now require `Depends(get_current_user)`. Requests without valid JWT return 401. |

---

## GAP-002 | IoT Ingestion Endpoint Unauthenticated

| Field | Value |
|---|---|
| **Exploitability** | HIGH |
| **Status** | PARTIALLY FIXED |
| **Files** | `routers/iot_ingestion.py` |
| **Description** | `POST /api/v1/iot/readings` accepts sensor data from any HTTP client. No device-specific authentication (API key/HMAC). |
| **Resolution** | Router now requires JWT auth via `Depends(get_current_user)`. Device-specific authentication (HMAC/API key) is deferred — requires device registration flow. |

---

## GAP-003 | Real OpenRouter API Key Present in `.env` File

| Field | Value |
|---|---|
| **Exploitability** | HIGH |
| **Status** | FIXED — Old key removed from all files; user must revoke in OpenRouter dashboard |
| **Files** | `.env:4` |
| **Description** | The `.env` file contains a live OpenRouter API key. `.gitignore` excludes `.env` but the file exists on the developer's filesystem. |
| **Action Required** | Rotate the exposed OpenRouter API key via OpenRouter dashboard. Set new key directly in Render environment variables. |

---

## GAP-004 | LLM Response Written to Database Without Schema Validation

| Field | Value |
|---|---|
| **Exploitability** | MEDIUM |
| **Status** | OPEN |
| **Files** | `services/pv_service.py:141-160` |
| **Description** | After calling GPT-4o via OpenRouter, `pv_service.py` parses the JSON response and writes fields directly to `drug_interactions`. The `risk_grade` value is not validated against the `RiskGrade` enum before insertion. |
| **My Action** | Add Pydantic validation of the LLM response using a `PVAnalysisResult` model with `RiskGrade` and `EvidenceLevel` enum fields. |

---

## GAP-005 | Prompt Injection via `clinical_context`

| Field | Value |
|---|---|
| **Exploitability** | MEDIUM |
| **Status** | OPEN |
| **Files** | `routers/pharmacovigilance.py:20-30`, `services/pv_service.py:84-87,118-138` |
| **Description** | The `clinical_context` field is injected verbatim into the GPT-4o user message. An attacker could craft input that instructs the LLM to ignore the system prompt. |
| **My Action** | Enforce `max_length=500` on `clinical_context`, strip control characters, wrap user input in delimiters. |

---

## GAP-006 | IoT `alert_flags` Are Caller-Provided, Not Server-Computed

| Field | Value |
|---|---|
| **Exploitability** | MEDIUM |
| **Status** | OPEN |
| **Files** | `models/iot.py:23-27`, `services/iot_service.py:28-57` |
| **Description** | The `alert_flags` object is provided by the IoT device and trusted without verification. A malicious device can trigger false alerts or reorder status changes. |
| **My Action** | Compute alert flags server-side: fetch `otc_inventory` record, compare sensor data against storage thresholds, ignore caller-provided `alert_flags`. |

---

## GAP-007 | `storage_location_id` Not Validated Against Known Locations

| Field | Value |
|---|---|
| **Exploitability** | MEDIUM |
| **Status** | PARTIALLY FIXED |
| **Files** | `services/iot_service.py` |
| **Description** | The `storage_location_id` field is a free-text string never validated against known storage locations. |
| **Resolution** | IoT service now validates `storage_location_id` against `otc_inventory` via `inventory_repository.get_otc_by_location()`. Unknown locations trigger an `unknown_location` alert instead of being silently accepted. |

---

## GAP-008 | No Rate Limiting on Any Endpoint

| Field | Value |
|---|---|
| **Exploitability** | MEDIUM |
| **Status** | OPEN — ACCEPTED (zero-budget) |
| **Files** | `main.py` |
| **Description** | No rate-limiting middleware is configured. An attacker can flood endpoints to exhaust Supabase quotas or OpenRouter credits. |
| **My Action** | Add `slowapi` rate-limit middleware. Apply per-IP limits: 100 req/min for reads, 10 req/min for IoT ingestion, 5 req/min for pharmacovigilance. |

---

## GAP-009 | IoT RLS Insert Policy Allows Any Authenticated User

| Field | Value |
|---|---|
| **Exploitability** | MEDIUM |
| **Status** | OPEN |
| **Files** | `schema/iot_migration.sql:35-36` |
| **Description** | `service_insert_iot_readings` policy uses `WITH CHECK (true)`, meaning any authenticated Supabase user can insert rows into `iot_readings`. |
| **My Action** | Restrict IoT insert policies to service-role only. Since IoT writes use `service_client` (bypasses RLS), remove overly permissive `WITH CHECK (true)` policies. |

---

## GAP-010 | Table Name Mismatch: `iot_readings` vs `iot_sensor_readings`

| Field | Value |
|---|---|
| **Exploitability** | MEDIUM |
| **Status** | FIXED |
| **Files** | `repositories/iot_repository.py`, `mcp_server/tools/risk_grade_tools.py` |
| **Description** | Migration SQL creates `iot_readings` but Python code referenced `iot_sensor_readings`. |
| **Resolution** | All Python code now uses `iot_readings` consistently. Verified zero references to `iot_sensor_readings` in codebase. |

---

## GAP-011 | `service_client` Usage in `pv_service.get_drug_reports()` Without Justification

| Field | Value |
|---|---|
| **Exploitability** | LOW |
| **Status** | OPEN |
| **Files** | `services/pv_service.py:179-186` |
| **Description** | `get_drug_reports()` uses `service_client` (bypasses RLS) for a read-only operation that could use `anon_client`. |
| **My Action** | Add justification comment or switch to `anon_client` when JWT auth is in place. |

---

## GAP-012 | `/health` Endpoint Leaks Version and Environment

| Field | Value |
|---|---|
| **Exploitability** | LOW |
| **Status** | OPEN |
| **Files** | `main.py:122-128` |
| **Description** | `GET /health` returns version and environment to unauthenticated callers. |
| **My Action** | In production, return only `{"status": "ok"}`. Conditionally include version/environment only when `APP_ENV != "production"`. |

---

## GAP-013 | CORS `allow_methods` and `allow_headers` Set to `["*"]`

| Field | Value |
|---|---|
| **Exploitability** | LOW |
| **Status** | ACCEPTED RISK |
| **Files** | `main.py:80-86` |
| **Description** | `allow_methods=["*"]` and `allow_headers=["*"]` are overly permissive. |
| **My Action** | Narrow `allow_methods` to `["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]` and `allow_headers` to `["Authorization", "Content-Type"]`. |

---

## GAP-014 | No Input Length Validation on `clinical_context`

| Field | Value |
|---|---|
| **Exploitability** | LOW |
| **Status** | OPEN |
| **Files** | `models/pharmacovigilance.py:13` |
| **Description** | The `clinical_context` field has no max length. An attacker could send megabyte-scale strings to consume API credits. |
| **My Action** | Add `Field(max_length=500)` to `clinical_context` in `PVAnalysisRequest`. |

---

## GAP-015 | Dockerfile Copies `.env.example` as `.env`

| Field | Value |
|---|---|
| **Exploitability** | LOW |
| **Status** | FIXED |
| **Files** | `Dockerfile:11` |
| **Description** | `COPY .env.example .env` placed placeholder credentials inside the Docker image. |
| **Resolution** | Removed `COPY .env.example .env` from Dockerfile. Render injects env vars at runtime. |

---

## Zero-Budget Accepted Risks

These risks are documented, acknowledged, and accepted due to the zero-budget constraint. They cannot be mitigated without paid infrastructure or services.

| Risk | Description | Mitigation if Budget Becomes Available |
|---|---|---|
| Supabase shared infrastructure | Supabase free tier runs on shared PostgreSQL instances. Side-channel attacks between tenants are theoretically possible. | Upgrade to Supabase Pro for dedicated database instance. |
| Render no WAF/DDoS protection | Render free tier has no WAF, no DDoS mitigation, no IP filtering. The backend is exposed to volumetric attacks. | Add Cloudflare (free tier) as a reverse proxy for basic DDoS protection and WAF rules. |
| No paid monitoring/alerting | No Sentry, Datadog, or PagerDuty. Runtime errors and security events are not captured or alerted. | Add Sentry (free tier for 5k events) or Render's built-in logs. |
| No secrets rotation | Supabase service-role key and OpenRouter API key are static with no automated rotation schedule. | Implement quarterly manual rotation or use a secrets manager (e.g., Vault, AWS Secrets Manager). |
| GitHub Actions shared runner | CI runs on GitHub-hosted shared runners. Build artifacts and dependency downloads transit through shared infrastructure. | Use self-hosted runners or GitHub Actions with larger runners (paid). |

---

## Summary

| Severity | Total | FIXED | PARTIALLY FIXED | OPEN | ACCEPTED RISK |
|---|---|---|---|---|---|
| HIGH | 3 | 2 | 1 | 0 | 0 |
| MEDIUM | 7 | 1 | 1 | 4 | 1 |
| LOW | 5 | 1 | 0 | 3 | 2 |
| **Total** | **15** | **4** | **2** | **7** | **3** |

# Supabase Schema Proposals — 2026-08-13 (PENDING APPROVAL)

**Status:** PROPOSAL ONLY. Nothing here has been applied to the live database and no tracked file has been silently edited. Each item needs an owner sign-off before execution.

**Why this exists:** Fajr's IoT payloads use string `reading_id` values (`WOKWI-SIM-001-20260715103000-142`), and the live Supabase DB already stores them as `TEXT` (verified in the prior session). The committed DDL `smart_eco_pharma/schema/iot_migration.sql` still declares `reading_id UUID` — so a fresh database built from the repo would reject every Fajr payload. This file reconciles the repo DDL with the verified live schema and closes the related alert-FK defect (review item R7).

---

## P1 — Fix committed `iot_migration.sql` DDL drift (reading_id UUID → TEXT + alert FK)

**Applies to:** `smart_eco_pharma/schema/iot_migration.sql` (tracked file — edit requires approval).

Change 1 — `iot_readings.reading_id`:

```sql
-- BEFORE
reading_id UUID UNIQUE NOT NULL,
-- AFTER
reading_id TEXT UNIQUE NOT NULL,
```

Change 2 — `iot_alerts.reading_id` FK. Today it references `iot_readings(id)` (the surrogate UUID PK), but `iot_repository.create_alert` inserts the payload's `reading_id` string. Point the FK at the natural key instead:

```sql
-- BEFORE
reading_id UUID NOT NULL REFERENCES iot_readings(id),
-- AFTER
reading_id TEXT NOT NULL REFERENCES iot_readings(reading_id),
```

Rationale:
- Live DB already uses TEXT; this makes a fresh deployment match.
- `iot_readings.reading_id` is `UNIQUE NOT NULL`, so it is a valid FK target.
- Fixes the alert-insert failure that Fajr's payload format triggers (`iot_repository.create_alert` inserting `str(reading_id)` into a UUID-typed FK column).

## P2 — Backend alert write (confirmation of FK alignment)

**Applies to:** `smart_eco_pharma/repositories/iot_repository.py` (or wherever `create_alert` lives).

No code change is proposed to the function itself — once P1 is applied, inserting `reading_id` (the payload string) is correct against the new FK. Verify at code-review time that `create_alert` writes the same `reading_id` string the row was created with (not `str(row_id)`).

## P3 — Optional doc-schema tightening (no DB change required)

**Applies to:** `03_Interaction_Risk_Module/output_schema.json` (Mohamed's package) and `system_prompt.txt`.

- `interaction_source_type` is correct as-is: `NONE_KNOWN` belongs in `severity`, not in `source`. **No enum change proposed.**
- Recommend the prompt add explicit guidance for what `source`/`confidence` to set when a `NONE_KNOWN` finding is emitted, and that `interactions` remain empty for NONE_KNOWN verdicts (harness oracle already does this).

## P4 — No action items (verified in sync)

- `interaction_severity_type` enum already contains `NONE_KNOWN`. ✅
- `interaction_confidence_type` (`high/medium/low`) matches the schema. ✅
- `test_method_type` enum, `drug_interactions.severity/source/confidence`, `reading_id TEXT` already verified present in the live DB. ✅

---

**Approval checklist:** [ ] P1 DDL edit approved · [ ] P2 backend verify approved · [ ] P3 prompt/schema tweak approved (optional).

**Executor:** Ahmed/backend, via SQL Editor + a normal code commit. Not applied by this agent.

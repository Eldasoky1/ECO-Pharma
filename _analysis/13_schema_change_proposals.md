# Schema Change Proposals — Integration Review (2026-08-12)

Status: **PROPOSALS ONLY — NOT APPLIED.** Produced after the Mohamed/Fajr/Omar
integration merge (branch `integrate-mohamed-fajr-omar-2026-08-12`). Every item
below is grounded in the committed migration files and the per-module reviews
(`10_mohamed_review.md`, `11_fajr_review.md`, `12_omar_review.md`). No Supabase
MCP tools were available in the review session, so **no database writes were
made**. Apply only after owner approval, via the Supabase SQL Editor
(`https://supabase.com/dashboard/project/drzrxfmrxiitopjamchh/sql/new`).

## Ground truth: current committed schema

- `smart_eco_pharma/schema/iot_migration.sql` (line 3): `reading_id UUID UNIQUE NOT NULL`;
  `iot_alerts.reading_id UUID NOT NULL REFERENCES iot_readings(id)` (line 22).
- `smart_eco_pharma/schema/migration_003_interaction_risk.sql`: already adds
  `severity interaction_severity_type`, `source interaction_source_type`,
  `confidence interaction_confidence_type` to `drug_interactions`, with enums
  `MAJOR/MODERATE/MINOR/NONE_KNOWN`, `verified_reference/inferred_pharmacology`,
  `high/medium/low`.
- Session report `05_Reports_And_Comms/2026-08-09_full_session_report.md` claims
  the DB column was altered `UUID -> TEXT` and verified — **but the committed
  migration file was never updated** (confirmed by re-reading `iot_migration.sql`
  this session). A fresh DB built from the repo would reject every Fajr payload.

## S-1. Fix committed `iot_migration.sql` `reading_id` drift [HIGH]

- `iot_readings.reading_id` should be `TEXT UNIQUE NOT NULL`, not `UUID`.
  - Fajr firmware emits `"WOKWI-SIM-001-20260715103000-142"` (a 39-char string);
    `models/iot.py` declares `reading_id: str`; `iot_sensor_schema.json` allows
    "any unique string". Only the committed DDL still says UUID.
- `iot_alerts.reading_id` should keep `REFERENCES iot_readings(id)` (the UUID PK)
  **or** be repointed to the business key; the backend
  `iot_repository.create_alert` currently inserts the payload **string** into a
  UUID FK column, so alert inserts fail at runtime. One of the two must be made
  consistent; proposal: keep `iot_alerts.reading_id` referencing the PK
  `iot_readings(id)` and have the repository resolve `reading_id -> id`, or add a
  `reading_text_id TEXT UNIQUE` column and FK to it.
- Same drift note applies to `transmission_mode` documentation: `fagr_handoff_note.md`
  instructs `"realtime"` but the schema enum is `["serial","http_post"]`.

## S-2. Payload size contract vs `StaticJsonDocument<512>` [HIGH]

- Compact payload ~567 B exceeds the schema's own "< 512 bytes" constraint and
  the firmware buffer. No schema column change; remediation is firmware-side
  (`DynamicJsonDocument` or trim) plus a runtime `measureJson()` check. Recorded
  here so the DB/API contract is not changed to accommodate it.

## S-3. Shared product identifier — cross-module join key [HIGH]

- No shared product ID exists across the three modules today:
  - Omar: `pharmacy_reference_data.json` / interaction CSVs keyed by product name
    (cartesian product-pair expansion).
  - Mohamed: ingredient-keyed `output_schema.json` / `pharmacy_reference_data.json`.
  - Fajr: location-keyed (`storage_location_id` = `SHELF-A3-B2`), device-domain fields
    (`reading_id`, `sequence_number`, `timestamp_utc`) with no product key.
- Proposal: add a canonical `product_id` (or adopt Omar's `drug_name` as the
  canonical key in a `product_master` table) that `drug_master`/`otc_inventory`/
  `drug_interactions` share, so an alert can resolve storage location -> product.

## S-4. Omar CSVs: three files, two schemas [MEDIUM]

- Two V4 files are byte-identical duplicates; `(1.Fatma).csv` is an older 8-column
  / 42-row variant (missing `temp_tolerance`, `humidity_tolerance` and 7 drugs).
- Proposal (data, not DDL): keep one canonical 10-column / 49-row master, delete
  the duplicate, upgrade or deprecate the Fatma variant. `_resolve_csv_path()`
  `glob("*.csv")` fallback breaks if only Fatma's file is present.

## S-5. 4 missing MINOR interactions [MEDIUM]

- Omar's transcribed data is missing 4 MINOR interaction pairs present in the
  docx / Mohamed's JSON. Data remediation: insert rows after identifying the
  missing pairs from the docx. Requires owner approval of the pair list.

## S-6. `source` enum has no `NONE_KNOWN` value [MEDIUM]

- `migration_003` already adds `NONE_KNOWN` to `severity`, but `source` is still
  `verified_reference/inferred_pharmacology` — no valid value if the model emits
  a `NONE_KNOWN` interaction entry. Proposal: extend `interaction_source_type`
  with `'no_known_interaction'` (or similar) via a new migration, and instruct the
  prompt which `source`/`confidence` to set for NONE_KNOWN.

## Not schema changes (recorded for the owner)

- `single_lookup` enum value unused (schema/test-set inconsistency).
- README says "13 keys" but `output_schema.json` has 9 top-level properties.
- Mohamed's 4-tier severity vs docx 3-tier clinical scale: deliberate, flag only.
- `light_lux`/`door_open` simulated, stored only in `raw_payload JSONB` — no columns.

## Application gate

Any of S-1..S-6 may only be applied after owner sign-off. The safe order:
S-1 (read-only-safe DDL fix) first, then S-6, then S-3/S-4/S-5 (data-level, need
the shared-ID design approved first).

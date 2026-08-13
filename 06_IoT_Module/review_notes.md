# Sub-Agent Fajr-Reviewer — Technical Review of Fajr's IoT/Wokwi Firmware

**Scope:** READ-ONLY analysis of Fajr's Wokwi/Arduino firmware against the IoT contract, then one review file written. No workspace files were modified other than this file.
**Inputs examined:**
- Zip extract: `C:\Users\engAh\AppData\Local\Temp\opencode\extract\fajr_zip\` → `sketch.ino` (194 lines), `diagram.json`, `libraries.txt`, `wokwi-project.txt`
- Wokwi project `https://wokwi.com/projects/469925819658449921` — **fetched successfully** (matches extract byte-for-byte; identical firmware confirmed by SHA-256 match with `iot/firmware/sketch.ino`: `7C1D89F5...16DC`)
- `iot/iot_sensor_schema.json`, `iot/iot_example_normal.json`, `iot/iot_example_alert.json`, `iot/fagr_handoff_note.md`
- `03_Interaction_Risk_Module/output_schema.json` (Dr. Mohamed), `smart_eco_pharma/models/inventory.py` + `schema/schema_contract.md` (Omar/Fatma data structures), `smart_eco_pharma/models/iot.py`, `services/iot_service.py`, `repositories/iot_repository.py`, `routers/iot_ingestion.py`, `schema/iot_migration.sql`, `iot/assumption_log.md`
- `iot/firmware/README.md` (Fajr's own doc, in workspace copy — **not** present in the zip extract)

---

## 1. Checklist (a–j)

| # | Criterion | Verdict | Notes |
|---|---|---|---|
| a | Extract zip + map contents | **PASS** | 4 files extracted: `sketch.ino` (194 lines), `diagram.json` (Arduino Uno + DHT22 + DS1307 + HX711 50kg + buzzer, 14 wiring connections), `libraries.txt` (ArduinoJson, DHT sensor library, Adafruit Unified Sensor, RTClib, HX711), `wokwi-project.txt`. Extract is byte-identical to the committed workspace copy `iot/firmware/`; the zip **lacks** `firmware/README.md` (exists only in the workspace copy). |
| b | DHT22 temp/humidity simulation & collection | **PASS** | `#define DHTTYPE DHT22`, DHT on `DHTPIN 2`; `dht.readTemperature()`/`dht.readHumidity()` with NaN guard (sketch.ino:56). `diagram.json` wires `dht1:SDA → uno:2`. **Caveat:** the shipped diagram sets `"temperature": "53.7", "humidity": "100"` (diagram.json:13) — both permanently out of range, so the default simulation **always** sounds the buzzer and emits `alert_flags` all-`true`. Likely leftover test data; should be a normal-range default (e.g. 4.5°C / 45%). |
| c | HX711 load-cell weight / inventory monitoring | **PASS** *(with caveats)* | HX711 on `DT_PIN 3`/`SCK_PIN 4`; `float weight = scale.get_units(5); bool inventoryTrigger = (weight < 500);` (sketch.ino:61-62). Caveats: (1) `scale.set_scale()` is called with **no calibration factor** (sketch.ino:44) — raw/unknown units, so "500" is not a calibrated gram threshold; (2) the raw weight is **not transmitted**, only the boolean `inventory_trigger` (consistent with schema, which has no weight field); (3) the 500g threshold is hardcoded and is **not tied to Fatma's `otc_inventory.min_stock_threshold`** (unit-count based) — a shelf-weight proxy, flagged in IOT-ASSUMPTION-012. |
| d | RTC-based timestamps on each reading | **PASS** | DS1307 via RTClib; `if (!rtc.isrunning()) rtc.adjust(DateTime(F(__DATE__), F(__TIME__)))` (sketch.ino:40-42). `timestamp_utc` built as `"%04d-%02d-%02dT%02d:%02d:%02dZ"` → e.g. `2026-07-15T10:30:00Z` (sketch.ino:118-125), valid RFC3339 UTC, no milliseconds (schema `$comment`: ms optional). **Minor:** the in-code comment "RTC_DS3231 rtc is the only RTC module wokwi supports" (sketch.ino:18) is contradicted by the code, which instantiates `RTC_DS1307`, and by the diagram (`wokwi-ds1307`). |
| e | Unique device ID | **PASS** | `doc["device_id"] = "WOKWI-SIM-001"` (sketch.ino:104-105), constant across readings; `storage_location_id` = `"SHELF-A3-B2"` (matches schema + examples). Device ID also embedded in `reading_id`. |
| f | Sequence numbering + EEPROM persistence | **PARTIAL** | EEPROM code is genuinely present: `EEPROM.get(0, sequenceNumber)` (sketch.ino:30), reset if `0xFFFFFFFF` (sketch.ino:33-35), `EEPROM.put(0, sequenceNumber)` (sketch.ino:110). Three issues: **(1)** Wokwi does **not** persist EEPROM across a simulation restart — effectively resets to 0 each run (documented by Fajr in README "Known Limitations #1", and consistent with schema `$comment` + handoff note); **(2)** off-by-one: `EEPROM.put(0, sequenceNumber); doc["sequence_number"] = sequenceNumber++;` (sketch.ino:110-112) stores the **pre-increment** value, so after a real-hardware reboot the first reading repeats the last-sent sequence number (unique `reading_id` still prevents dedup rejection, but sequence continuity has a duplicate); **(3)** an EEPROM write every 5 s (~17,280 writes/day) will wear AVR EEPROM (~100k cycles ≈ 6 days) on real hardware — fine for sim, needs batching on hardware. |
| g | Exact JSON payload structure + cross-schema consistency | **PARTIAL** | All 10 required top-level fields present with correct types (see §2–§3). However: **(1) payload size ~567 bytes compact** vs the schema's own "< 512 bytes" requirement and the `StaticJsonDocument<512>` buffer → overflow risk (see §3.2); **(2)** `iot_migration.sql:3` still declares `reading_id UUID UNIQUE NOT NULL` while the schema/model/firmware use a **string** → committed DB schema would reject `WOKWI-SIM-001-…` payloads; **(3)** `fagr_handoff_note.md` tells Fajr to send `transmission_mode` = `"realtime"`, which is **not in the schema enum** `["serial","http_post"]` (firmware correctly sends `"serial"`); **(4)** Dr. Mohamed's `output_schema.json` is a different domain (interaction assessment) — no field overlap, no conflict, no mapping needed; **(5)** Omar's `otc_inventory.storage_location_identifier` maps 1:1 to `storage_location_id` (consistent). |
| h | Device/status info in payload | **PASS** | `device_status` = `{"battery_level_percent":87, "signal_quality":92, "firmware_version":"1.0.0"}` — all three required fields, correct int/string types, in-range (0–100), semver pattern valid. Values are hardcoded statics (documented). Plus `device_id` and `storage_location_id` at top level. |
| i | Alert flags / abnormal-reading logic | **PASS** | Thresholds match the contract exactly: `temperature_out_of_range` = `temperature < 2.0 \|\| temperature > 8.0`; `humidity_out_of_range` = `< 30.0 \|\| > 65.0`; `inventory_threshold_breached` = `inventoryTrigger` (sketch.ino:70-77). Consistent with `iot_sensor_schema.json` descriptions and `iot_example_alert.json` (12.3°C / 72.5% → all flags true). Buzzer driven by the same flags (sketch.ino:79-83). Caveats: `door_open`/`light_lux` are hardcoded (`false`, `250.0`) regardless of the alert example's `true`/`180.0`; sim defaults at (a) would perpetually alarm. |
| j | Flag the "incomplete note" as an open question | **PARTIAL** | **The truncated sentence described in the task brief does NOT exist in the on-disk file.** Full analysis in §4. The brief quotes the note ending mid-sentence with `I also reviewed the IoT/requirements and compared them with the following:` — a full workspace search for that text returns **zero matches**, and `fagr_handoff_note.md` (31 lines) ends cleanly with "…so take the time to validate." This must be treated as an open discrepancy, not silently "fixed". Do not guess the missing content. |

---

## 2. Extracted JSON Payload (what the device actually emits)

Compact `serializeJson(doc, Serial)` output — field order differs run-to-run (ArduinoJson sorts keys); example with realistic normal values:

```json
{"schema_version":"1.0.0","reading_id":"WOKWI-SIM-001-20260715103000-142","device_id":"WOKWI-SIM-001","storage_location_id":"SHELF-A3-B2","sequence_number":142,"timestamp_utc":"2026-07-15T10:30:00Z","transmission_mode":"serial","sensor_payload":{"temperature_celsius":4.5,"humidity_percent":45.0,"inventory_trigger":false,"light_lux":250.0,"door_open":false},"device_status":{"battery_level_percent":87,"signal_quality":92,"firmware_version":"1.0.0"},"alert_flags":{"temperature_out_of_range":false,"humidity_out_of_range":false,"inventory_threshold_breached":false}}
```

### Field-by-field (exact names, types, example values)

| Field | Type | Example value | Source in sketch.ino |
|---|---|---|---|
| `schema_version` | string | `"1.0.0"` | :101 |
| `reading_id` | string | `"WOKWI-SIM-001-20260715103000-142"` (pattern `DEVICE_ID-YYYYMMDDHHMMSS-SEQ`, ≤ 39 chars) | :85-98 |
| `device_id` | string | `"WOKWI-SIM-001"` | :104 |
| `storage_location_id` | string | `"SHELF-A3-B2"` | :107 |
| `sequence_number` | integer | `142` (monotonic, ≥ 0) | :111 |
| `timestamp_utc` | string | `"2026-07-15T10:30:00Z"` (ISO 8601, UTC, **no ms**) | :118-125 |
| `transmission_mode` | string | `"serial"` | :129 |
| `sensor_payload` | object | — | :136 |
| ├─ `temperature_celsius` | number | `4.5` | :139 |
| ├─ `humidity_percent` | number | `45.0` | :142 |
| ├─ `inventory_trigger` | boolean | `false` | :144 |
| ├─ `light_lux` | number | `250.0` (hardcoded) | :147 |
| └─ `door_open` | boolean | `false` (hardcoded) | :150 |
| `device_status` | object | — | :157 |
| ├─ `battery_level_percent` | integer | `87` (hardcoded) | :160 |
| ├─ `signal_quality` | integer | `92` (hardcoded) | :163 |
| └─ `firmware_version` | string | `"1.0.0"` | :166 |
| `alert_flags` | object | — | :173 |
| ├─ `temperature_out_of_range` | boolean | `false` (`<2.0 or >8.0`) | :176 |
| ├─ `humidity_out_of_range` | boolean | `false` (`<30 or >65`) | :179 |
| └─ `inventory_threshold_breached` | boolean | `false` (`== inventory_trigger`) | :182 |

---

## 3. Payload-vs-Schema Compliance

### 3.1 Against `iot_sensor_schema.json` (the binding contract)

Every one of the 10 `required` top-level keys is emitted; `additionalProperties: false` is respected (no extra fields). Type/format checks:

| Schema constraint | Device output | Verdict |
|---|---|---|
| `schema_version` pattern `^\d+\.\d+\.\d+$` | `"1.0.0"` | ✅ |
| `reading_id` string 1–128 | `"WOKWI-SIM-001-20260715103000-142"` (39) | ✅ (schema explicitly allows any unique string, UUID not required) |
| `device_id` string | `"WOKWI-SIM-001"` | ✅ |
| `storage_location_id` string | `"SHELF-A3-B2"` | ✅ |
| `sequence_number` integer ≥ 0 | `0,1,2,…` | ✅ |
| `timestamp_utc` `format: date-time` | `2026-07-15T10:30:00Z` | ✅ (ms optional per schema `$comment`; Pydantic `datetime` parses) |
| `transmission_mode` enum `[serial, http_post]` | `"serial"` | ✅ |
| `temperature_celsius` -20…60 | 4.5 (sim 53.7 still in-range) | ✅ |
| `humidity_percent` 0…100 | 45.0 | ✅ |
| `inventory_trigger` boolean | `false` | ✅ |
| `light_lux` 0…100000 (optional) | 250.0 | ✅ |
| `door_open` boolean (optional) | `false` | ✅ |
| `device_status` ints 0…100 + semver string | 87 / 92 / "1.0.0" | ✅ |
| `alert_flags` three booleans | false/false/false | ✅ |
| **Payload ≤ 512 bytes (schema `$comment` + `StaticJsonDocument<512>`)** | **~567 bytes** | ❌ **RISK** |

### 3.2 Payload-size risk (BLOCKING-adjacent)

- Measured compact serialization of the **smallest realistic** normal reading: **563 bytes** (PowerShell `ConvertTo-Json -Compress`). ArduinoJson 6 renders floats with a trailing decimal (`45.0`, `250.0`) — **+4 bytes → ~567 bytes**, matching IOT-ASSUMPTION-009's own "~567 bytes minified" note.
- This exceeds both the schema's stated "< 512 bytes" and the `StaticJsonDocument<512>` memory pool. In ArduinoJson 6, once the document's pool is exhausted, member assignments silently fail and `serializeJson` emits a truncated/empty line — the backend then drops the reading. **Must be verified at runtime with `doc.measureJson()`**; likely remedy: `DynamicJsonDocument`, raise capacity, drop optional fields, or shorten `reading_id`. This is the open payload-size item (TEAM_HANDOFF IOT-009/011 / IOT-ASSUMPTION-009).

### 3.3 Cross-pipeline consistency issues

1. **`reading_id` type drift (DB vs schema vs model vs firmware).** Schema JSON: "any unique string"; `models/iot.py:31` `reading_id: str`; firmware: `"WOKWI-SIM-001-…"`. But the committed `schema/iot_migration.sql:3` still defines `reading_id UUID UNIQUE NOT NULL`, and `iot_alerts.reading_id UUID NOT NULL REFERENCES iot_readings(id)` (:22). Session reports (`05_Reports_And_Comms/2026-08-09_full_session_report.md`) claim the DB column was altered UUID→TEXT and verified, yet the **committed migration file was not updated** → drift: a fresh DB built from the repo would reject every Fajr payload.
2. **`fagr_handoff_note.md` `transmission_mode` contradiction.** The note (line 17) instructs `transmission_mode` is `"realtime"`; the schema enum and examples say `"serial"`/`"http_post"`. Fajr correctly sent `"serial"`; anyone following the note literally would be rejected.
3. **Backend alert FK bug (triggered by these payloads).** `iot_repository.create_alert` inserts `str(reading_id)` (the payload string) into `iot_alerts.reading_id`, which FKs to `iot_readings(id)` (a UUID PK), not to `iot_readings.reading_id`. A `WOKWI-SIM-001-…` string is neither a UUID nor the row PK → alert insert fails. Backend-side defect, surfaced by Fajr's payload format.
4. **Inventory semantics mismatch (Omar/Fatma vs firmware).** `storage_location_id` ↔ `otc_inventory.storage_location_identifier` is 1:1 consistent, but `inventory_trigger` is a physical **shelf-weight** boolean (weight < 500, uncalibrated) while `otc_inventory` tracks integer **unit counts** (`stock_quantity`, `min_stock_threshold`). `iot_service.py:49-62` maps the boolean to `reorder_status` `critical`/`low`. The weight threshold is decoupled from Fatma's database thresholds (IOT-ASSUMPTION-012, open).
5. **Dr. Mohamed's `output_schema.json`** (interaction assessment: `query_type`, `interactions`, `highest_severity`, …) — unrelated domain; **no field overlap** with the IoT payload. Compatibility: N/A (no conflict, no cross-mapping). One naming convention note: `storage_location_id` (IoT) vs the project-wide convention `storage_location_identifier` (schema_contract.md) — cosmetic inconsistency only.
6. **`light_lux` / `door_open`** are optional dashboard-only fields; firmware hardcodes them (`250.0`, `false`). No Phase-1 storage column exists for them (IOT-ASSUMPTION-010) — the `iot_migration.sql` `iot_readings` table has no columns for them, so they live only in `raw_payload JSONB`. Acceptable per contract, but a reviewer should note the values are simulated, not sensed.

---

## 4. Flagged Open Question (item j — the "incomplete note")

**Finding:** The task brief states that `iot/fagr_handoff_note.md` ends mid-sentence with:

> `I also reviewed the IoT/requirements and compared them with the following:`

**This sentence does not exist in the file on disk.** I searched the entire ECO PHARMA workspace for `I also reviewed` and `compared them with` — **zero matches**. The actual file is 31 lines and ends cleanly:

> "...If it does not, the backend will reject every reading and you will lose data silently, so take the time to validate."

(`iot/fagr_handoff_note.md:31`)

**Implications / open questions (do NOT guess content):**
1. Which version is authoritative — the task brief's quoted (truncated) version or the on-disk complete version? The file may have been edited after the brief was written, or the brief references a different/older copy (e.g., a OneDrive sync variant).
2. If a truncated variant existed, its missing content ("compared them with the following: …") is **unknown and unguessable** — it must be obtained from Fajr/the brief author.
3. The note header (`To: Fagr Ahmed / From: Software Team`) also means this note is *instructions to* Fajr, not *from* Fajr — so it should not be treated as Fajr's own attestation of completion.

**Other genuine gaps in the note itself** (not truncation, but worth fixing):
- Instructs `transmission_mode` = `"realtime"` (not in schema enum — see §3.3.2).
- Says timestamp placeholder `"1970-01-01T00:00:00.000Z"` is acceptable "if that is too much overhead" — Fajr exceeded this by using a real DS1307 RTC ✅.
- Says "If EEPROM is not available in your Wokwi simulation, start at 0 … and add a comment explaining this" — Fajr used real EEPROM calls (no comment explaining the sim limitation; the limitation is documented in `firmware/README.md` instead).

---

## 5. Summary & Priority Actions

| Priority | Action | Owner |
|---|---|---|
| **High** | Runtime-verify `doc.measureJson()`; payload ~567 B > 512 B pool → bump `StaticJsonDocument`, trim fields, or shorten `reading_id`. Close IOT-ASSUMPTION-009 / IOT-009/011. | Fajr (firmware) + backend sign-off |
| **High** | Update committed `iot_migration.sql` to `reading_id TEXT` (and fix `iot_alerts.reading_id` FK to reference `iot_readings(id)` or the correct key) so a fresh DB accepts Fajr's payloads. | Backend (Ahmed/Omar) |
| **Medium** | Fix `fagr_handoff_note.md` `transmission_mode` = `"realtime"` → `"serial"`. | Software team |
| **Medium** | Resolve the item-j discrepancy: locate the version of the note containing the quoted truncated sentence, or confirm the on-disk file is final. Do not infer content. | Review coordinator |
| **Low** | Normalize `diagram.json` DHT22 sim defaults to in-range values (e.g. 4.5°C / 45%) so the shipped project isn't in a permanent alarm state. | Fajr |
| **Low** | Fix EEPROM off-by-one (`EEPROM.put` after increment) and document/wear considerations for real hardware. | Fajr |
| **Low** | Reconcile `inventory_trigger` weight proxy with Fatma's `min_stock_threshold` unit-count semantics. | Fajr + Fatma |

*Generated 2026-08-12 by the Fajr-Reviewer sub-agent. Read-only except this file.*

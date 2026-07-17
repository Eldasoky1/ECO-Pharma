# IoT Assumption Log — Phase 2: Smart Eco-Pharma Hub

**Project:** Smart Eco-Pharma Hub
**Phase:** 2 — IoT Sensor Integration
**Last Updated:** 2026-07-15
**Owner:** IoT Integration Team

---

## Assumptions

### IOT-ASSUMPTION-001: Temperature Range

**What I assumed:** Pharmaceutical cold chain range is 2.0°C to 8.0°C based on WHO guidelines for vaccine/insulin storage.
**Why:** WHO EML and CDC vaccine storage guidelines specify 2–8°C as the standard cold chain window. Most Phase 1 inventory records for vaccines and insulin assume this range.
**Who must validate:** Fatma (Inventory) — confirm whether her OTC inventory includes only cold-chain drugs or also room-temperature drugs (15–25°C).
**Impact if wrong:** If Fatma's inventory uses a different range (e.g. 15–25°C for room-temp drugs), the alert thresholds must be per-location, not global. A single global 2–8°C threshold will generate false alerts for room-temperature shelves or miss breaches on cold-chain shelves.
**Status:** OPEN

---

### IOT-ASSUMPTION-002: Humidity Range

**What I assumed:** 30% to 65% RH is the acceptable pharmaceutical storage range.
**Why:** USP <659> and general pharmacy best practices recommend 30–65% RH for most solid oral dosage forms. Extremes cause tablet dissolution (high RH) or static/electrostatic issues (low RH).
**Who must validate:** Fatma (Inventory) — confirm the humidity range for each storage zone.
**Impact if wrong:** Different drugs may require different humidity ranges. If Fatma's inventory has zone-specific requirements, a single global humidity threshold will either over-alert or under-alert.
**Status:** OPEN

---

### IOT-ASSUMPTION-003: Transmission Mode

**What I assumed:** Two modes are supported: "serial" (direct USB serial from Wokwi simulator) and "http_post" (HTTP POST if Fagr adds WiFi simulation to the Wokwi sketch). The backend accepts both.
**Why:** Wokwi's free tier supports serial output natively. WiFi simulation requires the ESP32 Wokwi board and may not be available in all configurations. Serial is the baseline.
**Who must validate:** Fagr (IoT/Hardware) — confirm which transmission mode she will implement first.
**Impact if wrong:** If only serial is used, http_post will never appear in the backend. This is non-breaking but means the HTTP ingestion endpoint remains untested. If Fagr plans http_post but the backend doesn't handle it, readings will be lost.
**Status:** OPEN

---

### IOT-ASSUMPTION-004: Device ID

**What I assumed:** "WOKWI-SIM-001" is the default device identifier for the simulated sensor. The plan uses one simulated device.
**Why:** A single-device assumption simplifies Phase 2 validation. The schema supports multiple device_ids, but the current test plan and dashboard only render one device.
**Who must validate:** Fagr (IoT/Hardware) — confirm the device_id hardcoded in her Arduino sketch.
**Impact if wrong:** If multiple simulated devices are needed (e.g. one per shelf), each must have a unique device_id. The schema supports this but the current dashboard and alert routing logic only expect one device. Multi-device support would require dashboard changes.
**Status:** OPEN

---

### IOT-ASSUMPTION-005: Storage Location ID

**What I assumed:** "SHELF-A3-B2" is the default storage_location_id in the IoT payload, and it matches a value in otc_inventory.storage_location_identifier.
**Why:** Phase 1 schema defines storage_location_identifier as a foreign key. The backend validates this link — an unknown location_id is accepted but flagged in the response.
**Who must validate:** Fatma (Inventory) — confirm the exact location_id string that exists in her database.
**Impact if wrong:** If the Arduino sends a location_id that doesn't match any row in otc_inventory, the backend will accept the reading but flag it as "unknown_location". Dashboard will show the reading but it won't link to inventory records. No data loss, but broken linkage.
**Status:** OPEN

---

### IOT-ASSUMPTION-006: Timestamp Handling

**What I assumed:** The Arduino in basic Wokwi simulation has no RTC (Real-Time Clock). The schema accepts placeholder timestamps (e.g. "0000-00-00T00:00:00Z"). If Fagr adds a DS3231 RTC module, she should use real timestamps.
**Why:** Wokwi's AVR simulator does not model hardware RTC peripherals. millis()-based timestamps are relative, not absolute. The backend prefers real ISO 8601 timestamps but accepts placeholders for simulation.
**Who must validate:** Fagr (IoT/Hardware) — confirm whether she will add a DS3231 RTC module or use placeholder timestamps.
**Impact if wrong:** If placeholder timestamps are used, the backend cannot order readings chronologically or detect time-based anomalies. This is acceptable for Phase 2 simulation but must be replaced before production.
**Status:** OPEN

---

### IOT-ASSUMPTION-007: Sequence Number Persistence

**What I assumed:** EEPROM storage is used for sequence_number across reboots, so the sequence counter persists.
**Why:** Sequence numbers help detect out-of-order delivery. If the sequence resets on every reboot, the backend cannot use sequence continuity for ordering.
**Who must validate:** Fagr (IoT/Hardware) — confirm whether Wokwi supports EEPROM simulation for her target board.
**Impact if wrong:** If Wokwi doesn't support EEPROM simulation, sequence_number starts at 0 on each reboot. The backend handles this via deduplication on reading_id, not sequence continuity. Functionally non-breaking, but out-of-order detection is weakened.
**Status:** OPEN

---

### IOT-ASSUMPTION-008: Alert Pre-computation

**What I assumed:** The Arduino computes alert flags (temperature_out_of_range, humidity_out_of_range, etc.) before sending the payload. These are advisory.
**Why:** Pre-computing on the device reduces backend logic and allows the Arduino to act on alerts locally (e.g. trigger a buzzer) even if the backend is unreachable.
**Who must validate:** Fagr (IoT/Hardware) — confirm she implements alert flag logic in the Arduino sketch.
**Impact if wrong:** This is advisory — the backend re-validates against raw sensor values. If Arduino computes wrong, the backend will have mismatched alert flags vs. actual values. The backend's own flags take precedence, but the mismatch indicates a firmware bug that should be fixed.
**Status:** OPEN

---

### IOT-ASSUMPTION-009: Payload Size

**What I assumed:** Serialized payload is < 512 bytes when produced by ArduinoJson. Example payloads are ~570 bytes when pretty-printed but ~567 bytes minified. ArduinoJson's Serial.println produces compact (minified) output.
**Why:** Many Arduino serial buffers are 256–1024 bytes. Keeping payloads under 512 bytes ensures compatibility with most serial buffer sizes and avoids truncation.
**Who must validate:** Fagr (IoT/Hardware) — confirm the actual minified payload size from her ArduinoJson output.
**Impact if wrong:** If Fagr's code produces larger payloads (e.g. with long device_id strings, additional fields, or pretty-printed JSON), it may exceed the serial buffer. This causes truncated JSON, which the backend cannot parse. Symptom: JSON parse errors in backend logs.
**Status:** OPEN

---

### IOT-ASSUMPTION-010: Light and Door Sensors

**What I assumed:** Light level and door-open fields are optional and DASHBOARD ONLY. They have no corresponding Phase 1 schema fields.
**Why:** Phase 1 schema (iot_sensor_readings) does not include light_level or door_open columns. These were added to the IoT payload schema for future use and frontend display only.
**Who must validate:** Full team — confirm these fields are not needed in the database for Phase 2.
**Impact if wrong:** If they need to be stored in the database, a schema migration will be required (ALTER TABLE iot_sensor_readings ADD COLUMN ...). This is a Phase 2 blocker if discovered late. For now, they are passed through to the dashboard via the API response but not persisted.
**Status:** OPEN

---

### IOT-ASSUMPTION-011: Duplicate Detection

**What I assumed:** The backend deduplicates by reading_id (UUID). If the same reading_id arrives twice, the second is rejected with a 409 Conflict response.
**Why:** UDP-like delivery (or serial retransmission) can cause duplicates. Deduplication at the backend prevents double-counting in dashboards and inventory triggers.
**Who must validate:** Fagr (IoT/Hardware) — confirm she generates a unique UUID for each reading (use randomUUID() in Arduino or a counter-based approach).
**Impact if wrong:** If Fagr reuses reading_ids (e.g. hardcodes one UUID), all readings after the first will be rejected. The backend will appear to receive no data. Symptom: only one reading ever appears in the database.
**Status:** OPEN

---

### IOT-ASSUMPTION-012: Inventory Trigger Mapping

**What I assumed:** inventory_trigger: true in the IoT payload signals a threshold breach. The backend maps this to otc_inventory.reorder_status.
**Why:** The IoT system acts as an early-warning layer for inventory. When a sensor detects conditions that suggest stock needs attention (e.g. temperature breach implies product degradation → reorder), it sets inventory_trigger: true.
**Who must validate:** Fatma (Inventory) — confirm the physical sensor threshold aligns with min_stock_threshold in the database.
**Impact if wrong:** If the physical sensor triggers at a different threshold than min_stock_threshold in the database, there will be a mismatch. For example, the sensor triggers at 7.5°C but the database threshold is 8.0°C — the backend will set reorder_status based on the IoT trigger, but the database thinks everything is fine. Fatma must align the physical sensor threshold with her database threshold.
**Status:** OPEN

---

## Summary

| ID | Title | Status | Validator |
|----|-------|--------|-----------|
| IOT-ASSUMPTION-001 | Temperature Range | OPEN | Fatma |
| IOT-ASSUMPTION-002 | Humidity Range | OPEN | Fatma |
| IOT-ASSUMPTION-003 | Transmission Mode | OPEN | Fagr |
| IOT-ASSUMPTION-004 | Device ID | OPEN | Fagr |
| IOT-ASSUMPTION-005 | Storage Location ID | OPEN | Fatma |
| IOT-ASSUMPTION-006 | Timestamp Handling | OPEN | Fagr |
| IOT-ASSUMPTION-007 | Sequence Number Persistence | OPEN | Fagr |
| IOT-ASSUMPTION-008 | Alert Pre-computation | OPEN | Fagr |
| IOT-ASSUMPTION-009 | Payload Size | OPEN | Fagr |
| IOT-ASSUMPTION-010 | Light and Door Sensors | OPEN | Full Team |
| IOT-ASSUMPTION-011 | Duplicate Detection | OPEN | Fagr |
| IOT-ASSUMPTION-012 | Inventory Trigger Mapping | OPEN | Fatma |

**Validation deadline:** Before Phase 2 integration testing begins.

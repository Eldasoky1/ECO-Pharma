# Handoff Note: Arduino Data Format for the Eco-Pharma Hub

**To:** Fagr Ahmed, Mechatronics Engineer
**From:** Software Team
**Re:** What your Arduino must send so the backend can store it

---

## What your Arduino must emit

Every time your Arduino or Wokwi simulation takes a sensor reading, it must send one JSON object over the serial port. This is a single block of structured text — not plain numbers, not CSV, not free-form messages. The backend system on the server side will read this JSON, check every field against a strict format, and either store the data or reject it. If anything is missing or the wrong type, the entire reading is thrown away with no retry. So getting the format right matters.

The exact format your JSON must follow is defined in the file `iot_sensor_schema.json` sitting in this same folder. Two example files show you what a correct output looks like in practice: `iot_example_normal.json` for a reading where everything is within normal range, and `iot_example_alert.json` for a reading where temperature or humidity has gone out of range. Match those examples and you will be fine.

## How to build the JSON in your code

Use the ArduinoJson library, version 6.x. The basic idea is straightforward: create a `StaticJsonDocument` with 512 bytes of capacity, fill in the fields, then print it over `Serial` with `serializeJson(doc, Serial)`. Your JSON has four sections. The top-level envelope carries metadata: `schema_version` is always the string `"1.0.0"`, `device_id` is whatever identifier you choose (use `"WOKWI-SIM-001"` for now and keep it consistent across readings), `storage_location_id` must be `"SHELF-A3-B2"` so the database recognises it, `sequence_number` is an integer that increases by one on every reading from the same device, `timestamp_utc` is an ISO 8601 timestamp, and `transmission_mode` is `"realtime"`. Inside that envelope you have three nested objects. The `sensor_payload` object holds `temperature_celsius`, `humidity_percent`, and `inventory_trigger` — all read from your actual sensors. The `device_status` object holds `battery_level_percent`, `signal_quality`, and `firmware_version` (hardcode `"1.0.0"`). The `alert_flags` object holds three booleans: `temperature_out_of_range`, `humidity_out_of_range`, and `inventory_threshold_breached`.

## What to hardcode versus what to compute

Hardcode the values that do not change between readings: `schema_version` as `"1.0.0"`, `device_id` as your chosen ID, `storage_location_id` as `"SHELF-A3-B2"`, and `firmware_version` as `"1.0.0"`. Everything else is either read from a sensor or derived from logic. Read `temperature_celsius` and `humidity_percent` from your DHT22 or equivalent. Read `inventory_trigger` from your IR or weight sensor — it should be `true` when stock is low. Compute the three alert flags with simple comparisons: `temperature_out_of_range` is `true` if the temperature is below 2.0 or above 8.0 (the cold chain range), `humidity_out_of_range` is `true` if humidity is below 30.0 or above 65.0, and `inventory_threshold_breached` is `true` whenever `inventory_trigger` is `true`.

## Sequence number and timestamp

The `sequence_number` must count up by one for every reading from the same device. Ideally you store the current count in EEPROM so it survives reboots, starting at 0 on first boot. If EEPROM is not available in your Wokwi simulation, start at 0 on every reboot and add a comment in your code explaining this — the backend will tolerate it during development.

For the `timestamp_utc` field, the best approach is to add a DS3231 RTC module in Wokwi and generate a proper ISO 8601 timestamp from it. If that is too much overhead right now, set `timestamp_utc` to the placeholder `"1970-01-01T00:00:00.000Z"` and document that the Python listener on the server side will inject the real timestamp when it receives the reading. The backend prefers a real timestamp but will accept the placeholder during simulation.

## Testing before you hand off

Open the Serial Monitor in Wokwi or the Arduino IDE, copy one complete JSON output, and paste it into an online validator like jsonlint.com. It should parse cleanly and look structurally identical to the example files in this folder. If it does, you are ready to hand off. If it does not, the backend will reject every reading and you will lose data silently, so take the time to validate.

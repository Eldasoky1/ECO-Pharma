# Wokwi Reference — Fajr's IoT Simulation

**Reference link:** https://wokwi.com/projects/469925819658449921

**Status (verified this run):** The Wokwi project was fetched successfully during the prior review session and confirmed byte-identical (SHA-256 match) with the exported zip contents in `source_from_Fajr/` and with the committed workspace copy `iot/firmware/sketch.ino` (`7C1D89F5...16DC`).

## Project contents (as exported)

| File | Purpose |
|---|---|
| `sketch.ino` | Arduino firmware (194 lines) — DHT22 temp/humidity, HX711 load cell, DS1307 RTC, EEPROM sequence persistence, JSON payload over Serial |
| `diagram.json` | Wokwi wiring diagram — Arduino Uno + DHT22 + DS1307 + HX711 50kg + buzzer (14 connections) |
| `libraries.txt` | ArduinoJson, DHT sensor library, Adafruit Unified Sensor, RTClib, HX711 |
| `wokwi-project.txt` | Project metadata |

## Hardware / wiring summary (from diagram.json)

- Arduino Uno
- DHT22 (temp/humidity) — `dht1:SDA → uno:2`
- DS1307 RTC (timestamps)
- HX711 50kg load cell (weight / inventory trigger)
- Buzzer (alert sounding, driven by alert flags)

## Known simulation caveats (verified this run)

1. Wokwi does **not** persist EEPROM across a simulation restart — sequence resets to 0 each run (documented in Fajr's `iot/firmware/README.md`, "Known Limitations #1").
2. Shipped `diagram.json` DHT22 defaults are `"temperature": "53.7"`, `"humidity": "100"` — both permanently out of range, so the default simulation is in a perpetual alarm state. Likely leftover test data; recommend normal-range defaults (e.g. 4.5°C / 45%).

## Cross-reference

- Payload structure and issues: see `review_notes.md` (11_fajr_review.md).
- Backend contract: `iot/iot_sensor_schema.json`, `iot/iot_example_normal.json`, `iot/iot_example_alert.json`.

# Smart Eco-Pharma Hub — IoT Firmware

**Author:** Fagr Ahmed (IoT / Hardware Engineer)
**Platform:** Arduino Uno + Wokwi Simulator
**Wokwi Project:** https://wokwi.com/projects/469911290745914369

---

## Hardware Components

| Component | Model | Purpose |
|-----------|-------|---------|
| Microcontroller | Arduino Uno | Main controller |
| Temperature & Humidity | DHT22 | Reads ambient temperature and humidity |
| RTC Module | DS1307 | Generates ISO 8601 timestamps (Wokwi-compatible; DS3231 can be used on real hardware) |
| Load Cell Amplifier | HX711 (50 kg) | Detects inventory weight threshold |
| Buzzer | Active buzzer | Local audio alert when any threshold is breached |

## Pin Configuration

| Pin | Connected To | Function |
|-----|-------------|----------|
| D2 | DHT22 SDA | Temperature/humidity data |
| D3 | HX711 DT | Load cell data |
| D4 | HX711 SCK | Load cell clock |
| D8 | Buzzer | Alert audio output |
| A4 | DS1307 SDA | RTC I2C data |
| A5 | DS1307 SCL | RTC I2C clock |

## Libraries Required

| Library | Version | Purpose |
|---------|---------|---------|
| ArduinoJson | 6.x | JSON payload serialization |
| DHT sensor library | — | DHT22 communication |
| Adafruit Unified Sensor | — | DHT sensor dependency |
| RTClib | — | DS1307 RTC communication |
| HX711 | — | Load cell reading |
| EEPROM | Built-in | Sequence number persistence |

## Files

| File | Description |
|------|-------------|
| `sketch.ino` | Main Arduino firmware — reads sensors, computes alerts, generates JSON payload, transmits via serial |
| `wokwi_diagram.json` | Wokwi circuit diagram — defines hardware connections and component placement |
| `libraries.txt` | Wokwi library dependency list |
| `wokwi_project_info.txt` | Source URL for the Wokwi simulation |

## Firmware Behavior

1. **Boot:** Reads sequence number from EEPROM (starts at 0 if empty)
2. **Loop (every 5 seconds):**
   - Reads DHT22 (temperature, humidity)
   - Reads HX711 (weight → inventory_trigger if weight < 500)
   - Reads DS1307 (current timestamp)
   - Computes alert flags (temp out of range, humidity out of range, inventory breached)
   - Activates buzzer if any alert is true
   - Builds JSON payload matching `iot_sensor_schema.json`
   - Sends JSON over Serial at 115200 baud
   - Increments and persists sequence number to EEPROM

## Alert Thresholds (Hardcoded)

| Parameter | Low | High | Alert |
|-----------|-----|------|-------|
| Temperature | 2.0°C | 8.0°C | `temperature_out_of_range` |
| Humidity | 30.0% | 65.0% | `humidity_out_of_range` |
| Inventory Weight | — | 500g | `inventory_threshold_breached` (weight < 500 = low stock) |

## Known Limitations

1. **EEPROM in Wokwi:** Sequence number resets on simulation restart (simulator limitation, works on real hardware)
2. **Transmission mode:** Only `serial` implemented (Arduino Uno has no WiFi). HTTP POST requires ESP32 migration.
3. **Battery/signal:** Simulated static values (87% / 92%). Real hardware would read from ADC.
4. **Door/light:** Simulated static values. Real hardware would need additional sensors.

## Questions for Backend

- `reading_id` format: Currently generates composite string `WOKWI-SIM-001-YYYYMMDDHHMMSS-SEQUENCE`. Schema originally specified UUID format. **Clarification needed:** Is any unique string acceptable, or must it be a strict UUID?

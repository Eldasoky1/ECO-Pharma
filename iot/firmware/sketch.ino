#include <ArduinoJson.h>
#include <DHT.h>
#include <RTClib.h>
#include "HX711.h"
#include <EEPROM.h>

StaticJsonDocument<512> doc;

#define DHTPIN 2
#define DHTTYPE DHT22
#define DT_PIN 3
#define SCK_PIN 4
#define BUZZER_PIN 8

HX711 scale;

DHT dht(DHTPIN, DHTTYPE);
RTC_DS1307 rtc;//RTC_DS3231 rtc is the only RTC module wokwi supports also generate a proper ISO 8601 timestamp from it.

// Sequence counter
unsigned long sequenceNumber;

// Simulated values
int batteryLevel = 87;
int signalQuality = 92;

void setup() {
  Serial.begin(115200);
    // Read the saved sequence number
  EEPROM.get(0, sequenceNumber);

  // Initialize if EEPROM is empty or corrupted
  if (sequenceNumber == 0xFFFFFFFF) {
    sequenceNumber = 0;
  }
  dht.begin();
  if (!rtc.begin()) {
  Serial.println("Couldn't find RTC");
  while (1);}
  if (!rtc.isrunning()) {
    rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
  }
 scale.begin(DT_PIN, SCK_PIN);
 scale.set_scale();
 scale.tare();
 pinMode(BUZZER_PIN, OUTPUT);
}

void loop()
 {

  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  DateTime now = rtc.now();
  // Check sensor reading
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Failed to read DHT22!");
    delay(2000);
    return;
  }
  float weight = scale.get_units(5);
  bool inventoryTrigger = (weight < 500);
  bool doorOpen = false;
  float lightLux = 250.0;

  // ------------------------------
  // Alert calculations
  // ------------------------------

  bool tempAlert =
      (temperature < 2.0 || temperature > 8.0);

  bool humidityAlert =
      (humidity < 30.0 || humidity > 65.0);

  bool inventoryAlert =
      inventoryTrigger;
   //buzzer
  if ( tempAlert || humidityAlert || inventoryAlert) {
    tone(BUZZER_PIN, 1000);
  } else {
    noTone(BUZZER_PIN);
  }
//generating unique reading ID 
 char readingID[50];

 snprintf(
    readingID,
    sizeof(readingID),
    "WOKWI-SIM-001-%04d%02d%02d%02d%02d%02d-%lu",
    now.year(),
    now.month(),
    now.day(),
    now.hour(),
    now.minute(),
    now.second(),
    sequenceNumber
);


  doc["schema_version"] = "1.0.0";
  doc["reading_id"] = readingID;

  doc["device_id"] =
      "WOKWI-SIM-001";

  doc["storage_location_id"] =
      "SHELF-A3-B2";
// Save it to EEPROM
   EEPROM.put(0, sequenceNumber);
   doc["sequence_number"] =
      sequenceNumber++;

  /*doc["timestamp_utc"] =
      "1970-01-01T00:00:00.000Z";*/
  char timestamp[25];

  snprintf(timestamp, sizeof(timestamp),
         "%04d-%02d-%02dT%02d:%02d:%02dZ",
         now.year(),
         now.month(),
         now.day(),
         now.hour(),
         now.minute(),
         now.second());

  doc["timestamp_utc"] = timestamp;

  doc["transmission_mode"] =
      "serial";

  // ------------------------------
  // Sensor Payload
  // ------------------------------

  JsonObject sensor =
      doc.createNestedObject("sensor_payload");

  sensor["temperature_celsius"] =
      temperature;

  sensor["humidity_percent"] =
      humidity;
  sensor["inventory_trigger"] =
      inventoryTrigger;

  sensor["light_lux"] =
      lightLux;

  sensor["door_open"] =
      doorOpen;

  // ------------------------------
  // Device Status
  // ------------------------------

  JsonObject status =
      doc.createNestedObject("device_status");

  status["battery_level_percent"] =
      batteryLevel;

  status["signal_quality"] =
      signalQuality;

  status["firmware_version"] =
      "1.0.0";

  // ------------------------------
  // Alert Flags
  // ------------------------------

  JsonObject alerts =
      doc.createNestedObject("alert_flags");

  alerts["temperature_out_of_range"] =
      tempAlert;

  alerts["humidity_out_of_range"] =
      humidityAlert;

  alerts["inventory_threshold_breached"] =
      inventoryAlert;
  

  // ------------------------------
  // Print JSON
  // ------------------------------

  serializeJson(doc, Serial);
  Serial.println();

  delay(5000);
}
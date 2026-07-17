CREATE TABLE iot_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reading_id UUID UNIQUE NOT NULL,
    device_id TEXT NOT NULL,
    storage_location_id TEXT NOT NULL,
    sequence_number INTEGER NOT NULL,
    timestamp_utc TIMESTAMPTZ NOT NULL,
    temperature_celsius NUMERIC(5,2),
    humidity_percent NUMERIC(5,2),
    inventory_trigger BOOLEAN NOT NULL DEFAULT false,
    temperature_out_of_range BOOLEAN NOT NULL DEFAULT false,
    humidity_out_of_range BOOLEAN NOT NULL DEFAULT false,
    inventory_threshold_breached BOOLEAN NOT NULL DEFAULT false,
    raw_payload JSONB NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    schema_version TEXT NOT NULL,
    transmission_mode TEXT NOT NULL
);

CREATE TABLE iot_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reading_id UUID NOT NULL REFERENCES iot_readings(id),
    alert_type TEXT NOT NULL,
    storage_location_id TEXT NOT NULL,
    acknowledged BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE iot_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE iot_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_iot_readings" ON iot_readings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_read_iot_alerts" ON iot_alerts FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "service_insert_iot_readings" ON iot_readings FOR INSERT WITH CHECK (true);
CREATE POLICY "service_insert_iot_alerts" ON iot_alerts FOR INSERT WITH CHECK (true);

CREATE POLICY "deny_anon_iot_readings" ON iot_readings FOR ALL USING (auth.uid() IS NULL) WITH CHECK (auth.uid() IS NULL);
CREATE POLICY "deny_anon_iot_alerts" ON iot_alerts FOR ALL USING (auth.uid() IS NULL) WITH CHECK (auth.uid() IS NULL);

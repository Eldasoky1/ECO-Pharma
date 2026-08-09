from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class SensorPayload(BaseModel):
    temperature_celsius: float
    humidity_percent: float
    inventory_trigger: bool
    light_lux: float | None = None
    door_open: bool | None = None


class DeviceStatus(BaseModel):
    battery_level_percent: int
    signal_quality: int
    firmware_version: str


class AlertFlags(BaseModel):
    temperature_out_of_range: bool
    humidity_out_of_range: bool
    inventory_threshold_breached: bool


class IoTSensorReadingBase(BaseModel):
    schema_version: str
    reading_id: str = Field(min_length=1, max_length=128)
    device_id: str
    storage_location_id: str
    sequence_number: int
    timestamp_utc: datetime
    transmission_mode: str
    sensor_payload: SensorPayload
    device_status: DeviceStatus
    alert_flags: AlertFlags


class IoTSensorReadingRequest(IoTSensorReadingBase):
    pass


class IoTIngestionResponse(BaseModel):
    reading_id: str
    accepted: bool
    duplicate: bool = False
    alerts_triggered: list[str] = []


class IoTReadingDetail(IoTSensorReadingBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    received_at: datetime


class IoTReadingListResponse(BaseModel):
    readings: list[IoTReadingDetail]
    total: int


class IoTAlertDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    reading_id: UUID
    alert_type: str
    storage_location_id: str
    acknowledged: bool
    created_at: datetime


class IoTAlertListResponse(BaseModel):
    alerts: list[IoTAlertDetail]
    total: int

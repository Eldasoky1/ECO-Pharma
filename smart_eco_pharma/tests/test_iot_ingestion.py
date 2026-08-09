"""Tests for IoT sensor reading ingestion and alerts."""

from __future__ import annotations

from datetime import datetime
from unittest.mock import AsyncMock, patch

import pytest

from smart_eco_pharma.models.iot import (
    AlertFlags,
    DeviceStatus,
    IoTIngestionResponse,
    IoTReadingListResponse,
    IoTSensorReadingRequest,
    SensorPayload,
)
from smart_eco_pharma.services.iot_service import IoTService


@pytest.fixture
def valid_reading_request() -> IoTSensorReadingRequest:
    return IoTSensorReadingRequest(
        schema_version="1.0",
        reading_id="DEVICE-001-20260715100000-42",
        device_id="DEVICE-001",
        storage_location_id="SHELF-A3",
        sequence_number=42,
        timestamp_utc=datetime(2026, 7, 15, 10, 0, 0),
        transmission_mode="batch",
        sensor_payload=SensorPayload(
            temperature_celsius=22.5,
            humidity_percent=45.0,
            inventory_trigger=False,
            light_lux=120.0,
            door_open=False,
        ),
        device_status=DeviceStatus(
            battery_level_percent=85,
            signal_quality=90,
            firmware_version="2.1.0",
        ),
        alert_flags=AlertFlags(
            temperature_out_of_range=False,
            humidity_out_of_range=False,
            inventory_threshold_breached=False,
        ),
    )


@pytest.fixture
def alert_reading_request() -> IoTSensorReadingRequest:
    return IoTSensorReadingRequest(
        schema_version="1.0",
        reading_id="DEVICE-001-20260715100500-43",
        device_id="DEVICE-001",
        storage_location_id="SHELF-A3",
        sequence_number=43,
        timestamp_utc=datetime(2026, 7, 15, 10, 5, 0),
        transmission_mode="batch",
        sensor_payload=SensorPayload(
            temperature_celsius=35.0,
            humidity_percent=80.0,
            inventory_trigger=True,
            light_lux=0.0,
            door_open=True,
        ),
        device_status=DeviceStatus(
            battery_level_percent=85,
            signal_quality=90,
            firmware_version="2.1.0",
        ),
        alert_flags=AlertFlags(
            temperature_out_of_range=True,
            humidity_out_of_range=True,
            inventory_threshold_breached=True,
        ),
    )


@pytest.mark.asyncio
@patch("smart_eco_pharma.services.iot_service.iot_repository")
@patch("smart_eco_pharma.services.iot_service.inventory_repository")
async def test_ingest_valid_reading(
    mock_inv_repo: AsyncMock,
    mock_iot_repo: AsyncMock,
    valid_reading_request: IoTSensorReadingRequest,
) -> None:
    mock_iot_repo.store_reading = AsyncMock(
        return_value=IoTIngestionResponse(
            reading_id=valid_reading_request.reading_id,
            accepted=True,
            duplicate=False,
        )
    )
    mock_iot_repo.create_alert = AsyncMock()
    mock_inv_repo.get_otc_by_location = AsyncMock(return_value=None)
    svc = IoTService()
    result = await svc.ingest_reading(valid_reading_request)

    assert isinstance(result, IoTIngestionResponse)
    assert result.accepted is True
    assert result.duplicate is False
    assert "unknown_location" in result.alerts_triggered


@pytest.mark.asyncio
@patch("smart_eco_pharma.services.iot_service.iot_repository")
@patch("smart_eco_pharma.services.iot_service.inventory_repository")
async def test_ingest_duplicate_reading(
    mock_inv_repo: AsyncMock,
    mock_iot_repo: AsyncMock,
    valid_reading_request: IoTSensorReadingRequest,
) -> None:
    mock_iot_repo.store_reading = AsyncMock(
        return_value=IoTIngestionResponse(
            reading_id=valid_reading_request.reading_id,
            accepted=False,
            duplicate=True,
        )
    )
    svc = IoTService()
    result = await svc.ingest_reading(valid_reading_request)

    assert result.duplicate is True
    assert result.accepted is False


@pytest.mark.asyncio
@patch("smart_eco_pharma.services.iot_service.iot_repository")
@patch("smart_eco_pharma.services.iot_service.inventory_repository")
async def test_ingest_alert_triggered(
    mock_inv_repo: AsyncMock,
    mock_iot_repo: AsyncMock,
    alert_reading_request: IoTSensorReadingRequest,
) -> None:
    mock_iot_repo.store_reading = AsyncMock(
        return_value=IoTIngestionResponse(
            reading_id=alert_reading_request.reading_id,
            accepted=True,
            duplicate=False,
        )
    )
    mock_iot_repo.create_alert = AsyncMock()
    mock_inv_repo.get_otc_by_location = AsyncMock(return_value=None)
    svc = IoTService()
    result = await svc.ingest_reading(alert_reading_request)

    assert result.accepted is True
    assert "unknown_location" in result.alerts_triggered
    assert "temperature_out_of_range" in result.alerts_triggered
    assert "humidity_out_of_range" in result.alerts_triggered
    assert len(result.alerts_triggered) == 3


@pytest.mark.asyncio
@patch("smart_eco_pharma.services.iot_service.iot_repository")
async def test_list_recent_readings(mock_repo: AsyncMock) -> None:
    mock_repo.list_recent_readings = AsyncMock(return_value=[])
    svc = IoTService()
    result = await svc.list_recent_readings(
        limit=100, storage_location_id=None, from_timestamp=None
    )

    assert isinstance(result, IoTReadingListResponse)
    assert result.total == 0
    assert result.readings == []

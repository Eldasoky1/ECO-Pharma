"""Business-logic layer for IoT sensor ingestion and alerting."""

from __future__ import annotations

from ..models.iot import (
    IoTSensorReadingRequest,
    IoTIngestionResponse,
    IoTReadingListResponse,
    IoTAlertListResponse,
)
from ..repositories import inventory_repository, iot_repository


class IoTService:
    """Facade over IoT and inventory repositories for sensor data."""

    async def ingest_reading(
        self, reading: IoTSensorReadingRequest
    ) -> IoTIngestionResponse:
        raw = reading.model_dump(mode="json")
        ingestion = await iot_repository.store_reading(raw)

        if not ingestion.accepted:
            return ingestion

        alerts_triggered: list[str] = []

        flags = reading.alert_flags
        location_id = reading.storage_location_id
        reading_id = reading.reading_id

        # Validate storage_location_id exists in otc_inventory
        location_item = await inventory_repository.get_otc_by_location(location_id)
        if location_item is None:
            alerts_triggered.append("unknown_location")

        if flags.temperature_out_of_range:
            await iot_repository.create_alert(
                reading_id, "temperature_out_of_range", location_id
            )
            alerts_triggered.append("temperature_out_of_range")

        if flags.humidity_out_of_range:
            await iot_repository.create_alert(
                reading_id, "humidity_out_of_range", location_id
            )
            alerts_triggered.append("humidity_out_of_range")

        if flags.inventory_threshold_breached:
            inventory_item = await inventory_repository.get_otc_by_location(
                location_id
            )
            if inventory_item is not None:
                new_status = (
                    "critical"
                    if reading.sensor_payload.inventory_trigger
                    else "low"
                )
                await inventory_repository.update_reorder_status(
                    inventory_item.id, new_status
                )
                alerts_triggered.append("inventory_reorder_triggered")

        ingestion.alerts_triggered = alerts_triggered
        return ingestion

    async def list_recent_readings(
        self,
        limit: int,
        storage_location_id: str | None,
        from_timestamp: str | None,
    ) -> IoTReadingListResponse:
        readings = await iot_repository.list_recent_readings(
            limit=limit,
            storage_location_id=storage_location_id,
            from_timestamp=from_timestamp,
        )
        return IoTReadingListResponse(readings=readings, total=len(readings))

    async def list_active_alerts(self) -> IoTAlertListResponse:
        alerts = await iot_repository.list_active_alerts()
        return IoTAlertListResponse(alerts=alerts, total=len(alerts))

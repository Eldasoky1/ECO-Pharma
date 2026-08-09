from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from ..database import anon_client, service_client
from ..models.iot import (
    IoTAlertDetail,
    IoTIngestionResponse,
    IoTReadingDetail,
)


async def store_reading(data: dict) -> IoTIngestionResponse:
    reading_id = data["reading_id"]

    # JUSTIFIED: IoT ingestion is a system-level operation — edge devices
    # transmit sensor data via a service account that has no Supabase auth
    # session, so RLS bypass is required to write readings from the device
    # pipeline.
    duplicate_check = (
        service_client.table("iot_readings")
        .select("reading_id")
        .eq("reading_id", reading_id)
        .limit(1)
        .execute()
    )

    if duplicate_check.data:
        return IoTIngestionResponse(
            reading_id=reading_id,
            accepted=False,
            duplicate=True,
        )

    insert_data = {**data, "received_at": datetime.now(timezone.utc).isoformat()}
    service_client.table("iot_readings").insert(insert_data).execute()

    return IoTIngestionResponse(
        reading_id=reading_id,
        accepted=True,
        duplicate=False,
    )


async def list_recent_readings(
    limit: int = 100,
    storage_location_id: str | None = None,
    from_timestamp: str | None = None,
) -> list[IoTReadingDetail]:
    query = anon_client.table("iot_readings").select("*")

    if storage_location_id:
        query = query.eq("storage_location_id", storage_location_id)
    if from_timestamp:
        query = query.gte("timestamp_utc", from_timestamp)

    response = query.order("timestamp_utc", desc=True).limit(limit).execute()

    return [IoTReadingDetail.model_validate(row) for row in (response.data or [])]


async def list_active_alerts() -> list[IoTAlertDetail]:
    response = (
        anon_client.table("iot_alerts")
        .select("*")
        .eq("acknowledged", False)
        .order("created_at", desc=True)
        .execute()
    )

    return [IoTAlertDetail.model_validate(row) for row in (response.data or [])]


async def create_alert(
    reading_id: UUID, alert_type: str, storage_location_id: str
) -> IoTAlertDetail:
    # JUSTIFIED: IoT alert creation is a system-level operation — the ingestion
    # pipeline generates alerts when thresholds are breached, requiring RLS
    # bypass to insert alert records from the service account.
    payload = {
        "reading_id": str(reading_id),
        "alert_type": alert_type,
        "storage_location_id": storage_location_id,
        "acknowledged": False,
    }

    response = service_client.table("iot_alerts").insert(payload).execute()

    return IoTAlertDetail.model_validate(response.data[0])

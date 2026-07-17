"""FastAPI router for IoT sensor reading ingestion and alerting."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query, status

from ..auth import AuthUser, get_current_user
from ..models.iot import (
    IoTSensorReadingRequest,
    IoTIngestionResponse,
    IoTReadingListResponse,
    IoTAlertListResponse,
)
from ..services.iot_service import IoTService

router = APIRouter(tags=["iot"])

Auth = Annotated[AuthUser, Depends(get_current_user)]


@router.post(
    "/readings",
    response_model=IoTIngestionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def ingest_reading(
    _user: Auth, body: IoTSensorReadingRequest
) -> IoTIngestionResponse:
    """Ingest a single IoT sensor reading.

    Duplicate ``reading_id`` values are accepted but flagged with
    ``duplicate: true`` in the response.
    """
    svc = IoTService()
    return await svc.ingest_reading(body)


@router.get("/readings", response_model=IoTReadingListResponse)
async def list_readings(
    _user: Auth,
    storage_location_id: str | None = Query(None),
    from_timestamp: str | None = Query(None),
    limit: int = Query(100, le=1000),
) -> IoTReadingListResponse:
    """Return recent IoT sensor readings, optionally filtered."""
    svc = IoTService()
    return await svc.list_recent_readings(
        limit=limit,
        storage_location_id=storage_location_id,
        from_timestamp=from_timestamp,
    )


@router.get("/alerts", response_model=IoTAlertListResponse)
async def list_alerts(_user: Auth) -> IoTAlertListResponse:
    """Return all unacknowledged IoT alerts."""
    svc = IoTService()
    return await svc.list_active_alerts()

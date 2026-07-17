from __future__ import annotations

from datetime import date, datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ReorderStatus(str, Enum):
    normal = "normal"
    low = "low"
    critical = "critical"
    on_order = "on_order"


class OTCInventoryBase(BaseModel):
    drug_id: UUID
    stock_quantity: int
    stock_unit: str
    min_stock_threshold: int | None = None
    reorder_quantity: int | None = None
    max_storage_capacity: int | None = None
    storage_location_identifier: str
    storage_temp_min_c: float | None = None
    storage_temp_max_c: float | None = None
    storage_humidity_min_pct: float | None = None
    storage_humidity_max_pct: float | None = None
    batch_expiry_date: date | None = None
    supplier_ref: str | None = None
    last_restocked_date: date | None = None
    reorder_status: ReorderStatus


class OTCInventoryCreate(OTCInventoryBase):
    pass


class OTCInventoryUpdate(BaseModel):
    drug_id: UUID | None = None
    stock_quantity: int | None = None
    stock_unit: str | None = None
    min_stock_threshold: int | None = None
    reorder_quantity: int | None = None
    max_storage_capacity: int | None = None
    storage_location_identifier: str | None = None
    storage_temp_min_c: float | None = None
    storage_temp_max_c: float | None = None
    storage_humidity_min_pct: float | None = None
    storage_humidity_max_pct: float | None = None
    batch_expiry_date: date | None = None
    supplier_ref: str | None = None
    last_restocked_date: date | None = None
    reorder_status: ReorderStatus | None = None


class OTCInventoryDetail(OTCInventoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime


class OTCInventoryListResponse(BaseModel):
    inventory: list[OTCInventoryDetail]
    total: int
    limit: int
    offset: int


class ReorderStatusUpdateRequest(BaseModel):
    reorder_status: ReorderStatus


class ReorderStatusUpdateResponse(BaseModel):
    id: UUID
    reorder_status: ReorderStatus
    updated_at: datetime

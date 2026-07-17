from __future__ import annotations

from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class RegulatoryStatus(str, Enum):
    prescription_only = "prescription_only"
    otc = "otc"
    controlled = "controlled"


class DrugBase(BaseModel):
    drug_name: str
    brand_name: str | None = None
    drug_class: str | None = None
    regulatory_status: RegulatoryStatus
    dosage_forms: list[str] | None = None
    active_ingredients: str
    route_of_administration: str | None = None


class DrugCreate(DrugBase):
    pass


class DrugUpdate(BaseModel):
    drug_name: str | None = None
    brand_name: str | None = None
    drug_class: str | None = None
    regulatory_status: RegulatoryStatus | None = None
    dosage_forms: list[str] | None = None
    active_ingredients: str | None = None
    route_of_administration: str | None = None


class DrugDetail(DrugBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    record_version: int
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None


class DrugListResponse(BaseModel):
    drugs: list[DrugDetail]
    total: int
    limit: int
    offset: int

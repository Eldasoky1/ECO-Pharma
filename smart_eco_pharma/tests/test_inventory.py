"""Tests for drug inventory and OTC endpoints."""

from __future__ import annotations

from datetime import date, datetime
from unittest.mock import AsyncMock, patch
from uuid import uuid4

import pytest

from smart_eco_pharma.models.drug import DrugDetail, DrugListResponse, RegulatoryStatus
from smart_eco_pharma.models.inventory import (
    OTCInventoryCreate,
    OTCInventoryDetail,
    ReorderStatus,
    ReorderStatusUpdateResponse,
)
from smart_eco_pharma.services.inventory_service import InventoryService


@pytest.fixture
def sample_drug_id() -> str:
    return "550e8400-e29b-41d4-a716-446655440001"


@pytest.fixture
def sample_inventory_id() -> str:
    return "660e8400-e29b-41d4-a716-446655440002"


@pytest.fixture
def sample_drug(sample_drug_id: str) -> DrugDetail:
    return DrugDetail(
        id=sample_drug_id,
        drug_name="Paracetamol",
        brand_name="Tylenol",
        drug_class="Analgesic",
        regulatory_status=RegulatoryStatus.otc,
        dosage_forms=["tablet", "syrup"],
        active_ingredients="Acetaminophen 500mg",
        route_of_administration="oral",
        record_version=1,
        created_at=datetime(2026, 1, 1),
        updated_at=datetime(2026, 1, 1),
    )


@pytest.fixture
def sample_otc_detail(sample_drug_id: str, sample_inventory_id: str) -> OTCInventoryDetail:
    return OTCInventoryDetail(
        id=sample_inventory_id,
        drug_id=sample_drug_id,
        stock_quantity=200,
        stock_unit="tablets",
        min_stock_threshold=50,
        reorder_quantity=100,
        max_storage_capacity=500,
        storage_location_identifier="SHELF-A3",
        storage_temp_min_c=15.0,
        storage_temp_max_c=25.0,
        storage_humidity_min_pct=30.0,
        storage_humidity_max_pct=60.0,
        batch_expiry_date=date(2027, 6, 30),
        supplier_ref="PharmaCo-Egypt",
        last_restocked_date=date(2026, 7, 1),
        reorder_status=ReorderStatus.normal,
        created_at=datetime(2026, 1, 1),
        updated_at=datetime(2026, 1, 1),
    )


@pytest.mark.asyncio
@patch("smart_eco_pharma.services.inventory_service.drug_repository")
async def test_list_drugs(mock_repo: AsyncMock, sample_drug: DrugDetail) -> None:
    mock_repo.list_drugs = AsyncMock(return_value=([sample_drug], 1))
    svc = InventoryService()
    result = await svc.list_drugs(limit=50, offset=0, search=None)

    assert isinstance(result, DrugListResponse)
    assert result.total == 1
    assert len(result.drugs) == 1
    assert result.drugs[0].drug_name == "Paracetamol"


@pytest.mark.asyncio
@patch("smart_eco_pharma.services.inventory_service.drug_repository")
async def test_get_drug_found(mock_repo: AsyncMock, sample_drug: DrugDetail) -> None:
    mock_repo.get_drug_by_id = AsyncMock(return_value=sample_drug)
    svc = InventoryService()
    result = await svc.get_drug(sample_drug.id)

    assert result.drug_name == "Paracetamol"
    mock_repo.get_drug_by_id.assert_awaited_once_with(sample_drug.id)


@pytest.mark.asyncio
@patch("smart_eco_pharma.services.inventory_service.drug_repository")
async def test_get_drug_not_found(mock_repo: AsyncMock) -> None:
    mock_repo.get_drug_by_id = AsyncMock(return_value=None)
    svc = InventoryService()

    with pytest.raises(Exception) as exc_info:
        await svc.get_drug(uuid4())

    assert "not found" in str(exc_info.value.detail)


@pytest.mark.asyncio
@patch("smart_eco_pharma.services.inventory_service.inventory_repository")
async def test_create_otc(mock_repo: AsyncMock, sample_otc_detail: OTCInventoryDetail) -> None:
    mock_repo.create_otc = AsyncMock(return_value=sample_otc_detail)
    svc = InventoryService()
    payload = OTCInventoryCreate(
        drug_id=sample_otc_detail.drug_id,
        stock_quantity=200,
        stock_unit="tablets",
        min_stock_threshold=50,
        reorder_quantity=100,
        max_storage_capacity=500,
        storage_location_identifier="SHELF-A3",
        storage_temp_min_c=15.0,
        storage_temp_max_c=25.0,
        storage_humidity_min_pct=30.0,
        storage_humidity_max_pct=60.0,
        batch_expiry_date=date(2027, 6, 30),
        supplier_ref="PharmaCo-Egypt",
        last_restocked_date=date(2026, 7, 1),
        reorder_status=ReorderStatus.normal,
    )
    result = await svc.create_otc(payload)

    assert isinstance(result, OTCInventoryDetail)
    assert result.storage_location_identifier == "SHELF-A3"
    mock_repo.create_otc.assert_awaited_once()


@pytest.mark.asyncio
@patch("smart_eco_pharma.services.inventory_service.inventory_repository")
async def test_update_reorder_status(mock_repo: AsyncMock, sample_otc_detail: OTCInventoryDetail) -> None:
    updated_detail = sample_otc_detail.model_copy(update={"reorder_status": ReorderStatus.low})
    mock_repo.update_reorder_status = AsyncMock(return_value=updated_detail)
    svc = InventoryService()
    result = await svc.update_reorder_status(sample_otc_detail.id, "low")

    assert isinstance(result, ReorderStatusUpdateResponse)
    assert result.reorder_status == ReorderStatus.low
    mock_repo.update_reorder_status.assert_awaited_once_with(sample_otc_detail.id, "low")

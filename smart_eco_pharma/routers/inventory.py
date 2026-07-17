"""FastAPI router for drug catalogue and OTC inventory endpoints."""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status

from ..auth import AuthUser, get_current_user
from ..models.drug import DrugDetail, DrugListResponse
from ..models.inventory import (
    OTCInventoryCreate,
    OTCInventoryDetail,
    OTCInventoryListResponse,
    OTCInventoryUpdate,
    ReorderStatusUpdateRequest,
    ReorderStatusUpdateResponse,
)
from ..services.inventory_service import InventoryService

router = APIRouter(tags=["inventory"])

Auth = Annotated[AuthUser, Depends(get_current_user)]


@router.get("/drugs", response_model=DrugListResponse)
async def list_drugs(
    _user: Auth,
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
    search: str | None = Query(None),
) -> DrugListResponse:
    """Return a paginated list of drugs from the master catalogue."""
    svc = InventoryService()
    return await svc.list_drugs(limit=limit, offset=offset, search=search)


@router.get("/drugs/{drug_id}", response_model=DrugDetail)
async def get_drug(_user: Auth, drug_id: UUID) -> DrugDetail:
    """Return a single drug by ID."""
    svc = InventoryService()
    return await svc.get_drug(drug_id)


@router.get("/otc", response_model=OTCInventoryListResponse)
async def list_otc(
    _user: Auth,
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
    reorder_status: str | None = Query(None),
    storage_location_id: str | None = Query(None),
) -> OTCInventoryListResponse:
    """Return a paginated list of OTC inventory records."""
    svc = InventoryService()
    return await svc.list_otc(
        limit=limit,
        offset=offset,
        reorder_status=reorder_status,
        storage_location_id=storage_location_id,
    )


@router.get("/otc/{inventory_id}", response_model=OTCInventoryDetail)
async def get_otc(_user: Auth, inventory_id: UUID) -> OTCInventoryDetail:
    """Return a single OTC inventory record by ID."""
    svc = InventoryService()
    return await svc.get_otc(inventory_id)


@router.post(
    "/otc", response_model=OTCInventoryDetail, status_code=status.HTTP_201_CREATED
)
async def create_otc(_user: Auth, data: OTCInventoryCreate) -> OTCInventoryDetail:
    """Create a new OTC inventory record."""
    svc = InventoryService()
    return await svc.create_otc(data)


@router.put("/otc/{inventory_id}", response_model=OTCInventoryDetail)
async def update_otc(
    _user: Auth, inventory_id: UUID, data: OTCInventoryUpdate
) -> OTCInventoryDetail:
    """Replace an existing OTC inventory record."""
    svc = InventoryService()
    return await svc.update_otc(inventory_id, data)


@router.patch(
    "/otc/{inventory_id}/reorder-status",
    response_model=ReorderStatusUpdateResponse,
)
async def update_reorder_status(
    _user: Auth, inventory_id: UUID, body: ReorderStatusUpdateRequest
) -> ReorderStatusUpdateResponse:
    """Update only the reorder status of an OTC inventory record."""
    svc = InventoryService()
    return await svc.update_reorder_status(
        inventory_id, body.reorder_status.value
    )


@router.delete(
    "/drugs/{drug_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_drug(_user: Auth, drug_id: UUID) -> None:
    """Soft-delete a drug from the master catalogue."""
    svc = InventoryService()
    await svc.soft_delete_drug(drug_id)

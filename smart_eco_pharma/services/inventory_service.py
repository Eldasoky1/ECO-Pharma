"""Business-logic layer for drug catalog and OTC inventory operations."""

from __future__ import annotations

from uuid import UUID

from fastapi import HTTPException, status

from ..models.drug import DrugDetail, DrugListResponse
from ..models.inventory import (
    OTCInventoryCreate,
    OTCInventoryDetail,
    OTCInventoryListResponse,
    OTCInventoryUpdate,
    ReorderStatusUpdateResponse,
)
from ..repositories import drug_repository, inventory_repository


class InventoryService:
    """Facade over drug and inventory repositories."""

    # ── drug catalogue ────────────────────────────────────────────────

    async def list_drugs(
        self, limit: int, offset: int, search: str | None
    ) -> DrugListResponse:
        drugs, total = await drug_repository.list_drugs(
            limit=limit, offset=offset, search=search
        )
        return DrugListResponse(drugs=drugs, total=total, limit=limit, offset=offset)

    async def get_drug(self, drug_id: UUID) -> DrugDetail:
        drug = await drug_repository.get_drug_by_id(drug_id)
        if drug is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Drug {drug_id} not found",
            )
        return drug

    async def soft_delete_drug(self, drug_id: UUID) -> None:
        deleted = await drug_repository.soft_delete_drug(drug_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Drug {drug_id} not found",
            )

    # ── OTC inventory ────────────────────────────────────────────────

    async def list_otc(
        self,
        limit: int,
        offset: int,
        reorder_status: str | None,
        storage_location_id: str | None,
    ) -> OTCInventoryListResponse:
        items, total = await inventory_repository.list_otc(
            limit=limit,
            offset=offset,
            reorder_status=reorder_status,
            storage_location_id=storage_location_id,
        )
        return OTCInventoryListResponse(
            inventory=items, total=total, limit=limit, offset=offset
        )

    async def get_otc(self, inventory_id: UUID) -> OTCInventoryDetail:
        item = await inventory_repository.get_otc_by_id(inventory_id)
        if item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"OTC inventory {inventory_id} not found",
            )
        return item

    async def create_otc(self, data: OTCInventoryCreate) -> OTCInventoryDetail:
        return await inventory_repository.create_otc(data)

    async def update_otc(
        self, inventory_id: UUID, data: OTCInventoryUpdate
    ) -> OTCInventoryDetail:
        item = await inventory_repository.update_otc(inventory_id, data)
        if item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"OTC inventory {inventory_id} not found",
            )
        return item

    async def update_reorder_status(
        self, inventory_id: UUID, status_value: str
    ) -> ReorderStatusUpdateResponse:
        item = await inventory_repository.update_reorder_status(
            inventory_id, status_value
        )
        if item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"OTC inventory {inventory_id} not found",
            )
        return ReorderStatusUpdateResponse(
            id=item.id,
            reorder_status=item.reorder_status,
            updated_at=item.updated_at,
        )

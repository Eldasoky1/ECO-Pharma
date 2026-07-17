from __future__ import annotations


from uuid import UUID

from ..database import anon_client, service_client
from ..models.inventory import (
    OTCInventoryCreate,
    OTCInventoryDetail,
    OTCInventoryUpdate,
)


async def list_otc(
    limit: int = 50,
    offset: int = 0,
    reorder_status: str | None = None,
    storage_location_id: str | None = None,
) -> tuple[list[OTCInventoryDetail], int]:
    query = anon_client.table("otc_inventory").select("*")

    if reorder_status:
        query = query.eq("reorder_status", reorder_status)
    if storage_location_id:
        query = query.eq("storage_location_identifier", storage_location_id)

    count_response = query.execute()
    total = len(count_response.data) if count_response.data else 0

    paginated = query.range(offset, offset + limit - 1).execute()
    items = [OTCInventoryDetail.model_validate(row) for row in (paginated.data or [])]

    return items, total


async def get_otc_by_id(inventory_id: UUID) -> OTCInventoryDetail | None:
    response = (
        anon_client.table("otc_inventory")
        .select("*")
        .eq("id", str(inventory_id))
        .limit(1)
        .execute()
    )

    if not response.data:
        return None

    return OTCInventoryDetail.model_validate(response.data[0])


async def create_otc(data: OTCInventoryCreate) -> OTCInventoryDetail:
    payload = data.model_dump(mode="json")
    response = anon_client.table("otc_inventory").insert(payload).execute()

    return OTCInventoryDetail.model_validate(response.data[0])


async def update_otc(
    inventory_id: UUID, data: OTCInventoryUpdate
) -> OTCInventoryDetail | None:
    payload = data.model_dump(mode="json", exclude_unset=True)
    if not payload:
        return await get_otc_by_id(inventory_id)

    response = (
        anon_client.table("otc_inventory")
        .update(payload)
        .eq("id", str(inventory_id))
        .execute()
    )

    if not response.data:
        return None

    return OTCInventoryDetail.model_validate(response.data[0])


async def update_reorder_status(
    inventory_id: UUID, status: str
) -> OTCInventoryDetail | None:
    # JUSTIFIED: IoT ingestion system operation — sensors push reorder status
    # changes via a service account, requiring RLS bypass to write inventory
    # updates from the edge-device pipeline.
    response = (
        service_client.table("otc_inventory")
        .update({"reorder_status": status})
        .eq("id", str(inventory_id))
        .execute()
    )

    if not response.data:
        return None

    return OTCInventoryDetail.model_validate(response.data[0])


async def get_otc_by_location(storage_location_id: str) -> OTCInventoryDetail | None:
    response = (
        anon_client.table("otc_inventory")
        .select("*")
        .eq("storage_location_identifier", storage_location_id)
        .limit(1)
        .execute()
    )

    if not response.data:
        return None

    return OTCInventoryDetail.model_validate(response.data[0])

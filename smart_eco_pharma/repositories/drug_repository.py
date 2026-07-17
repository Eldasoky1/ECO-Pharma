from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from ..database import anon_client, service_client
from ..models.drug import DrugDetail


async def list_drugs(
    limit: int = 50, offset: int = 0, search: str | None = None
) -> tuple[list[DrugDetail], int]:
    query = anon_client.table("drug_master").select("*").eq("deleted_at", None)

    if search:
        query = query.or_(
            f"drug_name.ilike.%{search}%,brand_name.ilike.%{search}%"
        )

    count_response = query.execute()
    total = len(count_response.data) if count_response.data else 0

    paginated = query.range(offset, offset + limit - 1).execute()
    drugs = [DrugDetail.model_validate(row) for row in (paginated.data or [])]

    return drugs, total


async def get_drug_by_id(drug_id: UUID) -> DrugDetail | None:
    response = (
        anon_client.table("drug_master")
        .select("*")
        .eq("id", str(drug_id))
        .is_("deleted_at", "null")
        .limit(1)
        .execute()
    )

    if not response.data:
        return None

    return DrugDetail.model_validate(response.data[0])


async def soft_delete_drug(drug_id: UUID) -> bool:
    # JUSTIFIED: System-level soft delete — requires bypassing RLS to ensure
    # the record is marked deleted even when the requesting user lacks direct
    # write permission (architecture_lead administrative action).
    response = (
        service_client.table("drug_master")
        .update({"deleted_at": datetime.now(timezone.utc).isoformat()})
        .eq("id", str(drug_id))
        .is_("deleted_at", "null")
        .execute()
    )

    return len(response.data or []) > 0

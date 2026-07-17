from __future__ import annotations

from uuid import UUID

from ..database import anon_client, service_client
from ..models.interaction import InteractionDetail


async def list_interactions(
    limit: int = 50,
    offset: int = 0,
    drug_id: UUID | None = None,
    risk_grade: str | None = None,
) -> tuple[list[InteractionDetail], int]:
    query = anon_client.table("drug_interactions").select("*")

    if drug_id:
        drug_id_str = str(drug_id)
        query = query.or_(
            f"drug_a_id.eq.{drug_id_str},drug_b_id.eq.{drug_id_str}"
        )
    if risk_grade:
        query = query.eq("risk_grade", risk_grade)

    count_response = query.execute()
    total = len(count_response.data) if count_response.data else 0

    paginated = query.range(offset, offset + limit - 1).execute()
    interactions = [
        InteractionDetail.model_validate(row) for row in (paginated.data or [])
    ]

    return interactions, total


async def get_interaction_by_id(interaction_id: UUID) -> InteractionDetail | None:
    response = (
        anon_client.table("drug_interactions")
        .select("*")
        .eq("id", str(interaction_id))
        .limit(1)
        .execute()
    )

    if not response.data:
        return None

    return InteractionDetail.model_validate(response.data[0])


async def check_pairs(drug_ids: list[UUID]) -> list[InteractionDetail]:
    id_strings = [str(did) for did in drug_ids]
    response = (
        anon_client.table("drug_interactions")
        .select("*")
        .in_("drug_a_id", id_strings)
        .in_("drug_b_id", id_strings)
        .execute()
    )

    return [InteractionDetail.model_validate(row) for row in (response.data or [])]


async def create_interaction(data: dict) -> InteractionDetail:
    # JUSTIFIED: GPT-4o pharmacovigilance pipeline system write — the AI
    # interaction-analysis service generates and persists interaction records
    # autonomously, requiring RLS bypass to insert as a system actor.
    response = service_client.table("drug_interactions").insert(data).execute()

    return InteractionDetail.model_validate(response.data[0])

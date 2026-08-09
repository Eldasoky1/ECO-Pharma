"""Business-logic layer for drug-drug interaction queries."""

from __future__ import annotations

from uuid import UUID

from fastapi import HTTPException, status

from ..models.interaction import (
    InteractionCheckResponse,
    InteractionDetail,
    InteractionListResponse,
)
from ..repositories import interaction_repository

_RISK_SORT_ORDER: dict[str, int] = {
    "grade_4_contraindicated": 4,
    "grade_3_severe": 3,
    "grade_2_moderate": 2,
    "grade_1_minimal": 1,
}

_SEVERITY_SORT_ORDER: dict[str, int] = {
    "MAJOR": 4,
    "MODERATE": 3,
    "MINOR": 2,
    "NONE_KNOWN": 1,
}


class InteractionService:
    """Facade over the interaction repository."""

    async def list_interactions(
        self,
        limit: int,
        offset: int,
        drug_id: UUID | None,
        risk_grade: str | None,
    ) -> InteractionListResponse:
        interactions, total = await interaction_repository.list_interactions(
            limit=limit, offset=offset, drug_id=drug_id, risk_grade=risk_grade
        )
        return InteractionListResponse(
            interactions=interactions, total=total, limit=limit, offset=offset
        )

    async def get_interaction(self, interaction_id: UUID) -> InteractionDetail:
        interaction = await interaction_repository.get_interaction_by_id(
            interaction_id
        )
        if interaction is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Interaction {interaction_id} not found",
            )
        return interaction

    async def check_pairs(
        self, drug_ids: list[UUID]
    ) -> InteractionCheckResponse:
        all_interactions = await interaction_repository.check_pairs(drug_ids)

        drug_id_set = {str(did) for did in drug_ids}
        matched = [
            ix
            for ix in all_interactions
            if str(ix.drug_a_id) in drug_id_set
            and str(ix.drug_b_id) in drug_id_set
        ]

        matched.sort(
            key=lambda ix: (
                _SEVERITY_SORT_ORDER.get(ix.severity.value, 0)
                if ix.severity
                else _RISK_SORT_ORDER.get(ix.risk_grade.value, 0)
            ),
            reverse=True,
        )

        return InteractionCheckResponse(
            pairs=matched, total_pairs_found=len(matched)
        )

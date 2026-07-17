"""FastAPI router for drug-drug interaction endpoints."""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query

from ..auth import AuthUser, get_current_user
from ..models.interaction import (
    InteractionCheckRequest,
    InteractionCheckResponse,
    InteractionDetail,
    InteractionListResponse,
)
from ..services.interaction_service import InteractionService

router = APIRouter(tags=["interactions"])

Auth = Annotated[AuthUser, Depends(get_current_user)]


@router.get("", response_model=InteractionListResponse)
async def list_interactions(
    _user: Auth,
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
    drug_id: UUID | None = Query(None),
    risk_grade: str | None = Query(None),
) -> InteractionListResponse:
    """Return a paginated list of drug interactions, optionally filtered."""
    svc = InteractionService()
    return await svc.list_interactions(
        limit=limit, offset=offset, drug_id=drug_id, risk_grade=risk_grade
    )


@router.get("/{interaction_id}", response_model=InteractionDetail)
async def get_interaction(_user: Auth, interaction_id: UUID) -> InteractionDetail:
    """Return a single drug interaction by ID."""
    svc = InteractionService()
    return await svc.get_interaction(interaction_id)


@router.post("/check", response_model=InteractionCheckResponse)
async def check_pairs(
    _user: Auth, body: InteractionCheckRequest
) -> InteractionCheckResponse:
    """Check all interactions between a set of drugs, sorted by risk grade."""
    svc = InteractionService()
    return await svc.check_pairs(body.drug_ids)

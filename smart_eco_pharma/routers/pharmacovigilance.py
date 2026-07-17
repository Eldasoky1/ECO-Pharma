"""Pharmacovigilance router — endpoints for AI-powered drug interaction analysis."""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from ..auth import AuthUser, get_current_user
from ..models.pharmacovigilance import (
    PVAnalysisRequest,
    PVAnalysisResponse,
    PVReportListResponse,
)
from ..services.pv_service import PVService

router = APIRouter()
_pv_service = PVService()

Auth = Annotated[AuthUser, Depends(get_current_user)]


@router.post("/analyze", response_model=PVAnalysisResponse, status_code=200)
async def analyze_interaction(
    _user: Auth, body: PVAnalysisRequest
) -> PVAnalysisResponse:
    """Analyze a drug-drug interaction using the GPT-4o pharmacovigilance pipeline."""
    try:
        return await _pv_service.analyze_interaction(
            drug_a_id=body.drug_a_id,
            drug_b_id=body.drug_b_id,
            clinical_context=body.clinical_context,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.get("/reports/{drug_id}", response_model=PVReportListResponse)
async def get_drug_reports(_user: Auth, drug_id: UUID) -> PVReportListResponse:
    """Retrieve all AI-generated pharmacovigilance reports for a specific drug."""
    try:
        return await _pv_service.get_drug_reports(drug_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))

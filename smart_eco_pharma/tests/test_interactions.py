"""Tests for drug-drug interaction endpoints."""

from __future__ import annotations

from datetime import datetime
from unittest.mock import AsyncMock, patch
from uuid import UUID, uuid4

import pytest

from smart_eco_pharma.models.interaction import (
    EvidenceLevel,
    InteractionCheckResponse,
    InteractionDetail,
    InteractionListResponse,
    RiskGrade,
)
from smart_eco_pharma.services.interaction_service import InteractionService


@pytest.fixture
def sample_interaction_id() -> str:
    return "770e8400-e29b-41d4-a716-446655440003"


@pytest.fixture
def sample_interaction(sample_interaction_id: str) -> InteractionDetail:
    return InteractionDetail(
        id=sample_interaction_id,
        drug_a_id="550e8400-e29b-41d4-a716-446655440001",
        drug_b_id="550e8400-e29b-41d4-a716-446655440002",
        interaction_type="pharmacodynamic",
        risk_grade=RiskGrade.grade_2_moderate,
        clinical_consequence="Increased risk of GI bleeding when combined.",
        evidence_level=EvidenceLevel.established,
        mechanism="COX-2 inhibition pathway",
        management_recommendation="Monitor patient for signs of GI bleeding.",
        ai_generated=False,
        gpt_model_version=None,
        source_reference="DrugBank DB00316",
        created_at=datetime(2026, 1, 1),
        updated_at=datetime(2026, 1, 1),
    )


@pytest.mark.asyncio
@patch("smart_eco_pharma.services.interaction_service.interaction_repository")
async def test_list_interactions(mock_repo: AsyncMock, sample_interaction: InteractionDetail) -> None:
    mock_repo.list_interactions = AsyncMock(return_value=([sample_interaction], 1))
    svc = InteractionService()
    result = await svc.list_interactions(limit=50, offset=0, drug_id=None, risk_grade=None)

    assert isinstance(result, InteractionListResponse)
    assert result.total == 1
    assert len(result.interactions) == 1
    assert result.interactions[0].risk_grade == RiskGrade.grade_2_moderate


@pytest.mark.asyncio
@patch("smart_eco_pharma.services.interaction_service.interaction_repository")
async def test_check_pairs_found(mock_repo: AsyncMock, sample_interaction: InteractionDetail) -> None:
    mock_repo.check_pairs = AsyncMock(return_value=[sample_interaction])
    svc = InteractionService()
    drug_ids = [
        UUID(sample_interaction.drug_a_id.hex),
        UUID(sample_interaction.drug_b_id.hex),
    ]
    result = await svc.check_pairs(drug_ids)

    assert isinstance(result, InteractionCheckResponse)
    assert result.total_pairs_found == 1
    assert len(result.pairs) == 1


@pytest.mark.asyncio
@patch("smart_eco_pharma.services.interaction_service.interaction_repository")
async def test_check_pairs_empty(mock_repo: AsyncMock) -> None:
    mock_repo.check_pairs = AsyncMock(return_value=[])
    svc = InteractionService()
    drug_ids = [uuid4(), uuid4()]
    result = await svc.check_pairs(drug_ids)

    assert result.total_pairs_found == 0
    assert result.pairs == []


@pytest.mark.asyncio
@patch("smart_eco_pharma.services.interaction_service.interaction_repository")
async def test_get_interaction_not_found(mock_repo: AsyncMock) -> None:
    mock_repo.get_interaction_by_id = AsyncMock(return_value=None)
    svc = InteractionService()

    with pytest.raises(Exception) as exc_info:
        await svc.get_interaction(uuid4())

    assert "not found" in str(exc_info.value.detail)

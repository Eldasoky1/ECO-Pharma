"""Tests for pharmacovigilance GPT-4o analysis pipeline."""

from __future__ import annotations

import json
from datetime import datetime
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest

from smart_eco_pharma.models.drug import DrugDetail, RegulatoryStatus
from smart_eco_pharma.models.interaction import (
    EvidenceLevel,
    InteractionConfidence,
    InteractionDetail,
    InteractionSeverity,
    InteractionSource,
    RiskGrade,
)
from smart_eco_pharma.models.pharmacovigilance import (
    PVAnalysisResponse,
    PVReportListResponse,
)
from smart_eco_pharma.services.pv_service import PVService


@pytest.fixture
def drug_a() -> DrugDetail:
    return DrugDetail(
        id="550e8400-e29b-41d4-a716-446655440001",
        drug_name="Warfarin",
        brand_name="Coumadin",
        drug_class="Anticoagulant",
        regulatory_status=RegulatoryStatus.prescription_only,
        dosage_forms=["tablet"],
        active_ingredients="Warfarin sodium 5mg",
        route_of_administration="oral",
        record_version=1,
        created_at=datetime(2026, 1, 1),
        updated_at=datetime(2026, 1, 1),
    )


@pytest.fixture
def drug_b() -> DrugDetail:
    return DrugDetail(
        id="550e8400-e29b-41d4-a716-446655440002",
        drug_name="Aspirin",
        brand_name="Bayer",
        drug_class="NSAID",
        regulatory_status=RegulatoryStatus.otc,
        dosage_forms=["tablet"],
        active_ingredients="Acetylsalicylic acid 325mg",
        route_of_administration="oral",
        record_version=1,
        created_at=datetime(2026, 1, 1),
        updated_at=datetime(2026, 1, 1),
    )


@pytest.fixture
def created_interaction() -> InteractionDetail:
    return InteractionDetail(
        id="770e8400-e29b-41d4-a716-446655440003",
        drug_a_id="550e8400-e29b-41d4-a716-446655440001",
        drug_b_id="550e8400-e29b-41d4-a716-446655440002",
        interaction_type="pharmacokinetic",
        risk_grade=RiskGrade.grade_3_severe,
        clinical_consequence="Significantly increased risk of major bleeding events.",
        evidence_level=EvidenceLevel.established,
        mechanism="CYP2C9 competitive inhibition",
        management_recommendation="Avoid combination. If unavoidable, reduce warfarin dose by 25% and monitor INR weekly.",
        severity=InteractionSeverity.MODERATE,
        source=InteractionSource.verified_reference,
        confidence=InteractionConfidence.high,
        ai_generated=True,
        gpt_model_version="openai/gpt-4o",
        source_reference=None,
        created_at=datetime(2026, 7, 15),
        updated_at=datetime(2026, 7, 15),
    )


def _build_mock_completion(content: dict) -> MagicMock:
    usage = SimpleNamespace(total_tokens=350)
    message = SimpleNamespace(content=json.dumps(content))
    choice = SimpleNamespace(message=message)
    completion = SimpleNamespace(choices=[choice], usage=usage)
    return completion


@pytest.mark.asyncio
@patch("smart_eco_pharma.services.pv_service.interaction_repository")
@patch("smart_eco_pharma.services.pv_service.drug_repository")
async def test_analyze_interaction_success(
    mock_drug_repo: AsyncMock,
    mock_ix_repo: AsyncMock,
    drug_a: DrugDetail,
    drug_b: DrugDetail,
    created_interaction: InteractionDetail,
) -> None:
    mock_drug_repo.get_drug_by_id = AsyncMock(side_effect=[drug_a, drug_b])
    mock_ix_repo.create_interaction = AsyncMock(return_value=created_interaction)

    llm_response = {
        "query_type": "pairwise",
        "products_input": ["Warfarin", "Aspirin"],
        "resolved_ingredients": [
            {
                "product": "Warfarin",
                "active_ingredients": ["Warfarin sodium"],
                "resolved": True,
            },
            {
                "product": "Aspirin",
                "active_ingredients": ["Acetylsalicylic acid"],
                "resolved": True,
            },
        ],
        "interactions": [
            {
                "product_pair": ["Warfarin", "Aspirin"],
                "ingredient_pair": ["Warfarin sodium", "Acetylsalicylic acid"],
                "severity": "MODERATE",
                "source": "verified_reference",
                "confidence": "high",
                "mechanism": "CYP2C9 competitive inhibition",
                "recommendation": "Avoid combination. If unavoidable, reduce warfarin dose by 25% and monitor INR weekly.",
            }
        ],
        "highest_severity": "MODERATE",
        "escalate_to_pharmacist": False,
        "urgent_flag": False,
        "unresolved_products": [],
        "disclaimer": "Automated assessment; confirm with reference guide.",
    }

    svc = PVService()
    svc._client = MagicMock()
    svc._client.chat.completions.create = AsyncMock(
        return_value=_build_mock_completion(llm_response)
    )

    result = await svc.analyze_interaction(
        drug_a_id=drug_a.id,
        drug_b_id=drug_b.id,
        clinical_context="Elderly patient on anticoagulation therapy",
    )

    assert isinstance(result, PVAnalysisResponse)
    assert result.risk_grade == RiskGrade.grade_3_severe
    assert result.severity == InteractionSeverity.MODERATE
    assert result.source == InteractionSource.verified_reference
    assert result.confidence == InteractionConfidence.high
    assert result.ai_generated is True
    assert result.tokens_used == 350
    mock_ix_repo.create_interaction.assert_awaited_once()


@pytest.mark.asyncio
@patch("smart_eco_pharma.services.pv_service.interaction_repository")
@patch("smart_eco_pharma.services.pv_service.drug_repository")
async def test_analyze_interaction_drug_not_found(
    mock_drug_repo: AsyncMock,
    mock_ix_repo: AsyncMock,
) -> None:
    mock_drug_repo.get_drug_by_id = AsyncMock(return_value=None)

    svc = PVService()
    svc._client = MagicMock()

    with pytest.raises(ValueError, match="Drug not found"):
        await svc.analyze_interaction(
            drug_a_id=uuid4(),
            drug_b_id=uuid4(),
        )

    mock_ix_repo.create_interaction.assert_not_called()


@pytest.mark.asyncio
@patch("smart_eco_pharma.services.pv_service.service_client")
@patch("smart_eco_pharma.services.pv_service.drug_repository")
async def test_get_drug_reports(
    mock_drug_repo: AsyncMock,
    mock_service_client: MagicMock,
    drug_a: DrugDetail,
) -> None:
    mock_drug_repo.get_drug_by_id = AsyncMock(return_value=drug_a)

    interaction_row = {
        "id": "770e8400-e29b-41d4-a716-446655440003",
        "drug_a_id": "550e8400-e29b-41d4-a716-446655440001",
        "drug_b_id": "550e8400-e29b-41d4-a716-446655440002",
        "interaction_type": "pharmacokinetic",
        "risk_grade": "grade_3_severe",
        "clinical_consequence": "Increased bleeding risk.",
        "evidence_level": "established",
        "mechanism": "CYP2C9 inhibition",
        "management_recommendation": "Monitor INR.",
        "ai_generated": True,
        "gpt_model_version": "openai/gpt-4o",
        "source_reference": None,
        "created_at": datetime(2026, 7, 15).isoformat(),
        "updated_at": datetime(2026, 7, 15).isoformat(),
    }

    mock_table = MagicMock()
    mock_select = MagicMock()
    mock_or = MagicMock()
    mock_eq = MagicMock()
    mock_order = MagicMock()
    mock_execute = MagicMock(return_value=SimpleNamespace(data=[interaction_row]))

    mock_service_client.table.return_value = mock_table
    mock_table.select.return_value = mock_select
    mock_select.or_.return_value = mock_or
    mock_or.eq.return_value = mock_eq
    mock_eq.order.return_value = mock_order
    mock_order.execute = mock_execute

    svc = PVService()
    result = await svc.get_drug_reports(drug_a.id)

    assert isinstance(result, PVReportListResponse)
    assert len(result.reports) == 1
    assert result.drug_id == drug_a.id
    assert result.reports[0].risk_grade == RiskGrade.grade_3_severe

from __future__ import annotations

from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class RiskGrade(str, Enum):
    grade_1_minimal = "grade_1_minimal"
    grade_2_moderate = "grade_2_moderate"
    grade_3_severe = "grade_3_severe"
    grade_4_contraindicated = "grade_4_contraindicated"


class InteractionSeverity(str, Enum):
    MAJOR = "MAJOR"
    MODERATE = "MODERATE"
    MINOR = "MINOR"
    NONE_KNOWN = "NONE_KNOWN"


class InteractionSource(str, Enum):
    verified_reference = "verified_reference"
    inferred_pharmacology = "inferred_pharmacology"


class InteractionConfidence(str, Enum):
    high = "high"
    medium = "medium"
    low = "low"


class EvidenceLevel(str, Enum):
    established = "established"
    theoretical = "theoretical"
    case_report = "case_report"


class InteractionBase(BaseModel):
    drug_a_id: UUID
    drug_b_id: UUID
    interaction_type: str | None = None
    risk_grade: RiskGrade
    clinical_consequence: str
    evidence_level: EvidenceLevel
    mechanism: str | None = None
    management_recommendation: str | None = None
    severity: InteractionSeverity | None = None
    source: InteractionSource | None = None
    confidence: InteractionConfidence | None = None


class InteractionDetail(InteractionBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    ai_generated: bool
    gpt_model_version: str | None = None
    source_reference: str | None = None
    created_at: datetime
    updated_at: datetime


class InteractionListResponse(BaseModel):
    interactions: list[InteractionDetail]
    total: int
    limit: int
    offset: int


class InteractionCheckRequest(BaseModel):
    drug_ids: list[UUID] = Field(min_length=2, max_length=10)


class InteractionCheckResponse(BaseModel):
    pairs: list[InteractionDetail]
    total_pairs_found: int

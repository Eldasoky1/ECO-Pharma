from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel

from .interaction import (
    EvidenceLevel,
    InteractionConfidence,
    InteractionSeverity,
    InteractionSource,
    RiskGrade,
)


class PVAnalysisRequest(BaseModel):
    drug_a_id: UUID
    drug_b_id: UUID
    clinical_context: str | None = None


class PVAnalysisResponse(BaseModel):
    interaction_id: UUID
    risk_grade: RiskGrade
    clinical_consequence: str
    management_recommendation: str
    evidence_level: EvidenceLevel
    severity: InteractionSeverity | None = None
    source: InteractionSource | None = None
    confidence: InteractionConfidence | None = None
    ai_generated: bool
    model_version: str
    tokens_used: int


class PVReportListResponse(BaseModel):
    reports: list[PVAnalysisResponse]
    drug_id: UUID

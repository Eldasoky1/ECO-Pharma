"""Pharmacovigilance service — LLM-powered drug-drug interaction analysis.

Uses OpenRouter as the LLM provider and the interaction-risk module's
system prompt + 13-key strict output schema (see ../interaction_risk/) to
analyze drug pairs, persist AI-generated risk assessments, and expose
historical reports.
"""

from __future__ import annotations

import json
from pathlib import Path
from uuid import UUID

from openai import AsyncOpenAI

from ..config import settings
from ..database import service_client
from ..models.interaction import InteractionDetail
from ..models.pharmacovigilance import (
    PVAnalysisResponse,
    PVReportListResponse,
)
from ..repositories import drug_repository, interaction_repository

_INTERACTION_RISK_DIR = Path(__file__).resolve().parents[1] / "interaction_risk"


def _load_archive_assets() -> tuple[str, dict]:
    """Load the interaction-risk module's system prompt and output schema."""
    system_prompt = (
        _INTERACTION_RISK_DIR / "system_prompt.txt"
    ).read_text(encoding="utf-8")
    output_schema = json.loads(
        (_INTERACTION_RISK_DIR / "output_schema.json").read_text(encoding="utf-8")
    )
    return system_prompt, output_schema


PV_SYSTEM_PROMPT, PV_OUTPUT_SCHEMA = _load_archive_assets()

_SEVERITY_TO_RISK_GRADE: dict[str, str] = {
    "MAJOR": "grade_4_contraindicated",
    "MODERATE": "grade_3_severe",
    "MINOR": "grade_2_moderate",
    "NONE_KNOWN": "grade_1_minimal",
}

_SOURCE_TO_EVIDENCE_LEVEL: dict[str, str] = {
    "verified_reference": "established",
    "inferred_pharmacology": "theoretical",
}

_DISCLAIMER = (
    "This automated assessment is a decision-support aid, not a substitute "
    "for professional clinical judgment. Confirm findings with the pharmacy's "
    "reference guide and involve a pharmacist or physician for any MAJOR or "
    "uncertain interaction."
)


def _build_user_message(
    drug_a_name: str,
    drug_a_ingredients: str,
    drug_a_class: str | None,
    drug_a_route: str | None,
    drug_b_name: str,
    drug_b_ingredients: str,
    drug_b_class: str | None,
    drug_b_route: str | None,
    clinical_context: str | None,
) -> str:
    """Construct the LLM user message describing the two drugs under analysis."""
    lines = [
        "Analyze the drug-drug interaction between the following two products:",
        "",
        f"Product A: {drug_a_name}",
        f"  Active Ingredients: {drug_a_ingredients}",
    ]
    if drug_a_class:
        lines.append(f"  Drug Class: {drug_a_class}")
    if drug_a_route:
        lines.append(f"  Route of Administration: {drug_a_route}")

    lines.extend(
        ["", f"Product B: {drug_b_name}", f"  Active Ingredients: {drug_b_ingredients}"]
    )
    if drug_b_class:
        lines.append(f"  Drug Class: {drug_b_class}")
    if drug_b_route:
        lines.append(f"  Route of Administration: {drug_b_route}")

    if clinical_context:
        lines.extend(["", f"Clinical Context: {clinical_context}"])

    return "\n".join(lines)


class PVService:
    """Facade for LLM pharmacovigilance analysis and report retrieval."""

    def __init__(self) -> None:
        self._client = AsyncOpenAI(
            base_url=settings.OPENROUTER_BASE_URL,
            api_key=settings.OPENROUTER_API_KEY,
        )

    async def analyze_interaction(
        self,
        drug_a_id: UUID,
        drug_b_id: UUID,
        clinical_context: str | None = None,
    ) -> PVAnalysisResponse:
        """Analyze a drug-drug interaction using the interaction-risk module.

        Fetches both drug records, sends them to the LLM with the archive's
        system prompt and 13-key strict output schema, persists the result,
        and returns a typed response.
        """
        drug_a = await drug_repository.get_drug_by_id(drug_a_id)
        drug_b = await drug_repository.get_drug_by_id(drug_b_id)

        if drug_a is None:
            raise ValueError(f"Drug not found: {drug_a_id}")
        if drug_b is None:
            raise ValueError(f"Drug not found: {drug_b_id}")

        user_message = _build_user_message(
            drug_a_name=drug_a.drug_name,
            drug_a_ingredients=drug_a.active_ingredients,
            drug_a_class=drug_a.drug_class,
            drug_a_route=drug_a.route_of_administration,
            drug_b_name=drug_b.drug_name,
            drug_b_ingredients=drug_b.active_ingredients,
            drug_b_class=drug_b.drug_class,
            drug_b_route=drug_b.route_of_administration,
            clinical_context=clinical_context,
        )

        completion = await self._client.chat.completions.create(
            model=settings.GPT_MODEL,
            messages=[
                {"role": "system", "content": PV_SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            response_format={"type": "json_schema", "json_schema": PV_OUTPUT_SCHEMA},
            temperature=0.1,
            max_tokens=1000,
        )

        content = completion.choices[0].message.content or "{}"
        parsed = json.loads(content)

        tokens_used = 0
        if completion.usage:
            tokens_used = completion.usage.total_tokens

        interaction = await interaction_repository.create_interaction(
            self._build_persist_payload(
                drug_a_id=drug_a_id,
                drug_b_id=drug_b_id,
                parsed=parsed,
            )
        )

        return PVAnalysisResponse(
            interaction_id=interaction.id,
            risk_grade=interaction.risk_grade,
            clinical_consequence=interaction.clinical_consequence,
            management_recommendation=interaction.management_recommendation or "",
            evidence_level=interaction.evidence_level,
            severity=interaction.severity,
            source=interaction.source,
            confidence=interaction.confidence,
            ai_generated=interaction.ai_generated,
            model_version=interaction.gpt_model_version or settings.GPT_MODEL,
            tokens_used=tokens_used,
        )

    def _build_persist_payload(
        self,
        drug_a_id: UUID,
        drug_b_id: UUID,
        parsed: dict,
    ) -> dict:
        """Map the 13-key archive output onto the drug_interactions row."""
        interactions = parsed.get("interactions") or []
        finding = interactions[0] if interactions else {}

        severity = finding.get("severity") or parsed.get("highest_severity") or "NONE_KNOWN"
        source = finding.get("source") or "inferred_pharmacology"
        confidence = finding.get("confidence") or "medium"
        mechanism = finding.get("mechanism")
        recommendation = finding.get("recommendation")

        clinical_consequence = mechanism or (
            "No meaningful pharmacological overlap identified between the products checked."
            if severity == "NONE_KNOWN"
            else "Potential clinically significant interaction; refer to recommendation."
        )

        return {
            "drug_a_id": str(drug_a_id),
            "drug_b_id": str(drug_b_id),
            "risk_grade": _SEVERITY_TO_RISK_GRADE.get(severity, "grade_1_minimal"),
            "severity": severity,
            "source": source,
            "confidence": confidence,
            "evidence_level": _SOURCE_TO_EVIDENCE_LEVEL.get(
                source, "theoretical"
            ),
            "clinical_consequence": clinical_consequence,
            "mechanism": mechanism,
            "management_recommendation": recommendation,
            "ai_generated": True,
            "gpt_model_version": settings.GPT_MODEL,
        }

    async def get_drug_reports(self, drug_id: UUID) -> PVReportListResponse:
        """Retrieve all AI-generated interaction reports for a given drug."""
        drug = await drug_repository.get_drug_by_id(drug_id)
        if drug is None:
            raise ValueError(f"Drug not found: {drug_id}")

        response = (
            service_client.table("drug_interactions")
            .select("*")
            .or_(f"drug_a_id.eq.{drug_id},drug_b_id.eq.{drug_id}")
            .eq("ai_generated", True)
            .order("created_at", desc=True)
            .execute()
        )

        reports: list[PVAnalysisResponse] = []
        for row in (response.data or []):
            detail = InteractionDetail.model_validate(row)
            reports.append(
                PVAnalysisResponse(
                    interaction_id=detail.id,
                    risk_grade=detail.risk_grade,
                    clinical_consequence=detail.clinical_consequence,
                    management_recommendation=detail.management_recommendation or "",
                    evidence_level=detail.evidence_level,
                    severity=detail.severity,
                    source=detail.source,
                    confidence=detail.confidence,
                    ai_generated=detail.ai_generated,
                    model_version=detail.gpt_model_version or "",
                    tokens_used=0,
                )
            )

        return PVReportListResponse(reports=reports, drug_id=drug_id)

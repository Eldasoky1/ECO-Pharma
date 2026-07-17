"""Pharmacovigilance service — GPT-4o-powered drug-drug interaction analysis.

Uses OpenRouter as the LLM provider to analyze drug pairs, persist
AI-generated risk assessments, and expose historical reports.
"""

from __future__ import annotations

import json
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

PV_SYSTEM_PROMPT: str = """\
You are an expert pharmacovigilance analyst for the Smart Eco-Pharma Hub.
Your task is to analyze drug-drug interactions and provide structured risk assessments.

You must respond with ONLY a valid JSON object matching this schema:
{
  "risk_grade": "grade_1_minimal" | "grade_2_moderate" | "grade_3_severe" | "grade_4_contraindicated",
  "clinical_consequence": "string describing what happens if the interaction occurs",
  "management_recommendation": "string describing what a clinician should do",
  "evidence_level": "established" | "theoretical" | "case_report",
  "mechanism": "string describing the mechanism of interaction (can be null)"
}

Risk Grade Definitions:
- grade_1_minimal: Unlikely to cause clinical harm in typical patients. No intervention needed.
- grade_2_moderate: May cause adverse effects requiring monitoring. Consider dose adjustment.
- grade_3_severe: May cause serious adverse effects. Consider alternative therapy. Seek specialist advice.
- grade_4_contraindicated: Combination is clinically unsafe. Do not use together under any circumstances.

Evidence Level Definitions:
- established: Documented in clinical literature with strong evidence from multiple studies.
- theoretical: Mechanistically plausible but not well-documented clinically.
- case_report: Based on individual case reports only.

IMPORTANT:
- Risk grade definitions are PLACEHOLDERS that may be updated by the pharmacovigilance specialist.
- Respond with ONLY the JSON object. No preamble, no explanation outside the JSON.
- Use clinical terminology appropriate for healthcare professionals.
"""


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
        "Analyze the drug-drug interaction between the following two medications:",
        "",
        f"Drug A: {drug_a_name}",
        f"  Active Ingredients: {drug_a_ingredients}",
    ]
    if drug_a_class:
        lines.append(f"  Drug Class: {drug_a_class}")
    if drug_a_route:
        lines.append(f"  Route of Administration: {drug_a_route}")

    lines.extend(["", f"Drug B: {drug_b_name}", f"  Active Ingredients: {drug_b_ingredients}"])
    if drug_b_class:
        lines.append(f"  Drug Class: {drug_b_class}")
    if drug_b_route:
        lines.append(f"  Route of Administration: {drug_b_route}")

    if clinical_context:
        lines.extend(["", f"Clinical Context: {clinical_context}"])

    return "\n".join(lines)


class PVService:
    """Facade for GPT-4o pharmacovigilance analysis and report retrieval."""

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
        """Analyze a drug-drug interaction using GPT-4o via OpenRouter.

        Fetches both drug records, sends them to the LLM, parses the structured
        JSON response, persists the result, and returns a typed response.
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
            response_format={"type": "json_object"},
            temperature=0.1,
            max_tokens=800,
        )

        content = completion.choices[0].message.content or "{}"
        parsed = json.loads(content)

        tokens_used = 0
        if completion.usage:
            tokens_used = completion.usage.total_tokens

        interaction = await interaction_repository.create_interaction(
            {
                "drug_a_id": str(drug_a_id),
                "drug_b_id": str(drug_b_id),
                "risk_grade": parsed["risk_grade"],
                "clinical_consequence": parsed["clinical_consequence"],
                "management_recommendation": parsed.get("management_recommendation", ""),
                "evidence_level": parsed.get("evidence_level", "theoretical"),
                "mechanism": parsed.get("mechanism"),
                "ai_generated": True,
                "gpt_model_version": settings.GPT_MODEL,
            }
        )

        return PVAnalysisResponse(
            interaction_id=interaction.id,
            risk_grade=interaction.risk_grade,
            clinical_consequence=interaction.clinical_consequence,
            management_recommendation=interaction.management_recommendation or "",
            evidence_level=interaction.evidence_level,
            ai_generated=interaction.ai_generated,
            model_version=interaction.gpt_model_version or settings.GPT_MODEL,
            tokens_used=tokens_used,
        )

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
                    ai_generated=detail.ai_generated,
                    model_version=detail.gpt_model_version or "",
                    tokens_used=0,
                )
            )

        return PVReportListResponse(reports=reports, drug_id=drug_id)

"""MCP tool — drug interaction batch check.

Provides a read-only tool that queries the drug_interactions table for all
known interactions between a set of drug IDs, returning risk grades and
clinical management recommendations.
"""

from __future__ import annotations

from typing import Any

from mcp.server import Server
from mcp.types import TextContent, Tool

from supabase import create_client

from smart_eco_pharma.config import settings

_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)


async def _handle_check_drug_interactions(arguments: dict[str, Any]) -> list[TextContent]:
    """Handle the check_drug_interactions tool invocation."""
    drug_ids = arguments.get("drug_ids", [])

    if not isinstance(drug_ids, list) or len(drug_ids) < 2:
        return [
            TextContent(
                type="text",
                text='{"error": "validation_error", "detail": "drug_ids must be an array with at least 2 elements."}',
            )
        ]

    if len(drug_ids) > 5:
        return [
            TextContent(
                type="text",
                text='{"error": "validation_error", "detail": "drug_ids must contain at most 5 elements."}',
            )
        ]

    try:
        response = (
            _client.table("drug_interactions")
            .select("*")
            .in_("drug_a_id", drug_ids)
            .in_("drug_b_id", drug_ids)
            .execute()
        )

        rows = response.data or []

        results = []
        for row in rows:
            results.append(
                {
                    "interaction_id": row.get("id"),
                    "drug_a_id": row.get("drug_a_id"),
                    "drug_b_id": row.get("drug_b_id"),
                    "risk_grade": row.get("risk_grade"),
                    "clinical_consequence": row.get("clinical_consequence"),
                    "management_recommendation": row.get("management_recommendation"),
                    "evidence_level": row.get("evidence_level"),
                    "mechanism": row.get("mechanism"),
                    "ai_generated": row.get("ai_generated", False),
                }
            )

        return [
            TextContent(
                type="text",
                text=f'{{"interactions": {results}, "total_found": {len(results)}}}',
            )
        ]
    except Exception as exc:
        return [
            TextContent(
                type="text",
                text=f'{{"error": "query_failed", "detail": "{exc}"}}',
            )
        ]


def register_interaction_tools(server: Server) -> None:
    """Register the drug interaction check tool on the MCP server."""

    @server.list_tools()
    async def list_tools() -> list[Tool]:
        return [
            Tool(
                name="check_drug_interactions",
                description="Check for known drug interactions between two or more drugs, returning risk grades and clinical management recommendations.",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "drug_ids": {
                            "type": "array",
                            "items": {
                                "type": "string",
                                "format": "uuid",
                            },
                            "minItems": 2,
                            "maxItems": 5,
                            "description": "List of drug UUIDs to check for interactions (2 to 5 drugs).",
                        },
                    },
                    "required": ["drug_ids"],
                },
            ),
        ]

    @server.call_tool()
    async def call_tool(name: str, arguments: dict[str, Any]) -> list[TextContent]:
        if name == "check_drug_interactions":
            return await _handle_check_drug_interactions(arguments)
        return [
            TextContent(
                type="text",
                text=f'{{"error": "unknown_tool", "detail": "Tool {name} not found."}}',
            )
        ]

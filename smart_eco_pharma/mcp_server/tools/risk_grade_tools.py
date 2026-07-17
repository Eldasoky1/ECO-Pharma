"""MCP tools — risk grade lookup and IoT sensor status.

Provides two read-only tools:
  1. get_risk_grade       — single-pair interaction risk grade query.
  2. get_iot_sensor_status — latest IoT sensor readings for a storage location.
"""

from __future__ import annotations

from typing import Any

from mcp.server import Server
from mcp.types import TextContent, Tool

from supabase import create_client

from smart_eco_pharma.config import settings

_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)


async def _handle_get_risk_grade(arguments: dict[str, Any]) -> list[TextContent]:
    """Handle the get_risk_grade tool invocation."""
    drug_a_id = arguments.get("drug_a_id")
    drug_b_id = arguments.get("drug_b_id")

    if not drug_a_id or not drug_b_id:
        return [
            TextContent(
                type="text",
                text='{"error": "validation_error", "detail": "Both drug_a_id and drug_b_id are required."}',
            )
        ]

    try:
        response = (
            _client.table("drug_interactions")
            .select("*")
            .or_(
                f"(drug_a_id.eq.{drug_a_id},drug_b_id.eq.{drug_b_id}),"
                f"(drug_a_id.eq.{drug_b_id},drug_b_id.eq.{drug_a_id})"
            )
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )

        rows = response.data or []

        if not rows:
            return [
                TextContent(
                    type="text",
                    text='{"interaction": null, "message": "No known interaction found between the specified drugs."}',
                )
            ]

        row = rows[0]
        return [
            TextContent(
                type="text",
                text=f'{{"interaction": {{"id": "{row.get("id")}", "drug_a_id": "{row.get("drug_a_id")}", "drug_b_id": "{row.get("drug_b_id")}", "risk_grade": "{row.get("risk_grade")}", "clinical_consequence": "{row.get("clinical_consequence")}", "management_recommendation": "{row.get("management_recommendation")}", "evidence_level": "{row.get("evidence_level")}", "mechanism": {repr(row.get("mechanism"))}, "ai_generated": {str(row.get("ai_generated", False)).lower()}}}}}',
            )
        ]
    except Exception as exc:
        return [
            TextContent(
                type="text",
                text=f'{{"error": "query_failed", "detail": "{exc}"}}',
            )
        ]


async def _handle_get_iot_sensor_status(arguments: dict[str, Any]) -> list[TextContent]:
    """Handle the get_iot_sensor_status tool invocation."""
    storage_location_id = arguments.get("storage_location_id")

    if not storage_location_id:
        return [
            TextContent(
                type="text",
                text='{"error": "validation_error", "detail": "storage_location_id is required."}',
            )
        ]

    try:
        response = (
            _client.table("iot_readings")
            .select("*")
            .eq("storage_location_id", storage_location_id)
            .order("timestamp_utc", desc=True)
            .limit(1)
            .execute()
        )

        rows = response.data or []

        if not rows:
            return [
                TextContent(
                    type="text",
                    text='{"reading": null, "message": "No sensor readings found for the specified storage location."}',
                )
            ]

        row = rows[0]
        return [
            TextContent(
                type="text",
                text=f'{{"reading": {row}}}',
            )
        ]
    except Exception as exc:
        return [
            TextContent(
                type="text",
                text=f'{{"error": "query_failed", "detail": "{exc}"}}',
            )
        ]


def register_risk_tools(server: Server) -> None:
    """Register the risk grade and IoT sensor status tools on the MCP server."""

    @server.list_tools()
    async def list_tools() -> list[Tool]:
        return [
            Tool(
                name="get_risk_grade",
                description="Retrieve the risk grade for a specific drug-drug interaction pair.",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "drug_a_id": {
                            "type": "string",
                            "format": "uuid",
                            "description": "UUID of the first drug.",
                        },
                        "drug_b_id": {
                            "type": "string",
                            "format": "uuid",
                            "description": "UUID of the second drug.",
                        },
                    },
                    "required": ["drug_a_id", "drug_b_id"],
                },
            ),
            Tool(
                name="get_iot_sensor_status",
                description="Get the latest IoT sensor readings for a specific storage location, including temperature, humidity, and alert status.",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "storage_location_id": {
                            "type": "string",
                            "description": "Storage location identifier to query.",
                        },
                    },
                    "required": ["storage_location_id"],
                },
            ),
        ]

    @server.call_tool()
    async def call_tool(name: str, arguments: dict[str, Any]) -> list[TextContent]:
        if name == "get_risk_grade":
            return await _handle_get_risk_grade(arguments)
        if name == "get_iot_sensor_status":
            return await _handle_get_iot_sensor_status(arguments)
        return [
            TextContent(
                type="text",
                text=f'{{"error": "unknown_tool", "detail": "Tool {name} not found."}}',
            )
        ]

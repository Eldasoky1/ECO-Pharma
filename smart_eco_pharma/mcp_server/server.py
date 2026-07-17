"""MCP server entry point for the Smart Eco-Pharma Hub.

Registers read-only tools that expose inventory lookups, drug interaction
queries, risk grade retrieval, and IoT sensor status via the Model Context
Protocol.
"""

from __future__ import annotations

from typing import Any

from mcp.server import Server
from mcp.types import TextContent, Tool

from supabase import create_client

from smart_eco_pharma.config import settings

server = Server("smart-eco-pharma")

_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)


# ---------------------------------------------------------------------------
# Tool handlers
# ---------------------------------------------------------------------------


async def _handle_lookup_drug_inventory(arguments: dict[str, Any]) -> list[TextContent]:
    drug_name = arguments.get("drug_name")
    drug_id = arguments.get("drug_id")
    storage_location_id = arguments.get("storage_location_id")

    if not drug_name and not drug_id:
        return [
            TextContent(
                type="text",
                text='{"error": "validation_error", "detail": "At least one of drug_name or drug_id must be provided."}',
            )
        ]

    try:
        query = _client.table("otc_inventory").select(
            "*, drug_master(drug_name, brand_name, active_ingredients)"
        )

        if drug_id:
            query = query.eq("drug_id", drug_id)

        if storage_location_id:
            query = query.eq("storage_location_identifier", storage_location_id)

        response = query.execute()
        rows = response.data or []

        if drug_name and not drug_id:
            rows = [
                row
                for row in rows
                if drug_name.lower()
                in (
                    (row.get("drug_master", {}) or {}).get("drug_name", "") or ""
                ).lower()
            ]

        if not rows:
            return [
                TextContent(
                    type="text",
                    text='{"results": [], "count": 0, "message": "No inventory records matched the query."}',
                )
            ]

        import json

        return [
            TextContent(
                type="text",
                text=json.dumps({"results": rows, "count": len(rows)}),
            )
        ]
    except Exception as exc:
        return [
            TextContent(
                type="text",
                text=f'{{"error": "query_failed", "detail": "{exc}"}}',
            )
        ]


async def _handle_check_drug_interactions(arguments: dict[str, Any]) -> list[TextContent]:
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

        import json

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
                text=json.dumps({"interactions": results, "total_found": len(results)}),
            )
        ]
    except Exception as exc:
        return [
            TextContent(
                type="text",
                text=f'{{"error": "query_failed", "detail": "{exc}"}}',
            )
        ]


async def _handle_get_risk_grade(arguments: dict[str, Any]) -> list[TextContent]:
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

        import json

        row = rows[0]
        return [
            TextContent(
                type="text",
                text=json.dumps({"interaction": row}),
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

        import json

        row = rows[0]
        return [
            TextContent(
                type="text",
                text=json.dumps({"reading": row}),
            )
        ]
    except Exception as exc:
        return [
            TextContent(
                type="text",
                text=f'{{"error": "query_failed", "detail": "{exc}"}}',
            )
        ]


# ---------------------------------------------------------------------------
# Tool definitions and single dispatcher
# ---------------------------------------------------------------------------

_TOOL_DEFINITIONS: list[Tool] = [
    Tool(
        name="lookup_drug_inventory",
        description="Look up current inventory status for a pharmaceutical drug, including stock quantity, reorder status, and storage conditions.",
        inputSchema={
            "type": "object",
            "properties": {
                "drug_name": {
                    "type": "string",
                    "description": "Fuzzy search on drug_name field",
                },
                "drug_id": {
                    "type": "string",
                    "format": "uuid",
                    "description": "Exact lookup by drug ID",
                },
                "storage_location_id": {
                    "type": "string",
                    "description": "Filter by storage location",
                },
            },
        },
    ),
    Tool(
        name="check_drug_interactions",
        description="Check for known drug interactions between two or more drugs, returning risk grades and clinical management recommendations.",
        inputSchema={
            "type": "object",
            "properties": {
                "drug_ids": {
                    "type": "array",
                    "items": {"type": "string", "format": "uuid"},
                    "minItems": 2,
                    "maxItems": 5,
                    "description": "List of drug UUIDs to check for interactions (2 to 5 drugs).",
                },
            },
            "required": ["drug_ids"],
        },
    ),
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

_TOOL_HANDLERS: dict[str, Any] = {
    "lookup_drug_inventory": _handle_lookup_drug_inventory,
    "check_drug_interactions": _handle_check_drug_interactions,
    "get_risk_grade": _handle_get_risk_grade,
    "get_iot_sensor_status": _handle_get_iot_sensor_status,
}


@server.list_tools()
async def list_tools() -> list[Tool]:
    return _TOOL_DEFINITIONS


@server.call_tool()
async def call_tool(name: str, arguments: dict[str, Any]) -> list[TextContent]:
    handler = _TOOL_HANDLERS.get(name)
    if handler is not None:
        return await handler(arguments)
    return [
        TextContent(
            type="text",
            text=f'{{"error": "unknown_tool", "detail": "Tool {name} not found."}}',
        )
    ]


if __name__ == "__main__":
    import asyncio

    from mcp.server.stdio import stdio_server

    asyncio.run(stdio_server(server))

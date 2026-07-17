"""MCP tool — drug inventory lookup.

Provides a read-only tool that queries the Supabase OTC inventory table
for drug stock data, reorder status, and storage conditions.
"""

from __future__ import annotations

from typing import Any

from mcp.server import Server
from mcp.types import TextContent, Tool

from supabase import create_client

from smart_eco_pharma.config import settings

_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)


async def _handle_lookup_drug_inventory(arguments: dict[str, Any]) -> list[TextContent]:
    """Handle the lookup_drug_inventory tool invocation."""
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
        query = _client.table("otc_inventory").select("*, drug_master(drug_name, brand_name, active_ingredients)")

        if drug_id:
            query = query.eq("drug_id", drug_id)

        if storage_location_id:
            query = query.eq("storage_location_identifier", storage_location_id)

        response = query.execute()
        rows = response.data or []

        if drug_name and not drug_id:
            rows = [
                row for row in rows
                if drug_name.lower() in (
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

        return [
            TextContent(
                type="text",
                text=f'{{"results": {rows}, "count": {len(rows)}}}',
            )
        ]
    except Exception as exc:
        return [
            TextContent(
                type="text",
                text=f'{{"error": "query_failed", "detail": "{exc}"}}',
            )
        ]


def register_inventory_tools(server: Server) -> None:
    """Register the inventory lookup tool on the MCP server."""

    @server.list_tools()
    async def list_tools() -> list[Tool]:
        return [
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
        ]

    @server.call_tool()
    async def call_tool(name: str, arguments: dict[str, Any]) -> list[TextContent]:
        if name == "lookup_drug_inventory":
            return await _handle_lookup_drug_inventory(arguments)
        return [
            TextContent(
                type="text",
                text=f'{{"error": "unknown_tool", "detail": "Tool {name} not found."}}',
            )
        ]

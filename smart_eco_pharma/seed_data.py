"""Seed the Supabase database from the pharmacy reference guide.

Loads ``pharmacy_reference_data.json`` (42 products, 20 known interaction
rules) and inserts the catalog into ``drug_master`` plus the expanded
product-pair interaction records into ``drug_interactions``.

Design notes:
- Deterministic UUIDs (UUID5 from the product code) make the seed idempotent
  and let interaction rows reference drug IDs without a round-trip.
- Each interaction rule is expanded into one row per concrete product pair
  whose active ingredients match the rule's ingredient groups. Rules whose
  ingredient groups match no catalog products are skipped with a warning
  (e.g. the lab-test note in INT-MIN-07).
- Severity/source/confidence are mapped to the legacy risk_grade/evidence_level
  columns using the same tables as ``services/pv_service.py`` so seeded and
  AI-generated rows stay consistent.

Usage:
    python -m smart_eco_pharma.seed_data   # requires .env (SUPABASE_* vars)
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any
from uuid import UUID, uuid5

from .database import service_client

_REFERENCE_DATA = (
    Path(__file__).resolve().parents[1]
    / "03_Interaction_Risk_Module"
    / "pharmacy_reference_data.json"
)

_NAMESPACE = UUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")

_SEVERITY_TO_RISK_GRADE: dict[str, str] = {
    "MAJOR": "grade_4_contraindicated",
    "MODERATE": "grade_3_severe",
    "MINOR": "grade_2_moderate",
    "NONE_KNOWN": "grade_1_minimal",
}

_INTERACTION_TYPE_HINTS = {
    "pharmacokinetic": "pharmacokinetic",
    "cyp3a4": "pharmacokinetic",
    "absorption": "pharmacokinetic",
    "pharmacodynamic": "pharmacodynamic",
    "antiplatelet": "pharmacodynamic",
    "anticoagulant": "pharmacodynamic",
    "sedation": "pharmacodynamic",
    "nephrotoxic": "pharmacodynamic",
    "glucose": "pharmacodynamic",
}

# Product code -> (regulatory_status, route, dosage_form)
_PRODUCT_ATTRIBUTES: dict[str, dict[str, Any]] = {
    "P01": {"regulatory_status": "otc", "route": "oral", "form": "tablet"},
    "P02": {"regulatory_status": "prescription_only", "route": "oral", "form": "sachet"},
    "P03": {"regulatory_status": "otc", "route": "oral", "form": "tablet"},
    "P04": {"regulatory_status": "prescription_only", "route": "injectable", "form": "ampoule"},
    "P05": {"regulatory_status": "prescription_only", "route": "oral", "form": "tablet"},
    "P06": {"regulatory_status": "otc", "route": "topical", "form": "gel"},
    "P07": {"regulatory_status": "prescription_only", "route": "oral", "form": "tablet"},
    "P08": {"regulatory_status": "prescription_only", "route": "oral", "form": "tablet"},
    "P09": {"regulatory_status": "prescription_only", "route": "oral", "form": "tablet"},
    "P10": {"regulatory_status": "otc", "route": "oral", "form": "tablet"},
    "P11": {"regulatory_status": "otc", "route": "oral", "form": "suspension"},
    "P12": {"regulatory_status": "prescription_only", "route": "oral", "form": "tablet"},
    "P13": {"regulatory_status": "prescription_only", "route": "oral", "form": "tablet"},
    "P14": {"regulatory_status": "otc", "route": "oral", "form": "tablet"},
    "P15": {"regulatory_status": "otc", "route": "oral", "form": "tablet"},
    "P16": {"regulatory_status": "otc", "route": "oral", "form": "tablet"},
    "P17": {"regulatory_status": "prescription_only", "route": "injectable", "form": "ampoule"},
    "P18": {"regulatory_status": "otc", "route": "oral", "form": "tablet"},
    "P19": {"regulatory_status": "otc", "route": "oral", "form": "syrup"},
    "P20": {"regulatory_status": "otc", "route": "oral", "form": "tablet"},
    "P21": {"regulatory_status": "otc", "route": "oral", "form": "tablet"},
    "P22": {"regulatory_status": "otc", "route": "oral", "form": "syrup"},
    "P23": {"regulatory_status": "otc", "route": "nasal", "form": "spray"},
    "P24": {"regulatory_status": "controlled", "route": "oral", "form": "tablet"},
    "P25": {"regulatory_status": "otc", "route": "oral", "form": "tablet"},
    "P26": {"regulatory_status": "otc", "route": "oral", "form": "tablet"},
    "P27": {"regulatory_status": "otc", "route": "oral", "form": "tablet"},
    "P28": {"regulatory_status": "otc", "route": "oral", "form": "syrup"},
    "P29": {"regulatory_status": "otc", "route": "oral", "form": "tablet"},
    "P30": {"regulatory_status": "prescription_only", "route": "oral", "form": "tablet"},
    "P31": {"regulatory_status": "otc", "route": "topical", "form": "solution"},
    "P32": {"regulatory_status": "prescription_only", "route": "topical", "form": "cream"},
    "P33": {"regulatory_status": "prescription_only", "route": "topical", "form": "cream"},
    "P34": {"regulatory_status": "otc", "route": "oral", "form": "lozenge"},
    "P35": {"regulatory_status": "otc", "route": "topical", "form": "ointment"},
    "P36": {"regulatory_status": "prescription_only", "route": "oral", "form": "gel"},
    "P37": {"regulatory_status": "prescription_only", "route": "topical", "form": "cream"},
    "P38": {"regulatory_status": "otc", "route": "oral", "form": "tablet"},
    "P39": {"regulatory_status": "otc", "route": "oral", "form": "effervescent"},
    "P40": {"regulatory_status": "prescription_only", "route": "injectable", "form": "solution"},
    "P41": {"regulatory_status": "otc", "route": "oral", "form": "drops"},
    "P42": {"regulatory_status": "prescription_only", "route": "injectable", "form": "cartridge"},
}

_LOW_CONFIDENCE_RULES = {"INT-MIN-01", "INT-MIN-07"}


def _product_id(code: str) -> str:
    return str(uuid5(_NAMESPACE, f"drug_master:{code}"))


def _load_reference() -> dict[str, Any]:
    return json.loads(_REFERENCE_DATA.read_text(encoding="utf-8"))


def _seed_products(reference: dict[str, Any]) -> dict[str, str]:
    """Insert catalog products; returns product code -> drug_master id."""
    products = reference["catalog"]
    rows = []
    for product in products:
        code = product["id"]
        attrs = _PRODUCT_ATTRIBUTES.get(code, {})
        rows.append(
            {
                "id": _product_id(code),
                "drug_name": product["name"],
                "drug_class": product["therapeutic_class"],
                "regulatory_status": attrs.get("regulatory_status", "otc"),
                "dosage_forms": [attrs.get("form", "tablet")],
                "active_ingredients": ", ".join(product["active_ingredients"]),
                "route_of_administration": attrs.get("route"),
                "brand_name": product["name"],
            }
        )

    # JUSTIFIED: Reference catalog bootstrap — seeding is a system-level
    # operation that must bypass RLS (no authenticated user context exists
    # during first-time provisioning).
    response = service_client.table("drug_master").upsert(rows, ignore_duplicates=False).execute()
    inserted = response.data or []
    return {p["id"]: p["id"] for p in inserted}


def _ingredient_to_codes(reference: dict[str, Any]) -> dict[str, list[str]]:
    """Map each active ingredient to the list of product codes containing it."""
    mapping: dict[str, list[str]] = {}
    for product in reference["catalog"]:
        for ingredient in product["active_ingredients"]:
            mapping.setdefault(ingredient, []).append(product["id"])
    return mapping


def _expand_rule(
    rule: dict[str, Any],
    ingredient_to_codes: dict[str, list[str]],
) -> list[tuple[str, str]]:
    """Expand one interaction rule into concrete (code_a, code_b) product pairs."""
    a_ingredients = rule.get("ingredient_a_group") or [rule["ingredient_a"]]
    b_ingredients = [
        i for i in rule.get("ingredient_b_group", []) if not i.startswith("*")
    ]

    a_codes = {code for ing in a_ingredients for code in ingredient_to_codes.get(ing, [])}
    b_codes = {code for ing in b_ingredients for code in ingredient_to_codes.get(ing, [])}

    pairs = []
    for code_a in sorted(a_codes):
        for code_b in sorted(b_codes):
            if code_a != code_b:
                pairs.append((code_a, code_b))
    return pairs


def _infer_interaction_type(mechanism: str) -> str:
    lowered = mechanism.lower()
    for hint, interaction_type in _INTERACTION_TYPE_HINTS.items():
        if hint in lowered:
            return interaction_type
    return "pharmacodynamic"


def _build_interaction_row(
    rule: dict[str, Any],
    code_a: str,
    code_b: str,
) -> dict[str, Any]:
    severity = rule["severity"]
    confidence = "medium" if rule["id"] in _LOW_CONFIDENCE_RULES else "high"
    mechanism = rule["mechanism"]
    recommendation = rule["recommendation"]

    return {
        "drug_a_id": _product_id(code_a),
        "drug_b_id": _product_id(code_b),
        "interaction_type": _infer_interaction_type(mechanism),
        "risk_grade": _SEVERITY_TO_RISK_GRADE[severity],
        "severity": severity,
        "source": "verified_reference",
        "confidence": confidence,
        "evidence_level": "established",
        "clinical_consequence": mechanism,
        "mechanism": mechanism,
        "management_recommendation": recommendation,
        "ai_generated": False,
        "source_reference": rule["id"],
    }


def _seed_interactions(
    reference: dict[str, Any],
    ingredient_to_codes: dict[str, list[str]],
) -> tuple[int, int]:
    """Insert expanded interaction rows; returns (inserted, skipped_rules)."""
    rows: list[dict[str, Any]] = []
    skipped = 0
    for rule in reference["known_interactions"]:
        pairs = _expand_rule(rule, ingredient_to_codes)
        if not pairs:
            skipped += 1
            print(f"  [skip] {rule['id']}: no catalog product matches its ingredients")
            continue
        rows.extend(
            _build_interaction_row(rule, code_a, code_b) for code_a, code_b in pairs
        )

    if not rows:
        return 0, skipped

    # Idempotency: drop previously-seeded verified reference rows so a re-run
    # never leaves stale duplicates (drug_interactions has no unique key on
    # (drug_a_id, drug_b_id), and distinct rules can legitimately flag the
    # same pair). AI-generated rows (source='inferred_pharmacology') are kept.
    existing = service_client.table("drug_interactions").select("id").eq(
        "source", "verified_reference"
    ).ilike("source_reference", "INT-%").execute()
    if existing.data:
        service_client.table("drug_interactions").delete().in_(
            "id", [row["id"] for row in existing.data]
        ).execute()

    # JUSTIFIED: Reference data bootstrap — same rationale as _seed_products.
    response = service_client.table("drug_interactions").upsert(rows, ignore_duplicates=False).execute()
    return len(response.data or []), skipped


def seed() -> tuple[int, int, int]:
    """Run the full seed. Returns (products, interactions, skipped_rules)."""
    reference = _load_reference()
    product_codes = _seed_products(reference)
    ingredient_to_codes = _ingredient_to_codes(reference)
    interactions, skipped = _seed_interactions(reference, ingredient_to_codes)
    return len(product_codes), interactions, skipped


if __name__ == "__main__":
    product_count, interaction_count, skipped_rules = seed()
    print(f"Seeded {product_count} products, {interaction_count} interaction rows "
          f"({skipped_rules} rules skipped).")

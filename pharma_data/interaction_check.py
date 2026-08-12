"""Drug interaction lookups for Smart Eco-Pharma Hub.

The interaction data in this module is transcribed from Dr. Mohamed's
reference document and normalized into small dataclasses for lookup and cart
analysis.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from itertools import combinations
from typing import Sequence


class InteractionSeverity(str, Enum):
    """Severity tiers used by the interaction reference."""

    MAJOR = "MAJOR"
    MODERATE = "MODERATE"
    MINOR = "MINOR"


@dataclass(frozen=True, slots=True)
class DrugInteraction:
    """A single documented interaction between two products."""

    product_a: str
    product_b: str
    severity: InteractionSeverity
    mechanism: str
    recommendation: str


def _normalize_product_name(value: str) -> str:
    return " ".join("".join(character.lower() if character.isalnum() else " " for character in value).split())


def _expand_pairs(
    products_a: Sequence[str],
    products_b: Sequence[str],
    severity: InteractionSeverity,
    mechanism: str,
    recommendation: str,
) -> list[DrugInteraction]:
    return [
        DrugInteraction(product_a=a, product_b=b, severity=severity, mechanism=mechanism, recommendation=recommendation)
        for a in products_a
        for b in products_b
    ]


_INTERACTION_DATA: list[DrugInteraction] = []

_INTERACTION_DATA += _expand_pairs(
    ("Adolor 15mg/ml Amp",),
    (
        "Clexane 4000 Anti-Xa",
        "Catafast 50mg Sachet",
        "Brufen 400mg",
        "Cataflam 50mg",
        "Ketofan 50mg",
        "VoltarenEmulgel 100g",
    ),
    InteractionSeverity.MAJOR,
    "Ketorolac inhibits platelet aggregation while enoxaparin adds anticoagulant effect, and adding another NSAID creates additive prostaglandin inhibition and bleeding risk.",
    "Avoid the combination. Use paracetamol first-line where possible and involve a physician before considering an NSAID.",
)

_INTERACTION_DATA += _expand_pairs(
    ("Catafast 50mg Sachet", "Brufen 400mg", "Cataflam 50mg", "Ketofan 50mg"),
    ("Clexane 4000 Anti-Xa",),
    InteractionSeverity.MAJOR,
    "NSAID antiplatelet activity combines with enoxaparin's anticoagulant effect, raising the risk of GI and other bleeding.",
    "Avoid where possible. If unavoidable, use the lowest NSAID dose for the shortest duration and watch closely for bruising or bleeding.",
)

_INTERACTION_DATA += _expand_pairs(
    ("Motilium 10mg",),
    ("Daktarin Oral Gel",),
    InteractionSeverity.MAJOR,
    "Miconazole inhibits CYP3A4, which can raise domperidone levels and increase QT-interval prolongation / arrhythmia risk.",
    "Avoid the combination. If an antifungal is needed alongside domperidone, ask a physician or pharmacist for an alternative.",
)

_INTERACTION_DATA += _expand_pairs(
    ("123 Cold & Flu",),
    ("Oplex Syrup", "Congestal", "Flurest", "Virogrip Drops"),
    InteractionSeverity.MAJOR,
    "Codeine and sedating first-generation antihistamines both depress the central nervous system, producing additive sedation and respiratory depression.",
    "Do not combine. Avoid use with alcohol or other sedatives and use particular caution in children and older adults.",
)

_INTERACTION_DATA += _expand_pairs(
    ("Flagyl 500mg",),
    ("Clexane 4000 Anti-Xa",),
    InteractionSeverity.MODERATE,
    "Metronidazole can potentiate drugs that affect blood clotting; with enoxaparin the concern is an additive bleeding tendency.",
    "Watch for unusual bruising or bleeding when both are used together.",
)

_INTERACTION_DATA += _expand_pairs(
    ("Adolor 15mg/ml Amp", "Catafast 50mg Sachet", "Brufen 400mg", "Cataflam 50mg", "Ketofan 50mg"),
    ("Insulin Mixtard 30/70 Penfill",),
    InteractionSeverity.MODERATE,
    "NSAIDs can enhance the glucose-lowering effect of insulin and may affect renal handling of both drugs.",
    "Monitor blood glucose more closely whenever an NSAID is started or stopped in an insulin-treated patient.",
)

_INTERACTION_DATA += _expand_pairs(
    ("Streptoquin",),
    ("Catafast 50mg Sachet", "Brufen 400mg", "Cataflam 50mg", "Ketofan 50mg"),
    InteractionSeverity.MODERATE,
    "Streptomycin and NSAIDs can each affect the kidney, increasing nephrotoxic potential especially with dehydration or renal impairment.",
    "Ensure adequate hydration and avoid prolonged combined use, particularly in older adults or reduced kidney function.",
)

_INTERACTION_DATA += _expand_pairs(
    ("Motilium 10mg",),
    ("Visceralgine Ampoules", "Spasmo-Digestin", "Streptoquin"),
    InteractionSeverity.MODERATE,
    "Domperidone speeds gut motility while anticholinergic antispasmodics slow it down, so the actions oppose one another.",
    "Avoid routine combination. If both effects are genuinely needed, space doses apart and reassess if symptoms persist.",
)

_INTERACTION_DATA += _expand_pairs(
    ("Controloc 40mg", "Gaviscon Double Action", "Maalox Plus Tablets"),
    ("Daktarin Oral Gel",),
    InteractionSeverity.MODERATE,
    "Reduced stomach acidity can impair dissolution and absorption of a swallowed azole antifungal.",
    "Separate dosing times where practical and monitor the clinical response to the antifungal.",
)

_INTERACTION_DATA += _expand_pairs(
    ("Gaviscon Double Action", "Maalox Plus Tablets"),
    ("Telfast 120mg", "Zyrtec 10mg"),
    InteractionSeverity.MODERATE,
    "Aluminium, magnesium, and calcium salts in antacids can bind to or alter the absorption of many oral drugs taken together.",
    "Separate antacid dosing from other oral medicines by at least 2 hours.",
)

_INTERACTION_DATA += _expand_pairs(
    ("123 Cold & Flu",),
    ("Motilium 10mg",),
    InteractionSeverity.MODERATE,
    "Opioids slow gut motility, working against domperidone's prokinetic effect and increasing constipation risk.",
    "Monitor bowel function and avoid routine combination.",
)

_INTERACTION_DATA += _expand_pairs(
    ("Kenacomb Cream", "Polyderm Cream"),
    ("Insulin Mixtard 30/70 Penfill",),
    InteractionSeverity.MODERATE,
    "Corticosteroid absorbed from large areas, broken skin, occlusion, or long-term use can raise blood glucose.",
    "Use the smallest effective area for the shortest duration in patients with diabetes and monitor glucose if extensive or prolonged use is needed.",
)

_INTERACTION_DATA += _expand_pairs(
    ("Alphintern", "Ambezim-G"),
    (
        "Clexane 4000 Anti-Xa",
        "Adolor 15mg/ml Amp",
        "Catafast 50mg Sachet",
        "Brufen 400mg",
        "Cataflam 50mg",
        "Ketofan 50mg",
        "VoltarenEmulgel 100g",
    ),
    InteractionSeverity.MINOR,
    "Proteolytic enzymes have been reported to have mild antiplatelet / fibrinolytic activity, but real-world evidence for a bleeding effect is weak and largely theoretical.",
    "Awareness is generally sufficient. Use added caution in anyone already at higher bleeding risk.",
)

_INTERACTION_DATA += _expand_pairs(
    ("C-Retard 500mg", "Vitacid Calcium Eff"),
    ("Controloc 40mg",),
    InteractionSeverity.MINOR,
    "High-dose vitamin C can marginally affect gastric pH, and chronic acid suppression can modestly reduce calcium absorption over months.",
    "No action needed at standard doses; the calcium note is mainly relevant with prolonged PPI therapy.",
)


_NO_SIGNIFICANT_INTERACTION_PRODUCTS = {
    "Antinal 200mg",
    "Betadine Antiseptic Solution",
    "C-Retard 500mg",
    "Duphalac Syrup",
    "Fucidin 2% Cream",
    "Gastreg 200mg",
    "Gaviscon Double Action",
    "Maalox Plus Tablets",
    "Mebo Ointment 30g",
    "Neurovit Tablets",
    "Prospan Syrup",
    "Sinupret Forte",
    "Strepsils Honey & Lemon",
    "Telfast 120mg",
    "Vitacid Calcium Eff",
    "VoltarenEmulgel 100g",
    "Zyrtec 10mg",
}


_ALIASES = {
    "123 cold flu": "123 Cold & Flu",
    "adolor": "Adolor 15mg/ml Amp",
    "ambezim g": "Ambezim-G",
    "catafast 50mg sac": "Catafast 50mg Sachet",
    "catafast": "Catafast 50mg Sachet",
    "cataflam": "Cataflam 50mg",
    "clexane": "Clexane 4000 Anti-Xa",
    "controloc": "Controloc 40mg",
    "daktarin oral gel": "Daktarin Oral Gel",
    "flagyl": "Flagyl 500mg",
    "flurest": "Flurest",
    "gaviscon": "Gaviscon Double Action",
    "insulin mixtard 30 70": "Insulin Mixtard 30/70 Penfill",
    "kenacomb": "Kenacomb Cream",
    "maalox": "Maalox Plus Tablets",
    "motilium": "Motilium 10mg",
    "polyderm": "Polyderm Cream",
    "spasmo digestin": "Spasmo-Digestin",
    "streptoquin": "Streptoquin",
    "telfast": "Telfast 120mg",
    "voltaren emulgel 100g": "VoltarenEmulgel 100g",
    "virogrip drops": "Virogrip Drops",
    "zyrtec": "Zyrtec 10mg",
}


def _canonicalize_product_name(value: str) -> str:
    normalized = _normalize_product_name(value)
    return _ALIASES.get(normalized, value.strip())


_INTERACTION_LOOKUP: dict[frozenset[str], DrugInteraction] = {
    frozenset({_normalize_product_name(interaction.product_a), _normalize_product_name(interaction.product_b)}): interaction
    for interaction in _INTERACTION_DATA
}


def check_interaction(drug_a: str, drug_b: str) -> DrugInteraction | None:
    """Look up a documented interaction between two products.

    The lookup is symmetric and accepts case-insensitive product names.

    Args:
        drug_a: First product name.
        drug_b: Second product name.

    Returns:
        The matching :class:`DrugInteraction` if one exists, otherwise ``None``.
    """

    canonical_a = _canonicalize_product_name(drug_a)
    canonical_b = _canonicalize_product_name(drug_b)
    lookup_key = frozenset({_normalize_product_name(canonical_a), _normalize_product_name(canonical_b)})

    interaction = _INTERACTION_LOOKUP.get(lookup_key)
    if interaction is not None:
        return interaction

    if canonical_a in _NO_SIGNIFICANT_INTERACTION_PRODUCTS or canonical_b in _NO_SIGNIFICANT_INTERACTION_PRODUCTS:
        return None

    return None


def check_cart_interactions(drug_list: list[str]) -> list[DrugInteraction]:
    """Check all pairwise interactions in a product list.

    Args:
        drug_list: Products in a customer's basket.

    Returns:
        All matching interactions, sorted by severity with MAJOR first.
    """

    found: list[DrugInteraction] = []
    seen_pairs: set[frozenset[str]] = set()

    for drug_a, drug_b in combinations(drug_list, 2):
        interaction = check_interaction(drug_a, drug_b)
        if interaction is None:
            continue

        key = frozenset({_normalize_product_name(interaction.product_a), _normalize_product_name(interaction.product_b)})
        if key in seen_pairs:
            continue

        seen_pairs.add(key)
        found.append(interaction)

    severity_order = {
        InteractionSeverity.MAJOR: 0,
        InteractionSeverity.MODERATE: 1,
        InteractionSeverity.MINOR: 2,
    }
    return sorted(
        found,
        key=lambda interaction: (
            severity_order[interaction.severity],
            interaction.product_a,
            interaction.product_b,
        ),
    )

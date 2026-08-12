"""Pytest coverage for drug interaction lookups."""

from __future__ import annotations

from interaction_check import InteractionSeverity, check_cart_interactions, check_interaction


def test_known_major_pair_is_found() -> None:
    interaction = check_interaction("Adolor 15mg/ml Amp", "Clexane 4000 Anti-Xa")

    assert interaction is not None
    assert interaction.severity is InteractionSeverity.MAJOR
    assert interaction.product_a == "Adolor 15mg/ml Amp"
    assert interaction.product_b == "Clexane 4000 Anti-Xa"


def test_known_moderate_pair_is_found() -> None:
    interaction = check_interaction("Flagyl 500mg", "Clexane 4000 Anti-Xa")

    assert interaction is not None
    assert interaction.severity is InteractionSeverity.MODERATE
    assert "bleeding" in interaction.mechanism.lower()


def test_product_with_no_interactions_returns_none() -> None:
    interaction = check_interaction("Betadine Antiseptic Solution", "Neurovit Tablets")

    assert interaction is None


def test_cart_interactions_returns_sorted_matches() -> None:
    interactions = check_cart_interactions([
        "Adolor 15mg/ml Amp",
        "Clexane 4000 Anti-Xa",
        "Neurovit Tablets",
    ])

    assert len(interactions) == 1
    assert interactions[0].severity is InteractionSeverity.MAJOR
    assert interactions[0].product_a == "Adolor 15mg/ml Amp"
    assert interactions[0].product_b == "Clexane 4000 Anti-Xa"
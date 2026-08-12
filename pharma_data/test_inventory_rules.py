"""Pytest coverage for drug classification and inventory rule helpers."""

from __future__ import annotations

from drug_classification import classify_drug, get_drugs_by_category
from inventory_rules import (
    check_reorder_needed,
    flag_environment_violation,
    get_storage_requirements,
)


def test_classify_normal_drug() -> None:
    profile = classify_drug("Panadol Advance 500mg")

    assert profile.category == "Analgesic"
    assert profile.dosage_forms == ["Tablet"]
    assert profile.storage_requirements.storage_location_id == "B1-ZN2-SH1-BN1"
    assert profile.storage_requirements.target_temperature == 22
    assert profile.storage_requirements.target_humidity == 45


def test_cold_chain_drug_environment_rules() -> None:
    profile = classify_drug("Insulin Mixtard 30/70 Penfill")
    storage_location_id, target_temperature, target_humidity, temp_tolerance, humidity_tolerance = get_storage_requirements(
        "Insulin Mixtard 30/70 Penfill"
    )

    assert profile.category == "Antidiabetic"
    assert profile.dosage_forms == ["Vial"]
    assert storage_location_id == "B1-ZN1-SH1-BN3"
    assert target_temperature == 4
    assert target_humidity == 60
    assert temp_tolerance == 3
    assert humidity_tolerance == 5
    assert flag_environment_violation("Insulin Mixtard 30/70 Penfill", 4, 60) is False
    assert flag_environment_violation("Insulin Mixtard 30/70 Penfill", 5.5, 60) is False
    assert flag_environment_violation("Insulin Mixtard 30/70 Penfill", 7.1, 60) is True


def test_normal_drug_tolerance_allows_small_temperature_shift() -> None:
    assert flag_environment_violation("Panadol Advance 500mg", 23.5, 45) is False
    assert flag_environment_violation("Panadol Advance 500mg", 23.9, 45) is False


def test_normal_drug_boundary_temperature_shift_flags_violation() -> None:
    assert flag_environment_violation("Panadol Advance 500mg", 24.1, 45) is True


def test_reorder_boundary_and_trigger() -> None:
    reorder_needed, reorder_quantity = check_reorder_needed("Panadol Advance 500mg", 20)
    below_threshold_needed, below_threshold_quantity = check_reorder_needed(
        "Panadol Advance 500mg",
        19,
    )

    assert reorder_needed is False
    assert reorder_quantity == 0
    assert below_threshold_needed is True
    assert below_threshold_quantity == 100


def test_category_filtering_is_case_insensitive() -> None:
    analgesics = get_drugs_by_category("analgesic")

    assert any(drug.drug_name == "Panadol Advance 500mg" for drug in analgesics)

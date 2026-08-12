"""Inventory and storage rule helpers for Smart Eco-Pharma Hub."""

from __future__ import annotations

from typing import Sequence

from drug_classification import Drug, _find_drug


def check_reorder_needed(
    drug_name: str,
    current_stock: int,
    drugs: Sequence[Drug] | None = None,
) -> tuple[bool, int]:
    """Check whether a reorder should be triggered.

    Args:
        drug_name: Drug name to evaluate.
        current_stock: Current on-hand stock level.
        drugs: Optional in-memory collection to search instead of the module
            default dataset.

    Returns:
        A tuple of ``(needs_reorder, reorder_quantity)``. When stock is at or
        above the threshold, the tuple is ``(False, 0)``. When stock falls below
        the threshold, the tuple is ``(True, reorder_quantity)``.

    Raises:
        LookupError: If the drug cannot be found.
    """

    record = _find_drug(drug_name, drugs)
    if current_stock < record.min_stock_threshold:
        return True, record.reorder_quantity
    return False, 0


def get_storage_requirements(
    drug_name: str,
    drugs: Sequence[Drug] | None = None,
) -> tuple[str, int, int, float, float]:
    """Return the storage requirements for a drug.

    Args:
        drug_name: Drug name to look up.
        drugs: Optional in-memory collection to search instead of the module
            default dataset.

    Returns:
        A tuple of ``(storage_location_id, target_temperature, target_humidity,
        temp_tolerance, humidity_tolerance)``.

    Raises:
        LookupError: If the drug cannot be found.
    """

    record = _find_drug(drug_name, drugs)
    return (
        record.storage_location_id,
        record.target_temperature,
        record.target_humidity,
        record.temp_tolerance,
        record.humidity_tolerance,
    )


def flag_environment_violation(
    drug_name: str,
    current_temp: float,
    current_humidity: float,
    drugs: Sequence[Drug] | None = None,
) -> bool:
    """Check whether current environment readings violate the drug's targets.

    Args:
        drug_name: Drug name to evaluate.
        current_temp: Current sensor temperature reading in degrees Celsius.
        current_humidity: Current sensor humidity reading in percent.
        drugs: Optional in-memory collection to search instead of the module
            default dataset.

    Returns:
        ``True`` when either reading is outside the target values, otherwise
        ``False``.

    Raises:
        LookupError: If the drug cannot be found.
    """

    _, target_temp, target_humidity, temp_tolerance, humidity_tolerance = get_storage_requirements(
        drug_name,
        drugs,
    )

    return (
        abs(current_temp - target_temp) > temp_tolerance
        or abs(current_humidity - target_humidity) > humidity_tolerance
    )

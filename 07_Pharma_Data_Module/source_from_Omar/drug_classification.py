"""Drug classification and CSV loading utilities for the Smart Eco-Pharma Hub.

This module reads the OTC master CSV into dataclass-backed records and exposes
helpers for looking up a drug's category, dosage forms, and storage metadata.
"""

from __future__ import annotations

import csv
from dataclasses import dataclass
from pathlib import Path
from typing import Sequence


CSV_FILENAME_CANDIDATES = (
    "Egyptian_OTC_Drugs_With_Tolerances_V4_1_.csv",
    "Egyptian_OTC_Drugs_With_Tolerances_V4(1) (1).csv",
)


@dataclass(frozen=True, slots=True)
class Drug:
    """Structured representation of a single CSV row.

    Attributes:
        drug_name: The master-list drug name.
        category: The medical category assigned to the drug.
        dosage_forms: Normalized list of dosage forms parsed from the CSV text.
        min_stock_threshold: Reorder trigger point.
        reorder_quantity: Quantity to reorder when stock falls below threshold.
        storage_location_id: Warehouse/bin location identifier.
        target_temperature: Required storage temperature in degrees Celsius.
        target_humidity: Required storage humidity in percent.
        temp_tolerance: Allowed temperature drift in degrees Celsius.
        humidity_tolerance: Allowed humidity drift in percent.
    """

    drug_name: str
    category: str
    dosage_forms: list[str]
    min_stock_threshold: int
    reorder_quantity: int
    storage_location_id: str
    target_temperature: int
    target_humidity: int
    temp_tolerance: float
    humidity_tolerance: float


@dataclass(frozen=True, slots=True)
class StorageRequirements:
    """Storage metadata for a drug."""

    storage_location_id: str
    target_temperature: int
    target_humidity: int


@dataclass(frozen=True, slots=True)
class DrugProfile:
    """Classification summary returned by :func:`classify_drug`.

    The shape is friendly for API serialization while staying explicit about the
    storage requirements associated with the drug.
    """

    drug_name: str
    category: str
    dosage_forms: list[str]
    storage_requirements: StorageRequirements


def _resolve_csv_path(csv_path: str | Path | None = None) -> Path:
    """Resolve the master CSV path.

    Args:
        csv_path: Optional explicit CSV path.

    Returns:
        The resolved CSV path.

    Raises:
        FileNotFoundError: If no matching CSV file can be found.
    """

    if csv_path is not None:
        candidate = Path(csv_path)
        if candidate.exists():
            return candidate
        raise FileNotFoundError(f"CSV file not found: {candidate}")

    module_dir = Path(__file__).resolve().parent
    for filename in CSV_FILENAME_CANDIDATES:
        candidate = module_dir / filename
        if candidate.exists():
            return candidate

    csv_files = list(module_dir.glob("*.csv"))
    if len(csv_files) == 1:
        return csv_files[0]

    raise FileNotFoundError(
        "Could not locate the Smart Eco-Pharma CSV. Expected one of: "
        f"{', '.join(CSV_FILENAME_CANDIDATES)}"
    )


def parse_dosage_forms(raw_value: str) -> list[str]:
    """Parse a Postgres-array style dosage form field into a clean list.

    Args:
        raw_value: Raw CSV field, typically in the form '{"Tablet"}'.

    Returns:
        A list of normalized dosage form strings. Empty values return an empty
        list.
    """

    cleaned = raw_value.strip()
    if not cleaned:
        return []

    if cleaned.startswith("{") and cleaned.endswith("}"):
        cleaned = cleaned[1:-1]

    reader = csv.reader([cleaned], skipinitialspace=True)
    values = next(reader, [])
    parsed_forms: list[str] = []
    for value in values:
        normalized = value.strip().strip('"').strip("'")
        if normalized:
            parsed_forms.append(normalized)
    return parsed_forms


def load_drugs(csv_path: str | Path | None = None) -> list[Drug]:
    """Load the drug master list from CSV.

    Args:
        csv_path: Optional explicit CSV path. If omitted, the module resolves the
            bundled master CSV automatically.

    Returns:
        A list of :class:`Drug` records.
    """

    resolved_path = _resolve_csv_path(csv_path)
    drugs: list[Drug] = []

    with resolved_path.open(newline="", encoding="utf-8-sig") as csv_file:
        reader = csv.DictReader(csv_file)
        required_fields = {
            "drug_name",
            "category",
            "dosage_forms",
            "min_stock_threshold",
            "reorder_quantity",
            "storage_location_id",
            "target_temperature",
            "temp_tolerance",
            "target_humidity",
            "humidity_tolerance",
        }

        missing_fields = required_fields.difference(reader.fieldnames or [])
        if missing_fields:
            missing = ", ".join(sorted(missing_fields))
            raise ValueError(f"CSV file is missing required columns: {missing}")

        for row in reader:
            drugs.append(
                Drug(
                    drug_name=row["drug_name"].strip(),
                    category=row["category"].strip(),
                    dosage_forms=parse_dosage_forms(row["dosage_forms"]),
                    min_stock_threshold=int(row["min_stock_threshold"]),
                    reorder_quantity=int(row["reorder_quantity"]),
                    storage_location_id=row["storage_location_id"].strip(),
                    target_temperature=int(row["target_temperature"]),
                    target_humidity=int(row["target_humidity"]),
                    temp_tolerance=float(row["temp_tolerance"]),
                    humidity_tolerance=float(row["humidity_tolerance"]),
                )
            )

    return drugs


def _normalize_name(value: str) -> str:
    return " ".join(value.casefold().split())


def _find_drug(drug_name: str, drugs: Sequence[Drug] | None = None) -> Drug:
    """Find a drug by name using case-insensitive normalization.

    Raises:
        LookupError: If the drug is not present in the master list.
    """

    records = list(drugs) if drugs is not None else DRUGS
    normalized_target = _normalize_name(drug_name)

    for record in records:
        if _normalize_name(record.drug_name) == normalized_target:
            return record

    raise LookupError(f"Drug not found in master list: {drug_name}")


def classify_drug(drug_name: str, drugs: Sequence[Drug] | None = None) -> DrugProfile:
    """Return the classification summary for a drug.

    Args:
        drug_name: Drug name to look up.
        drugs: Optional in-memory collection to search instead of the module
            default dataset.

    Returns:
        A :class:`DrugProfile` containing the category, dosage forms, and
        storage requirements.

    Raises:
        LookupError: If the drug cannot be found.
    """

    record = _find_drug(drug_name, drugs)
    return DrugProfile(
        drug_name=record.drug_name,
        category=record.category,
        dosage_forms=list(record.dosage_forms),
        storage_requirements=StorageRequirements(
            storage_location_id=record.storage_location_id,
            target_temperature=record.target_temperature,
            target_humidity=record.target_humidity,
        ),
    )


def get_drugs_by_category(category: str, drugs: Sequence[Drug] | None = None) -> list[Drug]:
    """Filter the master list by category.

    Args:
        category: Category to match, compared case-insensitively.
        drugs: Optional in-memory collection to filter instead of the module
            default dataset.

    Returns:
        A list of :class:`Drug` records belonging to the requested category.
    """

    records = list(drugs) if drugs is not None else DRUGS
    normalized_category = _normalize_name(category)
    return [record for record in records if _normalize_name(record.category) == normalized_category]


DRUGS = load_drugs()

# Smart Eco-Pharma Hub — Schema Contract

> **Document purpose:** This is the single source of truth for every database table in the project.  
> It tells each team member exactly what fields exist, what they mean, and who is responsible for filling them in.

---

## Table of Contents

1. [team\_members](#1-team_members) — Who's on the team
2. [drug\_master](#2-drug_master) — Core drug reference data
3. [purity\_classification](#3-purity_classification) — QA purity records *(Eman's domain)*
4. [otc\_inventory](#4-otc_inventory) — Stock & storage tracking *(Fatma's domain)*
5. [drug\_interactions](#5-drug_interactions) — Pharmacovigilance data *(Dr. Mohamed's domain)*
6. [Quick Reference by Team Member](#quick-reference-by-team-member)
7. [Field Naming Conventions](#field-naming-conventions)
8. [Data Types Quick Guide](#data-types-quick-guide)
9. [Important Notes](#important-notes)

---

## 1. team_members

**Purpose:** Stores every person who has access to the system. This is the "phone book" of the database — other tables reference it when they need to record who did something.

**Owner:** Architecture team

| Field Name | Data Type | Constraints | Nullable | Default | Owner Team | Notes |
|---|---|---|---|---|---|---|
| `id` | UUID | PRIMARY KEY | NOT NULL | Auto-generated | Architecture | Unique ID for each team member. You never type this in — the system creates it automatically. |
| `user_id` | UUID | FK → auth.users | NOT NULL | — | Architecture | Links this record to the system's login account. Set once when the person is added to the platform. |
| `role` | TEXT (enum) | CHECK (valid enum values) | NOT NULL | — | Architecture | The person's job role in the project (e.g., `qa_engineer`, `clinical_pharmacist`, `pharmacovigilance_officer`, `architect`, `backend_dev`, `frontend_dev`, `iot_engineer`). Assigned by the architecture team. |
| `full_name` | TEXT | — | NOT NULL | — | Architecture | The person's full name exactly as it should appear in reports (e.g., "Eman Ayman"). |
| `email` | TEXT | — | NOT NULL | — | Architecture | Work email address for notifications and login. |
| `created_at` | TIMESTAMPTZ | — | NOT NULL | `NOW()` | Architecture | Date and time this record was created. You never touch this — it fills itself. |

---

## 2. drug_master

**Purpose:** The master list of every drug the project tracks. Every other drug-related table points back to this one. Think of it as the "drug dictionary" — it holds the essential facts about each drug so they don't need to be repeated everywhere.

**Owner:** Architecture team (core reference — shared by everyone)

| Field Name | Data Type | Constraints | Nullable | Default | Owner Team | Notes |
|---|---|---|---|---|---|---|
| `id` | UUID | PRIMARY KEY | NOT NULL | Auto-generated | Architecture | Unique ID for each drug. Created automatically — never type it manually. |
| `drug_name` | TEXT | NOT NULL | NOT NULL | — | Architecture | The generic/scientific name of the drug (e.g., "Paracetamol", "Amoxicillin"). This is the primary name used across the system. |
| `brand_name` | TEXT | — | YES | `NULL` | Architecture | The commercial/brand name if one exists (e.g., "Tylenol" for Paracetamol). Leave blank if the drug has no brand name. |
| `drug_class` | TEXT | — | YES | `NULL` | Architecture | The pharmacological class the drug belongs to (e.g., "Analgesic", "Antibiotic", "Antihistamine"). Helps with grouping and filtering. |
| `regulatory_status` | TEXT (enum) | CHECK (`prescription_only`, `otc`, `controlled`) | NOT NULL | — | Architecture | Whether the drug is **prescription only**, **over-the-counter (otc)**, or **controlled**. This affects inventory rules and legal requirements. |
| `dosage_forms` | TEXT[] (array) | — | YES | `NULL` | Architecture | A list of all available forms for this drug. Example: `{"tablet", "syrup", "injection"}`. Enter each form as a separate item in the list. |
| `active_ingredients` | TEXT | NOT NULL | NOT NULL | — | Architecture | The chemical active ingredient(s) in the drug (e.g., "Acetaminophen 500mg"). Must be filled in for every drug. |
| `route_of_administration` | TEXT | — | YES | `NULL` | Architecture | How the drug enters the body (e.g., "oral", "intravenous", "topical"). |
| `record_version` | INTEGER | — | NOT NULL | `1` | Architecture | Version number that increments every time this record is edited. Used to prevent overwriting conflicts. You don't change this manually — the system handles it. |
| `created_at` | TIMESTAMPTZ | — | NOT NULL | `NOW()` | Architecture | When this drug record was first created. Auto-filled. |
| `updated_at` | TIMESTAMPTZ | — | NOT NULL | `NOW()` | Architecture | When this drug record was last modified. Auto-updated by the system. |
| `deleted_at` | TIMESTAMPTZ | — | YES | `NULL` | Architecture | **Soft delete timestamp.** When a drug is "deleted," this field is set instead of actually removing the row. If this is `NULL`, the record is active. See [Important Notes](#important-notes). |

---

## 3. purity_classification

**Purpose:** Records the quality-assurance (QA) purity analysis for each drug. Every time a drug is tested for purity, a row is created here with the results, who did the test, and what protocol was followed.

**Owner:** **Eman Ayman** (QA team) — she defines the allowed purity grades and fills most fields.

| Field Name | Data Type | Constraints | Nullable | Default | Owner Team | Notes |
|---|---|---|---|---|---|---|
| `id` | UUID | PRIMARY KEY | NOT NULL | Auto-generated | Architecture | Unique ID for this purity record. Auto-generated. |
| `drug_id` | UUID | FK → drug\_master | NOT NULL | — | Architecture | Which drug this purity test is for. Pick from the drug\_master list. |
| `purity_grade` | TEXT | — | NOT NULL | — | **Eman** | The quality grade assigned to this batch (e.g., "USP", "BP", "Ph.Eur"). **⚠ Eman must define the exact list of allowed values before this table goes live.** |
| `purity_percent` | NUMERIC(5,2) | — | YES | `NULL` | **Eman** | The measured purity as a percentage. Example: `99.50` means 99.50% pure. Up to 5 digits total, 2 after the decimal. |
| `unit` | TEXT | — | YES | `NULL` | **Eman** | The unit for the purity measurement. Usually `%` (percent), but Eman can specify otherwise. |
| `qc_protocol_ref` | TEXT | — | YES | `NULL` | **Eman** | Reference code for the QC protocol used (e.g., "SOP-QA-042"). Helps trace which procedure was followed. |
| `test_method` | TEXT | — | YES | `NULL` | **Eman** | The analytical method used for testing (e.g., "HPLC", "Mass Spectrometry", "Titration"). Eman fills this in based on the actual lab work. |
| `test_status` | TEXT (enum) | CHECK (`pass`, `fail`, `pending`) | NOT NULL | `pending` | **Eman** | The outcome of the purity test. Set to `pending` when a test is queued, `pass` when it passes, or `fail` when it doesn't meet the grade. |
| `qc_analyst_id` | UUID | FK → team\_members | YES | `NULL` | **Eman** | The team member who performed (or will perform) the test. Select from team\_members. |
| `test_date` | DATE | — | YES | `NULL` | **Eman** | The calendar date the test was conducted (e.g., `2026-07-15`). No time component — just the date. |
| `notes` | TEXT | — | YES | `NULL` | **Eman** | Any free-text observations, caveats, or context about this purity test. Use this for anything that doesn't fit the other fields. |
| `created_at` | TIMESTAMPTZ | — | NOT NULL | `NOW()` | Architecture | When this record was created. Auto-filled. |
| `updated_at` | TIMESTAMPTZ | — | NOT NULL | `NOW()` | Architecture | When this record was last modified. Auto-updated. |

---

## 4. otc_inventory

**Purpose:** Tracks the physical stock, storage conditions, and reorder status of over-the-counter (OTC) drugs. This is the living inventory — it tells you what's on the shelf, where it is, and when you're running low.

**Owner:** **Fatma Mohamed** (Clinical Pharmacy team) — she defines stock thresholds and manages day-to-day inventory.

| Field Name | Data Type | Constraints | Nullable | Default | Owner Team | Notes |
|---|---|---|---|---|---|---|
| `id` | UUID | PRIMARY KEY | NOT NULL | Auto-generated | Architecture | Unique ID for this inventory record. Auto-generated. |
| `drug_id` | UUID | FK → drug\_master | NOT NULL | — | Architecture | Which drug this inventory row is for. Must match a drug in drug\_master. |
| `stock_quantity` | INTEGER | — | NOT NULL | `0` | **Fatma** | Current number of units on hand. Fatma updates this whenever stock changes (new shipment, dispensing, waste). |
| `stock_unit` | TEXT | NOT NULL | NOT NULL | — | **Fatma** | The unit of measure for counting stock (e.g., "tablets", "bottles", "vials", "boxes"). Every row must specify this. |
| `min_stock_threshold` | INTEGER | — | YES | `NULL` | **Fatma** | The minimum quantity before this item is considered "low stock." **⚠ Fatma must define the correct threshold for each drug.** Below this number, the system flags it for reorder. |
| `reorder_quantity` | INTEGER | — | YES | `NULL` | **Fatma** | How many units to order when a reorder is triggered. Helps standardize purchasing. |
| `max_storage_capacity` | INTEGER | — | YES | `NULL` | **Fatma** | The maximum number of units this storage location can hold. Prevents overstocking. |
| `storage_location_identifier` | TEXT | UNIQUE, NOT NULL | NOT NULL | — | **Fatma** | A unique code for where this drug is physically stored (e.g., "SHELF-A3", "FRIDGE-02", "CABINET-B1"). Every storage spot gets its own identifier. No two records can share the same one. |
| `storage_temp_min_c` | NUMERIC(4,1) | — | YES | `NULL` | **Fatma** | Minimum safe storage temperature in °C. Example: `2.0` means 2.0 °C. Leave blank if no temperature requirement. |
| `storage_temp_max_c` | NUMERIC(4,1) | — | YES | `NULL` | **Fatma** | Maximum safe storage temperature in °C. Example: `8.0` means 8.0 °C. |
| `storage_humidity_min_pct` | NUMERIC(4,1) | — | YES | `NULL` | **Fatma** | Minimum safe relative humidity percentage. Example: `30.0` means 30%. |
| `storage_humidity_max_pct` | NUMERIC(4,1) | — | YES | `NULL` | **Fatma** | Maximum safe relative humidity percentage. Example: `65.0` means 65%. |
| `batch_expiry_date` | DATE | — | YES | `NULL` | **Fatma** | The expiration date of the current batch on this shelf. Critical for FIFO (first-in, first-out) stock management. |
| `supplier_ref` | TEXT | — | YES | `NULL` | **Fatma** | Reference code or name for the supplier of this batch (e.g., "PharmaCo-Egypt", "PO-2026-0412"). Useful for reordering. |
| `last_restocked_date` | DATE | — | YES | `NULL` | **Fatma** | The date this storage location was last restocked. Helps track stock freshness. |
| `reorder_status` | TEXT (enum) | CHECK (`normal`, `low`, `critical`, `on_order`) | NOT NULL | `normal` | **Fatma** | Current reorder state. `normal` = stock is fine, `low` = approaching minimum, `critical` = below minimum, `on_order` = reorder placed but not yet received. Fatma updates this as conditions change. |
| `created_at` | TIMESTAMPTZ | — | NOT NULL | `NOW()` | Architecture | When this record was created. Auto-filled. |
| `updated_at` | TIMESTAMPTZ | — | NOT NULL | `NOW()` | Architecture | When this record was last modified. Auto-updated. |

---

## 5. drug_interactions

**Purpose:** Documents known interactions between pairs of drugs. This is the pharmacovigilance knowledge base — it tells clinicians what happens when two drugs are used together and how serious it is.

**Owner:** **Dr. Mohamed Ibrahim** (Pharmacovigilance team) — he defines interaction types, risk grades, and clinical consequences.

| Field Name | Data Type | Constraints | Nullable | Default | Owner Team | Notes |
|---|---|---|---|---|---|---|
| `id` | UUID | PRIMARY KEY | NOT NULL | Auto-generated | Architecture | Unique ID for this interaction record. Auto-generated. |
| `drug_a_id` | UUID | FK → drug\_master | NOT NULL | — | Architecture | The first drug in the interaction pair. Must exist in drug\_master. |
| `drug_b_id` | UUID | FK → drug\_master | NOT NULL | — | Architecture | The second drug in the interaction pair. Must exist in drug\_master. **The pair (drug\_a, drug\_b) should be unique — don't duplicate the same pair in reverse order.** |
| `interaction_type` | TEXT | — | YES | `NULL` | **Dr. Mohamed** | Describes the nature of the interaction (e.g., "synergistic", "antagonistic", "additive", "pharmacokinetic", "pharmacodynamic"). Dr. Mohamed selects the appropriate type. |
| `risk_grade` | TEXT (enum) | CHECK (`grade_1_minimal`, `grade_2_moderate`, `grade_3_severe`, `grade_4_contraindicated`) | NOT NULL | — | **Dr. Mohamed** | How dangerous the interaction is. Four levels from minimal risk to absolute contraindication (must not be combined). **⚠ These are PLACEHOLDER values — Dr. Mohamed must validate and finalize them.** |
| `clinical_consequence` | TEXT | NOT NULL | NOT NULL | — | **Dr. Mohamed** | Plain-language description of what happens when these drugs interact (e.g., "Increased risk of GI bleeding", "Reduced efficacy of anticoagulant"). This is the most important field for clinical decision-making. |
| `evidence_level` | TEXT (enum) | CHECK (`established`, `theoretical`, `case_report`) | NOT NULL | — | **Dr. Mohamed** | How strong the evidence is. `established` = proven in studies, `theoretical` = predicted by mechanism but not widely documented, `case_report` = observed in individual patient reports. |
| `mechanism` | TEXT | — | YES | `NULL` | **Dr. Mohamed** | Technical explanation of *why* the interaction happens (e.g., "CYP3A4 enzyme inhibition"). Optional but very useful for clinical reference. |
| `management_recommendation` | TEXT | — | YES | `NULL` | **Dr. Mohamed** | What a clinician should do if a patient needs both drugs (e.g., "Monitor INR closely", "Separate dosing by 2 hours", "Avoid combination — select alternative"). |
| `ai_generated` | BOOLEAN | — | NOT NULL | `false` | Architecture | `true` if this interaction record was initially generated by an AI model and needs human review. `false` if it was authored or verified by a human. Used for audit trail. |
| `gpt_model_version` | TEXT | — | YES | `NULL` | Architecture | If `ai_generated` is `true`, this records which AI model version produced it (e.g., "gpt-4o-2026-05-13"). Blank for human-authored records. |
| `source_reference` | TEXT | — | YES | `NULL` | **Dr. Mohamed** | Citation or URL for the source of this interaction data (e.g., "DrugBank DB00316", "Lexicomp interaction ID 9842", journal DOI). Always good practice to include. |
| `created_at` | TIMESTAMPTZ | — | NOT NULL | `NOW()` | Architecture | When this record was created. Auto-filled. |
| `updated_at` | TIMESTAMPTZ | — | NOT NULL | `NOW()` | Architecture | When this record was last modified. Auto-updated. |

---

## Quick Reference by Team Member

This section tells you at a glance which tables and fields you are responsible for.

### Eman Ayman — QA / Purity

- **Owns:** `purity_classification` (all fields except `id` and `drug_id`)
- **Action required:** Define the allowed values for `purity_grade` before go-live.

### Fatma Mohamed — Clinical Pharmacy / Inventory

- **Owns:** `otc_inventory` (all fields except `id` and `drug_id`)
- **Action required:** Define the `min_stock_threshold` values for each drug before go-live.

### Dr. Mohamed Ibrahim — Pharmacovigilance

- **Owns:** `drug_interactions` (all fields except `id`)
- **Action required:** Validate and finalize the `risk_grade` enum values.

### Omar Hindawi — Backend Developer

- **Reads this document** to build Python models, API endpoints, and validation logic that match these exact field definitions.

### Aya El-Hariry — Frontend Developer

- **Reads this document** to understand API responses, build forms, and display data correctly in the UI.

### Fagr Ahmed — IoT Engineer

- **Reads the separate IoT contract** for sensor data schemas. This document covers database tables only.

---

## Field Naming Conventions

All fields in every table follow these rules:

| Rule | Example |
|---|---|
| **snake\_case** — lowercase, words separated by underscores | `stock_quantity`, `drug_class` |
| **Fully explicit** — no abbreviations | `storage_location_identifier` (not `loc_id`) |
| **Timestamps use `_at` suffix** | `created_at`, `updated_at`, `deleted_at` |
| **Booleans use `is_` or `has_` prefix** *(exception: `ai_generated`)* | `is_active`, `has_brand` |
| **Foreign keys end with `_id`** | `drug_id`, `user_id`, `qc_analyst_id` |

---

## Data Types Quick Guide

If you're not sure what a data type means, look it up here:

| Data Type | What It Is | Example |
|---|---|---|
| `UUID` | A unique identifier (long random string). Generated automatically — you never type these. | `550e8400-e29b-41d4-a716-446655440000` |
| `TEXT` | Any text or string. Letters, numbers, symbols — whatever you need. | `"Paracetamol"`, `"SHELF-A3"` |
| `INTEGER` | A whole number. No decimals. | `42`, `0`, `-5` |
| `NUMERIC(5,2)` | A decimal number with up to 5 digits total, 2 after the decimal point. | `99.50`, `4.0`, `0.00` |
| `BOOLEAN` | A true/false value. | `true`, `false` |
| `DATE` | A calendar date only — no time. Format: `YYYY-MM-DD`. | `2026-07-15` |
| `TIMESTAMPTZ` | A full date + time with timezone. Usually auto-filled. | `2026-07-15T10:30:00+02:00` |
| `TEXT[]` | An array (list) of text values. Enclosed in curly braces. | `{"tablet", "syrup"}` |

---

## Important Notes

1. **Soft deletes on drug\_master**  
   When a drug is "deleted," the system sets `deleted_at` to the current time instead of removing the row. This means:
   - The record still exists in the database.
   - Other tables can still reference it (foreign keys stay valid).
   - Reports can filter out deleted records by checking `WHERE deleted_at IS NULL`.
   - **No one should ever physically delete a row from `drug_master`.**

2. **purity\_classification.purity\_grade — NOT YET DEFINED**  
   Eman must define the exact list of allowed values for this field (e.g., "USP Grade", "BP Grade", "Ph.Eur", "Food Grade", "Technical Grade"). The system cannot go live until this is finalized.

3. **drug\_interactions.risk\_grade — PLACEHOLDER VALUES**  
   The four grades listed (`grade_1_minimal`, `grade_2_moderate`, `grade_3_severe`, `grade_4_contraindicated`) are placeholders. Dr. Mohamed must review and confirm these match the project's clinical risk framework before production use.

4. **otc\_inventory.min\_stock\_threshold — NOT YET DEFINED**  
   Fatma must define the correct minimum stock threshold for each drug. These values depend on consumption rates, lead times, and regulatory requirements. The system cannot trigger accurate reorder alerts without them.

5. **Unique constraint on storage\_location\_identifier**  
   No two inventory records can share the same `storage_location_identifier`. If a drug is stored in multiple locations, each location gets its own row in `otc_inventory`.

6. **drug\_interactions pair uniqueness**  
   The combination of `drug_a_id` and `drug_b_id` should be unique. Avoid creating duplicate entries for the same drug pair — if an interaction is already recorded, update the existing record instead.

---

*Document version: 1.0 — July 2026*  
*Project: Smart Eco-Pharma Hub*  
*Maintained by: Architecture team*

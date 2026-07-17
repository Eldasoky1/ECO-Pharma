# Assumption Log — Phase 1: Schema Design

**Project:** Smart Eco-Pharma Hub  
**Phase:** 1 — Schema Design & Data Model  
**Author:** opencode (big-pickle)  
**Date:** 2026-07-15  
**Purpose:** Every field or design decision where an assumption was made due to unavailable domain knowledge. Each assumption must be validated by the relevant specialist before Phase 2.

---

## Status Key

| Status     | Meaning                                                                 |
|------------|-------------------------------------------------------------------------|
| OPEN       | Not yet validated. Must be confirmed before implementation proceeds.    |
| VALIDATED  | Domain specialist has reviewed and approved.                            |
| OVERRIDE   | Domain specialist rejected the assumption; schema change required.      |

---

## Assumptions

### ASSUMPTION-001: purity_grade Is Free-Text

**What I assumed:** `purity_classification.purity_grade` is a free-text label (e.g. "USP Grade", "Analytical Grade", "Technical Grade") rather than a predefined enum.  
**Why:** No domain taxonomy was provided. Common pharma grading systems vary by region and institution, so free-text accommodates flexibility.  
**Who must validate:** Eman (QC Lead)  
**Schema impact if wrong:** If Eman wants a fixed set of grades, the column must be changed to an ENUM or a lookup table must be introduced via migration.  
**Status:** OPEN

---

### ASSUMPTION-002: purity_percent Precision Sufficiency

**What I assumed:** `purity_classification.purity_percent` uses `NUMERIC(5,2)`, which supports values up to 999.99%. This accommodates standard pharmaceutical purity values like 99.95%.  
**Why:** Most commercial drug substances report purity to two decimal places.  
**Who must validate:** Eman (QC Lead)  
**Schema impact if wrong:** If Eman needs higher precision (e.g. 99.999% for ultra-pure reference standards), the column must be altered to `NUMERIC(7,5)`.  
**Status:** OPEN

---

### ASSUMPTION-003: purity_percent Unit Is Percent

**What I assumed:** `purity_classification.unit` stores the unit of measurement for `purity_percent` and defaults to percent ("%"). Other possible units include "mg/mL" or "mg/g".  
**Why:** Purity in pharma QC is overwhelmingly reported as a percentage.  
**Who must validate:** Eman (QC Lead)  
**Schema impact if wrong:** If Eman uses concentration-based purity metrics (mg/mL), the unit field must be populated accordingly and downstream calculations must be adjusted.  
**Status:** OPEN

---

### ASSUMPTION-004: qc_protocol_ref Is Free-Text Reference

**What I assumed:** `purity_classification.qc_protocol_ref` is a free-text reference string (e.g. "QC-PROT-001") pointing to Eman's internal protocol document.  
**Why:** Protocol naming conventions vary by organization. Free-text allows any reference format.  
**Who must validate:** Eman (QC Lead)  
**Schema impact if wrong:** If Eman wants hyperlinks to digital documents, the field type is fine but a URL validation convention must be agreed upon. If she wants to link to stored files in Supabase Storage, a foreign key to a documents table would be needed.  
**Status:** OPEN

---

### ASSUMPTION-005: test_method Is Free-Text

**What I assumed:** `purity_classification.test_method` is a free-text field accepting values like "HPLC", "UV Spectroscopy", "TLC", or "Mass Spectrometry".  
**Why:** QC labs use multiple analytical methods depending on the drug substance. No standard list was provided.  
**Who must validate:** Eman (QC Lead)  
**Schema impact if wrong:** If Eman wants a controlled vocabulary, this must be converted to an ENUM or lookup table. A partial index on `test_method` may be needed for query performance if the table grows large.  
**Status:** OPEN

---

### ASSUMPTION-006: dosage_forms Stored as Array

**What I assumed:** `drug_master.dosage_forms` uses `TEXT[]` (PostgreSQL array) to store multiple dosage forms per drug (e.g. `{"tablet", "capsule", "oral_suspension"}`).  
**Why:** Some drugs are manufactured in multiple forms. An array avoids a junction table for simple multi-value storage.  
**Who must validate:** Fatma (Clinical Pharmacist)  
**Schema impact if wrong:** If Supabase UI does not support array editing well, or if Fatma needs metadata per dosage form (e.g. shelf life per form), a separate `drug_dosage_forms` junction table must be created via migration.  
**Status:** OPEN

---

### ASSUMPTION-007: regulatory_status Enum Scope

**What I assumed:** `drug_master.regulatory_status` is an ENUM with three values: `prescription_only`, `otc`, `controlled`.  
**Why:** These are the three most common regulatory classifications in Egyptian pharmaceutical regulation.  
**Who must validate:** Dr. Mohamed (Regulatory Affairs), Fatma (Clinical Pharmacist)  
**Schema impact if wrong:** If Dr. Mohamed or Fatma require additional categories (e.g. "herbal", "supplement", "cosmeceutical", "vaccine"), the ENUM must be extended via `ALTER TYPE ... ADD VALUE` migration.  
**Status:** OPEN

---

### ASSUMPTION-008: min_stock_threshold Is Per-Record

**What I assumed:** `otc_inventory.min_stock_threshold` is a single integer per inventory record, representing the minimum units before reorder is triggered.  
**Why:** This is the simplest model for a single-location pharmacy. Fatma did not specify location-specific or class-specific thresholds.  
**Who must validate:** Fatma (Clinical Pharmacist)  
**Schema impact if wrong:** If Fatma wants different thresholds per storage location or per drug class, a separate `stock_threshold_rules` table with priority logic would be required.  
**Status:** OPEN

---

### ASSUMPTION-009: reorder_quantity Is Static

**What I assumed:** `otc_inventory.reorder_quantity` is a fixed integer stored per inventory record (e.g. reorder 50 units at a time).  
**Why:** Dynamic reorder calculation (e.g. 30-day supply based on consumption rate) is a business logic concern best handled in the Python layer.  
**Who must validate:** Fatma (Clinical Pharmacist)  
**Schema impact if wrong:** If Fatma wants the system to auto-calculate reorder quantities based on historical dispensing data, the field becomes a computed/virtual column or is removed entirely in favor of a stored procedure.  
**Status:** OPEN

---

### ASSUMPTION-010: storage_location_identifier Is Free-Text

**What I assumed:** `otc_inventory.storage_location_identifier` is a free-text field using a naming convention like "SHELF-A3-B2" or "FRIDGE-01".  
**Why:** No standardized location taxonomy was provided. Free-text allows Fatma to use her existing physical layout.  
**Who must validate:** Fatma (Clinical Pharmacist)  
**Schema impact if wrong:** If Fatma wants hierarchical locations (building > room > shelf > bin), a separate `storage_locations` table with parent-child relationships would be needed. This field is the critical link between IoT sensor readings and inventory records — inconsistency here breaks the IoT integration.  
**Status:** OPEN

---

### ASSUMPTION-011: Storage Temperature Range Precision

**What I assumed:** `otc_inventory.storage_temp_min_c` and `storage_temp_max_c` use `NUMERIC(4,1)`, supporting values from -99.9 to 999.9 with one decimal place (e.g. 2.0°C to 8.0°C for cold chain).  
**Why:** Standard pharmaceutical temperature ranges have sub-degree significance (e.g. 2–8°C cold chain, 15–25°C controlled room temperature).  
**Who must validate:** Fatma (Clinical Pharmacist)  
**Schema impact if wrong:** The current precision supports sub-degree values (e.g. 2.5°C). If Fatma needs integer-only ranges, the type can be simplified to `SMALLINT`. If she needs Kelvin or Fahrenheit support, a `storage_temp_unit` column must be added.  
**Status:** OPEN

---

### ASSUMPTION-012: Storage Humidity Range Values

**What I assumed:** `otc_inventory.storage_humidity_min_pct` and `storage_humidity_max_pct` use `NUMERIC(4,1)` for percentage values (e.g. 30.0% to 65.0% RH).  
**Why:** Standard pharmaceutical storage humidity is 30–65% relative humidity per USP <659>.  
**Who must validate:** Fatma (Clinical Pharmacist)  
**Schema impact if wrong:** If Fatma uses a different humidity standard or needs integer-only values, the type can be adjusted. If humidity is not tracked per-drug (only per-location), these columns should be moved to a `storage_locations` table instead.  
**Status:** OPEN

---

### ASSUMPTION-013: interaction_type Is Free-Text

**What I assumed:** `drug_interactions.interaction_type` is a free-text field (e.g. "pharmacokinetic", "pharmacodynamic", "pharmaceutical").  
**Why:** No interaction taxonomy was provided. Drug interaction classifications vary across references (Lexicomp, Micromedex, BNF).  
**Who must validate:** Dr. Mohamed (Pharmacovigilance Lead)  
**Schema impact if wrong:** Once Dr. Mohamed defines his taxonomy, this column should be converted to an ENUM for data integrity. Free-text invites inconsistencies (e.g. "PK" vs "pharmacokinetic").  
**Status:** OPEN

---

### ASSUMPTION-014: risk_grade Enum Are Placeholder Values

**What I assumed:** `drug_interactions.risk_grade` uses four placeholder values: `grade_1_minimal`, `grade_2_moderate`, `grade_3_severe`, `grade_4_contraindicated`.  
**Why:** These are approximate placeholders inspired by common interaction grading scales. No formal grading system was provided.  
**Who must validate:** Dr. Mohamed (Pharmacovigilance Lead)  
**Schema impact if wrong:** These are PLACEHOLDERS. Dr. Mohamed must validate or replace the entire enum before the pharmacovigilance pipeline is finalized. Incorrect risk grading directly impacts patient safety.  
**Status:** OPEN

---

### ASSUMPTION-015: evidence_level Enum Scope

**What I assumed:** `drug_interactions.evidence_level` uses three values: `established`, `theoretical`, `case_report`.  
**Why:** These represent a simplified evidence hierarchy common in clinical pharmacology references.  
**Who must validate:** Dr. Mohamed (Pharmacovigilance Lead)  
**Schema impact if wrong:** If Dr. Mohamed uses a more granular system (e.g. adding `review_article`, `in_vitro`, `animal_study`), the ENUM must be extended. The current three-level system may oversimplify evidence classification for regulatory submissions.  
**Status:** OPEN

---

### ASSUMPTION-016: clinical_consequence Is Free-Text

**What I assumed:** `drug_interactions.clinical_consequence` is a TEXT field storing a free-text description of the clinical outcome (e.g. "Increased risk of bleeding", "Reduced anticoagulant effect").  
**Why:** Clinical consequences are nuanced and difficult to standardize without a comprehensive ontology.  
**Who must validate:** Dr. Mohamed (Pharmacovigilance Lead)  
**Schema impact if wrong:** If Dr. Mohamed needs structured severity, onset, and reversibility data, this single TEXT field must be decomposed into multiple columns (e.g. `severity`, `onset_timeframe`, `reversibility`, `management_action`). This is a significant schema change.  
**Status:** OPEN

---

### ASSUMPTION-017: team_members.role Enum Completeness

**What I assumed:** `team_members.role` is an ENUM with exactly 6 values matching the current project team roles.  
**Why:** The project team was defined with specific roles. No future roles were discussed.  
**Who must validate:** Project Lead / All Team Members  
**Schema impact if wrong:** If new roles are added (e.g. "data_analyst", "regulatory_consultant"), the ENUM must be extended via `ALTER TYPE ... ADD VALUE` migration. This is a non-destructive change in PostgreSQL but requires a migration script.  
**Status:** OPEN

---

### ASSUMPTION-018: RLS Uses team_members Table Lookup

**What I assumed:** Row-Level Security (RLS) policies use the `team_members` table (joined via `auth.uid()`) to determine a user's role for access control.  
**Why:** Supabase free tier does not support JWT custom claims (requires Auth Hooks, a paid feature). The `team_members` table lookup is the only viable RLS strategy on the free tier.  
**Who must validate:** Project Lead (architecture decision)  
**Schema impact if wrong:** If the project upgrades to a paid Supabase plan, JWT custom claims would be more performant (avoids a subquery on every RLS check). However, the team_members approach is functionally correct and does not block development.  
**Status:** OPEN

---

### ASSUMPTION-019: Soft Delete on drug_master

**What I assumed:** `drug_master` uses a `deleted_at` nullable timestamp for soft deletion. Records are never physically deleted. All queries must include `WHERE deleted_at IS NULL` by default.  
**Why:** Drug records are referenced by `drug_interactions` and `purity_classification` foreign keys. Physical deletion would break referential integrity or require cascading deletes.  
**Who must validate:** Project Lead (architecture decision), Dr. Mohamed (Regulatory Affairs)  
**Schema impact if wrong:** If Dr. Mohamed requires physical deletion for regulatory reasons (e.g. removing a recalled drug entirely), the foreign key strategy must change to CASCADE or the referencing tables must also implement soft delete. The current approach increases query complexity (every query must filter deleted records) but preserves data integrity.  
**Status:** OPEN

---

### ASSUMPTION-020: Self-Interaction CHECK Constraint

**What I assumed:** `drug_interactions` includes a CHECK constraint: `drug_a_id != drug_b_id`, preventing a drug from having an interaction record with itself.  
**Why:** Standard drug interaction databases do not include self-interactions. Overdose scenarios are handled by dosage/poisoning modules, not interaction records.  
**Who must validate:** Dr. Mohamed (Pharmacovigilance Lead)  
**Schema impact if wrong:** If Dr. Mohamed needs self-interaction records (e.g. for overdose or cumulative toxicity modeling), the CHECK constraint must be removed. This is a simple migration (`ALTER TABLE ... DROP CONSTRAINT`) but changes the data model semantics.  
**Status:** OPEN

---

## Summary

| Status    | Count | Percentage |
|-----------|-------|------------|
| OPEN      | 20    | 100%       |
| VALIDATED | 0     | 0%         |
| OVERRIDE  | 0     | 0%         |

**Next Step:** Schedule validation sessions with each domain specialist:
- **Eman (QC Lead):** ASSUMPTION-001 through 005
- **Fatma (Clinical Pharmacist):** ASSUMPTION-006, 008, 009, 010, 011, 012
- **Dr. Mohamed (Pharmacovigilance/Regulatory):** ASSUMPTION-007, 013, 014, 015, 016, 019, 020
- **Project Lead (Architecture):** ASSUMPTION-017, 018

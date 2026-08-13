# Omar Review — `pharma_data` module

**Reviewer:** Omar-Reviewer sub-agent
**Review type:** read-only technical review (no pytest executed, no business scripts run)
**Reviewed tree:** `C:\Users\engAh\AppData\Local\Temp\opencode\extract\omar_zip\pharma_data\`

Verification performed: byte-level CSV inspection, encoding/delimiter/row checks, `python -m py_compile` on copies in temp dir, import + smoke-test of the three modules against the real CSV (read-only), docx XML text extraction, name-set diffing against Mohamed's `pharmacy_reference_data.json` and Fajr's `iot_example_normal.json`.

---

## 1. File inventory

| Path (relative to `pharma_data\`) | Type | Size (bytes) | Notes |
|---|---|---|---|
| `drug_classification.py` | Python | 256 lines | CSV loader + dataclasses (`Drug`, `StorageRequirements`, `DrugProfile`) |
| `interaction_check.py` | Python | 306 lines | Product-pair interaction lookups |
| `inventory_rules.py` | Python | 98 lines | Reorder + storage-environment rules |
| `test_interaction_check.py` | Python | 41 lines | 4 pytest cases |
| `test_inventory_rules.py` | Python | 66 lines | 6 pytest cases |
| `Egyptian_OTC_Drugs_With_Tolerances_V4(1) (1).csv` | CSV | 3878 | 10 cols, 49 data rows, UTF-8 BOM |
| `Egyptian_OTC_Drugs_With_Tolerances_V4_1_.csv` | CSV | 3878 | 10 cols, 49 data rows, UTF-8 BOM — **byte-identical to the file above** (sha256 `a7b63e0584c8826975253e0489dc6defc1452a22113691e1e48b24de78036f61` for both) |
| `Smart Eco-Pharma Hub (1.Fatma).csv` | CSV | 3148 | 8 cols, 42 data rows, UTF-8 **no BOM** (sha256 `0ef7e1b20b83d0f88a723a22bf88e02ca06fc5578625a0e271c6aebdafc0965d`) |
| `Drug interaction risk scale.docx` | DOCX | 349,760 (`word/document.xml`) | Source reference guide (see §5) |
| `__pycache__\*.pyc` | Artifact | — | cpython-312 bytecode (system Python here is 3.14.2 — harmless, regenerated on import) |
| `.pytest_cache\` | Artifact | — | nodeids for 10 tests; **no `lastfailed` file present** |

---

## 2. Per-file review

| File | Verdict | Notes |
|---|---|---|
| `drug_classification.py` | **OK with warnings** | Compiles cleanly (py_compile on copy). Loads all 49 rows with `utf-8-sig` (handles the BOM). Required-field guard works. **Warnings:** (a) `DRUGS = load_drugs()` executes CSV load at import time — import hard-fails if the CSV is absent; (b) if pointed at Fatma's 8-column CSV it raises `ValueError: CSV file is missing required columns: humidity_tolerance, temp_tolerance`; (c) the module never reads Fatma's CSV because `CSV_FILENAME_CANDIDATES` only lists the two identical V4 files — harmless today, but fragile if the Fatma file is ever the only CSV in a deployment. |
| `interaction_check.py` | **OK with warnings** | Compiles cleanly. 54 `DrugInteraction` entries; 54 unique `frozenset` lookup keys — no duplicate/overwritten pairs. Severity tiers `MAJOR`/`MODERATE`/`MINOR` present. Aliases successfully bridge lookups using CSV spellings (`Catafast 50mg Sac`, `Voltaren Emulgel 100g`). **Warnings:** (a) **4 MINOR interactions in the reference docx are NOT transcribed** (see §3, must-fix #1); (b) internal product-name drift `VoltarenEmulgel 100g` (no space) vs CSV/docx/Mohamed `Voltaren Emulgel 100g`, and `Catafast 50mg Sachet` vs CSV `Catafast 50mg Sac` — masked by `_ALIASES` at lookup time, but returned `product_a/product_b` strings do not equal `drug_classification` names; (c) `_NO_SIGNIFICANT_INTERACTION_PRODUCTS` is advisory-only (lookup runs first) — fine, but several members (Telfast, Zyrtec, Gaviscon, Maalox, Voltaren Emulgel) do have documented interactions, so it must never be used to short-circuit before the lookup. |
| `inventory_rules.py` | **OK with warnings** | Compiles cleanly; imports resolve. Boundary logic matches tests (`current_stock < min_stock_threshold` triggers reorder; tolerance comparison is strict `>`). **Warning:** imports the private `_find_drug` from `drug_classification` — works, but couples to a private API. |
| `test_interaction_check.py` | **OK** | Compiles. All referenced products/pairs exist in the module; asserted severity/order verified against data. |
| `test_inventory_rules.py` | **OK** | Compiles. Expected values match the CSV exactly: `Panadol Advance 500mg` → `B1-ZN2-SH1-BN1`, 22 °C, 45 %, tol 2 / 5; `Insulin Mixtard 30/70 Penfill` → `B1-ZN1-SH1-BN3`, 4 °C, 60 %, tol 3 / 5; reorder threshold 20 / reorder qty 100. Boundary cases (23.9 vs 24.1 °C; 5.5 vs 7.1 °C) consistent with strict `>`. |
| `Egyptian_OTC_Drugs_With_Tolerances_V4(1) (1).csv` | **OK** | UTF-8 with BOM, CRLF, comma delimiter, header of exactly 10 fields: `drug_name, category, dosage_forms, min_stock_threshold, reorder_quantity, storage_location_id, target_temperature, temp_tolerance, target_humidity, humidity_tolerance`. 49 data rows, all 10 fields populated, 0 rows with mismatched field counts, 0 non-numeric thresholds, 49 unique `drug_name`, 49 unique `storage_location_id` bins (no shared bins). |
| `Egyptian_OTC_Drugs_With_Tolerances_V4_1_.csv` | **OK** | **Byte-identical** to the file above (same sha256). Redundant duplicate — see §3 must-fix #3/#4. |
| `Smart Eco-Pharma Hub (1.Fatma).csv` | **OK with warnings** | Valid CSV (UTF-8, no BOM, CRLF, comma, 8 fields, 42 well-formed rows). **However it is a different schema/variant:** headers are `drug_name, category, dosage_forms, min_stock_threshold, reorder_quantity, storage_location_id, target_temperature, target_humidity` (no `temp_tolerance`, `humidity_tolerance`) and it is missing 7 drugs present in the V4 CSV: `Night & Day`, `Tusskan Syrup`, `Paracetamol 500mg`, `Amoxicillin 500mg`, `Metformin 500mg`, `Amlodipine 5mg`, `Omeprazole 20mg`. For the 42 drugs in common, all 8 shared columns are **identical** to the V4 CSV (0 field diffs). Would fail `load_drugs()` with the ValueError quoted above. |
| `Drug interaction risk scale.docx` | **OK** | Valid DOCX; text extracted cleanly (see §5). |
| `__pycache__`, `.pytest_cache` | **OK** | Build/test artifacts only. Nodeids list 10 tests; absence of a `lastfailed` file is consistent with a passing run, but I did **not** execute pytest, so pass/fail is not independently verified. |

---

## 3. Errors that must be fixed

1. **Missing 4 MINOR interactions in `interaction_check.py`.** The reference docx (§3.3) and Mohamed's JSON (`INT-MIN-04` … `INT-MIN-07`) document these; Omar's module only transcribes the `Alphintern/Ambezim-G` group and the `C-Retard/Vitacid + Controloc` group (16 of 20 minor pairs). Not present in the code:
   - `Duphalac Syrup` (Lactulose) + other oral medicines → docx 3.3 / JSON `INT-MIN-04`
   - `Oplex Syrup` + `Prospan Syrup` (expectorant redundancy) → docx 3.3 / JSON `INT-MIN-05`
   - `Zyrtec 10mg` / `Telfast 120mg` + `Motilium 10mg` → docx 3.3 / JSON `INT-MIN-06`
   - `Betadine Antiseptic Solution` (iodine) thyroid-test note → docx 3.3 / JSON `INT-MIN-07`
   Grep confirms `Duphalac`, `Prospan`, `Oplex`, `Betadine` each appear only inside `_NO_SIGNIFICANT_INTERACTION_PRODUCTS`, never as interaction partners.
2. **Product-name drift between Omar's own modules.** `interaction_check.py` uses `Catafast 50mg Sachet` and `VoltarenEmulgel 100g`; the CSV (and docx §2 and Mohamed's catalog) use `Catafast 50mg Sac` and `Voltaren Emulgel 100g`. `_ALIASES` currently masks this for lookups, but any consumer joining `drug_name` (from `drug_classification`) to `product_a/product_b` (from `interaction_check`) will get mismatched strings. Pick one canonical name and keep the alias as a fallback.
3. **Three CSV files with two different schemas.** The two V4 files are byte-identical duplicates; the Fatma file is an older 8-column / 42-row variant. Keep exactly one canonical master (the 10-column, 49-row V4 file), delete the duplicate, and either upgrade Fatma's file to the same 10 columns or mark it deprecated. A module that resolves the CSV via `_resolve_csv_path()` falls back to `glob("*.csv")` — with all three present it never uses Fatma's, but with Fatma's alone present it breaks.
4. **Redundant data / awkward filename.** Two identical CSVs and a filename containing `(1)` and parentheses (`Egyptian_OTC_Drugs_With_Tolerances_V4(1) (1).csv`) invite confusion on cross-platform pipelines. Consolidate.
5. **No shared product identifier across the system.** Omar's CSV has no `id` column; Mohamed's catalog is keyed `P01`–`P42`; Fajr's IoT payload has no drug reference at all (only `device_id` + `storage_location_id`). Everything currently joins on exact display-name strings, which is exactly why #2 is dangerous. Introduce a stable product id (or enforce one canonical `drug_name` string) as the join key.

---

## 4. Compatibility notes vs Mohamed's JSON and Fajr's IoT payload

### 4.1 vs `pharmacy_reference_data.json` (Mohamed)

| Aspect | Omar `pharma_data` | Mohamed JSON | Aligned? |
|---|---|---|---|
| Product name field | `drug_name` (CSV / `Drug.drug_name`) | `name` (catalog) | Field name differs; values align for 41/42 products |
| Product id | none | `id` (`P01`–`P42`) | **No shared key** |
| Product identity | display string | `name` + `active_ingredients` + `therapeutic_class` | `Catafast 50mg Sac` (Omar) vs `Catafast 50mg Sachet` (Mohamed) — the **only** common-product name mismatch |
| Products present only in Omar's CSV | `Night & Day`, `Tusskan Syrup`, `Paracetamol 500mg`, `Amoxicillin 500mg`, `Metformin 500mg`, `Amlodipine 5mg`, `Omeprazole 20mg` | absent | Omar's inventory is a superset by 7 drugs |
| Interaction granularity | product-name pairs (`product_a`, `product_b`) | active-ingredient pairs (`ingredient_a`, `ingredient_b_group`) | Structurally different; same underlying docx. Reconciliation needed if Mohamed's MCP stubs are to return Omar's pairs |
| Severity tiers | `MAJOR` / `MODERATE` / `MINOR` | `MAJOR` / `MODERATE` / `MINOR` / `NONE_KNOWN` | Common subset matches |
| Mechanism / recommendation text | close paraphrase of docx | close paraphrase of docx | Largely consistent |
| Interaction completeness | 15 MAJOR + 23 MODERATE + 16 MINOR pairs (=54) | 5 MAJOR + 8 MODERATE + 7 MINOR entries | Omar omits the 4 MINOR entries listed in §3 |
| Classification vocabulary | `category` e.g. `Analgesic`, `Anti_inflammatory`, `Anticold` | `therapeutic_class` e.g. `NSAID`, `Analgesic / Antipyretic`, `Cold / flu combination` | **Different vocab** — e.g. Omar `Analgesic` vs Mohamed `NSAID` for the same drug. No conflicts in storage/stock data (Mohamed has none). |

### 4.2 vs `iot\iot_example_normal.json` (Fajr)

| Aspect | Omar `pharma_data` | Fajr IoT payload | Aligned? |
|---|---|---|---|
| Temperature | `target_temperature` (°C), `temp_tolerance` (°C) | `sensor_payload.temperature_celsius` | **Units align (°C)** — `flag_environment_violation(drug, temp, hum)` can consume `temperature_celsius` directly |
| Humidity | `target_humidity` (%), `humidity_tolerance` (%) | `sensor_payload.humidity_percent` | **Units align (%)** — maps directly |
| Location key | `storage_location_id` like `B1-ZN2-SH1-BN1` (building-zone-shelf-bin) | `storage_location_id` like `SHELF-A3-B2` | **Different location-ID scheme in the example** — no value from Fajr's sample matches any CSV bin; must be reconciled (or the sample is illustrative only) |
| Drug reference | `drug_name` | none (payload is per `storage_location_id` only) | **Missing** — drug must be resolved bin→drug via the CSV |
| Environment alert | `flag_environment_violation(...) -> bool` | `alert_flags.temperature_out_of_range`, `alert_flags.humidity_out_of_range` | Semantically equivalent; different names. Can be computed from Omar's rules |
| Reorder | `check_reorder_needed(drug_name, current_stock) -> (needs_reorder, reorder_quantity)`, thresholds `min_stock_threshold` / `reorder_quantity` | `sensor_payload.inventory_trigger` (bool), `alert_flags.inventory_threshold_breached` (bool) | **Partial.** Field names differ and the payload carries **no `current_stock` count**, so the reorder decision must be fed a stock level from the inventory side, or the IoT `inventory_trigger` must be defined as the computed result |
| Identifiers / timestamps | none | `reading_id`, `device_id`, `sequence_number`, `timestamp_utc`, `schema_version` | Device-domain fields with no Omar counterpart — no conflict, but there is no cross-domain join key today |

**Overall:** structurally compatible at the sensor level (temperature/humidity units match Omar's target/tolerance model), but **not yet interoperable**: (1) Fajr's `storage_location_id` scheme differs from Omar's bins, (2) the payload has no drug identifier, and (3) the inventory-trigger semantics are named differently and lack the stock input Omar's rule requires. Reconciliation is required before IoT readings can drive `flag_environment_violation`/`check_reorder_needed`.

---

## 5. `Drug interaction risk scale.docx` — summary

The document is titled **"DRUG INTERACTION REFERENCE GUIDE — Smart Eco-Pharma Hub – Inventory Cross-Reference"** (the source for both Mohamed's JSON and Omar's module). Extracted structure:

1. **Severity classification** — three tiers: `MAJOR / SEVERE`, `MODERATE`, `MINOR`, each with a one-line clinical definition.
2. **Inventory Reference – Active Ingredients** — 42 products with `Product Name | Active Ingredient(s) | Therapeutic Class` (e.g. `Catafast 50mg Sachet | Diclofenac potassium 50 mg | NSAID`). Product names here match Mohamed's catalog (including `Catafast 50mg Sachet` and `Voltaren Emulgel 100g`).
3. **Interactions by severity:**
   - **3.1 Major (5 entries):** Adolor+Clexane; Adolor+any NSAID (Catafast, Brufen, Cataflam, Ketofan, Voltaren Emulgel); oral NSAIDs+Clexane; Motilium+Daktarin Oral Gel; 123 Cold & Flu+sedating-antihistamine products (Oplex, Congestal, Flurest, Virogrip Drops).
   - **3.2 Moderate (8 entries):** Flagyl+Clexane; oral NSAIDs (incl. Adolor)+Insulin Mixtard; Streptoquin+NSAIDs; Motilium+anticholinergic antispasmodics (Visceralgine, Spasmo-Digestin, Streptoquin); Controloc/Gaviscon/Maalox+Daktarin; Gaviscon/Maalox+Telfast/Zyrtec; 123 Cold & Flu+Motilium; Kenacomb/Polyderm (topical corticosteroid)+Insulin.
   - **3.3 Minor (7 entries):** Alphintern/Ambezim-G+Clexane/NSAIDs; C-Retard/Vitacid (Vit C)+Controloc; Vitacid (Calcium)+Controloc; **Duphalac+other oral meds**; **Oplex+Prospan**; **Zyrtec/Telfast+Motilium**; **Betadine (iodine) thyroid-test note** — the last four are **not** in `interaction_check.py`.
4. **Products With Minimal or No Significant Interaction Potential** — topical/local, herbal, locally-acting GI, vitamins, other (17 items listed; matches `_NO_SIGNIFICANT_INTERACTION_PRODUCTS` minus `Kenacomb Cream`/`Polyderm Cream`, which the docx lists only with a "routine use" caveat while they also carry a documented Insulin interaction).

---

## 6. Overall verdict

The module is **functionally sound and well-structured**: all files compile, the CSV loads cleanly, all 54 transcribed interaction pairs are internally consistent with no duplicate/overwritten lookups, and the test expectations match the data exactly. It does **not** yet match the reference document and Mohamed's JSON in full (4 MINOR interactions missing), and it needs **name/schema/identifier reconciliation** across the three CSVs and against both Mohamed's ingredient-keyed JSON and Fajr's location-keyed IoT payload before it can be wired end-to-end.

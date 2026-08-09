# Archive Review — Mohamed Ahmed's Interaction-Risk Package

**Reviewer:** Sub-Agent D (Archive-Reviewer) · READ-ONLY review + this file only
**Source:** `extracted_Mohamed_Ahmed_folder\` (7 files)
**Against:** `smart_eco_pharma\schema\migration.sql`, `services\pv_service.py`, `models\interaction.py`, `mcp_server\server.py` (+ services/repositories/tests)

---

## 1. Inventory of the 7 files

| File | Purpose (one line) |
|---|---|
| `START_HERE.md` | Plain-language entry point: what the package is + 5-step action plan (model decision → run harness → Ahmed wires live inventory → pharmacist reviews reference data → pilot), and flags GPT-4o retirement as "the one thing to raise this week." |
| `system_prompt.txt` | The "Interaction Risk Reasoning Engine" system prompt: defines `lookup_product` / `get_known_interaction` tools, the 4-step reasoning process, the MAJOR/MODERATE/MINOR/NONE_KNOWN scale, escalation & safety rules, JSON-only output. |
| `output_schema.json` | JSON Schema for OpenAI **Structured Outputs** (`strict: true`): `query_type`, `products_input`, `resolved_ingredients[]`, `interactions[]` (`product_pair`, `ingredient_pair`, `severity`, `source`, `confidence`, `mechanism`, `recommendation`), `highest_severity`, `escalate_to_pharmacist`, `urgent_flag`, `unresolved_products`, `disclaimer`. |
| `Interaction_Risk_Prompt_Templates.md` | The design doc: fit with Ahmed's MCP layer, rationale (grounding-over-memory, decomposition, inferred/verified split), the schema, 3 request templates with worked examples, testing/validation plan, implementation notes. |
| `pharmacy_reference_data.json` | Digitized reference guide: 42-product `catalog` (id P01–P42, `active_ingredients[]`, `therapeutic_class`), 20 `known_interactions` (5 INT-MAJ / 8 INT-MOD / 7 INT-MIN) with `mechanism`/`recommendation`, and `low_interaction_products` groupings. Doubles as the data contract for the MCP tools. |
| `interaction_test_set.json` | 25 ground-truth test cases: 5 documented_major, 7 documented_moderate, 4 documented_minor, 4 negative_control, 5 edge_case (decomposition, inferred fallback, basket aggregation, same-product guard, unresolved product). |
| `test_harness.py` | CLI runner that stubs the two MCP tools from `pharmacy_reference_data.json`, calls a live model (`--dry-run` uses an oracle), and grades severity/source/escalation/schema against the test set. Default model: `gpt-4o-2024-08-06`. |

---

## 2. What Mohamed intended Ahmed to do

`START_HERE.md` table of responsibilities:

1. **Decide the model** (GPT-4o vs a current one — GPT-4o is being retired) — *"You + Ahmed."*
2. **Run `test_harness.py` with a real OpenAI account** and confirm 25/25 against a live model — anyone with CLI comfort.
3. **Ahmed connects the AI to the real, live pharmacy inventory** (not the snapshot) — i.e., build/point the `lookup_product` + `get_known_interaction` tools at the live DB.
4. **A pharmacist reviews `pharmacy_reference_data.json`** before it's trusted (a few entries were restructured for machine-readability).
5. **Small pilot** (few staff, few products).

Mohamed's implicit deliverables for Ahmed: adopt `system_prompt.txt` + `output_schema.json` into the pharmacovigilance service, stand up the two name/ingredient-based MCP tools, seed the reference data into the DB, and settle the model decision.

---

## 3. How it maps into the project (module/epic + files to touch)

**Epic/feature:** Pharmacovigilance → **Interaction Risk** (GPT-4o prompt integration + MCP retrieval tools). This is the deliverable whose DB contract was stubbed as placeholder enums in `schema/migration.sql` (`risk_grade_type`, `evidence_level_type`) and whose schema contract (`schema/schema_contract.md` lines 128/218) explicitly says the grades are **PLACEHOLDER values Dr. Mohamed must validate** — this archive is that validation.

| Existing file | What changes |
|---|---|
| `smart_eco_pharma/services/pv_service.py` | Replace `PV_SYSTEM_PROMPT` with `system_prompt.txt`; switch `response_format={"type":"json_object"}` (line 135) → Structured Outputs using `output_schema.json`; update model id; parse/map new fields (`severity`, `source`, `confidence`, `mechanism`, `recommendation`, `highest_severity`, `escalate_to_pharmacist`, `unresolved_products`). |
| `smart_eco_pharma/models/interaction.py` | `RiskGrade` enum (lines 10–14) must change or be remapped to MAJOR/MODERATE/MINOR/NONE_KNOWN; add `source` + `confidence` to `InteractionBase`/`Detail`. |
| `smart_eco_pharma/models/pharmacovigilance.py` | `PVAnalysisResponse` fields (`risk_grade`, `evidence_level`) need the new vocabulary; optionally carry `escalate_to_pharmacist`. |
| `smart_eco_pharma/schema/migration.sql` | `risk_grade_type` (lines 38–43) + `evidence_level_type` (45–49) enums; add `confidence`; make `clinical_consequence` nullable or synthesize; consider how `NONE_KNOWN` and rule groups are stored. |
| `smart_eco_pharma/mcp_server/server.py` | Add `lookup_product` + `get_known_interaction` (see §4.5). Existing tools `check_drug_interactions` / `get_risk_grade` stay for the API but don't satisfy the archive's tool contract. |
| `smart_eco_pharma/mcp_server/tools/interaction_tools.py` (+ `inventory_tools.py`) | Home of the new tools; ingredient/name-based, rule-group aware. |
| `smart_eco_pharma/services/interaction_service.py` | `_RISK_SORT_ORDER` (lines 16–21) keyed on old enum values — must be remapped. |
| `smart_eco_pharma/repositories/interaction_repository.py` | `create_interaction` mapping; `check_pairs` assumes FK pairs — group-rule matching needs a different query (or expansion at seed time). |
| `smart_eco_pharma/tests/test_pv_pipeline.py` / `test_interactions.py` | Assert old `RiskGrade.grade_3_severe` etc. (lines 67, 102, 122, 164, 196 / 33, 56) — must be updated. |
| `smart_eco_pharma/config.py` | `GPT_MODEL = "openai/gpt-4o"` (line 36) — the model decision lands here. |
| New: seed script | Catalog (42) → `drug_master`; interactions (20) → `drug_interactions` (with group expansion or a new rule table). |
| Optionally port | `interaction_test_set.json` + `test_harness.py` into the repo (e.g. `tests/` or `scripts/`) as the interaction-prompt regression suite. |

---

## 4. Compatibility / conflict matrix vs existing schema + backend

| # | Archive spec | Existing project | Verdict / impact |
|---|---|---|---|
| 4.1 | Severity scale `MAJOR / MODERATE / MINOR / NONE_KNOWN` | Enum `risk_grade_type`: `grade_1_minimal` … `grade_4_contraindicated`; `risk_grade` NOT NULL DEFAULT `grade_1_minimal` | **CONFLICT.** 3 of 4 tiers map roughly (MAJOR→grade_3/4, MODERATE→grade_2, MINOR→grade_1), but **`NONE_KNOWN` has no representable value** and a "not found" finding can't satisfy NOT NULL. Enums are referenced in 6 places (models, service sort order, prompt, schema_contract, assumption_log, tests). Decision needed: extend enum (Postgres `ALTER TYPE ... ADD VALUE` + new migration) vs a parallel severity column vs mapping layer at write time. |
| 4.2 | `source` ∈ {verified_reference, inferred_pharmacology} + `confidence` ∈ {high, medium, low} | `evidence_level_type` enum {established, theoretical, case_report}; no `confidence` column; `source_reference` TEXT (unused, nullable) | **CONFLICT (semantic mismatch).** Archive `source` = provenance of the finding (from the guide vs inferred by class analogy); existing `evidence_level` = evidentiary basis. Not the same axis — can't map 1:1. Needs a new `confidence` column and either a `source` column or reuse `source_reference`. `inferred_pharmacology` findings are explicitly *not* established evidence. |
| 4.3 | `mechanism` + `recommendation` per finding (no `clinical_consequence`) | `clinical_consequence` TEXT **NOT NULL** (required, and `pv_service` writes it from a required prompt key) | **PARTIAL CONFLICT.** `mechanism`/`management_recommendation` columns exist and line up. But `clinical_consequence` is NOT NULL and the archive never emits it — `pv_service.py`'s `parsed["clinical_consequence"]` will KeyError. Make it nullable, drop it, or synthesize from mechanism. |
| 4.4 | `interaction_type` field not used anywhere | `drug_interactions.interaction_type` TEXT (nullable, never set by pv_service) | **COMPATIBLE (dead field).** Leave as-is / default null; could be populated later by classifying mechanism. No conflict, just unused. |
| 4.5 | MCP tools `lookup_product(query: string)` → {product_name, active_ingredients[], therapeutic_class}; `get_known_interaction(ing_a, ing_b)` → {severity, mechanism, recommendation, matched_rule} | Tools: `lookup_drug_inventory`, `check_drug_interactions` (UUID array), `get_risk_grade` (UUID pair), `get_iot_sensor_status` | **CONFLICT — tools don't exist.** Closest analogues are UUID-based and return different shapes. Archive tools are **name/ingredient-string** based, return `matched_rule` (INT-MAJ-01 etc. — no DB counterpart), and must match **ingredient groups** (`ingredient_b_group` arrays), which the FK `drug_a_id`/`drug_b_id` single-pair schema can't express. Ahmed must add 2 tools (or reshape) and the data model must support group rules. |
| 4.6 | `test_harness.py` default model `"gpt-4o-2024-08-06"`, official `OpenAI()` client (reads `OPENAI_API_KEY`) | Project uses **OpenRouter**: `AsyncOpenAI(base_url=openrouter.ai/api/v1, OPENROUTER_API_KEY)`, model `"openai/gpt-4o"` | **CONFLICT.** (a) Model string is an OpenAI dated snapshot, not an OpenRouter id — and GPT-4o is being retired (removed from ChatGPT picker Feb 13 2026, Custom GPTs Apr 3 2026); the dated snapshot may not even exist on OpenRouter. (b) The harness builds a plain `OpenAI()` client → hits api.openai.com, not OpenRouter; requires an `OPENAI_API_KEY` the project doesn't currently possess. (c) `openai` SDK supports both, so the change is small (client init + base_url + model string) but it's a real blocker to just "running it as-is." |
| 4.7 | `output_schema.json` via Structured Outputs `response_format: {"type":"json_schema","json_schema":{...},"strict":true}` | `pv_service.py` uses `response_format={"type":"json_object"}` (line 135) | **CONFLICT (upgrade, not drop-in).** Strict Structured Outputs is the right approach (freeform json_object doesn't guarantee enums/fields), and the schema is already shaped to pass straight into the `json_schema` param. But: (a) must confirm the chosen provider/model supports strict json_schema passthrough — reliable on the official OpenAI API, needs verification on OpenRouter; (b) `pv_service` writes 5 old keys — the new schema's 13 keys break `parsed["risk_grade"]`/`parsed["clinical_consequence"]` lookups. |

---

## 5. Dependencies / blockers

1. **Real OpenAI key (or OpenRouter confirmation).** Harness requires `OPENAI_API_KEY` (errors out otherwise, `test_harness.py:273`). Project only configures `OPENROUTER_API_KEY`. Either provision an OpenAI key for the validation phase, or point the harness at OpenRouter and verify (i) a valid model id and (ii) `response_format json_schema` strict passthrough support.
2. **Model decision (this week, per START_HERE).** GPT-4o (retired) vs GPT-5.x. One-line change in `config.GPT_MODEL` and the harness `--model`, but must be decided before wiring. Current default `openai/gpt-4o` and harness default `gpt-4o-2024-08-06` are both legacy-targeted.
3. **Schema change to `drug_interactions`.** New migration required: severity enum (or mapping), `confidence` column, `source` (or reuse `source_reference`), `clinical_consequence` nullability, `NONE_KNOWN` representation. Touches `risk_grade_type`/`evidence_level_type` which are already documented as placeholders awaiting Dr. Mohamed — this archive is the validation that unblocks them.
4. **MCP tools `lookup_product` + `get_known_interaction` must exist.** Nothing in `server.py`/`tools/` provides the archive's contract. Building them requires the seed data to be queryable by name/ingredient and by ingredient *group* (currently `drug_interactions` is FK-pair only).
5. **Seeding of `pharmacy_reference_data.json`.** 42 products → `drug_master` (note: `active_ingredients` is TEXT NOT NULL, catalog holds arrays — needs serialization; `brand_name`/`drug_class`/`regulatory_status`/`route_of_administration` not all present in catalog). 20 interactions → `drug_interactions`; ingredient-group rules (e.g. `INT-MOD-05` maps one ingredient to a *group* of six) must be expanded into pairs or stored as a rule table. `matched_rule` ids (INT-MAJ-01…) have no column. Only `drug_a_id != drug_b_id` + FK to `drug_master` is enforced.
6. **Pharmacist/clinical review of reference data before production trust** (START_HERE step 4) — entries were restructured for machine-readability; a couple (e.g. `INT-MIN-07`, a lab-test effect; `INT-MIN-01`, "theoretical" bleeding) are flagged as soft evidence.
7. **Low-interaction categories** (needed to represent `NONE_KNOWN` without polluting the DB): 7 topical/local, 3 herbal, 2 locally-acting GI, 3 vitamins/supplements, ~6 "other" — no interaction rows; the prompt's negative-control and same-product-guard logic is what keeps them out of findings.
8. **Test wiring.** `test_pv_pipeline.py`/`test_interactions.py` assert old enum values and will break on the swap. Harness file lives standalone in the extracted folder (needs `pip install openai`); `--dry-run` oracle deliberately fails `TC-EDGE-02` (class inference) — expected behavior, not a bug.

---

## 6. Recommended integration order

1. **Decide the model** (GPT-4o vs GPT-5.x) and the **key path** (OpenAI vs OpenRouter) — unblocks everything below. Decide **how to represent `NONE_KNOWN`/severity** (extend enum vs mapping layer).
2. **Standalone prompt validation (no backend changes):** run `test_harness.py` against a live model from the extracted folder with `--model <chosen>`; iterate on `system_prompt.txt` until 25/25 across 2–3 runs (temperature 0.1–0.2).
3. **Schema migration** (`migration_003_*`): new severity values, `confidence`, `source`, `clinical_consequence` nullability, group-rule storage. Update `models/interaction.py`, `pharmacovigilance.py`, `interaction_service._RISK_SORT_ORDER`.
4. **Seed script:** catalog → `drug_master`; interactions (group-expanded) → `drug_interactions`; then pharmacist/clinical review sign-off.
5. **MCP tools:** add `lookup_product` + `get_known_interaction` (name/ingredient, rule-group aware) in `mcp_server/tools/`; register in `server.py`.
6. **Integrate prompt + schema into `pv_service.py`:** swap prompt, Structured Outputs `response_format`, new field parsing/mapping, new model id; update `create_interaction` mapping.
7. **Update existing tests + port the test set** into the repo; add a seed/DB integration test.
8. **Small pilot** (START_HERE step 5), keying the UI off `escalate_to_pharmacist` / `highest_severity`.

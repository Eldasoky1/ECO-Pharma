# Review — Mohamed's Interaction-Risk Package (ECO PHARMA integration)

Reviewer: Mohamed-Reviewer sub-agent · Read-only analysis · Source package extracted to `C:\Users\engAh\AppData\Local\Temp\opencode\extract\mohamed_zip\`
Docx source: `C:\Users\engAh\AppData\Local\Temp\opencode\extract\mohamed_docx` (binary, unzipped + text-extracted for review)
Date: 2026-08-12

---

## 1. START_HERE.md — Overall intended workflow

`START_HERE.md` (28 lines) describes an **AI drug-interaction risk assessment system** for Smart Eco-Pharma Hub: given two or more medicine names, it returns a structured risk verdict (MAJOR / MODERATE / MINOR / "no known risk") grounded in the pharmacy's own reference guide.

What it claims is already done:
- Reasoning instructions for the AI ✅
- A digitized, searchable copy of the reference guide ✅
- **25 test questions** with known correct answers ✅
- A script that runs the 25 tests automatically and reports pass/fail ✅

The stated next steps (5-step plan, table):

| # | Step | Owner |
|---|---|---|
| 1 | Decide which AI model to use (GPT-4o retirement flag) | User + Ahmed |
| 2 | Run `test_harness.py` with a real OpenAI account; aim for 25/25 | "Whoever's comfortable running a script" |
| 3 | Ahmed connects the AI to the **live** pharmacy inventory (not the snapshot) | Ahmed |
| 4 | Pharmacist reviews `pharmacy_reference_data.json` before clinical use | Pharmacist / clinical lead |
| 5 | Small pilot before full rollout | The team |

**Flag raised in START_HERE**: GPT-4o (the model this was built for) is being retired by OpenAI — decide now whether to keep it or move to a current model; described as "a one-line change in the script."

**File-count check**: START_HERE says "All 6 files are in this folder." The zip actually contains **7** files (the 6 package files + START_HERE.md itself). The design doc's §6 "Package contents" correctly lists 6 (excluding START_HERE). No file is missing relative to the claimed set; the count phrasing is just loose.

---

## 2. system_prompt.txt — Confirmed LLM system prompt

Yes — this is the model system prompt ("Interaction Risk Reasoning Engine for Smart Eco-Pharma Hub"), 39 lines, loaded verbatim by `test_harness.py:46`.

Key instructions/constraints (verbatim snippets, lightly trimmed):

- **ROLE**: "You are the Interaction Risk Reasoning Engine for Smart Eco-Pharma Hub... you never communicate directly with end consumers/patients without a staff member in the loop."
- **TOOLS AVAILABLE TO YOU** (the contract Ahmed's MCP layer must expose):
  - `lookup_product(query: string) -> { product_name, active_ingredients: string[], therapeutic_class } | not_found`
  - `get_known_interaction(ingredient_a: string, ingredient_b: string) -> { severity, mechanism, recommendation, matched_rule } | null`
- **Grounding rule**: "Always call these tools to resolve products and check pairs. Do not answer from memory alone when a tool can verify the fact — memorized general pharmacology is only a fallback for pairs that come back null..."
- **Reasoning process** (4 steps): (1) resolve every product, combination products → each active ingredient separate; unresolvable → `unresolved_products`, do not guess. (2) only compare ingredients from **DIFFERENT** input products (same-product guard). (3) call `get_known_interaction` per pair: found → ground truth, `source = "verified_reference"`, "Never soften, upgrade, or override a documented severity"; null → check class/mechanism analogy → `source = "inferred_pharmacology"`, `confidence = "medium"` (or `"low"` if weaker), mechanism must say it's inferred; no plausible mechanism → `severity = "NONE_KNOWN"` with `confidence` high/medium. (4) baskets: evaluate every cross-product pair, report all findings + single `highest_severity`.
- **SEVERITY SCALE** — exactly 4 tiers (MAJOR / MODERATE / MINOR / NONE_KNOWN), definitions quoted in §8 below.
- **OUTPUT FORMAT**: "Respond with a single JSON object only — no prose outside the JSON — conforming exactly to the schema supplied via response_format (see output_schema.json)."
- **ESCALATION & SAFETY RULES**: `escalate_to_pharmacist = true` whenever severity MAJOR for any finding, OR `source = "inferred_pharmacology"` for the highest-severity finding, OR any unresolved product. No specific doses/timing/workarounds beyond the matched record. `urgent_flag = true` if the query describes symptoms of an active adverse reaction (e.g. unusual bleeding, chest pain, difficulty breathing, irregular heartbeat). Single product / product-vs-itself → empty `interactions` + `highest_severity = "NONE_KNOWN"`.
- **TONE**: "Precise and clinical, never alarmist."

`system_prompt.txt` is byte-identical to the prompt embedded in `Interaction_Risk_Prompt_Templates.md` §2. Internally consistent.

---

## 3. Interaction_Risk_Prompt_Templates.md — Request structure

222-line design doc. User requests come in **three query shapes** (`query_type`), each built as a short natural-language instruction followed by an injected `[Simulated MCP tool results — treat exactly as you would live tool output]` block (in production this block is built by Ahmed's MCP layer instead):

- **Template A — Pairwise**: `Check interaction risk between "{product_A}" and "{product_B}".`
- **Template B — Basket**: `Check interaction risk across this basket of products: ["A", "B", "C"]`
- **Template C — Unlisted product (inferred fallback)**: same pairwise phrasing, but one product isn't in the catalog (e.g. `"Nexium 20mg (Esomeprazole 20mg)"` vs `"Daktarin Oral Gel"`).

Each template shows the simulated tool output lines (`lookup_product(...) -> {...}`, `get_known_interaction(...) -> {...}|null`) and the expected answer (e.g. Template A → `highest_severity: "MAJOR"`, `source: "verified_reference"`; Template C → `MODERATE` + `source: "inferred_pharmacology"`).

The doc also specifies the runtime contract:
- **Temperature 0.1–0.2** ("you want repeatability, not creative variation").
- **Structured Outputs, not freeform JSON mode**: `response_format: {"type": "json_schema", "json_schema": {...}, "strict": true}`.
- **Scoring rubric** (6 criteria): severity accuracy, grounding fidelity, fallback correctness, schema validity, escalation correctness, consistency (run each case 2–3×).
- **CLI**: `python test_harness.py` / `--dry-run` / `--case TC-MAJ-05 --verbose`.

Note: a single-product query (no comparator) is described in the system prompt but **no dedicated template** documents it; the only single-product test case (`TC-EDGE-04`) is typed as `query_type: "basket"`. Minor gap — see Issues.

---

## 4. output_schema.json — Exact expected JSON structure

Wrapper object for OpenAI **Structured Outputs strict mode**: `{ "name": "interaction_assessment", "strict": true, "schema": {...} }` — intended to be passed as `response_format.json_schema`.

Top-level object (`"type": "object"`, `additionalProperties: false`) — **9 top-level properties, all required**:

| Key | Type | Constraints |
|---|---|---|
| `query_type` | string | `enum: ["pairwise", "basket", "single_lookup"]` |
| `products_input` | array of strings | — |
| `resolved_ingredients` | array of objects | item: `product` (string), `active_ingredients` (array of strings), `resolved` (boolean) — all 3 required, `additionalProperties: false` |
| `interactions` | array of objects | item: 7 required fields (below), `additionalProperties: false` |
| `highest_severity` | string | `enum: ["MAJOR", "MODERATE", "MINOR", "NONE_KNOWN"]` |
| `escalate_to_pharmacist` | boolean | required |
| `urgent_flag` | boolean | required |
| `unresolved_products` | array of strings | required |
| `disclaimer` | string | required |

Per-interaction item — **all 7 required**:
- `product_pair`: array, `minItems: 2`, `maxItems: 2`
- `ingredient_pair`: array, `minItems: 2`, `maxItems: 2`
- `severity`: `enum: ["MAJOR", "MODERATE", "MINOR", "NONE_KNOWN"]`
- `source`: `enum: ["verified_reference", "inferred_pharmacology"]`
- `confidence`: `enum: ["high", "medium", "low"]`
- `mechanism`: string
- `recommendation`: string

**Schema gaps to note:**
- `source` has **no value for a "no known interaction" finding**. If the model emits a `NONE_KNOWN` entry inside `interactions` (the enum allows it), it must still set `source` to one of the two enumerated values, neither of which semantically fits. The design clearly intends NONE_KNOWN to appear via `highest_severity` with an empty `interactions` array (this is how the oracle in the harness builds it), but the schema itself doesn't enforce that, and the prompt (step 3) doesn't tell the model what `source`/`confidence` to set for a NONE_KNOWN entry. Worth tightening in the prompt or schema.
- `single_lookup` exists in the `query_type` enum but is never used by any template or test case.

---

## 5. pharmacy_reference_data.json — Structure & cross-ref with Omar's pharma_data

Top-level keys: `metadata`, `catalog`, `known_interactions`, `low_interaction_products`.

- **metadata**: `source_document`, `purpose` (states it "is used by test_harness.py to stub" the tools, i.e. **the initial knowledge source, replaceable by Ahmed's real DB/API**), and `severity_tiers` (MAJOR / MODERATE / MINOR / NONE_KNOWN with verbatim definitions).
- **catalog**: **42 entries** (ids `P01`–`P42`), each `{ id, name, active_ingredients[], therapeutic_class }`. Every docx inventory row (42 products) is present.
  - **17 of 42 entries have 2+ active ingredients** (Alphintern, Ambezim-G, Gaviscon Double Action, Maalox Plus Tablets, Spasmo-Digestin, Streptoquin, Congestal, 123 Cold & Flu, Flurest, Oplex Syrup, Sinupret Forte, Kenacomb Cream, Strepsils Honey & Lemon, Polyderm Cream, Neurovit Tablets, Vitacid Calcium Eff, Virogrip Drops).
  - Naming is standardized for machine use (e.g. Gaviscon's "bicarbonate" → `"Sodium bicarbonate"`; Spasmo-Digestin's "Na dehydrocholate" → `"Sodium dehydrocholate"`).
- **known_interactions**: **20 records** — **5 MAJOR** (`INT-MAJ-01`–`05`), **8 MODERATE** (`INT-MOD-01`–`08`), **7 MINOR** (`INT-MIN-01`–`07`). Shape: `{ id, severity, ingredient_a (or ingredient_a_group), ingredient_b_group[], mechanism, recommendation }`. Records are **ingredient-level with class groups** (e.g. `INT-MAJ-02` Ketorolac vs `["Diclofenac potassium","Ibuprofen","Ketoprofen","Diclofenac diethylamine"]`), and matching is symmetric in the harness.
  - Two records are structurally awkward (see Issues): `INT-MIN-07` puts a non-ingredient string in `ingredient_b_group` (`"*thyroid function tests, on large wounds or prolonged use*"`), and `INT-MIN-04`'s b-group encodes example drugs but its mechanism is a general statement about "other oral medicines."
- **low_interaction_products**: 5 named groups (`topical_or_local`, `herbal_low_potential`, `locally_acting_gi`, `vitamins_supplements`, `other`) — mirrors docx §4.

### Cross-reference vs Omar's `pharma_data` package (`extract\omar_zip\pharma_data\interaction_check.py`)

Omar's module is transcribed from the same docx but is **product-pair expanded, deterministic, and a strict subset**:

1. **Severity enum**: Omar has only `MAJOR / MODERATE / MINOR` (`InteractionSeverity`); there is no `NONE_KNOWN` — "no interaction" is implicit as `None`. Mohamed's schema needs `NONE_KNOWN`; integration needs a mapping layer (None → NONE_KNOWN, or extend the enum).
2. **MINOR coverage differs materially**: Omar encodes only **2 of the 7 docx MINOR categories** — proteolytic-enzyme + NSAIDs/Clexane (= `INT-MIN-01`) and C-Retard/Vitacid + Controloc (= `INT-MIN-02`+`03` merged). **Missing from Omar**: `INT-MIN-04` (lactulose), `INT-MIN-05` (Oplex + Prospan), `INT-MIN-06` (Zyrtec/Telfast + Motilium), `INT-MIN-07` (povidone-iodine / thyroid test). Mohamed's JSON is the superset and should be treated as ground truth.
3. **Product-name divergence**: Omar's canonical name is **`"VoltarenEmulgel 100g"`** (no space) vs Mohamed's **`"Voltaren Emulgel 100g"`**. String matching between the two packages would silently fail for Voltaren. Omar's `_ALIASES` even maps "voltaren emulgel 100g" → the no-space form. Must be reconciled at integration.
4. **Granularity**: Omar is expanded product pairs (explicit cartesian expansion at module load); Mohamed is ingredient pairs with class-group inference. Different models of the same facts — a migration layer is needed, not a drop-in.

---

## 6. interaction_test_set.json — Coverage

**25 test cases** across 5 categories (verified by count):

| Category | Count | IDs |
|---|---|---|
| `documented_major` | 5 | TC-MAJ-01..05 |
| `documented_moderate` | 7 | TC-MOD-01..07 |
| `documented_minor` | 4 | TC-MIN-01..04 |
| `negative_control` | 4 | TC-NEG-01..04 |
| `edge_case` | 5 | TC-EDGE-01..05 |

Per-case fields: `id`, `category`, `query_type`, `products`, plus `expected_severity` / `expected_source` for documented positives, `expected_severity: "NONE_KNOWN"` for negatives, and behavior-specific fields for edge cases (`acceptable_severity_range`, `fail_if_severity_in`, `expected_highest_severity`, `expected_flagged_ingredient_pair`, `expected_interactions_count`, `expected_unresolved_products`, `expected_escalate_to_pharmacist`, `synthetic_products`).

**Coverage vs the 20 documented interactions:**
- MAJOR: **5/5** covered.
- MODERATE: **7/8** covered — **`INT-MOD-08` (topical corticosteroids Kenacomb/Polyderm + insulin) is not tested** (doc acknowledges "representative sample of the 8").
- MINOR: **4/7** covered — **`INT-MIN-03` (calcium + PPI), `INT-MIN-05` (Oplex + Prospan), `INT-MIN-07` (povidone-iodine) not tested** (doc acknowledges "representative sample of the 7").
- Edge cases: decomposition (`TC-MAJ-05`), over-inference guard (`TC-EDGE-01`), inferred fallback for a new SKU (`TC-EDGE-02`, uses a `synthetic_products` entry for Nexium/esomeprazole), basket aggregation (`TC-EDGE-03`), same-product guard (`TC-EDGE-04`, single combo product, expects 0 interactions), unresolved product / no fuzzy guessing (`TC-EDGE-05`, "Congestin 500" vs real "Congestal").

---

## 7. test_harness.py — How it works (read-only; NOT executed)

330 lines, no external deps for `--dry-run` (`openai` SDK imported lazily).

**Pipeline per test case:**
1. `load_assets()` reads the 4 sibling files (`system_prompt.txt`, `output_schema.json`, `pharmacy_reference_data.json`, `interaction_test_set.json`).
2. `build_retrieval_context(case, reference_data)` — **stubs Ahmed's MCP tools locally**: `stub_lookup_product` (exact match on normalized name against catalog + `synthetic_products`) and `stub_get_known_interaction` (symmetric membership check of the ingredient pair against `ingredient_a/ingredient_a_group` × `ingredient_b_group`). It only enumerates pairs from **different** input products (mirrors the prompt's same-product guard).
3. `format_context_block()` emits the `[Simulated MCP tool results...]` block; `build_user_message()` picks the phrasing by `query_type`.
4. `call_model()` sends `messages=[{system}, {user}]` with `temperature=0.1` and `response_format={"type": "json_schema", "json_schema": schema}`; parses `response.choices[0].message.content` as JSON.
5. `grade(case, result)` runs **only the checks whose `expected_*` keys exist in the case** (opt-in checks per case type). Case passes iff all its checks pass.
6. `main()` prints per-case PASS/FAIL, per-category and total tallies; `sys.exit(0 if total_pass == len(test_cases) else 1)`.

**Runtime requirements (as shipped in the package):**
- Env var: **`OPENAI_API_KEY`** (required; errors out otherwise at `test_harness.py:273`). **NOT** `OPENROUTER_API_KEY` — the shipped harness builds a plain `OpenAI()` client with the SDK default base URL, i.e. it hits `api.openai.com`. There is **no OpenRouter support and no base-URL override** in this package.
- Model: `DEFAULT_MODEL = "gpt-4o-2024-08-06"` (`test_harness.py:37`); overridable via `--model`. This is a dated OpenAI snapshot ID — a **legacy model being retired**.
- CLI flags: `--model`, `--limit N`, `--case ID`, `--dry-run`, `--verbose`.

**Scoring:** the 6-criterion rubric from the design doc is implemented only partially in code — the harness grades (a) `highest_severity` exact match (or range/fail-set for edge cases), (b) `source` of the top finding, (c) a specific flagged `ingredient_pair`, (d) `len(interactions)`, (e) `unresolved_products` superset, (f) `escalate_to_pharmacist`. **Mechanism/recommendation fidelity (rubric #2) and run-to-run consistency (rubric #6) are NOT machine-graded** — they require human review.

**`--dry-run`:** injects `build_oracle_result()` — a "perfect passthrough" that only reports `verified_reference` matches. It is designed to **fail `TC-EDGE-02`** (the one case needing class-level inference) — explicitly intended, so a dry-run 24/25 is correct behavior, not a bug.

**Note on the workspace copy:** the live repo copy at `smart_eco_pharma/interaction_risk/test_harness.py` (commit `ae0d1d3`) has already been adapted to OpenRouter — `OPENROUTER_API_KEY`, `OPENROUTER_BASE_URL` (default `https://openrouter.ai/api/v1`), `OPENROUTER_MODEL` override, `client = OpenAI(base_url=..., api_key=...)`. Everything else is byte-identical. So the "one-line change" is already done in the repo; the review here targets the as-shipped package.

---

## 8. Drug interaction risk scale.docx — Risk scale & methodology, cross-checked

Extracted 281 paragraphs / 7 tables from `word/document.xml`. Structure:
- **§1 Severity Classification** — a **three-tier** scale: **MAJOR / SEVERE** ("Poses a serious risk — e.g. life-threatening bleeding, dangerous arrhythmia, organ toxicity, or dangerous CNS/respiratory depression. Avoid the combination; if unavoidable, only under direct medical supervision."), **MODERATE** ("May worsen a condition, reduce the effectiveness of one or both products, or increase the risk of a clinically meaningful side effect. Use with caution: monitor, adjust dose, or space doses apart."), **MINOR** ("Limited clinical significance for most patients. Awareness is generally sufficient and no specific action is usually required."). No numeric scoring — purely descriptive tiers.
- **§2 Inventory Reference** — 42 products: name / active ingredient(s) / therapeutic class.
- **§3 Interactions by severity** — **5 MAJOR** (3.1), **8 MODERATE** (3.2), **7 MINOR** (3.3), each row = interacting products → mechanism & clinical effect → recommendation.
- **§4 Low / no-interaction products** — grouped lists (topical/locally-acting, herbal, locally-acting GI, vitamins, other).
- **⚠️ Missing §5**: the document body **ends at §4**, yet §4 text references "**Section 5**" twice — "systemic NSAID cautions in Section 5 apply..." (Voltaren Emulgel entry) and "aside from **PPI notes in Section 5.3**" (vitamins entry). **No Section 5 exists in the docx.** The content those references describe is instead encoded in the JSON as `INT-MOD-02`/`INT-MOD-08` (NSAID & topical-steroid + insulin) and `INT-MIN-02`/`INT-MIN-03` (PPI / vitamin-C / calcium notes) — so nothing factual is lost in the digitization, but the source doc has a dangling cross-reference.

**Cross-check docx ↔ output_schema.json / system_prompt / pharmacy_reference_data.json:**

| Aspect | docx | schema / prompt / data | Verdict |
|---|---|---|---|
| MAJOR definition | verbatim | verbatim (prompt + `metadata.severity_tiers`) | ✅ Consistent |
| MODERATE / MINOR definitions | verbatim | verbatim | ✅ Consistent |
| Tier label | "MAJOR / SEVERE" | `MAJOR` only | ✅ Equivalent (SEVERE folded into MAJOR); note in data model |
| Tier count | 3 tiers | 4 values — adds `NONE_KNOWN` | ⚠️ Deliberate extension (matches docx §4 concept); prompt/schema/data all agree on the 4th tier's meaning |
| Interaction counts | 5 MAJOR / 8 MODERATE / 7 MINOR = 20 | `INT-MAJ-01..05`, `INT-MOD-01..08`, `INT-MIN-01..07` = 20 | ✅ 1:1 |
| Product count | 42 | 42 (`P01`–`P42`) | ✅ 1:1 |
| Mechanisms/recommendations | row text | copied near-verbatim, lightly standardized | ✅ Faithful |

The risk scale is reflected correctly. The only scale-level mismatch is that the docx presents a 3-tier clinical scale while the schema/prompt operate on 4 values (the 4th, `NONE_KNOWN`, is a well-defined "no meaningful overlap" catch-all consistent with docx §4) — flagging for the record, not a defect.

---

## 9. Errors, missing files, broken references, inconsistencies

**Missing files:** none. All 6 files promised by the design doc + START_HERE.md + the docx source are present and loadable. The docx text extracted cleanly (no read issues).

**Errors / inconsistencies found:**

1. **Key-path blocker (highest priority):** as-shipped `test_harness.py` requires `OPENAI_API_KEY` and calls `api.openai.com`; the project is **OpenRouter-only** (`.env.example`, `config.py`). START_HERE step 2 ("run with a real OpenAI account") cannot be followed as-is. **Already remediated in the repo copy** (commit `ae0d1d3`) — flagged for awareness, not a defect of the design.
2. **Model retirement:** `DEFAULT_MODEL = "gpt-4o-2024-08-06"` is a legacy dated snapshot; GPT-4o removed from ChatGPT picker Feb 13 2026 / Custom GPTs Apr 3 2026 per the design doc. Undecided model choice is the single open decision blocking live validation. (Repo copy still defaults to the same legacy id behind `OPENROUTER_MODEL`.)
3. **`source` enum gap vs `NONE_KNOWN`:** schema `source` enum is `["verified_reference","inferred_pharmacology"]` — no valid value if the model emits a `NONE_KNOWN` interaction entry; the prompt also doesn't instruct which `source`/`confidence` to use for a NONE_KNOWN finding. Works today only because the harness oracle never emits NONE_KNOWN entries.
4. **`single_lookup` enum value unused:** `query_type` allows `"single_lookup"`, but no template documents it and the only single-product test (`TC-EDGE-04`) is typed `"basket"`. Schema/test-set inconsistency.
5. **Docx dangling §5 references:** "Section 5" and "Section 5.3" referenced in docx §4 but no §5 exists in the document. Content is preserved in JSON, but the source doc is internally inconsistent.
6. **`INT-MIN-07` data-model smell:** `ingredient_b_group` contains `"*thyroid function tests, on large wounds or prolonged use*"` — a lab-test effect, not an ingredient. Never matchable by the stub; if this JSON becomes the DB/API contract, this record needs a different shape (or should move to a "lab/advice" section).
7. **`INT-MIN-04` b-group semantics:** mechanism is general ("other oral medicines taken at the same time") but the encoded b-group is a fixed example list `["Pantoprazole","Fexofenadine","Cetirizine","Domperidone"]`. Consequences: (a) it under-encodes the general rule; (b) in the `TC-EDGE-03` basket, the stub returns a MINOR lactulose+domperidone hit even though the test's own note says "Duphalac shouldn't contribute a false positive." The test still passes (it only checks highest_severity + the flagged pair), but the note and the data disagree.
8. **"8 combination products" claim vs data:** `Interaction_Risk_Prompt_Templates.md` says "8 of your 42 products are combination products." The catalog actually has **17 entries with 2+ active ingredients** (or ~14 excluding vitamins/herbal/lozenge multi-constituents). The "8" count doesn't match the shipped data and should be corrected or clarified.
9. **Workspace README says "13 keys":** `03_Interaction_Risk_Module/README.md` describes `output_schema.json` as "13 keys"; the actual schema has **9 top-level properties** (all required). Doc inaccuracy.
10. **START_HERE "All 6 files":** the folder has 7 files (6 package files + START_HERE). Trivial.
11. **Grading coverage gap (documented, but real):** the harness machine-grades only severity/source/pair-count/escalation/unresolved; mechanism/recommendation fidelity (rubric #2) and run-to-run consistency (rubric #6) are human-review only. Design doc acknowledges this.
12. **Untested documented interactions:** `INT-MOD-08`, `INT-MIN-03`, `INT-MIN-05`, `INT-MIN-07` have no test case. Acknowledged in the design doc ("representative sample") — acceptable for validation, but note for full coverage.

**Omar `pharma_data` cross-ref inconsistencies (integration-critical):** (a) Omar has no `NONE_KNOWN` tier; (b) Omar's MINOR set is a strict subset (missing 4 of the 7 docx MINOR categories, incl. the two moderately clinically relevant ones — lactulose and Oplex/Prospan); (c) **`"VoltarenEmulgel 100g"` (Omar) vs `"Voltaren Emulgel 100g"` (Mohamed)** — canonical-name mismatch that would break cross-package matching; (d) Omar is product-pair expanded, Mohamed is ingredient/class-group based — different granularities that need an adapter.

---

## Issues/Mismatches Found (summary)

| # | Issue | Severity | Location |
|---|---|---|---|
| 1 | Harness needs `OPENAI_API_KEY`/OpenAI base URL; project is OpenRouter-only | **Blocker to run as-is** | `test_harness.py:146-148,273` (repo copy already fixed) |
| 2 | Default model `gpt-4o-2024-08-06` is a retired legacy id | **Blocker** (undecided model) | `test_harness.py:37` |
| 3 | `source` enum has no value for `NONE_KNOWN` findings | Medium | `output_schema.json` `interactions.items.source` |
| 4 | `single_lookup` enum unused; single-product test uses `"basket"` | Low | `output_schema.json`, `interaction_test_set.json` `TC-EDGE-04` |
| 5 | Docx references a nonexistent §5 / §5.3 | Low (doc-only) | docx §4 (Voltaren, vitamins rows) |
| 6 | `INT-MIN-07` non-ingredient in `ingredient_b_group` (`"*thyroid function tests...*"`) | Medium (data contract) | `pharmacy_reference_data.json:80` |
| 7 | `INT-MIN-04` general rule encoded as example list; note vs data contradiction in `TC-EDGE-03` | Low/Medium | `pharmacy_reference_data.json:77`, `interaction_test_set.json` `TC-EDGE-03` |
| 8 | "8 combination products" claim ≠ 17 multi-ingredient catalog entries | Low (doc) | `Interaction_Risk_Prompt_Templates.md:82` |
| 9 | README "13 keys" ≠ 9 top-level schema keys | Low (doc) | `03_Interaction_Risk_Module/README.md` |
| 10 | Omar cross-ref: missing `NONE_KNOWN`; MINOR subset; `VoltarenEmulgel` naming | **Integration-critical** | `omar_zip\pharma_data\interaction_check.py` |

## Ready to Integrate As-Is

The package is **internally coherent and faithful to the source docx**:

- System prompt ↔ output schema ↔ reference data ↔ test set agree on: 4-tier severity enum, tool contract (`lookup_product` / `get_known_interaction`), escalation semantics, and the "verified vs inferred" audit split.
- All **20 documented interactions** digitized 1:1 from the docx (5 MAJOR / 8 MODERATE / 7 MINOR); 42/42 products; severity definitions verbatim.
- The 25-case test set is well-designed (5/5 MAJOR covered, negatives + edge cases included, oracle dry-run is honest — correctly fails `TC-EDGE-02`).
- The stub-retrieval design lets prompt validation proceed **without** Ahmed's MCP server; `--dry-run` needs no key or network.
- A workspace copy of the harness is already OpenRouter-adapted (commit `ae0d1d3`), and `pv_service.py` already maps archive severity→`risk_grade` / source→`evidence_level`, so the integration path is proven.

**Not as-is** (see #1–#3, #10): the live-model run requires the model-decision + key-path decision (OpenAI vs OpenRouter, GPT-5.x vs 4o); the `NONE_KNOWN`/`source` mapping needs a decision (extend enum vs mapping layer); and the Voltaren name + Omar MINOR-subset discrepancies must be reconciled before the two packages can share one interaction source. Recommend resolving those, then re-running the 25-case suite against the chosen model for the 2–3× consistency check before pilot.

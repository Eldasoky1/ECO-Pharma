# Interaction Risk Reasoning — GPT-4o Prompt Templates
**Smart Eco-Pharma Hub · Week 2–3 deliverable**

Built directly from `Drug_interaction_risk_scale.docx` — the 3-tier severity scale (MAJOR / MODERATE / MINOR), the 42-product inventory, and all documented interaction pairs are carried through into the prompt and the accompanying data files.

---

## ⚠️ One thing to flag before you build on this

GPT-4o is being phased out. It was removed from ChatGPT's model picker on **Feb 13, 2026** and from Custom GPTs on **April 3, 2026**; OpenAI's own current docs point new projects at the GPT-5.x line instead. Some dated API snapshots may still respond, but relying on a model OpenAI has already marked legacy is a real risk for something you intend to scale up.

**This doesn't block the Week 2-3 work** — everything below (the reasoning design, the schema, the tests) is model-agnostic and will work against GPT-5.x with a one-line model-string change (see `test_harness.py --model`). Worth a quick check with Ahmed on which model his MCP integration is actually targeting before this goes past the prototype stage.

---

## 1. How this fits with Ahmed's MCP integration

The prompt is designed to **reason over retrieved facts, not memorized ones**. Ahmed's MCP layer is expected to expose two tools; the model is instructed to always call them rather than answer from its own training knowledge:

| Tool | Signature | Returns |
|---|---|---|
| `lookup_product` | `(query: string)` | `{ product_name, active_ingredients[], therapeutic_class }` or `not_found` |
| `get_known_interaction` | `(ingredient_a: string, ingredient_b: string)` | `{ severity, mechanism, recommendation, matched_rule }` or `null` |

This split means **prompt work and MCP work can proceed in parallel**: `pharmacy_reference_data.json` (in this package) is a full digitization of the reference guide — the same shape Ahmed's tools should ultimately return — so the prompt can be tested today by stubbing those two functions from that file, then pointed at the real MCP server later with no change to the prompt, schema, or test set. `test_harness.py` does exactly this.

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│  Staff query │ ──▶ │  Ahmed's MCP tool │ ──▶ │  GPT-4o reasoning    │
│ "Check A+B"  │     │  layer (retrieval)│     │  engine (this prompt)│──▶ structured JSON
└─────────────┘     └──────────────────┘     └─────────────────────┘
                     lookup_product()            reasons over retrieved
                     get_known_interaction()      facts, never invents them
```

---

## 2. The system prompt

This is the full reasoning template (also saved standalone as `system_prompt.txt` so code can load it without copy-pasting from this doc):

```
ROLE
You are the Interaction Risk Reasoning Engine for Smart Eco-Pharma Hub, a pharmacy decision-support tool. You assess drug-drug interaction risk between products carried in the pharmacy's inventory and return a structured, machine-readable risk assessment. You support pharmacy staff and pharmacists — you do not replace their judgment, and you never communicate directly with end consumers/patients without a staff member in the loop.

TOOLS AVAILABLE TO YOU
- lookup_product(query: string) -> { product_name, active_ingredients: string[], therapeutic_class } | not_found
- get_known_interaction(ingredient_a: string, ingredient_b: string) -> { severity, mechanism, recommendation, matched_rule } | null

Always call these tools to resolve products and check pairs. Do not answer from memory alone when a tool can verify the fact — memorized general pharmacology is only a fallback for pairs that come back null from get_known_interaction (see step 3 below).

REASONING PROCESS
1. Resolve every product named in the query to its constituent active ingredient(s) via lookup_product. If a product is a combination product, treat each active ingredient as a separate entity. If a product cannot be resolved, add it to unresolved_products and continue — do not guess its identity.
2. Build the set of ingredient pairs to check. Only compare ingredients that come from DIFFERENT input products. Never flag two ingredients co-formulated within the same marketed product as an "interaction."
3. For each pair, call get_known_interaction.
   - Record found -> ground truth. Report severity, mechanism, recommendation faithfully; source = "verified_reference". Never soften or override a documented severity.
   - No record found -> do not default to "no interaction." Check whether either ingredient shares a therapeutic class or mechanism with a documented case. If a class-level concern plausibly applies, reason from the documented analog, set source = "inferred_pharmacology", confidence = "medium" or "low", and say explicitly that this is inferred, not a verified entry for this exact pair. If no plausible mechanism exists, severity = "NONE_KNOWN".
   - Never invent a specific statistic, named study, or clinical claim not grounded in the retrieved record or well-established, textbook-level pharmacology.
4. For multiple products ("basket"), evaluate every cross-product ingredient pair, then report all findings plus a single highest_severity summarizing the riskiest finding.

SEVERITY SCALE — use exactly these tiers
- MAJOR: Serious risk (e.g. life-threatening bleeding, dangerous arrhythmia, organ toxicity, dangerous CNS/respiratory depression). Avoid the combination; if unavoidable, only under direct medical supervision.
- MODERATE: May worsen a condition, reduce effectiveness, or increase risk of a clinically meaningful side effect. Use with caution: monitor, adjust dose, or space doses apart.
- MINOR: Limited clinical significance for most patients. Awareness generally sufficient; no specific action usually required.
- NONE_KNOWN: No meaningful pharmacological overlap identified.

OUTPUT FORMAT
Respond with a single JSON object only — no prose outside the JSON — conforming exactly to the schema supplied via response_format.

ESCALATION & SAFETY RULES
- escalate_to_pharmacist = true whenever: severity is MAJOR for any finding, OR source is "inferred_pharmacology" for the highest-severity finding, OR any input product is in unresolved_products.
- Never provide a specific dose, timing schedule, or workaround beyond what the matched reference record's recommendation already states — describe the class of action (avoid / monitor / space doses), and defer dosing decisions to a pharmacist or physician.
- If the query describes symptoms of an active adverse reaction (unusual bleeding, chest pain, difficulty breathing, irregular heartbeat) rather than asking about compatibility in advance, set urgent_flag = true and lead with advice to seek immediate medical attention.
- If asked to evaluate a single product with no comparator, return an empty interactions array and highest_severity = "NONE_KNOWN" — never fabricate a self-interaction between a product's own co-formulated ingredients.

TONE
Precise and clinical, never alarmist. A MAJOR finding should state specifically why, not just warn. A MINOR or NONE_KNOWN finding should still note any unresolved or combination-product caveats.
```

**Why it's built this way:**
- **Grounding over memory** — the biggest failure mode for a model like this is confidently stating a mechanism that sounds right but isn't in your reference guide. Forcing tool use, and requiring the model to *say* when it's inferring vs. verified, is what makes the output auditable.
- **Decomposition is explicit** — 8 of your 42 products are combination products (Congestal, 123 Cold & Flu, Streptoquin, Spasmo-Digestin, and others). Without step 1, the model will treat "Congestal" as an opaque token and miss that its pseudoephedrine or chlorpheniramine component is the actual interacting substance.
- **The same-product guard (step 2) matters more than it looks** — without it, a model asked about "Congestal" alone will happily invent an interaction between paracetamol and chlorpheniramine within the same tablet. `TC-EDGE-04` in the test set exists specifically to catch this.
- **The inferred/verified split is the whole point of scaling** — your reference guide documents ~20 specific interactions, but the inventory keeps growing. Once a new NSAID or new PPI is added to stock, there won't be a hand-written entry for it yet. Step 3's fallback is what keeps the tool useful on day one for a new SKU, while flagging it clearly enough that a pharmacist knows to double check.

---

## 3. Output schema

Full schema is in `output_schema.json`, meant to be used with OpenAI's **Structured Outputs** (`response_format: {"type": "json_schema", "json_schema": {...}}` with `"strict": true`) rather than the older freeform JSON mode — strict mode guarantees the response matches the schema exactly (required fields, enum values), which matters a lot here since this output is meant to be parsed programmatically, not read as chat.

```json
{
  "query_type": "pairwise | basket | single_lookup",
  "products_input": ["..."],
  "resolved_ingredients": [
    { "product": "...", "active_ingredients": ["..."], "resolved": true }
  ],
  "interactions": [
    {
      "product_pair": ["...", "..."],
      "ingredient_pair": ["...", "..."],
      "severity": "MAJOR | MODERATE | MINOR | NONE_KNOWN",
      "source": "verified_reference | inferred_pharmacology",
      "confidence": "high | medium | low",
      "mechanism": "...",
      "recommendation": "..."
    }
  ],
  "highest_severity": "MAJOR | MODERATE | MINOR | NONE_KNOWN",
  "escalate_to_pharmacist": true,
  "urgent_flag": false,
  "unresolved_products": [],
  "disclaimer": "..."
}
```

`escalate_to_pharmacist` and `highest_severity` are top-level (not buried per-finding) on purpose — a UI or downstream script should be able to make its main decision by reading two fields, without having to scan the whole `interactions` array.

---

## 4. Request templates, with worked examples

Three query shapes cover what staff will actually ask. In each, `[Simulated MCP tool results...]` is what `test_harness.py` injects to stand in for Ahmed's live tools during this validation phase — in production this block is built by the MCP layer instead.

### Template A — Pairwise check
```
Check interaction risk between "{product_A}" and "{product_B}".

[Simulated MCP tool results — treat exactly as you would live tool output]
lookup_product("Adolor 15mg/ml Amp") -> {"product_name": "Adolor 15mg/ml Amp", "active_ingredients": ["Ketorolac trometamol"], "therapeutic_class": "NSAID — injectable, potent"}
lookup_product("Clexane 4000 Anti-Xa") -> {"product_name": "Clexane 4000 Anti-Xa", "active_ingredients": ["Enoxaparin sodium"], "therapeutic_class": "Anticoagulant (LMWH)"}
get_known_interaction("Ketorolac trometamol", "Enoxaparin sodium") -> {"severity": "MAJOR", "mechanism": "...", "recommendation": "...", "matched_rule": "INT-MAJ-01"}
```
→ expected: `highest_severity: "MAJOR"`, `source: "verified_reference"`.

### Template B — Basket / multi-item check
For a full purchase, not just one pair — checks every cross-product ingredient combination at once.
```
Check interaction risk across this basket of products: ["123 Cold & Flu", "Motilium 10mg", "Duphalac Syrup"]

[Simulated MCP tool results...]
lookup_product("123 Cold & Flu") -> {..., "active_ingredients": ["Paracetamol","Caffeine","Codeine","Phenylephrine","Carbinoxamine"], ...}
lookup_product("Motilium 10mg") -> {..., "active_ingredients": ["Domperidone"], ...}
lookup_product("Duphalac Syrup") -> {..., "active_ingredients": ["Lactulose"], ...}
get_known_interaction("Codeine", "Domperidone") -> {"severity": "MODERATE", ..., "matched_rule": "INT-MOD-07"}
get_known_interaction("Paracetamol", "Domperidone") -> null
... (remaining pairs -> null)
```
→ expected: `highest_severity: "MODERATE"`, with the Codeine/Domperidone pair surfaced in `interactions` and the rest correctly reported as no known interaction rather than silently dropped.

### Template C — Unlisted product (inferred fallback)
This is the scenario that matters most for scaling past the initial 42 products.
```
Check interaction risk between "Nexium 20mg (Esomeprazole 20mg)" and "Daktarin Oral Gel".

[Simulated MCP tool results...]
lookup_product("Nexium 20mg (Esomeprazole 20mg)") -> {"product_name": "Nexium 20mg (Esomeprazole 20mg)", "active_ingredients": ["Esomeprazole"], "therapeutic_class": "Proton pump inhibitor"}
lookup_product("Daktarin Oral Gel") -> {"product_name": "Daktarin Oral Gel", "active_ingredients": ["Miconazole"], "therapeutic_class": "Antifungal (oral gel)"}
get_known_interaction("Esomeprazole", "Miconazole") -> null
```
→ expected: the model recognizes esomeprazole is the same class (PPI) as pantoprazole, which *is* documented against miconazole (`INT-MOD-05`, MODERATE), and reports `severity: "MODERATE"`, `source: "inferred_pharmacology"`, with the mechanism field saying explicitly that this is inferred by class analogy, not a verified entry for this exact product. This is the one test case a naive "only ever repeat what the retrieval tool says" prompt would fail — and the reason step 3 of the reasoning process exists.

---

## 5. Testing & validation plan

### Test set
`interaction_test_set.json` — **25 cases** built directly from your reference guide:

| Category | Count | Purpose |
|---|---|---|
| Documented MAJOR | 5 | All 5 documented MAJOR pairs — the highest-stakes ground truth |
| Documented MODERATE | 7 | Representative sample of the 8 documented MODERATE pairs |
| Documented MINOR | 4 | Representative sample of the 7 documented MINOR pairs |
| Negative controls | 4 | Pairs from your "no significant interaction" list — catches false positives |
| Edge cases | 5 | Decomposition, inferred fallback, basket aggregation, same-product guard, unresolved product |

The negative controls matter as much as the positives: a prompt that just says MAJOR for everything would trivially "pass" if you only tested documented pairs. Testing what should **not** trigger is what actually validates quality.

### Scoring rubric
1. **Severity accuracy** — exact tier match for documented cases.
2. **Grounding fidelity** — for documented pairs, does the model's mechanism/recommendation align with the reference rather than inventing a different one?
3. **Fallback correctness** — for undocumented pairs, is `inferred_pharmacology` used honestly (not presented with `verified_reference` confidence), and is the inference itself pharmacologically reasonable?
4. **Schema validity** — always valid JSON matching the schema (this is largely solved by using Structured Outputs strict mode rather than freeform JSON).
5. **Escalation correctness** — MAJOR and inferred cases correctly trigger `escalate_to_pharmacist`.
6. **Consistency** — run each case 2-3 times; severity tier shouldn't flip between runs. Use a low temperature (0.1–0.2) for this reasoning task — you want repeatability, not creative variation.

### Running it
```bash
export OPENAI_API_KEY=sk-...
pip install openai
python test_harness.py                 # full 25-case suite against a live model
python test_harness.py --dry-run        # sanity-check the harness itself, no API key needed
python test_harness.py --case TC-MAJ-05 --verbose   # debug one case in depth
```

The harness stubs `lookup_product` / `get_known_interaction` from `pharmacy_reference_data.json`, so it validates the **reasoning prompt** independently of Ahmed's MCP build — you don't need to wait on his integration to start iterating on prompt quality. `--dry-run` proves the harness's own grading logic is correct using a passthrough "oracle" that only ever reports verified matches; it correctly fails the one case that requires real class-level inference (`TC-EDGE-02`) rather than faking a 25/25, which is what you want a test harness to do.

Suggested iteration loop for the rest of Week 2–3: run the full suite → for any FAIL, read the printed mismatch → adjust the system prompt wording (not the test set) → re-run → once stable at 25/25 against the real model across 2–3 repeated runs, it's ready to wire into Ahmed's MCP integration for the pilot.

---

## 6. Package contents

| File | What it's for |
|---|---|
| `Interaction_Risk_Prompt_Templates.md` | This document |
| `system_prompt.txt` | The system prompt, standalone, for code to load directly |
| `output_schema.json` | JSON Schema for `response_format` (Structured Outputs, strict mode) |
| `pharmacy_reference_data.json` | Full digitized catalog (42 products) + all 20 documented interactions — doubles as the data contract for Ahmed's MCP tools |
| `interaction_test_set.json` | The 25 test cases described above |
| `test_harness.py` | Runs the test set against a live model (or `--dry-run` against a mock) and grades the output |

---

## 7. A few implementation notes for whoever wires this up

- **Temperature**: 0.1–0.2. This task needs consistency, not creativity.
- **Structured Outputs, not JSON mode**: use `response_format: {"type": "json_schema", "json_schema": {...}, "strict": true}` — confirmed current on OpenAI's API as of mid-2026. Freeform `{"type": "json_object"}` mode doesn't guarantee your exact fields/enums, which for a decision-support tool is a bigger deal than usual.
- **Where the human stays in the loop**: `escalate_to_pharmacist` is the field a UI should key off of to decide whether an assessment needs a human sign-off before a sale goes through. Nothing in this design is meant to auto-approve or auto-block a transaction on its own.
- **Extending the reference data**: when a new product is added to inventory, add it to `catalog` in `pharmacy_reference_data.json` immediately (or have Ahmed's real lookup tool return it). It's fine if `known_interactions` lags behind and gets reviewed/added by a pharmacist later — that gap is exactly what the inferred-fallback pathway is designed to cover safely in the meantime.

# 03 — Interaction Risk Module

Canonical home for **Dr. Mohamed Ibrahim's pharmacovigilance / AI interaction-risk package**
(moved from `temp_mohamed/`; identical to the `For_Ahmed_Interaction_Risk_Prompts.zip` contents).

## Files (7)

| File | Purpose |
|---|---|
| `START_HERE.md` | Entry point: 5-step action plan (model decision → run harness → wire live inventory → pharmacist review → pilot) |
| `system_prompt.txt` | "Interaction Risk Reasoning Engine" system prompt (lookup_product / get_known_interaction tools, MAJOR/MODERATE/MINOR/NONE_KNOWN scale) |
| `output_schema.json` | JSON Schema for OpenAI Structured Outputs (strict) — 13 keys |
| `pharmacy_reference_data.json` | Digitized reference guide: 42 products, 20 interactions (5 MAJOR / 8 MODERATE / 7 MINOR), low-interaction groups |
| `interaction_test_set.json` | 25 ground-truth test cases (5 major, 7 moderate, 4 minor, 4 negative-control, 5 edge) |
| `test_harness.py` | CLI runner vs live model; default `gpt-4o-2024-08-06` (needs model decision) |
| `Interaction_Risk_Prompt_Templates.md` | Design doc + 3 request templates with worked examples |

## Integration status (2026-08-09)

- **NOT yet committed** to git (was untracked `temp_mohamed/`).
- **NOT yet wired** into `pv_service.py` / MCP server / schema.
- Full conflict analysis: `_analysis/04_archive_review.md`; task plan: `_analysis/06_final_consolidated_plan_input.md` (T-01, T-03, T-04, T-07, T-08, T-09).

## Actions needed (per START_HERE)
1. Decide model (GPT-4o retired → GPT-5.x) + key path (OpenAI vs OpenRouter) — blocks harness.
2. Run `test_harness.py` against live model → 25/25.
3. Build `lookup_product` + `get_known_interaction` MCP tools wired to live inventory.
4. Pharmacist clinical review of `pharmacy_reference_data.json`.
5. Small pilot.

#!/usr/bin/env python3
"""
test_harness.py — validates the interaction-risk reasoning prompt against
interaction_test_set.json.

This is the Week 2-3 task "test prompts against known interaction pairs to
validate output quality before scaling up," made runnable.

WHY A STUB RETRIEVAL LAYER
Ahmed's MCP tools (lookup_product / get_known_interaction) don't need to be
live for this to be useful. This harness simulates them locally from
pharmacy_reference_data.json and injects the results into the user turn
exactly as the final pipeline would. That means the *reasoning prompt* can
be iterated on and validated independently of the MCP build. Once Ahmed's
tools are live, swap build_retrieval_context() for real MCP calls — the
prompt, schema, test set, and grading logic don't need to change.

USAGE
    export OPENROUTER_API_KEY=sk-or-v1-...     # reuse the project's existing OpenRouter key
    python test_harness.py                    # run the full suite
    python test_harness.py --limit 5           # smoke test the first 5 cases
    python test_harness.py --case TC-MAJ-01     # run a single case
    python test_harness.py --dry-run            # exercise the harness with a mock model — no API key or network needed
    python test_harness.py --model gpt-5.2       # point at a different model (see the design doc's note on GPT-4o's status)
    python test_harness.py --verbose             # print full JSON for failing cases

Runs through OpenRouter (base_url OPENROUTER_BASE_URL, default
https://openrouter.ai/api/v1) using the project's existing OPENROUTER_API_KEY.
Set the live model id with --model (or the OPENROUTER_MODEL env var).

Requires: pip install openai  (not needed for --dry-run)
"""

import argparse
import json
import os
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
DEFAULT_MODEL = os.environ.get("OPENROUTER_MODEL", "gpt-4o-2024-08-06")
SEVERITY_ORDER = ["MAJOR", "MODERATE", "MINOR", "NONE_KNOWN"]


# --------------------------------------------------------------------------
# Loading fixed assets
# --------------------------------------------------------------------------

def load_assets():
    system_prompt = (HERE / "system_prompt.txt").read_text()
    schema = json.loads((HERE / "output_schema.json").read_text())
    reference_data = json.loads((HERE / "pharmacy_reference_data.json").read_text())
    test_set = json.loads((HERE / "interaction_test_set.json").read_text())
    return system_prompt, schema, reference_data, test_set["test_cases"]


# --------------------------------------------------------------------------
# Stub MCP tools — simulate Ahmed's lookup_product / get_known_interaction
# from the local reference data.
# --------------------------------------------------------------------------

def stub_lookup_product(name, reference_data, synthetic_products=None):
    pool = list(reference_data["catalog"]) + list(synthetic_products or [])
    for p in pool:
        if p["name"].strip().lower() == name.strip().lower():
            return {
                "product_name": p["name"],
                "active_ingredients": p["active_ingredients"],
                "therapeutic_class": p.get("therapeutic_class", ""),
            }
    return None


def stub_get_known_interaction(ingredient_a, ingredient_b, reference_data):
    a_norm, b_norm = ingredient_a.strip().lower(), ingredient_b.strip().lower()
    for rec in reference_data["known_interactions"]:
        a_side = {x.strip().lower() for x in (rec.get("ingredient_a_group") or [rec.get("ingredient_a")])}
        b_side = {x.strip().lower() for x in rec["ingredient_b_group"]}
        if (a_norm in a_side and b_norm in b_side) or (b_norm in a_side and a_norm in b_side):
            return {
                "severity": rec["severity"],
                "mechanism": rec["mechanism"],
                "recommendation": rec["recommendation"],
                "matched_rule": rec["id"],
            }
    return None


# --------------------------------------------------------------------------
# Build the retrieval context Ahmed's MCP layer would ultimately supply.
# --------------------------------------------------------------------------

def build_retrieval_context(case, reference_data):
    products = case["products"]
    synthetic = case.get("synthetic_products", [])

    resolved, unresolved = [], []
    for name in products:
        hit = stub_lookup_product(name, reference_data, synthetic)
        (resolved if hit else unresolved).append(hit or name)

    # Only compare ingredients that came from DIFFERENT input products —
    # mirrors the "same-product guard" rule in the system prompt.
    pair_lookups = []
    for i in range(len(resolved)):
        for j in range(i + 1, len(resolved)):
            prod_a, prod_b = resolved[i], resolved[j]
            for ing_a in prod_a["active_ingredients"]:
                for ing_b in prod_b["active_ingredients"]:
                    match = stub_get_known_interaction(ing_a, ing_b, reference_data)
                    pair_lookups.append({
                        "product_pair": [prod_a["product_name"], prod_b["product_name"]],
                        "ingredient_pair": [ing_a, ing_b],
                        "get_known_interaction_result": match,
                    })

    return resolved, unresolved, pair_lookups


def format_context_block(resolved, unresolved, pair_lookups):
    lines = ["[Simulated MCP tool results — treat exactly as you would live tool output]"]
    for r in resolved:
        lines.append(f'lookup_product("{r["product_name"]}") -> {json.dumps(r)}')
    for name in unresolved:
        lines.append(f'lookup_product("{name}") -> not_found')
    for pl in pair_lookups:
        a, b = pl["ingredient_pair"]
        lines.append(f'get_known_interaction("{a}", "{b}") -> {json.dumps(pl["get_known_interaction_result"])}')
    return "\n".join(lines)


def build_user_message(case, context_block):
    if case["query_type"] == "basket":
        query = f"Check interaction risk across this basket of products: {json.dumps(case['products'])}"
    elif len(case["products"]) == 1:
        query = f'Someone is asking about "{case["products"][0]}" on its own. Report anything relevant.'
    else:
        query = f'Check interaction risk between "{case["products"][0]}" and "{case["products"][1]}".'
    return f"{query}\n\n{context_block}"


# --------------------------------------------------------------------------
# Model call
# --------------------------------------------------------------------------

def call_model(system_prompt, user_message, schema, model, dry_run, oracle_result=None):
    if dry_run:
        return oracle_result  # deterministic mock — see build_oracle_result()

    from openai import OpenAI  # imported lazily so --dry-run has no dependency
    base_url = os.environ.get("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
    client = OpenAI(base_url=base_url, api_key=os.environ["OPENROUTER_API_KEY"])
    response = client.chat.completions.create(
        model=model,
        temperature=0.1,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        response_format={"type": "json_schema", "json_schema": schema},
    )
    return json.loads(response.choices[0].message.content)


def build_oracle_result(case, resolved, unresolved, pair_lookups):
    """A 'perfect passthrough' of the stubbed retrieval — NOT a stand-in for
    the model's reasoning. It only ever reports verified_reference matches,
    so it deliberately does not solve the class-inference edge cases
    (e.g. TC-EDGE-02). Its job in --dry-run is to prove the harness's own
    plumbing and grading logic are correct before pointing it at a real
    model, not to fake a passing score on cases that require reasoning.
    """
    interactions = []
    for pl in pair_lookups:
        match = pl["get_known_interaction_result"]
        if match:
            interactions.append({
                "product_pair": pl["product_pair"],
                "ingredient_pair": pl["ingredient_pair"],
                "severity": match["severity"],
                "source": "verified_reference",
                "confidence": "high",
                "mechanism": match["mechanism"],
                "recommendation": match["recommendation"],
            })
    present = [i["severity"] for i in interactions]
    highest = next((s for s in SEVERITY_ORDER if s in present), "NONE_KNOWN")
    unresolved_names = [u if isinstance(u, str) else u["product_name"] for u in unresolved]
    return {
        "query_type": case["query_type"],
        "products_input": case["products"],
        "resolved_ingredients": (
            [{"product": r["product_name"], "active_ingredients": r["active_ingredients"], "resolved": True} for r in resolved]
            + [{"product": n, "active_ingredients": [], "resolved": False} for n in unresolved_names]
        ),
        "interactions": interactions,
        "highest_severity": highest,
        "escalate_to_pharmacist": (highest == "MAJOR") or bool(unresolved_names),
        "urgent_flag": False,
        "unresolved_products": unresolved_names,
        "disclaimer": "Decision support only — verify with a pharmacist before acting.",
    }


# --------------------------------------------------------------------------
# Grading — each check is opt-in based on which "expected_*" keys a test
# case defines, so one grader handles positives, negatives, and edge cases.
# --------------------------------------------------------------------------

def grade(case, result):
    checks = []

    def check(label, passed, got=None):
        checks.append({"label": label, "passed": bool(passed), "got": got})

    if result is None:
        check("model returned a parseable result", False, None)
        return checks

    if "expected_severity" in case:
        check(f'highest_severity == {case["expected_severity"]}',
              result.get("highest_severity") == case["expected_severity"], result.get("highest_severity"))

    if "expected_highest_severity" in case:
        check(f'highest_severity == {case["expected_highest_severity"]}',
              result.get("highest_severity") == case["expected_highest_severity"], result.get("highest_severity"))

    if "acceptable_severity_range" in case:
        check(f'highest_severity in {case["acceptable_severity_range"]}',
              result.get("highest_severity") in case["acceptable_severity_range"], result.get("highest_severity"))

    if "fail_if_severity_in" in case:
        check(f'highest_severity NOT in {case["fail_if_severity_in"]}',
              result.get("highest_severity") not in case["fail_if_severity_in"], result.get("highest_severity"))

    if "expected_source" in case:
        top = [i for i in result.get("interactions", []) if i.get("severity") == result.get("highest_severity")]
        got_sources = [i.get("source") for i in top]
        check(f'top finding source == {case["expected_source"]}',
              case["expected_source"] in got_sources, got_sources)

    if "expected_flagged_ingredient_pair" in case:
        wanted = {x.lower() for x in case["expected_flagged_ingredient_pair"]}
        found = any({x.lower() for x in i.get("ingredient_pair", [])} == wanted for i in result.get("interactions", []))
        check(f'flags ingredient pair {case["expected_flagged_ingredient_pair"]}', found)

    if "expected_interactions_count" in case:
        n = len(result.get("interactions", []))
        check(f'len(interactions) == {case["expected_interactions_count"]}',
              n == case["expected_interactions_count"], n)

    if "expected_unresolved_products" in case:
        got = set(result.get("unresolved_products", []))
        want = set(case["expected_unresolved_products"])
        check(f'unresolved_products ⊇ {sorted(want)}', want.issubset(got), sorted(got))

    if "expected_escalate_to_pharmacist" in case:
        check(f'escalate_to_pharmacist == {case["expected_escalate_to_pharmacist"]}',
              result.get("escalate_to_pharmacist") == case["expected_escalate_to_pharmacist"],
              result.get("escalate_to_pharmacist"))

    return checks


# --------------------------------------------------------------------------
# Runner
# --------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--model", default=DEFAULT_MODEL, help=f"Model name (default: {DEFAULT_MODEL})")
    parser.add_argument("--limit", type=int, default=None, help="Only run the first N test cases")
    parser.add_argument("--case", default=None, help="Run a single test case by id, e.g. TC-MAJ-01")
    parser.add_argument("--dry-run", action="store_true", help="Exercise the harness with a mock model — no API key or network needed")
    parser.add_argument("--verbose", action="store_true", help="Print full JSON responses for failing cases")
    args = parser.parse_args()

    if not args.dry_run and not os.environ.get("OPENROUTER_API_KEY"):
        print("ERROR: OPENROUTER_API_KEY is not set. Export it (reuse the project .env), or run with --dry-run to test the harness itself.", file=sys.stderr)
        sys.exit(1)

    system_prompt, schema, reference_data, test_cases = load_assets()

    if args.case:
        test_cases = [c for c in test_cases if c["id"] == args.case]
        if not test_cases:
            print(f"No test case with id {args.case}", file=sys.stderr)
            sys.exit(1)
    if args.limit:
        test_cases = test_cases[: args.limit]

    results_by_category, total_pass = {}, 0

    for case in test_cases:
        resolved, unresolved, pair_lookups = build_retrieval_context(case, reference_data)
        context_block = format_context_block(resolved, unresolved, pair_lookups)
        user_message = build_user_message(case, context_block)

        oracle = build_oracle_result(case, resolved, unresolved, pair_lookups) if args.dry_run else None
        result = call_model(system_prompt, user_message, schema, args.model, args.dry_run, oracle_result=oracle)

        checks = grade(case, result)
        case_passed = bool(checks) and all(c["passed"] for c in checks)

        cat = case.get("category", "uncategorized")
        stats = results_by_category.setdefault(cat, {"pass": 0, "total": 0})
        stats["total"] += 1
        if case_passed:
            stats["pass"] += 1
            total_pass += 1

        print(f"[{'PASS' if case_passed else 'FAIL'}] {case['id']} ({cat})")
        for c in checks:
            mark = "  ok  " if c["passed"] else "  x   "
            print(f"{mark}{c['label']}" + ("" if c["passed"] else f"   [got: {c['got']}]"))
        if not case_passed and args.verbose:
            print("  full response:", json.dumps(result, indent=2))
        print()

    print("=" * 60)
    print(f"TOTAL: {total_pass}/{len(test_cases)} passed")
    for cat, stats in results_by_category.items():
        print(f"  {cat:24s} {stats['pass']}/{stats['total']}")
    print("=" * 60)
    if args.dry_run:
        print("Note: --dry-run uses a passthrough oracle that only reports verified_reference")
        print("matches. Cases that require class-level inference (e.g. TC-EDGE-02) are EXPECTED")
        print("to fail here — that's the harness working correctly, not a bug. Re-run without")
        print("--dry-run against a real model to test the actual reasoning.")

    sys.exit(0 if total_pass == len(test_cases) else 1)


if __name__ == "__main__":
    main()

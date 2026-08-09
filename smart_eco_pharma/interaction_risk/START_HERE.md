# Start here

## What this is
An AI system that takes two or more medicine names and tells you how risky combining them is — MAJOR / MODERATE / MINOR / no known risk — based on Smart Eco-Pharma Hub's own drug interaction reference guide.

## What's already done
- Instructions that tell the AI exactly how to reason about a pair of medicines ✅
- A digital, searchable copy of your reference guide for the AI to check against ✅
- 25 test questions, with the correct answers already known, to check the AI's work ✅
- A script that runs those 25 tests automatically and reports pass/fail ✅

All 6 files are in this folder. `Interaction_Risk_Prompt_Templates.md` has the full detail on any of them if you want it — you don't need to read it to follow the steps below.

## What happens next, in order

| # | Step | Who does it |
|---|---|---|
| 1 | Decide which AI model to actually use — see note below | You + Ahmed |
| 2 | Run `test_harness.py` with a real OpenAI account and see if it gets all 25 test answers right | Whoever's comfortable running a script from a command line — doesn't have to be Ahmed specifically |
| 3 | Ahmed connects the AI to the real, live pharmacy inventory (not just this snapshot) | Ahmed |
| 4 | A pharmacist reviews `pharmacy_reference_data.json` before it's trusted for real use — a few entries were restructured to make them machine-readable | A pharmacist / clinical lead |
| 5 | Small pilot (a few staff, a few products) before full rollout | The team |

## The one thing to raise this week
GPT-4o (the model this was built for) is being retired by OpenAI. Decide with Ahmed now whether to keep targeting it or move to a current model — it's a one-line change in the script either way, but better decided before this is wired up than after.

## If you get stuck
Come back and tell me which step you're on — I'll walk through just that part, assuming no coding background.

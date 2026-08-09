# 01 — Linear Findings (Sub-Agent A: Linear-Analyst)

> Source: Linear workspace **Ejust** (`https://linear.app/ejust`), project **Smart Eco-Pharma Hub**
> (id `0ad909b1-fd5b-4602-806e-3cc03819b4ba`, team `EJU`). Queried via Linear MCP.
> Scope: all project issues, comments, status updates, team members. Generated 2026-08-09.

---

## 1. Project overview

- **Project:** Smart Eco-Pharma Hub — 8-week, zero-budget, simulation-based pharma workflow project.
- **Lead / assignee of governance work:** Ahmed El-Dasouky (`ahmed.320240024@ejust.edu.eg`).
- **Milestones referenced:** Phase 1 (Medical Data Foundation), Phase 2 (HW Simulation),
  Phase 3 (Software & Cloud Integration), Phase 4 (Cybersecurity).
- **Issue count:** 15 issues in project (EJU-5 … EJU-20). Parent issue: **EJU-6** (Project Setup & Execution Plan).

---

## 2. Team members (Linear users) — id → name → email

| Linear user id | Name | Email |
|---|---|---|
| `2c9120f9-bbd4-475f-85a7-3058d8d4e96b` | Ahmed El-Dasouky | ahmed.320240024@ejust.edu.eg |
| `dc140a18-5d90-49a0-b150-b658e479a523` | Eman Ayman | eman.720240043@ejust.edu.eg |
| `df6cd3a8-ddd8-41f0-ac08-8c915073263e` | fatma.420240179@… | fatma.420240179@ejust.edu.eg |
| `94b6f6c6-dc14-47f7-a261-c609095007bf` | mohammad.elkhouly@… (Dr. Mohamed Ibrahim) | mohammad.elkhouly@ejust.edu.eg |
| `da6fc7c9-2804-438c-aa40-c194a637fe80` | omar 320250068 (Omar Hindawi) | omar.320250068@ejust.edu.eg |
| `4ce18bcd-38c0-4739-84cf-7e94e06932fd` | Fagr Ahmed | fagr.120250098@ejust.edu.eg |
| `3866821d-8304-48eb-9802-5b92f4048742` | Aya Mohamed | aya.320240137@ejust.edu.eg |
| `4abebc77-5789-4e8e-8d7b-0f49dc7b51c8` | Zaina Wael | zaina.320230019@ejust.edu.eg |

*(Zeina Wael — issue EJU-17; no matching Linear account at query time.)*

---

## 3. Issue-by-issue status (all 15)

| Issue | Title | Assignee | Status | Completed | Labels | Notes |
|---|---|---|---|---|---|---|
| EJU-6 | 🚀 Project Setup & Execution Plan | — (parent) | Backlog | — | Governance | Parent of all others |
| EJU-5 | Analyze Constraints & Set DB Schema/RLS Standards | Ahmed | **Done** | 2026-07-17 | Governance | Urgent priority |
| EJU-7 | Define API & Data Contracts | Ahmed | **Done** | 2026-07-17 | Governance | |
| EJU-8 | Guide Integration & Code Reviews | Ahmed | Backlog | — | Governance | Ongoing task |
| EJU-9 | Integrate GPT-4o & Build MCP Server | Ahmed | **Done** | 2026-07-17 | Governance, Phase 3 | Completed but see §5 |
| EJU-10 | Support Security & Final Narrative | Ahmed | Backlog | — | Governance, Phase 4 | |
| EJU-19 | Final Deliverables — Report, Video, Artifacts | Ahmed | Backlog | — | Governance, Phase 4 | Gates on all handovers |
| EJU-11 | Omar — Translate Medical Rules into Python & Sprint Mgmt | Omar | **In Progress** | — | Phase 1 | Reports posted (see §5) |
| EJU-12 | Eman — QC Protocols & Purity Classification | Eman | **Done** | 2026-07-21 | Phase 1 | |
| EJU-13 | Fatma — OTC Master List & Inventory Rules | Fatma | **Done** | 2026-07-17 | Phase 1 | |
| EJU-14 | Dr. Mohamed — PV & AI Interaction Research | mohammad.elkhouly | Backlog | — | Phase 1 | Omar blocked waiting on this |
| EJU-20 | Dr. Mohamed — PV & AI Market Analysis (duplicate) | — | **Done** | 2026-07-18 | — | Created by Mohamed himself |
| EJU-15 | Fagr — Wokwi Circuit & Arduino Logic | — | Backlog | — | Phase 2 | No account |
| EJU-16 | Aya — Backend Integration, Dashboard & Deployment | — | Backlog | — | Phase 3 | No account |
| EJU-17 | Zeina — Network Topology, ACL/VLAN & Security | — | Backlog | — | Phase 4 | No account |

---

## 4. Per-person breakdown

### Ahmed El-Dasouky (Governance & AI Architecture lead)
- **Done:** EJU-5 (constraints + schema + RLS), EJU-7 (API & data contracts), EJU-9 (GPT-4o + MCP server).
- **In progress / Backlog:** EJU-8 (guide integration & reviews — ongoing), EJU-10 (support security & final narrative),
  EJU-19 (final deliverables: report, video, artifacts).
- **No dedicated progress report posted** on any of his issues (EJU-5/7/8/9/10 all have **zero comments**).

### Omar Hindawi (Python logic + sprint mgmt)
- **In progress:** EJU-11.
- **Posted:** 3 comments — execution plan (07-16), v3 progress update (07-16, 10/10 tests), Phase 1 Progress Report (08-07, coding complete).
- **Blocked on:** Dr. Mohamed's interaction data (EJU-14) — comment 08-06.

### Eman Ayman (QC / purity)
- **Done:** EJU-12. Comment (07-12): asked for schema template; Ahmed replied "waiting to discuss with team".

### Dr. Fatma Mohamed (Clinical pharmacy / inventory)
- **Done:** EJU-13. Comment (07-17): confirmed temp_tolerance (2.0 normal / 3.0 cold-chain) + humidity_tolerance (5.0) added to CSV.

### Dr. Mohamed Ibrahim (PV / AI interaction research)
- **EJU-20 Done (07-18, self-created).** **EJU-14 still Backlog** (the tracked Phase 1 issue) — ambiguity to flag.
- Delivered interaction-risk prompt package (see Sub-Agent D) OUTSIDE Linear; not attached to any issue.
- Omar is waiting on his handover.

### Fagr Ahmed / Aya / Zeina
- No Linear accounts; issues backlog. Fagr's firmware delivered out-of-band (see repo + session work).

---

## 5. Existing reports/comments on Linear (EXCLUSION LIST — do NOT re-post)

| Issue | Date | Author | Type | Summary |
|---|---|---|---|---|
| EJU-11 | 2026-07-16 | Omar | Execution plan | Detailed plan for Python modules |
| EJU-11 | 2026-07-16 | Omar | Progress update (v3) | Drug classification, inventory rules, interaction check — 10/10 tests |
| EJU-11 | 2026-08-07 | Omar | **Phase 1 Progress Report** | Coding complete; ready for handover to Aya |
| EJU-14 | 2026-08-06 | Omar | Comment | Blocked — waiting on Dr. Mohamed's interaction data |
| EJU-12 | 2026-07-12 | Eman / Ahmed | Q&A | Schema template timing |
| EJU-13 | 2026-07-16/17 | Omar / Fatma | Q&A | Tolerance values added to CSV |
| Project | 2026-07-12 | Ahmed | Status update | "Kickoff Status" — project structure live, 15 issues, 6 need accounts |

**Critical conclusion:** Ahmed El-Dasouky has **posted no progress report on Linear** for EJU-9 (GPT-4o + MCP) or any other issue. A new report is therefore safe to post, provided it does not restate Omar's Phase 1 report content.

---

## 6. Flags for downstream agents

1. **EJU-9 marked Done (07-17)** but the repo + this session show *additional* net-new MCP/prompt integration work (Dr. Mohamed's package) not reflected in Linear → the "Done" needs a companion report of new completed work.
2. **EJU-14 (Backlog) vs EJU-20 (Done)** — duplicate issue ambiguity for Dr. Mohamed's scope.
3. **Omar is blocked on Dr. Mohamed (EJU-14)** — relevant to any "waiting on" flags.
4. No documents/attachments are attached to project issues (documents list empty) — the prompt package lives only in the zip.

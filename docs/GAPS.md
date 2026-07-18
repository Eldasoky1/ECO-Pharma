# Known Gaps & Action Items

| # | Description | Owner | Status | Deadline |
|---|-------------|-------|--------|----------|
| 1 | Risk grade enum values are PLACEHOLDERS — Dr. Mohamed must validate | Dr. Mohamed Ibrahim | OPEN | Week 1 |
| 2 | `purity_grade` field values undefined — Eman must define classification labels | Eman Ayman | OPEN | Week 1 |
| 3 | `min_stock_threshold` values undefined — Fatma must set reorder triggers per drug | Fatma Mohamed | OPEN | Week 1 |
| 4 | `interaction_type` taxonomy undefined — Dr. Mohamed must define interaction categories | Dr. Mohamed Ibrahim | OPEN | Week 2 |
| 5 | Supabase project credentials needed — actual URL and keys from Supabase dashboard | Ahmed El-Desouky | OPEN | Week 1 |
| 6 | OpenRouter API quota — verify free tier limits for GPT-4o calls | Ahmed El-Desouky | OPEN | Week 2 |
| 7 | No QC/purity Python model or repository exists — `test_method_type` enum is now in schema but has no consuming endpoints. Blocker for future Phase 3 QC endpoints, not for this task. | Architecture | OPEN | Future phase |
| 8 | `migration_002_fatma_validation.sql` not yet created — Fatma's schema changes (drug_class_thresholds, storage_zone_type, storage_location CHECK) pending | Fatma Mohamed | OPEN | Week 1 |

---

### Phase 1 Domain Sign-Off Status

- **Eman Ayman (purity_classification):** ✅ VALIDATED — `test_method` override applied (migration_002). `purity_grade`, `purity_percent`, `unit`, `qc_protocol_ref` confirmed as-is.
- **Fatma Mohamed (otc_inventory):** ⏳ PENDING — schema changes not yet created (migration_003).
- **Dr. Mohamed Ibrahim (drug_interactions):** ⏳ PENDING — `risk_grade` enum validation still open (gap #1).
- **Fagr Ahmed (IoT):** ⏳ PENDING — IoT schema validated but IoT contract handoff not yet signed off.

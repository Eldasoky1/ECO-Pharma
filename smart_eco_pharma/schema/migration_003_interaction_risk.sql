-- ============================================================================
-- Smart Eco-Pharma Hub — Migration 003: Interaction-Risk Module Adoption
-- Adds the archive's severity/confidence/source taxonomy to drug_interactions
-- so the 13-key interaction-risk output schema can be persisted verbatim.
-- Target: Supabase Free Tier (PostgreSQL 15+)
-- ============================================================================

-- ============================================================================
-- 1. NEW ENUMS
-- ============================================================================
-- Mirrors the interaction_risk/output_schema.json enum values exactly.

CREATE TYPE interaction_severity_type AS ENUM (
    'MAJOR',
    'MODERATE',
    'MINOR',
    'NONE_KNOWN'
);

CREATE TYPE interaction_source_type AS ENUM (
    'verified_reference',
    'inferred_pharmacology'
);

CREATE TYPE interaction_confidence_type AS ENUM (
    'high',
    'medium',
    'low'
);

-- ============================================================================
-- 2. ALTER TABLE: drug_interactions
-- ============================================================================
-- The existing risk_grade/evidence_level columns stay for backward
-- compatibility with the Phase 1 API. The new columns carry the
-- interaction-risk module's richer assessment so the AI output is never
-- lossy-mapped.

ALTER TABLE drug_interactions
    ADD COLUMN severity   interaction_severity_type,
    ADD COLUMN source     interaction_source_type,
    ADD COLUMN confidence interaction_confidence_type;

-- ============================================================================
-- 3. RLS POLICIES — NO CHANGES REQUIRED
-- ============================================================================
-- Existing policies are role-based and row-level; adding columns does not
-- affect them. pharmacovigilance retains INSERT/UPDATE/DELETE, team members
-- retain SELECT, anon remains denied.

-- ============================================================================
-- END OF MIGRATION 003
-- ============================================================================

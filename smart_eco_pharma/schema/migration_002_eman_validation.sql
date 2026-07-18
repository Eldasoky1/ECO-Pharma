-- ============================================================================
-- Smart Eco-Pharma Hub — Migration 002: Eman Ayman's Schema Validation
-- Applies test_method free-text → controlled enum override
-- Target: Supabase Free Tier (PostgreSQL 15+)
-- ============================================================================

-- ============================================================================
-- 1. NEW ENUM: test_method_type
-- ============================================================================
-- Controlled vocabulary for analytical QC test methods. Replaces the free-text
-- test_method column to prevent duplicate/inconsistent naming
-- (e.g., "HPLC" vs "hplc" vs "High Performance Liquid Chromatography").
--
-- 'other' is included as an escape hatch so Eman's team is never blocked.
-- When 'other' is selected, the companion column
-- test_method_other_description captures the actual method name.
-- The architecture team can promote frequently-used 'other' values to
-- permanent enum members in a future migration.

CREATE TYPE test_method_type AS ENUM (
    'hplc',
    'gc',
    'uv_vis',
    'ftir',
    'titration',
    'mass_spectrometry',
    'other'
);

-- ============================================================================
-- 2. ALTER COLUMN: purity_classification.test_method → test_method_type
-- ============================================================================
-- Converts the existing TEXT column to the new enum type.
-- This is safe because the purity_classification table is currently empty
-- (no rows have been inserted yet), so there are no TEXT values that would
-- fail to map to the new enum. No data conflicts to resolve.

ALTER TABLE purity_classification
    ALTER COLUMN test_method TYPE test_method_type
    USING test_method::test_method_type;

-- ============================================================================
-- 3. ADD COLUMN: test_method_other_description
-- ============================================================================
-- Nullable TEXT column. Only meaningful when test_method = 'other'.
-- Allows Eman's team to describe the actual analytical method when it is not
-- yet in the permanent enum list. The architecture team can review values in
-- this column and promote popular methods to enum members in future migrations.

ALTER TABLE purity_classification
    ADD COLUMN test_method_other_description TEXT;

-- ============================================================================
-- 4. RLS POLICIES — NO CHANGES REQUIRED
-- ============================================================================
-- Existing RLS policies on purity_classification are role-based:
--   - qa_specialist: INSERT, UPDATE, DELETE (full CRUD)
--   - architecture_lead: full access
--   - team_member_read_all: SELECT for all authenticated users
--   - deny_anon: blocks unauthenticated access
--
-- Changing a column's data type does not affect row-level security policies,
-- which operate on rows (who can read/write which rows), not on columns
-- (what data type a column holds). The policies above remain valid and
-- functional with the new test_method_type enum.

-- ============================================================================
-- END OF MIGRATION 002
-- ============================================================================

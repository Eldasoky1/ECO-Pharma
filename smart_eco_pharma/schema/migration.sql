-- ============================================================================
-- Smart Eco-Pharma Hub — PostgreSQL Migration
-- Target: Supabase Free Tier (PostgreSQL 15+)
-- ============================================================================

-- ============================================================================
-- 1. ENUM TYPES
-- ============================================================================

CREATE TYPE team_role AS ENUM (
    'architecture_lead',
    'project_manager',
    'qa_specialist',
    'clinical_pharmacy',
    'pharmacovigilance',
    'frontend_engineer'
);

CREATE TYPE regulatory_status AS ENUM (
    'prescription_only',
    'otc',
    'controlled'
);

CREATE TYPE qc_test_status AS ENUM (
    'pass',
    'fail',
    'pending'
);

CREATE TYPE reorder_status_type AS ENUM (
    'normal',
    'low',
    'critical',
    'on_order'
);

CREATE TYPE risk_grade_type AS ENUM (
    'grade_1_minimal',
    'grade_2_moderate',
    'grade_3_severe',
    'grade_4_contraindicated'
);

CREATE TYPE evidence_level_type AS ENUM (
    'established',
    'theoretical',
    'case_report'
);

-- ============================================================================
-- 2. TABLE: team_members
-- ============================================================================

CREATE TABLE team_members (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    role        team_role NOT NULL,
    full_name   TEXT NOT NULL,
    email       TEXT NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 3. TABLE: drug_master
-- ============================================================================

CREATE TABLE drug_master (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drug_name                TEXT NOT NULL,
    brand_name               TEXT,
    drug_class               TEXT,
    regulatory_status        regulatory_status NOT NULL DEFAULT 'prescription_only',
    dosage_forms             TEXT[],
    active_ingredients       TEXT NOT NULL,
    route_of_administration  TEXT,
    record_version           INTEGER NOT NULL DEFAULT 1,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at               TIMESTAMPTZ
);

-- ============================================================================
-- 4. TABLE: purity_classification
-- ============================================================================

CREATE TABLE purity_classification (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drug_id          UUID NOT NULL REFERENCES drug_master(id) ON DELETE CASCADE,
    purity_grade     TEXT NOT NULL,
    purity_percent   NUMERIC(5,2),
    unit             TEXT,
    qc_protocol_ref  TEXT,
    test_method      TEXT,
    test_status      qc_test_status NOT NULL DEFAULT 'pending',
    qc_analyst_id    UUID REFERENCES team_members(id),
    test_date        DATE,
    notes            TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 5. TABLE: otc_inventory
-- ============================================================================

CREATE TABLE otc_inventory (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drug_id                  UUID NOT NULL REFERENCES drug_master(id) ON DELETE CASCADE,
    stock_quantity           INTEGER NOT NULL DEFAULT 0,
    stock_unit               TEXT NOT NULL,
    min_stock_threshold      INTEGER,
    reorder_quantity         INTEGER,
    max_storage_capacity     INTEGER,
    storage_location_identifier TEXT NOT NULL UNIQUE,
    storage_temp_min_c       NUMERIC(4,1),
    storage_temp_max_c       NUMERIC(4,1),
    storage_humidity_min_pct NUMERIC(4,1),
    storage_humidity_max_pct NUMERIC(4,1),
    batch_expiry_date        DATE,
    supplier_ref             TEXT,
    last_restocked_date      DATE,
    reorder_status           reorder_status_type NOT NULL DEFAULT 'normal',
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 6. TABLE: drug_interactions
-- ============================================================================

CREATE TABLE drug_interactions (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drug_a_id                UUID NOT NULL REFERENCES drug_master(id) ON DELETE CASCADE,
    drug_b_id                UUID NOT NULL REFERENCES drug_master(id) ON DELETE CASCADE,
    interaction_type         TEXT,
    risk_grade               risk_grade_type NOT NULL DEFAULT 'grade_1_minimal',
    clinical_consequence     TEXT NOT NULL,
    evidence_level           evidence_level_type NOT NULL,
    mechanism                TEXT,
    management_recommendation TEXT,
    ai_generated             BOOLEAN NOT NULL DEFAULT false,
    gpt_model_version        TEXT,
    source_reference         TEXT,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (drug_a_id != drug_b_id)
);

-- ============================================================================
-- 7. TRIGGER FUNCTION: auto-update updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_drug_master_updated_at
    BEFORE UPDATE ON drug_master
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_purity_classification_updated_at
    BEFORE UPDATE ON purity_classification
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_otc_inventory_updated_at
    BEFORE UPDATE ON otc_inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_drug_interactions_updated_at
    BEFORE UPDATE ON drug_interactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 8. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE purity_classification ENABLE ROW LEVEL SECURITY;
ALTER TABLE otc_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_interactions ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 8a. team_members policies
-- ----------------------------------------------------------------------------

CREATE POLICY "deny_anon"
    ON team_members FOR ALL
    USING (auth.uid() IS NULL);

CREATE POLICY "users_read_own_profile"
    ON team_members FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "architecture_lead_manages_team"
    ON team_members FOR ALL
    USING (auth.uid() IN (SELECT user_id FROM team_members WHERE role = 'architecture_lead'));

CREATE POLICY "architecture_lead_full_access"
    ON team_members FOR ALL
    USING (auth.uid() IN (SELECT user_id FROM team_members WHERE role = 'architecture_lead'));

CREATE POLICY "team_member_read_all"
    ON team_members FOR SELECT
    USING (auth.uid() IN (SELECT user_id FROM team_members));

-- ----------------------------------------------------------------------------
-- 8b. drug_master policies
-- ----------------------------------------------------------------------------

CREATE POLICY "deny_anon"
    ON drug_master FOR ALL
    USING (auth.uid() IS NULL);

CREATE POLICY "architecture_lead_full_access"
    ON drug_master FOR ALL
    USING (auth.uid() IN (SELECT user_id FROM team_members WHERE role = 'architecture_lead'));

CREATE POLICY "team_member_read_all"
    ON drug_master FOR SELECT
    USING (auth.uid() IN (SELECT user_id FROM team_members));

-- ----------------------------------------------------------------------------
-- 8c. purity_classification policies
-- ----------------------------------------------------------------------------

CREATE POLICY "deny_anon"
    ON purity_classification FOR ALL
    USING (auth.uid() IS NULL);

CREATE POLICY "architecture_lead_full_access"
    ON purity_classification FOR ALL
    USING (auth.uid() IN (SELECT user_id FROM team_members WHERE role = 'architecture_lead'));

CREATE POLICY "team_member_read_all"
    ON purity_classification FOR SELECT
    USING (auth.uid() IN (SELECT user_id FROM team_members));

CREATE POLICY "qa_specialist_writes_purity"
    ON purity_classification FOR INSERT
    WITH CHECK (auth.uid() IN (SELECT user_id FROM team_members WHERE role = 'qa_specialist'));

CREATE POLICY "qa_specialist_writes_purity"
    ON purity_classification FOR UPDATE
    USING (auth.uid() IN (SELECT user_id FROM team_members WHERE role = 'qa_specialist'));

CREATE POLICY "qa_specialist_writes_purity"
    ON purity_classification FOR DELETE
    USING (auth.uid() IN (SELECT user_id FROM team_members WHERE role = 'qa_specialist'));

-- ----------------------------------------------------------------------------
-- 8d. otc_inventory policies
-- ----------------------------------------------------------------------------

CREATE POLICY "deny_anon"
    ON otc_inventory FOR ALL
    USING (auth.uid() IS NULL);

CREATE POLICY "architecture_lead_full_access"
    ON otc_inventory FOR ALL
    USING (auth.uid() IN (SELECT user_id FROM team_members WHERE role = 'architecture_lead'));

CREATE POLICY "team_member_read_all"
    ON otc_inventory FOR SELECT
    USING (auth.uid() IN (SELECT user_id FROM team_members));

CREATE POLICY "clinical_pharmacy_writes_inventory"
    ON otc_inventory FOR INSERT
    WITH CHECK (auth.uid() IN (SELECT user_id FROM team_members WHERE role = 'clinical_pharmacy'));

CREATE POLICY "clinical_pharmacy_writes_inventory"
    ON otc_inventory FOR UPDATE
    USING (auth.uid() IN (SELECT user_id FROM team_members WHERE role = 'clinical_pharmacy'));

CREATE POLICY "clinical_pharmacy_writes_inventory"
    ON otc_inventory FOR DELETE
    USING (auth.uid() IN (SELECT user_id FROM team_members WHERE role = 'clinical_pharmacy'));

-- ----------------------------------------------------------------------------
-- 8e. drug_interactions policies
-- ----------------------------------------------------------------------------

CREATE POLICY "deny_anon"
    ON drug_interactions FOR ALL
    USING (auth.uid() IS NULL);

CREATE POLICY "architecture_lead_full_access"
    ON drug_interactions FOR ALL
    USING (auth.uid() IN (SELECT user_id FROM team_members WHERE role = 'architecture_lead'));

CREATE POLICY "team_member_read_all"
    ON drug_interactions FOR SELECT
    USING (auth.uid() IN (SELECT user_id FROM team_members));

CREATE POLICY "pharmacovigilance_writes_interactions"
    ON drug_interactions FOR INSERT
    WITH CHECK (auth.uid() IN (SELECT user_id FROM team_members WHERE role = 'pharmacovigilance'));

CREATE POLICY "pharmacovigilance_writes_interactions"
    ON drug_interactions FOR UPDATE
    USING (auth.uid() IN (SELECT user_id FROM team_members WHERE role = 'pharmacovigilance'));

CREATE POLICY "pharmacovigilance_writes_interactions"
    ON drug_interactions FOR DELETE
    USING (auth.uid() IN (SELECT user_id FROM team_members WHERE role = 'pharmacovigilance'));

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
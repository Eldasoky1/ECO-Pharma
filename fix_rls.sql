-- FIX: Infinite recursion in team_members RLS policies
-- The "team_member_read_all" policy queried team_members inside itself,
-- creating an infinite loop. Replace with non-recursive policies.

DROP POLICY IF EXISTS "team_member_read_all" ON team_members;
DROP POLICY IF EXISTS "architecture_lead_manages_team" ON team_members;
DROP POLICY IF EXISTS "architecture_lead_full_access" ON team_members;
DROP POLICY IF EXISTS "users_read_own_profile" ON team_members;
DROP POLICY IF EXISTS "deny_anon" ON team_members;

-- Simple non-recursive policies for team_members
CREATE POLICY "deny_anon_team" ON team_members FOR ALL USING (auth.uid() IS NULL);
CREATE POLICY "auth_read_team" ON team_members FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "arch_lead_manage_team" ON team_members FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM team_members WHERE role = 'architecture_lead'));
CREATE POLICY "arch_lead_update_team" ON team_members FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM team_members WHERE role = 'architecture_lead'));
CREATE POLICY "arch_lead_delete_team" ON team_members FOR DELETE USING (auth.uid() IN (SELECT user_id FROM team_members WHERE role = 'architecture_lead'));

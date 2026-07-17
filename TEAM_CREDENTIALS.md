# Team Credentials — Smart Eco-Pharma Hub

**Generated:** 2026-07-16
**Project:** Smart Eco-Pharma Hub Backend
**Supabase Project:** https://drzrxfmrxiitopjamchh.supabase.co

---

## Auth Users — Login Credentials

| Name | Email | Password | Role | Status |
|---|---|---|---|---|
| Ahmed El-Desouky | `ahmed.320240024@ejust.edu.eg` | `Ahmed@2026!Pharma` | technical_lead | CREATED |
| Eman Ayman | `eman.720240043@ejust.edu.eg` | `Eman@2026!Pharma` | qc_lead | PENDING |
| Fatma Mohamed | `fatma.420240179@ejust.edu.eg` | `Fatma@2026!Pharma` | pharmacist | PENDING |
| Dr. Mohamed Ibrahim | `mohammad.elkhouly@ejust.edu.eg` | `Mohamed@2026!Pharma` | pharmacovigilance | PENDING |
| Fagr | `fagr.120250098@ejust.edu.eg` | `Fagr@2026!Pharma` | iot_engineer | PENDING |
| Zeina Wael | `zaina.320230019@ejust.edu.eg` | `Zaina@2026!Pharma` | pharmacist | PENDING |

---

## Setup Instructions

### Step 1: Create Auth Users in Supabase Dashboard

Go to: https://supabase.com/dashboard/project/drzrxfmrxiitopjamchh/auth/users

Click "Add user" for each person with the email and password above.

**Ahmed is already created.** Skip him.

### Step 2: Run SQL to Insert team_members

Go to: https://supabase.com/dashboard/project/drzrxfmrxiitopjamchh/sql-editor

```sql
INSERT INTO team_members (id, email, full_name, role)
SELECT id, email, raw_user_meta_data->>'full_name',
  (CASE email
    WHEN 'ahmed.320240024@ejust.edu.eg' THEN 'technical_lead'
    WHEN 'eman.720240043@ejust.edu.eg' THEN 'qc_lead'
    WHEN 'fatma.420240179@ejust.edu.eg' THEN 'pharmacist'
    WHEN 'mohammad.elkhouly@ejust.edu.eg' THEN 'pharmacovigilance'
    WHEN 'fagr.120250098@ejust.edu.eg' THEN 'iot_engineer'
    WHEN 'zaina.320230019@ejust.edu.eg' THEN 'pharmacist'
  END)::team_role
FROM auth.users
WHERE email IN (
  'ahmed.320240024@ejust.edu.eg',
  'eman.720240043@ejust.edu.eg',
  'fatma.420240179@ejust.edu.eg',
  'mohammad.elkhouly@ejust.edu.eg',
  'fagr.120250098@ejust.edu.eg',
  'zaina.320230019@ejust.edu.eg'
)
ON CONFLICT (id) DO NOTHING;
```

### Step 3: Verify

```sql
SELECT full_name, email, role FROM team_members;
```

---

## Security Note

These passwords are for initial setup only. Each team member should change their password after first login.

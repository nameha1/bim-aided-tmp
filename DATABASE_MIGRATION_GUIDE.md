# Supabase Database Setup Instructions

## 🚨 IMPORTANT: Run these migrations in Supabase Studio SQL Editor

Your Supabase instance is at:
**http://bimaided-website-pre0225supabase-ec4f00-72-60-222-97.traefik.me**

---

## Step 1: Run Migration 15 - Fix Infinite Recursion (URGENT)

This fixes the "infinite recursion detected in policy for relation 'employees'" error.

```sql
-- Copy and paste the entire content of:
-- supabase/migrations/15_fix_infinite_recursion.sql
```

**Expected result:** All RLS policies will be updated to use the security definer function.

---

## Step 2: Run Migration 16 - Add Job Applications Table

This fixes the 404 error on `/rest/v1/job_applications`.

```sql
-- Copy and paste the entire content of:
-- supabase/migrations/16_add_job_applications.sql
```

**Expected result:** A new `job_applications` table will be created.

---

## Step 3: Verify Tables Exist

Run this query to check all tables:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**You should see these 15 tables:**
1. attendance
2. career_postings
3. contact_inquiries
4. departments
5. designations
6. documents
7. emergency_contacts
8. employees
9. ip_whitelist
10. job_applications ← NEW
11. leave_balances
12. project_assignments
13. projects
14. salaries
15. user_roles

---

## Step 4: Create Sample Departments and Designations

Before adding employees, you need at least one department and designation:

```sql
-- Add Departments
INSERT INTO departments (name, description) VALUES 
  ('Architecture', 'Architectural design and BIM modeling'),
  ('Engineering', 'Structural and MEP engineering'),
  ('VDC', 'Virtual Design and Construction'),
  ('Human Resources', 'HR and administration'),
  ('Management', 'Project and business management');

-- Add Designations
INSERT INTO designations (name, level, department_id) VALUES 
  ('BIM Manager', 'Senior', (SELECT id FROM departments WHERE name = 'Architecture' LIMIT 1)),
  ('Senior Architect', 'Senior', (SELECT id FROM departments WHERE name = 'Architecture' LIMIT 1)),
  ('BIM Modeler', 'Mid', (SELECT id FROM departments WHERE name = 'Architecture' LIMIT 1)),
  ('Revit Technician', 'Junior', (SELECT id FROM departments WHERE name = 'Architecture' LIMIT 1)),
  ('Structural Engineer', 'Senior', (SELECT id FROM departments WHERE name = 'Engineering' LIMIT 1)),
  ('MEP Engineer', 'Mid', (SELECT id FROM departments WHERE name = 'Engineering' LIMIT 1)),
  ('VDC Coordinator', 'Mid', (SELECT id FROM departments WHERE name = 'VDC' LIMIT 1)),
  ('HR Manager', 'Senior', (SELECT id FROM departments WHERE name = 'Human Resources' LIMIT 1)),
  ('Project Manager', 'Senior', (SELECT id FROM departments WHERE name = 'Management' LIMIT 1));

-- Verify
SELECT d.name as department, ds.name as designation, ds.level
FROM designations ds
JOIN departments d ON ds.department_id = d.id
ORDER BY d.name, ds.level DESC;
```

---

## Step 5: Create Your First Admin User

### Option A: Create via Supabase Dashboard (Recommended)

1. Go to: **Authentication** → **Users** → **Add User**
2. Fill in:
   - Email: `your-admin@bimaided.com`
   - Password: Create a strong password
   - Auto Confirm User: ✅ Checked
3. Click **Create User**
4. Copy the **User ID** (UUID)
5. Run this SQL to complete admin setup:

```sql
-- Replace 'USER_UUID_HERE' with the actual UUID from step 4
INSERT INTO employees (
  user_id, 
  first_name, 
  last_name, 
  email,
  employment_status,
  joining_date,
  department_id,
  designation_id
) VALUES (
  'USER_UUID_HERE',  -- ← Replace this
  'Admin',
  'User',
  'your-admin@bimaided.com',  -- ← Replace with your email
  'Active',
  CURRENT_DATE,
  (SELECT id FROM departments WHERE name = 'Management' LIMIT 1),
  (SELECT id FROM designations WHERE name = 'Project Manager' LIMIT 1)
);

-- Assign admin role
INSERT INTO user_roles (user_id, role) 
VALUES ('USER_UUID_HERE', 'admin');  -- ← Replace USER_UUID_HERE

-- Verify admin setup
SELECT 
  e.first_name, 
  e.last_name, 
  e.email,
  ur.role,
  d.name as department,
  ds.name as designation
FROM employees e
JOIN user_roles ur ON e.user_id = ur.user_id
JOIN departments d ON e.department_id = d.id
JOIN designations ds ON e.designation_id = ds.id
WHERE ur.role = 'admin';
```

### Option B: Create via SQL (Alternative)

If you prefer to do everything in SQL:

```sql
-- This requires you to hash the password manually
-- It's easier to use the Dashboard method above
```

---

## Step 6: Test Your Setup

1. **Test Login**: Go to your deployed app and login with the admin credentials
2. **Test Employee List**: The infinite recursion error should be gone
3. **Test Add Employee**: Try adding a new employee through the UI

---

## Step 7: Create Storage Buckets (Optional - for file uploads)

Run this SQL to create storage buckets:

```sql
-- Create buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('employee-photos', 'employee-photos', true),
  ('employee-documents', 'employee-documents', false),
  ('project-images', 'project-images', true),
  ('leave-attachments', 'leave-attachments', false);

-- Storage policies for employee-photos (public read, authenticated write)
CREATE POLICY "Public can view employee photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'employee-photos');

CREATE POLICY "Authenticated users can upload employee photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'employee-photos');

-- Storage policies for employee-documents (employees can view own)
CREATE POLICY "Employees can view own documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'employee-documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Employees can upload own documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'employee-documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policies for project-images (public read, admin write)
CREATE POLICY "Public can view project images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'project-images');

CREATE POLICY "Admin can upload project images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'project-images'
  );

-- Storage policies for leave-attachments (employees can manage own)
CREATE POLICY "Employees can view own leave attachments"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'leave-attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Employees can upload leave attachments"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'leave-attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

---

## ✅ Checklist

- [ ] Run migration 15 (fix infinite recursion)
- [ ] Run migration 16 (add job_applications table)
- [ ] Verify all 15 tables exist
- [ ] Create departments and designations
- [ ] Create admin user via Dashboard
- [ ] Complete admin setup SQL
- [ ] Test login with admin credentials
- [ ] Test adding a new employee
- [ ] (Optional) Create storage buckets

---

## 🐛 Troubleshooting

### Error: "infinite recursion detected"
→ Run migration 15 again

### Error: "relation 'job_applications' does not exist"
→ Run migration 16

### Can't login with admin account
→ Check user_roles table: `SELECT * FROM user_roles WHERE role = 'admin';`

### Can't add employees
→ Make sure you have at least one department and designation

---

## 📝 Notes

- **ANON_KEY Security**: Your current ANON_KEY is a demo key. For production, generate a new one in Supabase settings.
- **Password Policy**: Minimum 6 characters required. Consider adding password strength requirements.
- **Employee IDs (EID)**: Optional but recommended for employee login. Format: EMP001, BIM-2024-001, etc.


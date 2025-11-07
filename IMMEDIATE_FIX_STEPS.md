# IMMEDIATE FIX - Career Page Upload Error

## The Problem
You're getting these errors:
1. ❌ `Bucket not found` - Storage bucket 'cvs' doesn't exist
2. ❌ `400 Bad Request on job_applications` - Table doesn't exist

## THE FIX (Do this NOW - 3 minutes)

### Step 1: Create the job_applications table

1. Open Supabase Dashboard: http://supabasekong-i480ws8cosk4kwkskssck8o8.72.60.222.97.sslip.io
2. Click **SQL Editor** in left sidebar
3. Click **New Query**
4. Copy and paste this entire code:

```sql
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_posting_id UUID,
    applicant_name VARCHAR(255) NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,
    applicant_phone VARCHAR(50) NOT NULL,
    cv_url TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES employees(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit job applications"
    ON job_applications FOR INSERT
    TO public WITH CHECK (true);

CREATE POLICY "Admins can view all applications"
    ON job_applications FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
    );
```

5. Click **RUN** (or press Cmd+Enter)
6. Should see "Success. No rows returned"

### Step 2: Create the 'cvs' storage bucket

**IMPORTANT: Buckets MUST be created via Dashboard UI, not SQL!**

1. In Supabase Dashboard, click **Storage** in left sidebar
2. Click **Create a new bucket** button (green button)
3. Fill in the form:
   - **Bucket name**: `cvs` (must be exactly this, lowercase)
   - **Public bucket**: ❌ **UNCHECK** (keep CVs private!)
   - Click **Save** or **Create bucket**

### Step 3: Add storage policies for 'cvs' bucket

1. Still in Storage section, click on the **cvs** bucket you just created
2. Click **Policies** tab at the top
3. Click **New Policy**
4. Select **For full customization**
5. Paste this policy (Policy 1 - Allow uploads):

```sql
CREATE POLICY "Anyone can upload CVs"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'cvs');
```

6. Click **Review** → **Save policy**
7. Click **New Policy** again
8. Paste this policy (Policy 2 - Admin view):

```sql
CREATE POLICY "Admins can view CVs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'cvs' AND
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);
```

9. Click **Review** → **Save policy**

### Step 4: TEST IT

1. Go back to your Career page
2. Fill out the form
3. Attach a CV (PDF or Word doc)
4. Click Submit
5. Should work! ✅

## Verification

After setup, check:

1. **Table exists**: 
   - Go to **Table Editor** → should see `job_applications` table

2. **Bucket exists**: 
   - Go to **Storage** → should see `cvs` bucket (with lock icon = private)

3. **Policies exist**: 
   - Click on `cvs` bucket → **Policies** tab
   - Should see 2 policies listed

4. **Test upload**: 
   - Submit a job application
   - Check `cvs` bucket → should see the uploaded file
   - Check `job_applications` table → should see the new row

## Still Getting Errors?

### "Bucket not found"
- Make sure bucket name is exactly `cvs` (lowercase, no spaces)
- Check that bucket is visible in Storage section

### "New row violates row-level security policy"
- Make sure you created the INSERT policy
- Policy should be `TO public` (not `TO authenticated`)

### "400 Bad Request"
- Check browser console for exact error message
- Verify table columns match the form data

## Quick Checklist

- [ ] Created `job_applications` table
- [ ] Created `cvs` storage bucket (via Dashboard UI)
- [ ] Added "Anyone can upload CVs" policy
- [ ] Added "Admins can view CVs" policy
- [ ] Tested job application submission
- [ ] Verified file appears in bucket
- [ ] Verified row appears in table

## Optional: Create project-images bucket too

While you're at it, create the `project-images` bucket for project photos:

1. **Storage** → **Create a new bucket**
2. **Name**: `project-images`
3. **Public**: ✅ **CHECK THIS** (images need to be public)
4. Add policies (copy from `STORAGE_SETUP_GUIDE.md`)

This will let you upload project images later!

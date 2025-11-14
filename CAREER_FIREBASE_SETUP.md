# Career & Job Application Firebase Setup

## ✅ Completed Migration

The career posting and job application system has been successfully migrated from Supabase to Firebase (Firestore) and Cloudflare R2.

## Firestore Collections

### 1. `job_postings`
Stores career/job posting information.

**Fields:**
- `title` (string) - Job title
- `department` (string, optional) - Department name
- `location` (string) - Job location
- `employment_type` (string) - Type: full_time, part_time, contract, internship
- `description` (string) - Job description
- `requirements` (string, optional) - Job requirements
- `salary_range` (string, optional) - Salary range
- `status` (string) - Status: active, draft, closed
- `created_at` (timestamp) - Auto-generated timestamp

**Indexes Required:**
```json
{
  "collectionGroup": "job_postings",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "created_at", "order": "DESCENDING" }
  ]
}
```

### 2. `job_applications`
Stores job applications from candidates.

**Fields:**
- `job_posting_id` (string, optional) - Reference to job posting ID
- `job_title` (string) - Job title applied for
- `applicant_name` (string) - Candidate's full name
- `applicant_email` (string) - Candidate's email
- `applicant_phone` (string) - Candidate's phone number
- `cv_url` (string) - URL to uploaded CV in Cloudflare R2
- `status` (string) - Status: pending, reviewing, shortlisted, rejected, accepted
- `created_at` (timestamp) - Auto-generated timestamp

**Indexes Required:**
```json
{
  "collectionGroup": "job_applications",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "created_at", "order": "DESCENDING" }
  ]
}
```

## File Storage

CVs/Resumes are stored in **Cloudflare R2** storage bucket under the path:
- `applications/{timestamp}_{applicant_name}.{ext}`

Example: `applications/1699999999999_John_Doe.pdf`

Files are uploaded via the `/api/upload` endpoint and stored in the R2 bucket with public access for admin review.

## Components Updated

### Frontend Components:
1. **`/app/career/page.tsx`** - Career page that fetches active job postings from Firestore
2. **`/components/JobApplicationDialog.tsx`** - Job application form that uploads CV to R2 and saves to Firestore
3. **`/components/JobDetailsDialog.tsx`** - Displays detailed job information

### Admin Components:
1. **`/components/admin/CareerManager.tsx`** - Admin interface to manage job postings (CRUD operations)
2. **`/components/admin/ApplicationManager.tsx`** - Admin interface to view and manage job applications

## Features

### Public-Facing Features:
- ✅ View active job postings
- ✅ Apply to jobs with CV upload (PDF/Word, max 5MB)
- ✅ View detailed job descriptions
- ✅ Responsive mobile design

### Admin Features:
- ✅ Create/Edit/Delete job postings
- ✅ Set posting status (active/draft/closed)
- ✅ View all job applications
- ✅ Filter applications by status and job
- ✅ Update application status (pending → reviewing → shortlisted → rejected/accepted)
- ✅ Download/View candidate CVs
- ✅ Delete applications

## Security Rules

Add these Firestore security rules:

```javascript
// Job Postings - Public read for active, admin write
match /job_postings/{postingId} {
  allow read: if resource.data.status == 'active' || 
                 request.auth != null && get(/databases/$(database)/documents/employees/$(request.auth.uid)).data.role == 'admin';
  allow create, update, delete: if request.auth != null && 
                                    get(/databases/$(database)/documents/employees/$(request.auth.uid)).data.role == 'admin';
}

// Job Applications - Anyone can create, admin can read/update/delete
match /job_applications/{applicationId} {
  allow create: if true; // Anyone can apply
  allow read, update, delete: if request.auth != null && 
                                  get(/databases/$(database)/documents/employees/$(request.auth.uid)).data.role == 'admin';
}
```

## Deployment Steps

1. **Deploy Firestore Indexes:**
   ```bash
   firebase deploy --only firestore:indexes
   ```

2. **Verify R2 Upload API:**
   Ensure the `/api/upload` endpoint is working and has R2 credentials configured.

3. **Test the Flow:**
   - Create a test job posting from admin panel
   - Submit a test application
   - Verify CV uploads to R2
   - Check application appears in admin panel

## Notes

- CV files are kept in R2 storage even when applications are deleted from Firestore (for record-keeping)
- The system falls back to static job postings if Firestore fetch fails
- All timestamps use Firestore server timestamp for consistency
- Application status workflow: pending → reviewing → shortlisted → rejected/accepted

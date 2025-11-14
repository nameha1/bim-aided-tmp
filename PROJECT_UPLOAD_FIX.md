# PROJECT UPLOAD FIX - Complete Guide

## Issues Identified

### 1. ❌ Missing Firestore Index
**Error**: `The query requires an index`
**Impact**: Cannot fetch projects from Firestore with ordering

### 2. ❌ Image Upload Failing (500 Error)
**Error**: `/api/upload-image` returns 500
**Impact**: Cannot upload project images to R2 storage

### 3. ⚠️ Potential Firebase Project Mismatch
**Notice**: Error shows `bimaided-b4447` but `.env.local` has `bimaided-8389d`

---

## ✅ FIXES APPLIED

### 1. Updated Firestore Indexes (`firestore.indexes.json`)
Added required indexes for projects collection:

```json
{
  "collectionGroup": "projects",
  "fields": [
    { "fieldPath": "published", "order": "ASCENDING" },
    { "fieldPath": "created_at", "order": "DESCENDING" }
  ]
},
{
  "collectionGroup": "projects",
  "fields": [
    { "fieldPath": "published", "order": "ASCENDING" },
    { "fieldPath": "category", "order": "ASCENDING" },
    { "fieldPath": "created_at", "order": "DESCENDING" }
  ]
}
```

### 2. Fixed R2 Storage Configuration (`lib/storage/minio-client.ts`)
- Fixed endpoint parsing to properly remove protocol
- Prioritized Cloudflare R2 environment variables
- Fixed SSL configuration logic

### 3. Enhanced Error Logging
Updated files with detailed logging:
- `/app/api/upload-image/route.ts` - Logs upload process step-by-step
- `/lib/storage/minio.ts` - Logs R2 operations with details
- `/lib/storage/minio-client.ts` - Better configuration logging

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Deploy Firestore Indexes

**Option A - Firebase CLI (Recommended)**:
```bash
# Install Firebase CLI if needed
npm install -g firebase-tools

# Login
firebase login

# Deploy indexes
firebase deploy --only firestore:indexes
```

**Option B - Manual via Console**:
1. Click the link in the error message (it will take you directly to create the index)
2. OR go to: https://console.firebase.google.com/project/bimaided-8389d/firestore/indexes
3. Create the indexes as shown in `FIRESTORE_INDEXES_PROJECTS.md`

**Option C - Use the error link**:
The console error has a direct link - just click it and click "Create Index"

⏱️ **Wait 1-2 minutes** for indexes to build

### Step 2: Test R2 Connection

```bash
# Run the test script
node test-r2-connection.cjs
```

Expected output:
```
✅ MinIO client initialized
✅ Buckets found: 1
✅ Bucket "bimaided" exists
✅ Test file uploaded
🎉 All tests passed!
```

If it fails, the script will show specific error messages and fixes.

### Step 3: Restart Development Server

```bash
# Stop current server (Ctrl+C)

# Clear Next.js cache
rm -rf .next

# Restart
npm run dev
```

### Step 4: Test Project Upload

1. Navigate to: `http://localhost:3000/admin/projects`
2. Click "Add New Project"
3. Fill in all fields:
   - Project name
   - Client name
   - Location
   - Category (select from dropdown)
   - Description
   - Project area
   - Completion year
4. **Upload an image** (this is where the error occurred)
5. Toggle "Published" to true
6. Click "Add Project"

### Step 5: Check Logs

**Browser Console** should show:
```
[Landing Page] Fetching featured projects from Firestore...
[Landing Page] ✅ Fetched from Firestore: X projects
```

**Terminal** (where Next.js runs) should show:
```
[Upload API] Starting upload request...
[Upload API] File: image.jpg Size: 123456 Folder: public/uploads
[R2] Starting upload: ...
[R2] Upload successful: { url: '...', path: '...' }
```

---

## 🔍 TROUBLESHOOTING

### If Indexes Still Fail

1. **Check Firebase Project ID**:
   ```bash
   # In .env.local, verify:
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=bimaided-8389d
   ```
   
2. **The error showed `bimaided-b4447`** - if you have multiple Firebase projects, make sure you're using the correct one

3. **Deploy to correct project**:
   ```bash
   firebase use bimaided-8389d
   firebase deploy --only firestore:indexes
   ```

### If R2 Upload Still Fails

1. **Check R2 credentials in Cloudflare Dashboard**:
   - Go to: https://dash.cloudflare.com
   - R2 → Manage R2 API Tokens
   - Verify token has "Admin Read & Write" permissions
   - Copy exact credentials (no extra spaces)

2. **Create new API token if needed**:
   - Delete old token
   - Create new with Admin Read & Write
   - Update `.env.local` with new credentials

3. **Verify bucket configuration**:
   - R2 → Buckets → bimaided
   - Check "Public access" is enabled
   - Note the public URL matches `.env.local`

4. **Check server logs** for specific error:
   ```
   [R2] Error details: { message: '...', code: '...', statusCode: ... }
   ```

### Common R2 Error Codes

| Error Code | Meaning | Fix |
|------------|---------|-----|
| `InvalidAccessKeyId` | Wrong access key | Create new API token |
| `SignatureDoesNotMatch` | Wrong secret key | Double-check secret key |
| `NoSuchBucket` | Bucket doesn't exist | Verify bucket name is `bimaided` |
| `AccessDenied` | Insufficient permissions | Use Admin Read & Write token |
| `ENOTFOUND` | Cannot reach endpoint | Check internet & endpoint URL |

---

## 📁 FILES MODIFIED

### Configuration Files
- ✅ `firestore.indexes.json` - Added projects indexes
- ✅ `lib/storage/minio-client.ts` - Fixed R2 configuration

### API & Storage
- ✅ `app/api/upload-image/route.ts` - Enhanced logging
- ✅ `lib/storage/minio.ts` - Enhanced logging

### Documentation (New)
- ✅ `FIRESTORE_INDEXES_PROJECTS.md` - Index deployment guide
- ✅ `R2_UPLOAD_TROUBLESHOOTING.md` - R2 troubleshooting
- ✅ `test-r2-connection.cjs` - R2 connection test script
- ✅ `PROJECT_UPLOAD_FIX.md` - This file

---

## ✅ VERIFICATION CHECKLIST

Before testing:
- [ ] Firestore indexes deployed and built (1-2 min wait)
- [ ] R2 connection test passed (`node test-r2-connection.cjs`)
- [ ] Development server restarted with cache cleared
- [ ] `.env.local` has correct Firebase project ID
- [ ] `.env.local` has correct R2 credentials

During testing:
- [ ] Can access admin projects page
- [ ] Can see the "Add Project" button
- [ ] Form fields are accessible
- [ ] Image upload button works
- [ ] No console errors about indexes
- [ ] Upload shows progress/success

After testing:
- [ ] Project appears in the projects list
- [ ] Image is visible in the project card
- [ ] Image URL is from R2 (contains `r2.dev`)
- [ ] Project data is in Firestore (check Firebase console)

---

## 🆘 NEED MORE HELP?

1. **Run the R2 test**: `node test-r2-connection.cjs`
2. **Check server terminal** for detailed error logs
3. **Check browser console** for client-side errors
4. **Share specific error messages** from:
   - Server terminal (`[Upload API]` or `[R2]` logs)
   - Browser console
   - Firebase Console (if index creation failed)

---

## 🎯 EXPECTED OUTCOME

After completing all steps:

1. ✅ Projects page loads without index errors
2. ✅ Can create new projects with all fields
3. ✅ Image upload works and returns R2 URL
4. ✅ Projects appear on the homepage
5. ✅ Images load correctly from R2 CDN

---

## 📞 Quick Commands Reference

```bash
# Deploy indexes
firebase deploy --only firestore:indexes

# Test R2 connection
node test-r2-connection.cjs

# Clear cache and restart
rm -rf .next && npm run dev

# Check Firebase project
firebase projects:list

# Switch Firebase project
firebase use bimaided-8389d
```

Good luck! 🚀

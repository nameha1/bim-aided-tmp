# Career Posting Fix - Index Creation Required

## ✅ Completed
1. Fixed Firestore helper functions to use `created_at` instead of `createdAt`
2. Migrated all existing job postings to have `created_at` field

## ⚠️ Action Required: Create Firestore Index

The career postings query requires a composite index. You need to create it in Firebase Console:

### Option 1: Click the Auto-Generated Link
Click this link to automatically create the index:
https://console.firebase.google.com/v1/r/project/bimaided-8389d/firestore/indexes?create_composite=ClNwcm9qZWN0cy9iaW1haWRlZC04Mzg5ZC9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvam9iX3Bvc3RpbmdzL2luZGV4ZXMvXxABGgoKBnN0YXR1cxABGg4KCmNyZWF0ZWRfYXQQAhoMCghfX25hbWVfXxAC

### Option 2: Manual Creation
1. Go to: https://console.firebase.google.com/project/bimaided-8389d/firestore/indexes
2. Click "Create Index"
3. Set:
   - Collection: `job_postings`
   - Fields:
     - `status` - Ascending
     - `created_at` - Descending
   - Query scope: Collection
4. Click "Create"

### Wait Time
After creating the index, it may take **1-5 minutes** to build. You'll see it say "Building..." in the Firebase Console.

## Testing After Index Creation

Once the index is ready:
1. Go to the admin panel → Career section
2. Create a new job posting
3. It should immediately appear in the list
4. Go to the frontend career page
5. Active postings should be visible

## What Was Fixed

**Problem:** Career postings were disappearing after creation

**Root Cause:** 
- Firestore helper functions used `createdAt` (camelCase)
- Career queries expected `created_at` (snake_case)
- Missing Firestore composite index for the query

**Solution:**
- Updated all Firestore helper functions to use snake_case
- Migrated existing data
- Created index (you need to approve in console)

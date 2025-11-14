# Firestore Indexes for Projects - Required Setup

## Issue
The projects query requires composite indexes to work properly. Without these indexes, the app cannot fetch projects with filtering and ordering.

## Error Message
```
FirebaseError: The query requires an index. You can create it here: [Firebase Console Link]
```

## Solution

### Option 1: Deploy Indexes via Firebase CLI (Recommended)

1. **Install Firebase CLI** (if not already installed):
```bash
npm install -g firebase-tools
```

2. **Login to Firebase**:
```bash
firebase login
```

3. **Initialize Firebase** (if not done):
```bash
firebase init firestore
```
- Select your project: `bimaided-8389d` (NOT bimaided-b4447)
- Accept the default firestore.rules
- Accept the default firestore.indexes.json

4. **Deploy the indexes**:
```bash
firebase deploy --only firestore:indexes
```

### Option 2: Create Indexes Manually via Console

1. Go to: https://console.firebase.google.com/project/bimaided-8389d/firestore/indexes

2. Click "Add Index" and create these indexes:

#### Index 1: Projects by published + created_at
- **Collection ID**: `projects`
- **Fields**:
  - `published` (Ascending)
  - `created_at` (Descending)
- **Query scope**: Collection

#### Index 2: Projects by published + category + created_at
- **Collection ID**: `projects`
- **Fields**:
  - `published` (Ascending)
  - `category` (Ascending)
  - `created_at` (Descending)
- **Query scope**: Collection

### Option 3: Click the Error Link

The error message includes a direct link to create the index. Simply:
1. Click the link in the browser console error
2. Click "Create Index"
3. Wait for the index to build (usually 1-2 minutes)

## Verification

After creating the indexes:
1. Wait 1-2 minutes for indexes to build
2. Refresh your application
3. Projects should load without errors

## Current Index Configuration

The `firestore.indexes.json` file has been updated to include:
- Projects indexes for published + created_at
- Projects indexes for published + category + created_at
- All existing leave_requests, employees, holidays, and attendance indexes

## Notes
- Indexes may take a few minutes to build after deployment
- Make sure you're deploying to the correct Firebase project (`bimaided-8389d`)
- The error showed `bimaided-b4447` which might indicate a project mismatch

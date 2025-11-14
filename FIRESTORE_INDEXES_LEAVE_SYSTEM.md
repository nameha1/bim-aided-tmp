# Firestore Indexes Required for Leave Approval System

The leave approval system requires composite indexes in Firestore for efficient querying.

## Required Indexes

### 1. Leave Requests - Status + Created At
**Collection:** `leave_requests`
**Fields:**
- `status` (Ascending)
- `created_at` (Descending)

### 2. Leave Requests - Supervisor ID + Status + Created At
**Collection:** `leave_requests`
**Fields:**
- `supervisor_id` (Ascending)
- `status` (Ascending)
- `created_at` (Descending)

### 3. Leave Requests - Supervisor ID + Created At
**Collection:** `leave_requests`
**Fields:**
- `supervisor_id` (Ascending)
- `created_at` (Descending)

## How to Create These Indexes

### Option 1: Use Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Firestore Database** → **Indexes** tab
4. Click **Create Index**
5. Create each index with the fields listed above

### Option 2: Use the Error Link

When you see the error in your browser console, Firebase provides a direct link to create the index. Click that link and it will auto-populate the index creation form.

### Option 3: Deploy via firestore.indexes.json

Create a file `firestore.indexes.json` in your project root:

```json
{
  "indexes": [
    {
      "collectionGroup": "leave_requests",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "created_at",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "leave_requests",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "supervisor_id",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "created_at",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "leave_requests",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "supervisor_id",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "created_at",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Then deploy using Firebase CLI:
```bash
firebase deploy --only firestore:indexes
```

## Temporary Workaround

While the indexes are being created (takes 5-10 minutes), you can temporarily modify the queries to work without indexes by removing the `orderBy`:

**In `/Users/tasneemzaman/Desktop/BIM-AIDED/app/api/leave-requests/route.ts`:**
- Comment out `.orderBy("created_at", "desc")`
- Sort in JavaScript after fetching

**Note:** This is just temporary! Once indexes are created, re-enable the orderBy for better performance.

## Index Creation Time

- Simple indexes: ~2-5 minutes
- Complex indexes: ~5-10 minutes
- You'll receive an email when indexes are ready

## Verification

Once created, you can verify indexes are active:
1. Firebase Console → Firestore → Indexes tab
2. Status should show "Enabled" (green checkmark)

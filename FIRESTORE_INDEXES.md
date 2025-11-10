# Firestore Index Configuration
# This file is used to define composite indexes for Firestore queries

# To create these indexes, you can either:
# 1. Click on the error link in the console to create them automatically
# 2. Use Firebase CLI: firebase deploy --only firestore:indexes
# 3. Manually create them in Firebase Console

## Required Indexes:

### Employees Collection
# For queries that filter by status and order by name
- Collection: employees
  Fields:
    - status (Ascending)
    - name (Ascending)

# For queries that filter by status and order by created_at
- Collection: employees
  Fields:
    - status (Ascending)
    - created_at (Descending)

### Leave Requests Collection
# For queries that filter by employee and status
- Collection: leave_requests
  Fields:
    - employee_id (Ascending)
    - status (Ascending)

# For queries that filter by status and order by date
- Collection: leave_requests
  Fields:
    - status (Ascending)
    - start_date (Ascending)

### Assignments Collection
# For queries that filter by status and order by date
- Collection: assignments
  Fields:
    - status (Ascending)
    - created_at (Descending)

### Payroll Collection
# For queries that filter by month/year
- Collection: payroll
  Fields:
    - month (Ascending)
    - year (Ascending)

### Attendance Collection
# For queries that filter by employee and date range
- Collection: attendance
  Fields:
    - employee_id (Ascending)
    - date (Ascending)

---

## How to Create Indexes:

### Option 1: Automatic (Recommended)
When you see an error like "The query requires an index", click the provided link in the error message. It will take you directly to Firebase Console with the index pre-configured.

### Option 2: Firebase CLI
1. Install Firebase CLI: npm install -g firebase-tools
2. Login: firebase login
3. Initialize: firebase init firestore
4. Deploy: firebase deploy --only firestore:indexes

### Option 3: Manual in Firebase Console
1. Go to: https://console.firebase.google.com/project/bimaided-b4447/firestore/indexes
2. Click "Create Index"
3. Add the fields as specified above
4. Click "Create"

---

Note: For the current implementation, we've optimized queries to avoid requiring indexes by:
- Fetching all documents and filtering/sorting in JavaScript
- This works well for small datasets (< 1000 documents)
- For larger datasets, consider creating the indexes above for better performance

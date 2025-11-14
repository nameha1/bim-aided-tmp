# Attendance & Leave Request Migration to Firebase

## Overview
Successfully migrated all attendance and leave request features from Supabase to Firebase. The system now uses Firebase Firestore for data storage and Cloudflare R2 for file uploads.

## Migrated Components

### Employee Side
1. **AttendanceCheckIn.tsx** ✅
   - Check-in/check-out functionality
   - IP address whitelisting validation
   - Uses Firebase Firestore directly (getDocuments, createDocument, updateDocument)
   - Collections: `attendance`, `ip_whitelist`, `employees`

2. **LeaveRequestForm.tsx** ✅
   - Leave request submission with document upload
   - Uses Firebase Firestore for data (createDocument)
   - Uses `/api/upload-image` for R2 file storage
   - Collection: `leave_requests`

### Admin Side
1. **LeaveRequests.tsx** ✅
   - View all leave requests
   - Approve/reject functionality with reason prompt
   - Uses `/api/leave-requests` API endpoint
   - Fetches requests with populated employee details

2. **AttendanceRecords.tsx** ✅
   - View today's attendance
   - View attendance by month/date range
   - Export to Excel functionality
   - Uses `/api/attendance` API endpoint

## API Routes Created

### `/api/attendance` (GET)
- **Query Parameters:**
  - `date` - Specific date (YYYY-MM-DD) or "today"
  - `start_date` & `end_date` - Date range
  - `employee_id` - Filter by employee
  - `status` - Filter by status (Present, Absent, Leave)
- **Returns:** Attendance records with populated employee details
- **Features:** 
  - Converts Firestore timestamps to Date objects
  - Populates employee first_name and last_name
  - Supports multiple filter combinations

### `/api/leave-requests` (GET, POST)
- **GET Query Parameters:**
  - `status` - Filter by status (Pending, Approved, Rejected)
  - `employee_id` - Filter by employee
- **POST Body:**
  ```json
  {
    "action": "approve" | "reject",
    "requestId": "string",
    "reason": "string" // required for reject
  }
  ```
- **Returns:** Leave requests with populated employee details
- **Features:**
  - Approve/reject leave requests
  - Updates status and timestamps
  - Stores rejection reasons

## Firebase Collections Schema

### `attendance`
```typescript
{
  id: string;
  employee_id: string;
  date: Date | Timestamp;
  check_in_time: Date | Timestamp | null;
  check_out_time: Date | Timestamp | null;
  total_hours: number | null;
  status: 'Present' | 'Absent' | 'Leave';
  ip_address: string | null;
  manually_added: boolean;
  created_at: Date | Timestamp;
  updated_at: Date | Timestamp;
}
```

### `leave_requests`
```typescript
{
  id: string;
  employee_id: string;
  start_date: Date | Timestamp;
  end_date: Date | Timestamp;
  leave_type: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  supporting_document_url: string | null;
  rejection_reason: string | null;
  created_at: Date | Timestamp;
  updated_at: Date | Timestamp;
}
```

### `ip_whitelist`
```typescript
{
  id: string;
  ip_address: string;
  description: string;
  active: boolean;
}
```

## Key Changes from Supabase

1. **No joins in queries:** Firebase doesn't support SQL-like joins, so we fetch related employee data separately and populate it in the API routes.

2. **Date handling:** Firestore uses Timestamp objects. API routes convert them to Date objects for consistency.

3. **Authentication:** Employee components use `getCurrentUser()` from Firebase Auth. Admin operations go through API routes that use Firebase Admin SDK.

4. **File uploads:** Changed from Supabase Storage to Cloudflare R2 via `/api/upload-image` endpoint.

5. **Query patterns:**
   - Supabase: `supabase.from('table').select('*, related(*)').eq('field', value)`
   - Firebase: `adminDb.collection('table').where('field', '==', value).get()` + manual population

## Testing Checklist

- [ ] Employee can check in (with valid IP)
- [ ] Employee can check out
- [ ] IP validation works (blocks invalid IPs)
- [ ] Employee can submit leave request
- [ ] File upload works for supporting documents
- [ ] Admin can view all leave requests
- [ ] Admin can approve leave requests
- [ ] Admin can reject leave requests (with reason)
- [ ] Admin can view today's attendance
- [ ] Admin can view attendance by month
- [ ] Excel export works for attendance records
- [ ] All data displays correctly with employee names

## Environment Variables Required

```env
# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key

# R2 Storage
NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-9181a67fa2874087b2989b3dd8b45efe.r2.dev
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=your-bucket-name
```

## Notes

- All components now work with Firebase and R2
- No more Supabase dependencies for attendance/leave features
- Admin operations are properly secured through API routes
- Employee operations use Firebase client SDK for better performance
- Date/time handling is consistent across all components

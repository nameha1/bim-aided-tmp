# Two-Tier Leave Approval System - Implementation Summary

## Overview
The leave approval system now implements a two-tier workflow where leave requests must be approved by both the reporting manager (supervisor) and admin before being finalized.

## Workflow

### 1. Employee Submits Leave Request
- Employee fills out the leave request form with:
  - Start date and end date
  - Leave type (Sick, Casual, Earned, etc.)
  - Reason
  - Optional supporting document
- System automatically determines:
  - If employee has a supervisor → Status: `pending_supervisor`
  - If no supervisor → Status: `pending_admin` (goes directly to admin)

### 2. Supervisor Approval (First Tier)
**Location:** Employee Dashboard → "My Team" Tab → "Leave Approvals"

**Available to:** Employees who are reporting managers (have team members)

**Actions:**
- **Approve:** 
  - Sets `supervisor_approved = true`
  - Changes status to `pending_admin`
  - Forwards request to admin for final approval
  
- **Reject:**
  - Sets `supervisor_approved = false`
  - Changes status to `rejected`
  - Request is permanently rejected
  - Rejection reason is recorded

**Features:**
- View all leave requests from subordinates
- Separate sections for pending and processed requests
- Can view supporting documents
- Real-time status updates

### 3. Admin Approval (Second Tier)
**Location:** Admin Dashboard → "Leave Requests" Tab

**Available to:** Admin users only

**Actions:**
- **Approve:**
  - Sets `admin_approved = true`
  - Changes status to `approved`
  - Leave is finalized and granted
  
- **Reject:**
  - Sets `admin_approved = false`
  - Changes status to `rejected`
  - Rejection reason is recorded

**Filter Logic:**
- Admin only sees requests with status `pending_admin`
- This includes:
  - Requests already approved by supervisor
  - Requests from employees with no supervisor

## Database Fields

### leave_requests Collection
```javascript
{
  employee_id: string,          // Employee who requested leave
  supervisor_id: string | null, // Reporting manager (null if none)
  start_date: string,           // Leave start date
  end_date: string,             // Leave end date
  leave_type: string,           // Type of leave
  reason: string,               // Reason for leave
  supporting_document_url: string | null, // Uploaded document URL
  
  // Status Management
  status: string,               // "pending_supervisor" | "pending_admin" | "approved" | "rejected"
  
  // Supervisor Approval
  supervisor_approved: boolean,
  supervisor_approved_at: Date | null,
  supervisor_approved_by: string | null,
  
  // Admin Approval
  admin_approved: boolean,
  admin_approved_at: Date | null,
  admin_approved_by: string | null,
  
  // Rejection
  rejected_by: string | null,   // "supervisor" | "admin"
  rejection_reason: string | null,
  
  // Timestamps
  created_at: Date,
  updated_at: Date,
  approved_at: Date | null      // Final approval timestamp
}
```

## Status Flow

```
Employee Submits
       ↓
Has Supervisor? 
   ↙     ↘
 Yes      No
   ↓       ↓
pending_supervisor → pending_admin
   ↓                      ↓
Supervisor Reviews    Admin Reviews
   ↓                      ↓
Approve or Reject     Approve or Reject
   ↓                      ↓
If Approved → pending_admin
If Rejected → rejected (FINAL)
              ↓
          Admin Reviews
              ↓
       Approve or Reject
              ↓
       approved or rejected (FINAL)
```

## UI Components

### 1. LeaveRequestForm.tsx (Employee)
- Updated to capture `supervisor_id` from employee record
- Sets initial status based on whether employee has supervisor

### 2. SupervisorLeaveApprovals.tsx (Reporting Manager)
- **NEW COMPONENT**
- Shows leave requests from subordinates
- Approve/reject functionality
- Displays pending and processed requests separately
- Integrated into "My Team" tab

### 3. LeaveRequests.tsx (Admin)
- Updated to show only `pending_admin` requests
- Added "Supervisor Status" and "Admin Status" columns
- Shows full approval chain
- Filters out requests still pending supervisor approval

### 4. TeamOverview.tsx (Reporting Manager)
- Added "Leave Approvals" tab
- Integrates SupervisorLeaveApprovals component

## API Updates

### GET /api/leave-requests
**Query Parameters:**
- `admin_pending=true` - Returns only requests needing admin approval
- `status` - Filter by specific status
- `employee_id` - Filter by employee

### POST /api/leave-requests
**Actions:**
- `approve` - Approve request (admin level)
- `reject` - Reject request (admin level)

**Note:** Supervisor approvals are handled directly via Firestore in the component

## Benefits

1. **Clear Chain of Command**
   - Reporting managers approve first
   - Admin has final say

2. **Reduced Admin Burden**
   - Supervisors handle initial review
   - Admin only reviews pre-approved requests

3. **Better Accountability**
   - Tracks who approved/rejected at each level
   - Timestamps for all actions

4. **Flexibility**
   - Employees without supervisors go directly to admin
   - Supervisors can reject without admin involvement

5. **Transparency**
   - Employees can see status at each tier
   - Clear rejection reasons

## Testing Checklist

- [ ] Employee with supervisor submits leave → Goes to supervisor
- [ ] Employee without supervisor submits leave → Goes directly to admin
- [ ] Supervisor can approve → Moves to admin
- [ ] Supervisor can reject → Request ends as rejected
- [ ] Admin can approve supervisor-approved request → Request finalized as approved
- [ ] Admin can reject supervisor-approved request → Request finalized as rejected
- [ ] Status badges show correct states
- [ ] Notifications/emails sent at each stage (if implemented)
- [ ] Supporting documents accessible at all levels

## Future Enhancements

1. **Email Notifications**
   - Notify supervisor when employee submits
   - Notify admin when supervisor approves
   - Notify employee of decisions

2. **Leave Balance Integration**
   - Check available leave before approval
   - Deduct from balance on final approval

3. **Calendar Integration**
   - Show approved leaves on team calendar
   - Block out dates for scheduling

4. **Bulk Actions**
   - Approve multiple requests at once
   - Export leave reports

5. **Mobile Notifications**
   - Push notifications for pending approvals
   - Quick approve/reject from mobile

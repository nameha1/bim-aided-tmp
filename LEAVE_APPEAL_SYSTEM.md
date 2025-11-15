# Leave Request Appeal System

## Overview
The Leave Request Appeal System allows employees to appeal rejected leave requests, and enables reporting managers to review and respond to these appeals.

## Features Added

### 1. Employee Appeal Functionality
**Location:** Employee Dashboard → "Request Leave" Tab → Leave Request History

**Features:**
- **Appeal Button**: Appears on rejected leave requests that haven't been appealed yet
- **Appeal Dialog**: Clean interface to submit appeal with:
  - Display of original leave request details
  - Original reason for leave
  - Rejection reason from manager
  - Text area for appeal message
- **Appeal Status Tracking**: Shows whether appeal is pending, reviewed, or rejected

### 2. Manager Appeal Review
**Location:** Employee Dashboard (for managers) → "My Team" Tab → "Leave Approvals"

**New Section: "Leave Appeals"**
- Appears at the top of the leave approvals page (highlighted in red)
- Shows all rejected requests with pending appeals
- Displays:
  - Employee information
  - Leave type and date range
  - Original reason for leave
  - Rejection reason
  - Appeal message from employee
  - Supporting documents (if any)

**Manager Actions:**
1. **Reconsider**: Moves the request back to "Pending Supervisor" status for fresh review
2. **Reject Appeal**: Permanently rejects the appeal with additional reason

## Database Schema Updates

### New Fields in `leave_requests` Collection:

```typescript
{
  // ... existing fields ...
  
  // Appeal fields
  appeal_message: string | null,           // Employee's appeal message
  appeal_submitted_at: Date | null,        // When the appeal was submitted
  appeal_reviewed: boolean,                // Whether manager has reviewed the appeal
  appeal_reviewed_at: Date | null,         // When the appeal was reviewed
  appeal_rejection_reason: string | null   // Additional reason if appeal is rejected
}
```

## Workflow

### Employee Appeal Process:

1. **Submit Appeal**
   - Employee sees "Appeal" button on rejected leave requests
   - Clicks "Appeal" to open dialog
   - Reviews original request details and rejection reason
   - Writes appeal message explaining why request should be reconsidered
   - Submits appeal

2. **Appeal Status**
   - Status shows "Appeal Pending" badge
   - Appeal message is visible in the reason column
   - Cannot submit another appeal for the same request

### Manager Appeal Review Process:

1. **View Appeals**
   - Manager sees "Leave Appeals" section at top of approvals page
   - Section highlighted in red for visibility
   - Shows count of pending appeals

2. **Review Options**
   - **Reconsider**: 
     - Resets request status to "pending_supervisor"
     - Allows manager to approve or reject again
     - Marks appeal as reviewed
   - **Reject Appeal**:
     - Requires additional rejection reason
     - Permanently rejects the appeal
     - Marks appeal as reviewed
     - Employee cannot appeal again

## UI Components Modified

### 1. LeaveBalanceDisplay.tsx (Employee)
**Changes:**
- Added "Actions" column to leave history table
- Added "Appeal" button for rejected requests
- Created appeal dialog with form
- Added appeal status badges
- Shows appeal messages and responses in reason column

**New Imports:**
- Button, Textarea, Dialog components
- MessageCircle icon
- updateDocument function

### 2. SupervisorLeaveApprovals.tsx (Manager)
**Changes:**
- Added "Leave Appeals" section (new card at top)
- Filters requests to separate appeals from regular pending requests
- Added appeal-specific columns (original reason, rejection reason, appeal message)
- Added "Reconsider" and "Reject Appeal" actions
- Visual styling to highlight appeals section

## Benefits

### For Employees:
- **Voice**: Ability to explain circumstances or provide additional context
- **Transparency**: Clear view of why request was rejected
- **Second Chance**: Opportunity to have decision reconsidered
- **Status Tracking**: Can see appeal status in leave history

### For Managers:
- **Visibility**: Clearly see which requests have appeals
- **Context**: View all information (original + appeal) in one place
- **Flexibility**: Can reconsider or provide additional feedback
- **Priority**: Appeals appear at top for immediate attention

### For Organization:
- **Better Communication**: Reduces back-and-forth emails
- **Fairness**: Structured appeal process ensures consistency
- **Documentation**: All appeals and decisions tracked in system
- **Audit Trail**: Complete history of requests, rejections, and appeals

## Usage Examples

### Employee Scenario:
```
1. Employee submits sick leave request for emergency dental work
2. Manager rejects: "Insufficient notice for sick leave"
3. Employee appeals: "This was an emergency - tooth infection required immediate treatment. I have medical certificate."
4. Manager sees appeal, reviews medical certificate
5. Manager clicks "Reconsider"
6. Manager approves the request
```

### Manager Scenario:
```
1. Manager sees "Leave Appeals (2)" section in red
2. Reviews first appeal with additional context
3. Decides to reconsider - clicks "Reconsider" button
4. Request moves back to pending, manager can approve/reject
5. Reviews second appeal
6. Decides rejection was correct - clicks "Reject Appeal"
7. Enters reason: "Policy does not allow vacation during peak season"
```

## Status Flow

```
Regular Flow:
Submit → Pending Supervisor → Approved/Rejected

With Appeal:
Submit → Pending Supervisor → Rejected → Appeal Submitted → Appeal Reviewed

If Reconsidered:
Appeal Reviewed → Pending Supervisor → Approved/Rejected (Final)

If Appeal Rejected:
Appeal Reviewed → Rejected (Final)
```

## Implementation Notes

- Appeals are only allowed once per request
- Appeal section appears only when there are pending appeals
- Visual distinction (red border/background) for appeal section
- Appeal messages are limited to text (no file uploads)
- Managers must provide reason when rejecting appeals
- Appeal status tracked separately from main request status

## Future Enhancements (Optional)

1. Email notifications for:
   - Employee when appeal is reviewed
   - Manager when new appeal is submitted

2. Appeal deadline (e.g., must appeal within 7 days of rejection)

3. Admin-level appeal review for second-tier appeals

4. Appeal history report/analytics

5. Attachment support for appeals (additional documents)

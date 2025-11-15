# Leave Appeal Feature - Quick Reference

## ✅ What Was Implemented

### For Employees:
- **Appeal Button** on rejected leave requests in Leave History table
- **Appeal Dialog** with:
  - Original request details
  - Rejection reason
  - Text field for appeal message
- **Appeal Status** badges showing:
  - "Appeal Pending" - when appeal is submitted
  - "Appeal Reviewed" - when manager has responded
- **Appeal Messages** visible in the leave history reason column

### For Reporting Managers:
- **Leave Appeals Section** in "My Team" → "Leave Approvals" tab
  - Highlighted in red at the top of the page
  - Shows count of pending appeals
  - Displays all rejected requests with appeal messages
- **Appeal Review Actions**:
  - **Reconsider** button - moves request back to pending for fresh review
  - **Reject Appeal** button - permanently rejects with additional reason
- **Complete Appeal Information**:
  - Original reason
  - Rejection reason  
  - Appeal message
  - Supporting documents

## 🎯 How to Use

### As an Employee:
1. Go to **Employee Dashboard** → **Request Leave** tab
2. Scroll down to **Leave Request History**
3. Find your rejected leave request
4. Click the **Appeal** button
5. Write your appeal message
6. Click **Submit Appeal**
7. Wait for manager review (status shows "Appeal Pending")

### As a Reporting Manager:
1. Go to **My Team** tab in Employee Dashboard
2. Click **Leave Approvals** sub-tab
3. See **Leave Appeals** section at the top (red highlight)
4. Review the appeal information
5. Choose action:
   - **Reconsider**: To review the request again (can approve/reject)
   - **Reject Appeal**: To permanently reject with additional reason

## 📊 Database Fields Added

```typescript
appeal_message: string | null
appeal_submitted_at: Date | null
appeal_reviewed: boolean
appeal_reviewed_at: Date | null
appeal_rejection_reason: string | null
```

## 🎨 Visual Indicators

- **Red highlight** on Appeals section for managers
- **Blue "Appeal Pending" badge** on employee's leave history
- **Message icon** next to appeal messages
- **Separate sections** for appeals vs regular pending requests

## 🚀 Key Benefits

1. ✅ **Structured communication** - No more email back-and-forth
2. ✅ **Transparency** - Employees see why rejected and can respond
3. ✅ **Audit trail** - All appeals tracked in system
4. ✅ **Manager priority** - Appeals appear at top of approvals page
5. ✅ **One-time appeal** - Prevents spam appeals

## 📝 Notes

- Employees can only appeal once per request
- Appeals require a message (cannot be empty)
- Managers must provide reason when rejecting appeals
- Appeal status is tracked separately from main request status
- No file uploads for appeals (use original supporting document)

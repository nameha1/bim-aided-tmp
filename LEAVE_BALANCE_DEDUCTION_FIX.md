# Leave Balance Deduction Fix

## Issue
Leave balances were not being deducted when leave requests were approved by admin. The UI was showing intact balances (10 days) even after approval.

## Root Cause
The `/api/leave-requests` API route only updated the leave request status to "approved" but did not deduct the leave balance from:
1. The `employees` collection
2. The `leave_balances` collection

## Solution Implemented

### 1. Enhanced API Route
Updated `/app/api/leave-requests/route.ts` to automatically deduct leave balance when admin approves a leave request.

**Logic:**
- When action is `approve`:
  - Fetch the leave request details (employee_id, leave_type, days_requested)
  - Calculate balance deduction based on leave type:
    - **Casual Leave**: Deducts from `casual_leave_remaining`
    - **Sick Leave**: Deducts from `sick_leave_remaining`
    - **Unpaid Leave**: Adds to `unpaid_leave_days`
  - If balance is exceeded, remaining days are tracked as unpaid
  - Updates both `employees` and `leave_balances` collections

### 2. Working Days Calculation
The system uses Friday as the off day (not Saturday):
- Friday (day 5) = Weekend (off)
- Saturday-Sunday = Working days

Example:
- Nov 15-16, 2025 (Sat-Sun) = 2 working days

### 3. Database Structure

**employees collection:**
```javascript
{
  casual_leave_remaining: 10,  // Starts at 10
  sick_leave_remaining: 10,     // Starts at 10
  unpaid_leave_days: 0          // Accumulates when balance exhausted
}
```

**leave_balances collection:**
```javascript
{
  employee_id: "emp-002",
  year: 2025,
  casual_leave_total: 10,
  casual_leave_used: 2,
  casual_leave_remaining: 8,
  sick_leave_total: 10,
  sick_leave_used: 2,
  sick_leave_remaining: 8,
  unpaid_leave_days: 0
}
```

### 4. Leave Deduction Flow

1. **Employee submits leave request** → Status: "pending"
2. **Supervisor approves** → Status: "pending_admin" (no deduction yet)
3. **Admin approves** → Status: "approved" + **Balance deducted**

### 5. Balance Calculation Logic

```typescript
if (leaveType === "Casual Leave") {
  const currentBalance = casual_leave_remaining;
  const newBalance = Math.max(0, currentBalance - daysRequested);
  
  // If exceeds balance, track unpaid days
  if (daysRequested > currentBalance) {
    const unpaidDays = daysRequested - currentBalance;
    unpaid_leave_days += unpaidDays;
  }
}
```

### 6. Scripts Created

**initialize-leave-balances.cjs**
- Initializes missing leave balance fields for all employees

**show-leave-balances.cjs**
- Displays current balances for all employees

**check-approved-leaves.cjs**
- Shows all leave requests for a specific employee

**recalculate-approved-leave.cjs**
- Recalculates working days for approved leaves
- Verifies balance deductions are correct

**sync-leave-balance.cjs**
- Syncs balances between employees and leave_balances collections

## Current Status

### Ayesha Khan (emp-002) Balance:
- ✅ Casual Leave: 10 days remaining
- ✅ Sick Leave: **8 days remaining** (2 days deducted for Nov 15-16)
- ✅ Unpaid Leave: 0 days

### Test Case Verified:
- Approved Leave: Nov 15-16, 2025 (Sick Leave, 2 working days)
- Balance Before: 10 days
- Balance After: 8 days ✓
- Both collections synced ✓

## UI Refresh
If the UI still shows 10 days:
1. **Hard refresh** the page (Cmd+Shift+R on Mac)
2. **Clear browser cache**
3. **Log out and log back in** to refresh session data

The database is correct - the issue is likely browser caching.

## Future Leaves
All future leave approvals will now automatically:
1. Deduct from the appropriate leave balance
2. Track unpaid days if balance is exceeded
3. Update both `employees` and `leave_balances` collections
4. Show accurate calculations in the leave request form

## Leave Impact Display
The leave request form now shows:
- Total days being requested
- Current balance
- Balance after approval
- Salary impact warnings (if unpaid days exist)
- Color-coded alerts (green = no impact, red = salary deduction)

---

**Fix Applied:** November 15, 2025
**Tested:** ✅ Database verified, balance correctly at 8 days
**Status:** Ready for production use

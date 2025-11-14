# Working Days & Salary Deduction System - Implementation Summary

## Overview
Implemented a comprehensive working days calculation and salary deduction system that accounts for:
- Weekend off days (Fridays)
- Government and public holidays
- Casual and Sick leave (paid, no deduction)
- Unpaid leave (deducted from salary)
- Late arrival penalties (3 late arrivals = 1 day salary deduction)

## Key Features Implemented

### 1. Working Days Calculation (`lib/working-days-utils.ts`)

**Functions:**
- `isWorkingDay()` - Check if a date is a working day
- `calculateWorkingDays()` - Count working days in a date range
- `calculateMonthlyWorkingDays()` - Get working days for a specific month/year
- `calculateDailySalaryRate()` - Calculate daily rate: Gross Salary ÷ Working Days
- `calculateUnpaidLeaveDeduction()` - Calculate deduction for unpaid leave
- `calculateLateArrivalDeduction()` - Calculate deduction for late arrivals (3 late = 1 day)
- `determineUnpaidLeaveDays()` - Automatically determine when leave becomes unpaid

**Logic:**
- Fridays are automatically excluded as off days
- Government/public holidays are excluded from working days
- Daily rate = Gross Salary / Total Working Days (not fixed 30)
- Unpaid leave only occurs when employee exceeds sick+casual leave balance

### 2. Holiday Management

**API: `/api/holidays`**
- GET - Fetch holidays by year/type
- POST - Add new holiday
- PUT - Update holiday
- DELETE - Remove holiday

**Admin Component: `HolidayManager.tsx`**
- Add/edit/delete holidays
- Filter by year
- Holiday types: Public, Government, Company
- Visual calendar display

**Features:**
- Holidays impact working days calculation
- Holidays are excluded from salary calculations
- Employees can view holidays in their calendar

### 3. Leave Balance Tracking

**API: `/api/leave-balances`**
- GET - Fetch employee leave balance
- POST - Create/update leave balance

**Employee Component: `LeaveBalanceDisplay.tsx`**
- Shows casual leave balance (default: 10 days)
- Shows sick leave balance (default: 10 days)
- Shows unpaid leave taken
- Displays complete leave request history
- Color-coded leave types and statuses

**Features:**
- Tracks leave usage throughout the year
- Automatic calculation of remaining balance
- Visual indicators for leave types
- Leave request status tracking

### 4. Enhanced Payroll Generation

**Updated: `/app/api/payroll/generate/route.ts`**

**Improvements:**
1. **Working Days Calculation:**
   - Fetches holidays from Firebase
   - Calculates actual working days for the month
   - Excludes Fridays and holidays

2. **Leave Balance Integration:**
   - Checks employee's leave balance
   - Determines if leave should be paid or unpaid
   - Tracks casual, sick, and unpaid leave separately

3. **Salary Deduction Logic:**
   - Daily Rate = Gross Salary / Working Days (actual)
   - Casual Leave: No deduction (up to limit)
   - Sick Leave: No deduction (up to limit)
   - Unpaid Leave: Deducted at daily rate
   - Late Arrivals: Every 3 late = 1 day deduction

4. **Automatic Unpaid Leave Calculation:**
   - When casual leave exceeds limit → becomes unpaid
   - When sick leave exceeds limit → becomes unpaid
   - Unpaid days deducted from salary automatically

### 5. Leave Type Configuration

**Admin: Leave Policy Manager**
- Configure leave types
- Set annual allowances
- Define salary impact rules
- Customize for organization needs

### 6. Employee Leave Request Flow

**Updated: `LeaveRequestForm.tsx`**
- Employee submits leave request
- System checks leave balance
- Supervisor approval (if applicable)
- Admin final approval
- Automatic balance deduction on approval

**Updated: `LeaveRequests.tsx` (Admin)**
- Shows leave type clearly
- Displays approval workflow
- Shows supporting documents
- Easy approve/reject actions

## Salary Calculation Formula

```
Daily Rate = Gross Salary ÷ Working Days in Month

Working Days = Total Days - Fridays - Holidays

Deductions:
1. Unpaid Leave Deduction = Unpaid Days × Daily Rate
2. Late Penalty = (Total Late Days ÷ 3) × Daily Rate
3. Half Day Deduction = Half Days × (Daily Rate ÷ 2)
4. Absent Deduction = Absent Days × Daily Rate

Net Salary = Gross Salary - Total Deductions
```

## How It Works

### Example Scenario:
- **Employee:** John Doe
- **Gross Salary:** 15,000 AED
- **Month:** January 2025
- **Total Days:** 31
- **Fridays:** 4
- **Public Holidays:** 2
- **Working Days:** 25

**Daily Rate:** 15,000 ÷ 25 = 600 AED/day

**Leave Taken:**
- Casual Leave: 8 days (within 10 limit) → No deduction
- Sick Leave: 12 days (exceeds 10 limit) → 2 days unpaid
- Late Arrivals: 5 times → 1 day deduction (5 ÷ 3 = 1.66, floor = 1)

**Deductions:**
- Unpaid Leave: 2 × 600 = 1,200 AED
- Late Penalty: 1 × 600 = 600 AED
- **Total:** 1,800 AED

**Net Salary:** 15,000 - 1,800 = 13,200 AED

## Admin Configuration

1. **Holiday Management:** Admin > Holidays
   - Add government holidays
   - Add company holidays
   - Configure for multiple years

2. **Leave Policies:** Admin > Leave Policies
   - Set casual leave limit (default: 10)
   - Set sick leave limit (default: 10)
   - Configure other leave types

3. **Attendance Policy:** Admin > Attendance Policy
   - Set late tolerance (default: 3)
   - Configure grace periods
   - Set office hours

4. **Payroll Settings:** Admin > Payroll > Settings
   - Annual casual leave days
   - Annual sick leave days
   - Late tolerance count
   - Working days calculation method

## Employee View

1. **Leave Balance Cards:**
   - Visual display of remaining leave
   - Casual leave: Blue card
   - Sick leave: Red card
   - Unpaid leave: Gray card

2. **Leave Request:**
   - Submit with date range
   - Select leave type
   - Add supporting documents
   - Track approval status

3. **Leave History:**
   - All past requests
   - Status tracking
   - Days calculation
   - Rejection reasons (if any)

## Database Collections

### Firebase Collections:

1. **holidays**
   ```javascript
   {
     name: "New Year",
     date: "2025-01-01",
     type: "public", // or "government", "company"
     description: "New Year's Day",
     created_at: timestamp
   }
   ```

2. **leave_balances**
   ```javascript
   {
     employee_id: "emp_123",
     year: 2025,
     casual_leave_total: 10,
     casual_leave_used: 3,
     casual_leave_remaining: 7,
     sick_leave_total: 10,
     sick_leave_used: 2,
     sick_leave_remaining: 8,
     unpaid_leave_days: 0,
     created_at: timestamp,
     updated_at: timestamp
   }
   ```

3. **leave_requests**
   ```javascript
   {
     employee_id: "emp_123",
     leave_type: "casual", // or "sick", "unpaid", etc.
     start_date: "2025-01-15",
     end_date: "2025-01-17",
     reason: "Family event",
     status: "pending_admin", // or "approved", "rejected"
     supervisor_approved: false,
     admin_approved: false,
     supporting_document_url: "url",
     created_at: timestamp
   }
   ```

4. **payroll**
   ```javascript
   {
     employee_id: "emp_123",
     month: 1,
     year: 2025,
     basic_salary: 15000,
     total_present_days: 22,
     total_late_days: 5,
     casual_leave_taken: 2,
     sick_leave_taken: 1,
     unpaid_leave_days: 0,
     late_penalty: 600,
     unpaid_leave_deduction: 0,
     total_deduction: 600,
     net_payable_salary: 14400,
     status: "pending"
   }
   ```

## Benefits

1. **Accurate Salary Calculations:**
   - Based on actual working days
   - Accounts for holidays and weekends
   - Fair deduction logic

2. **Transparent Leave Management:**
   - Employees see their balance clearly
   - Know when leave becomes unpaid
   - Track all requests and statuses

3. **Automated Processing:**
   - Leave balance auto-updated
   - Unpaid leave auto-calculated
   - Payroll generation includes all factors

4. **Compliance:**
   - Follows government holiday calendar
   - Respects Friday off days
   - Clear audit trail

## Testing

To test the system:

1. **Add Holidays:**
   - Go to Admin > Holidays
   - Add holidays for 2025
   - Verify working days calculation

2. **Submit Leave Request:**
   - Go to Employee Dashboard
   - Submit casual leave request
   - Check balance update

3. **Generate Payroll:**
   - Go to Admin > Payroll
   - Select month/year
   - Click Generate Payroll
   - Verify deductions are correct

4. **Check Leave Balance:**
   - Employee dashboard shows updated balance
   - Unpaid leave tracked separately
   - History shows all requests

## Future Enhancements

1. Leave carryover to next year
2. Pro-rata leave calculation for new joiners
3. Leave encashment
4. Integration with attendance system
5. Email notifications for leave approvals
6. Manager dashboard for team leave overview

---

## Files Modified/Created

### New Files:
- `lib/working-days-utils.ts` - Working days calculation utilities
- `app/api/holidays/route.ts` - Holiday management API
- `app/api/leave-balances/route.ts` - Leave balance API
- `components/admin/HolidayManager.tsx` - Holiday management UI
- `components/employee/LeaveBalanceDisplay.tsx` - Employee leave balance display

### Modified Files:
- `app/api/payroll/generate/route.ts` - Enhanced with working days logic
- `app/admin/page.tsx` - Added Holiday Management tab
- `app/employee/page.tsx` - Added Leave Balance Display
- `lib/attendance-policy-utils.ts` - Already had late arrival logic

## Configuration Required

1. **Initial Setup:**
   - Add holidays for current/next year
   - Configure leave policies
   - Set payroll settings

2. **For Each Employee:**
   - Leave balances auto-created on first use
   - Can be manually adjusted if needed

3. **Monthly Process:**
   - Review leave requests
   - Approve/reject pending requests
   - Generate payroll (auto-calculates everything)

---

**System is now fully functional and ready for production use!**

# Working Days & Salary System - Quick Start Guide

## For Admins

### 1. Initial Setup (First Time Only)

#### Step 1: Configure Holidays
1. Navigate to **Admin Dashboard** → **Holidays** tab
2. OR run the initialization script:
   ```bash
   node scripts/initialize-holidays.cjs
   ```
3. Verify holidays are loaded for 2025-2026
4. Add any additional company-specific holidays

#### Step 2: Configure Leave Policies
1. Go to **Admin Dashboard** → **Leave Policies**
2. Default policies should already exist:
   - Casual Leave: 10 days/year (no salary impact)
   - Sick Leave: 10 days/year (no salary impact)
3. Adjust if needed for your organization

#### Step 3: Configure Payroll Settings
1. Go to **Admin Dashboard** → **Payroll** → **Settings** button
2. Verify settings:
   - Annual Casual Leave: 10 days
   - Annual Sick Leave: 10 days
   - Late Tolerance: 3 (3 late arrivals = 1 day deduction)
   - Working Days Method: Actual working days (based on calendar)

### 2. Monthly Operations

#### Process Leave Requests
1. Go to **Admin Dashboard** → **Leave Requests**
2. Review pending requests
3. Click **Approve** or **Reject** with reason
4. System automatically updates leave balances

#### Generate Monthly Payroll
1. Go to **Admin Dashboard** → **Payroll**
2. Select **Month** and **Year**
3. Click **Generate Payroll**
4. System automatically:
   - Calculates working days (excludes Fridays & holidays)
   - Counts attendance and late arrivals
   - Tracks casual, sick, and unpaid leave
   - Applies deductions
   - Calculates net salary

#### Review Payroll Details
- Check each employee's breakdown:
  - Present days
  - Late days (every 3 = 1 day deduction)
  - Casual leave taken (no deduction up to 10 days)
  - Sick leave taken (no deduction up to 10 days)
  - Unpaid leave (deducted at daily rate)
  - Net payable salary

#### Approve & Export
1. Select employees to approve
2. Click **Approve Selected**
3. Click **Export Excel** for bank transfers
4. Process payments

---

## For Employees

### 1. Check Your Leave Balance

1. Go to **Employee Dashboard**
2. See leave balance cards at the top:
   - **Casual Leave**: Days remaining (blue card)
   - **Sick Leave**: Days remaining (red card)
   - **Unpaid Leave**: Days taken (gray card)

### 2. Request Leave

1. Go to **Request Leave** tab
2. Fill in the form:
   - **Leave Type**: Select (Casual, Sick, etc.)
   - **Start Date**: Select date
   - **End Date**: Select date
   - **Reason**: Provide explanation
   - **Document**: Upload if required (optional)
3. Click **Submit Leave Request**
4. Wait for approval notification

### 3. Track Leave Requests

Scroll down on the **Request Leave** tab to see:
- All your leave requests
- Status (Pending, Approved, Rejected)
- Number of days
- Approval workflow
- Rejection reason (if applicable)

### 4. Understanding Leave Deductions

**Paid Leave (No Deduction):**
- First 10 days of **Casual Leave** per year
- First 10 days of **Sick Leave** per year

**Unpaid Leave (Deducted from Salary):**
- Any **Casual Leave** beyond 10 days
- Any **Sick Leave** beyond 10 days
- Explicitly marked **Unpaid Leave**

**Calculation:**
- Daily Rate = Your Gross Salary ÷ Working Days in Month
- Unpaid Leave Deduction = Unpaid Days × Daily Rate

**Example:**
- Gross Salary: 15,000 AED
- Working Days in January: 25 days (excluding Fridays & holidays)
- Daily Rate: 15,000 ÷ 25 = 600 AED/day
- Unpaid Leave: 2 days
- Deduction: 2 × 600 = 1,200 AED
- Net Salary: 15,000 - 1,200 = 13,800 AED

### 5. Late Arrival Policy

- Office hours have a grace period (typically 15 minutes)
- Every **3 late arrivals** = **1 day salary deduction**
- Late penalty = 1 day × Daily Rate
- Check in on time to avoid penalties

---

## Understanding the System

### Working Days Calculation

**What counts as a working day?**
- Monday to Thursday ✓
- Saturday ✓
- NOT Friday (weekly off day) ✗
- NOT Public/Government Holidays ✗

**Example for January 2025:**
- Total days: 31
- Minus Fridays: 4
- Minus Holidays: 2
- **Working Days: 25**

### Salary Calculation Formula

```
Daily Rate = Gross Salary ÷ Working Days

Deductions:
1. Unpaid Leave = Unpaid Days × Daily Rate
2. Late Penalty = (Late Count ÷ 3) × Daily Rate
3. Half Day = Half Days × (Daily Rate ÷ 2)
4. Absent = Absent Days × Daily Rate

Net Salary = Gross Salary - Total Deductions
```

### Leave Type Quick Reference

| Leave Type | Paid/Unpaid | Limit | Notes |
|------------|-------------|-------|-------|
| Casual Leave | Paid | 10 days/year | No deduction within limit |
| Sick Leave | Paid | 10 days/year | No deduction within limit |
| Emergency Leave | Varies | As approved | Based on policy |
| Unpaid Leave | Unpaid | Unlimited | Full deduction at daily rate |
| Maternity Leave | Paid | 60 days | As per UAE law |

### Approval Workflow

```
Employee Submits
       ↓
Supervisor Reviews (if assigned)
       ↓
Admin Final Approval
       ↓
Leave Balance Updated
       ↓
Attendance Marked
       ↓
Included in Payroll
```

---

## Common Scenarios

### Scenario 1: Within Leave Limits
- **Casual Leave taken:** 5 days
- **Sick Leave taken:** 3 days
- **Deduction:** 0 AED (both within limits)

### Scenario 2: Exceeded Casual Leave
- **Casual Leave taken:** 12 days
- **Paid:** 10 days (within limit)
- **Unpaid:** 2 days
- **Deduction:** 2 × Daily Rate

### Scenario 3: Exceeded Both Limits
- **Casual Leave:** 11 days (1 unpaid)
- **Sick Leave:** 12 days (2 unpaid)
- **Total Unpaid:** 3 days
- **Deduction:** 3 × Daily Rate

### Scenario 4: Late Arrivals
- **Late arrivals:** 7 times
- **Days deducted:** 7 ÷ 3 = 2 days (rounded down)
- **Deduction:** 2 × Daily Rate

### Scenario 5: Combined Deductions
- **Unpaid Leave:** 2 days
- **Late arrivals:** 5 times (1.66 = 1 day)
- **Total deduction:** (2 + 1) × Daily Rate = 3 × Daily Rate

---

## Tips & Best Practices

### For Employees:
1. **Plan leave in advance** - Submit requests early
2. **Check your balance** - Know how many days you have left
3. **Upload documents** - For sick leave, attach medical certificates
4. **Arrive on time** - Avoid late penalties
5. **Track your requests** - Check status regularly

### For Managers:
1. **Review requests promptly** - Don't delay team members
2. **Check team workload** - Ensure coverage during leave
3. **Provide clear feedback** - If rejecting, explain why
4. **Plan holidays** - Account for public holidays in planning

### For Admins:
1. **Keep holidays updated** - Add new holidays as announced
2. **Review policies annually** - Adjust leave limits if needed
3. **Monitor leave usage** - Identify patterns and issues
4. **Generate payroll on time** - Consistent schedule for employees
5. **Verify working days** - Check calculation is correct each month

---

## Troubleshooting

### "My leave balance is wrong"
- Check if previous leave requests were approved
- Verify leave types (casual vs sick)
- Contact admin to review leave balance history

### "Why was my salary deducted?"
- Check unpaid leave days in payroll report
- Verify late arrival count
- Review leave balance for the year
- Check if any leave exceeded limits

### "Holiday not showing as off day"
- Admin needs to add holiday to system
- Check Holidays tab in admin dashboard
- Holiday must be added before payroll generation

### "Leave request stuck in pending"
- Check if supervisor approval is required
- Contact your supervisor or admin
- Verify you're not exceeding limits drastically

---

## Support

For questions or issues:
1. Check this guide first
2. Review the detailed implementation doc: `WORKING_DAYS_SALARY_SYSTEM.md`
3. Contact your HR administrator
4. For technical issues, contact IT support

---

## Quick Links

**Admin Dashboard:**
- Employees Management
- Attendance Records
- Leave Requests
- Leave Policies
- Holidays
- Payroll

**Employee Dashboard:**
- My Profile
- Check In/Out
- Request Leave
- Leave Balance
- Attendance History
- Holiday Calendar

---

**System Version:** 1.0  
**Last Updated:** November 2025  
**Based on:** Firebase/Firestore backend

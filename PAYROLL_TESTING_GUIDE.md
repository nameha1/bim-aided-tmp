# Payroll Manager Testing Guide

## ✅ Dummy Data Successfully Added!

The payroll manager has been populated with dummy data for testing purposes.

## 📊 What Was Created

### 1. **Payroll Settings** (6 configurations)
- Annual Casual Leave Days: 10
- Annual Sick Leave Days: 10
- Late Tolerance Count: 3
- Working Days per Month: 26
- Half Day Hours: 4
- Full Day Hours: 8

### 2. **Attendance Records** (20 records)
- **Month:** November 2025
- **Employees:** 2
- **Records per Employee:** ~10 days
- **Data includes:**
  - Check-in and check-out times
  - Late arrivals
  - Present/Absent status
  - Leave types (casual, sick)

### 3. **Payroll Records** (2 records)
- **Month:** November 2025
- **Status:** Mix of Approved and Pending
- **Data includes:**
  - Basic salary
  - Festival bonus (random)
  - Loan deductions (random)
  - Lunch subsidy
  - AIT (tax)
  - Present/Absent/Late days
  - Total deductions
  - Net payable salary

## 🎯 How to Test the Payroll Manager

### Step 1: Access the Admin Panel

1. Open your browser and go to:
   ```
   http://localhost:3001/admin
   ```

2. Login with admin credentials:
   - **Email:** admin@bimaided.com
   - **Password:** Admin@123456

### Step 2: Navigate to Payroll Tab

1. Click on the **"Payroll"** tab in the admin dashboard
2. You should see a payroll management interface

### Step 3: Review the Payroll Data

You should see:

#### **Employee List with Payroll Details:**
- ✓ Employee names and IDs
- ✓ Designations
- ✓ Gross salary
- ✓ Editable fields:
  - Festival Bonus
  - Loan Deduction
  - Lunch Subsidy
  - AIT
- ✓ Attendance summary (Present, Absent, Late days)
- ✓ Total deductions
- ✓ Net payable salary
- ✓ Status badges (Pending/Approved)

### Step 4: Test Features

#### A. View/Edit Payroll Records
- [x] Click on any editable field (bonus, deductions)
- [x] Type a new value
- [x] Press Enter or click outside to save
- [x] Check for success toast notification

#### B. Select Month/Year
- [x] Use the month dropdown to select different months
- [x] Use the year dropdown to select different years
- [x] Data should refresh automatically

#### C. Generate New Payroll
- [x] Click the "Generate Payroll" button
- [x] System will auto-calculate based on:
  - Attendance records
  - Salary settings
  - Leave policies
  - Late penalties

#### D. Approve/Reject Payroll
- [x] Select one or more payroll records using checkboxes
- [x] Click "Approve Selected" to approve
- [x] Click "Reject Selected" to reject
- [x] Status badges should update

#### E. Export to Excel
- [x] Click "Export Excel" button
- [x] CSV file should download with all payroll data
- [x] File includes: employee info, salary breakdown, account details

#### F. Configure Settings
- [x] Click "Settings" button
- [x] Modify payroll configuration:
  - Annual leave days
  - Late tolerance count
  - Working days per month
  - Work hours
- [x] Click "Save Settings"
- [x] Settings should persist

## 📋 Test Scenarios

### Scenario 1: Monthly Payroll Workflow
1. Check attendance records (Attendance tab)
2. Generate payroll (Payroll tab → Generate Payroll button)
3. Review auto-generated calculations
4. Edit bonuses/deductions as needed
5. Approve selected payroll records
6. Export to Excel for disbursement

### Scenario 2: Manual Adjustments
1. Go to Payroll tab
2. Find an employee record
3. Add a festival bonus (e.g., 10000)
4. Add/remove loan deduction
5. Adjust lunch subsidy
6. Verify net salary updates automatically
7. Approve the record

### Scenario 3: Historical Review
1. Select previous month from dropdown
2. View past payroll records
3. Check status (should be approved/paid)
4. Export for record-keeping

## 🧪 Expected Behavior

### ✅ What Should Work:

1. **Data Display**
   - All employees listed with their current month payroll
   - Proper currency formatting (BDT)
   - Color-coded status badges
   - Attendance stats visible

2. **Inline Editing**
   - Click on bonus/deduction fields to edit
   - Auto-save on blur
   - Toast notifications on success/error
   - Net salary recalculates automatically

3. **Bulk Actions**
   - Select multiple records
   - Approve/Reject in batch
   - All selected records update status

4. **Calculations**
   - Daily rate = Basic Salary ÷ Working Days
   - Late penalty = (Late Days ÷ Tolerance) × Daily Rate
   - Unpaid leave deduction = Unpaid Days × Daily Rate
   - Net Salary = Basic + Bonuses - Deductions

5. **Export**
   - CSV file downloads correctly
   - All columns included
   - Proper formatting

### ⚠️ Known Limitations:

1. New payroll records (not yet saved to database) show "is_new" flag
2. First edit on a new record creates it in Firestore
3. Weekend attendance is not generated (only Mon-Fri)
4. Salary calculation assumes fixed working days

## 🔧 Troubleshooting

### Issue: No payroll data showing
**Solution:** 
- Check if month/year is correct
- Run the dummy data script again
- Verify Firebase connection

### Issue: Cannot edit fields
**Solution:**
- Ensure you're logged in as admin
- Check browser console for errors
- Verify Firebase permissions

### Issue: "Generate Payroll" not working
**Solution:**
- Ensure attendance records exist for the month
- Check if employees have salary configured
- Verify payroll settings are configured

### Issue: Export not downloading
**Solution:**
- Check browser popup blocker
- Verify there's data to export
- Try a different browser

## 📝 Data Structure

### Payroll Document Schema:
```javascript
{
  employee_id: string,
  month: number (1-12),
  year: number,
  basic_salary: number,
  festival_bonus: number,
  loan_deduction: number,
  lunch_subsidy: number,
  ait: number,
  total_present_days: number,
  total_absent_days: number,
  total_late_days: number,
  unpaid_leave_days: number,
  late_penalty: number,
  total_deduction: number,
  net_payable_salary: number,
  status: "pending" | "approved" | "rejected" | "paid",
  created_at: timestamp,
  updated_at: timestamp
}
```

### Attendance Document Schema:
```javascript
{
  employee_id: string,
  date: string (YYYY-MM-DD),
  check_in: timestamp,
  check_out: timestamp,
  status: "present" | "absent" | "casual_leave" | "sick_leave",
  is_late: boolean,
  work_hours: number,
  created_at: timestamp
}
```

## 🚀 Next Steps

### For Development:
1. Test all CRUD operations
2. Verify calculations are accurate
3. Test edge cases (no attendance, weekend days, etc.)
4. Add validation for negative values
5. Implement payment disbursement tracking

### For Production:
1. Set up proper backup procedures
2. Configure email notifications for approvals
3. Add audit logging
4. Implement role-based access (HR, Finance, Admin)
5. Add report generation features
6. Integrate with accounting software

## 📞 Support

If you encounter any issues:

1. **Check Firebase Console:**
   ```
   https://console.firebase.google.com/project/bimaided-8389d/firestore
   ```
   - Verify data exists in `payroll` collection
   - Check `attendance` collection
   - Review `payroll_settings` collection

2. **Check Browser Console:**
   - Press F12 to open DevTools
   - Look for errors in Console tab
   - Check Network tab for failed API calls

3. **Server Logs:**
   - Monitor terminal where `npm run dev` is running
   - Look for error messages

## 🎉 Success Indicators

You'll know the payroll manager is working correctly when:

- ✅ You can see all employees listed
- ✅ Salary calculations are accurate
- ✅ You can edit bonuses and deductions
- ✅ Changes save successfully
- ✅ Approval/rejection works
- ✅ Export generates valid CSV
- ✅ Settings can be configured
- ✅ Month/year filtering works

## 📊 Sample Data Overview

### Employee 1: Tasneem Zaman Labeeb
- **Designation:** BIM Modeler
- **Basic Salary:** ~45,000 BDT
- **Present Days:** 9
- **Late Days:** 4
- **Status:** Approved

### Employee 2: Admin User
- **Designation:** System Administrator
- **Basic Salary:** ~40,000 BDT
- **Present Days:** 9
- **Late Days:** 3
- **Absent Days:** 1
- **Status:** Pending

---

**Happy Testing! 🎯**

For more details, check the component file:
`/components/admin/PayrollManager.tsx`

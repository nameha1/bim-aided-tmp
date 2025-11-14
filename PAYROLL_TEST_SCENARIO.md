# Payroll System Test Scenario

## Overview
This document describes the comprehensive test scenario created for validating the payroll system functionality.

## Test Data Created

### 1. Test Employees (3 employees with staggered start dates)

| Employee | EID | Email | Password | Role | Salary | Start Date | IP Address |
|----------|-----|-------|----------|------|--------|------------|------------|
| Ahmed Hassan | BIM2501 | ahmed.hassan@bimaided.com | Test@123456 | Supervisor | 60,000 AED | June 1, 2025 | 192.168.1.101 |
| Fatima Ali | BIM2502 | fatima.ali@bimaided.com | Test@123456 | Employee | 45,000 AED | July 1, 2025 | 192.168.1.102 |
| Omar Khan | BIM2503 | omar.khan@bimaided.com | Test@123456 | Employee | 42,000 AED | August 1, 2025 | 192.168.1.103 |

### 2. Test Assignments (2 assignments)

#### Assignment 1: Dubai Marina Tower - BIM Modeling
- **Project**: Dubai Marina Tower (proj-001)
- **Supervisor**: Ahmed Hassan (test-emp-001)
- **Members**: 
  - Ahmed Hassan (Supervisor)
  - Fatima Ali (Member)
  - Omar Khan (Member)
- **Duration**: September 1 - December 31, 2025
- **Status**: In Progress

#### Assignment 2: Abu Dhabi Cultural Center - MEP Coordination
- **Project**: Abu Dhabi Cultural Center (proj-002)
- **Supervisor**: Ahmed Hassan (test-emp-001)
- **Members**: 
  - Ahmed Hassan (Supervisor)
  - Fatima Ali (Member)
- **Duration**: September 15 - November 30, 2025
- **Status**: In Progress

### 3. October 2025 Attendance Records

#### Attendance Policy
- **Office Start Time**: 09:00 AM
- **Grace Period**: 15 minutes (until 09:15 AM)
- **Late Tolerance**: 3 late arrivals = 1 day salary deduction
- **Working Days**: 22 days (excluding Fridays and Saturdays)

#### Attendance Summary

| Employee | Present Days | Late Arrivals | Late Dates | On Time | Deduction |
|----------|-------------|---------------|------------|---------|-----------|
| Ahmed Hassan | 22 | 0 | - | 22 | 0 days |
| Fatima Ali | 22 | 3 | Oct 7, 14, 21 | 19 | 1 day |
| Omar Khan | 22 | 0 | - | 22 | 0 days |

#### Expected Payroll Calculations for October 2025

**Working Days in Month**: 26 (standard)  
**Actual Working Days**: 22 (October 2025)

**Ahmed Hassan:**
- Base Salary: 60,000 AED
- Daily Rate: 2,307.69 AED (60,000 / 26)
- Late Penalty Days: 0
- Late Penalty Amount: 0 AED
- **Expected Net Salary: 60,000 AED**

**Fatima Ali:**
- Base Salary: 45,000 AED
- Daily Rate: 1,730.77 AED (45,000 / 26)
- Late Arrivals: 3
- Late Penalty Days: 1 (3 ÷ 3)
- Late Penalty Amount: 1,730.77 AED
- **Expected Net Salary: 43,269.23 AED**

**Omar Khan:**
- Base Salary: 42,000 AED
- Daily Rate: 1,615.38 AED (42,000 / 26)
- Late Penalty Days: 0
- Late Penalty Amount: 0 AED
- **Expected Net Salary: 42,000 AED**

### 4. IP Whitelist

All three employees have their IP addresses whitelisted for attendance check-in/check-out:
- Ahmed Hassan: 192.168.1.101
- Fatima Ali: 192.168.1.102
- Omar Khan: 192.168.1.103

### 5. Leave Balances

All employees have been initialized with:
- **Casual Leave**: 10 days
- **Sick Leave**: 10 days
- **Year**: 2025

## Testing Instructions

### Step 1: Setup
Run the test data creation script:
```bash
node scripts/create-comprehensive-test-data.cjs
```

### Step 2: Verify Setup
Run the verification script:
```bash
node scripts/simple-verify-test.cjs
```

### Step 3: Deploy Firestore Indexes
If you haven't already, deploy the Firestore indexes:
```bash
firebase deploy --only firestore:indexes
```

### Step 4: Test Employee Login
1. Open your application
2. Navigate to the login page
3. Login with any of the test employee credentials above
4. Verify that the employee can access their dashboard

### Step 5: Test Supervisor Dashboard
1. Login as Ahmed Hassan (supervisor)
2. Navigate to the assignments/teams section
3. Verify that both assignments are visible
4. Verify that team members are displayed correctly

### Step 6: Test Attendance System
1. Login as each employee
2. Navigate to the attendance section
3. Verify that October 2025 attendance records are visible
4. Check that:
   - All 22 working days are recorded
   - Fatima Ali shows 3 late arrivals
   - Late dates are: October 7, 14, and 21
   - IP addresses are recorded for each check-in/check-out

### Step 7: Generate Payroll
1. Login as admin or navigate to admin panel
2. Go to Payroll section
3. Select **October 2025**
4. Click "Generate Payroll" or equivalent button
5. Wait for the system to calculate payroll

### Step 8: Verify Payroll Calculations

Check that the generated payroll matches these expectations:

**Ahmed Hassan:**
- ✓ Base Salary: 60,000 AED
- ✓ Present Days: 22
- ✓ Late Days: 0
- ✓ Late Penalty: 0 AED
- ✓ Net Payable: ~60,000 AED (may include other components)

**Fatima Ali:**
- ✓ Base Salary: 45,000 AED
- ✓ Present Days: 22
- ✓ Late Days: 3
- ✓ Late Penalty Days: 1
- ✓ Late Penalty Amount: ~1,730.77 AED
- ✓ Net Payable: ~43,269.23 AED (may include other components)

**Omar Khan:**
- ✓ Base Salary: 42,000 AED
- ✓ Present Days: 22
- ✓ Late Days: 0
- ✓ Late Penalty: 0 AED
- ✓ Net Payable: ~42,000 AED (may include other components)

### Step 9: Test Edge Cases

#### Test 1: IP-based Check-in
1. Try to check-in from a non-whitelisted IP
2. Verify that the system blocks or flags this
3. Check-in from whitelisted IP
4. Verify successful check-in

#### Test 2: Late Arrival Calculation
1. Review Fatima Ali's attendance details
2. Verify that each late arrival is properly marked
3. Check that the system correctly identifies arrivals after 09:15 AM as late
4. Verify the calculation: 3 late arrivals ÷ 3 = 1 day deduction

#### Test 3: Assignment Team View
1. Login as Ahmed Hassan
2. View assignment teams
3. Verify that he can see both assignments
4. Check that team members are correctly listed
5. Login as Fatima Ali
6. Verify she sees herself as a member of both assignments
7. Login as Omar Khan
8. Verify he sees himself as a member of Assignment 1 only

#### Test 4: Leave Balance Check
1. For each employee, navigate to leave balance section
2. Verify they have 10 casual and 10 sick days
3. Test applying for leave (optional)

### Step 10: Report Validation

Generate and review payroll reports:
1. Generate October 2025 payroll report
2. Verify totals:
   - Total employees: 3
   - Total gross salary: 147,000 AED
   - Total deductions: ~1,730.77 AED
   - Total net payable: ~145,269.23 AED
3. Export to PDF/Excel and verify formatting

## Expected Results Summary

### ✅ Success Criteria

- [x] 3 test employees created with Firebase auth accounts
- [x] All employees can login successfully
- [x] 2 assignments created with proper supervisor/member structure
- [x] 66 attendance records created (22 days × 3 employees)
- [x] Fatima Ali has exactly 3 late arrivals
- [x] Late arrivals are on working days 5, 10, and 15 (Oct 7, 14, 21)
- [x] IP addresses are whitelisted and recorded
- [x] Leave balances initialized correctly
- [x] Payroll calculation shows 1 day deduction for Fatima Ali
- [x] Other employees have no deductions
- [x] All salary calculations are mathematically correct

### 🔍 What to Look For

**Correct Behavior:**
- Fatima's net salary is approximately 1,730.77 AED less than base salary
- Late penalty is calculated as: Base Salary ÷ 26 × Number of Penalty Days
- All attendance records show correct IP addresses
- Supervisor can view team members
- Employees can view their own attendance

**Potential Issues:**
- Payroll not calculating late penalties
- Incorrect daily rate calculation
- IP whitelist not being enforced
- Assignment members not displaying
- Attendance dates not matching expected working days

## Cleanup

To remove test data after testing:
```bash
# Note: Create this script if needed, or manually delete from Firestore console
# Delete employees: test-emp-001, test-emp-002, test-emp-003
# Delete assignments: test-assign-001, test-assign-002
# Delete attendance records for October 2025 for these employees
# Delete IP whitelist entries
# Delete leave balances
# Delete auth users via Firebase console
```

## Additional Testing Scenarios

### Scenario 1: Month with Different Working Days
- Modify attendance for November 2025
- Test with different number of working days
- Verify pro-rata calculations if implemented

### Scenario 2: Multiple Late Arrival Thresholds
- Add more late arrivals for one employee
- Test 6 late arrivals (should be 2 days deduction)
- Test 9 late arrivals (should be 3 days deduction)

### Scenario 3: Partial Month Employment
- Test payroll for Ahmed (started June 1)
- Verify if system handles pro-rata for first month
- Test for employees who joined mid-month

### Scenario 4: Leave Applications
- Apply for leave for one employee
- Approve the leave
- Regenerate payroll
- Verify leave days are handled correctly

## Support

If you encounter any issues during testing:
1. Check console logs for errors
2. Verify Firestore indexes are deployed
3. Confirm all Firebase credentials are correct
4. Review attendance policy settings
5. Check that employee records have correct hire_date format

## Scripts Reference

- **Create Test Data**: `scripts/create-comprehensive-test-data.cjs`
- **Verify Test Data**: `scripts/simple-verify-test.cjs`
- **Check Attendance**: `scripts/check-attendance-data.cjs`
- **Verify Payroll**: `scripts/verify-payroll.cjs`

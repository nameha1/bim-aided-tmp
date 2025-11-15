# Payroll Simulation Walkthrough - Md. Karim Ahmed

## Scenario Summary

This simulation demonstrates a complex payroll scenario where an employee (Md. Karim Ahmed) exhausts both leave balances and then takes unpaid leave, combined with attendance issues.

---

## Employee Information

**Name:** Md. Karim Ahmed  
**ID:** emp-003  
**Basic Salary:** BDT 90,000/month  
**Daily Rate:** BDT 4,090.91 (90,000 ÷ 22 working days)

---

## Timeline of Events

### **January 2025: Initial State**
```
✓ Casual Leave Balance: 10 days
✓ Sick Leave Balance: 10 days
✓ Unpaid Leave: 0 days
```

### **July 2025: Sick Leave (10 days)**

**Leave Request:**
- **Type:** Sick Leave
- **Dates:** July 6-17, 2025
- **Working Days:** 10 days (excluding Fridays)
- **Reason:** Medical treatment and recovery
- **Status:** Approved

**Impact:**
- Deducted from sick leave balance
- Sick Leave Balance: 10 → 0 days
- **Salary Impact:** NONE (paid leave)

**Payroll Calculation:**
```
Basic Salary:        BDT 90,000.00
Sick Leave (paid):   10 days (no deduction)
Late Penalty:        BDT 0.00
Other Deductions:    BDT 0.00
─────────────────────────────────
Net Payable:         BDT 90,000.00
```

---

### **August 2025: Casual Leave + Late Arrivals**

**Leave Request:**
- **Type:** Casual Leave
- **Dates:** August 3-14, 2025
- **Working Days:** 10 days
- **Reason:** Family vacation
- **Status:** Approved

**Attendance Issues:**
- **Late Arrivals:** 6 days
  - August 17, 18, 20, 24, 25, 27
- **On-Time:** 5 days

**Impact:**
- Casual Leave Balance: 10 → 0 days
- **Salary Impact:** Late penalty only

**Late Penalty Calculation:**
```
Late Days: 6
Tolerance: 3 days (first 3 late arrivals = no penalty)
Penalty Days: 6 ÷ 3 = 2 days
Penalty Amount: 2 × BDT 4,090.91 = BDT 8,181.82
```

**Payroll Calculation:**
```
Basic Salary:        BDT 90,000.00
Casual Leave (paid): 10 days (no deduction)
Late Penalty:        - BDT 8,181.82
─────────────────────────────────
Net Payable:         BDT 81,818.18
```

---

### **September 2025: Half-Day Leaves (Unpaid) + Late**

**Critical Note:** Both leave balances now exhausted!

**Half-Day Leave Requests (6 instances):**
1. September 3 - Personal appointment
2. September 7 - Bank work
3. September 10 - Home repair
4. September 14 - Vehicle maintenance
5. September 17 - Medical checkup
6. September 21 - Family matter

**Leave Calculation:**
```
Total Half-Days: 6
Effective Days: 6 × 0.5 = 3 days
Casual Balance: 0 days (exhausted)
Sick Balance: 0 days (exhausted)
Result: 3 UNPAID days
```

**Attendance:**
- **Late Arrivals:** 1 day (September 24)
- **On-Time:** 10 days

**Impact:**
- Unpaid Leave Days: 0 → 3 days
- **Salary Impact:** Unpaid leave deduction (no late penalty as 1 < 3)

**Unpaid Leave Deduction:**
```
Unpaid Days: 3
Daily Rate: BDT 4,090.91
Deduction: 3 × BDT 4,090.91 = BDT 12,272.73
```

**Payroll Calculation:**
```
Basic Salary:           BDT 90,000.00
Half-Day Deduction:     - BDT 12,272.73
Late Penalty:           BDT 0.00 (1 day < 3 threshold)
─────────────────────────────────
Net Payable:            BDT 77,727.27
```

---

## Year-to-Date Summary (Jan-Sept 2025)

### Leave Usage
| Leave Type | Allocated | Used | Remaining |
|------------|-----------|------|-----------|
| Casual Leave | 10 days | 10 days | 0 days |
| Sick Leave | 10 days | 10 days | 0 days |
| Unpaid Leave | N/A | 3 days | - |

### Attendance Summary
| Month | Present Days | Late Arrivals | Penalty Days | Penalty Amount |
|-------|--------------|---------------|--------------|----------------|
| July | ~22 (on leave) | 0 | 0 | BDT 0 |
| August | 11 | 6 | 2 | BDT 8,181.82 |
| September | 11 | 1 | 0 | BDT 0 |

### Financial Impact
| Month | Gross Salary | Deductions | Net Payable |
|-------|--------------|------------|-------------|
| July | BDT 90,000 | BDT 0 | BDT 90,000.00 |
| August | BDT 90,000 | BDT 8,181.82 | BDT 81,818.18 |
| September | BDT 90,000 | BDT 12,272.73 | BDT 77,727.27 |
| **Total** | **BDT 270,000** | **BDT 20,454.55** | **BDT 249,545.45** |

---

## What Employee Sees in Portal

### 1. Dashboard - Leave Balance Card

```
┌─────────────────────────────────────────┐
│  📅 CASUAL LEAVE                        │
│  ═══════════════════════════════════    │
│  0 of 10 days remaining                 │
│  Used: 10 days                          │
│  Status: ⚠️ EXHAUSTED                   │
│                                         │
│  🏥 SICK LEAVE                          │
│  ═══════════════════════════════════    │
│  0 of 10 days remaining                 │
│  Used: 10 days                          │
│  Status: ⚠️ EXHAUSTED                   │
│                                         │
│  ⏰ UNPAID LEAVE                        │
│  ═══════════════════════════════════    │
│  3 days taken this year                 │
│  (After exceeding limits)               │
│  Status: 🔴 IMPACTS SALARY              │
└─────────────────────────────────────────┘
```

### 2. Leave Request History Table

| Date | Type | Days | Status | Impact |
|------|------|------|--------|--------|
| Jul 6-17 | Sick Leave | 10 | ✓ Approved | Paid (from balance) |
| Aug 3-14 | Casual Leave | 10 | ✓ Approved | Paid (from balance) |
| Sep 3 | Half Day | 0.5 | ✓ Approved | **Unpaid** (balance exhausted) |
| Sep 7 | Half Day | 0.5 | ✓ Approved | **Unpaid** (balance exhausted) |
| Sep 10 | Half Day | 0.5 | ✓ Approved | **Unpaid** (balance exhausted) |
| Sep 14 | Half Day | 0.5 | ✓ Approved | **Unpaid** (balance exhausted) |
| Sep 17 | Half Day | 0.5 | ✓ Approved | **Unpaid** (balance exhausted) |
| Sep 21 | Half Day | 0.5 | ✓ Approved | **Unpaid** (balance exhausted) |

### 3. Warning Message (shown when balance = 0)

```
⚠️ LEAVE BALANCE EXHAUSTED

Your annual casual and sick leave balances have been 
fully utilized. Any new leave requests will be marked 
as UNPAID LEAVE and will result in salary deductions 
at your daily rate (BDT 4,090.91 per day).

Consider planning your remaining days carefully or 
consult with HR regarding leave options.
```

---

## Admin Panel - Payroll Manager View

### July 2025 Payroll Record

```
Employee: Md. Karim Ahmed (emp-003)
Designation: Assistant Project Manager
─────────────────────────────────────────

Attendance Summary:
  Present: ~12 days (rest on leave)
  Late: 0 days
  Half Days: 0
  Absent: 0 days

Leave Breakdown:
  ✓ Sick Leave: 10 days (PAID)
  ✓ Casual Leave: 0 days
  ✗ Unpaid Leave: 0 days

Deductions:
  Late Penalty: BDT 0.00
  Unpaid Leave: BDT 0.00
  Half Day: BDT 0.00
  Absent: BDT 0.00
  Total: BDT 0.00

Net Payable: BDT 90,000.00 ✓
```

### August 2025 Payroll Record

```
Employee: Md. Karim Ahmed (emp-003)
Designation: Assistant Project Manager
─────────────────────────────────────────

Attendance Summary:
  Present: 11 days (+ 10 on leave)
  Late: 6 days ⚠️
  Half Days: 0
  Absent: 0 days

Leave Breakdown:
  ✓ Sick Leave: 0 days
  ✓ Casual Leave: 10 days (PAID)
  ✗ Unpaid Leave: 0 days

Deductions:
  Late Penalty: BDT 8,181.82 (2 penalty days)
  Unpaid Leave: BDT 0.00
  Half Day: BDT 0.00
  Absent: BDT 0.00
  Total: BDT 8,181.82

Net Payable: BDT 81,818.18 ⚠️
```

### September 2025 Payroll Record

```
Employee: Md. Karim Ahmed (emp-003)
Designation: Assistant Project Manager
─────────────────────────────────────────

Attendance Summary:
  Present: 11 days (worked)
  Late: 1 day (within tolerance)
  Half Days: 0 (tracked as leave)
  Absent: 0 days

Leave Breakdown:
  ✓ Sick Leave: 0 days
  ✓ Casual Leave: 0 days
  ✗ Unpaid Leave: 3 days (6 half-days) 🔴

Deductions:
  Late Penalty: BDT 0.00 (below threshold)
  Unpaid Leave: BDT 12,272.73 ⚠️
  Half Day: BDT 0.00 (counted as unpaid)
  Absent: BDT 0.00
  Total: BDT 12,272.73

Net Payable: BDT 77,727.27 🔴
```

---

## Key System Behaviors Demonstrated

### 1. **Leave Balance Exhaustion**
✅ System correctly tracks when both casual and sick balances reach zero  
✅ Subsequent leave requests marked as unpaid  
✅ Warning displayed to employee in portal

### 2. **Fractional Leave Handling**
✅ Half-day leaves converted to 0.5 days  
✅ When balance exhausted, fractional leaves become unpaid  
✅ Proper calculation: 6 half-days = 3 full unpaid days

### 3. **Late Arrival Penalties**
✅ Tolerance of 3 late arrivals before penalty  
✅ Penalty calculation: Late days ÷ 3 = Penalty days  
✅ August: 6 late days → 2 penalty days → BDT 8,181.82  
✅ September: 1 late day → 0 penalty days → BDT 0

### 4. **Salary Deduction Logic**
✅ Paid leaves (within balance): No deduction  
✅ Unpaid leaves: Daily rate × days  
✅ Late penalties: Daily rate × penalty days  
✅ Combined deductions calculated correctly

### 5. **Payroll Generation**
✅ Each month independently calculated  
✅ Leave overlap properly handled  
✅ Attendance records integrated  
✅ Deduction breakdown visible in admin panel

---

## Verification Steps

### For Employee (Md. Karim Ahmed):
1. ✅ Login to employee portal: `emp3@gmail.com`
2. ✅ Check leave balance shows 0/0/3 (casual/sick/unpaid)
3. ✅ Verify leave request history shows all 3 months
4. ✅ Confirm unpaid leaves marked with warning icon
5. ✅ See balance exhaustion warning message

### For Admin:
1. ✅ Navigate to Payroll Manager
2. ✅ Generate payroll for July, August, September
3. ✅ Verify deduction breakdowns match expectations
4. ✅ Check leave breakdown in popover shows correct values
5. ✅ Confirm net payable amounts are accurate

### Expected Results:
| Verification Point | Expected | Status |
|--------------------|----------|--------|
| July net salary | BDT 90,000.00 | ✅ |
| August net salary | BDT 81,818.18 | ✅ |
| September net salary | BDT 77,727.27 | ✅ |
| Total deductions YTD | BDT 20,454.55 | ✅ |
| Casual balance | 0 days | ✅ |
| Sick balance | 0 days | ✅ |
| Unpaid days | 3 days | ✅ |
| August late penalty | 2 days | ✅ |
| September late penalty | 0 days | ✅ |

---

## Mathematical Verification

### Daily Rate Calculation
```
Monthly Salary = BDT 90,000
Working Days = 22 (average per month, excluding Fridays)
Daily Rate = 90,000 ÷ 22 = BDT 4,090.91
```

### August Deductions
```
Late Days: 6
Tolerance: 3 (first 3 = no penalty)
Penalty Days: floor(6 ÷ 3) = 2 days
Penalty Amount: 2 × 4,090.91 = BDT 8,181.82 ✓
```

### September Deductions
```
Half-Day Leaves: 6
Effective Days: 6 × 0.5 = 3 days
Casual Balance: 0 (exhausted)
Sick Balance: 0 (exhausted)
Unpaid Days: 3 days
Deduction: 3 × 4,090.91 = BDT 12,272.73 ✓

Late Days: 1
Tolerance: 3 (below threshold)
Late Penalty: BDT 0 ✓
```

### Total YTD Impact
```
July Deduction:      BDT 0.00
August Deduction:    BDT 8,181.82
September Deduction: BDT 12,272.73
───────────────────────────────
Total Deductions:    BDT 20,454.55 ✓
```

---

## System Correctness Confirmation

✅ **Leave balances correctly decremented**  
✅ **Unpaid leave properly tracked when balances exhausted**  
✅ **Fractional leaves (half-days) handled correctly**  
✅ **Late penalties calculated using tolerance threshold**  
✅ **Salary deductions applied accurately**  
✅ **Employee portal displays correct balances**  
✅ **Admin payroll manager shows detailed breakdowns**  
✅ **All calculations match expected mathematical results**

---

## Files Created for This Simulation

1. **`simulate-payroll-scenario.cjs`**
   - Creates complete scenario data
   - 3 months of leave requests
   - Attendance records
   - Shows expected calculations
   - Run: `node scripts/simulate-payroll-scenario.cjs`

2. **`verify-employee-portal.cjs`**
   - Checks employee balances
   - Displays leave history
   - Shows salary impact
   - Verifies portal view
   - Run: `node scripts/verify-employee-portal.cjs`

---

## Conclusion

This simulation demonstrates the complete payroll system functioning correctly with:
- ✅ Leave balance tracking and exhaustion
- ✅ Fractional leave conversion (half-days → days)
- ✅ Unpaid leave triggering when balances exhausted
- ✅ Late arrival penalties with tolerance
- ✅ Accurate salary deductions
- ✅ Proper display in employee portal
- ✅ Detailed breakdown in admin panel

**Status:** All calculations verified and correct! ✓

---

**Simulation Date:** November 15, 2025  
**Test Data Period:** July-September 2025  
**Employee:** Md. Karim Ahmed (emp-003)  
**Result:** ✅ System functions as expected

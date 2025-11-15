# Leave System Quick Reference Guide

## Leave Type Categories

### 🟢 Paid Leaves (No Salary Impact)
| Leave Type | Deducted From | Salary Impact |
|------------|---------------|---------------|
| Casual Leave | Casual balance | None (within balance) |
| Sick Leave | Sick balance | None (within balance) |
| Earned Leave | Casual balance | None (within balance) |
| Paid Leave | Casual balance | None (within balance) |
| Maternity Leave | Casual balance | None (within balance) |

### 🔵 Fractional Leaves (Converted to Days)
| Leave Type | Conversion | Deducted From | Example |
|------------|-----------|---------------|---------|
| Hourly Leave | Hours ÷ 8 | Casual balance | 4 hours = 0.5 days |
| Half Day Leave | Days × 0.5 | Casual balance | 2 half days = 1 day |

### 🔴 Unpaid Leaves (Direct Salary Deduction)
| Leave Type | Calculation | Salary Impact |
|------------|-------------|---------------|
| Unpaid Leave | Days × Daily Rate | Full deduction |
| Full Day Leave | Days × Daily Rate | Full deduction |
| Other Leave | Days × Daily Rate | Full deduction |

---

## Salary Impact Examples

### Example 1: Within Balance
```
Employee: Ayesha Khan
Request: 3 days Casual Leave
Current Balance: 10 days

Calculation:
  Days Deducted: 3
  New Balance: 10 - 3 = 7 days
  Unpaid Days: 0
  Salary Deduction: BDT 0

Result: ✓ NO SALARY IMPACT
```

### Example 2: Exceeding Balance
```
Employee: Md. Karim
Request: 12 days Sick Leave
Current Balance: 10 days
Basic Salary: BDT 50,000
Daily Rate: BDT 50,000 ÷ 22 = BDT 2,273

Calculation:
  Days from Balance: 10
  Unpaid Days: 12 - 10 = 2 days
  New Balance: 0 days
  Salary Deduction: 2 × 2,273 = BDT 4,546

Result: ⚠️ PARTIAL SALARY DEDUCTION
```

### Example 3: Hourly Leave
```
Employee: Ayesha Khan
Request: 4 hours Hourly Leave
Current Casual Balance: 10 days

Calculation:
  Effective Days: 4 ÷ 8 = 0.5 days
  Days Deducted: 0.5
  New Balance: 10 - 0.5 = 9.5 days
  Unpaid Days: 0
  Salary Deduction: BDT 0

Result: ✓ NO SALARY IMPACT
```

### Example 4: Half Day Leave
```
Employee: Md. Karim
Request: 1 Half Day Leave
Current Casual Balance: 0.3 days
Basic Salary: BDT 40,000
Daily Rate: BDT 40,000 ÷ 22 = BDT 1,818

Calculation:
  Effective Days: 1 × 0.5 = 0.5 days
  Days from Balance: 0.3 days
  Unpaid Days: 0.5 - 0.3 = 0.2 days
  New Balance: 0 days
  Salary Deduction: 0.2 × 1,818 = BDT 364

Result: ⚠️ PARTIAL DEDUCTION (0.2 days)
```

### Example 5: Unpaid Leave
```
Employee: Ayesha Khan
Request: 2 days Unpaid Leave
Basic Salary: BDT 50,000
Daily Rate: BDT 50,000 ÷ 22 = BDT 2,273

Calculation:
  No balance check
  Unpaid Days: 2
  Salary Deduction: 2 × 2,273 = BDT 4,546

Result: ✗ DIRECT SALARY DEDUCTION
```

---

## Admin Panel Features

### Leave Request Table Columns
1. **Employee** - Name and ID
2. **Leave Type** - Type with category badge
3. **Duration** - Converted display (hours/days)
4. **Date Range** - Start to end date
5. **Salary Impact** - Click for details:
   - Impact summary
   - Calculation explanation
   - Appeal status (if any)
6. **Reason** - Employee's explanation
7. **Document** - Supporting files
8. **Supervisor** - Approval status
9. **Admin** - Final approval status
10. **Actions** - Approve/Reject buttons

### Salary Impact Icons
- 🔴 Red Alert: High impact (unpaid leaves)
- 🔵 Blue Info: Medium impact (fractional)
- 🟢 Green Check: Low/No impact (paid within balance)

---

## Payroll Manager Features

### Leave Breakdown Display
Located in the deduction popover for each employee:

```
Leave Taken This Month:
━━━━━━━━━━━━━━━━━━━━
✓ Casual Leave: 3 day(s)
✓ Sick Leave: 2 day(s)
✗ Unpaid Leave: 1 day(s)

Note: Casual & Sick leaves are paid 
(no salary impact within balance)
```

### Deduction Breakdown
```
Deductions:
━━━━━━━━━━━━━━━━━━━━
Late Penalty (2 days): -BDT 4,546
Unpaid Leave (1 day): -BDT 2,273
Half Days (1): -BDT 1,136
Absent Days (0): -BDT 0
Loan Deduction: -BDT 5,000
AIT: -BDT 1,000

Bonuses/Subsidies:
━━━━━━━━━━━━━━━━━━━━
Festival Bonus: +BDT 10,000
Lunch Subsidy: +BDT 2,000

Net Deduction: -BDT 2,955
Total Payable: BDT 47,045
```

---

## Leave Appeal Process

### For Employees:
1. Leave request rejected by supervisor/admin
2. Click "Submit Appeal" button
3. Enter appeal message (reason + supporting info)
4. Appeal shows in supervisor's dashboard
5. Supervisor can reconsider or provide final rejection

### For Supervisors:
1. View "Leave Appeals" section (red highlighted)
2. See appeal message and original rejection reason
3. Choose action:
   - **Reconsider** - Change status to approved
   - **Reject Appeal** - Provide final rejection reason

### For Admin:
1. Appeals visible in leave request table
2. Yellow warning badge in Salary Impact popover
3. Shows appeal message and context
4. Can override supervisor decision

---

## Testing the System

### Step 1: Create Test Data
```bash
node scripts/create-test-leave-data.cjs
```
Creates 5 diverse leave requests demonstrating all features.

### Step 2: Login as Supervisor
**Credentials:** Sakib Rahman (emp1@gmail.com)
1. Navigate to Employee Portal → "My Team" tab
2. Review 5 pending leave requests
3. Check leave type badges and categories
4. Review appealed sick leave
5. Approve some requests

### Step 3: Login as Admin
1. Navigate to Admin Dashboard → Leave Requests
2. View salary impact for each request
3. Click salary impact icons for details
4. Approve/reject requests
5. Verify balance deductions

### Step 4: Check Payroll
1. Admin Dashboard → Payroll Manager
2. Select month and year
3. Click "Generate Payroll"
4. Review leave breakdown in popover
5. Verify salary deductions are accurate

---

## Troubleshooting

### Issue: Leave balance not updating
**Solution:** 
```bash
node scripts/sync-leave-balance.cjs
```

### Issue: Fractional days not calculating
**Check:**
1. Leave type is "Hourly Leave" or "Half Day Leave"
2. `effective_days` field is being set in API
3. Refresh browser cache

### Issue: Appeal not showing
**Check:**
1. Leave request status is "rejected"
2. `appeal_message` field exists
3. `appeal_reviewed` is false

### Issue: Payroll leave breakdown empty
**Check:**
1. Payroll generated after leave approval
2. Leave requests in date range for that month
3. Employee ID matches in both collections

---

## Quick Commands

```bash
# Create test leave data
node scripts/create-test-leave-data.cjs

# Check employee balances
node scripts/show-leave-balances.cjs

# Sync balances (if out of sync)
node scripts/sync-leave-balance.cjs

# Verify specific employee balance
node scripts/verify-final.cjs
```

---

## Key Numbers

- **Working Days/Month**: ~22 days (excluding Fridays)
- **Annual Casual Leave**: 10 days
- **Annual Sick Leave**: 10 days
- **Daily Rate Calculation**: Basic Salary ÷ 22
- **Hourly Conversion**: 8 hours = 1 day
- **Half Day Conversion**: 0.5 days each

---

## Contact & Support

For questions about this system, refer to:
- **LEAVE_SYSTEM_ENHANCEMENTS.md** - Full technical documentation
- **LEAVE_BALANCE_DEDUCTION_FIX.md** - Balance deduction details
- **LEAVE_APPEAL_SYSTEM.md** - Appeal workflow documentation

---

**Last Updated:** November 15, 2025  
**Version:** 2.0  
**Status:** Production Ready ✅

# Setup Scripts for Working Days & Salary System

This directory contains initialization scripts for setting up the Working Days and Salary Deduction System.

## Scripts

### 1. `initialize-holidays.cjs`
Populates the holidays collection with UAE public and government holidays for 2025-2026.

**What it does:**
- Adds UAE National Day holidays
- Adds Islamic holidays (Eid Al Fitr, Eid Al Adha, etc.)
- Adds New Year's Day
- Adds Commemoration Day
- Prevents duplicates (checks before adding)

**Run this script:**
```bash
node scripts/initialize-holidays.cjs
```

**When to run:**
- First time setup
- Start of each new year
- When holidays are announced/changed

**Note:** Islamic holiday dates are estimates based on astronomical calculations. Actual dates may vary by 1-2 days based on moon sighting. Update manually if needed through the Admin Dashboard > Holidays.

---

### 2. `initialize-leave-balances.cjs`
Creates initial leave balance records for all active employees for the current year.

**What it does:**
- Fetches all active employees
- Creates leave balance for current year
- Sets default casual leave (10 days)
- Sets default sick leave (10 days)
- Initializes unpaid leave to 0
- Updates existing balances if settings changed

**Run this script:**
```bash
node scripts/initialize-leave-balances.cjs
```

**When to run:**
- First time setup
- Start of each new year (to reset balances)
- When new employees are added
- When leave policies change

**Output:**
- Shows number of balances created
- Shows number of balances updated
- Shows number of balances skipped (already exist)

---

## Prerequisites

Before running these scripts, ensure:

1. **Firebase Admin SDK is configured:**
   - `bim-aided-firebase-adminsdk.json` exists in project root
   - Firebase project is properly set up

2. **Firestore collections exist:**
   - `employees` collection with active employees
   - `payroll_settings` collection with leave settings
   - `holidays` collection will be created if doesn't exist
   - `leave_balances` collection will be created if doesn't exist

3. **Node.js is installed:**
   ```bash
   node --version  # Should be v14 or higher
   ```

---

## Initial Setup Workflow

Follow this order when setting up the system for the first time:

### Step 1: Configure Leave Settings
1. Go to Admin Dashboard > Payroll > Settings
2. Set:
   - Annual Casual Leave: 10 days (or your policy)
   - Annual Sick Leave: 10 days (or your policy)
   - Late Tolerance Count: 3 (or your policy)

### Step 2: Run Holidays Script
```bash
node scripts/initialize-holidays.cjs
```

Verify in Admin Dashboard > Holidays that holidays are loaded.

### Step 3: Run Leave Balances Script
```bash
node scripts/initialize-leave-balances.cjs
```

Verify in Employee Dashboard that leave balances show correctly.

### Step 4: Test the System
1. Submit a test leave request
2. Approve it through admin panel
3. Generate test payroll for current month
4. Verify calculations are correct

---

## Annual Maintenance

### Start of Each Year:

1. **Update Holidays:**
   - Run `initialize-holidays.cjs` with new year's holidays
   - OR manually add through Admin Dashboard > Holidays

2. **Reset Leave Balances:**
   - Run `initialize-leave-balances.cjs` to create new year balances
   - Previous year balances remain for historical record

3. **Review Settings:**
   - Check if leave policies need updating
   - Verify late arrival tolerance
   - Update any company-specific holidays

---

## Troubleshooting

### Error: "Cannot find module '../bim-aided-firebase-adminsdk.json'"
**Solution:** Ensure Firebase Admin SDK credentials file exists in project root.

### Error: "No active employees found"
**Solution:** 
- Check that employees exist in Firestore
- Verify employee status is set to "active"
- Check employee collection name is correct

### Error: "Permission denied"
**Solution:**
- Verify Firebase Admin SDK has proper permissions
- Check Firestore rules allow server-side operations
- Ensure service account has necessary roles

### Holidays not showing in working days calculation
**Solution:**
- Verify holidays are in correct date format (YYYY-MM-DD)
- Check that payroll generation is using the holidays API
- Regenerate payroll after adding holidays

### Leave balances not updating after approval
**Solution:**
- Check that leave request status is "approved"
- Verify leave balance API is working
- Check Firestore rules for leave_balances collection

---

## Manual Operations

### Add Single Holiday (Alternative to script):
```javascript
// In Admin Dashboard > Holidays
Name: "Custom Holiday"
Date: "2025-12-25"
Type: "company"
Description: "Office closure"
```

### Check Leave Balance (Firestore Console):
```
Collection: leave_balances
Filter: employee_id == [employee_id]
        year == 2025
```

### Update Leave Balance (Firestore Console):
```
Edit document in leave_balances collection
Update casual_leave_used or sick_leave_used
System will auto-calculate remaining
```

---

## Database Collections Created

### `holidays`
```javascript
{
  name: string,
  date: string (YYYY-MM-DD),
  type: "public" | "government" | "company",
  description: string,
  created_at: timestamp,
  updated_at: timestamp
}
```

### `leave_balances`
```javascript
{
  employee_id: string,
  year: number,
  casual_leave_total: number,
  casual_leave_used: number,
  casual_leave_remaining: number,
  sick_leave_total: number,
  sick_leave_used: number,
  sick_leave_remaining: number,
  unpaid_leave_days: number,
  created_at: timestamp,
  updated_at: timestamp
}
```

---

## Best Practices

1. **Run scripts during off-hours** - Avoid disrupting active users
2. **Backup Firestore before running** - Safety first
3. **Test in development first** - Verify scripts work correctly
4. **Keep scripts up to date** - Update holiday dates annually
5. **Document custom changes** - If you modify scripts, note it
6. **Monitor execution** - Check console output for errors
7. **Verify results** - Always check in admin dashboard after running

---

## Support

For issues with these scripts:
1. Check error messages in console
2. Verify Firebase connection
3. Check Firestore data structure
4. Review main documentation: `WORKING_DAYS_SALARY_SYSTEM.md`
5. Contact technical support if needed

---

## Related Files

- `WORKING_DAYS_SALARY_SYSTEM.md` - Complete system documentation
- `WORKING_DAYS_QUICK_GUIDE.md` - User guide for admins and employees
- `lib/working-days-utils.ts` - Working days calculation functions
- `app/api/holidays/route.ts` - Holidays API
- `app/api/leave-balances/route.ts` - Leave balances API

---

**Remember:** Always run these scripts with caution on production databases. Test thoroughly in development environment first!

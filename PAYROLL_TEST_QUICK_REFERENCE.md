# Payroll Testing - Quick Reference

## 🚀 Quick Start

### Create Test Data
```bash
node scripts/create-comprehensive-test-data.cjs
```

### Verify Test Data
```bash
node scripts/simple-verify-test.cjs
```

### Cleanup Test Data (when done)
```bash
node scripts/cleanup-test-data.cjs
```

---

## 👤 Test Employee Credentials

| Name | Email | Password | Role | Salary | Start Date |
|------|-------|----------|------|--------|------------|
| Ahmed Hassan | ahmed.hassan@bimaided.com | Test@123456 | Supervisor | 60,000 AED | June 1, 2025 |
| Fatima Ali | fatima.ali@bimaided.com | Test@123456 | Employee | 45,000 AED | July 1, 2025 |
| Omar Khan | omar.khan@bimaided.com | Test@123456 | Employee | 42,000 AED | August 1, 2025 |

---

## 📅 October 2025 Attendance Summary

| Employee | Days Present | Late Arrivals | Late Dates | Deduction |
|----------|-------------|---------------|------------|-----------|
| Ahmed Hassan | 22 | 0 | - | 0 days |
| Fatima Ali | 22 | 3 | Oct 7, 14, 21 | 1 day |
| Omar Khan | 22 | 0 | - | 0 days |

---

## 💰 Expected Payroll (October 2025)

### Ahmed Hassan
- **Base**: 60,000 AED
- **Deduction**: 0 AED
- **Net**: 60,000 AED ✓

### Fatima Ali
- **Base**: 45,000 AED
- **Late Penalty**: 1,730.77 AED (1 day)
- **Net**: 43,269.23 AED ✓

### Omar Khan
- **Base**: 42,000 AED
- **Deduction**: 0 AED
- **Net**: 42,000 AED ✓

---

## 📋 Test Assignments

### Assignment 1: Dubai Marina Tower - BIM Modeling
- **Supervisor**: Ahmed Hassan
- **Members**: Ahmed, Fatima, Omar (3 total)

### Assignment 2: Abu Dhabi Cultural Center - MEP Coordination
- **Supervisor**: Ahmed Hassan
- **Members**: Ahmed, Fatima (2 total)

---

## 🌐 IP Addresses (Whitelisted)

- Ahmed: `192.168.1.101`
- Fatima: `192.168.1.102`
- Omar: `192.168.1.103`

---

## ⚙️ Attendance Policy

- **Office Start**: 09:00 AM
- **Grace Period**: 15 minutes (until 09:15 AM)
- **Late Tolerance**: 3 late arrivals = 1 day deduction
- **Working Days/Month**: 26 (standard)

---

## 🎯 Testing Checklist

- [ ] Run test data creation script
- [ ] Verify all 3 employees created
- [ ] Verify 2 assignments created
- [ ] Check 66 attendance records (22 days × 3 employees)
- [ ] Confirm Fatima has 3 late arrivals
- [ ] Verify IP addresses are whitelisted
- [ ] Login as Ahmed (supervisor)
- [ ] View assignment teams
- [ ] Navigate to Payroll section
- [ ] Generate payroll for October 2025
- [ ] Verify Ahmed: 60,000 AED net
- [ ] Verify Fatima: ~43,269 AED net (with 1,730.77 deduction)
- [ ] Verify Omar: 42,000 AED net
- [ ] Test attendance check-in with whitelisted IP
- [ ] View leave balances (10 casual, 10 sick each)
- [ ] Generate payroll report
- [ ] Run cleanup script when done

---

## 🔧 Troubleshooting

### Issue: Can't login
- **Solution**: Check Firebase Auth console, verify user exists with correct email

### Issue: Payroll not calculating correctly
- **Solution**: Check attendance policy settings, verify attendance records exist

### Issue: IP whitelist not working
- **Solution**: Verify IP whitelist collection has entries, check IP matching logic

### Issue: Late penalty not calculated
- **Solution**: Check that `is_late` field is true for late records, verify policy settings

### Issue: Firestore index error
- **Solution**: Run `firebase deploy --only firestore:indexes`

---

## 📊 Quick Calculations

**Daily Rate Formula**: Base Salary ÷ 26 (standard working days)

**Late Penalty Formula**: 
- Late Arrivals ÷ 3 = Penalty Days
- Penalty Days × Daily Rate = Deduction Amount

**Example (Fatima)**:
- 3 late arrivals ÷ 3 = 1 penalty day
- 45,000 ÷ 26 = 1,730.77 (daily rate)
- 1 × 1,730.77 = 1,730.77 AED deduction

---

## 📁 File Locations

- **Test Data Script**: `scripts/create-comprehensive-test-data.cjs`
- **Verification Script**: `scripts/simple-verify-test.cjs`
- **Cleanup Script**: `scripts/cleanup-test-data.cjs`
- **Test Guide**: `PAYROLL_TEST_SCENARIO.md`
- **This Reference**: `PAYROLL_TEST_QUICK_REFERENCE.md`

---

## 🎓 What This Tests

✅ Employee creation with staggered start dates  
✅ Assignment creation with supervisor/member structure  
✅ Attendance recording with IP tracking  
✅ Late arrival detection and counting  
✅ Salary deduction calculation based on late policy  
✅ Payroll generation for specific month  
✅ Daily rate calculation (salary ÷ 26)  
✅ Working days exclusion (weekends, holidays)  
✅ Leave balance initialization  
✅ IP whitelist functionality  

---

## 💡 Next Steps After Testing

1. If tests pass → System is working correctly ✅
2. If tests fail → Review error logs and check calculations
3. When done → Run cleanup script to remove test data
4. For production → Create real employees with actual data

---

## 🆘 Support

If you encounter issues:
1. Check console for error messages
2. Verify Firestore data in Firebase console
3. Review attendance policy collection
4. Check that all indexes are deployed
5. Ensure Firebase credentials are correct

---

**Created**: November 14, 2025  
**Test Scenario**: October 2025 Payroll with 3 Employees  
**Purpose**: Validate payroll calculation accuracy

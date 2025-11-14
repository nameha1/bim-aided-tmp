# Attendance Policy Management System

## Overview
A comprehensive attendance policy management system that allows administrators to configure office hours, grace periods, and late arrival penalties. The system automatically tracks late arrivals and calculates salary deductions based on configurable rules.

## Features

### 1. **Office Hours Configuration**
- Set official office start time (e.g., 09:00 AM)
- Set official office end time (e.g., 06:00 PM)
- System automatically calculates total working hours
- Real-time display of current office hours

### 2. **Grace Period Management**
- Configure grace period in minutes (0-120 minutes)
- Employees arriving within grace period are not marked as late
- Example: With 15-minute grace period, arriving at 9:15 AM is still "on time"
- Visual indicators show the exact grace period end time

### 3. **Late Arrival Penalty Rules**
- Define how many late arrivals equal one day's salary deduction
- Configurable from 1 to 30 late arrivals per deduction
- Default: 3 late arrivals = 1 day salary deduction
- System automatically tracks and calculates deductions

### 4. **Real-time Calculation & Visualization**
- Live preview of policy impact
- Example scenarios showing on-time vs late arrivals
- Clear visual distinction between acceptable and late check-ins
- Automatic calculation of deduction thresholds

## Default Configuration

The default attendance policy is:

| Setting | Value | Description |
|---------|-------|-------------|
| Office Start Time | 09:00 | Official start of workday |
| Office End Time | 18:00 | Official end of workday (6 PM) |
| Grace Period | 15 minutes | Arriving by 9:15 AM is on time |
| Late Arrival Rule | 3 = 1 day | 3 late arrivals equal 1 day deduction |

## Setup

### Initialize Default Policy

Run the setup script to create the default attendance policy:

```bash
node scripts/setup-attendance-policy.cjs
```

This creates a policy with:
- Office hours: 9:00 AM - 6:00 PM
- Grace period: 15 minutes
- Late arrival penalty: 3 late arrivals = 1 day deduction

## How It Works

### Late Arrival Detection

```
Office Start: 09:00
Grace Period: 15 minutes
Grace End: 09:15

Check-in at 08:55 → ✓ On Time (early)
Check-in at 09:00 → ✓ On Time (exact)
Check-in at 09:10 → ✓ On Time (within grace)
Check-in at 09:15 → ✓ On Time (grace boundary)
Check-in at 09:16 → ⚠ Late (1 minute late)
Check-in at 09:30 → ⚠ Late (15 minutes late)
```

### Salary Deduction Calculation

With the default policy (3 late arrivals = 1 day deduction):

```
Month: January
Late Arrivals: 8 times

Calculation:
8 late arrivals ÷ 3 = 2.66
Floor(2.66) = 2 days

Result: 2 days worth of salary deducted
```

### Remaining Late Arrivals

The system tracks remaining late arrivals before the next deduction:

```
Current Late Arrivals: 5
Policy: 3 = 1 day

Completed Deductions: 5 ÷ 3 = 1 (with 2 remaining)
Days Already Deducted: 1 day
Remaining Before Next: 1 more late arrival
```

## API Endpoints

### GET `/api/attendance-policy`
Fetches the current attendance policy.

**Auth**: Admin only

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "default_policy",
    "office_start_time": "09:00",
    "office_end_time": "18:00",
    "grace_period_minutes": 15,
    "late_arrivals_per_day": 3,
    "created_at": "2025-11-12T10:00:00.000Z",
    "updated_at": "2025-11-12T10:00:00.000Z"
  }
}
```

### POST `/api/attendance-policy`
Creates a new attendance policy (if none exists).

**Auth**: Admin only

**Body**:
```json
{
  "office_start_time": "09:00",
  "office_end_time": "18:00",
  "grace_period_minutes": 15,
  "late_arrivals_per_day": 3
}
```

**Validation**:
- Time format must be HH:MM (24-hour format)
- Grace period: 0-120 minutes
- Late arrivals per day: 1-30

### PUT `/api/attendance-policy`
Updates the existing attendance policy.

**Auth**: Admin only

**Body**: Same as POST (all fields optional, only provided fields are updated)

## Database Schema

### Collection: `attendance_policy`

Only one document exists with ID: `default_policy`

```typescript
{
  office_start_time: string;        // "09:00" (HH:MM format)
  office_end_time: string;          // "18:00" (HH:MM format)
  grace_period_minutes: number;     // 15 (0-120)
  late_arrivals_per_day: number;    // 3 (1-30)
  created_at: string;               // ISO timestamp
  updated_at: string;               // ISO timestamp
  created_by?: string;              // Admin user ID
  updated_by?: string;              // Last modifier ID
}
```

## Utility Functions

The system includes comprehensive utility functions in `lib/attendance-policy-utils.ts`:

### Time Conversion
- `timeToMinutes(time: string)` - Convert HH:MM to minutes since midnight
- `minutesToTime(minutes: number)` - Convert minutes to HH:MM format

### Late Arrival Checks
- `isLateArrival(checkInTime, policy)` - Check if check-in is late
- `calculateMinutesLate(checkInTime, policy)` - Calculate how many minutes late
- `calculateGracePeriodEndTime(policy)` - Get grace period end time

### Deduction Calculations
- `calculateLateArrivalDeduction(count, policy)` - Calculate days to deduct
- `getRemainingLateArrivals(count, policy)` - Get remaining before next deduction
- `getLateArrivalSummary(count, policy)` - Get complete summary

### Status & Formatting
- `getAttendanceStatus(checkInTime, policy)` - Get detailed status
- `formatMinutesToReadable(minutes)` - Format as "1h 30m"
- `calculateWorkingHours(policy)` - Get total working hours

## Usage Examples

### Check if Employee is Late

```typescript
import { isLateArrival, calculateMinutesLate } from '@/lib/attendance-policy-utils';

const policy = {
  office_start_time: "09:00",
  office_end_time: "18:00",
  grace_period_minutes: 15,
  late_arrivals_per_day: 3,
};

const checkInTime = "09:20"; // Employee checked in at 9:20 AM

const isLate = isLateArrival(checkInTime, policy);
// Result: true

const minutesLate = calculateMinutesLate(checkInTime, policy);
// Result: 5 (minutes late beyond grace period)
```

### Calculate Salary Deduction

```typescript
import { calculateLateArrivalDeduction, getLateArrivalSummary } from '@/lib/attendance-policy-utils';

const lateArrivalCount = 8; // Employee was late 8 times this month

const daysToDeduct = calculateLateArrivalDeduction(lateArrivalCount, policy);
// Result: 2 (8 ÷ 3 = 2.66, floored to 2)

const summary = getLateArrivalSummary(lateArrivalCount, policy);
// Result: {
//   totalLateArrivals: 8,
//   daysDeducted: 2,
//   remainingBeforeDeduction: 1,
//   nextDeductionAt: 3
// }
```

### Get Attendance Status

```typescript
import { getAttendanceStatus } from '@/lib/attendance-policy-utils';

const status = getAttendanceStatus("09:20", policy);
// Result: {
//   status: 'late',
//   minutesLate: 5,
//   gracePeriodEndTime: '09:15',
//   message: 'Late by 5m - Checked in after 09:15'
// }
```

## Integration with Payroll

When generating payroll:

1. Query all attendance records for the month
2. Count late arrivals for each employee
3. Use `calculateLateArrivalDeduction()` to get days to deduct
4. Calculate deduction amount: `(daily_salary × days_deducted)`
5. Subtract from gross salary

Example payroll integration:

```typescript
// Get employee's late arrivals for the month
const lateArrivals = attendanceRecords.filter(
  record => record.status === 'late'
).length;

// Calculate deduction
const daysToDeduct = calculateLateArrivalDeduction(lateArrivals, policy);
const dailySalary = employee.gross_salary / 30;
const lateArrivalDeduction = dailySalary * daysToDeduct;

// Apply to payroll
const netSalary = grossSalary - lateArrivalDeduction - otherDeductions;
```

## Admin Interface

### Accessing the Feature
1. Login to admin panel at `/admin`
2. Navigate to **HR** section in sidebar
3. Click **Attendance Policy**

### Configuring Policy

1. **Set Office Hours**:
   - Select start time using time picker
   - Select end time using time picker
   - View total working hours automatically calculated

2. **Configure Grace Period**:
   - Enter minutes (0-120)
   - See live preview of grace period end time

3. **Set Late Arrival Rule**:
   - Enter number of late arrivals for 1 day deduction
   - View example calculations

4. **Save Changes**:
   - Click "Save Attendance Policy"
   - Changes apply immediately to all future check-ins

### Visual Features

The interface includes:
- ✅ **Green boxes** for on-time arrivals
- ⚠️ **Orange boxes** for late arrivals  
- 📊 **Example scenarios** showing policy impact
- 📈 **Live calculations** of deduction thresholds
- ℹ️ **Information cards** explaining how it works

## Security

All attendance policy API endpoints are protected:
- Requires valid `firebase-token` cookie
- User must have `admin` role
- Unauthorized access returns 401
- Non-admin access returns 403

## Best Practices

### Recommended Grace Periods

| Industry | Recommended Grace | Reason |
|----------|------------------|---------|
| Corporate Office | 10-15 minutes | Standard flexibility |
| Manufacturing | 5-10 minutes | Shift-based work |
| Healthcare | 0-5 minutes | Critical timing |
| Retail | 5-10 minutes | Customer service |
| Tech/Startup | 15-30 minutes | Flexible culture |

### Late Arrival Ratios

| Strictness | Ratio | Use Case |
|-----------|-------|----------|
| Very Strict | 2 = 1 day | Time-critical industries |
| Moderate | 3 = 1 day | Standard offices (default) |
| Lenient | 4-5 = 1 day | Flexible work environments |
| Very Lenient | 6+ = 1 day | Creative industries |

## Testing

### Test the Policy

1. **Setup Default Policy**:
   ```bash
   node scripts/setup-attendance-policy.cjs
   ```

2. **Access Admin Panel**:
   - Login as admin
   - Navigate to HR > Attendance Policy

3. **Modify Settings**:
   - Change office hours
   - Adjust grace period
   - Modify late arrival rule
   - Save and verify

4. **Test Calculations**:
   - Use utility functions in your code
   - Verify late arrival detection
   - Check deduction calculations

### Unit Test Examples

```typescript
// Test late arrival detection
expect(isLateArrival("09:16", policy)).toBe(true);
expect(isLateArrival("09:15", policy)).toBe(false);

// Test deduction calculation
expect(calculateLateArrivalDeduction(8, policy)).toBe(2);
expect(calculateLateArrivalDeduction(2, policy)).toBe(0);
```

## Files Created/Modified

### New Files:
- `components/admin/AttendancePolicyManager.tsx` - Main component
- `app/api/attendance-policy/route.ts` - API endpoints
- `lib/attendance-policy-utils.ts` - Utility functions
- `scripts/setup-attendance-policy.cjs` - Setup script
- `ATTENDANCE_POLICY_SYSTEM.md` - This documentation

### Modified Files:
- `app/admin/page.tsx` - Added Attendance Policy tab

## Troubleshooting

### Policy Not Found Error
**Solution**: Run setup script to create default policy

### Grace Period Not Working
**Solution**: Check time format (must be HH:MM in 24-hour format)

### Deductions Not Calculating
**Solution**: Verify `late_arrivals_per_day` is set correctly (1-30)

### Changes Not Saving
**Solution**: Check admin authentication and browser console for errors

## Future Enhancements

Potential improvements:
- Different policies for different departments
- Weekend/holiday attendance rules
- Half-day late arrival penalties
- Email notifications for late arrivals
- Monthly late arrival reports
- Automatic alerts when approaching deduction threshold
- Mobile app integration for clock-in
- Geofencing for location-based check-ins

## Support

For issues or questions:
- Check Firestore console for policy document
- Review API logs for error messages
- Verify admin authentication
- Ensure Firebase rules allow admin access to `attendance_policy` collection

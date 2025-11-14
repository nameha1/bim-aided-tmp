# Holiday System Implementation

## Overview
The holiday system has been implemented to automatically manage weekends (Fridays) and government holidays for Bangladesh. This system integrates with the attendance and payroll modules to ensure accurate working days calculation.

## Features Implemented

### 1. **Holiday Types**
- **Government Holidays**: Official Bangladesh government holidays (42 holidays for 2025-2026)
- **Weekend**: All Fridays marked as weekly off (157 Fridays for 2025-2027)
- **Company Holidays**: Custom company-specific holidays

### 2. **Database Structure**
Holidays are stored in Firestore with the following structure:
```typescript
{
  id: string;
  name: string;
  date: string; // YYYY-MM-DD format
  type: 'government' | 'weekend' | 'company';
  description?: string;
  created_at: string;
  updated_at: string;
}
```

### 3. **Scripts Added**

#### Add Bangladesh Holidays
```bash
node scripts/add-bd-holidays.cjs
```
- Adds all Bangladesh government holidays for 2025-2026
- Includes: New Year, Shab-e-Barat, Independence Day, Eid festivals, Victory Day, etc.
- Total: 42 government holidays

#### Add Friday Weekends
```bash
node scripts/add-friday-holidays.cjs
```
- Automatically adds all Fridays as weekend holidays
- Covers years: 2025, 2026, 2027
- Total: 157 Friday weekends
- Run this script annually to add Fridays for new years

### 4. **API Endpoints**

#### GET /api/holidays
Fetch holidays with optional filters:
```typescript
GET /api/holidays?year=2025&type=government
```
Parameters:
- `year`: Filter by year (e.g., 2025)
- `type`: Filter by type (government, weekend, company)

#### POST /api/holidays
Create a new holiday:
```typescript
POST /api/holidays
{
  "name": "Company Anniversary",
  "date": "2025-12-01",
  "type": "company",
  "description": "Company founding day"
}
```

#### PUT /api/holidays
Update an existing holiday:
```typescript
PUT /api/holidays
{
  "id": "holiday-id",
  "name": "Updated Name",
  "date": "2025-12-01"
}
```

#### DELETE /api/holidays
Delete a holiday:
```typescript
DELETE /api/holidays
{
  "id": "holiday-id"
}
```

### 5. **Utility Functions**

#### `lib/holiday-utils.ts`
Comprehensive holiday utilities:
```typescript
// Fetch holidays
await fetchHolidaysForYear(2025);
await fetchHolidaysForMonth(12, 2025);

// Check if date is a holiday
isDateHoliday(new Date(), holidays);
isWeekend(date, holidays);
isGovernmentHoliday(date, holidays);
isWorkingDay(date, holidays);

// Calculate working days
calculateWorkingDays(startDate, endDate, holidays);
calculateMonthlyWorkingDays(12, 2025, holidays);

// Get upcoming holidays
getUpcomingHolidays(holidays, new Date(), 10);
```

#### `lib/working-days-utils.ts`
Working days calculation utilities:
```typescript
// Calculate working days in a month
calculateMonthlyWorkingDays(month, year, holidays);

// Calculate daily salary rate
calculateDailySalaryRate(salary, month, year, holidays);

// Calculate deductions
calculateMonthlySalaryDeductions(
  grossSalary,
  month,
  year,
  holidays,
  unpaidLeaveDays,
  lateArrivals,
  tolerance
);
```

### 6. **Admin Components**

#### Holiday Manager (`components/admin/HolidayManager.tsx`)
- View all holidays by year and type
- Add new holidays
- Edit existing holidays
- Delete holidays
- Statistics dashboard showing:
  - Total holidays
  - Government holidays count
  - Weekend count
  - Company holidays count

### 7. **Integration with Attendance System**

The holiday system automatically integrates with:
- **Attendance marking**: Employees cannot mark attendance on holidays
- **Leave requests**: Leave calculations exclude weekends and holidays
- **Payroll**: Salary calculations use actual working days (excluding weekends/holidays)
- **Working days calculation**: All date-based calculations respect holidays

## Bangladesh Holidays Added

### 2025 (23 holidays)
- New Year (Jan 1)
- Shab-e-Barat (Feb 15)
- Shaheed Day/Martyrs' Day (Feb 21)
- Independence Day (Mar 26)
- Jumatul Bidah (Mar 28)
- Eid-ul-Fitr (Mar 31 - Apr 2)
- Pahela Baishakh (Apr 14)
- May Day (May 1)
- Buddha Purnima (May 11)
- Eid-ul-Adha (Jun 7-9)
- Ashura (Jul 6)
- National Mourning Day (Aug 15)
- Janmashtami (Aug 16)
- Eid-e-Milad-un-Nabi (Sep 5)
- Durga Puja (Oct 1-2)
- Victory Day (Dec 16)
- Christmas (Dec 25)
- Rescheduled Holiday (Dec 27)

### 2026 (19 holidays)
All major Bangladesh government holidays including:
- National days
- Religious festivals (Eid, Puja, etc.)
- International observances

### Fridays (Weekly Off)
- 2025: 52 Fridays
- 2026: 52 Fridays
- 2027: 53 Fridays

## Usage Examples

### Example 1: Calculate Working Days in December 2025
```typescript
import { fetchHolidaysForMonth } from '@/lib/holiday-utils';
import { calculateMonthlyWorkingDays } from '@/lib/working-days-utils';

const holidays = await fetchHolidaysForMonth(12, 2025);
const workingDays = calculateMonthlyWorkingDays(12, 2025, holidays);
console.log(`Working days in December 2025: ${workingDays}`);
```

### Example 2: Check if Today is a Holiday
```typescript
import { fetchHolidaysForYear, isDateHoliday } from '@/lib/holiday-utils';

const holidays = await fetchHolidaysForYear(2025);
const today = new Date();
const isHoliday = isDateHoliday(today, holidays);

if (isHoliday) {
  console.log('Today is a holiday!');
}
```

### Example 3: Get Upcoming Holidays
```typescript
import { fetchHolidaysForYear, getUpcomingHolidays } from '@/lib/holiday-utils';

const holidays = await fetchHolidaysForYear(2025);
const upcoming = getUpcomingHolidays(holidays, new Date(), 5);

console.log('Next 5 holidays:');
upcoming.forEach(h => console.log(`${h.date}: ${h.name}`));
```

## Maintenance

### Adding New Years
To add holidays for a new year:

1. **Add Government Holidays**: Update `scripts/add-bd-holidays.cjs` with new year's holidays
2. **Add Fridays**: Run the Friday script to auto-generate weekends
```bash
# Edit the script to include the new year
node scripts/add-friday-holidays.cjs
```

### Updating Existing Holidays
Use the Holiday Manager in the admin panel or the API:
```bash
# Via Admin Panel
Admin Dashboard → Holiday Management → Edit

# Via API
PUT /api/holidays
```

### Deleting Old Holidays
Holidays from previous years can be archived or deleted through the admin panel.

## Notes

- **Moon Sighting Holidays**: Some Islamic holidays (Eid festivals) are marked with asterisks as they depend on moon sighting and may change
- **Rescheduled Holidays**: Government may reschedule holidays; update manually through admin panel
- **Company Holidays**: Add custom company-specific holidays as needed through the Holiday Manager

## Testing

Test the holiday system:
```bash
# 1. Check if holidays were added
node scripts/show-database.cjs

# 2. Test API
curl http://localhost:3000/api/holidays?year=2025

# 3. Check working days calculation
# Use the admin panel's payroll module to verify working days calculations
```

## Support

For issues or questions:
1. Check the console logs for detailed error messages
2. Verify Firestore collections in Firebase Console
3. Ensure all scripts ran successfully
4. Check API endpoints are responding correctly

/**
 * Working Days Calculation Utilities
 * Handles calculation of working days excluding weekends and holidays
 */

interface Holiday {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD format
  type: 'government' | 'weekend' | 'company';
  description?: string;
  created_at?: string;
}

/**
 * Check if a date is Friday (off day)
 */
export function isFriday(date: Date): boolean {
  return date.getDay() === 5; // Friday is day 5
}

/**
 * Check if a date is a weekend (you can customize which days)
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 5; // Friday is off day (can add Saturday: day === 6)
}

/**
 * Check if a date is a holiday
 */
export function isHoliday(date: Date, holidays: Holiday[]): boolean {
  const dateStr = formatDateToYYYYMMDD(date);
  return holidays.some(holiday => holiday.date === dateStr);
}

/**
 * Format date to YYYY-MM-DD string
 */
export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if a date is a working day
 */
export function isWorkingDay(date: Date, holidays: Holiday[]): boolean {
  return !isWeekend(date) && !isHoliday(date, holidays);
}

/**
 * Calculate working days in a date range (excluding weekends and holidays)
 */
export function calculateWorkingDays(
  startDate: Date,
  endDate: Date,
  holidays: Holiday[]
): number {
  let workingDays = 0;
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    if (isWorkingDay(currentDate, holidays)) {
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return workingDays;
}

/**
 * Calculate working days in a specific month and year
 */
export function calculateMonthlyWorkingDays(
  month: number, // 1-12
  year: number,
  holidays: Holiday[]
): number {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Last day of the month
  
  return calculateWorkingDays(startDate, endDate, holidays);
}

/**
 * Get all working days in a month as an array of dates
 */
export function getWorkingDaysInMonth(
  month: number, // 1-12
  year: number,
  holidays: Holiday[]
): Date[] {
  const workingDays: Date[] = [];
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    if (isWorkingDay(currentDate, holidays)) {
      workingDays.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return workingDays;
}

/**
 * Get all non-working days (weekends + holidays) in a month
 */
export function getNonWorkingDaysInMonth(
  month: number,
  year: number,
  holidays: Holiday[]
): { weekends: Date[]; holidays: Date[] } {
  const weekends: Date[] = [];
  const holidayDates: Date[] = [];
  
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    if (isWeekend(currentDate)) {
      weekends.push(new Date(currentDate));
    } else if (isHoliday(currentDate, holidays)) {
      holidayDates.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return { weekends, holidays: holidayDates };
}

/**
 * Calculate daily salary rate based on actual working days in a month
 */
export function calculateDailySalaryRate(
  grossSalary: number,
  month: number,
  year: number,
  holidays: Holiday[],
  useActualWorkingDays: boolean = true
): number {
  if (useActualWorkingDays) {
    const workingDays = calculateMonthlyWorkingDays(month, year, holidays);
    return workingDays > 0 ? grossSalary / workingDays : 0;
  } else {
    // Use standard 30 days
    return grossSalary / 30;
  }
}

/**
 * Calculate unpaid leave deduction
 * Unpaid leave applies when employee exceeds sick + casual leave limits
 */
export function calculateUnpaidLeaveDeduction(
  unpaidLeaveDays: number,
  dailyRate: number
): number {
  return unpaidLeaveDays * dailyRate;
}

/**
 * Calculate late arrival deduction
 * For every N late arrivals, 1 day salary is deducted
 */
export function calculateLateArrivalDeduction(
  totalLateArrivals: number,
  lateArrivalsTolerance: number, // e.g., 3 late arrivals = 1 day deduction
  dailyRate: number
): number {
  const daysToDeduct = Math.floor(totalLateArrivals / lateArrivalsTolerance);
  return daysToDeduct * dailyRate;
}

/**
 * Calculate leave overlap with a specific month
 * Returns the number of days the leave overlaps with the given month
 */
export function calculateLeaveOverlapDays(
  leaveStartDate: Date,
  leaveEndDate: Date,
  month: number,
  year: number,
  holidays: Holiday[]
): number {
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);
  
  // Get the overlap period
  const overlapStart = leaveStartDate > monthStart ? leaveStartDate : monthStart;
  const overlapEnd = leaveEndDate < monthEnd ? leaveEndDate : monthEnd;
  
  // If no overlap, return 0
  if (overlapStart > overlapEnd) {
    return 0;
  }
  
  // Count working days in the overlap period
  return calculateWorkingDays(overlapStart, overlapEnd, holidays);
}

/**
 * Determine if leave should be unpaid based on leave balances
 */
export function determineUnpaidLeaveDays(
  leaveType: string,
  leaveDays: number,
  casualLeaveBalance: number,
  sickLeaveBalance: number,
  casualLeaveLimit: number,
  sickLeaveLimit: number
): {
  casualDays: number;
  sickDays: number;
  unpaidDays: number;
} {
  let casualDays = 0;
  let sickDays = 0;
  let unpaidDays = 0;
  
  const casualLeaveUsed = casualLeaveLimit - casualLeaveBalance;
  const sickLeaveUsed = sickLeaveLimit - sickLeaveBalance;
  
  if (leaveType === 'casual' || leaveType === 'Casual Leave') {
    if (casualLeaveBalance >= leaveDays) {
      // Enough casual leave balance
      casualDays = leaveDays;
    } else {
      // Partial casual leave, rest is unpaid
      casualDays = casualLeaveBalance;
      unpaidDays = leaveDays - casualLeaveBalance;
    }
  } else if (leaveType === 'sick' || leaveType === 'Sick Leave') {
    if (sickLeaveBalance >= leaveDays) {
      // Enough sick leave balance
      sickDays = leaveDays;
    } else {
      // Partial sick leave, rest is unpaid
      sickDays = sickLeaveBalance;
      unpaidDays = leaveDays - sickLeaveBalance;
    }
  } else if (leaveType === 'unpaid' || leaveType === 'Unpaid Leave') {
    // Already unpaid
    unpaidDays = leaveDays;
  } else {
    // Other leave types (annual, emergency, etc.) - treat as unpaid
    unpaidDays = leaveDays;
  }
  
  return { casualDays, sickDays, unpaidDays };
}

/**
 * Calculate total salary deductions for a month
 */
export function calculateMonthlySalaryDeductions(
  grossSalary: number,
  month: number,
  year: number,
  holidays: Holiday[],
  unpaidLeaveDays: number,
  totalLateArrivals: number,
  lateArrivalsTolerance: number,
  useActualWorkingDays: boolean = true
): {
  dailyRate: number;
  workingDays: number;
  unpaidLeaveDeduction: number;
  lateArrivalDeduction: number;
  totalDeduction: number;
  netSalary: number;
} {
  const workingDays = useActualWorkingDays 
    ? calculateMonthlyWorkingDays(month, year, holidays)
    : 30;
  
  const dailyRate = grossSalary / workingDays;
  
  const unpaidLeaveDeduction = calculateUnpaidLeaveDeduction(unpaidLeaveDays, dailyRate);
  const lateArrivalDeduction = calculateLateArrivalDeduction(
    totalLateArrivals,
    lateArrivalsTolerance,
    dailyRate
  );
  
  const totalDeduction = unpaidLeaveDeduction + lateArrivalDeduction;
  const netSalary = Math.max(0, grossSalary - totalDeduction);
  
  return {
    dailyRate,
    workingDays,
    unpaidLeaveDeduction,
    lateArrivalDeduction,
    totalDeduction,
    netSalary,
  };
}

/**
 * Get month name from month number
 */
export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1] || 'Unknown';
}

/**
 * Format working days summary
 */
export function formatWorkingDaysSummary(
  month: number,
  year: number,
  holidays: Holiday[]
): string {
  const totalDays = new Date(year, month, 0).getDate();
  const workingDays = calculateMonthlyWorkingDays(month, year, holidays);
  const nonWorkingDays = totalDays - workingDays;
  
  return `${getMonthName(month)} ${year}: ${workingDays} working days (${nonWorkingDays} weekends/holidays)`;
}

/**
 * Holiday Utilities
 * Centralized functions to fetch and check holidays
 */

import { getDocuments } from '@/lib/firebase/firestore';
import { where } from 'firebase/firestore';

export interface Holiday {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD format
  type: 'government' | 'weekend' | 'company';
  description?: string;
  created_at?: string;
}

/**
 * Fetch holidays from database for a specific year
 */
export async function fetchHolidaysForYear(year: number): Promise<Holiday[]> {
  try {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const { data, error } = await getDocuments('holidays', [
      where('date', '>=', startDate),
      where('date', '<=', endDate),
    ]);

    if (error) {
      console.error('Error fetching holidays:', error);
      return [];
    }

    return (data || []) as Holiday[];
  } catch (error) {
    console.error('Error in fetchHolidaysForYear:', error);
    return [];
  }
}

/**
 * Fetch holidays for a specific month and year
 */
export async function fetchHolidaysForMonth(month: number, year: number): Promise<Holiday[]> {
  try {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const { data, error } = await getDocuments('holidays', [
      where('date', '>=', startDate),
      where('date', '<=', endDate),
    ]);

    if (error) {
      console.error('Error fetching holidays:', error);
      return [];
    }

    return (data || []) as Holiday[];
  } catch (error) {
    console.error('Error in fetchHolidaysForMonth:', error);
    return [];
  }
}

/**
 * Fetch holidays for a date range
 */
export async function fetchHolidaysForDateRange(startDate: string, endDate: string): Promise<Holiday[]> {
  try {
    const { data, error } = await getDocuments('holidays', [
      where('date', '>=', startDate),
      where('date', '<=', endDate),
    ]);

    if (error) {
      console.error('Error fetching holidays:', error);
      return [];
    }

    return (data || []) as Holiday[];
  } catch (error) {
    console.error('Error in fetchHolidaysForDateRange:', error);
    return [];
  }
}

/**
 * Check if a specific date is a holiday
 */
export function isDateHoliday(date: Date | string, holidays: Holiday[]): boolean {
  const dateStr = typeof date === 'string' ? date : formatDateToYYYYMMDD(date);
  return holidays.some(holiday => holiday.date === dateStr);
}

/**
 * Check if a date is a weekend (Friday)
 */
export function isWeekend(date: Date | string, holidays: Holiday[]): boolean {
  const dateStr = typeof date === 'string' ? date : formatDateToYYYYMMDD(date);
  return holidays.some(holiday => holiday.date === dateStr && holiday.type === 'weekend');
}

/**
 * Check if a date is a government holiday
 */
export function isGovernmentHoliday(date: Date | string, holidays: Holiday[]): boolean {
  const dateStr = typeof date === 'string' ? date : formatDateToYYYYMMDD(date);
  return holidays.some(holiday => holiday.date === dateStr && holiday.type === 'government');
}

/**
 * Check if a date is a working day (not weekend and not holiday)
 */
export function isWorkingDay(date: Date | string, holidays: Holiday[]): boolean {
  return !isDateHoliday(date, holidays);
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
 * Get holiday by date
 */
export function getHolidayByDate(date: Date | string, holidays: Holiday[]): Holiday | null {
  const dateStr = typeof date === 'string' ? date : formatDateToYYYYMMDD(date);
  return holidays.find(holiday => holiday.date === dateStr) || null;
}

/**
 * Group holidays by type
 */
export function groupHolidaysByType(holidays: Holiday[]): {
  government: Holiday[];
  weekend: Holiday[];
  company: Holiday[];
} {
  return {
    government: holidays.filter(h => h.type === 'government'),
    weekend: holidays.filter(h => h.type === 'weekend'),
    company: holidays.filter(h => h.type === 'company'),
  };
}

/**
 * Get upcoming holidays from a given date
 */
export function getUpcomingHolidays(holidays: Holiday[], fromDate?: Date, limit: number = 10): Holiday[] {
  const today = fromDate || new Date();
  const todayStr = formatDateToYYYYMMDD(today);
  
  return holidays
    .filter(holiday => holiday.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);
}

/**
 * Count holidays by type in a date range
 */
export function countHolidaysByType(
  holidays: Holiday[],
  startDate: string,
  endDate: string
): {
  government: number;
  weekend: number;
  company: number;
  total: number;
} {
  const filtered = holidays.filter(h => h.date >= startDate && h.date <= endDate);
  
  return {
    government: filtered.filter(h => h.type === 'government').length,
    weekend: filtered.filter(h => h.type === 'weekend').length,
    company: filtered.filter(h => h.type === 'company').length,
    total: filtered.length,
  };
}

/**
 * Calculate working days between two dates
 */
export function calculateWorkingDays(
  startDate: Date | string,
  endDate: Date | string,
  holidays: Holiday[]
): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  let workingDays = 0;
  const currentDate = new Date(start);

  while (currentDate <= end) {
    if (isWorkingDay(currentDate, holidays)) {
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return workingDays;
}

/**
 * Get all working days in a month as Date array
 */
export function getWorkingDaysInMonth(
  month: number,
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
 * Calculate total working days in a month
 */
export function calculateMonthlyWorkingDays(
  month: number,
  year: number,
  holidays: Holiday[]
): number {
  return getWorkingDaysInMonth(month, year, holidays).length;
}

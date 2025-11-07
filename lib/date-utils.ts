// Date and time formatting utilities
import { format, parseISO, isValid, differenceInDays, addDays, startOfDay, endOfDay } from 'date-fns';
import { DATE_FORMATS } from './constants';

export const formatDate = (date: string | Date | null | undefined, formatStr: string = DATE_FORMATS.DISPLAY): string => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj) ? format(dateObj, formatStr) : 'Invalid date';
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
};

export const formatDateTime = (date: string | Date | null | undefined): string => {
  return formatDate(date, DATE_FORMATS.DATETIME);
};

export const formatTime = (date: string | Date | null | undefined): string => {
  return formatDate(date, DATE_FORMATS.TIME);
};

export const getToday = (): string => {
  return format(new Date(), DATE_FORMATS.INPUT);
};

export const getTodayStart = (): Date => {
  return startOfDay(new Date());
};

export const getTodayEnd = (): Date => {
  return endOfDay(new Date());
};

export const addDaysToDate = (date: Date, days: number): Date => {
  return addDays(date, days);
};

export const getDaysDifference = (startDate: Date, endDate: Date): number => {
  return differenceInDays(endDate, startDate);
};

export const isDateInPast = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateObj < getTodayStart();
};

export const isDateInFuture = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateObj > getTodayEnd();
};

export const isDateToday = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const today = getTodayStart();
  return format(dateObj, DATE_FORMATS.INPUT) === format(today, DATE_FORMATS.INPUT);
};

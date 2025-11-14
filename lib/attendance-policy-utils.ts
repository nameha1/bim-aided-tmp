/**
 * Attendance Policy Utilities
 * Helper functions for calculating late arrivals and salary deductions
 */

interface AttendancePolicy {
  office_start_time: string;
  office_end_time: string;
  grace_period_minutes: number;
  late_arrivals_per_day: number;
}

/**
 * Convert time string (HH:MM) to minutes since midnight
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to time string (HH:MM)
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Calculate the grace period end time
 */
export function calculateGracePeriodEndTime(policy: AttendancePolicy): string {
  const startMinutes = timeToMinutes(policy.office_start_time);
  const graceEndMinutes = startMinutes + policy.grace_period_minutes;
  return minutesToTime(graceEndMinutes);
}

/**
 * Check if a check-in time is considered late
 * @param checkInTime - Time employee checked in (HH:MM)
 * @param policy - Attendance policy configuration
 * @returns true if late, false if on time
 */
export function isLateArrival(checkInTime: string, policy: AttendancePolicy): boolean {
  const checkInMinutes = timeToMinutes(checkInTime);
  const startMinutes = timeToMinutes(policy.office_start_time);
  const graceEndMinutes = startMinutes + policy.grace_period_minutes;
  
  return checkInMinutes > graceEndMinutes;
}

/**
 * Calculate minutes late (0 if not late)
 */
export function calculateMinutesLate(checkInTime: string, policy: AttendancePolicy): number {
  const checkInMinutes = timeToMinutes(checkInTime);
  const startMinutes = timeToMinutes(policy.office_start_time);
  const graceEndMinutes = startMinutes + policy.grace_period_minutes;
  
  if (checkInMinutes <= graceEndMinutes) {
    return 0;
  }
  
  return checkInMinutes - graceEndMinutes;
}

/**
 * Calculate how many days worth of salary deduction based on late arrivals
 * @param lateArrivalCount - Total number of late arrivals
 * @param policy - Attendance policy configuration
 * @returns Number of days to deduct from salary
 */
export function calculateLateArrivalDeduction(
  lateArrivalCount: number,
  policy: AttendancePolicy
): number {
  if (lateArrivalCount < policy.late_arrivals_per_day) {
    return 0;
  }
  
  return Math.floor(lateArrivalCount / policy.late_arrivals_per_day);
}

/**
 * Get remaining late arrivals before next deduction
 */
export function getRemainingLateArrivals(
  lateArrivalCount: number,
  policy: AttendancePolicy
): number {
  return policy.late_arrivals_per_day - (lateArrivalCount % policy.late_arrivals_per_day);
}

/**
 * Format minutes to human readable format (e.g., "1h 30m", "45m")
 */
export function formatMinutesToReadable(minutes: number): string {
  if (minutes === 0) return '0m';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  }
  
  if (mins === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${mins}m`;
}

/**
 * Get attendance status with details
 */
export function getAttendanceStatus(
  checkInTime: string,
  policy: AttendancePolicy
): {
  status: 'on_time' | 'late';
  minutesLate: number;
  gracePeriodEndTime: string;
  message: string;
} {
  const isLate = isLateArrival(checkInTime, policy);
  const minutesLate = calculateMinutesLate(checkInTime, policy);
  const gracePeriodEndTime = calculateGracePeriodEndTime(policy);
  
  let message: string;
  
  if (!isLate) {
    message = `On time - Checked in within grace period (before ${gracePeriodEndTime})`;
  } else {
    message = `Late by ${formatMinutesToReadable(minutesLate)} - Checked in after ${gracePeriodEndTime}`;
  }
  
  return {
    status: isLate ? 'late' : 'on_time',
    minutesLate,
    gracePeriodEndTime,
    message,
  };
}

/**
 * Calculate total working hours
 */
export function calculateWorkingHours(policy: AttendancePolicy): {
  hours: number;
  minutes: number;
  total: number;
} {
  const startMinutes = timeToMinutes(policy.office_start_time);
  const endMinutes = timeToMinutes(policy.office_end_time);
  const totalMinutes = endMinutes - startMinutes;
  
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
    total: totalMinutes,
  };
}

/**
 * Validate time format (HH:MM)
 */
export function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

/**
 * Get late arrival summary for an employee
 */
export function getLateArrivalSummary(
  lateArrivalCount: number,
  policy: AttendancePolicy
): {
  totalLateArrivals: number;
  daysDeducted: number;
  remainingBeforeDeduction: number;
  nextDeductionAt: number;
} {
  return {
    totalLateArrivals: lateArrivalCount,
    daysDeducted: calculateLateArrivalDeduction(lateArrivalCount, policy),
    remainingBeforeDeduction: getRemainingLateArrivals(lateArrivalCount, policy),
    nextDeductionAt: policy.late_arrivals_per_day,
  };
}

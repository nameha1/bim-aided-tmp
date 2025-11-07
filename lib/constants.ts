// Constants for the application

// Application Metadata
export const APP_NAME = 'BIM Aided Portal';
export const APP_VERSION = '1.0.0';

// Query Client Configuration
export const QUERY_CONFIG = {
  retry: 1,
  refetchOnWindowFocus: false,
  staleTime: 5 * 60 * 1000, // 5 minutes
} as const;

// Session Configuration
export const SESSION_REFRESH_INTERVAL = 50 * 60 * 1000; // 50 minutes

// Status Constants
export const STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  IN_PROGRESS: 'in_progress',
  NOT_STARTED: 'not_started',
} as const;

// Employment Types
export const EMPLOYMENT_TYPES = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
  SUPERVISOR: 'supervisor',
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  LONG: 'MMMM dd, yyyy',
  TIME: 'HH:mm:ss',
  DATETIME: 'MMM dd, yyyy HH:mm',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

// Toast Duration
export const TOAST_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  INFO: 3000,
} as const;

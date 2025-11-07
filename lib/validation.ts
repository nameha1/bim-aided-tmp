// Validation utilities

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};

export const isValidEID = (eid: string): boolean => {
  return /^\d+$/.test(eid) && eid.length > 0;
};

export const isEmpty = (value: string | null | undefined): boolean => {
  return !value || value.trim().length === 0;
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidFileSize = (file: File, maxSizeInBytes: number): boolean => {
  return file.size <= maxSizeInBytes;
};

export const isValidFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

export const validateRequired = (value: string | null | undefined, fieldName: string): string | null => {
  return isEmpty(value) ? `${fieldName} is required` : null;
};

export const validateEmail = (email: string): string | null => {
  if (isEmpty(email)) return 'Email is required';
  if (!isValidEmail(email)) return 'Invalid email format';
  return null;
};

export const validatePhone = (phone: string): string | null => {
  if (isEmpty(phone)) return 'Phone number is required';
  if (!isValidPhone(phone)) return 'Invalid phone number';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (isEmpty(password)) return 'Password is required';
  if (!isValidPassword(password)) return 'Password must be at least 8 characters';
  return null;
};

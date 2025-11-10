/**
 * Common Firebase utility functions and helpers
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Convert Firebase Timestamp to JavaScript Date
 */
export function timestampToDate(timestamp: Timestamp | any): Date | null {
  if (!timestamp) return null;
  if (timestamp instanceof Date) return timestamp;
  if (timestamp.toDate) return timestamp.toDate();
  if (timestamp._seconds) {
    return new Date(timestamp._seconds * 1000);
  }
  return null;
}

/**
 * Convert Date to Firebase Timestamp
 */
export function dateToTimestamp(date: Date | string | null): Timestamp | null {
  if (!date) return null;
  if (date instanceof Date) {
    return Timestamp.fromDate(date);
  }
  return Timestamp.fromDate(new Date(date));
}

/**
 * Format Firestore document data
 * Converts Timestamps to ISO strings for JSON serialization
 */
export function formatDocumentData<T = any>(data: any): T {
  if (!data) return data;

  const formatted: any = { ...data };

  Object.keys(formatted).forEach(key => {
    const value = formatted[key];
    
    // Convert Timestamps
    if (value instanceof Timestamp || (value && typeof value === 'object' && value._seconds)) {
      formatted[key] = timestampToDate(value)?.toISOString();
    }
    
    // Recursively handle nested objects
    else if (value && typeof value === 'object' && !Array.isArray(value)) {
      formatted[key] = formatDocumentData(value);
    }
    
    // Handle arrays
    else if (Array.isArray(value)) {
      formatted[key] = value.map(item => 
        typeof item === 'object' ? formatDocumentData(item) : item
      );
    }
  });

  return formatted as T;
}

/**
 * Prepare data for Firestore write
 * Converts Date strings back to Timestamps
 */
export function prepareForFirestore(data: any): any {
  if (!data) return data;

  const prepared: any = { ...data };

  Object.keys(prepared).forEach(key => {
    const value = prepared[key];
    
    // Convert date strings to Timestamps
    if (typeof value === 'string' && isISODateString(value)) {
      prepared[key] = dateToTimestamp(value);
    }
    
    // Remove undefined values (Firestore doesn't allow undefined)
    else if (value === undefined) {
      delete prepared[key];
    }
    
    // Recursively handle nested objects
    else if (value && typeof value === 'object' && !Array.isArray(value)) {
      prepared[key] = prepareForFirestore(value);
    }
    
    // Handle arrays
    else if (Array.isArray(value)) {
      prepared[key] = value.map(item => 
        typeof item === 'object' ? prepareForFirestore(item) : item
      );
    }
  });

  return prepared;
}

/**
 * Check if string is ISO date string
 */
function isISODateString(str: string): boolean {
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  return isoDateRegex.test(str);
}

/**
 * Generate a unique ID similar to Firestore auto-IDs
 */
export function generateId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let autoId = '';
  for (let i = 0; i < 20; i++) {
    autoId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return autoId;
}

/**
 * Batch array into chunks
 * Useful for Firestore batch writes (max 500 operations per batch)
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

/**
 * Convert Supabase-style error to Firebase-style error
 */
export function normalizeError(error: any): Error {
  if (error instanceof Error) return error;
  
  if (error?.message) {
    return new Error(error.message);
  }
  
  if (typeof error === 'string') {
    return new Error(error);
  }
  
  return new Error('An unknown error occurred');
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize filename for storage
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

/**
 * Generate storage path for file
 */
export function generateStoragePath(
  folder: string,
  filename: string,
  userId?: string
): string {
  const sanitized = sanitizeFilename(filename);
  const timestamp = Date.now();
  const randomId = generateId().substring(0, 8);
  
  if (userId) {
    return `${folder}/${userId}/${timestamp}_${randomId}_${sanitized}`;
  }
  
  return `${folder}/${timestamp}_${randomId}_${sanitized}`;
}

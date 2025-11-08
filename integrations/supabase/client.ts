import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only enforce environment variables at runtime, not during build
if (typeof window !== 'undefined') {
  if (!SUPABASE_URL) {
    console.error(
      'Missing NEXT_PUBLIC_SUPABASE_URL environment variable. ' +
      'Please add it to your .env.local file or Coolify environment variables.'
    );
  }

  if (!SUPABASE_PUBLISHABLE_KEY) {
    console.error(
      'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. ' +
      'Please add it to your .env.local file or Coolify environment variables.'
    );
  }
}

// Log configuration in development (helps with debugging)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  console.log('Supabase Configuration:', {
    url: SUPABASE_URL,
    hasAnonKey: !!SUPABASE_PUBLISHABLE_KEY,
    environment: process.env.NODE_ENV
  });
}

// A simple in-memory storage implementation for SSR
const createInMemoryStorage = (): {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
} => {
  const store: Record<string, string> = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value;
    },
    removeItem: (key) => {
      delete store[key];
    },
  };
};

// Use fallback values during build time
const url = SUPABASE_URL || 'https://placeholder.supabase.co';
const key = SUPABASE_PUBLISHABLE_KEY || 'placeholder-key';

export const supabase = createClient<Database>(url, key, {
  auth: {
    storage: typeof window !== 'undefined' ? localStorage : createInMemoryStorage(),
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  global: {
    headers: {
      'X-Client-Info': 'bimaided-portal',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
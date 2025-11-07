import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Better error handling with detailed messages
if (!SUPABASE_URL) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL environment variable. ' +
    'Please add it to your .env.local file or Dokploy environment variables.'
  );
}

if (!SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. ' +
    'Please add it to your .env.local file or Dokploy environment variables.'
  );
}

// Log configuration in development (helps with debugging)
if (process.env.NODE_ENV === 'development') {
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

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
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
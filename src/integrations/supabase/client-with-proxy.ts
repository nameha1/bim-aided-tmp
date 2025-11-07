import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if we're in a Netlify deployment (HTTPS) with HTTP Supabase
const isHttpsToHttpIssue = window.location.protocol === 'https:' && SUPABASE_URL?.startsWith('http://');

let supabase;

if (isHttpsToHttpIssue) {
  // Use Netlify Functions as proxy for Supabase calls
  const proxyUrl = import.meta.env.VITE_API_URL;
  
  // Custom fetch for auth operations
  const customAuthFetch = async (url: string, options: any = {}) => {
    if (url.includes('/auth/v1/token')) {
      // Proxy auth requests through Netlify function
      const response = await fetch(`${proxyUrl}/supabase-proxy?action=sign-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: options.body,
      });
      return response;
    }
    // For other requests, try direct (may fail due to CORS)
    return fetch(url, options);
  };

  supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: {
      fetch: customAuthFetch
    }
  });
} else {
  // Normal Supabase client
  supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
}

export { supabase };
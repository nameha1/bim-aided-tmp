/**
 * Netlify Function: Supabase Proxy
 * Proxies requests to Supabase to handle SSL certificate issues
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL.replace('https://', 'http://');
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Create Supabase client with HTTP (server-side, bypassing browser SSL validation)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

export default async function handler(event, context) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { action } = event.queryStringParameters || {};
    const body = event.body ? JSON.parse(event.body) : {};

    switch (action) {
      case 'sign-in':
        const { email, password } = body;
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: error.message })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            user: data.user,
            session: data.session 
          })
        };

      case 'projects':
        const { data: projects, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false })
          .limit(3);

        if (projectsError) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: projectsError.message })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(projects)
        };

      case 'user-profile':
        const { userId } = event.queryStringParameters;
        const { data: profile, error: profileError } = await supabase
          .from('employees')
          .select('*')
          .eq('auth_user_id', userId)
          .single();

        if (profileError) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: profileError.message })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(profile)
        };

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action parameter' })
        };
    }

  } catch (error) {
    console.error('Supabase proxy error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
}
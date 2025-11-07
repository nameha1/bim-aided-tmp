/**
 * Netlify Function: Supabase Proxy
 * Proxies requests to Supabase to handle SSL certificate issues
 */

const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event, context) {
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
    // Log for debugging
    console.log('Supabase proxy called with action:', event.queryStringParameters?.action);
    
    // Check environment variables
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables:', { 
        hasUrl: !!supabaseUrl, 
        hasKey: !!supabaseServiceKey 
      });
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server configuration error - missing credentials' })
      };
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

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
        console.error('Invalid action received:', action);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action parameter' })
        };
    }

  } catch (error) {
    console.error('Supabase proxy error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
}
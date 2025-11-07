// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

console.log("Hello from Functions!")

// Follow this guide to add dependencies: https://supabase.com/docs/cli/plugins#managing-dependencies
// Deno standard library
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.4';
import { corsHeaders } from '../_shared/cors.ts';

console.log('🚀 "create-employee" function initialized');

serve(async (req: Request) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Validate user is an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Create a Supabase client with the user's token to verify their role
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError) {
      throw new Error(`Authentication error: ${userError.message}`);
    }

    // Check if user has admin role
    const { data: userRole, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !userRole) {
      return new Response(
        JSON.stringify({ error: 'User does not have admin privileges' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Get employee data from request body
    const {
      email,
      password,
      firstName,
      lastName,
      eid,
      gender,
      dateOfBirth,
      nationalId,
      phoneNumber,
      address,
      joiningDate,
      departmentId,
      designationId,
      supervisorId
    } = await req.json();

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, password, firstName, lastName' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Create Supabase Admin Client to perform privileged operations
    // This uses the SERVICE_ROLE_KEY provided as a secret
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 4. Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: { first_name: firstName, last_name: lastName },
    });

    if (authError) {
      console.error('Error creating auth user:', authError.message);
      return new Response(
        JSON.stringify({ error: `Failed to create user account: ${authError.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const userId = authData.user.id;

    // 5. Create employee record in the 'employees' table
    const { data: employeeData, error: employeeError } = await supabaseAdmin
      .from('employees')
      .insert({
        user_id: userId,
        eid: eid || null,
        first_name: firstName,
        last_name: lastName,
        email: email,
        gender: gender || null,
        date_of_birth: dateOfBirth || null,
        national_id: nationalId || null,
        phone_number: phoneNumber || null,
        address: address || null,
        joining_date: joiningDate || new Date().toISOString().split('T')[0],
        department_id: departmentId || null,
        designation_id: designationId || null,
        supervisor_id: supervisorId || null,
        employment_status: 'Active',
      })
      .select()
      .single();

    if (employeeError) {
      console.error('Error creating employee record, rolling back auth user:', employeeError.message);
      // Rollback: Delete the auth user if employee record creation fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return new Response(
        JSON.stringify({ error: `Failed to create employee record: ${employeeError.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Assign the 'employee' role in the 'user_roles' table
    const { error: roleInsertError } = await supabaseAdmin
      .from('user_roles')
      .insert({ user_id: userId, role: 'employee' });

    if (roleInsertError) {
      // This is not a fatal error, but it's important to log it.
      console.error('Error assigning role:', roleInsertError.message);
    }

    // 7. Return a success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Employee created successfully',
        data: { userId, employeeId: employeeData.id, email },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Function error:', err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});


/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-employee' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/

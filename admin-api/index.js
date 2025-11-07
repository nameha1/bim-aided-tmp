import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8094'],
  credentials: true
}));

// Initialize Supabase Admin Client with SERVICE_ROLE key
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'BIMSync Admin API is running' });
});

// Verify admin middleware
const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Check if user has admin role
    const { data: userRole, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !userRole) {
      return res.status(403).json({ error: 'User does not have admin privileges' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

// Create employee endpoint
app.post('/api/admin/create-employee', verifyAdmin, async (req, res) => {
  try {
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
    } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: email, password, firstName, lastName'
      });
    }

    console.log('Creating employee:', { email, firstName, lastName });

    // Step 1: Create auth user with admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for admin-created users
      user_metadata: {
        first_name: firstName,
        last_name: lastName
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return res.status(400).json({
        success: false,
        error: `Failed to create user account: ${authError.message}`
      });
    }

    if (!authData.user) {
      return res.status(500).json({
        success: false,
        error: 'User creation succeeded but no user data returned'
      });
    }

    const userId = authData.user.id;
    console.log('Auth user created:', userId);

    // Step 2: Create employee record
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
        employment_status: 'Active'
      })
      .select()
      .single();

    if (employeeError) {
      console.error('Error creating employee record:', employeeError);
      
      // Rollback: Delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(userId);
      
      return res.status(400).json({
        success: false,
        error: `Failed to create employee record: ${employeeError.message}`
      });
    }

    console.log('Employee record created:', employeeData.id);

    // Step 3: Assign employee role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'employee'
      });

    if (roleError) {
      console.error('Error assigning role:', roleError);
      // Non-fatal - employee is created but role assignment failed
    }

    res.json({
      success: true,
      message: 'Employee created successfully',
      data: {
        userId: userId,
        employeeId: employeeData.id,
        email: email
      }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred',
      details: error.message
    });
  }
});

// Delete employee endpoint
app.delete('/api/admin/delete-employee/:userId', verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // Delete auth user (this will cascade delete employee record due to FK)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      return res.status(400).json({
        success: false,
        error: `Failed to delete user: ${error.message}`
      });
    }

    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred'
    });
  }
});

// Update employee password endpoint
app.post('/api/admin/update-employee-password', verifyAdmin, async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Missing userId or newPassword'
      });
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (error) {
      return res.status(400).json({
        success: false,
        error: `Failed to update password: ${error.message}`
      });
    }

    res.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ BIMSync Admin API running on http://localhost:${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔒 Admin endpoints require authentication`);
  
  // Validate environment variables
  if (!process.env.SUPABASE_URL) {
    console.error('❌ SUPABASE_URL is not set!');
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set!');
  }
  if (process.env.SUPABASE_SERVICE_ROLE_KEY === 'your_service_role_key_here') {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY is still the default value!');
    console.error('   Please update admin-api/.env with your actual SERVICE_ROLE key');
  }
});

export default app;

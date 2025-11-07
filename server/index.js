import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { Readable } from 'stream';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from parent directory or current directory for production
dotenv.config({ path: join(__dirname, '../.env') });
dotenv.config(); // Also try current directory

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static frontend files in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the dist directory (built frontend)
  app.use(express.static(join(__dirname, '../dist'), {
    setHeaders: (res, path) => {
      // Set proper MIME types for different file extensions
      if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      } else if (path.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html');
      }
    }
  }));
  
  console.log('✅ Serving static files from:', join(__dirname, '../dist'));
}

// Google Drive Configuration
const GOOGLE_DRIVE_CREDENTIALS = {
  type: "service_account",
  project_id: process.env.VITE_GOOGLE_PROJECT_ID,
  private_key_id: process.env.VITE_GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.VITE_GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.VITE_GOOGLE_CLIENT_EMAIL,
  client_id: process.env.VITE_GOOGLE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.VITE_GOOGLE_CERT_URL,
};

const FOLDER_ID = process.env.VITE_GOOGLE_DRIVE_FOLDER_ID;

// Debug: Log environment variables (remove in production)
console.log('Environment check:');
console.log('- VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✓ Loaded' : '✗ Missing');
console.log('- SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✓ Loaded' : '✗ Missing');

// Initialize Supabase Admin Client
if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('❌ ERROR: Supabase credentials not found in environment variables');
  console.error('Make sure .env file exists in parent directory with:');
  console.error('  - VITE_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

console.log('✅ Supabase Admin Client initialized');

// Initialize Google Drive
const initializeDrive = () => {
  const auth = new google.auth.GoogleAuth({
    credentials: GOOGLE_DRIVE_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });
  return google.drive({ version: 'v3', auth });
};

// We'll upload directly to the main folder since service accounts can't create folders
// Instead, we'll prefix the filename with employee name
const getEmployeeFileName = (employeeName, leaveRequestId, fileName) => {
  return `${employeeName}_${leaveRequestId}_${fileName}`;
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'BIMaided API Server is running' });
});

// Create employee account endpoint
app.post('/api/create-employee', async (req, res) => {
  try {
    const {
      email,
      eid,
      password,
      firstName,
      lastName,
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

    console.log('Creating employee account:', { email, eid, firstName, lastName });

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['email', 'password', 'firstName', 'lastName']
      });
    }

    // Check if EID already exists (if provided)
    if (eid) {
      const { data: existingEid } = await supabaseAdmin
        .from('employees')
        .select('id')
        .eq('eid', eid)
        .single();
      
      if (existingEid) {
        return res.status(400).json({
          error: 'EID already exists',
          message: 'An employee with this EID already exists. Please use a unique EID.'
        });
      }
    }

    // Step 1: Create auth user using Supabase Admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: firstName,
        last_name: lastName
      }
    });

    if (authError) {
      console.error('Auth user creation error:', authError);
      return res.status(400).json({ 
        error: 'Failed to create auth user',
        message: authError.message 
      });
    }

    console.log('Auth user created:', authData.user.id);

    // Step 2: Create employee record in database
    const { data: employeeData, error: employeeError } = await supabaseAdmin
      .from('employees')
      .insert({
        user_id: authData.user.id,
        first_name: firstName,
        last_name: lastName,
        email: email,
        eid: eid || null,
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
      console.error('Employee creation error:', employeeError);
      // Rollback: Delete the auth user if employee creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return res.status(400).json({ 
        error: 'Failed to create employee record',
        message: employeeError.message 
      });
    }

    console.log('Employee record created:', employeeData.id);

    // Step 3: Create user role entry
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: 'employee'
      });

    if (roleError) {
      console.error('User role creation error (non-critical):', roleError);
      // Don't fail the entire operation if role creation fails
    }

    // Step 4: Send welcome email with credentials
    try {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .credential-item { margin: 15px 0; padding: 10px; background: #f0f4ff; border-radius: 5px; }
            .credential-label { font-weight: bold; color: #667eea; margin-bottom: 5px; }
            .credential-value { font-size: 16px; color: #333; font-family: 'Courier New', monospace; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to BIMaided!</h1>
              <p>Your employee account has been created</p>
            </div>
            <div class="content">
              <p>Hello <strong>${firstName} ${lastName}</strong>,</p>
              <p>Your employee account has been successfully created. Below are your login credentials:</p>
              
              <div class="credentials">
                <h3 style="margin-top: 0; color: #667eea;">📋 Your Login Credentials</h3>
                
                ${eid ? `
                <div class="credential-item">
                  <div class="credential-label">Employee ID (EID):</div>
                  <div class="credential-value">${eid}</div>
                </div>
                ` : ''}
                
                <div class="credential-item">
                  <div class="credential-label">Email Address:</div>
                  <div class="credential-value">${email}</div>
                </div>
                
                <div class="credential-item">
                  <div class="credential-label">Password:</div>
                  <div class="credential-value">${password}</div>
                </div>
              </div>

              ${eid ? `
              <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0;"><strong>💡 Login Options:</strong></p>
                <p style="margin: 5px 0 0 0;">You can login using either your <strong>Email</strong> or your <strong>Employee ID (EID)</strong>.</p>
              </div>
              ` : ''}

              <div class="warning">
                <strong>⚠️ Important Security Notice:</strong>
                <ul style="margin: 10px 0;">
                  <li>Please change your password after your first login</li>
                  <li>Do not share your credentials with anyone</li>
                  <li>Keep this email secure or delete it after noting your credentials</li>
                </ul>
              </div>

              <div style="text-align: center;">
                <a href="${process.env.VITE_APP_URL || 'http://localhost:5173'}/login" class="button">
                  Login to Portal
                </a>
              </div>

              <p style="margin-top: 30px;">If you have any questions or need assistance, please contact your administrator.</p>
              
              <p>Best regards,<br><strong>BIMaided Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; 2025 BIMaided. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"BIMaided Portal" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🎉 Welcome to BIMaided - Your Account Credentials',
        html: emailHtml
      };

      await transporter.sendMail(mailOptions);
      console.log('Welcome email sent to:', email);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the employee creation if email fails
    }

    // Success response
    res.json({
      success: true,
      user_id: authData.user.id,
      employee_id: employeeData.id,
      message: 'Employee account created successfully. Welcome email sent to employee.'
    });

  } catch (error) {
    console.error('Unexpected error creating employee:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Reset employee password
app.post('/api/reset-employee-password', async (req, res) => {
  try {
    const { employeeId, newPassword } = req.body;

    console.log('Password reset request for employee:', employeeId);

    if (!employeeId || !newPassword) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['employeeId', 'newPassword']
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'Password too short',
        message: 'Password must be at least 6 characters long'
      });
    }

    // Get employee details
    const { data: employee, error: employeeError } = await supabaseAdmin
      .from('employees')
      .select('user_id, email, first_name, last_name, eid')
      .eq('id', employeeId)
      .single();

    if (employeeError || !employee) {
      console.error('Employee not found:', employeeError);
      return res.status(404).json({
        error: 'Employee not found',
        message: 'Could not find employee with the provided ID'
      });
    }

    // Update password using Supabase Admin API
    const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
      employee.user_id,
      { password: newPassword }
    );

    if (passwordError) {
      console.error('Password update error:', passwordError);
      return res.status(400).json({
        error: 'Failed to update password',
        message: passwordError.message
      });
    }

    console.log('Password updated successfully for:', employee.email);

    // Send password reset email
    try {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .credential-item { margin: 15px 0; padding: 10px; background: #f0f4ff; border-radius: 5px; }
            .credential-label { font-weight: bold; color: #667eea; margin-bottom: 5px; }
            .credential-value { font-size: 16px; color: #333; font-family: 'Courier New', monospace; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset</h1>
              <p>Your password has been updated</p>
            </div>
            <div class="content">
              <p>Hello <strong>${employee.first_name} ${employee.last_name}</strong>,</p>
              <p>Your BIMaided account password has been reset by an administrator. Below are your updated login credentials:</p>
              
              <div class="credentials">
                <h3 style="margin-top: 0; color: #667eea;">📋 Your Updated Login Credentials</h3>
                
                ${employee.eid ? `
                <div class="credential-item">
                  <div class="credential-label">Employee ID (EID):</div>
                  <div class="credential-value">${employee.eid}</div>
                </div>
                ` : ''}
                
                <div class="credential-item">
                  <div class="credential-label">Email Address:</div>
                  <div class="credential-value">${employee.email}</div>
                </div>
                
                <div class="credential-item">
                  <div class="credential-label">New Password:</div>
                  <div class="credential-value">${newPassword}</div>
                </div>
              </div>

              ${employee.eid ? `
              <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0;"><strong>💡 Login Options:</strong></p>
                <p style="margin: 5px 0 0 0;">You can login using either your <strong>Email</strong> or your <strong>Employee ID (EID)</strong>.</p>
              </div>
              ` : ''}

              <div class="warning">
                <strong>⚠️ Important Security Notice:</strong>
                <ul style="margin: 10px 0;">
                  <li>Please change your password after logging in</li>
                  <li>If you did not request this password reset, contact your administrator immediately</li>
                  <li>Do not share your credentials with anyone</li>
                  <li>Keep this email secure or delete it after noting your credentials</li>
                </ul>
              </div>

              <div style="text-align: center;">
                <a href="${process.env.VITE_APP_URL || 'http://localhost:5173'}/login" class="button">
                  Login to Portal
                </a>
              </div>

              <p style="margin-top: 30px;">If you have any questions or concerns, please contact your administrator immediately.</p>
              
              <p>Best regards,<br><strong>BIMaided Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; 2025 BIMaided. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"BIMaided Portal" <${process.env.EMAIL_USER}>`,
        to: employee.email,
        subject: '🔐 BIMaided - Password Reset Notification',
        html: emailHtml
      };

      await transporter.sendMail(mailOptions);
      console.log('Password reset email sent to:', employee.email);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Don't fail the password reset if email fails
    }

    res.json({
      success: true,
      message: 'Password reset successfully. Email sent to employee.'
    });

  } catch (error) {
    console.error('Unexpected error resetting password:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Update employee data
app.put('/api/update-employee/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const {
      firstName,
      lastName,
      email,
      eid,
      gender,
      dateOfBirth,
      nationalId,
      phoneNumber,
      address,
      joiningDate,
      departmentId,
      designationId,
      supervisorId,
      employmentStatus
    } = req.body;

    console.log('Updating employee:', employeeId, { firstName, lastName, email, eid });

    // Check if EID is being changed and if it already exists
    if (eid) {
      const { data: existingEid } = await supabaseAdmin
        .from('employees')
        .select('id')
        .eq('eid', eid)
        .neq('id', employeeId)
        .single();
      
      if (existingEid) {
        return res.status(400).json({
          error: 'EID already exists',
          message: 'Another employee already has this EID. Please use a unique EID.'
        });
      }
    }

    // Get current employee data
    const { data: currentEmployee, error: fetchError } = await supabaseAdmin
      .from('employees')
      .select('user_id, email')
      .eq('id', employeeId)
      .single();

    if (fetchError || !currentEmployee) {
      return res.status(404).json({
        error: 'Employee not found',
        message: 'Could not find employee with the provided ID'
      });
    }

    // Update employee record
    const { data: updatedEmployee, error: updateError } = await supabaseAdmin
      .from('employees')
      .update({
        first_name: firstName,
        last_name: lastName,
        email: email,
        eid: eid || null,
        gender: gender || null,
        date_of_birth: dateOfBirth || null,
        national_id: nationalId || null,
        phone_number: phoneNumber || null,
        address: address || null,
        joining_date: joiningDate,
        department_id: departmentId || null,
        designation_id: designationId || null,
        supervisor_id: supervisorId || null,
        employment_status: employmentStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', employeeId)
      .select()
      .single();

    if (updateError) {
      console.error('Employee update error:', updateError);
      return res.status(400).json({
        error: 'Failed to update employee',
        message: updateError.message
      });
    }

    // If email changed, update auth user email
    if (email && email !== currentEmployee.email) {
      const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
        currentEmployee.user_id,
        { email: email }
      );

      if (authUpdateError) {
        console.error('Auth email update error:', authUpdateError);
        // Rollback employee email change
        await supabaseAdmin
          .from('employees')
          .update({ email: currentEmployee.email })
          .eq('id', employeeId);
        
        return res.status(400).json({
          error: 'Failed to update email',
          message: authUpdateError.message
        });
      }
    }

    console.log('Employee updated successfully:', employeeId);

    res.json({
      success: true,
      employee: updatedEmployee,
      message: 'Employee updated successfully'
    });

  } catch (error) {
    console.error('Unexpected error updating employee:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Upload file to Google Drive
app.post('/api/upload-to-drive', async (req, res) => {
  try {
    const { fileName, fileData, mimeType, employeeName, leaveRequestId } = req.body;

    console.log('Upload request received:', { 
      fileName, 
      mimeType, 
      employeeName, 
      leaveRequestId,
      fileDataLength: fileData?.length 
    });

    if (!fileName || !fileData || !mimeType || !employeeName || !leaveRequestId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Initialize Drive
    const drive = initializeDrive();

    // Convert base64 to buffer
    const buffer = Buffer.from(fileData, 'base64');
    console.log('Buffer created, size:', buffer.length, 'bytes');

    // Create a readable stream from buffer
    const stream = Readable.from(buffer);

    // Prepare file metadata - upload directly to main folder with employee name prefix
    const fullFileName = getEmployeeFileName(employeeName, leaveRequestId, fileName);
    const fileMetadata = {
      name: fullFileName,
      parents: [FOLDER_ID],
      mimeType: mimeType,
    };

    console.log('Uploading file with metadata:', fileMetadata);

    // Upload file
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: {
        mimeType: mimeType,
        body: stream,
      },
      fields: 'id, name, webViewLink, webContentLink, size',
    });

    console.log('File uploaded successfully:', response.data);

    // Make file accessible
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    console.log('Permissions set successfully');

    res.json({
      success: true,
      fileId: response.data.id,
      fileName: response.data.name,
      fileSize: response.data.size,
      webViewLink: response.data.webViewLink,
      webContentLink: response.data.webContentLink,
    });
  } catch (error) {
    console.error('Upload error details:', error);
    res.status(500).json({ 
      error: 'Failed to upload file',
      message: error.message,
      details: error.stack 
    });
  }
});

// Delete file from Google Drive
app.delete('/api/delete-from-drive/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    
    const drive = initializeDrive();
    await drive.files.delete({ fileId });

    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      error: 'Failed to delete file',
      message: error.message 
    });
  }
});

// Configure nodemailer transporter
const createEmailTransporter = () => {
  console.log('📧 Email Configuration Check:');
  console.log('   EMAIL_USER:', process.env.EMAIL_USER ? '✓ Set' : '✗ Not set');
  console.log('   EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✓ Set' : '✗ Not set');
  
  // Using Gmail SMTP
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'bimaided.website@gmail.com',
      pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_APP_PASSWORD
    }
  });
};

// Create transporter instance for use in all email endpoints
const transporter = createEmailTransporter();

// Verify reCAPTCHA token
app.post('/api/verify-recaptcha', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        success: false,
        error: 'Token is required' 
      });
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    
    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY not configured');
      // Allow submission if reCAPTCHA is not configured
      return res.json({ 
        success: true, 
        score: 1.0,
        message: 'reCAPTCHA not configured - allowing submission'
      });
    }

    // Verify token with Google
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;
    
    const response = await fetch(verifyUrl, {
      method: 'POST',
    });

    const data = await response.json();
    
    console.log('reCAPTCHA verification result:', {
      success: data.success,
      score: data.score,
      action: data.action,
      hostname: data.hostname
    });

    if (!data.success) {
      return res.status(400).json({
        success: false,
        error: 'reCAPTCHA verification failed',
        'error-codes': data['error-codes']
      });
    }

    res.json({
      success: true,
      score: data.score,
      action: data.action,
      hostname: data.hostname
    });

  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Verification failed',
      message: error.message 
    });
  }
});

// Send contact form email
app.post('/api/send-contact-email', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    console.log('Contact email request received:', { name, email, subject });

    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['name', 'email', 'phone', 'subject', 'message']
      });
    }

    // Create email transporter
    const transporter = createEmailTransporter();

    // Email to admin
    const mailOptions = {
      from: process.env.EMAIL_USER || 'bimaided.website@gmail.com',
      to: process.env.EMAIL_TO || 'tasneemlabeeb@gmail.com',
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1f2937;">Contact Information</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          
          <div style="padding: 20px; border-left: 4px solid #2563eb; background-color: #eff6ff; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1f2937;">Message</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
            <p>This email was sent from the BIMaided website contact form.</p>
            <p>Please respond to the customer at: ${email}</p>
          </div>
        </div>
      `,
      // Plain text version
      text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Phone: ${phone}
Subject: ${subject}

Message:
${message}

---
This email was sent from the BIMaided website contact form.
Please respond to the customer at: ${email}
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);

    res.json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Email sending error:', error);
    
    // Check if it's an authentication error
    if (error.code === 'EAUTH') {
      return res.status(500).json({ 
        error: 'Email authentication failed',
        message: 'Please configure EMAIL_USER and EMAIL_APP_PASSWORD in .env file'
      });
    }

    res.status(500).json({ 
      error: 'Failed to send email',
      message: error.message 
    });
  }
});

// Serve React app for all non-API routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    res.sendFile(join(__dirname, '../dist', 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 BIMaided ${process.env.NODE_ENV === 'production' ? 'Full Stack' : 'API'} Server running on port ${PORT}`);
  console.log(`📁 Google Drive Folder ID: ${FOLDER_ID}`);
  
  if (process.env.NODE_ENV === 'production') {
    console.log(`📱 Frontend served from: ${join(__dirname, 'public')}`);
    console.log(`🌐 Access your app at: http://localhost:${PORT}`);
  }
});

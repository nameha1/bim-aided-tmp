import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

// Initialize Supabase Admin Client
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('Supabase credentials not found in environment variables');
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Configure nodemailer transporter
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_APP_PASSWORD
    }
  });
};

export async function POST(req: Request) {
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
    } = await req.json();

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        required: ['email', 'password', 'firstName', 'lastName']
      }, { status: 400 });
    }

    // Check if EID already exists (if provided)
    if (eid) {
      const { data: existingEid } = await supabaseAdmin
        .from('employees')
        .select('id')
        .eq('eid', eid)
        .single();
      
      if (existingEid) {
        return NextResponse.json({
          error: 'EID already exists',
          message: 'An employee with this EID already exists. Please use a unique EID.'
        }, { status: 400 });
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
      return NextResponse.json({ 
        error: 'Failed to create auth user',
        message: authError.message 
      }, { status: 400 });
    }

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
      // Rollback: Delete the auth user if employee creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ 
        error: 'Failed to create employee record',
        message: employeeError.message 
      }, { status: 400 });
    }

    // Step 3: Create user role entry
    await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: 'employee'
      });

    // Step 4: Send welcome email with credentials
    try {
      const transporter = createEmailTransporter();
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
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" class="button">
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
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the employee creation if email fails
    }

    // Success response
    return NextResponse.json({
      success: true,
      user_id: authData.user.id,
      employee_id: employeeData.id,
      message: 'Employee account created successfully. Welcome email sent to employee.'
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
  }
}

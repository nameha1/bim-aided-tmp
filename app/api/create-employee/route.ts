import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { verifyAdminAuth } from '@/lib/firebase/auth-helpers';

export async function POST(req: NextRequest) {
  // Verify admin authentication
  const { data: authData, error: authError, response: authResponse } = await verifyAdminAuth(req);
  if (authError || !authData) {
    console.error('Admin auth verification failed:', authError);
    return authResponse!;
  }

  try {
    const body = await req.json();
    
    const {
      email,
      password,
      firstName,
      lastName,
      eid,
      gender,
      dateOfBirth,
      nationalId,
      tin,
      phoneNumber,
      address,
      joiningDate,
      department,
      subDepartment,
      designation,
      supervisorId,
      grossSalary,
      bankName,
      bankAccountNumber,
      bankBranch,
      bankRoutingNumber,
      emergencyPersonName,
      emergencyPersonContact,
      emergencyPersonAddress,
      profileImageUrl,
      documentUrls,
    } = body;

    console.log('Creating employee with data:', {
      email,
      firstName,
      lastName,
      eid,
      department,
      designation,
    });

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      console.error('Missing required fields');
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: email, password, firstName, lastName' 
        },
        { status: 400 }
      );
    }

    // Validate employment fields
    if (!joiningDate) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Joining date is required' 
        },
        { status: 400 }
      );
    }

    if (!department) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Department is required' 
        },
        { status: 400 }
      );
    }

    if (!designation) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Designation is required' 
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid email format' 
        },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Password must be at least 6 characters long' 
        },
        { status: 400 }
      );
    }

    // Check if adminAuth is initialized
    if (!adminAuth) {
      console.error('Firebase Admin Auth is not initialized');
      return NextResponse.json(
        { 
          success: false,
          error: 'Firebase Admin is not properly configured. Please check server configuration.' 
        },
        { status: 500 }
      );
    }

    // Create Firebase Auth user
    let authUser;
    try {
      console.log('Creating Firebase Auth user for:', email);
      authUser = await adminAuth.createUser({
        email,
        password,
        displayName: `${firstName} ${lastName}`,
        emailVerified: false,
      });
      console.log('Firebase Auth user created successfully:', authUser.uid);
    } catch (authError: any) {
      console.error('Error creating auth user:', authError);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to create authentication account';
      if (authError.code === 'auth/email-already-exists') {
        errorMessage = 'An account with this email already exists';
      } else if (authError.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (authError.code === 'auth/invalid-password') {
        errorMessage = 'Password is too weak';
      } else if (authError.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password authentication is not enabled';
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: errorMessage,
          details: authError.message,
          code: authError.code
        },
        { status: 400 }
      );
    }

    try {
      // Check if adminDb is initialized
      if (!adminDb) {
        console.error('Firebase Admin Firestore is not initialized');
        throw new Error('Firebase Admin is not properly configured');
      }

      // Create employee document in Firestore
      const employeeData = {
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        email,
        eid: eid || null,
        gender: gender || null,
        date_of_birth: dateOfBirth || null,
        national_id: nationalId || null,
        tin: tin || null,
        phone: phoneNumber || null,
        address: address || null,
        hire_date: joiningDate || new Date().toISOString().split('T')[0],
        department: department || null,
        sub_department: subDepartment || null,
        designation: designation || null,
        supervisor_id: supervisorId || null,
        status: 'active',
        gross_salary: grossSalary ? parseFloat(grossSalary) : null,
        bank_name: bankName || null,
        bank_account_number: bankAccountNumber || null,
        bank_branch: bankBranch || null,
        bank_routing_number: bankRoutingNumber || null,
        emergency_person_name: emergencyPersonName || null,
        emergency_person_contact: emergencyPersonContact || null,
        emergency_person_address: emergencyPersonAddress || null,
        profile_image_url: profileImageUrl || null,
        document_urls: documentUrls || [],
        auth_uid: authUser.uid,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('Creating employee document in Firestore...');
      const employeeRef = await adminDb.collection('employees').add(employeeData);
      console.log('Employee document created with ID:', employeeRef.id);

      // Create user document
      console.log('Creating user document...');
      await adminDb.collection('users').doc(authUser.uid).set({
        email,
        displayName: `${firstName} ${lastName}`,
        role: 'employee',
        employee_id: employeeRef.id,
        created_at: new Date().toISOString(),
      });
      console.log('User document created');

      // Set user role
      console.log('Setting user role...');
      await adminDb.collection('user_roles').doc(authUser.uid).set({
        role: 'employee',
        email,
        employee_id: employeeRef.id,
        created_at: new Date().toISOString(),
      });
      console.log('User role set successfully');

      return NextResponse.json({
        success: true,
        data: {
          id: employeeRef.id,
          uid: authUser.uid,
          email: authUser.email,
          name: `${firstName} ${lastName}`,
        },
        message: 'Employee created successfully',
      });

    } catch (firestoreError: any) {
      // If Firestore fails, clean up the auth user
      console.error('Error creating employee document:', firestoreError);
      try {
        await adminAuth.deleteUser(authUser.uid);
      } catch (cleanupError) {
        console.error('Error cleaning up auth user:', cleanupError);
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to create employee record',
          details: firestoreError.message
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error in create-employee:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

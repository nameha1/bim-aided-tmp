import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function POST(req: Request) {
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
      phoneNumber,
      address,
      joiningDate,
      departmentId,
      designationId,
      supervisorId,
      basicSalary,
      bankName,
      bankAccountNumber,
      bankBranch,
    } = body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: email, password, firstName, lastName' 
        },
        { status: 400 }
      );
    }

    // Create Firebase Auth user
    let authUser;
    try {
      authUser = await adminAuth.createUser({
        email,
        password,
        displayName: `${firstName} ${lastName}`,
        emailVerified: false,
      });
    } catch (authError: any) {
      console.error('Error creating auth user:', authError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to create authentication account',
          details: authError.message
        },
        { status: 400 }
      );
    }

    try {
      // Get department and designation names for denormalization
      let departmentName = null;
      let designationTitle = null;

      if (departmentId) {
        const deptDoc = await adminDb.collection('departments').doc(departmentId).get();
        if (deptDoc.exists) {
          departmentName = deptDoc.data()?.name;
        }
      }

      if (designationId) {
        const desigDoc = await adminDb.collection('designations').doc(designationId).get();
        if (desigDoc.exists) {
          designationTitle = desigDoc.data()?.title;
        }
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
        phone: phoneNumber || null,
        address: address || null,
        hire_date: joiningDate || new Date().toISOString().split('T')[0],
        department: departmentName || null,
        department_id: departmentId || null,
        designation: designationTitle || null,
        designation_id: designationId || null,
        supervisor_id: supervisorId || null,
        status: 'active',
        salary: basicSalary ? parseFloat(basicSalary) : null,
        bank_name: bankName || null,
        bank_account_number: bankAccountNumber || null,
        bank_branch: bankBranch || null,
        auth_uid: authUser.uid,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const employeeRef = await adminDb.collection('employees').add(employeeData);

      // Create user document
      await adminDb.collection('users').doc(authUser.uid).set({
        email,
        displayName: `${firstName} ${lastName}`,
        role: 'employee',
        employee_id: employeeRef.id,
        created_at: new Date().toISOString(),
      });

      // Set user role
      await adminDb.collection('user_roles').doc(authUser.uid).set({
        role: 'employee',
        email,
        employee_id: employeeRef.id,
        created_at: new Date().toISOString(),
      });

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

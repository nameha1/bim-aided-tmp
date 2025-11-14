import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAdminAuth } from '@/lib/firebase/auth-helpers';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verify admin authentication
  const { data: authData, error: authError, response: authResponse } = await verifyAdminAuth(req);
  if (authError || !authData) {
    return authResponse!;
  }

  try {
    const employeeId = params.id;

    if (!employeeId) {
      return NextResponse.json(
        { success: false, error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const body = await req.json();
    
    const {
      firstName,
      lastName,
      email,
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
      employmentStatus,
      basicSalary,
      bankName,
      bankAccountNumber,
      bankBranch,
      bankRoutingNumber,
      emergencyPersonName,
      emergencyPersonContact,
      emergencyPersonAddress,
      profileImageUrl,
    } = body;

    // Update employee document in Firestore
    const employeeData: any = {
      firstName: firstName || null,
      lastName: lastName || null,
      name: `${firstName || ''} ${lastName || ''}`.trim(),
      email: email || null,
      eid: eid || null,
      gender: gender || null,
      date_of_birth: dateOfBirth || null,
      national_id: nationalId || null,
      tin: tin || null,
      phone: phoneNumber || null,
      address: address || null,
      hire_date: joiningDate || null,
      department: department || null,
      sub_department: subDepartment || null,
      designation: designation || null,
      supervisor_id: supervisorId || null,
      status: employmentStatus || 'active',
      gross_salary: basicSalary ? parseFloat(basicSalary) : null,
      salary: basicSalary ? parseFloat(basicSalary) : null, // Keep both for compatibility
      bank_name: bankName || null,
      bank_account_number: bankAccountNumber || null,
      bank_branch: bankBranch || null,
      bank_routing_number: bankRoutingNumber || null,
      emergency_person_name: emergencyPersonName || null,
      emergency_person_contact: emergencyPersonContact || null,
      emergency_person_address: emergencyPersonAddress || null,
      profileImageUrl: profileImageUrl || null,
      updated_at: new Date().toISOString(),
    };

    // Remove null values
    Object.keys(employeeData).forEach(key => {
      if (employeeData[key] === null) {
        delete employeeData[key];
      }
    });

    await adminDb.collection('employees').doc(employeeId).update(employeeData);

    return NextResponse.json({
      success: true,
      message: 'Employee updated successfully',
    });

  } catch (error: any) {
    console.error('Error updating employee:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update employee',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

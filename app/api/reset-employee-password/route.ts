import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { verifyAdminAuth } from '@/lib/firebase/auth-helpers';

export async function POST(request: NextRequest) {
  // Verify admin authentication
  const { data: authData, error: authError, response: authResponse } = await verifyAdminAuth(request);
  if (authError || !authData) {
    return authResponse!;
  }

  try {
    const body = await request.json();
    const { employeeId, newPassword } = body;

    if (!employeeId || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Employee ID and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Get employee document to find the auth_uid
    const employeeDoc = await adminDb.collection('employees').doc(employeeId).get();
    
    if (!employeeDoc.exists) {
      return NextResponse.json(
        { success: false, message: 'Employee not found' },
        { status: 404 }
      );
    }

    const employeeData = employeeDoc.data();
    let authUid = employeeData?.auth_uid;

    // If no auth_uid in employee doc, try to find it from users collection
    // (for backwards compatibility with older employee records)
    if (!authUid) {
      const usersSnapshot = await adminDb
        .collection('users')
        .where('employee_id', '==', employeeId)
        .limit(1)
        .get();

      if (usersSnapshot.empty) {
        return NextResponse.json(
          { success: false, message: 'User account not found for this employee' },
          { status: 404 }
        );
      }

      const userDoc = usersSnapshot.docs[0];
      // The auth_uid is the document ID in users collection
      authUid = userDoc.id;
      
      // Also check the auth_uid field if it exists
      const userData = userDoc.data();
      if (userData.auth_uid) {
        authUid = userData.auth_uid;
      }
    }

    if (!authUid) {
      return NextResponse.json(
        { success: false, message: 'Auth UID not found for this user' },
        { status: 404 }
      );
    }

    // Update password in Firebase Auth
    await adminAuth.updateUser(authUid, {
      password: newPassword,
    });

    // Note: In a production environment, you would typically send an email
    // to the user with their new password or a password reset link
    // For now, we'll just return success

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
      data: {
        employeeId,
        email: employeeData?.email,
      },
    });
  } catch (error: any) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to reset password',
      },
      { status: 500 }
    );
  }
}

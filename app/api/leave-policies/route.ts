import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAdminAuth } from '@/lib/firebase/auth-helpers';

// GET - Fetch all leave policies
export async function GET(request: NextRequest) {
  // Verify admin authentication
  const { data: authData, error: authError, response: authResponse } = await verifyAdminAuth(request);
  if (authError || !authData) {
    return authResponse!;
  }

  try {
    const leavePoliciesSnapshot = await adminDb
      .collection('leave_policies')
      .orderBy('name', 'asc')
      .get();

    const leavePolicies = leavePoliciesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      data: leavePolicies,
    });
  } catch (error: any) {
    console.error('Error fetching leave policies:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to fetch leave policies' 
      },
      { status: 500 }
    );
  }
}

// POST - Create a new leave policy
export async function POST(request: NextRequest) {
  // Verify admin authentication
  const { data: authData, error: authError, response: authResponse } = await verifyAdminAuth(request);
  if (authError || !authData) {
    return authResponse!;
  }

  try {
    const body = await request.json();
    const { name, days_allowed, impacts_salary, description } = body;

    // Validate required fields
    if (!name || days_allowed === undefined || days_allowed < 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Name and days_allowed are required fields' 
        },
        { status: 400 }
      );
    }

    // Check if leave type with same name already exists
    const existingSnapshot = await adminDb
      .collection('leave_policies')
      .where('name', '==', name)
      .get();

    if (!existingSnapshot.empty) {
      return NextResponse.json(
        { 
          success: false,
          error: 'A leave type with this name already exists' 
        },
        { status: 400 }
      );
    }

    // Create new leave policy
    const leavePolicyData = {
      name,
      days_allowed: parseInt(days_allowed),
      impacts_salary: impacts_salary === true,
      description: description || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: authData.userId,
    };

    const docRef = await adminDb.collection('leave_policies').add(leavePolicyData);

    return NextResponse.json({
      success: true,
      data: {
        id: docRef.id,
        ...leavePolicyData,
      },
      message: 'Leave policy created successfully',
    });
  } catch (error: any) {
    console.error('Error creating leave policy:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to create leave policy' 
      },
      { status: 500 }
    );
  }
}

// PUT - Update an existing leave policy
export async function PUT(request: NextRequest) {
  // Verify admin authentication
  const { data: authData, error: authError, response: authResponse } = await verifyAdminAuth(request);
  if (authError || !authData) {
    return authResponse!;
  }

  try {
    const body = await request.json();
    const { id, name, days_allowed, impacts_salary, description } = body;

    if (!id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Leave policy ID is required' 
        },
        { status: 400 }
      );
    }

    // Check if leave policy exists
    const docRef = adminDb.collection('leave_policies').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Leave policy not found' 
        },
        { status: 404 }
      );
    }

    // Prepare updates
    const updates: any = {
      updated_at: new Date().toISOString(),
      updated_by: authData.userId,
    };

    if (name !== undefined) updates.name = name;
    if (days_allowed !== undefined) updates.days_allowed = parseInt(days_allowed);
    if (impacts_salary !== undefined) updates.impacts_salary = impacts_salary === true;
    if (description !== undefined) updates.description = description;

    // Check for duplicate name if name is being updated
    if (name && name !== doc.data()?.name) {
      const existingSnapshot = await adminDb
        .collection('leave_policies')
        .where('name', '==', name)
        .get();

      if (!existingSnapshot.empty && existingSnapshot.docs[0].id !== id) {
        return NextResponse.json(
          { 
            success: false,
            error: 'A leave type with this name already exists' 
          },
          { status: 400 }
        );
      }
    }

    await docRef.update(updates);

    return NextResponse.json({
      success: true,
      data: {
        id,
        ...doc.data(),
        ...updates,
      },
      message: 'Leave policy updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating leave policy:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to update leave policy' 
      },
      { status: 500 }
    );
  }
}

// DELETE - Remove a leave policy
export async function DELETE(request: NextRequest) {
  // Verify admin authentication
  const { data: authData, error: authError, response: authResponse } = await verifyAdminAuth(request);
  if (authError || !authData) {
    return authResponse!;
  }

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Leave policy ID is required' 
        },
        { status: 400 }
      );
    }

    // Check if leave policy exists
    const docRef = adminDb.collection('leave_policies').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Leave policy not found' 
        },
        { status: 404 }
      );
    }

    // Check if any leave requests use this policy
    const leaveRequestsSnapshot = await adminDb
      .collection('leave_requests')
      .where('leave_type_id', '==', id)
      .limit(1)
      .get();

    if (!leaveRequestsSnapshot.empty) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Cannot delete leave policy that is being used by leave requests. Please reassign or delete those requests first.' 
        },
        { status: 400 }
      );
    }

    await docRef.delete();

    return NextResponse.json({
      success: true,
      message: 'Leave policy deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting leave policy:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to delete leave policy' 
      },
      { status: 500 }
    );
  }
}

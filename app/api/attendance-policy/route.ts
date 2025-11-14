import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAdminAuth } from '@/lib/firebase/auth-helpers';

const ATTENDANCE_POLICY_DOC_ID = 'default_policy';

interface AttendancePolicy {
  office_start_time: string;
  office_end_time: string;
  grace_period_minutes: number;
  late_arrivals_per_day: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

// GET - Fetch attendance policy
export async function GET(request: NextRequest) {
  // Verify admin authentication
  const { data: authData, error: authError, response: authResponse } = await verifyAdminAuth(request);
  if (authError || !authData) {
    return authResponse!;
  }

  try {
    const policyDoc = await adminDb
      .collection('attendance_policy')
      .doc(ATTENDANCE_POLICY_DOC_ID)
      .get();

    if (!policyDoc.exists) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No attendance policy found' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: policyDoc.id,
        ...policyDoc.data(),
      },
    });
  } catch (error: any) {
    console.error('Error fetching attendance policy:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to fetch attendance policy' 
      },
      { status: 500 }
    );
  }
}

// POST - Create attendance policy
export async function POST(request: NextRequest) {
  // Verify admin authentication
  const { data: authData, error: authError, response: authResponse } = await verifyAdminAuth(request);
  if (authError || !authData) {
    return authResponse!;
  }

  try {
    const body = await request.json();
    const { 
      office_start_time, 
      office_end_time, 
      grace_period_minutes, 
      late_arrivals_per_day 
    } = body;

    // Validate required fields
    if (!office_start_time || !office_end_time) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Office start time and end time are required' 
        },
        { status: 400 }
      );
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(office_start_time) || !timeRegex.test(office_end_time)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid time format. Use HH:MM format (e.g., 09:00)' 
        },
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (grace_period_minutes < 0 || grace_period_minutes > 120) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Grace period must be between 0 and 120 minutes' 
        },
        { status: 400 }
      );
    }

    if (late_arrivals_per_day < 1 || late_arrivals_per_day > 30) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Late arrivals per day must be between 1 and 30' 
        },
        { status: 400 }
      );
    }

    // Check if policy already exists
    const existingDoc = await adminDb
      .collection('attendance_policy')
      .doc(ATTENDANCE_POLICY_DOC_ID)
      .get();

    if (existingDoc.exists) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Attendance policy already exists. Use PUT to update.' 
        },
        { status: 400 }
      );
    }

    // Create policy
    const policyData: AttendancePolicy = {
      office_start_time,
      office_end_time,
      grace_period_minutes: parseInt(grace_period_minutes.toString()),
      late_arrivals_per_day: parseInt(late_arrivals_per_day.toString()),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: authData.userId,
    };

    await adminDb
      .collection('attendance_policy')
      .doc(ATTENDANCE_POLICY_DOC_ID)
      .set(policyData);

    return NextResponse.json({
      success: true,
      data: {
        id: ATTENDANCE_POLICY_DOC_ID,
        ...policyData,
      },
      message: 'Attendance policy created successfully',
    });
  } catch (error: any) {
    console.error('Error creating attendance policy:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to create attendance policy' 
      },
      { status: 500 }
    );
  }
}

// PUT - Update attendance policy
export async function PUT(request: NextRequest) {
  // Verify admin authentication
  const { data: authData, error: authError, response: authResponse } = await verifyAdminAuth(request);
  if (authError || !authData) {
    return authResponse!;
  }

  try {
    const body = await request.json();
    const { 
      office_start_time, 
      office_end_time, 
      grace_period_minutes, 
      late_arrivals_per_day 
    } = body;

    // Validate time format if provided
    if (office_start_time || office_end_time) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (office_start_time && !timeRegex.test(office_start_time)) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid start time format. Use HH:MM format' 
          },
          { status: 400 }
        );
      }
      if (office_end_time && !timeRegex.test(office_end_time)) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid end time format. Use HH:MM format' 
          },
          { status: 400 }
        );
      }
    }

    // Validate numeric fields if provided
    if (grace_period_minutes !== undefined) {
      const gracePeriod = parseInt(grace_period_minutes.toString());
      if (gracePeriod < 0 || gracePeriod > 120) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Grace period must be between 0 and 120 minutes' 
          },
          { status: 400 }
        );
      }
    }

    if (late_arrivals_per_day !== undefined) {
      const lateArrivals = parseInt(late_arrivals_per_day.toString());
      if (lateArrivals < 1 || lateArrivals > 30) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Late arrivals per day must be between 1 and 30' 
          },
          { status: 400 }
        );
      }
    }

    // Get existing policy
    const docRef = adminDb.collection('attendance_policy').doc(ATTENDANCE_POLICY_DOC_ID);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Attendance policy not found. Use POST to create.' 
        },
        { status: 404 }
      );
    }

    // Prepare updates
    const updates: any = {
      updated_at: new Date().toISOString(),
      updated_by: authData.userId,
    };

    if (office_start_time !== undefined) updates.office_start_time = office_start_time;
    if (office_end_time !== undefined) updates.office_end_time = office_end_time;
    if (grace_period_minutes !== undefined) {
      updates.grace_period_minutes = parseInt(grace_period_minutes.toString());
    }
    if (late_arrivals_per_day !== undefined) {
      updates.late_arrivals_per_day = parseInt(late_arrivals_per_day.toString());
    }

    await docRef.update(updates);

    const updatedDoc = await docRef.get();

    return NextResponse.json({
      success: true,
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      },
      message: 'Attendance policy updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating attendance policy:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to update attendance policy' 
      },
      { status: 500 }
    );
  }
}

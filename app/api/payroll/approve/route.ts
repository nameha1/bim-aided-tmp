import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const { payrollIds, action, approvedBy } = await req.json();

    if (!payrollIds || !Array.isArray(payrollIds) || payrollIds.length === 0) {
      return NextResponse.json({ 
        error: 'Payroll IDs are required',
        message: 'Please select at least one payroll record'
      }, { status: 400 });
    }

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ 
        error: 'Invalid action',
        message: 'Action must be either "approve" or "reject"'
      }, { status: 400 });
    }

    const batch = adminDb.batch();
    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    for (const payrollId of payrollIds) {
      const payrollRef = adminDb.collection('payroll').doc(payrollId);
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (action === 'approve' && approvedBy) {
        updateData.approved_by = approvedBy;
        updateData.approved_at = new Date().toISOString();
      } else if (action === 'reject' && approvedBy) {
        updateData.rejected_by = approvedBy;
        updateData.rejected_at = new Date().toISOString();
      }

      batch.update(payrollRef, updateData);
    }

    await batch.commit();

    return NextResponse.json({ 
      success: true,
      message: `${payrollIds.length} payroll record(s) ${action}d successfully`
    });
  } catch (error: any) {
    console.error('Payroll approval error:', error);
    return NextResponse.json({ 
      error: 'Failed to process payroll',
      message: error.message 
    }, { status: 500 });
  }
}

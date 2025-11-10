import { NextRequest, NextResponse } from 'next/server';
import { getDocuments } from '@/lib/firebase/firestore';
import { where } from 'firebase/firestore';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eid: string }> }
) {
  try {
    const { eid } = await params;

    // Query employees collection by EID
    const { data, error } = await getDocuments('employees', [
      where('eid', '==', eid)
    ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Return only the email field
    return NextResponse.json({ email: data[0].email });
  } catch (error: any) {
    console.error('Employee lookup error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}

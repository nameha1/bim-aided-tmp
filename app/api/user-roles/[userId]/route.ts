import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Get user role from Firestore using Admin SDK
    const roleDoc = await adminDb.collection('user_roles').doc(userId).get();

    if (!roleDoc.exists) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    const roleData = roleDoc.data();
    return NextResponse.json(roleData);
  } catch (error: any) {
    console.error('Role fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}

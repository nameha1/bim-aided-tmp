import { NextResponse } from 'next/server';

export async function PUT(req: Request) {
  return NextResponse.json({ error: 'Not implemented', message: 'API migrating to Firebase' }, { status: 501 });
}

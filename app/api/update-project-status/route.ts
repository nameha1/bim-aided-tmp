import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase Admin Client
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('Supabase credentials not found in environment variables');
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(req: Request) {
  try {
    const { projectId, published } = await req.json();

    if (projectId === undefined || typeof published !== 'boolean') {
      return NextResponse.json({ error: 'Project ID and a boolean "published" status are required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('projects')
      .update({ published })
      .eq('id', projectId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update project status', message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Project status updated successfully.', project: data });

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
  }
}

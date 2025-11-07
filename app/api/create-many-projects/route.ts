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
    const { projects } = await req.json();

    if (!Array.isArray(projects) || projects.length === 0) {
      return NextResponse.json({ error: 'A non-empty array of projects is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert(projects)
      .select();

    if (error) {
      return NextResponse.json({ error: 'Failed to create projects', message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `${data.length} projects created successfully.`, projects: data });

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
  }
}

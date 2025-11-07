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
    const projectData = await req.json();

    if (!projectData.name || !projectData.client_name) {
      return NextResponse.json({ error: 'Project name and client name are required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert(projectData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to create project', message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Project created successfully.', project: data });

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
  }
}

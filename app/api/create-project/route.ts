import { NextResponse } from 'next/server';
import { createDocument } from '@/lib/firebase/firestore';

export async function POST(req: Request) {
  try {
    const projectData = await req.json();

    // Validate required fields
    if (!projectData.title) {
      return NextResponse.json({ 
        error: 'Project title is required',
        received: projectData 
      }, { status: 400 });
    }

    // Add created_at timestamp
    const projectWithTimestamp = {
      ...projectData,
      created_at: new Date(),
    };

    const { data: projectId, error } = await createDocument('projects', projectWithTimestamp);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ 
        error: 'Failed to create project', 
        message: error.message
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Project created successfully.', 
      project: { id: projectId, ...projectWithTimestamp } 
    });

  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: error.message 
    }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { createDocument } from '@/lib/firebase/firestore';

export async function POST(req: Request) {
  try {
    const { projects } = await req.json();

    if (!Array.isArray(projects) || projects.length === 0) {
      return NextResponse.json({ error: 'A non-empty array of projects is required' }, { status: 400 });
    }

    // Create multiple projects in Firestore
    const results = await Promise.all(
      projects.map(project => createDocument('projects', {
        ...project,
        created_at: new Date()
      }))
    );

    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      return NextResponse.json({ 
        error: 'Some projects failed to create',
        message: `${errors.length} out of ${projects.length} projects failed`
      }, { status: 400 });
    }

    const createdProjects = results.map((r, i) => ({
      id: r.data,
      ...projects[i]
    }));

    return NextResponse.json({ 
      success: true, 
      message: `${createdProjects.length} projects created successfully.`, 
      projects: createdProjects 
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: error.message 
    }, { status: 500 });
  }
}

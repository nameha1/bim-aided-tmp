import { NextRequest, NextResponse } from 'next/server';
import { updateDocument, deleteDocument } from '@/lib/firebase/firestore';

/**
 * PUT /api/update-project/[id]
 * Update a project
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectData = await request.json();

    // Update project in Firestore
    const { error } = await updateDocument('projects', id, {
      ...projectData,
      updated_at: new Date(),
    });

    if (error) {
      console.error('Error updating project:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update project', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Project updated successfully',
    });
  } catch (error: any) {
    console.error('Error in update-project:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/update-project/[id]
 * Delete a project
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete project from Firestore
    const { error } = await deleteDocument('projects', id);

    if (error) {
      console.error('Error deleting project:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete project', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error: any) {
    console.error('Error in delete-project:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

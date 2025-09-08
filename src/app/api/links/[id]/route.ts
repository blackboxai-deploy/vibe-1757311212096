import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';
import { DeleteResponse } from '@/types';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
   try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json<DeleteResponse>(
        { success: false, message: '', error: 'Link ID is required' },
        { status: 400 }
      );
    }

    // Check if link exists
    const existingLink = database.getLinkById(id);
    if (!existingLink) {
      return NextResponse.json<DeleteResponse>(
        { success: false, message: '', error: 'Link not found' },
        { status: 404 }
      );
    }

    // Delete the link (this will also delete associated locations due to CASCADE)
    const deleted = database.deleteLink(id);

    if (!deleted) {
      return NextResponse.json<DeleteResponse>(
        { success: false, message: '', error: 'Failed to delete link' },
        { status: 500 }
      );
    }

    return NextResponse.json<DeleteResponse>({
      success: true,
      message: 'Link and associated locations deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting link:', error);
    return NextResponse.json<DeleteResponse>(
      { success: false, message: '', error: 'Internal server error' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';
import { DeleteResponse } from '@/types';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const locationId = parseInt(id, 10);

    if (isNaN(locationId)) {
      return NextResponse.json<DeleteResponse>(
        { success: false, message: '', error: 'Invalid location ID' },
        { status: 400 }
      );
    }

    // Delete the location
    const deleted = database.deleteLocation(locationId);

    if (!deleted) {
      return NextResponse.json<DeleteResponse>(
        { success: false, message: '', error: 'Location not found or failed to delete' },
        { status: 404 }
      );
    }

    return NextResponse.json<DeleteResponse>({
      success: true,
      message: 'Location deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting location:', error);
    return NextResponse.json<DeleteResponse>(
      { success: false, message: '', error: 'Internal server error' },
      { status: 500 }
    );
  }
}
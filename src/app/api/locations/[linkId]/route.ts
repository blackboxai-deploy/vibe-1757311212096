import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';
import { LocationsResponse } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const { linkId } = await params;

    // Check if link exists
    const link = database.getLinkById(linkId);
    if (!link) {
      return NextResponse.json<LocationsResponse>(
        { success: false, locations: [], error: 'Link not found' },
        { status: 404 }
      );
    }

    // Get all locations for this link
    const locations = database.getLocationsByLinkId(linkId);

    return NextResponse.json<LocationsResponse>({
      success: true,
      locations
    });

  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json<LocationsResponse>(
      { success: false, locations: [], error: 'Internal server error' },
      { status: 500 }
    );
  }
}
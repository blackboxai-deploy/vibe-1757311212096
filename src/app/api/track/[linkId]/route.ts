import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';
import { getClientIP, getLocationFromIP } from '@/lib/geolocation';
import { TrackLocationRequest, TrackLocationResponse } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const { linkId } = await params;
    const body: TrackLocationRequest = await request.json();

    // Validate link exists
    const link = database.getLinkById(linkId);
    if (!link) {
      return NextResponse.json<TrackLocationResponse>(
        { success: false, message: 'Invalid tracking link', error: 'Link not found' },
        { status: 404 }
      );
    }

    // Validate required coordinates
    if (typeof body.latitude !== 'number' || typeof body.longitude !== 'number') {
      return NextResponse.json<TrackLocationResponse>(
        { success: false, message: 'Invalid coordinates', error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    // Extract request metadata
    const clientIP = getClientIP(request.headers);
    const userAgent = request.headers.get('user-agent') || undefined;

    // Get IP-based location as additional context
    let ipLocation: any = {};
    if (clientIP) {
      ipLocation = await getLocationFromIP(clientIP);
    }

    // Store the location data
    database.createLocation(
      linkId,
      body.latitude,
      body.longitude,
      clientIP,
      userAgent,
      ipLocation.city || undefined,
      ipLocation.country || undefined,
      body.accuracy
    );

    return NextResponse.json<TrackLocationResponse>({
      success: true,
      message: 'Location tracked successfully'
    });

  } catch (error) {
    console.error('Error tracking location:', error);
    return NextResponse.json<TrackLocationResponse>(
      { success: false, message: 'Failed to track location', error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const { linkId } = await params;

    // Check if link exists
    const link = database.getLinkById(linkId);
    if (!link) {
      return NextResponse.json(
        { success: false, error: 'Link not found' },
        { status: 404 }
      );
    }

    // This is the tracking page - just return link info for display
    return NextResponse.json({
      success: true,
      link: {
        id: link.id,
        title: link.title,
        is_active: link.is_active
      }
    });

  } catch (error) {
    console.error('Error fetching track info:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
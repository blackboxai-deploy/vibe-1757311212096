import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';
import { generateTrackingId } from '@/lib/geolocation';
import { CreateLinkRequest, CreateLinkResponse, LinksResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: CreateLinkRequest = await request.json();
    
    if (!body.title || body.title.trim().length === 0) {
      return NextResponse.json<CreateLinkResponse>(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    const linkId = generateTrackingId();
    const title = body.title.trim();

    database.createLink(linkId, title);

    const newLink = database.getLinkById(linkId);

    if (!newLink) {
      return NextResponse.json<CreateLinkResponse>(
        { success: false, error: 'Failed to create link' },
        { status: 500 }
      );
    }

    return NextResponse.json<CreateLinkResponse>({
      success: true,
      link: newLink
    });

  } catch (error) {
    console.error('Error creating link:', error);
    return NextResponse.json<CreateLinkResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const links = database.getLinks();
    
    return NextResponse.json<LinksResponse>({
      success: true,
      links
    });

  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json<LinksResponse>(
      { success: false, links: [], error: 'Internal server error' },
      { status: 500 }
    );
  }
}
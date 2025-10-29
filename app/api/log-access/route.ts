import { NextRequest, NextResponse } from 'next/server';
import { logAccess } from '../../../lib/accessLogger';

export async function POST(request: NextRequest) {
  try {
    // Log the access from the client
    logAccess(request);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging access:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

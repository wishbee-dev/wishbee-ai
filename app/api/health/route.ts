// app/api/health/route.ts
// Health check endpoint for Docker and AWS ALB

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'wishbee-ai'
    },
    { status: 200 }
  );
}

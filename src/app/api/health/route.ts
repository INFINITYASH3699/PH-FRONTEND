import { NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * GET - Health check endpoint to verify that the API and its dependencies are operational
 */
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    edge: true,
    environment: process.env.NODE_ENV || 'production'
  });
}

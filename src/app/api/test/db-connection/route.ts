import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const connection = await dbConnect();

    // Check if connection is successful
    const isConnected = connection.connection?.readyState === 1;

    return NextResponse.json({
      success: true,
      message: isConnected
        ? 'Successfully connected to MongoDB'
        : 'Not connected to MongoDB',
      status: isConnected ? 'connected' : 'disconnected',
      mockMode: process.env.MONGODB_URI?.includes('placeholder') || false,
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to connect to database',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

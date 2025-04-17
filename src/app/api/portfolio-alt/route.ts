import { NextRequest, NextResponse } from 'next/server';

// Make this an Edge API route
export const runtime = 'edge';

/**
 * GET - Fetch a user's portfolio by username or subdomain (using query parameter)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        {
          success: false,
          error: 'Username is required as a query parameter'
        },
        { status: 400 }
      );
    }

    // For now, return a mock response to test deployment
    return NextResponse.json({
      success: true,
      message: `This is a mock response for portfolio with username: ${username}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to fetch portfolio:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch portfolio'
      },
      { status: 500 }
    );
  }
}

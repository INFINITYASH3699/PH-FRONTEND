import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import { Template } from '@/models/Template';
import { auth } from '@/lib/auth';

// Edge runtime for Vercel compatibility
export const runtime = 'edge';

/**
 * GET - Get a template by ID
 */
export async function GET(
  request: NextRequest,
  { params }: any
) {
  try {
    const id = params.id;

    // For now, return a mock response for deployment testing
    return NextResponse.json({
      success: true,
      message: `Mock template data for ID: ${id}`,
      template: {
        id,
        name: "Sample Template",
        description: "This is a placeholder template response",
        isPremium: false,
        canUse: true,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to fetch template:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch template'
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update a template (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: any
) {
  return NextResponse.json(
    {
      success: false,
      error: 'This endpoint is temporarily disabled during Edge deployment'
    },
    { status: 503 }
  );
}

/**
 * DELETE - Delete a template (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: any
) {
  return NextResponse.json(
    {
      success: false,
      error: 'This endpoint is temporarily disabled during Edge deployment'
    },
    { status: 503 }
  );
}

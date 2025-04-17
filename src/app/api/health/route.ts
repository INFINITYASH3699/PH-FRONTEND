import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import { v2 as cloudinary } from 'cloudinary';

/**
 * GET - Health check endpoint to verify that the API and its dependencies are operational
 */
export async function GET() {
  const healthCheck = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    environment: process.env.NODE_ENV,
    status: 'healthy',
    checks: {
      database: { status: 'pending' },
      cloudinary: { status: 'pending' }
    }
  };

  try {
    // Check MongoDB connection
    await dbConnect();
    healthCheck.checks.database = { status: 'up' };
  } catch (error) {
    healthCheck.checks.database = {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    healthCheck.status = 'unhealthy';
  }

  // Check Cloudinary connection (if configured)
  if (process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET) {
    try {
      const cloudinaryResult = await cloudinary.api.ping();
      healthCheck.checks.cloudinary = {
        status: 'up',
        response: cloudinaryResult.status
      };
    } catch (error) {
      healthCheck.checks.cloudinary = {
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      healthCheck.status = 'unhealthy';
    }
  } else {
    healthCheck.checks.cloudinary = {
      status: 'unconfigured',
      message: 'Cloudinary environment variables not set'
    };
  }

  // Return health status with appropriate HTTP code
  return NextResponse.json(
    healthCheck,
    {
      status: healthCheck.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    }
  );
}

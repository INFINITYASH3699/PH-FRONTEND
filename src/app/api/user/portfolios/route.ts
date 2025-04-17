import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import { Portfolio } from '@/models/Portfolio';

export async function GET(request: NextRequest) {
  try {
    // Get the user session to check authentication
    const session = await auth();

    // If not authenticated, return error
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Get the user ID from the session
    const userId = session.user.id;

    // Query all portfolios belonging to the user
    // We're using lean() to get plain JavaScript objects instead of Mongoose documents
    // This makes the response smaller and faster
    const portfolios = await Portfolio.find({ userId })
      .populate('templateId', 'name previewImage category') // Populate the template information
      .sort({ updatedAt: -1 }) // Sort by most recently updated
      .lean();

    // Return the portfolios
    return NextResponse.json({
      success: true,
      portfolios: portfolios.map(portfolio => ({
        ...portfolio,
        id: portfolio._id.toString(), // Convert ObjectId to string
        template: portfolio.templateId ? {
          id: portfolio.templateId._id?.toString(),
          name: portfolio.templateId.name,
          previewImage: portfolio.templateId.previewImage,
          category: portfolio.templateId.category,
        } : null
      }))
    });
  } catch (error) {
    console.error('Error fetching user portfolios:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch portfolios',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

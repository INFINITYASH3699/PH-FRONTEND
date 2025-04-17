import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import { Portfolio } from '@/models/Portfolio';
import { Template } from '@/models/Template';
import { User } from '@/models/User';

/**
 * GET - Fetch a user's portfolio by username or subdomain
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    await dbConnect();

    const username = params.username.toLowerCase();

    // First, find the user
    const user = await User.findOne({ username }).select('-password');

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Find the portfolio by userId and subdomain matching the username
    // This assumes the portfolio subdomain is the same as the username
    // You could alter this to find by userId and filter by isPublished if needed
    const portfolio = await Portfolio.findOne({
      userId: user._id,
      subdomain: username,
      isPublished: true,
    }).populate('templateId');

    if (!portfolio) {
      return NextResponse.json(
        { success: false, error: 'Portfolio not found or not published' },
        { status: 404 }
      );
    }

    // Get the template data
    const template = await Template.findById(portfolio.templateId);

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    // Get user's public information
    const userPublicInfo = {
      fullName: user.fullName,
      username: user.username,
      profilePicture: user.profilePicture,
      title: user.title,
      bio: user.bio,
      location: user.location,
      socialAccounts: user.socialAccounts,
    };

    // Create the complete portfolio data for rendering
    const portfolioData = {
      ...portfolio.toObject(),
      user: userPublicInfo,
      template: template.toObject(),
    };

    // Record the view (this would be better done client-side to avoid impacting page loading time)
    // recordPortfolioView(portfolio._id, request);

    return NextResponse.json({
      success: true,
      portfolio: portfolioData,
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

// Helper function to record portfolio views (async to not block response)
async function recordPortfolioView(portfolioId: string, request: NextRequest) {
  try {
    // Get IP address from request headers
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Get referrer from request headers
    const referrer = request.headers.get('referer') || null;

    // Send request to analytics API (could be done via fetch, but here we'll use a direct POST)
    await fetch(`${request.nextUrl.origin}/api/analytics/views`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        portfolioId,
        referrer,
      }),
    });
  } catch (error) {
    // Just log the error but don't interrupt the main function
    console.error('Failed to record view:', error);
  }
}

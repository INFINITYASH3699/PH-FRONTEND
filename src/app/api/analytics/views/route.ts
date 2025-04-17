import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import mongoose from 'mongoose';

// Create a simple schema for tracking views
// We'll define it inline since it's just for this route
const PortfolioViewSchema = new mongoose.Schema({
  portfolioId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Portfolio',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  ipAddress: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
  },
  referrer: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Create or get the model
let PortfolioView: mongoose.Model<any>;
try {
  // Try to get an existing model to avoid model overwrite error
  PortfolioView = mongoose.model('PortfolioView');
} catch {
  // Model doesn't exist yet, create it
  PortfolioView = mongoose.model('PortfolioView', PortfolioViewSchema);
}

/**
 * POST - Record a new portfolio view
 * Body parameters:
 * - portfolioId: ID of the portfolio being viewed
 * - referrer: (optional) Referring URL
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { portfolioId, referrer } = body;

    if (!portfolioId) {
      return NextResponse.json(
        { success: false, error: 'Portfolio ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get IP address from request headers
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Get user agent from request headers
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Check if this IP has viewed this portfolio in the last hour
    // This prevents duplicate counts from the same visitor in a short time
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const existingView = await PortfolioView.findOne({
      portfolioId,
      ipAddress: ip,
      date: { $gte: oneHourAgo }
    });

    if (existingView) {
      // Already counted this view recently
      return NextResponse.json({
        success: true,
        message: 'View already recorded',
        isNewView: false
      });
    }

    // Record the new view
    await PortfolioView.create({
      portfolioId,
      ipAddress: ip,
      userAgent,
      referrer: referrer || null,
    });

    return NextResponse.json({
      success: true,
      message: 'View recorded successfully',
      isNewView: true
    });
  } catch (error) {
    console.error('Failed to record view:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to record view'
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Get view count for a portfolio
 * Query parameters:
 * - portfolioId: ID of the portfolio
 * - period: (optional) Period to count views for (all, today, week, month)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const portfolioId = searchParams.get('portfolioId');
    const period = searchParams.get('period') || 'all';

    if (!portfolioId) {
      return NextResponse.json(
        { success: false, error: 'Portfolio ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Build date filter based on period
    const dateFilter: Record<string, any> = {};

    if (period !== 'all') {
      const now = new Date();

      switch (period) {
        case 'today':
          // Start of today
          const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          dateFilter.date = { $gte: startOfToday };
          break;
        case 'week':
          // Start of the week (7 days ago)
          const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateFilter.date = { $gte: startOfWeek };
          break;
        case 'month':
          // Start of the month (30 days ago)
          const startOfMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          dateFilter.date = { $gte: startOfMonth };
          break;
      }
    }

    // Count total views
    const viewCount = await PortfolioView.countDocuments({
      portfolioId,
      ...dateFilter,
    });

    // Get unique visitors (by IP address)
    const uniqueVisitors = await PortfolioView.aggregate([
      {
        $match: {
          portfolioId: new mongoose.Types.ObjectId(portfolioId),
          ...dateFilter
        }
      },
      { $group: { _id: '$ipAddress' } },
      { $count: 'count' }
    ]);

    const uniqueCount = uniqueVisitors.length > 0 ? uniqueVisitors[0].count : 0;

    // Get referrers
    const referrers = await PortfolioView.aggregate([
      {
        $match: {
          portfolioId: new mongoose.Types.ObjectId(portfolioId),
          referrer: { $ne: null },
          ...dateFilter
        }
      },
      { $group: { _id: '$referrer', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalViews: viewCount,
        uniqueVisitors: uniqueCount,
        period,
        topReferrers: referrers.map(r => ({
          referrer: r._id,
          count: r.count
        }))
      }
    });
  } catch (error) {
    console.error('Failed to get view count:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get view count'
      },
      { status: 500 }
    );
  }
}

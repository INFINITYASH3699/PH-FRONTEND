import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import { Portfolio } from '@/models/Portfolio';
import { Template } from '@/models/Template';
import { z } from 'zod';

// Validation schema for creating a portfolio
const createPortfolioSchema = z.object({
  templateId: z.string().min(1, 'Template ID is required'),
  title: z.string().min(1, 'Title is required').max(100, 'Title must be at most 100 characters'),
  subtitle: z.string().max(150, 'Subtitle must be at most 150 characters').optional(),
  subdomain: z
    .string()
    .min(3, 'Subdomain must be at least 3 characters')
    .max(30, 'Subdomain must be at most 30 characters')
    .regex(/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens')
    .trim()
    .toLowerCase(),
  customDomain: z.string().max(100, 'Custom domain must be at most 100 characters').optional(),
  isPublished: z.boolean().default(false),
  settings: z.object({
    colors: z
      .object({
        primary: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format').optional(),
        secondary: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format').optional(),
        background: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format').optional(),
        text: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format').optional(),
      })
      .optional(),
    fonts: z
      .object({
        heading: z.string().max(50, 'Font name must be at most 50 characters').optional(),
        body: z.string().max(50, 'Font name must be at most 50 characters').optional(),
      })
      .optional(),
    layout: z
      .object({
        sections: z.array(z.string()).max(20, 'Too many sections').optional(),
        showHeader: z.boolean().optional(),
        showFooter: z.boolean().optional(),
      })
      .optional(),
  }).optional(),
});

// Validation schema for updating a portfolio
const updatePortfolioSchema = createPortfolioSchema.partial().extend({
  id: z.string().min(1, 'Portfolio ID is required'),
});

/**
 * GET - Get all portfolios for the current user
 * Optional query parameters:
 * - limit: number of portfolios to return
 * - page: page number for pagination
 * - isPublished: filter by published status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const isPublished = searchParams.get('isPublished');

    // Build query
    const query: Record<string, any> = { userId: session.user.id };

    if (isPublished !== null) {
      query.isPublished = isPublished === 'true';
    }

    // Get total count for pagination
    const total = await Portfolio.countDocuments(query);

    // Fetch portfolios with pagination
    const portfolios = await Portfolio.find(query)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('templateId', 'name previewImage category'); // Populate template data

    return NextResponse.json({
      success: true,
      portfolios,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error('Failed to fetch portfolios:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch portfolios'
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new portfolio
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate request body
    const result = createPortfolioSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    const { templateId, title, subtitle, subdomain, customDomain, isPublished, settings } = result.data;

    await dbConnect();

    // Check if template exists
    const template = await Template.findById(templateId);

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    // Check if the template is premium and user is allowed to use it
    if (template.isPremium) {
      // Check user subscription status or other authorization logic
      // This is placeholder logic - implement your actual premium check
      const userCanUsePremium = session.user.role === 'admin'; // Example check

      if (!userCanUsePremium) {
        return NextResponse.json(
          { success: false, error: 'This template requires a premium subscription' },
          { status: 403 }
        );
      }
    }

    // Check if subdomain is already taken
    const existingPortfolio = await Portfolio.findOne({
      subdomain: { $regex: new RegExp(`^${subdomain}$`, 'i') }
    });

    if (existingPortfolio) {
      return NextResponse.json(
        { success: false, error: 'Subdomain is already taken' },
        { status: 409 }
      );
    }

    // Limit number of portfolios per user (add your own limit logic)
    const userPortfolioCount = await Portfolio.countDocuments({ userId: session.user.id });
    const portfolioLimit = 5; // Example limit, adjust as needed

    if (userPortfolioCount >= portfolioLimit) {
      return NextResponse.json(
        { success: false, error: `You can only create up to ${portfolioLimit} portfolios` },
        { status: 403 }
      );
    }

    // Create default settings from template
    const defaultSettings = {
      colors: {
        primary: template.settings?.layout?.defaultColors?.[0] || '#6366f1',
        secondary: template.settings?.layout?.defaultColors?.[1] || '#8b5cf6',
        background: template.settings?.layout?.defaultColors?.[2] || '#ffffff',
        text: template.settings?.layout?.defaultColors?.[3] || '#111827',
      },
      fonts: {
        heading: template.settings?.layout?.defaultFonts?.[0] || 'Inter',
        body: template.settings?.layout?.defaultFonts?.[1] || 'Inter',
      },
      layout: {
        sections: template.settings?.layout?.sections || [],
        showHeader: true,
        showFooter: true,
      },
    };

    // Merge user settings with default settings
    const mergedSettings = {
      ...defaultSettings,
      ...settings,
      colors: {
        ...defaultSettings.colors,
        ...settings?.colors,
      },
      fonts: {
        ...defaultSettings.fonts,
        ...settings?.fonts,
      },
      layout: {
        ...defaultSettings.layout,
        ...settings?.layout,
      },
    };

    // Create portfolio
    const portfolio = await Portfolio.create({
      userId: session.user.id,
      templateId,
      title,
      subtitle: subtitle || '',
      subdomain: subdomain.toLowerCase(),
      customDomain: customDomain || '',
      isPublished,
      settings: mergedSettings,
    });

    // Populate template data in the response
    const populatedPortfolio = await Portfolio.findById(portfolio._id)
      .populate('templateId', 'name previewImage category');

    return NextResponse.json({
      success: true,
      message: 'Portfolio created successfully',
      portfolio: populatedPortfolio
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create portfolio:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create portfolio'
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update an existing portfolio
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate request body
    const result = updatePortfolioSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    const { id, ...updateData } = result.data;

    await dbConnect();

    // Find the portfolio
    const portfolio = await Portfolio.findById(id);

    if (!portfolio) {
      return NextResponse.json(
        { success: false, error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Check if the user owns the portfolio
    if (portfolio.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to update this portfolio' },
        { status: 403 }
      );
    }

    // Check if subdomain change is requested and if it's available
    if (updateData.subdomain && updateData.subdomain !== portfolio.subdomain) {
      const existingPortfolio = await Portfolio.findOne({
        subdomain: { $regex: new RegExp(`^${updateData.subdomain}$`, 'i') },
        _id: { $ne: id },
      });

      if (existingPortfolio) {
        return NextResponse.json(
          { success: false, error: 'Subdomain is already taken' },
          { status: 409 }
        );
      }
    }

    // Handle template change
    if (updateData.templateId && updateData.templateId !== portfolio.templateId.toString()) {
      const template = await Template.findById(updateData.templateId);

      if (!template) {
        return NextResponse.json(
          { success: false, error: 'Template not found' },
          { status: 404 }
        );
      }

      // Check if new template is premium
      if (template.isPremium) {
        // Check user subscription status or other authorization logic
        const userCanUsePremium = session.user.role === 'admin'; // Example check

        if (!userCanUsePremium) {
          return NextResponse.json(
            { success: false, error: 'This template requires a premium subscription' },
            { status: 403 }
          );
        }
      }
    }

    // Update the portfolio
    // Use a deep merge for settings to avoid overwriting nested properties
    const updatedPortfolio = await Portfolio.findByIdAndUpdate(
      id,
      {
        $set: {
          ...updateData,
          // If subdomain is provided, ensure it's lowercase
          ...(updateData.subdomain && { subdomain: updateData.subdomain.toLowerCase() }),
          // Handle nested settings updates
          ...(updateData.settings && {
            'settings.colors': {
              ...portfolio.settings.colors,
              ...updateData.settings.colors,
            },
            'settings.fonts': {
              ...portfolio.settings.fonts,
              ...updateData.settings.fonts,
            },
            'settings.layout': {
              ...portfolio.settings.layout,
              ...updateData.settings.layout,
            },
          }),
        }
      },
      { new: true, runValidators: true }
    ).populate('templateId', 'name previewImage category');

    return NextResponse.json({
      success: true,
      message: 'Portfolio updated successfully',
      portfolio: updatedPortfolio
    });
  } catch (error) {
    console.error('Failed to update portfolio:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update portfolio'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete a portfolio
 * Query parameters:
 * - id: ID of the portfolio to delete
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const portfolioId = searchParams.get('id');

    if (!portfolioId) {
      return NextResponse.json(
        { success: false, error: 'Portfolio ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the portfolio
    const portfolio = await Portfolio.findById(portfolioId);

    if (!portfolio) {
      return NextResponse.json(
        { success: false, error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Check if the user owns the portfolio
    if (portfolio.userId.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to delete this portfolio' },
        { status: 403 }
      );
    }

    // Delete the portfolio
    await Portfolio.findByIdAndDelete(portfolioId);

    return NextResponse.json({
      success: true,
      message: 'Portfolio deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete portfolio:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete portfolio'
      },
      { status: 500 }
    );
  }
}

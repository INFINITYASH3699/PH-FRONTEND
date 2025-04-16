import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import { Portfolio } from '@/models/Portfolio';
import { Template } from '@/models/Template';
import { z } from 'zod';

// Validation schema for creating a portfolio
const createPortfolioSchema = z.object({
  templateId: z.string().min(1, 'Template ID is required'),
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().optional(),
  subdomain: z
    .string()
    .min(3, 'Subdomain must be at least 3 characters')
    .max(30, 'Subdomain must be at most 30 characters')
    .regex(/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens'),
  customDomain: z.string().optional(),
  isPublished: z.boolean().default(false),
  settings: z.object({
    colors: z
      .object({
        primary: z.string().optional(),
        secondary: z.string().optional(),
        background: z.string().optional(),
        text: z.string().optional(),
      })
      .optional(),
    fonts: z
      .object({
        heading: z.string().optional(),
        body: z.string().optional(),
      })
      .optional(),
    layout: z
      .object({
        sections: z.array(z.string()).optional(),
        showHeader: z.boolean().optional(),
        showFooter: z.boolean().optional(),
      })
      .optional(),
  }).optional(),
});

// GET - Get all portfolios for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    const portfolios = await Portfolio.find({ userId: session.user.id }).sort({ updatedAt: -1 });

    return NextResponse.json(portfolios);
  } catch (error) {
    console.error('Failed to fetch portfolios:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolios' },
      { status: 500 }
    );
  }
}

// POST - Create a new portfolio
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate request body
    const result = createPortfolioSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    const { templateId, title, subtitle, subdomain, customDomain, isPublished, settings } = result.data;

    await dbConnect();

    // Check if template exists
    const template = await Template.findById(templateId);

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Check if subdomain is already taken
    const existingPortfolio = await Portfolio.findOne({ subdomain });

    if (existingPortfolio) {
      return NextResponse.json(
        { error: 'Subdomain is already taken' },
        { status: 409 }
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
      subdomain,
      customDomain: customDomain || '',
      isPublished,
      settings: mergedSettings,
    });

    return NextResponse.json(portfolio, { status: 201 });
  } catch (error) {
    console.error('Failed to create portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to create portfolio' },
      { status: 500 }
    );
  }
}

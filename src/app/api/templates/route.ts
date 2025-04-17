import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import { Template } from '@/models/Template';
import { seedSingleTemplate } from '@/lib/db/seed';
import { auth } from '@/lib/auth';

/**
 * GET - Fetch templates with filtering, sorting, and pagination
 * Query parameters:
 * - page: Page number for pagination (default: 1)
 * - limit: Number of items per page (default: 10)
 * - category: Filter by category
 * - isPremium: Filter by premium status (true/false)
 * - search: Search term for name or description
 * - tags: Comma-separated list of tags to filter by
 * - sort: Field to sort by (name, createdAt, etc.)
 * - order: Sort order (asc/desc)
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // First ensure we have some templates in the database
    await seedSingleTemplate();

    // Get query parameters
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const skip = (page - 1) * limit;

    // Filters
    const category = searchParams.get('category');
    const isPremium = searchParams.get('isPremium');
    const search = searchParams.get('search');
    const tags = searchParams.get('tags');

    // Sorting
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') === 'asc' ? 1 : -1;

    // Build filter query
    const query: Record<string, any> = {};

    if (category) {
      query.category = category;
    }

    if (isPremium !== null) {
      query.isPremium = isPremium === 'true';
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Tags filter
    if (tags) {
      const tagList = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagList };
    }

    // Get session to check for premium access
    const session = await auth();
    const userRole = session?.user?.role || 'user';

    // Special handling for premium templates
    // Users see all templates, but templates are marked as premium
    // In frontend, you can highlight premium templates or restrict access based on subscription

    // Get total count for pagination
    const total = await Template.countDocuments(query);

    // Build sort object
    const sortOptions: Record<string, number> = {};
    sortOptions[sort] = order;

    // Fetch templates with pagination and sorting
    const templates = await Template.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    // Add a field to indicate if user can use this template
    const templatesWithAccess = templates.map(template => {
      const canUse = !template.isPremium || userRole === 'admin';
      return {
        ...template.toObject(),
        canUse,
      };
    });

    return NextResponse.json({
      success: true,
      templates: templatesWithAccess,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch templates'
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new template (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Check if user is authenticated and is an admin
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Only admins can create templates' },
        { status: 403 }
      );
    }

    await dbConnect();

    // Get request body
    const body = await request.json();

    // Validate template data (basic validation)
    if (!body.name || !body.description || !body.previewImage || !body.category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new template
    const template = await Template.create({
      ...body,
      // Ensure settings has all required nested objects
      settings: {
        layout: {
          sections: body.settings?.layout?.sections || ['header', 'about', 'skills', 'projects', 'experience', 'contact', 'footer'],
          defaultColors: body.settings?.layout?.defaultColors || ['#6366f1', '#8b5cf6', '#ffffff', '#111827'],
          defaultFonts: body.settings?.layout?.defaultFonts || ['Inter', 'Roboto', 'Montserrat'],
        },
        config: {
          requiredSections: body.settings?.config?.requiredSections || ['header', 'about'],
          optionalSections: body.settings?.config?.optionalSections || ['skills', 'projects', 'experience', 'contact', 'footer'],
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Template created successfully',
      template,
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create template:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create template'
      },
      { status: 500 }
    );
  }
}

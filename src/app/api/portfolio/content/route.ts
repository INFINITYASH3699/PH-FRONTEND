import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import { Portfolio } from '@/models/Portfolio';
import { z } from 'zod';

// Generic schema for portfolio content updates
const updateSectionSchema = z.object({
  portfolioId: z.string().min(1, 'Portfolio ID is required'),
  sectionType: z.string().min(1, 'Section type is required'),
  content: z.any(), // This will be validated based on section type
});

/**
 * POST - Update a specific section of a portfolio
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

    // Validate basic request structure
    const basicResult = updateSectionSchema.safeParse(body);
    if (!basicResult.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: basicResult.error.format() },
        { status: 400 }
      );
    }

    const { portfolioId, sectionType, content } = basicResult.data;

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
    if (portfolio.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to update this portfolio' },
        { status: 403 }
      );
    }

    // Update specific section content
    const updatePath = `sectionContent.${sectionType}`;

    // For sections with array items (like projects, skills, etc.), handle differently
    if (content.items && Array.isArray(content.items)) {
      await Portfolio.findByIdAndUpdate(portfolioId, {
        $set: { [`${updatePath}.items`]: content.items }
      });
    } else if (content.categories && Array.isArray(content.categories)) {
      await Portfolio.findByIdAndUpdate(portfolioId, {
        $set: { [`${updatePath}.categories`]: content.categories }
      });
    } else {
      // For simple object content (like about, contact)
      await Portfolio.findByIdAndUpdate(portfolioId, {
        $set: { [updatePath]: content }
      });
    }

    // Get the updated portfolio
    const updatedPortfolio = await Portfolio.findById(portfolioId);

    return NextResponse.json({
      success: true,
      message: `${sectionType} section updated successfully`,
      sectionContent: updatedPortfolio?.sectionContent[sectionType]
    });
  } catch (error) {
    console.error('Failed to update portfolio section:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update portfolio section'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remove a specific item from an array-based section
 * (e.g., delete a project from projects section)
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
    const portfolioId = searchParams.get('portfolioId');
    const sectionType = searchParams.get('sectionType');
    const itemId = searchParams.get('itemId');
    const itemIndex = searchParams.get('itemIndex'); // Fallback for items without IDs

    if (!portfolioId || !sectionType || (!itemId && !itemIndex)) {
      return NextResponse.json(
        { success: false, error: 'Required parameters missing' },
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
    if (portfolio.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to update this portfolio' },
        { status: 403 }
      );
    }

    // Get the section content
    const sectionContent = portfolio.sectionContent[sectionType];

    if (!sectionContent) {
      return NextResponse.json(
        { success: false, error: 'Section not found' },
        { status: 404 }
      );
    }

    // Handle different section types
    if (sectionContent.items && Array.isArray(sectionContent.items)) {
      if (itemId) {
        // Filter out the item with matching ID
        const updatedItems = sectionContent.items.filter(item =>
          item.id !== itemId && item._id?.toString() !== itemId
        );

        // Update the portfolio
        await Portfolio.findByIdAndUpdate(portfolioId, {
          $set: { [`sectionContent.${sectionType}.items`]: updatedItems }
        });
      } else if (itemIndex) {
        // Remove item at specific index (convert to number and make 0-indexed)
        const index = parseInt(itemIndex);

        if (isNaN(index) || index < 0 || index >= sectionContent.items.length) {
          return NextResponse.json(
            { success: false, error: 'Invalid item index' },
            { status: 400 }
          );
        }

        const updatedItems = [...sectionContent.items];
        updatedItems.splice(index, 1);

        // Update the portfolio
        await Portfolio.findByIdAndUpdate(portfolioId, {
          $set: { [`sectionContent.${sectionType}.items`]: updatedItems }
        });
      }
    } else if (sectionContent.categories && Array.isArray(sectionContent.categories)) {
      // For skills with categories and nested skill items
      if (itemId && itemIndex) {
        // itemId = category index, itemIndex = skill index in category
        const categoryIndex = parseInt(itemId);
        const skillIndex = parseInt(itemIndex);

        if (isNaN(categoryIndex) || categoryIndex < 0 || categoryIndex >= sectionContent.categories.length ||
            isNaN(skillIndex) || skillIndex < 0 || skillIndex >= sectionContent.categories[categoryIndex].skills.length) {
          return NextResponse.json(
            { success: false, error: 'Invalid category or skill index' },
            { status: 400 }
          );
        }

        const updatedCategories = [...sectionContent.categories];
        updatedCategories[categoryIndex].skills.splice(skillIndex, 1);

        // Update the portfolio
        await Portfolio.findByIdAndUpdate(portfolioId, {
          $set: { [`sectionContent.${sectionType}.categories`]: updatedCategories }
        });
      } else if (itemId) {
        // Delete entire category
        const categoryIndex = parseInt(itemId);

        if (isNaN(categoryIndex) || categoryIndex < 0 || categoryIndex >= sectionContent.categories.length) {
          return NextResponse.json(
            { success: false, error: 'Invalid category index' },
            { status: 400 }
          );
        }

        const updatedCategories = [...sectionContent.categories];
        updatedCategories.splice(categoryIndex, 1);

        // Update the portfolio
        await Portfolio.findByIdAndUpdate(portfolioId, {
          $set: { [`sectionContent.${sectionType}.categories`]: updatedCategories }
        });
      }
    }

    // Get the updated portfolio
    const updatedPortfolio = await Portfolio.findById(portfolioId);

    return NextResponse.json({
      success: true,
      message: `Item removed from ${sectionType} section successfully`,
      sectionContent: updatedPortfolio?.sectionContent[sectionType]
    });
  } catch (error) {
    console.error('Failed to remove item from section:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove item from section'
      },
      { status: 500 }
    );
  }
}

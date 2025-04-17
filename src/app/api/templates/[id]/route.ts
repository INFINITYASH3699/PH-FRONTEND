import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import { Template } from '@/models/Template';
import { auth } from '@/lib/auth';

/**
 * GET - Get a template by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const template = await Template.findById(params.id);

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    // Check if the user can use this premium template
    const session = await auth();
    const userRole = session?.user?.role || 'user';
    const canUse = !template.isPremium || userRole === 'admin';

    return NextResponse.json({
      success: true,
      template: {
        ...template.toObject(),
        canUse,
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
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated and is an admin
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Only admins can update templates' },
        { status: 403 }
      );
    }

    await dbConnect();

    // Get request body
    const body = await request.json();

    // Find the template
    const template = await Template.findById(params.id);

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    // Prepare the update with careful handling of nested objects
    const updateData: Record<string, any> = {};

    // Flat fields
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.previewImage !== undefined) updateData.previewImage = body.previewImage;
    if (body.isPremium !== undefined) updateData.isPremium = body.isPremium;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.tags !== undefined) updateData.tags = body.tags;

    // Handle nested settings carefully
    if (body.settings) {
      // Layout settings
      if (body.settings.layout) {
        if (body.settings.layout.sections !== undefined) {
          updateData['settings.layout.sections'] = body.settings.layout.sections;
        }
        if (body.settings.layout.defaultColors !== undefined) {
          updateData['settings.layout.defaultColors'] = body.settings.layout.defaultColors;
        }
        if (body.settings.layout.defaultFonts !== undefined) {
          updateData['settings.layout.defaultFonts'] = body.settings.layout.defaultFonts;
        }
      }

      // Config settings
      if (body.settings.config) {
        if (body.settings.config.requiredSections !== undefined) {
          updateData['settings.config.requiredSections'] = body.settings.config.requiredSections;
        }
        if (body.settings.config.optionalSections !== undefined) {
          updateData['settings.config.optionalSections'] = body.settings.config.optionalSections;
        }
      }
    }

    // Update the template
    const updatedTemplate = await Template.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Template updated successfully',
      template: updatedTemplate,
    });
  } catch (error) {
    console.error('Failed to update template:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update template'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete a template (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated and is an admin
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Only admins can delete templates' },
        { status: 403 }
      );
    }

    await dbConnect();

    // Find the template
    const template = await Template.findById(params.id);

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    // Check if this template is being used by any portfolios
    // This would require a Portfolio model import and check
    // For simplicity, we'll just delete without checking, but in production
    // you should verify no portfolios are using this template or handle the cascading updates

    // Delete the template
    await Template.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete template:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete template'
      },
      { status: 500 }
    );
  }
}

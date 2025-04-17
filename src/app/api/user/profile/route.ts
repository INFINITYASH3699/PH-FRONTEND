import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import { User } from '@/models/User';
import { z } from 'zod';

// Validation schema for user profile update
const profileUpdateSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(50, 'Full name must be at most 50 characters').optional(),
  title: z.string().max(100, 'Title must be at most 100 characters').optional(),
  bio: z.string().max(500, 'Bio must be at most 500 characters').optional(),
  location: z.string().max(100, 'Location must be at most 100 characters').optional(),
  profilePicture: z.string().url('Profile picture must be a valid URL').optional(),
  socialAccounts: z.object({
    website: z.string().url('Website must be a valid URL').optional().or(z.literal('')),
    github: z.string().url('GitHub must be a valid URL').optional().or(z.literal('')),
    twitter: z.string().url('Twitter must be a valid URL').optional().or(z.literal('')),
    linkedin: z.string().url('LinkedIn must be a valid URL').optional().or(z.literal('')),
    instagram: z.string().url('Instagram must be a valid URL').optional().or(z.literal('')),
  }).optional(),
});

/**
 * GET - Fetch user profile
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Find user by ID
    const user = await User.findById(session.user.id).select('-password');

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: user
    });
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user profile'
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update user profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input data
    const validationResult = profileUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find user
    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user fields
    const updateData = validationResult.data;

    // Apply updates
    if (updateData.fullName) user.fullName = updateData.fullName;
    if (updateData.title !== undefined) user.title = updateData.title;
    if (updateData.bio !== undefined) user.bio = updateData.bio;
    if (updateData.location !== undefined) user.location = updateData.location;
    if (updateData.profilePicture !== undefined) user.profilePicture = updateData.profilePicture;

    // Handle social accounts update
    if (updateData.socialAccounts) {
      user.socialAccounts = {
        ...user.socialAccounts || {},
        ...updateData.socialAccounts,
      };
    }

    // Save the updated user
    await user.save();

    // Return the updated profile without sensitive information
    const updatedUser = user.toObject();
    delete updatedUser.password;

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedUser,
    });
  } catch (error) {
    console.error('Failed to update user profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user profile'
      },
      { status: 500 }
    );
  }
}

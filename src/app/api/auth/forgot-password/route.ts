import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import { User } from '@/models/User';
import { Token } from '@/models/Token';
import { z } from 'zod';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

// Schema for forgot password request
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: result.error.format(),
        },
        { status: 400 }
      );
    }

    const { email } = result.data;

    await dbConnect();

    // Find user by email
    const user = await User.findOne({ email });

    // We'll respond with success even if the email doesn't exist
    // This prevents user enumeration attacks
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link',
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link',
      });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Delete any existing password reset tokens for this user
    await Token.deleteMany({
      userId: user._id,
      type: 'password_reset',
    });

    // Save the new token
    await Token.create({
      userId: user._id,
      token: resetToken,
      type: 'password_reset',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    // Send password reset email
    try {
      await sendPasswordResetEmail(email, resetToken);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send password reset email',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent. Please check your inbox.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

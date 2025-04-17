import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import { User } from '@/models/User';
import { Token } from '@/models/Token';
import { z } from 'zod';
import { hash } from 'bcrypt';

// Schema for password reset
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const result = resetPasswordSchema.safeParse(body);

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

    const { token, password } = result.data;

    await dbConnect();

    // Find the token
    const tokenRecord = await Token.findOne({
      token,
      type: 'password_reset',
    });

    if (!tokenRecord) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or expired token',
        },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (tokenRecord.expiresAt < new Date()) {
      await Token.deleteOne({ _id: tokenRecord._id });
      return NextResponse.json(
        {
          success: false,
          error: 'Token has expired',
        },
        { status: 400 }
      );
    }

    // Find the user
    const user = await User.findById(tokenRecord.userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // Hash the new password
    const hashedPassword = await hash(password, 12);

    // Update the password
    user.password = hashedPassword;
    await user.save();

    // Delete all password reset tokens for this user
    await Token.deleteMany({
      userId: user._id,
      type: 'password_reset',
    });

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

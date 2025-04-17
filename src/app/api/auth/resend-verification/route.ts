import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models/User';
import { Token } from '@/models/Token';
import dbConnect from '@/lib/db/mongodb';
import { sendVerificationEmail } from '@/lib/email';
import { z } from 'zod';
import crypto from 'crypto';

// Create a schema for resend verification with validation
const resendSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .trim()
    .toLowerCase(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const result = resendSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.format();
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors
        },
        { status: 400 }
      );
    }

    const { email } = result.data;

    // Connect to the database
    await dbConnect();

    // Find the user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // We don't want to reveal if the email exists in our system for security
      // Return success anyway to prevent user enumeration
      return NextResponse.json(
        {
          success: true,
          message: 'If your email is registered, a verification link has been sent.'
        },
        { status: 200 }
      );
    }

    // Check if the user is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        {
          success: false,
          message: 'This account is already verified. Please sign in.'
        },
        { status: 400 }
      );
    }

    // Delete any existing verification tokens for this user
    await Token.deleteMany({
      userId: user._id,
      type: 'email_verification'
    });

    // Generate a new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Save the new verification token
    await Token.create({
      userId: user._id,
      token: verificationToken,
      type: 'email_verification',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    // Send verification email
    const emailResult = await sendVerificationEmail(email, verificationToken);

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      return NextResponse.json(
        { success: false, message: 'Failed to send verification email. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Verification email has been sent. Please check your inbox and spam folder.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

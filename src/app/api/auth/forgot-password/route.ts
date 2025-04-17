import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import { User } from '@/models/User';
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

    // Connect to database
    await dbConnect();

    // Find user by email (case-insensitive)
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, 'i') }
    });

    // Don't reveal that the user doesn't exist (security best practice)
    if (!user) {
      return NextResponse.json(
        { success: true, message: 'If the email exists, a password reset link has been sent' },
        { status: 200 }
      );
    }

    // Generate reset token and set expiration (1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Update user with reset token
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send password reset email
    const result = await sendPasswordResetEmail(user.email, resetToken);

    if (!result.success) {
      console.error('Failed to send password reset email:', result.error);
      return NextResponse.json(
        { success: false, message: 'Failed to send password reset email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Password reset link sent' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

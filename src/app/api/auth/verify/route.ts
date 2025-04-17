import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import { User } from '@/models/User';
import { Token } from '@/models/Token';

/**
 * GET - Verify a user's email with the provided token
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/auth/error?error=missing_token', request.url));
    }

    await dbConnect();

    // Find the token
    const tokenRecord = await Token.findOne({
      token,
      type: 'email_verification',
    });

    if (!tokenRecord) {
      return NextResponse.redirect(new URL('/auth/error?error=invalid_token', request.url));
    }

    // Check if token is expired
    if (tokenRecord.expiresAt < new Date()) {
      await Token.deleteOne({ _id: tokenRecord._id });
      return NextResponse.redirect(new URL('/auth/error?error=expired_token', request.url));
    }

    // Find the user
    const user = await User.findById(tokenRecord.userId);

    if (!user) {
      return NextResponse.redirect(new URL('/auth/error?error=user_not_found', request.url));
    }

    // Update user status and set emailVerified
    user.status = 'active';
    user.emailVerified = new Date();
    await user.save();

    // Delete the token (it's been used)
    await Token.deleteOne({ _id: tokenRecord._id });

    // Redirect to success page
    return NextResponse.redirect(new URL('/auth/verified', request.url));
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(new URL('/auth/error?error=server_error', request.url));
  }
}

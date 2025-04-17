import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models/User';
import dbConnect from '@/lib/db/mongodb';
import { hash } from 'bcrypt';
import { sendVerificationEmail } from '@/lib/email';
import { z } from 'zod';
import crypto from 'crypto'; // Import crypto for token generation

// Create a schema for user registration with stronger validation
const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(50, 'Full name must be at most 50 characters')
    .trim(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must not exceed 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
    .trim()
    .toLowerCase(),
  email: z
    .string()
    .email('Invalid email address')
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const result = registerSchema.safeParse(body);
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

    const { fullName, username, email, password } = result.data;

    // Connect to the database
    await dbConnect();

    // Check if user with email already exists (case insensitive)
    const existingUserByEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingUserByEmail) {
      return NextResponse.json(
        { success: false, message: 'Email is already in use' },
        { status: 409 }
      );
    }

    // Check if user with username already exists (case insensitive)
    const existingUserByUsername = await User.findOne({
      username: { $regex: new RegExp(`^${username}$`, 'i') }
    });
    if (existingUserByUsername) {
      return NextResponse.json(
        { success: false, message: 'Username is already taken' },
        { status: 409 }
      );
    }

    // Create new user
    const user = new User({
      fullName,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password, // Will be hashed in the pre-save hook
      status: 'pending', // Set status to pending until email is verified
    });

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Save user to database
    await user.save();

    // Save verification token
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
      // We still return success but log the error
      // The user can request a new verification email later
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        requiresVerification: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

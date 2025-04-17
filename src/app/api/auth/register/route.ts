import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import dbConnect from '@/lib/db/mongodb';
import { User } from '@/models/User';
import { z } from 'zod';
import crypto from 'crypto';

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
    .max(20, 'Username must be at most 20 characters')
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
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check (basic implementation)
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    // In a real app, you would use Redis or another store to track requests

    const body = await request.json();

    // Validate request body
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: result.error.format()
        },
        { status: 400 }
      );
    }

    const { fullName, username, email, password } = result.data;

    // Connect to the database
    await dbConnect();

    // Check if user with email already exists (case insensitive)
    const existingUserByEmail = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, 'i') }
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'User with this email already exists'
        },
        { status: 409 }
      );
    }

    // Check if user with username already exists (case insensitive)
    const existingUserByUsername = await User.findOne({
      username: { $regex: new RegExp(`^${username}$`, 'i') }
    });

    if (existingUserByUsername) {
      return NextResponse.json(
        {
          success: false,
          error: 'Username is already taken'
        },
        { status: 409 }
      );
    }

    // Generate verification token (for email verification)
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create a new user
    // With our enhanced User model, we don't need to hash the password here
    // as it will be hashed in the pre-save hook
    const newUser = await User.create({
      fullName,
      username,
      email,
      password,
      accountType: 'credentials',
      status: 'active', // Change to 'pending' if you implement email verification
      emailVerified: null, // Will be set when user verifies email
      // Store verification token in a separate collection or Redis in production
    });

    // Remove password from the response
    const user = newUser.toObject();
    delete user.password;

    // Send verification email (implementation would go here)
    // In a real app, you would integrate with an email provider like SendGrid, Mailgun, etc.

    return NextResponse.json(
      {
        success: true,
        message: 'User registered successfully',
        user
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    let errorMessage = 'Registration failed';
    let statusCode = 500;

    // Provide more specific error message based on the type of error
    if (error instanceof Error) {
      errorMessage = error.message;

      // Handle MongoDB duplicate key errors
      if ((error as any).code === 11000) {
        statusCode = 409;
        errorMessage = 'A user with this email or username already exists';
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage
      },
      { status: statusCode }
    );
  }
}

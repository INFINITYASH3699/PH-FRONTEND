import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import dbConnect from '@/lib/db/mongodb';
import { User } from '@/models/User';
import { z } from 'zod';

// Create a schema for user registration
const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    const { fullName, username, email, password } = result.data;

    // Connect to the database
    await dbConnect();

    // Check if user with email already exists
    const existingUserByEmail = await User.findOne({ email });

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Check if user with username already exists
    const existingUserByUsername = await User.findOne({ username });

    if (existingUserByUsername) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Create a new user
    const newUser = await User.create({
      fullName,
      username,
      email,
      password: hashedPassword,
    });

    // Remove password from the response
    const user = newUser.toObject();
    delete user.password;

    return NextResponse.json(
      { message: 'User registered successfully', user },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}

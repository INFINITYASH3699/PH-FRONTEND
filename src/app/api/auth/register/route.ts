import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { MongoClient } from "mongodb";

// Create a schema for user registration with simpler validation
const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name must be at most 50 characters")
    .trim(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must not exceed 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens"
    )
    .trim()
    .toLowerCase(),
  email: z.string().email("Invalid email address").trim().toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters"),
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
          message: "Validation failed",
          errors,
        },
        { status: 400 }
      );
    }

    const { fullName, username, email, password } = result.data;

    // Connect directly to MongoDB using the provided connection string
    const uri = process.env.MONGODB_URI_AUTH;
    if (!uri) {
      return NextResponse.json(
        { success: false, message: "Database connection string is missing" },
        { status: 500 }
      );
    }

    const client = new MongoClient(uri);

    try {
      await client.connect();
      const db = client.db();
      const usersCollection = db.collection("users");

      // Check if user with email already exists
      const existingUserByEmail = await usersCollection.findOne({
        email: email.toLowerCase(),
      });
      if (existingUserByEmail) {
        return NextResponse.json(
          { success: false, message: "Email is already in use" },
          { status: 409 }
        );
      }

      // Check if user with username already exists
      const existingUserByUsername = await usersCollection.findOne({
        username: username.toLowerCase(),
      });
      if (existingUserByUsername) {
        return NextResponse.json(
          { success: false, message: "Username is already taken" },
          { status: 409 }
        );
      }

      // Create the user document (no hashing for simplicity)
      const newUser = {
        fullName,
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password, // Store password as plain text as requested
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Insert the user
      const result = await usersCollection.insertOne(newUser);

      if (!result.acknowledged) {
        throw new Error("Failed to create user");
      }

      return NextResponse.json(
        {
          success: true,
          message: "Registration successful. You can now log in.",
        },
        { status: 201 }
      );
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { sign } from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET =
  process.env.NEXTAUTH_SECRET || "your-jwt-secret-key-change-me";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

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

      // Find the user by email
      const user = await usersCollection.findOne({
        email: email.toLowerCase(),
      });

      if (!user) {
        return NextResponse.json(
          { success: false, message: "No user found with this email" },
          { status: 401 }
        );
      }

      // Direct password comparison (no hashing for simplicity)
      if (user.password !== password) {
        return NextResponse.json(
          { success: false, message: "Invalid password" },
          { status: 401 }
        );
      }

      // Create a JWT token
      const token = sign(
        {
          id: user._id.toString(),
          email: user.email,
          username: user.username,
          name: user.fullName,
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Set the cookie
      cookies().set({
        name: "auth-token",
        value: token,
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: "lax",
      });

      // Return user data without sensitive information
      return NextResponse.json({
        success: true,
        user: {
          id: user._id.toString(),
          name: user.fullName,
          email: user.email,
          username: user.username,
          image: user.profilePicture || "",
        },
      });
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

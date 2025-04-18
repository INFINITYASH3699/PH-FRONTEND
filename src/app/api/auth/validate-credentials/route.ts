import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { compare } from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Connect directly to MongoDB
    const uri = process.env.MONGODB_URI_AUTH || process.env.MONGODB_URI;
    if (!uri) {
      return NextResponse.json(
        { message: "Database connection string is missing" },
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
          { message: "No user found with this email" },
          { status: 401 }
        );
      }

      // Verify password
      const isPasswordValid = await compare(password, user.password);

      if (!isPasswordValid) {
        return NextResponse.json(
          { message: "Invalid password" },
          { status: 401 }
        );
      }

      // Return user data without sensitive information
      return NextResponse.json({
        id: user._id.toString(),
        name: user.fullName,
        email: user.email,
        username: user.username,
        image: user.profilePicture || "",
        role: user.role || "user",
      });
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      { message: "Authentication failed" },
      { status: 500 }
    );
  }
}

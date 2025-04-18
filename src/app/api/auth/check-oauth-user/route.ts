import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const { email, name, image } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
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

      // Check if user exists
      const user = await usersCollection.findOne({
        email: email.toLowerCase(),
      });

      // If user doesn't exist, create a new one
      if (!user && email) {
        // Generate a username from email or use a timestamp
        const username = email.split("@")[0] || `user_${Date.now()}`;

        // Check if username exists
        const existingUsername = await usersCollection.findOne({
          username: username.toLowerCase(),
        });

        // Add a suffix if username already exists
        const finalUsername = existingUsername
          ? `${username}_${Date.now().toString().slice(-4)}`
          : username;

        // Create new user document
        const newUser = {
          email: email.toLowerCase(),
          fullName: name || email.split("@")[0],
          username: finalUsername.toLowerCase(),
          profilePicture: image || "",
          status: "active",
          accountType: "google", // Default to google for OAuth
          emailVerified: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = await usersCollection.insertOne(newUser);

        if (!result.acknowledged) {
          return NextResponse.json(
            { message: "Failed to create user" },
            { status: 500 }
          );
        }
      }

      return NextResponse.json({ success: true });
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error("OAuth user check error:", error);
    return NextResponse.json(
      { message: "Failed to check or create OAuth user" },
      { status: 500 }
    );
  }
}

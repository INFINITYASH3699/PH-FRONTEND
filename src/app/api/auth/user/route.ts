import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-jwt-secret-key-change-me";

export async function GET(request: NextRequest) {
  try {
    // Get the auth token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    try {
      // Verify the token
      const decoded = verify(token.value, JWT_SECRET) as {
        id: string;
        email: string;
        username: string;
        name: string;
      };

      // Return user info
      return NextResponse.json({
        success: true,
        user: {
          id: decoded.id,
          email: decoded.email,
          username: decoded.username,
          fullName: decoded.name,
        },
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error getting user:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

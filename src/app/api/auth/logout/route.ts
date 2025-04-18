import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    // Determine if we're in a production environment
    const isProduction = process.env.NODE_ENV === "production";

    // Clear the auth token cookie with proper settings
    cookies().delete({
      name: "auth-token",
      path: "/",
      secure: isProduction,
      sameSite: "lax"
    });

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

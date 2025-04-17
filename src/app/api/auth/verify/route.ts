import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import { User } from '@/models/User';
import { Token } from '@/models/Token'; // Added Token import
import crypto from 'crypto';

/**
 * GET - Verify a user's email with the provided token
 */
export async function GET(request: NextRequest) {
  try {
    // Get token from URL query parameters
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return new Response('Missing verification token', {
        status: 400,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Connect to database
    await dbConnect();

    // Find the token in the database
    const tokenRecord = await Token.findOne({
      token: token,
      type: 'email_verification',
      expiresAt: { $gt: new Date() }
    });

    if (!tokenRecord) {
      return new Response(`
        <html>
          <head>
            <title>Verification Failed</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background-color: #f9fafb; }
              .container { max-width: 500px; padding: 2rem; background: white; border-radius: 0.5rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); text-align: center; }
              h1 { color: #ef4444; margin-bottom: 1rem; }
              p { color: #4b5563; margin-bottom: 1.5rem; }
              .button { display: inline-block; background: #6366f1; color: white; padding: 0.75rem 1.5rem; border-radius: 0.375rem; text-decoration: none; font-weight: 500; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Verification Failed</h1>
              <p>The verification link is invalid or has expired. Please request a new verification link.</p>
              <a href="${process.env.NEXTAUTH_URL}/auth/signin" class="button">Go to Sign In</a>
            </div>
          </body>
        </html>
      `, { status: 400, headers: { 'Content-Type': 'text/html' } });
    }

    // Find and update the user
    const user = await User.findById(tokenRecord.userId);

    if (!user) {
      return new Response(`
        <html>
          <head>
            <title>Verification Failed</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background-color: #f9fafb; }
              .container { max-width: 500px; padding: 2rem; background: white; border-radius: 0.5rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); text-align: center; }
              h1 { color: #ef4444; margin-bottom: 1rem; }
              p { color: #4b5563; margin-bottom: 1.5rem; }
              .button { display: inline-block; background: #6366f1; color: white; padding: 0.75rem 1.5rem; border-radius: 0.375rem; text-decoration: none; font-weight: 500; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Verification Failed</h1>
              <p>The user account associated with this verification link could not be found.</p>
              <a href="${process.env.NEXTAUTH_URL}/auth/signin" class="button">Go to Sign In</a>
            </div>
          </body>
        </html>
      `, { status: 400, headers: { 'Content-Type': 'text/html' } });
    }

    // Update user to verified status
    user.emailVerified = new Date();
    user.status = 'active';
    await user.save();

    // Delete the used token
    await Token.deleteOne({ _id: tokenRecord._id });

    // Return success page
    return new Response(`
      <html>
        <head>
          <title>Email Verified</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background-color: #f9fafb; }
            .container { max-width: 500px; padding: 2rem; background: white; border-radius: 0.5rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); text-align: center; }
            h1 { color: #10b981; margin-bottom: 1rem; }
            p { color: #4b5563; margin-bottom: 1.5rem; }
            .button { display: inline-block; background: #6366f1; color: white; padding: 0.75rem 1.5rem; border-radius: 0.375rem; text-decoration: none; font-weight: 500; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Email Verified</h1>
            <p>Your email has been verified successfully! You can now sign in to your account.</p>
            <a href="${process.env.NEXTAUTH_URL}/auth/signin" class="button">Sign In</a>
          </div>
        </body>
      </html>
    `, { status: 200, headers: { 'Content-Type': 'text/html' } });
  } catch (error) {
    console.error('Email verification error:', error);
    return new Response(`
      <html>
        <head>
          <title>Server Error</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background-color: #f9fafb; }
            .container { max-width: 500px; padding: 2rem; background: white; border-radius: 0.5rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); text-align: center; }
            h1 { color: #ef4444; margin-bottom: 1rem; }
            p { color: #4b5563; margin-bottom: 1.5rem; }
            .button { display: inline-block; background: #6366f1; color: white; padding: 0.75rem 1.5rem; border-radius: 0.375rem; text-decoration: none; font-weight: 500; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Server Error</h1>
            <p>We encountered an error while verifying your email. Please try again later or contact support.</p>
            <a href="${process.env.NEXTAUTH_URL}/auth/signin" class="button">Go to Sign In</a>
          </div>
        </body>
      </html>
    `, { status: 500, headers: { 'Content-Type': 'text/html' } });
  }
}

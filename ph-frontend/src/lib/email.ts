interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

// Create a simplified logger for email operations
const logEmail = (to: string, subject: string, html: string) => {
};

// Simple mock implementation for Edge runtime
export const sendEmail = async (payload: EmailPayload) => {
  try {
    const { to, subject, html } = payload;

    // Log the email attempt
    logEmail(to, subject, html);

    // Simulating success - in a real app, you'd call an API endpoint
    // that runs in a Node.js environment or use a service like SendGrid/Mailgun API directly

    return { success: true, messageId: `edge-${Date.now()}@portfoliohub.test` };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
};

export const sendVerificationEmail = async (to: string, token: string) => {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6366f1;">Verify Your Email Address</h2>
      <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #6366f1, #8b5cf6); color: white; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 16px 0;">Verify Email</a>
      <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #6366f1;"><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, you can safely ignore this email.</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: 'Verify Your Email Address',
    html,
  });
};

export const sendPasswordResetEmail = async (to: string, token: string) => {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6366f1;">Reset Your Password</h2>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #6366f1, #8b5cf6); color: white; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 16px 0;">Reset Password</a>
      <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #6366f1;"><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request a password reset, you can safely ignore this email.</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: 'Reset Your Password',
    html,
  });
};

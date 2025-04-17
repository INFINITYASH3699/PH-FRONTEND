import nodemailer from 'nodemailer';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

// Check if we're using placeholder credentials
const isUsingPlaceholderCreds =
  process.env.EMAIL_SERVER_HOST === 'smtp.example.com' ||
  process.env.EMAIL_SERVER_USER === 'placeholder@example.com' ||
  process.env.EMAIL_SERVER_PASSWORD === 'placeholder';

const isDevelopmentMode = process.env.NODE_ENV === 'development';

// Create mock transporter for development
const createDevTransporter = () => {
  console.warn('Using development email service. Emails will be logged but not sent.');
  return {
    sendMail: async (mailOptions: any) => {
      console.log('\n--- DEVELOPMENT MODE: EMAIL NOT ACTUALLY SENT ---');
      console.log('To:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
      console.log('Content:', mailOptions.html.replace(/<[^>]*>/g, ' ').substring(0, 100) + '...');
      console.log('-----------------------------------------------\n');
      return { messageId: `dev-${Date.now()}@portfoliohub.test` };
    },
    verify: (callback: (error: Error | null, success: boolean) => void) => {
      callback(null, true);
    }
  };
};

// Create reusable transporter with environment variables or mock for development
const transporter = isDevelopmentMode && isUsingPlaceholderCreds
  ? createDevTransporter()
  : nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT) || 587,
      secure: Number(process.env.EMAIL_SERVER_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

// Verify connection configuration
if (!(isDevelopmentMode && isUsingPlaceholderCreds)) {
  transporter.verify((error) => {
    if (error) {
      console.error('Email service error:', error);
    } else {
      console.log('Email service is ready');
    }
  });
}

export const sendEmail = async (payload: EmailPayload) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'no-reply@portfoliohub.com',
      ...payload,
    });

    return { success: true, messageId: info.messageId };
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

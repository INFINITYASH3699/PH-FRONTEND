import mongoose, { Schema, models, model } from 'mongoose';
import { hash, compare } from 'bcrypt';
// Remove crypto import and create edge-compatible alternatives

export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'inactive' | 'pending';
export type UserAccountType = 'credentials' | 'google' | 'github';

export interface IUser {
  email: string;
  username: string;
  password: string;
  fullName: string;
  profilePicture?: string;
  title?: string;
  bio?: string;
  location?: string;
  role?: UserRole;
  status?: UserStatus;
  accountType?: UserAccountType;
  socialAccounts?: {
    website?: string;
    github?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  emailVerified?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  passwordChangedAt?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to generate random tokens (edge compatible)
async function generateSecureToken(): Promise<string> {
  // Use Web Crypto API instead of Node.js crypto
  const array = new Uint8Array(32);
  if (typeof crypto !== 'undefined') {
    crypto.getRandomValues(array);
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Helper function to hash a token (edge compatible)
async function hashToken(token: string): Promise<string> {
  // Simple hash function compatible with Edge
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'],
    },
    password: {
      type: String,
      required: function() {
        // Only required for accounts created with credentials
        return this.accountType === 'credentials' || !this.accountType;
      },
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't include password in query results by default
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    profilePicture: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'active',
    },
    accountType: {
      type: String,
      enum: ['credentials', 'google', 'github'],
      default: 'credentials',
    },
    socialAccounts: {
      website: String,
      github: String,
      twitter: String,
      linkedin: String,
      instagram: String,
    },
    emailVerified: {
      type: Date,
      default: null,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    verificationToken: String,
    verificationTokenExpires: Date,
    passwordChangedAt: Date,
    lastLogin: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password') || !this.password) return next();

  try {
    // Hash password with bcrypt (10 rounds)
    this.password = await hash(this.password, 10);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Create a method to validate passwords without exposing the hash
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return compare(candidatePassword, this.password);
};

// Create a method to generate a password reset token (edge compatible)
userSchema.methods.createPasswordResetToken = async function() {
  const resetToken = await generateSecureToken();
  this.passwordResetToken = await hashToken(resetToken);

  // Token expires in 1 hour
  this.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);

  return resetToken;
};

// Create a method to generate an email verification token (edge compatible)
userSchema.methods.createVerificationToken = async function() {
  const verificationToken = await generateSecureToken();
  this.verificationToken = await hashToken(verificationToken);

  // Token expires in 24 hours
  this.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return verificationToken;
};

// Create virtual for full user profile URL
userSchema.virtual('profileUrl').get(function() {
  return `/portfolio/${this.username}`;
});

export const User = models.User || model<IUser>('User', userSchema);

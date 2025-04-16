import mongoose, { Schema, models, model } from 'mongoose';

export interface IUser {
  email: string;
  username: string;
  password: string;
  fullName: string;
  profilePicture?: string;
  title?: string;
  bio?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
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
      required: [true, 'Password is required'],
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
  },
  {
    timestamps: true,
  }
);

export const User = models.User || model<IUser>('User', userSchema);

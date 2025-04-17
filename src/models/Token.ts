import mongoose, { Schema, models, model } from 'mongoose';

export interface IToken {
  userId: mongoose.Types.ObjectId;
  token: string;
  type: 'email_verification' | 'password_reset';
  createdAt: Date;
  expiresAt: Date;
}

const tokenSchema = new Schema<IToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ['email_verification', 'password_reset'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => {
        // Default: 24 hours from now for email verification, 1 hour for password reset
        const now = new Date();
        if (this.type === 'password_reset') {
          return new Date(now.getTime() + 60 * 60 * 1000); // 1 hour
        }
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index to auto-delete expired tokens
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Token = models.Token || model<IToken>('Token', tokenSchema);

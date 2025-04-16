import mongoose, { Schema, models, model } from 'mongoose';

export interface IPortfolioSettings {
  colors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    text?: string;
  };
  fonts?: {
    heading?: string;
    body?: string;
  };
  layout?: {
    sections?: string[];
    showHeader?: boolean;
    showFooter?: boolean;
  };
}

export interface IPortfolio {
  userId: mongoose.Types.ObjectId;
  templateId: mongoose.Types.ObjectId;
  title: string;
  subtitle?: string;
  customDomain?: string;
  subdomain: string;
  isPublished: boolean;
  settings: IPortfolioSettings;
  createdAt: Date;
  updatedAt: Date;
}

const portfolioSchema = new Schema<IPortfolio>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'Template',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    customDomain: {
      type: String,
      trim: true,
      sparse: true,
    },
    subdomain: {
      type: String,
      required: [true, 'Subdomain is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Subdomain must be at least 3 characters'],
      match: [/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens'],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    settings: {
      colors: {
        primary: { type: String, default: '#6366f1' },
        secondary: { type: String, default: '#8b5cf6' },
        background: { type: String, default: '#ffffff' },
        text: { type: String, default: '#111827' },
      },
      fonts: {
        heading: { type: String, default: 'Inter' },
        body: { type: String, default: 'Inter' },
      },
      layout: {
        sections: { type: [String], default: ['header', 'about', 'skills', 'projects', 'experience', 'contact', 'footer'] },
        showHeader: { type: Boolean, default: true },
        showFooter: { type: Boolean, default: true },
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Portfolio = models.Portfolio || model<IPortfolio>('Portfolio', portfolioSchema);

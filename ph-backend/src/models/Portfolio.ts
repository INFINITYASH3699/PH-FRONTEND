import mongoose, { Document, Schema } from 'mongoose';

export interface IPortfolio extends Document {
  title: string;
  subtitle?: string;
  subdomain: string;
  userId: mongoose.Types.ObjectId;
  templateId?: mongoose.Types.ObjectId;
  content: Record<string, any>;
  isPublished: boolean;
  viewCount: number;
  customDomain?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PortfolioSchema = new Schema<IPortfolio>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 100,
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    subdomain: {
      type: String,
      required: [true, 'Subdomain is required'],
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^[a-z0-9-]{3,30}$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'Template',
    },
    content: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    customDomain: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
PortfolioSchema.index({ userId: 1 });
PortfolioSchema.index({ subdomain: 1 }, { unique: true });
PortfolioSchema.index({ customDomain: 1 }, { sparse: true, unique: true });

const Portfolio = mongoose.model<IPortfolio>('Portfolio', PortfolioSchema);

export default Portfolio;

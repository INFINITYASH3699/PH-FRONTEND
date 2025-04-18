import mongoose, { Document, Schema } from 'mongoose';

// Interface for image object
interface ImageObject {
  url: string;
  publicId: string;
}

export interface IPortfolio extends Document {
  title: string;
  subtitle?: string;
  subdomain: string;
  userId: mongoose.Types.ObjectId;
  templateId?: mongoose.Types.ObjectId;
  content: Record<string, any>;
  // Store images with their Cloudinary public IDs
  headerImage?: ImageObject;
  galleryImages?: ImageObject[];
  isPublished: boolean;
  viewCount: number;
  customDomain?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Schema for image objects
const ImageObjectSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);

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
    // Add fields for storing images with their Cloudinary public IDs
    headerImage: {
      type: ImageObjectSchema,
    },
    galleryImages: {
      type: [ImageObjectSchema],
      default: [],
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

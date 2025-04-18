import mongoose, { Document, Schema } from 'mongoose';

export interface ITemplate extends Document {
  name: string;
  description: string;
  category: string;
  previewImage: string;
  defaultStructure: Record<string, any>;
  isPublished: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  // New fields
  isFeatured: boolean;
  rating: {
    average: number;
    count: number;
  };
  reviews: Array<{
    userId: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    createdAt: Date;
  }>;
  tags: string[];
  usageCount: number;
  previewImages: string[];
  customizationOptions: {
    colorSchemes: Array<{
      name: string;
      primary: string;
      secondary: string;
      background: string;
      text: string;
    }>;
    fontPairings: Array<{
      name: string;
      heading: string;
      body: string;
    }>;
    layouts: string[];
  };
}

const TemplateSchema = new Schema<ITemplate>(
  {
    name: {
      type: String,
      required: [true, 'Template name is required'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, 'Template description is required'],
      trim: true,
      maxlength: 500,
    },
    category: {
      type: String,
      required: [true, 'Template category is required'],
      enum: ['professional', 'creative', 'minimal', 'modern', 'other'],
      default: 'other',
    },
    previewImage: {
      type: String,
      required: [true, 'Preview image is required'],
    },
    defaultStructure: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    // New fields
    isFeatured: {
      type: Boolean,
      default: false,
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    reviews: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    tags: {
      type: [String],
      default: [],
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    previewImages: {
      type: [String],
      default: [],
    },
    customizationOptions: {
      colorSchemes: [
        {
          name: String,
          primary: String,
          secondary: String,
          background: String,
          text: String,
        },
      ],
      fontPairings: [
        {
          name: String,
          heading: String,
          body: String,
        },
      ],
      layouts: [String],
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
TemplateSchema.index({ category: 1 });
TemplateSchema.index({ name: 'text', description: 'text' });
TemplateSchema.index({ tags: 1 });
TemplateSchema.index({ isFeatured: 1 });
TemplateSchema.index({ 'rating.average': -1 });
TemplateSchema.index({ usageCount: -1 });

const Template = mongoose.model<ITemplate>('Template', TemplateSchema);

export default Template;

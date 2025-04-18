import mongoose, { Schema, models, model } from 'mongoose';

export interface ITemplateSettings {
  layout?: {
    sections?: string[];
    defaultColors?: string[];
    defaultFonts?: string[];
  };
  config?: {
    requiredSections?: string[];
    optionalSections?: string[];
  };
}

export interface IColorScheme {
  name: string;
  primary: string;
  secondary: string;
  background: string;
  text: string;
}

export interface IFontPairing {
  name: string;
  heading: string;
  body: string;
}

export interface IReview {
  userId: string;
  userName?: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface ITemplate {
  name: string;
  description: string;
  previewImage: string;
  isPremium: boolean;
  settings: ITemplateSettings;
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  // New fields
  isFeatured?: boolean;
  rating?: {
    average: number;
    count: number;
  };
  reviews?: IReview[];
  usageCount?: number;
  previewImages?: string[];
  customizationOptions?: {
    colorSchemes: IColorScheme[];
    fontPairings: IFontPairing[];
    layouts: string[];
  };
}

const templateSchema = new Schema<ITemplate>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    previewImage: {
      type: String,
      required: [true, 'Preview image is required'],
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['developer', 'designer', 'creative', 'business', 'personal', 'other'],
      default: 'other',
    },
    tags: {
      type: [String],
      default: [],
    },
    settings: {
      layout: {
        sections: { type: [String], default: ['header', 'about', 'skills', 'projects', 'experience', 'contact', 'footer'] },
        defaultColors: { type: [String], default: ['#6366f1', '#8b5cf6', '#ffffff', '#111827'] },
        defaultFonts: { type: [String], default: ['Inter', 'Roboto', 'Montserrat'] },
      },
      config: {
        requiredSections: { type: [String], default: ['header', 'about'] },
        optionalSections: { type: [String], default: ['skills', 'projects', 'experience', 'contact', 'footer'] },
      },
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
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    reviews: [
      {
        userId: {
          type: String,
          required: true,
        },
        userName: String,
        userAvatar: String,
        rating: {
          type: Number,
          required: true,
        },
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
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

export const Template = models.Template || model<ITemplate>('Template', templateSchema);

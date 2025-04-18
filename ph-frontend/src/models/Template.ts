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
  },
  {
    timestamps: true,
  }
);

export const Template = models.Template || model<ITemplate>('Template', templateSchema);

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
  },
  {
    timestamps: true,
  }
);

// Create indexes
TemplateSchema.index({ category: 1 });
TemplateSchema.index({ name: 'text', description: 'text' });

const Template = mongoose.model<ITemplate>('Template', TemplateSchema);

export default Template;

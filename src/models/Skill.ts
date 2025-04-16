import mongoose, { Schema, models, model } from 'mongoose';

export interface ISkill {
  portfolioId: mongoose.Types.ObjectId;
  name: string;
  category?: string;
  proficiency: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const skillSchema = new Schema<ISkill>(
  {
    portfolioId: {
      type: Schema.Types.ObjectId,
      ref: 'Portfolio',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    proficiency: {
      type: Number,
      min: 0,
      max: 100,
      default: 70,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Skill = models.Skill || model<ISkill>('Skill', skillSchema);

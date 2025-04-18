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

interface IAboutContent {
  title?: string;
  bio?: string;
  profileImage?: string;
}

interface IProjectItem {
  id?: string;
  title: string;
  description: string;
  imageUrl?: string;
  projectUrl?: string;
  githubUrl?: string;
  tags: string[];
  order?: number;
}

interface IProjectsContent {
  items: IProjectItem[];
}

interface ISkillItem {
  name: string;
  proficiency: number;
}

interface ISkillCategory {
  name: string;
  skills: ISkillItem[];
}

interface ISkillsContent {
  categories: ISkillCategory[];
}

interface IExperienceItem {
  id?: string;
  title: string;
  company: string;
  location?: string;
  startDate: Date | string;
  endDate?: Date | string;
  current: boolean;
  description: string;
  order?: number;
}

interface IExperienceContent {
  items: IExperienceItem[];
}

interface IEducationItem {
  id?: string;
  degree: string;
  institution: string;
  location?: string;
  startDate: Date | string;
  endDate?: Date | string;
  description?: string;
  order?: number;
}

interface IEducationContent {
  items: IEducationItem[];
}

interface IContactContent {
  email?: string;
  phone?: string;
  address?: string;
  showContactForm?: boolean;
}

interface IGalleryItem {
  id?: string;
  title: string;
  description?: string;
  imageUrl: string;
  category?: string;
  order?: number;
}

interface IGalleryContent {
  items: IGalleryItem[];
}

export interface ISectionContent {
  about?: IAboutContent;
  projects?: IProjectsContent;
  skills?: ISkillsContent;
  experience?: IExperienceContent;
  education?: IEducationContent;
  contact?: IContactContent;
  gallery?: IGalleryContent;
  // Add other content types as needed
  [key: string]: any;
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
  sectionContent: ISectionContent;
  createdAt: Date;
  updatedAt: Date;
}

// Schema for section content
const aboutContentSchema = new Schema({
  title: { type: String, default: 'About Me' },
  bio: { type: String, default: '' },
  profileImage: { type: String, default: '' },
}, { _id: false });

const projectItemSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  imageUrl: { type: String },
  projectUrl: { type: String },
  githubUrl: { type: String },
  tags: { type: [String], default: [] },
  order: { type: Number, default: 0 },
}, { _id: false });

const projectsContentSchema = new Schema({
  items: { type: [projectItemSchema], default: [] },
}, { _id: false });

const skillItemSchema = new Schema({
  name: { type: String, required: true },
  proficiency: { type: Number, min: 0, max: 100, default: 50 },
}, { _id: false });

const skillCategorySchema = new Schema({
  name: { type: String, required: true },
  skills: { type: [skillItemSchema], default: [] },
}, { _id: false });

const skillsContentSchema = new Schema({
  categories: { type: [skillCategorySchema], default: [] },
}, { _id: false });

const experienceItemSchema = new Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  current: { type: Boolean, default: false },
  description: { type: String, default: '' },
  order: { type: Number, default: 0 },
}, { _id: false });

const experienceContentSchema = new Schema({
  items: { type: [experienceItemSchema], default: [] },
}, { _id: false });

const educationItemSchema = new Schema({
  degree: { type: String, required: true },
  institution: { type: String, required: true },
  location: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  description: { type: String },
  order: { type: Number, default: 0 },
}, { _id: false });

const educationContentSchema = new Schema({
  items: { type: [educationItemSchema], default: [] },
}, { _id: false });

const contactContentSchema = new Schema({
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  showContactForm: { type: Boolean, default: true },
}, { _id: false });

const galleryItemSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String, required: true },
  category: { type: String },
  order: { type: Number, default: 0 },
}, { _id: false });

const galleryContentSchema = new Schema({
  items: { type: [galleryItemSchema], default: [] },
}, { _id: false });

// Main section content schema
const sectionContentSchema = new Schema({
  about: { type: aboutContentSchema, default: () => ({}) },
  projects: { type: projectsContentSchema, default: () => ({ items: [] }) },
  skills: { type: skillsContentSchema, default: () => ({ categories: [] }) },
  experience: { type: experienceContentSchema, default: () => ({ items: [] }) },
  education: { type: educationContentSchema, default: () => ({ items: [] }) },
  contact: { type: contactContentSchema, default: () => ({}) },
  gallery: { type: galleryContentSchema, default: () => ({ items: [] }) },
  // Add other section schemas as needed
}, { _id: false, strict: false }); // Allow additional fields not in the schema

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
    sectionContent: {
      type: sectionContentSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

export const Portfolio = models.Portfolio || model<IPortfolio>('Portfolio', portfolioSchema);

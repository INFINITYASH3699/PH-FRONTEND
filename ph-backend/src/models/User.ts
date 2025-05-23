// src/models/User.ts
import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";

// Interface for social links
interface SocialLinks {
  github?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  [key: string]: string | undefined;
}

// Interface for a skill
interface Skill {
  name: string;
  proficiency: number;
}

// Interface for a skill category
interface SkillCategory {
  name: string;
  skills: Skill[];
}

// Interface for an education item
interface Education {
  degree: string;
  institution: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

// Interface for an experience item
interface Experience {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

// Interface for a project
interface Project {
  title: string;
  description: string;
  imageUrl?: string;
  projectUrl?: string;
  githubUrl?: string;
  tags: string[];
}

// Interface for subscription plan
interface SubscriptionPlan {
  type: "free" | "premium" | "professional";
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  features?: {
    customDomain: boolean;
    analytics: boolean;
    multiplePortfolios: boolean;
    removeWatermark: boolean;
  };
}

// Interface for user profile
interface UserProfile {
  title?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: SocialLinks;
  // New fields
  skills?: SkillCategory[];
  education?: Education[];
  experience?: Experience[];
  projects?: Project[];
}

export interface IUser extends Document {
  fullName: string;
  username: string;
  email: string;
  password: string;
  profilePicture?: string;
  profilePictureId?: string; // Cloudinary public ID
  role: "user" | "admin";
  profile?: UserProfile;
  favoriteTemplates: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  // Add subscription plan
  subscriptionPlan?: SubscriptionPlan;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const SocialLinksSchema = new Schema(
  {
    github: { type: String },
    twitter: { type: String },
    linkedin: { type: String },
    instagram: { type: String },
  },
  { _id: false }
);

// Define schema for skills
const SkillSchema = new Schema(
  {
    name: { type: String, required: true },
    proficiency: { type: Number, required: true, min: 0, max: 100 },
  },
  { _id: false }
);

const SkillCategorySchema = new Schema(
  {
    name: { type: String, required: true },
    skills: [SkillSchema],
  },
  { _id: false }
);

// Define schema for education
const EducationSchema = new Schema(
  {
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    location: { type: String },
    startDate: { type: String, required: true },
    endDate: { type: String },
    description: { type: String },
  },
  { _id: false }
);

// Define schema for experience
const ExperienceSchema = new Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String },
    startDate: { type: String, required: true },
    endDate: { type: String },
    current: { type: Boolean, default: false },
    description: { type: String, required: true },
  },
  { _id: false }
);

// Define schema for project
const ProjectSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String },
    projectUrl: { type: String },
    githubUrl: { type: String },
    tags: [{ type: String }],
  },
  { _id: false }
);

// Define schema for subscription features
const SubscriptionFeaturesSchema = new Schema(
  {
    customDomain: { type: Boolean, default: false },
    analytics: { type: Boolean, default: false },
    multiplePortfolios: { type: Boolean, default: false },
    removeWatermark: { type: Boolean, default: false },
  },
  { _id: false }
);

// Define schema for subscription plan
const SubscriptionPlanSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["free", "premium", "professional"],
      default: "free"
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
    features: {
      type: SubscriptionFeaturesSchema,
      default: () => ({
        customDomain: false,
        analytics: false,
        multiplePortfolios: false,
        removeWatermark: false
      })
    },
  },
  { _id: false }
);

const UserProfileSchema = new Schema(
  {
    title: { type: String },
    bio: { type: String, maxlength: 500 },
    location: { type: String },
    website: { type: String },
    socialLinks: { type: SocialLinksSchema, default: {} },
    // Add new fields to user profile
    skills: [SkillCategorySchema],
    education: [EducationSchema],
    experience: [ExperienceSchema],
    projects: [ProjectSchema],
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      lowercase: true,
      unique: true,
      match: [
        /^[a-zA-Z0-9_-]{3,30}$/,
        "Username can only contain letters, numbers, underscores, and hyphens",
      ],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      unique: true,
      match: [/.+\@.+\..+/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    profilePictureId: {
      type: String,
      default: "", // Cloudinary public ID
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    profile: {
      type: UserProfileSchema,
      default: {},
    },
    favoriteTemplates: [{
      type: Schema.Types.ObjectId,
      ref: 'Template',
    }],
    // Add subscription plan to the schema
    subscriptionPlan: {
      type: SubscriptionPlanSchema,
      default: () => ({
        type: "free",
        startDate: new Date(),
        isActive: true,
        features: {
          customDomain: false,
          analytics: false,
          multiplePortfolios: false,
          removeWatermark: false
        }
      })
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Add a pre-save hook for validation and debug
UserSchema.pre('save', async function(next) {
  // Do nothing if password is modified - that's handled by the existing hook
  if (this.isModified("password")) return next();

  // Debug the profile update
  if (this.isModified("profile") || this.isModified("profile.skills") ||
      this.isModified("profile.education") || this.isModified("profile.experience") ||
      this.isModified("profile.projects")) {
  }

  next();
});

// Add a post-save hook for debugging
UserSchema.post('save', function(doc) {
  if (doc.profile) {
    // Add type safety by treating the profile as a Record
    const profile = doc.profile as Record<string, any>;

    // Get all keys and filter out undefined/null values
    const profileFields = Object.keys(profile).filter(key =>
      profile[key] !== undefined &&
      profile[key] !== null);

    // Log array lengths with proper type safety
    const arrayFields = ['skills', 'education', 'experience', 'projects'];
    arrayFields.forEach(field => {
      if (profile[field] && Array.isArray(profile[field])) {
      }
    });
  } else {
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch {
    return false;
  }
};

const User = mongoose.model<IUser>("User", UserSchema);

export default User;

import mongoose, { Document, Schema } from 'mongoose';

// Define section component interfaces
interface SectionComponent {
  type: string;
  allowedComponents: string[];
  defaultData: Record<string, any>;
}

// Define section configuration
interface SectionDefinition {
  type: string;
  allowedComponents: string[];
  defaultData: Record<string, any>;
}

// Define layout configuration
interface LayoutConfig {
  id: string;
  name: string;
  previewImage?: string;
  structure: {
    sections: string[];
    gridSystem: string;
    spacing?: Record<string, number>;
  };
}

// Define color scheme
interface ColorScheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent?: string;
    [key: string]: string | undefined;
  };
}

// Define font pairing
interface FontPairing {
  id: string;
  name: string;
  fonts: {
    heading: string;
    body: string;
    mono?: string;
    [key: string]: string | undefined;
  };
}

// Define spacing configuration
interface SpacingConfig {
  id: string;
  name: string;
  base: number;
  multiplier: number;
}

// Define theme options
interface ThemeOptions {
  colorSchemes: ColorScheme[];
  fontPairings: FontPairing[];
  spacing: {
    [key: string]: {
      base: number;
      multiplier: number;
    };
  };
}

// Define component mapping
interface ComponentMapping {
  [platform: string]: {
    [componentType: string]: string;
  };
}

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

  // Enhanced structure for template customization
  layouts?: LayoutConfig[];
  sectionDefinitions?: {
    [sectionType: string]: SectionDefinition;
  };
  themeOptions?: {
    colorSchemes: ColorScheme[];
    fontPairings: FontPairing[];
    spacing: {
      [key: string]: {
        base: number;
        multiplier: number;
      };
    };
  };
  componentMapping?: ComponentMapping;
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

// Define schema for color scheme
const ColorSchemeSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    colors: {
      primary: { type: String, required: true },
      secondary: { type: String, required: true },
      background: { type: String, required: true },
      text: { type: String, required: true },
      accent: { type: String },
    }
  },
  { _id: false }
);

// Define schema for font pairing
const FontPairingSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    fonts: {
      heading: { type: String, required: true },
      body: { type: String, required: true },
      mono: { type: String }
    }
  },
  { _id: false }
);

// Define schema for spacing configuration
const SpacingConfigSchema = new Schema(
  {
    base: { type: Number, required: true },
    multiplier: { type: Number, required: true }
  },
  { _id: false }
);

// Define schema for section definition
const SectionDefinitionSchema = new Schema(
  {
    type: { type: String, required: true },
    allowedComponents: [{ type: String }],
    defaultData: { type: Schema.Types.Mixed, default: {} }
  },
  { _id: false }
);

// Define schema for layout configuration
const LayoutConfigSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    previewImage: { type: String },
    structure: {
      sections: [{ type: String }],
      gridSystem: { type: String, required: true },
      spacing: { type: Schema.Types.Mixed }
    }
  },
  { _id: false }
);

// Define theme options schema
const ThemeOptionsSchema = new Schema(
  {
    colorSchemes: [ColorSchemeSchema],
    fontPairings: [FontPairingSchema],
    spacing: { type: Schema.Types.Mixed, default: {} }
  },
  { _id: false }
);

// Define schema for component mapping
const ComponentMappingSchema = new Schema(
  {
    // This is a dynamic object with platform keys like 'react' mapping to component types
  },
  { _id: false, strict: false }
);

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
      enum: ['developer', 'designer', 'photographer', 'professional', 'creative', 'minimal', 'modern', 'other'],
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

    // Enhanced structure fields
    layouts: {
      type: [LayoutConfigSchema],
      default: [],
    },
    sectionDefinitions: {
      type: Schema.Types.Mixed,
      default: {},
    },
    themeOptions: {
      type: ThemeOptionsSchema,
      default: () => ({
        colorSchemes: [],
        fontPairings: [],
        spacing: {}
      }),
    },
    componentMapping: {
      type: Schema.Types.Mixed,
      default: {},
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

// Add a pre-save hook for defaulting to basic layouts and theme options
TemplateSchema.pre('save', function(next) {
  // If layouts are empty, create a default layout based on category
  if (!this.layouts || this.layouts.length === 0) {
    const defaultSections = this.category === 'developer'
      ? ['header', 'about', 'projects', 'skills', 'experience', 'education', 'contact']
      : this.category === 'designer'
        ? ['header', 'about', 'gallery', 'work', 'clients', 'testimonials', 'contact']
        : ['header', 'about', 'galleries', 'categories', 'services', 'pricing', 'contact'];

    this.layouts = [{
      id: 'default',
      name: 'Standard Layout',
      structure: {
        sections: defaultSections,
        gridSystem: '12-column'
      }
    }];
  }

  // If theme options are not set, create default color schemes and font pairings
  if (!this.themeOptions?.colorSchemes || this.themeOptions.colorSchemes.length === 0) {
    if (!this.themeOptions) {
      this.themeOptions = {
        colorSchemes: [],
        fontPairings: [],
        spacing: {}
      };
    }

    const defaultColors = {
      developer: { primary: '#6366f1', secondary: '#8b5cf6', background: '#ffffff', text: '#111827' },
      designer: { primary: '#ec4899', secondary: '#f43f5e', background: '#ffffff', text: '#111827' },
      photographer: { primary: '#000000', secondary: '#404040', background: '#ffffff', text: '#111827' }
    };

    // Use category or default to 'developer'
    const categoryColors = defaultColors[this.category as keyof typeof defaultColors] || defaultColors.developer;

    this.themeOptions.colorSchemes = [
      {
        id: 'default',
        name: 'Default',
        colors: categoryColors
      },
      {
        id: 'dark',
        name: 'Dark Mode',
        colors: {
          primary: categoryColors.primary,
          secondary: categoryColors.secondary,
          background: '#111827',
          text: '#f3f4f6'
        }
      }
    ];
  }

  // Default font pairings if not set
  if (!this.themeOptions?.fontPairings || this.themeOptions.fontPairings.length === 0) {
    const defaultFonts = {
      developer: { heading: 'Inter', body: 'Roboto' },
      designer: { heading: 'Poppins', body: 'Montserrat' },
      photographer: { heading: 'Playfair Display', body: 'Raleway' }
    };

    const categoryFonts = defaultFonts[this.category as keyof typeof defaultFonts] || defaultFonts.developer;

    this.themeOptions.fontPairings = [
      {
        id: 'default',
        name: 'Default',
        fonts: categoryFonts
      }
    ];
  }

  next();
});

const Template = mongoose.model<ITemplate>('Template', TemplateSchema);

export default Template;

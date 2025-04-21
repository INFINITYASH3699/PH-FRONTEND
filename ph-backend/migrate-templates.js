/**
 * Template Migration Script
 *
 * This script migrates existing templates to the enhanced schema with layouts,
 * theme options, and section definitions.
 *
 * Usage:
 * node migrate-templates.js
 */

// Load environment variables
require('dotenv').config();

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://yash3699:Yash3699@cluster0.fmpir.mongodb.net/Auth?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Define Template Schema (simplified version of the full schema)
const templateSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: String,
  previewImage: String,
  defaultStructure: mongoose.Schema.Types.Mixed,
  isPublished: Boolean,
  createdBy: mongoose.Schema.Types.ObjectId,
  createdAt: Date,
  updatedAt: Date,
  isFeatured: Boolean,
  rating: {
    average: Number,
    count: Number
  },
  reviews: [{
    userId: mongoose.Schema.Types.ObjectId,
    rating: Number,
    comment: String,
    createdAt: Date
  }],
  tags: [String],
  usageCount: Number,
  previewImages: [String],

  // Enhanced structure fields
  layouts: [{
    id: String,
    name: String,
    previewImage: String,
    structure: {
      sections: [String],
      gridSystem: String,
      spacing: mongoose.Schema.Types.Mixed
    }
  }],
  sectionDefinitions: mongoose.Schema.Types.Mixed,
  themeOptions: {
    colorSchemes: [{
      id: String,
      name: String,
      colors: mongoose.Schema.Types.Mixed
    }],
    fontPairings: [{
      id: String,
      name: String,
      fonts: mongoose.Schema.Types.Mixed
    }],
    spacing: mongoose.Schema.Types.Mixed
  },
  componentMapping: mongoose.Schema.Types.Mixed,
  customizationOptions: {
    colorSchemes: [{
      name: String,
      primary: String,
      secondary: String,
      background: String,
      text: String
    }],
    fontPairings: [{
      name: String,
      heading: String,
      body: String
    }],
    layouts: [String]
  }
});

const Template = mongoose.model('Template', templateSchema);

/**
 * Generate enhanced schema data based on template category
 */
const generateEnhancedSchemaData = (template) => {
  const category = template.category;

  // Default sections based on category
  const sections = category === 'developer'
    ? ['header', 'about', 'projects', 'skills', 'experience', 'education', 'contact']
    : category === 'designer'
      ? ['header', 'about', 'gallery', 'work', 'clients', 'testimonials', 'contact']
      : category === 'photographer'
        ? ['header', 'about', 'galleries', 'categories', 'services', 'pricing', 'contact']
        : ['header', 'about', 'projects', 'skills', 'experience', 'education', 'contact'];

  // Default colors based on category
  const defaultColors = {
    developer: { primary: '#6366f1', secondary: '#8b5cf6', background: '#ffffff', text: '#111827' },
    designer: { primary: '#ec4899', secondary: '#f43f5e', background: '#ffffff', text: '#111827' },
    photographer: { primary: '#000000', secondary: '#404040', background: '#ffffff', text: '#111827' },
    default: { primary: '#6366f1', secondary: '#8b5cf6', background: '#ffffff', text: '#111827' }
  };

  // Default fonts based on category
  const defaultFonts = {
    developer: { heading: 'Inter', body: 'Roboto', mono: 'Fira Code' },
    designer: { heading: 'Poppins', body: 'Montserrat' },
    photographer: { heading: 'Playfair Display', body: 'Raleway' },
    default: { heading: 'Inter', body: 'Roboto' }
  };

  // Get colors and fonts for this category
  const colors = defaultColors[category] || defaultColors.default;
  const fonts = defaultFonts[category] || defaultFonts.default;

  // Generate section definitions
  const sectionDefinitions = {};
  sections.forEach(section => {
    switch (section) {
      case 'header':
        sectionDefinitions[section] = {
          type: 'header',
          allowedComponents: ['title', 'subtitle', 'navigation', 'profile-image', 'background-image'],
          defaultData: {
            title: 'Your Name',
            subtitle: category === 'developer' ? 'Software Developer' :
                    category === 'designer' ? 'Creative Designer' :
                    category === 'photographer' ? 'Photographer' : 'Professional'
          }
        };
        break;
      case 'about':
        sectionDefinitions[section] = {
          type: 'section',
          allowedComponents: ['title', 'bio', 'image', 'highlights'],
          defaultData: {
            title: 'About Me',
            bio: 'Share your story, background, and what makes you unique.',
            variant: category === 'designer' ? 'with-image' :
                   category === 'developer' ? 'with-highlights' : 'standard'
          }
        };
        break;
      case 'projects':
      case 'work':
        sectionDefinitions[section] = {
          type: 'section',
          allowedComponents: ['title', 'project-items'],
          defaultData: {
            title: section === 'projects' ? 'Projects' : 'My Work',
            items: []
          }
        };
        break;
      case 'skills':
        sectionDefinitions[section] = {
          type: 'section',
          allowedComponents: ['title', 'skill-categories'],
          defaultData: {
            title: 'Skills',
            categories: []
          }
        };
        break;
      default:
        sectionDefinitions[section] = {
          type: 'section',
          allowedComponents: ['title', 'content'],
          defaultData: {
            title: section.charAt(0).toUpperCase() + section.slice(1)
          }
        };
    }
  });

  // Generate layouts based on template
  const layouts = [
    {
      id: 'default',
      name: 'Standard Layout',
      structure: {
        sections: sections,
        gridSystem: '12-column',
        spacing: { base: 8, multiplier: 1.5 }
      }
    }
  ];

  // Add alternative layouts based on category
  if (category === 'developer') {
    layouts.push({
      id: 'sidebar',
      name: 'Sidebar Navigation',
      structure: {
        sections: sections,
        gridSystem: 'sidebar-main',
        spacing: { base: 8, multiplier: 1.5 }
      }
    });
  }

  if (category === 'photographer' || category === 'designer') {
    layouts.push({
      id: 'minimal',
      name: 'Minimal Portfolio',
      structure: {
        sections: ['header', 'gallery', 'contact'],
        gridSystem: '12-column',
        spacing: { base: 12, multiplier: 1.8 }
      }
    });
  }

  // Generate theme options
  const themeOptions = {
    colorSchemes: [
      {
        id: 'default',
        name: 'Default',
        colors: colors
      },
      {
        id: 'dark',
        name: 'Dark Mode',
        colors: {
          primary: colors.primary,
          secondary: colors.secondary,
          background: '#111827',
          text: '#f9fafb',
          accent: category === 'designer' ? '#f43f5e' : '#3b82f6'
        }
      }
    ],
    fontPairings: [
      {
        id: 'default',
        name: 'Default',
        fonts: fonts
      }
    ],
    spacing: {
      compact: { base: 4, multiplier: 1.2 },
      standard: { base: 8, multiplier: 1.5 },
      spacious: { base: 12, multiplier: 1.8 }
    }
  };

  // Add extra color schemes for certain categories
  if (category === 'designer') {
    themeOptions.colorSchemes.push({
      id: 'vibrant',
      name: 'Vibrant',
      colors: {
        primary: '#f43f5e',
        secondary: '#8b5cf6',
        background: '#ffffff',
        text: '#18181b',
        accent: '#06b6d4'
      }
    });
  }

  if (category === 'developer') {
    themeOptions.colorSchemes.push({
      id: 'github',
      name: 'GitHub Theme',
      colors: {
        primary: '#0969da',
        secondary: '#6e7781',
        background: '#ffffff',
        text: '#24292f',
        accent: '#2da44e'
      }
    });

    // Add a secondary font pairing for developers
    themeOptions.fontPairings.push({
      id: 'code',
      name: 'Code-Optimized',
      fonts: {
        heading: 'JetBrains Mono',
        body: 'Inter',
        mono: 'JetBrains Mono'
      }
    });
  }

  // Component mapping for frontend rendering
  const componentMapping = {
    react: {
      header: '@/components/template-sections/HeaderSection',
      about: '@/components/template-sections/AboutSection',
      projects: '@/components/template-sections/ProjectsSection',
      skills: '@/components/template-sections/SkillsSection',
      experience: '@/components/template-sections/ExperienceSection',
      education: '@/components/template-sections/EducationSection',
      contact: '@/components/template-sections/ContactSection',
      gallery: '@/components/template-sections/GallerySection',
      work: '@/components/template-sections/WorkSection',
      services: '@/components/template-sections/ServicesSection'
    }
  };

  return {
    layouts,
    sectionDefinitions,
    themeOptions,
    componentMapping
  };
};

/**
 * Run the migration
 */
const runMigration = async () => {
  try {
    // Connect to the database
    const connected = await connectDB();
    if (!connected) return;

    // Get all templates
    const templates = await Template.find({});
    console.log(`Found ${templates.length} templates to migrate`);

    // Migrate each template
    for (const template of templates) {
      console.log(`Migrating template: ${template.name} (${template._id})`);

      // Generate enhanced schema data
      const enhancedData = generateEnhancedSchemaData(template);

      // Update the template
      await Template.updateOne(
        { _id: template._id },
        {
          $set: {
            layouts: enhancedData.layouts,
            sectionDefinitions: enhancedData.sectionDefinitions,
            themeOptions: enhancedData.themeOptions,
            componentMapping: enhancedData.componentMapping
          }
        }
      );

      console.log(`✓ Migrated template: ${template.name}`);
    }

    console.log('Migration completed successfully!');

    // Close the database connection
    await mongoose.connection.close();
    console.log('Database connection closed');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

// Run the migration
runMigration();

/**
 * Template Enhancement Script
 *
 * This script enhances existing templates with additional variations,
 * layouts, and customization options.
 *
 * Usage:
 * node enhance-templates.js
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

// Define simplified Template Schema
const templateSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: String,
  layouts: Array,
  sectionDefinitions: Object,
  themeOptions: Object,
  componentMapping: Object,
  sectionVariants: Object,
  stylePresets: Object,
  animations: Object,
  responsiveLayouts: Object
}, { strict: false });

const Template = mongoose.model('Template', templateSchema);

/**
 * Generate enhanced layouts for different template categories
 */
const generateEnhancedLayouts = (template) => {
  const category = template.category;
  const existingLayouts = template.layouts || [];

  // Only add layouts if they don't already exist
  const existingLayoutIds = existingLayouts.map(layout => layout.id);
  const newLayouts = [];

  // Add alternative layouts for developer templates
  if (category === 'developer') {
    if (!existingLayoutIds.includes('sidebar-right')) {
      newLayouts.push({
        id: 'sidebar-right',
        name: 'Right Sidebar',
        structure: {
          sections: ['header', 'about', 'projects', 'skills', 'experience', 'education', 'contact'],
          gridSystem: 'sidebar-right',
          responsive: {
            mobile: { layout: 'stacked' },
            tablet: { layout: 'sidebar-right' },
            desktop: { layout: 'sidebar-right' }
          }
        }
      });
    }

    if (!existingLayoutIds.includes('tabbed')) {
      newLayouts.push({
        id: 'tabbed',
        name: 'Tabbed Content',
        structure: {
          sections: ['header', 'tabs'],
          gridSystem: 'tabs',
          groups: {
            tabs: {
              name: 'Tabbed Sections',
              sections: ['about', 'projects', 'skills', 'experience', 'education', 'contact']
            }
          }
        }
      });
    }
  }

  // Add alternative layouts for designer templates
  if (category === 'designer' || category === 'creative') {
    if (!existingLayoutIds.includes('masonry')) {
      newLayouts.push({
        id: 'masonry',
        name: 'Masonry Layout',
        structure: {
          sections: ['header', 'about', 'gallery', 'work', 'contact'],
          gridSystem: 'masonry',
          spacing: { base: 12, multiplier: 1.8 }
        }
      });
    }

    if (!existingLayoutIds.includes('full-screen')) {
      newLayouts.push({
        id: 'full-screen',
        name: 'Full Screen Sections',
        structure: {
          sections: ['header', 'about', 'gallery', 'work', 'contact'],
          gridSystem: 'full-screen'
        }
      });
    }
  }

  // Add alternative layouts for photographer templates
  if (category === 'photographer') {
    if (!existingLayoutIds.includes('carousel')) {
      newLayouts.push({
        id: 'carousel',
        name: 'Carousel Showcase',
        structure: {
          sections: ['header', 'about', 'carousel', 'categories', 'contact'],
          gridSystem: 'carousel'
        }
      });
    }

    if (!existingLayoutIds.includes('portfolio-grid')) {
      newLayouts.push({
        id: 'portfolio-grid',
        name: 'Portfolio Grid',
        structure: {
          sections: ['header', 'galleries', 'services', 'contact'],
          gridSystem: 'portfolio-grid'
        }
      });
    }
  }

  return [...existingLayouts, ...newLayouts];
};

/**
 * Generate section variants for templates
 */
const generateSectionVariants = (template) => {
  // Define base section variants
  const baseVariants = {
    header: [
      {
        id: 'standard',
        name: 'Standard',
        description: 'Standard header with name and title',
        configuration: { variant: 'centered', alignment: 'left' }
      },
      {
        id: 'centered',
        name: 'Centered',
        description: 'Centered header with profile image',
        configuration: { variant: 'centered', alignment: 'center' }
      },
      {
        id: 'minimal',
        name: 'Minimal',
        description: 'Minimal header with name and title only',
        configuration: { variant: 'minimal', alignment: 'left' }
      },
      {
        id: 'hero',
        name: 'Hero',
        description: 'Full-screen hero header with background image',
        configuration: { variant: 'hero', alignment: 'center' }
      },
      {
        id: 'split',
        name: 'Split',
        description: 'Split layout with image on one side and text on the other',
        configuration: { variant: 'split', alignment: 'left' }
      }
    ],
    about: [
      {
        id: 'standard',
        name: 'Standard',
        description: 'Standard about section with bio',
        configuration: { variant: 'standard' }
      },
      {
        id: 'withImage',
        name: 'With Image',
        description: 'About section with image',
        configuration: { variant: 'with-image' }
      },
      {
        id: 'withHighlights',
        name: 'With Highlights',
        description: 'About section with highlights',
        configuration: { variant: 'with-highlights' }
      },
      {
        id: 'minimal',
        name: 'Minimal',
        description: 'Minimal about section with just essential info',
        configuration: { variant: 'minimal' }
      }
    ],
    projects: [
      {
        id: 'grid',
        name: 'Grid Layout',
        description: 'Projects displayed in a grid',
        configuration: { layout: 'grid', columns: 3 }
      },
      {
        id: 'list',
        name: 'List Layout',
        description: 'Projects displayed in a vertical list',
        configuration: { layout: 'list' }
      },
      {
        id: 'featured',
        name: 'Featured Project',
        description: 'One featured project with smaller projects below',
        configuration: { layout: 'featured' }
      }
    ],
    skills: [
      {
        id: 'bars',
        name: 'Skill Bars',
        description: 'Skills displayed as progress bars',
        configuration: { display: 'bars' }
      },
      {
        id: 'tags',
        name: 'Skill Tags',
        description: 'Skills displayed as tags/pills',
        configuration: { display: 'tags' }
      },
      {
        id: 'categories',
        name: 'Categorized Skills',
        description: 'Skills grouped by categories',
        configuration: { display: 'categories' }
      }
    ],
    experience: [
      {
        id: 'timeline',
        name: 'Timeline',
        description: 'Experience displayed as a timeline',
        configuration: { display: 'timeline' }
      },
      {
        id: 'cards',
        name: 'Experience Cards',
        description: 'Experience displayed as cards',
        configuration: { display: 'cards' }
      }
    ],
    education: [
      {
        id: 'timeline',
        name: 'Timeline',
        description: 'Education displayed as a timeline',
        configuration: { display: 'timeline' }
      },
      {
        id: 'cards',
        name: 'Education Cards',
        description: 'Education displayed as cards',
        configuration: { display: 'cards' }
      }
    ],
    gallery: [
      {
        id: 'grid',
        name: 'Grid Gallery',
        description: 'Images displayed in a grid',
        configuration: { layout: 'grid', columns: 3 }
      },
      {
        id: 'masonry',
        name: 'Masonry Gallery',
        description: 'Images displayed in a masonry layout',
        configuration: { layout: 'masonry' }
      },
      {
        id: 'carousel',
        name: 'Carousel Gallery',
        description: 'Images displayed in a carousel',
        configuration: { layout: 'carousel' }
      }
    ],
    contact: [
      {
        id: 'simple',
        name: 'Simple Contact',
        description: 'Simple contact section with links',
        configuration: { formType: 'simple' }
      },
      {
        id: 'form',
        name: 'Contact Form',
        description: 'Full contact form with fields',
        configuration: { formType: 'full' }
      },
      {
        id: 'split',
        name: 'Split Contact',
        description: 'Contact form with map or image on the side',
        configuration: { formType: 'split' }
      }
    ]
  };

  // Customize for specific template categories
  if (template.category === 'photographer') {
    baseVariants.header.push({
      id: 'fullscreen-gallery',
      name: 'Fullscreen Gallery Header',
      description: 'Header with fullscreen background gallery',
      configuration: { variant: 'gallery', alignment: 'center' }
    });

    baseVariants.gallery.push({
      id: 'fullwidth',
      name: 'Full Width Gallery',
      description: 'Full width gallery with large images',
      configuration: { layout: 'fullwidth' }
    });
  }

  if (template.category === 'designer') {
    baseVariants.work = [
      {
        id: 'grid',
        name: 'Work Grid',
        description: 'Work displayed in a grid',
        configuration: { layout: 'grid', columns: 3 }
      },
      {
        id: 'featured',
        name: 'Featured Work',
        description: 'Featured work with case studies',
        configuration: { layout: 'featured' }
      },
      {
        id: 'interactive',
        name: 'Interactive Portfolio',
        description: 'Interactive portfolio with hover effects',
        configuration: { layout: 'interactive' }
      }
    ];
  }

  return baseVariants;
};

/**
 * Generate animations for templates
 */
const generateAnimations = () => {
  return {
    fadeIn: {
      id: 'fadeIn',
      name: 'Fade In',
      type: 'fade',
      duration: 800,
      easing: 'ease-in-out'
    },
    slideUp: {
      id: 'slideUp',
      name: 'Slide Up',
      type: 'slide',
      direction: 'up',
      duration: 600,
      easing: 'ease-out'
    },
    slideRight: {
      id: 'slideRight',
      name: 'Slide Right',
      type: 'slide',
      direction: 'right',
      duration: 600,
      easing: 'ease-out'
    },
    zoomIn: {
      id: 'zoomIn',
      name: 'Zoom In',
      type: 'zoom',
      duration: 500,
      easing: 'ease'
    },
    reveal: {
      id: 'reveal',
      name: 'Reveal',
      type: 'reveal',
      duration: 800,
      easing: 'cubic-bezier(0.77, 0, 0.175, 1)'
    },
    typewriter: {
      id: 'typewriter',
      name: 'Typewriter',
      type: 'typewriter',
      duration: 1200,
      easing: 'linear'
    }
  };
};

/**
 * Generate style presets for templates
 */
const generateStylePresets = (template) => {
  // Base style presets all templates get
  const basePresets = {
    modern: {
      name: 'Modern',
      description: 'Clean, modern style with rounded corners and subtle shadows',
      styles: {
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        fontWeight: 'normal'
      }
    },
    minimal: {
      name: 'Minimal',
      description: 'Minimalist style with thin borders and no shadows',
      styles: {
        borderRadius: '0.25rem',
        boxShadow: 'none',
        borderWidth: '1px',
        fontWeight: 'light'
      }
    },
    bold: {
      name: 'Bold',
      description: 'Bold style with strong colors and thick borders',
      styles: {
        borderRadius: '0.75rem',
        boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
        borderWidth: '3px',
        fontWeight: 'bold'
      }
    }
  };

  // Add category-specific presets
  if (template.category === 'developer') {
    basePresets.code = {
      name: 'Code-inspired',
      description: 'Inspired by code editors with monospace fonts and syntax highlighting',
      styles: {
        fontFamily: 'monospace',
        borderRadius: '0.25rem',
        boxShadow: 'none',
        borderWidth: '1px',
        padding: '1rem',
        backgroundColor: '#f8f9fa'
      }
    };
  }

  if (template.category === 'designer' || template.category === 'creative') {
    basePresets.artistic = {
      name: 'Artistic',
      description: 'Creative style with unique borders and artistic elements',
      styles: {
        borderRadius: '1rem 0 1rem 0',
        boxShadow: '5px 5px 0 rgba(0, 0, 0, 0.1)',
        borderWidth: '2px',
        fontWeight: 'normal'
      }
    };
  }

  if (template.category === 'photographer') {
    basePresets.darkroom = {
      name: 'Darkroom',
      description: 'Dark theme inspired by photography darkrooms',
      styles: {
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
        borderRadius: '0',
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
        borderWidth: '1px',
        borderColor: '#333333'
      }
    };
  }

  return basePresets;
};

/**
 * Generate enhanced color schemes for templates
 */
const generateEnhancedColorSchemes = (template) => {
  const existingColorSchemes = template.themeOptions?.colorSchemes || [];
  const existingIds = existingColorSchemes.map(scheme => scheme.id);
  const newColorSchemes = [];

  // Add new color schemes based on template category
  if (template.category === 'developer' && !existingIds.includes('modern-blue')) {
    newColorSchemes.push({
      id: 'modern-blue',
      name: 'Modern Blue',
      colors: {
        primary: '#0096ff',
        secondary: '#2563eb',
        background: '#f8fafc',
        text: '#0f172a',
        accent: '#0ea5e9'
      }
    });
  }

  if (template.category === 'developer' && !existingIds.includes('github-dark')) {
    newColorSchemes.push({
      id: 'github-dark',
      name: 'GitHub Dark',
      colors: {
        primary: '#58a6ff',
        secondary: '#238636',
        background: '#0d1117',
        text: '#c9d1d9',
        accent: '#f0883e'
      }
    });
  }

  if (template.category === 'designer' && !existingIds.includes('creative-purple')) {
    newColorSchemes.push({
      id: 'creative-purple',
      name: 'Creative Purple',
      colors: {
        primary: '#a855f7',
        secondary: '#d946ef',
        background: '#ffffff',
        text: '#18181b',
        accent: '#2563eb'
      }
    });
  }

  if (template.category === 'photographer' && !existingIds.includes('monochrome')) {
    newColorSchemes.push({
      id: 'monochrome',
      name: 'Monochrome',
      colors: {
        primary: '#262626',
        secondary: '#525252',
        background: '#ffffff',
        text: '#0a0a0a',
        accent: '#737373'
      }
    });
  }

  if (!existingIds.includes('high-contrast')) {
    newColorSchemes.push({
      id: 'high-contrast',
      name: 'High Contrast',
      colors: {
        primary: '#000000',
        secondary: '#0284c7',
        background: '#ffffff',
        text: '#000000',
        accent: '#ef4444'
      }
    });
  }

  return [...existingColorSchemes, ...newColorSchemes];
};

/**
 * Generate enhanced font pairings for templates
 */
const generateEnhancedFontPairings = (template) => {
  const existingFontPairings = template.themeOptions?.fontPairings || [];
  const existingIds = existingFontPairings.map(pairing => pairing.id);
  const newFontPairings = [];

  if (!existingIds.includes('elegant')) {
    newFontPairings.push({
      id: 'elegant',
      name: 'Elegant',
      fonts: {
        heading: 'Cormorant Garamond',
        body: 'Nunito Sans'
      }
    });
  }

  if (template.category === 'developer' && !existingIds.includes('coding')) {
    newFontPairings.push({
      id: 'coding',
      name: 'Coding',
      fonts: {
        heading: 'Fira Code',
        body: 'IBM Plex Sans',
        mono: 'Fira Code'
      }
    });
  }

  if (template.category === 'designer' && !existingIds.includes('creative')) {
    newFontPairings.push({
      id: 'creative',
      name: 'Creative',
      fonts: {
        heading: 'Abril Fatface',
        body: 'Work Sans'
      }
    });
  }

  if (template.category === 'photographer' && !existingIds.includes('editorial')) {
    newFontPairings.push({
      id: 'editorial',
      name: 'Editorial',
      fonts: {
        heading: 'Playfair Display',
        body: 'Lora'
      }
    });
  }

  return [...existingFontPairings, ...newFontPairings];
};

/**
 * Run the enhancement script
 */
const enhanceTemplates = async () => {
  try {
    // Connect to the database
    const connected = await connectDB();
    if (!connected) return;

    // Get all templates
    const templates = await Template.find({});
    console.log(`Found ${templates.length} templates to enhance`);

    // Enhance each template
    for (const template of templates) {
      console.log(`Enhancing template: ${template.name} (${template._id})`);

      // Generate enhanced data
      const enhancedLayouts = generateEnhancedLayouts(template);
      const sectionVariants = generateSectionVariants(template);
      const animations = generateAnimations();
      const stylePresets = generateStylePresets(template);
      const enhancedColorSchemes = generateEnhancedColorSchemes(template);
      const enhancedFontPairings = generateEnhancedFontPairings(template);

      // Update template with enhanced data
      const updatedTemplate = await Template.findByIdAndUpdate(
        template._id,
        {
          $set: {
            layouts: enhancedLayouts,
            sectionVariants: sectionVariants,
            animations: animations,
            stylePresets: stylePresets,
            'themeOptions.colorSchemes': enhancedColorSchemes,
            'themeOptions.fontPairings': enhancedFontPairings
          }
        },
        { new: true }
      );

      console.log(`✓ Enhanced template: ${template.name}`);
      console.log(`  - Added ${enhancedLayouts.length - (template.layouts?.length || 0)} new layouts`);
      console.log(`  - Added ${Object.keys(sectionVariants).length} section variants`);
      console.log(`  - Added ${Object.keys(animations).length} animations`);
      console.log(`  - Added ${Object.keys(stylePresets).length} style presets`);
      console.log(`  - Added ${enhancedColorSchemes.length - (template.themeOptions?.colorSchemes?.length || 0)} new color schemes`);
      console.log(`  - Added ${enhancedFontPairings.length - (template.themeOptions?.fontPairings?.length || 0)} new font pairings`);
    }

    console.log('Template enhancement completed successfully!');

    // Close the database connection
    await mongoose.connection.close();
    console.log('Database connection closed');

  } catch (error) {
    console.error('Enhancement failed:', error);
    process.exit(1);
  }
};

// Run the enhancement script
enhanceTemplates();

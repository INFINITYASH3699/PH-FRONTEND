import React, { useEffect, useState } from 'react';
import TemplateRenderer from './TemplateRenderer';

interface PortfolioTemplateRendererProps {
  portfolio: any;
  template: any;
}

/**
 * Specialized component for rendering portfolios with the appropriate template configurations
 * based on the template's category and characteristics.
 */
const PortfolioTemplateRenderer: React.FC<PortfolioTemplateRendererProps> = ({ portfolio, template }) => {
  const [debug, setDebug] = useState<any>({});

  useEffect(() => {
    if (template && portfolio) {
      // Debug the structure to help troubleshoot
      const debugInfo = {
        templateId: template._id,
        templateName: template.name,
        portfolioId: portfolio._id,
        portfolioTitle: portfolio.title,
        contentKeys: portfolio.content ? Object.keys(portfolio.content) : [],
        sectionOrder: getSectionOrder(),
        defaultSections: template.defaultStructure?.layout?.sections || [],
        sectionDefinitions: template.sectionDefinitions ? Object.keys(template.sectionDefinitions) : []
      };

      console.log("Portfolio renderer debug:", debugInfo);
      setDebug(debugInfo);
    }
  }, [template, portfolio]);

  if (!template || !portfolio) {
    return <div className="min-h-screen bg-background">Loading...</div>;
  }

  // Ensure portfolio content is initialized
  if (!portfolio.content) {
    portfolio.content = {};
  }

  // Make sure required sections have at least empty content
  const ensureRequiredSections = () => {
    const sections = getSectionOrder();
    console.log("Ensuring all required sections have content:", sections);

    // Create initial empty section content structures based on section type
    const sectionDefaults = {
      header: { title: portfolio.title || 'My Portfolio', subtitle: portfolio.subtitle || 'Welcome to my portfolio' },
      about: { title: 'About Me', bio: 'This section contains information about me.' },
      projects: { title: 'My Projects', items: [] },
      skills: { title: 'My Skills', categories: [] },
      experience: { title: 'My Experience', items: [] },
      education: { title: 'My Education', items: [] },
      contact: { title: 'Contact Me', email: '' },
      gallery: { title: 'My Gallery', images: [] }
    };

    // Initialize sections that don't have content
    sections.forEach(section => {
      if (!portfolio.content[section]) {
        // Create completely new section with default structure
        portfolio.content[section] = sectionDefaults[section] || { title: section };
        console.log(`Created default structure for section: ${section}`);
      } else if (Object.keys(portfolio.content[section]).length === 0) {
        // If the section exists but is an empty object, provide default structure
        portfolio.content[section] = sectionDefaults[section] || { title: section };
        console.log(`Applied default structure to empty section: ${section}`);
      } else {
        console.log(`Section ${section} already has content:`, portfolio.content[section]);
      }
    });

    return portfolio;
  };

  // Determine the appropriate style preset based on template category
  const getStylePreset = () => {
    switch (template.category) {
      case 'designer':
        return 'creative';
      case 'photographer':
        return 'elegant';
      case 'developer':
      default:
        return 'modern';
    }
  };

  // Determine color scheme based on template or portfolio settings
  const getColorScheme = () => {
    // Use portfolio's selected color scheme if available
    if (portfolio.activeColorScheme) {
      return portfolio.activeColorScheme;
    }

    // Otherwise use the default color scheme from the template
    if (template.themeOptions?.colorSchemes?.length > 0) {
      return template.themeOptions.colorSchemes[0].colors;
    }

    return template.defaultStructure?.layout?.defaultColors || null;
  };

  // Get the appropriate layout
  const getLayout = () => {
    // Use portfolio's layout if set
    if (portfolio.activeLayout && template.layouts) {
      const layout = template.layouts.find(l => l.id === portfolio.activeLayout);
      if (layout) return layout;
    }

    // Otherwise use the first layout
    return template.layouts?.[0] || null;
  };

  // Get section order based on template and selected layout
  const getSectionOrder = () => {
    const layout = getLayout();

    if (layout?.structure?.sections) {
      return layout.structure.sections;
    }

    // If no layout found, use the default sections from template
    const defaultSections = template.defaultStructure?.layout?.sections;

    // Fallback to a set of common sections if nothing is defined
    if (!defaultSections || defaultSections.length === 0) {
      return ['header', 'about', 'projects', 'skills', 'experience', 'education', 'contact'];
    }

    return defaultSections;
  };

  // Get the appropriate section variants based on template category
  const getSectionVariants = () => {
    const variants: Record<string, string> = {};

    // Set default variants based on template category
    switch (template.category) {
      case 'designer':
        variants.about = 'with-image';
        variants.projects = 'grid';
        variants.header = 'split';
        break;

      case 'photographer':
        variants.about = 'minimal';
        variants.header = 'hero';
        variants.gallery = 'masonry';
        break;

      case 'developer':
      default:
        variants.about = 'with-highlights';
        variants.projects = 'grid';
        variants.skills = 'categories';
        variants.header = 'centered';
        break;
    }

    // Override with any custom variants set in the portfolio
    if (portfolio.sectionVariants) {
      return { ...variants, ...portfolio.sectionVariants };
    }

    return variants;
  };

  // Set proper animation based on template
  const getAnimation = () => {
    // Disable animations only if explicitly set to false
    return portfolio.animations !== false;
  };

  // Process the portfolio to ensure all required sections have content
  const processedPortfolio = ensureRequiredSections();

  return (
    <TemplateRenderer
      template={template}
      portfolio={processedPortfolio}
      sectionOrder={getSectionOrder()}
      customColors={getColorScheme()}
      animation={getAnimation()}
      stylePreset={getStylePreset()}
      sectionVariants={getSectionVariants()}
    />
  );
};

export default PortfolioTemplateRenderer;

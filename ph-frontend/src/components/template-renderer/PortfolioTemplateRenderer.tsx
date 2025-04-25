import React from 'react';
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
  if (!template || !portfolio) {
    return <div className="min-h-screen bg-background">Loading...</div>;
  }

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
    return template.defaultStructure?.layout?.defaultColors || null;
  };

  // Get the appropriate layout
  const getLayout = () => {
    // Use portfolio's layout if set
    if (portfolio.activeLayout) {
      return template.layouts?.find(l => l.id === portfolio.activeLayout);
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

    return template.defaultStructure?.layout?.sections || [];
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
        variants.about = 'with-highlights';
        variants.projects = 'cards';
        variants.skills = 'grouped';
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

  return (
    <TemplateRenderer
      template={template}
      portfolio={portfolio}
      sectionOrder={getSectionOrder()}
      customColors={getColorScheme()}
      animation={getAnimation()}
      stylePreset={getStylePreset()}
      sectionVariants={getSectionVariants()}
    />
  );
};

export default PortfolioTemplateRenderer;

"use client";

import React, { useEffect, useState } from 'react';
import {
  HeaderSection,
  AboutSection,
  ProjectsSection,
  SkillsSection,
  ExperienceSection,
  EducationSection,
  ContactSection,
  GallerySection,
  ServicesSection,
  TestimonialsSection,
  WorkSection,
  ClientsSection
} from './sections';

// Map of section types to their component implementations
const SECTION_COMPONENTS = {
  // Common sections
  'header': HeaderSection,
  'about': AboutSection,
  'contact': ContactSection,

  // Developer sections
  'projects': ProjectsSection,
  'skills': SkillsSection,
  'experience': ExperienceSection,
  'education': EducationSection,

  // Designer sections
  'gallery': GallerySection,
  'galleries': GallerySection, // Map to the same component for both singular and plural
  'work': WorkSection,
  'clients': ClientsSection,
  'testimonials': TestimonialsSection,

  // Photographer sections
  'services': ServicesSection,
  'categories': ProjectsSection, // Reuse projects component with different styling
  'pricing': ServicesSection // Reuse services with pricing-specific styling
};

interface TemplateRendererProps {
  template: any;
  portfolio: any;
  editable?: boolean;
  onSectionUpdate?: (sectionId: string, data: any) => void;
  customColors?: any;
  sectionOrder?: string[]; // Custom section order
  animation?: boolean; // Whether to enable animations
  stylePreset?: string; // Which style preset to use
  sectionVariants?: Record<string, string>; // Which variant to use for each section
}

const TemplateRenderer: React.FC<TemplateRendererProps> = ({
  template,
  portfolio,
  editable = false,
  onSectionUpdate,
  customColors,
  sectionOrder = [],
  animation = true,
  stylePreset = 'modern',
  sectionVariants = {}
}) => {
  const [isClient, setIsClient] = useState(false);
  const [animatedSections, setAnimatedSections] = useState<string[]>([]);
  const [observerSet, setObserverSet] = useState(false);

  // For debugging - log the template and portfolio data
  useEffect(() => {
    if (isClient && template && portfolio) {
      console.log('Template data:', {
        sections: template.defaultStructure?.layout?.sections,
        sectionDefinitions: template.sectionDefinitions,
        layouts: template.layouts,
        animations: template.animations,
        sectionVariants: template.sectionVariants,
        stylePresets: template.stylePresets
      });

      console.log('Portfolio data:', {
        sectionOrder,
        activeLayout: portfolio.activeLayout,
        content: Object.keys(portfolio.content || {})
      });
    }
  }, [isClient, template, portfolio, sectionOrder]);

  // Set isClient to true on component mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Set up intersection observer for animations
  useEffect(() => {
    if (isClient && animation && !observerSet && template?.animations) {
      const observerCallback = (entries: IntersectionObserverEntry[]) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id.replace('section-', '');
            setAnimatedSections(prev => {
              if (!prev.includes(sectionId)) {
                return [...prev, sectionId];
              }
              return prev;
            });
          }
        });
      };

      const observer = new IntersectionObserver(observerCallback, {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      });

      // Observe all section elements
      document.querySelectorAll('.section-wrapper').forEach(section => {
        observer.observe(section);
      });

      setObserverSet(true);

      return () => {
        observer.disconnect();
      };
    }
  }, [isClient, animation, observerSet, template, sectionOrder]);

  // If we don't have the required props or not on client yet, return empty div to avoid hydration issues
  if (!template || !portfolio || !isClient) {
    return <div className="min-h-screen bg-background"></div>;
  }

  // Get active layout (default to first one if not specified)
  const activeLayoutId = portfolio.activeLayout || (template.layouts?.[0]?.id || 'default');
  const activeLayout = template.layouts?.find(l => l.id === activeLayoutId) || template.layouts?.[0];

  // Get active theme options
  const activeColorSchemeId = portfolio.activeColorScheme || 'default';
  const activeFontPairingId = portfolio.activeFontPairing || 'modern';

  const colorScheme = template.themeOptions?.colorSchemes?.find(
    c => c.id === activeColorSchemeId
  ) || template.themeOptions?.colorSchemes?.[0];

  const fontPairing = template.themeOptions?.fontPairings?.find(
    f => f.id === activeFontPairingId
  ) || template.themeOptions?.fontPairings?.[0];

  // Get active style preset
  const activeStylePreset = template.stylePresets?.[stylePreset] || template.stylePresets?.modern || { styles: {} };

  // Generate CSS variables for the template
  const getCssVariables = () => {
    const variables: Record<string, string> = {};

    // Add color variables - use custom colors if provided, otherwise use the selected scheme
    const colors = customColors || colorScheme?.colors;
    if (colors) {
      Object.entries(colors).forEach(([key, value]) => {
        variables[`--color-${key}`] = value as string;
      });
    }

    // Add font variables
    if (fontPairing?.fonts) {
      Object.entries(fontPairing.fonts).forEach(([key, value]) => {
        variables[`--font-${key}`] = value as string;
      });
    }

    // Add style preset variables
    if (activeStylePreset?.styles) {
      Object.entries(activeStylePreset.styles).forEach(([key, value]) => {
        variables[`--style-${key}`] = value as string;
      });
    }

    return variables;
  };

  // Create inline style with CSS variables
  const templateStyle = {
    ...getCssVariables(),
    // Add default styles using the style preset
    borderRadius: `var(--style-borderRadius, '0.5rem')`,
    boxShadow: `var(--style-boxShadow, 'none')`,
    // Add more default styles as needed
  };

  // Determine which sections to render based on template layout, portfolio config, or custom order
  const defaultSections = activeLayout?.structure?.sections ||
    template.defaultStructure?.layout?.sections || [];

  // Use custom section order if provided, otherwise use default sections
  const sectionsToRender = sectionOrder.length > 0 ? sectionOrder : defaultSections;

  // Helper to get section content from portfolio data or template defaults
  const getSectionContent = (sectionType: string) => {
    // First try to get from portfolio content
    const portfolioContent = portfolio.content?.[sectionType];
    if (portfolioContent && Object.keys(portfolioContent).length > 0) {
      return portfolioContent;
    }

    // If not found or empty, try to get from template section definitions
    const templateDefault = template.sectionDefinitions?.[sectionType]?.defaultData;
    if (templateDefault) {
      return templateDefault;
    }

    // If all else fails, return empty object
    return {};
  };

  // Get animation style for a section
  const getAnimationStyle = (sectionType: string) => {
    if (!animation || !template.animations) return {};

    const defaultAnimation = template.animations.fadeIn;

    // Determine which animation to use (could be customized per section in the future)
    const animationType = sectionType === 'header' ? 'fadeIn' :
                           sectionType === 'about' ? 'slideUp' :
                           sectionType === 'skills' || sectionType === 'projects' ? 'slideRight' :
                           'fadeIn';

    const animationConfig = template.animations[animationType] || defaultAnimation;

    // Only apply animation if section is in the animated sections list
    const isAnimated = animatedSections.includes(sectionType);

    if (!isAnimated) {
      return {
        opacity: 0,
        transform: animationConfig.type === 'slide' ?
          `translate${animationConfig.direction === 'up' ? 'Y(40px)' :
                     animationConfig.direction === 'right' ? 'X(-40px)' :
                     animationConfig.direction === 'down' ? 'Y(-40px)' : 'X(40px)'}` :
          animationConfig.type === 'zoom' ? 'scale(0.95)' : 'none'
      };
    }

    return {
      opacity: 1,
      transform: 'none',
      transition: `opacity ${animationConfig.duration}ms ${animationConfig.easing}, transform ${animationConfig.duration}ms ${animationConfig.easing}`
    };
  };

  // Get the variant configuration for a section
  const getSectionVariant = (sectionType: string, content: any) => {
    const allVariants = template.sectionVariants?.[sectionType] || [];

    // If a specific variant is selected for this section, use it
    if (sectionVariants[sectionType] && allVariants.length > 0) {
      const selectedVariant = allVariants.find(v => v.id === sectionVariants[sectionType]);
      if (selectedVariant) {
        return { ...content, ...selectedVariant.configuration };
      }
    }

    // Otherwise use the variant specified in the content or default by template category
    return content;
  };

  // Create a fallback component for sections without defined components
  const FallbackSection = ({ sectionType, data }: { sectionType: string; data: any }) => {
    return (
      <div className="py-12 px-4 bg-muted/10 border rounded-md my-4">
        <h2 className="text-xl font-semibold mb-4 capitalize">{sectionType} Section</h2>
        <p className="text-muted-foreground mb-4">
          This section type doesn't have a specific component yet.
        </p>
        {editable && (
          <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    );
  };

  // Render the appropriate layout
  const renderLayout = () => {
    // Using the portfolio's stored layout information
    const gridClass = activeLayout?.structure?.gridSystem === 'sidebar-main'
      ? 'grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8'
      : activeLayout?.structure?.gridSystem === 'sidebar-right'
      ? 'grid grid-cols-1 md:grid-cols-[1fr_300px] gap-8'
      : activeLayout?.structure?.gridSystem === 'full-screen'
      ? 'flex flex-col' // Each section will be full screen
      : activeLayout?.structure?.gridSystem === 'masonry'
      ? 'masonry-grid' // Custom class for masonry layout
      : activeLayout?.structure?.gridSystem === 'tabs'
      ? 'tabs-layout' // Custom class for tabbed layout
      : 'flex flex-col gap-8'; // Default

    return (
      <div className={gridClass} style={templateStyle}>
        {sectionsToRender.map((sectionType: string) => {
          // Get the component for this section type, or use fallback
          const SectionComponent = SECTION_COMPONENTS[sectionType] ||
            ((props: any) => <FallbackSection sectionType={sectionType} data={props.data} />);

          // Get base content for the section
          const sectionContent = getSectionContent(sectionType);

          // Apply any selected variant configuration
          const variantContent = getSectionVariant(sectionType, sectionContent);

          // Get animation style for the section
          const animationStyle = getAnimationStyle(sectionType);

          // Special handling for full-screen sections
          const isFullScreen = activeLayout?.structure?.gridSystem === 'full-screen';
          const fullScreenClass = isFullScreen ? 'min-h-screen flex items-center justify-center' : '';

          return (
            <div
              key={sectionType}
              className={`section-wrapper ${fullScreenClass}`}
              id={`section-${sectionType}`}
              style={animationStyle}
            >
              <SectionComponent
                key={sectionType}
                data={variantContent}
                template={template}
                editable={editable}
                onUpdate={editable ? (data) => onSectionUpdate?.(sectionType, data) : undefined}
                stylePreset={activeStylePreset}
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="template-container">
      {/* Base Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .template-container {
          --border-radius: var(--style-borderRadius, 0.5rem);
          --box-shadow: var(--style-boxShadow, none);
          --font-weight: var(--style-fontWeight, normal);
          --border-width: var(--style-borderWidth, 1px);
        }

        .template-container .section-wrapper {
          transition: opacity 0.5s ease, transform 0.5s ease;
        }

        ${activeLayout?.structure?.gridSystem === 'full-screen' ? `
          .template-container .section-wrapper {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        ` : ''}

        ${activeLayout?.structure?.gridSystem === 'masonry' ? `
          .masonry-grid {
            column-count: 1;
            column-gap: 1rem;
          }

          @media (min-width: 768px) {
            .masonry-grid {
              column-count: 2;
            }
          }

          @media (min-width: 1024px) {
            .masonry-grid {
              column-count: 3;
            }
          }

          .masonry-grid .section-wrapper {
            break-inside: avoid;
            margin-bottom: 1rem;
          }
        ` : ''}

        ${activeLayout?.structure?.gridSystem === 'tabs' ? `
          .tabs-layout {
            display: flex;
            flex-direction: column;
          }

          .tabs-layout .tabs-container {
            display: flex;
            overflow-x: auto;
            border-bottom: 1px solid #e5e7eb;
            margin-bottom: 1rem;
          }

          .tabs-layout .tab {
            padding: 0.75rem 1rem;
            cursor: pointer;
            font-weight: 500;
            border-bottom: 2px solid transparent;
          }

          .tabs-layout .tab.active {
            border-bottom-color: var(--color-primary);
            color: var(--color-primary);
          }

          .tabs-layout .tab-content {
            display: none;
          }

          .tabs-layout .tab-content.active {
            display: block;
          }
        ` : ''}
      `}} />

      {/* Custom CSS (if provided in portfolio data) */}
      {portfolio.content?.customCss && (
        <style dangerouslySetInnerHTML={{ __html: portfolio.content.customCss }} />
      )}

      {/* Render the template with the selected layout */}
      {renderLayout()}
    </div>
  );
};

export default TemplateRenderer;

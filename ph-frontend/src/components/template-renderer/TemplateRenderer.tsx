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
} from './sections/index.tsx';

// Map of section types to their component implementations
const SECTION_COMPONENTS: Record<string, React.ComponentType<any>> = {
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

  // Determine which sections to render based on template layout, portfolio config, or custom order
  const activeLayoutId = portfolio?.activeLayout || (template?.layouts?.[0]?.id || 'default');
  const activeLayout = template?.layouts?.find((l: any) => l.id === activeLayoutId) || template?.layouts?.[0];
  const defaultSections = activeLayout?.structure?.sections ||
    template?.defaultStructure?.layout?.sections || [];
  const sectionsToRender = sectionOrder.length > 0 ? sectionOrder : defaultSections;

  // For debugging - log the template and portfolio data
  useEffect(() => {
    if (isClient && template && portfolio) {
      console.log('Template data:', {
        id: template._id,
        name: template.name,
        sections: template.defaultStructure?.layout?.sections,
        sectionDefinitions: template.sectionDefinitions,
        layouts: template.layouts,
        animations: template.animations,
        sectionVariants: template.sectionVariants,
        stylePresets: template.stylePresets
      });

      console.log('Portfolio data:', {
        id: portfolio._id,
        title: portfolio.title,
        templateId: portfolio.templateId?._id,
        sectionOrder,
        activeLayout: portfolio.activeLayout,
        content: portfolio.content ? Object.keys(portfolio.content) : 'No content'
      });

      // Detailed debug of sections to render
      console.log('Sections to render:', {
        defaultSections: template.defaultStructure?.layout?.sections || [],
        providedSectionOrder: sectionOrder,
        finalSectionsToRender: sectionsToRender,
        availableComponents: Object.keys(SECTION_COMPONENTS)
      });

      // Debug each section's content
      if (portfolio.content) {
        console.log('Section content details:');
        Object.keys(portfolio.content).forEach((section) => {
          console.log(`- ${section}:`, portfolio.content[section]);
        });
      } else {
        console.log('No content data in portfolio!');
      }
    }
  }, [isClient, template, portfolio, sectionOrder, sectionsToRender]);

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

  // Get active theme options
  const activeColorSchemeId = portfolio.activeColorScheme || 'default';
  const activeFontPairingId = portfolio.activeFontPairing || 'modern';

  const colorScheme = template.themeOptions?.colorSchemes?.find(
    (c: any) => c.id === activeColorSchemeId
  ) || template.themeOptions?.colorSchemes?.[0];

  const fontPairing = template.themeOptions?.fontPairings?.find(
    (f: any) => f.id === activeFontPairingId
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
    borderRadius: `var(--style-borderRadius, '0.5rem')`,
    boxShadow: `var(--style-boxShadow, 'none')`,
  };

  // Helper to get section content from portfolio data or template defaults
  const getSectionContent = (sectionType: string) => {
    // First try to get from portfolio content
    let portfolioContent = null;

    if (portfolio.content) {
      // If content is an object with properties
      if (typeof portfolio.content === 'object' && portfolio.content !== null) {
        // First check if the section exists in the content
        if (sectionType in portfolio.content) {
          portfolioContent = portfolio.content[sectionType];

          // Log content discovery
          if (portfolioContent) {
            console.log(`Found content for section ${sectionType}:`, portfolioContent);

            // CHANGE: Always accept any valid object as content, even if empty
            // This allows sections with empty arrays (like projects, skills, etc.) to still display
            if (typeof portfolioContent === 'object') {
              return portfolioContent;
            }
          } else {
            console.log(`Empty content for section ${sectionType}, will use defaults`);
          }
        }
      }
    }

    // If not found or empty, try to get from template section definitions
    let templateDefault = null;

    if (template.sectionDefinitions && sectionType in template.sectionDefinitions) {
      templateDefault = template.sectionDefinitions[sectionType].defaultData;

      if (templateDefault) {
        console.log(`Using template default for section ${sectionType}:`, templateDefault);
        return templateDefault;
      }
    }

    // Fall back to a generic default based on section type
    const fallbackContent = getFallbackContent(sectionType);
    console.log(`Using fallback content for section ${sectionType}:`, fallbackContent);
    return fallbackContent;
  };

  // Generate fallback content for sections when no data is available
  const getFallbackContent = (sectionType: string) => {
    const defaults: Record<string, any> = {
      // Common sections
      'header': {
        title: portfolio.title || 'My Portfolio',
        subtitle: portfolio.subtitle || 'Welcome to my portfolio'
      },
      'about': {
        title: 'About Me',
        bio: 'This section contains information about me.'
      },
      'contact': {
        title: 'Contact Me',
        email: 'example@example.com'
      },
      'projects': {
        title: 'My Projects',
        items: []
      },
      'skills': {
        title: 'My Skills',
        skills: []
      },
      'experience': {
        title: 'My Experience',
        items: []
      },
      'education': {
        title: 'My Education',
        items: []
      },
      'gallery': {
        title: 'My Gallery',
        images: []
      }
    };

    return defaults[sectionType] || { title: sectionType, empty: true };
  };

  // Get animation style for a section
  const getAnimationStyle = (sectionType: string) => {
    // Force all sections to be visible initially on published portfolios
    if (!editable) {
      return {
        opacity: 1,
        transform: 'none'
      };
    }

    // Check if animations are explicitly disabled in the portfolio
    if ((typeof portfolio.animationsEnabled === 'boolean' && !portfolio.animationsEnabled) || !animation || !template.animations) {
      return {
        opacity: 1,
        transform: 'none'
      };
    }

    const defaultAnimation = template.animations.fadeIn;

    // Determine which animation to use (could be customized per section in the future)
    const animationType = sectionType === 'header' ? 'fadeIn' :
                          sectionType === 'about' ? 'slideUp' :
                          sectionType === 'skills' || sectionType === 'projects' ? 'slideRight' :
                          'fadeIn';

    const animationConfig = template.animations[animationType] || defaultAnimation;

    // Force all sections to be in the animated list when not editing
    const isAnimated = !editable || animatedSections.includes(sectionType);

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
    // Initialize with the original content
    let enhancedContent = { ...content };

    // Add some basic defaults if they're missing
    if (sectionType === 'header' && !enhancedContent.title) {
      enhancedContent.title = portfolio.title || 'My Portfolio';
    }

    if (sectionType === 'about' && !enhancedContent.bio) {
      enhancedContent.bio = 'Welcome to my portfolio';
    }

    // Get all variants for this section type if available
    const allVariants = template.sectionVariants?.[sectionType] || [];

    // See if we need to apply a specific variant
    if (sectionVariants[sectionType] && allVariants.length > 0) {
      // Look for the exact variant ID match
      const selectedVariant = allVariants.find((v: any) => v.id === sectionVariants[sectionType]);

      if (selectedVariant && selectedVariant.configuration) {
        console.log(`Applying variant "${sectionVariants[sectionType]}" to ${sectionType} section`);
        // Merge the variant configuration with the existing content
        enhancedContent = { ...enhancedContent, ...selectedVariant.configuration };
      } else {
        console.log(`Requested variant "${sectionVariants[sectionType]}" not found for ${sectionType} section`);
      }
    } else {
      // If no specific variant is selected, but there are variants available,
      // apply the first one as default for consistency
      if (allVariants.length > 0 && allVariants[0].configuration) {
        console.log(`Applying default variant to ${sectionType} section`);
        enhancedContent = { ...enhancedContent, ...allVariants[0].configuration };
      } else {
        // Just add a default variant name if none is specified
        if (sectionType === 'header' && !enhancedContent.variant) {
          enhancedContent.variant = 'centered';
        } else if (sectionType === 'about' && !enhancedContent.variant) {
          enhancedContent.variant = 'standard';
        } else if (sectionType === 'projects' && !enhancedContent.variant) {
          enhancedContent.variant = 'grid';
        } else if (sectionType === 'skills' && !enhancedContent.variant) {
          enhancedContent.variant = 'categories';
        }
      }
    }

    return enhancedContent;
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
    const activeLayoutId = portfolio?.activeLayout || (template?.layouts?.[0]?.id || 'default');
    const activeLayout = template?.layouts?.find((l: any) => l.id === activeLayoutId) || template?.layouts?.[0];

    console.log("Using activeLayoutId:", activeLayoutId);
    console.log("Selected layout:", activeLayout?.name || "Default Layout");

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

    // Debug which sections will be rendered
    console.log('Rendering sections:', sectionsToRender);

    // Make sure we have at least the required sections
    if (sectionsToRender.length === 0) {
      console.error('No sections to render!');
      return (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Portfolio Configuration Error</h2>
          <p className="text-muted-foreground mb-4">
            No sections found to render. Please check the template configuration.
          </p>
        </div>
      );
    }

    return (
      <div className={gridClass} style={templateStyle}>
        {sectionsToRender.map((sectionType: string, index: number) => {
          // Log which section is being rendered
          console.log(`Rendering section ${index+1}/${sectionsToRender.length}: ${sectionType}`);

          // Get base content for the section
          const sectionContent = getSectionContent(sectionType);
          console.log(`Section ${sectionType} content type:`, typeof sectionContent, sectionContent ? Object.keys(sectionContent).length : 0);

          // Apply any selected variant configuration
          const variantContent = getSectionVariant(sectionType, sectionContent);

          // Get animation style for the section
          const animationStyle = getAnimationStyle(sectionType);

          // Special handling for full-screen sections
          const isFullScreen = activeLayout?.structure?.gridSystem === 'full-screen';
          const fullScreenClass = isFullScreen ? 'min-h-screen flex items-center justify-center' : '';

          // Verify the section component actually exists
          const SectionComponent = SECTION_COMPONENTS[sectionType];
          if (!SectionComponent) {
            console.warn(`No component found for section type: ${sectionType}`);
          }

          return (
            <div
              key={sectionType}
              className={`section-wrapper ${fullScreenClass}`}
              id={`section-${sectionType}`}
              style={animationStyle}
            >
              {(() => {
                try {
                  // Ensure section component always exists
                  const SectionComponent = SECTION_COMPONENTS[sectionType] ||
                    ((props: any) => <FallbackSection sectionType={sectionType} data={props.data} />);

                  // Log details about the section content
                  console.log(`Rendering ${sectionType} section with data:`, {
                    hasContent: !!variantContent,
                    contentType: typeof variantContent,
                    contentKeys: variantContent ? Object.keys(variantContent) : [],
                    isArray: Array.isArray(variantContent),
                  });

                  return (
                    <SectionComponent
                      key={sectionType}
                      data={variantContent}
                      template={template}
                      editable={editable}
                      onUpdate={editable ? (data: any) => onSectionUpdate?.(sectionType, data) : undefined}
                      stylePreset={activeStylePreset}
                    />
                  );
                } catch (error) {
                  console.error(`Error rendering section ${sectionType}:`, error);
                  return (
                    <div className="py-8 px-4 bg-red-50 border border-red-200 rounded-md">
                      <h3 className="text-lg font-medium text-red-800">Error rendering {sectionType} section</h3>
                      <p className="text-sm text-red-600 mt-2">
                        There was a problem displaying this section. Please check the console for more details.
                      </p>
                      {process.env.NODE_ENV === 'development' && (
                        <pre className="mt-4 p-2 bg-white border text-xs overflow-auto">
                          {JSON.stringify(variantContent, null, 2)}
                        </pre>
                      )}
                    </div>
                  );
                }
              })()}
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

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
  sectionOrder?: string[]; // New prop for custom section order
}

const TemplateRenderer: React.FC<TemplateRendererProps> = ({
  template,
  portfolio,
  editable = false,
  onSectionUpdate,
  customColors,
  sectionOrder = []
}) => {
  const [isClient, setIsClient] = useState(false);

  // For debugging - log the template and portfolio data
  useEffect(() => {
    if (isClient && template && portfolio) {
      console.log('Template data:', {
        sections: template.defaultStructure?.layout?.sections,
        sectionDefinitions: template.sectionDefinitions,
        layouts: template.layouts
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

    return variables;
  };

  // Create inline style with CSS variables
  const templateStyle = {
    ...getCssVariables(),
    // Add any other dynamic styles
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
      : 'flex flex-col gap-8';

    return (
      <div className={gridClass} style={templateStyle}>
        {sectionsToRender.map((sectionType: string) => {
          // Get the component for this section type, or use fallback
          const SectionComponent = SECTION_COMPONENTS[sectionType] ||
            ((props: any) => <FallbackSection sectionType={sectionType} data={props.data} />);

          const sectionContent = getSectionContent(sectionType);

          return (
            <div key={sectionType} className="section-wrapper" id={`section-${sectionType}`}>
              <SectionComponent
                key={sectionType}
                data={sectionContent}
                template={template}
                editable={editable}
                onUpdate={editable ? (data) => onSectionUpdate?.(sectionType, data) : undefined}
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="template-container">
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

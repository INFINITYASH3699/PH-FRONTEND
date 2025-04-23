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
  'work': WorkSection,
  'clients': ClientsSection,
  'testimonials': TestimonialsSection,

  // Photographer sections
  'galleries': GallerySection,
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

  // Helper to get section content from portfolio data
  const getSectionContent = (sectionType: string) => {
    return portfolio.content?.[sectionType] ||
      template.sectionDefinitions?.[sectionType]?.defaultData || {};
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
          const SectionComponent = SECTION_COMPONENTS[sectionType];

          if (!SectionComponent) {
            console.warn(`No component found for section type: ${sectionType}`);
            return null;
          }

          const sectionContent = getSectionContent(sectionType);

          return (
            <SectionComponent
              key={sectionType}
              data={sectionContent}
              template={template}
              editable={editable}
              onUpdate={editable ? (data) => onSectionUpdate?.(sectionType, data) : undefined}
            />
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

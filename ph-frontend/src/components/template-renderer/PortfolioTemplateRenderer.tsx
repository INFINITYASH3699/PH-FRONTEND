import React, { useEffect, useState } from "react";
import TemplateRenderer from "./TemplateRenderer";

interface PortfolioTemplateRendererProps {
  portfolio: any;
  template: any;
}

/**
 * Specialized component for rendering portfolios with the appropriate template configurations
 * based on the template's category and characteristics.
 */
const PortfolioTemplateRenderer: React.FC<PortfolioTemplateRendererProps> = ({
  portfolio,
  template,
}) => {
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
        activeLayout: portfolio.activeLayout || "default",
        defaultSections: template.defaultStructure?.layout?.sections || [],
        sectionDefinitions: template.sectionDefinitions
          ? Object.keys(template.sectionDefinitions)
          : [],
        sectionVariants: portfolio.sectionVariants || {},
        animationsEnabled:
          typeof portfolio.animationsEnabled === "boolean"
            ? portfolio.animationsEnabled
            : true,
        stylePreset: portfolio.stylePreset || "modern",
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
      header: {
        title: portfolio.title || "My Portfolio",
        subtitle: portfolio.subtitle || "Welcome to my portfolio",
      },
      about: {
        title: "About Me",
        bio: "This section contains information about me.",
      },
      projects: { title: "My Projects", items: [] },
      skills: { title: "My Skills", categories: [] },
      experience: { title: "My Experience", items: [] },
      education: { title: "My Education", items: [] },
      contact: { title: "Contact Me", email: "" },
      gallery: { title: "My Gallery", images: [] },
    };

    // Initialize sections that don't have content
    sections.forEach((section) => {
      if (!portfolio.content[section]) {
        // Create completely new section with default structure
        portfolio.content[section] = sectionDefaults[section] || {
          title: section,
        };
        console.log(`Created default structure for section: ${section}`);
      } else if (Object.keys(portfolio.content[section]).length === 0) {
        // If the section exists but is an empty object, provide default structure
        portfolio.content[section] = sectionDefaults[section] || {
          title: section,
        };
        console.log(`Applied default structure to empty section: ${section}`);
      } else {
        console.log(
          `Section ${section} already has content:`,
          portfolio.content[section]
        );
      }
    });

    return portfolio;
  };

  // Determine the appropriate style preset based on template category and portfolio settings
  const getStylePreset = () => {
    // First check if portfolio has a specific style preset set
    if (portfolio.stylePreset) {
      return portfolio.stylePreset;
    }

    // Fall back to category-based presets
    switch (template.category) {
      case "designer":
        return "creative";
      case "photographer":
        return "elegant";
      case "developer":
      default:
        return "modern";
    }
  };

  // Determine color scheme based on template or portfolio settings
  const getColorScheme = () => {
    // Use portfolio's selected color scheme if available
    if (portfolio.activeColorScheme) {
      // Find the matching color scheme in the template
      const selectedScheme = template.themeOptions?.colorSchemes?.find(
        (c: any) => c.id === portfolio.activeColorScheme
      );
      if (selectedScheme?.colors) {
        return selectedScheme.colors;
      }
    }

    // Otherwise use the default color scheme from the template
    if (template.themeOptions?.colorSchemes?.length > 0) {
      return template.themeOptions.colorSchemes[0].colors;
    }

    return template.defaultStructure?.layout?.defaultColors || null;
  };

  // Get the appropriate layout based on portfolio's activeLayout setting
  const getLayout = () => {
    // Use portfolio's layout if set
    if (portfolio.activeLayout && template.layouts) {
      const layout = template.layouts.find(
        (l) => l.id === portfolio.activeLayout
      );
      if (layout) return layout;
    }

    // Otherwise use the first layout
    return template.layouts?.[0] || null;
  };

  // Get section order based on template and selected layout
  const getSectionOrder = () => {
    // First check if portfolio has a specific section order set
    if (portfolio.sectionOrder && portfolio.sectionOrder.length > 0) {
      console.log(
        "Using portfolio's own section order:",
        portfolio.sectionOrder
      );
      return portfolio.sectionOrder;
    }

    // Otherwise use the layout's section order based on portfolio's activeLayout value
    const activeLayoutId = portfolio.activeLayout || 'default';
    const layout = template.layouts?.find((l: any) => l.id === activeLayoutId);

    if (layout?.structure?.sections) {
      console.log("Using layout's section order:", layout.structure.sections);
      return layout.structure.sections;
    }

    // If no layout found, use the default sections from template
    const defaultSections = template.defaultStructure?.layout?.sections;

    // Fallback to a set of common sections if nothing is defined
    if (!defaultSections || defaultSections.length === 0) {
      const fallbackSections = [
        "header",
        "about",
        "projects",
        "skills",
        "experience",
        "education",
        "contact",
      ];
      console.log("Using fallback section order:", fallbackSections);
      return fallbackSections;
    }

    console.log("Using template's default section order:", defaultSections);
    return defaultSections;
  };

  // Get the appropriate section variants based on template category and portfolio settings
  const getSectionVariants = () => {
    // Start with portfolio's custom section variants if available
    const variants: Record<string, string> = portfolio.sectionVariants
      ? { ...portfolio.sectionVariants }
      : {};

    // Only set default variants for sections that don't have custom variants set

    // Set default variants based on template category
    switch (template.category) {
      case "designer":
        if (!variants.about) variants.about = "with-image";
        if (!variants.projects) variants.projects = "grid";
        if (!variants.header) variants.header = "split";
        break;

      case "photographer":
        if (!variants.about) variants.about = "minimal";
        if (!variants.header) variants.header = "hero";
        if (!variants.gallery) variants.gallery = "masonry";
        break;

      case "developer":
      default:
        if (!variants.about) variants.about = "with-highlights";
        if (!variants.projects) variants.projects = "grid";
        if (!variants.skills) variants.skills = "categories";
        if (!variants.header) variants.header = "centered";
        break;
    }

    console.log("Applied section variants:", variants);
    return variants;
  };

  // Set proper animation based on template and portfolio settings
  const getAnimation = () => {
    // If animations are explicitly set in the portfolio, use that setting
    if (typeof portfolio.animationsEnabled === "boolean") {
      return portfolio.animationsEnabled;
    }

    // Otherwise default to true
    return true;
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

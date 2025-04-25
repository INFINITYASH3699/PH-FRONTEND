"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Paintbrush, Sparkles, Layout, Layers, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import apiClient from "@/lib/apiClient";

interface VariationExplorerProps {
  templateId: string;
  template?: any;
  activeSection?: string | null;
  selectedSectionVariants?: Record<string, string>;
  onSectionVariantUpdate?: (sectionId: string, variantId: string) => void;
  selectedStylePreset?: string;
  onStylePresetUpdate?: (presetId: string) => void;
  animationsEnabled?: boolean;
  onAnimationsToggle?: (enabled: boolean) => void;
  onUpdateLayout?: (layoutId: string) => void;
  activeLayoutId?: string;
}

export default function VariationExplorer({
  templateId,
  template: propTemplate,
  activeSection = null,
  selectedSectionVariants = {},
  onSectionVariantUpdate = () => {},
  selectedStylePreset = "modern",
  onStylePresetUpdate = () => {},
  animationsEnabled = true,
  onAnimationsToggle = () => {},
  onUpdateLayout = () => {},
  activeLayoutId = "default",
}: VariationExplorerProps) {
  const [selectedTab, setSelectedTab] = useState<string>(
    activeSection ? "section" : "layout"
  );
  const [template, setTemplate] = useState<any>(propTemplate || null);
  const [loading, setLoading] = useState<boolean>(!propTemplate);

  // Fetch template data if not provided as a prop
  useEffect(() => {
    const fetchTemplate = async () => {
      if (propTemplate) {
        setTemplate(propTemplate);
        return;
      }

      setLoading(true);
      try {
        const response = await apiClient.request(`/templates/${templateId}`);
        if (response.success && response.template) {
          setTemplate(response.template);
        }
      } catch (error) {
        console.error("Error fetching template data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [templateId, propTemplate]);

  // If template is loading or not available, show a loading state
  if (loading || !template) {
    return (
      <div className="p-4 bg-white rounded-lg border shadow-sm">
        <h2 className="text-lg font-semibold mb-4">
          Style & Layout Variations
        </h2>
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  // Get variants for the active section
  const getSectionVariants = () => {
    if (!activeSection || !template.sectionVariants) return [];
    return template.sectionVariants[activeSection] || [];
  };

  const sectionVariants = getSectionVariants();
  const stylePresets = template.stylePresets || {};
  const animations = template.animations || {};
  const layouts = template.layouts || [];

  return (
    <div className="p-4 bg-white rounded-lg border shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Style & Layout Variations</h2>

      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="section" disabled={!activeSection}>
            <div className="flex flex-col items-center gap-1">
              <Layers className="h-4 w-4" />
              <span className="text-xs">Section</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="layout">
            <div className="flex flex-col items-center gap-1">
              <Layout className="h-4 w-4" />
              <span className="text-xs">Layout</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="style">
            <div className="flex flex-col items-center gap-1">
              <Paintbrush className="h-4 w-4" />
              <span className="text-xs">Style</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="animation">
            <div className="flex flex-col items-center gap-1">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs">Animation</span>
            </div>
          </TabsTrigger>
        </TabsList>

        {/* Section Variants */}
        <TabsContent value="section">
          {activeSection ? (
            <>
              <h3 className="text-sm font-medium mb-3 capitalize">
                {activeSection} Section Variants
              </h3>

              {sectionVariants.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sectionVariants.map((variant: any) => (
                    <Card
                      key={variant.id}
                      className={`overflow-hidden cursor-pointer transition-all hover:border-primary ${
                        selectedSectionVariants[activeSection] === variant.id
                          ? "border-primary ring-1 ring-primary"
                          : ""
                      }`}
                      onClick={() =>
                        onSectionVariantUpdate(activeSection, variant.id)
                      }
                    >
                      <div className="p-3 flex justify-between items-start bg-gray-50 border-b">
                        <div>
                          <h4 className="font-medium">{variant.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {variant.description}
                          </p>
                        </div>
                        {selectedSectionVariants[activeSection] ===
                          variant.id && (
                          <Badge className="bg-primary text-white">
                            <Check className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
                          <span className="text-xs text-gray-500">
                            {renderVariantPreview(activeSection, variant)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  No variants available for this section.
                </div>
              )}
            </>
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              Select a section to see available variants.
            </div>
          )}
        </TabsContent>

        {/* Layout Variants */}
        <TabsContent value="layout">
          <h3 className="text-sm font-medium mb-3">Layout Options</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {layouts.length > 0 ? (
              layouts.map((layout: any) => (
                <Card
                  key={layout.id}
                  className={`overflow-hidden cursor-pointer transition-all hover:border-primary ${
                    activeLayoutId === layout.id
                      ? "border-primary ring-1 ring-primary"
                      : ""
                  }`}
                  onClick={() => onUpdateLayout(layout.id)}
                >
                  <div className="p-3 flex justify-between items-start bg-gray-50 border-b">
                    <div>
                      <h4 className="font-medium">{layout.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {layout.structure?.gridSystem}
                      </p>
                    </div>
                    {activeLayoutId === layout.id && (
                      <Badge className="bg-primary text-white">
                        <Check className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
                      {renderLayoutPreview(layout)}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center p-8 text-muted-foreground">
                No layout options available for this template.
              </div>
            )}
          </div>
        </TabsContent>

        {/* Style Presets */}
        <TabsContent value="style">
          <h3 className="text-sm font-medium mb-3">Style Presets</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.keys(stylePresets).length > 0 ? (
              Object.entries(stylePresets).map(
                ([id, preset]: [string, any]) => (
                  <Card
                    key={id}
                    className={`overflow-hidden cursor-pointer transition-all hover:border-primary ${
                      selectedStylePreset === id
                        ? "border-primary ring-1 ring-primary"
                        : ""
                    }`}
                    onClick={() => onStylePresetUpdate(id)}
                  >
                    <div className="p-3 flex justify-between items-start bg-gray-50 border-b">
                      <div>
                        <h4 className="font-medium">{preset.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {preset.description}
                        </p>
                      </div>
                      {selectedStylePreset === id && (
                        <Badge className="bg-primary text-white">
                          <Check className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <div
                        className="w-full p-4 border rounded-md"
                        style={{
                          borderRadius: preset.styles?.borderRadius || "0.5rem",
                          boxShadow: preset.styles?.boxShadow || "none",
                          borderWidth: preset.styles?.borderWidth || "1px",
                        }}
                      >
                        <div className="h-3 w-24 bg-primary rounded-full mb-2"></div>
                        <div className="h-2 w-full bg-gray-200 rounded-full mb-2"></div>
                        <div className="h-2 w-3/4 bg-gray-200 rounded-full"></div>
                      </div>
                    </CardContent>
                  </Card>
                )
              )
            ) : (
              <div className="text-center p-8 text-muted-foreground">
                No style presets available for this template.
              </div>
            )}
          </div>
        </TabsContent>

        {/* Animation Settings */}
        <TabsContent value="animation">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div>
                <h3 className="text-sm font-medium">Enable Animations</h3>
                <p className="text-xs text-muted-foreground">
                  Add smooth animations to sections
                </p>
              </div>
              <Switch
                checked={animationsEnabled}
                onCheckedChange={onAnimationsToggle}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            {animationsEnabled && (
              <>
                <h3 className="text-sm font-medium mt-4 mb-3">
                  Animation Effects
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.keys(animations).length > 0 ? (
                    Object.entries(animations).map(
                      ([id, animation]: [string, any]) => (
                        <Card key={id} className="overflow-hidden">
                          <div className="p-3 bg-gray-50 border-b">
                            <h4 className="font-medium">{animation.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {animation.type} animation · {animation.duration}
                              ms
                            </p>
                          </div>
                          <CardContent className="p-3">
                            <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
                              <div
                                className={`p-3 bg-white border rounded-md transition-all ${
                                  animation.type === "fade"
                                    ? "animate-pulse"
                                    : animation.type === "slide"
                                      ? "animate-bounce"
                                      : animation.type === "zoom"
                                        ? "animate-ping"
                                        : ""
                                }`}
                              >
                                <span className="text-xs">
                                  {animation.type}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    )
                  ) : (
                    <div className="text-center p-8 text-muted-foreground col-span-2">
                      No animation effects available for this template.
                    </div>
                  )}
                </div>

                <div className="p-3 mt-3 bg-muted/30 rounded-md">
                  <p className="text-xs text-muted-foreground">
                    <strong>How animations are applied:</strong> Each section
                    has a default animation that triggers when the section comes
                    into view. Header sections use fade-in, about sections use
                    slide-up, etc.
                  </p>
                </div>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper functions to render previews
function renderVariantPreview(sectionType: string, variant: any) {
  // Header section previews
  if (sectionType === "header") {
    if (variant.configuration?.variant === "hero") {
      return "Full-screen header with background image";
    }
    if (variant.configuration?.variant === "centered") {
      return "Centered header with profile image";
    }
    if (variant.configuration?.variant === "split") {
      return "Split layout with image and text";
    }
    if (variant.configuration?.variant === "minimal") {
      return "Minimal header with just text";
    }
  }

  // About section previews
  if (sectionType === "about") {
    if (variant.configuration?.variant === "standard") {
      return "Standard about section with bio";
    }
    if (variant.configuration?.variant === "with-image") {
      return "About section with image";
    }
    if (variant.configuration?.variant === "with-highlights") {
      return "About section with highlight cards";
    }
    if (variant.configuration?.variant === "minimal") {
      return "Minimal about section";
    }
  }

  // Projects section previews
  if (sectionType === "projects") {
    if (variant.configuration?.layout === "grid") {
      return "Grid layout of projects";
    }
    if (variant.configuration?.layout === "list") {
      return "List layout of projects";
    }
    if (variant.configuration?.layout === "featured") {
      return "Featured project with grid";
    }
  }

  // Skills section previews
  if (sectionType === "skills") {
    if (variant.configuration?.display === "bars") {
      return "Skills shown as progress bars";
    }
    if (variant.configuration?.display === "tags") {
      return "Skills shown as tags/badges";
    }
    if (variant.configuration?.display === "categories") {
      return "Skills grouped by category";
    }
  }

  return variant.description || "Section variant";
}

function renderLayoutPreview(layout: any) {
  if (layout.structure?.gridSystem === "sidebar-main") {
    return (
      <div className="w-full h-full p-2 flex gap-2">
        <div className="w-1/4 h-full bg-gray-200 rounded-md"></div>
        <div className="flex-1 bg-gray-200 rounded-md"></div>
      </div>
    );
  }

  if (layout.structure?.gridSystem === "sidebar-right") {
    return (
      <div className="w-full h-full p-2 flex gap-2">
        <div className="flex-1 bg-gray-200 rounded-md"></div>
        <div className="w-1/4 h-full bg-gray-200 rounded-md"></div>
      </div>
    );
  }

  if (layout.structure?.gridSystem === "full-screen") {
    return (
      <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
        <span className="text-xs text-gray-500">Full Screen Sections</span>
      </div>
    );
  }

  if (layout.structure?.gridSystem === "masonry") {
    return (
      <div className="w-full h-full p-2 grid grid-cols-3 gap-1">
        <div className="bg-gray-200 rounded-md h-1/2"></div>
        <div className="bg-gray-200 rounded-md h-3/4"></div>
        <div className="bg-gray-200 rounded-md h-2/3"></div>
        <div className="bg-gray-200 rounded-md h-3/4"></div>
        <div className="bg-gray-200 rounded-md h-1/2"></div>
        <div className="bg-gray-200 rounded-md h-2/3"></div>
      </div>
    );
  }

  if (layout.structure?.gridSystem === "tabs") {
    return (
      <div className="w-full h-full p-2 flex flex-col gap-1">
        <div className="h-4 flex gap-1">
          <div className="w-10 bg-primary/30 rounded-t-md"></div>
          <div className="w-10 bg-gray-200 rounded-t-md"></div>
          <div className="w-10 bg-gray-200 rounded-t-md"></div>
        </div>
        <div className="flex-1 bg-gray-200 rounded-b-md"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-2 flex flex-col gap-1">
      <div className="h-6 bg-gray-200 rounded-md"></div>
      <div className="h-12 bg-gray-200 rounded-md"></div>
      <div className="flex-1 grid grid-cols-3 gap-1">
        <div className="bg-gray-200 rounded-md"></div>
        <div className="bg-gray-200 rounded-md"></div>
        <div className="bg-gray-200 rounded-md"></div>
      </div>
    </div>
  );
}

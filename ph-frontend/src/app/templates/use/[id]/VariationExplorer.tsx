"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Paintbrush,
  Sparkles,
  Layout,
  Layers,
  Check,
  EyeIcon,
  RefreshCcw,
  Split,
  Maximize,
  Minimize,
  XIcon,
  Copy,
  ArrowLeftRight,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import apiClient from "@/lib/apiClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  // New props
  portfolioData?: any;
  onCompareChange?: (isComparing: boolean) => void;
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
  portfolioData,
  onCompareChange = () => {},
}: VariationExplorerProps) {
  const [selectedTab, setSelectedTab] = useState<string>(
    activeSection ? "section" : "layout"
  );
  const [template, setTemplate] = useState<any>(propTemplate || null);
  const [loading, setLoading] = useState<boolean>(!propTemplate);

  // New state variables for enhanced functionality
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [compareData, setCompareData] = useState<any>({
    before: null,
    after: null,
  });
  const [showPreview, setShowPreview] = useState<boolean>(false);

  // Toggle comparison mode
  const toggleCompareMode = () => {
    const newState = !isComparing;
    setIsComparing(newState);
    onCompareChange(newState);

    if (newState) {
      // Save current state when enabling compare mode
      setCompareData({
        before: {
          sectionVariants: { ...selectedSectionVariants },
          stylePreset: selectedStylePreset,
          animations: animationsEnabled,
          layoutId: activeLayoutId,
        },
        after: null,
      });
    } else {
      // Reset compare data when disabling compare mode
      setCompareData({ before: null, after: null });
      setShowPreview(false);
    }
  };

  // Save current state as "after" for comparison
  const saveComparisonState = () => {
    setCompareData((prev: any) => ({
      ...prev,
      after: {
        sectionVariants: { ...selectedSectionVariants },
        stylePreset: selectedStylePreset,
        animations: animationsEnabled,
        layoutId: activeLayoutId,
      },
    }));

    setShowPreview(true);
  };

  // Toggle expanded mode
  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev);
  };

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

  // Helper to get human-readable difference between before/after for compare
  const getCompareDiff = (before: any, after: any) => {
    if (!before || !after) return [];
    const diffs: Array<{ label: string; before: any; after: any }> = [];

    // Section variants
    if (before.sectionVariants && after.sectionVariants) {
      Object.keys({ ...before.sectionVariants, ...after.sectionVariants }).forEach((section) => {
        if (before.sectionVariants[section] !== after.sectionVariants[section]) {
          diffs.push({
            label: `Section "${section}" variant`,
            before: before.sectionVariants[section] || "None",
            after: after.sectionVariants[section] || "None",
          });
        }
      });
    }
    // Style preset
    if (before.stylePreset !== after.stylePreset) {
      diffs.push({
        label: "Style Preset",
        before: stylePresets[before.stylePreset]?.name || before.stylePreset,
        after: stylePresets[after.stylePreset]?.name || after.stylePreset,
      });
    }
    // Animations
    if (before.animations !== after.animations) {
      diffs.push({
        label: "Animations Enabled",
        before: before.animations ? "On" : "Off",
        after: after.animations ? "On" : "Off",
      });
    }
    // Layout
    if (before.layoutId !== after.layoutId) {
      diffs.push({
        label: "Layout",
        before:
          layouts.find((l: any) => l.id === before.layoutId)?.name ||
          before.layoutId,
        after:
          layouts.find((l: any) => l.id === after.layoutId)?.name ||
          after.layoutId,
      });
    }
    return diffs;
  };

  return (
    <div
      className={`p-4 bg-white rounded-lg border shadow-sm relative transition-all ${
        isExpanded ? "fixed inset-0 z-50 bg-white w-full h-full overflow-auto" : ""
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Style & Layout Variations</h2>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={toggleExpanded}
                  aria-label={isExpanded ? "Minimize" : "Expand"}
                >
                  {isExpanded ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isExpanded ? "Minimize panel" : "Expand panel"}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant={isComparing ? "default" : "outline"}
                  className={`h-8 w-8 ${isComparing ? "bg-primary text-white" : ""}`}
                  onClick={toggleCompareMode}
                  aria-label="Compare"
                >
                  <ArrowLeftRight className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isComparing ? "Exit compare mode" : "Start compare mode"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {isComparing && (
        <div className="mb-4 p-2 rounded-md border border-primary/40 bg-primary/5 flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            Compare Mode Enabled
          </span>
          <Button
            size="sm"
            variant="secondary"
            onClick={saveComparisonState}
            className="ml-2"
            disabled={!!compareData.after}
          >
            {compareData.after ? "Saved" : "Save current as 'After'"}
          </Button>
          {compareData.after && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowPreview(true)}
            >
              View Comparison
            </Button>
          )}
        </div>
      )}

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

      {/* Comparison Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Compare Before & After</DialogTitle>
          </DialogHeader>
          <div className="mb-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Before</Badge>
              <span className="text-xs text-muted-foreground">Initial settings when compare mode was enabled</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">After</Badge>
              <span className="text-xs text-muted-foreground">Your current settings</span>
            </div>
          </div>
          <ScrollArea className="max-h-64">
            <div className="space-y-3">
              {compareData.before && compareData.after ? (
                getCompareDiff(compareData.before, compareData.after).length > 0 ? (
                  getCompareDiff(compareData.before, compareData.after).map((diff, idx) => (
                    <div key={idx} className="flex flex-col gap-1 border-b pb-2">
                      <div className="text-sm font-medium">{diff.label}</div>
                      <div className="flex gap-2 items-center">
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                          {diff.before}
                        </span>
                        <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs px-2 py-1 bg-primary/10 rounded">
                          {diff.after}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground text-sm">
                    No changes detected between before and after.
                  </div>
                )
              ) : (
                <div className="text-center text-muted-foreground text-sm">
                  Please save an "after" state to compare.
                </div>
              )}
            </div>
          </ScrollArea>
          <Button
            onClick={() => setShowPreview(false)}
            className="w-full mt-4"
            variant="outline"
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
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

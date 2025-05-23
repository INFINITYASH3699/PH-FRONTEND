import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FetchProfileButton } from "@/components/ui/fetch-profile-button";
import ThemeSelector from "./ThemeSelector";
import LayoutSelector from "./LayoutSelector";
import HeaderEditor from "./HeaderEditor";
import AboutEditor from "./AboutEditor";
import SkillsEditor from "./SkillsEditor";
import ProjectsEditor from "./ProjectsEditor";
import ExperienceEditor from "./ExperienceEditor";
import EducationEditor from "./EducationEditor";
import ContactEditor from "./ContactEditor";
import GalleryEditor from "./GalleryEditor";
import WorkEditor from "./WorkEditor";
import ClientsEditor from "./ClientsEditor";
import TestimonialsEditor from "./TestimonialsEditor";
import ServicesEditor from "./ServicesEditor";
import PricingEditor from "./PricingEditor";
import NavbarEditor from "./NavbarEditor";
import FooterEditor from "./FooterEditor";
import AnimationsEditor from "./AnimationsEditor";
import ColorSchemeEditor from "./ColorSchemeEditor";
import SocialLinksEditor from "./SocialLinksEditor";
import CustomCSSEditor from "./CustomCSSEditor";
import SEOEditor from "./SEOEditor";
import { SaveDraftButton } from "@/components/ui/save-draft-button";
import { PreviewButton } from "@/components/ui/preview-button";
import { PublishButton } from "@/components/ui/publish-button";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import {
  GripVertical,
  X,
  Plus,
  PanelLeft,
  PanelLeftClose,
  ChevronRight,
} from "lucide-react";

interface EditorSidebarProps {
  template: any;
  portfolio: any;
  onUpdateSection: (sectionId: string, data: any) => void;
  onUpdateLayout: (layoutId: string) => void;
  onUpdateTheme: (colorSchemeId: string, fontPairingId: string) => void;
  onUpdateCustomCss: (css: string) => void;
  onSaveDraft: () => void;
  onPreview: () => void;
  onPublish: () => void;
  onFetchProfile?: () => Promise<void>;
  sectionOrder?: string[];
  onSectionReorder?: (newOrder: string[]) => void;
  draftSaving: boolean;
  draftSaved: boolean;
  previewLoading: boolean;
  publishLoading: boolean;
  expandedView?: boolean; // New prop to control if sidebar takes full width
}

export default function EditorSidebar({
  template,
  portfolio,
  onUpdateSection,
  onUpdateLayout,
  onUpdateTheme,
  onUpdateCustomCss,
  onSaveDraft,
  onPreview,
  onPublish,
  onFetchProfile,
  sectionOrder = [],
  onSectionReorder,
  draftSaving,
  draftSaved,
  previewLoading,
  publishLoading,
  expandedView = false,
}: EditorSidebarProps) {
  const [activeTab, setActiveTab] = useState("content");
  const [showSectionManager, setShowSectionManager] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false); // Add this to handle hydration issues

  useEffect(() => {
    // Mark as client-side rendered to avoid hydration mismatches
    setIsClient(true);

    const checkIfMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      setSidebarCollapsed(isMobileView);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Determine available sections in the following order:
  // 1. Active layout's sections
  // 2. template.defaultStructure.layout.sections
  // 3. fallback ['header', 'about']
  let availableSections: string[] = [];
  const activeLayoutId =
    portfolio.activeLayout || template?.layouts?.[0]?.id || "default";
  const activeLayout =
    template?.layouts?.find((l: any) => l.id === activeLayoutId) ||
    template?.layouts?.[0];

  if (template?.layouts && template.layouts.length > 0) {
    const layoutSections = activeLayout?.structure?.sections || [];
    if (layoutSections.length > 0) {
      availableSections = layoutSections;
    }
  }
  if (
    availableSections.length === 0 &&
    template?.defaultStructure?.layout?.sections
  ) {
    availableSections = template.defaultStructure.layout.sections;
  }
  if (availableSections.length === 0) {
    availableSections = ["header", "about"];
  }

  // Always ensure navbar and footer are included in available sections
  if (!availableSections.includes("navbar")) {
    availableSections.unshift("navbar"); // Add at beginning
  }
  if (!availableSections.includes("footer")) {
    availableSections.push("footer"); // Add at end
  }

  // Use section order from props if available, otherwise use layout sections
  let sectionsToShow =
    sectionOrder.length > 0 ? [...sectionOrder] : [...availableSections];

  // Ensure navbar and footer are in sectionsToShow
  if (!sectionsToShow.includes("navbar")) {
    sectionsToShow.unshift("navbar"); // Add at beginning
  }
  if (!sectionsToShow.includes("footer")) {
    sectionsToShow.push("footer"); // Add at end
  }

  // Get template-specific section definitions
  const templateSectionDefinitions = template?.sectionDefinitions || {};

  // Dynamically categorize sections based on template's own structure
  const categorizedSections = (() => {
    // Always place navbar, header and about in 'main' category
    const mainSections = sectionsToShow.filter(
      (section) =>
        section === "navbar" || section === "header" || section === "about"
    );

    // Get template category for proper categorization
    const sectionCategory = template?.category || "developer";

    // Determine content type sections based on template category
    const contentSections = sectionsToShow.filter((section) => {
      // Skip main sections and utility sections
      if (mainSections.includes(section)) return false;
      if (["socialLinks", "seo", "customCss", "footer"].includes(section))
        return false;

      // Create category-based groupings
      if (sectionCategory === "developer") {
        return [
          "projects",
          "skills",
          "experience",
          "education",
          "technologies",
        ].includes(section);
      } else if (sectionCategory === "designer") {
        return ["gallery", "work", "portfolio", "process"].includes(section);
      } else if (sectionCategory === "photographer") {
        return ["galleries", "categories"].includes(section);
      }

      // Default case for any other section that might be work-related
      return [
        "projects",
        "skills",
        "experience",
        "education",
        "work",
        "gallery",
      ].includes(section);
    });

    // Additional sections - anything else
    const additionalSections = sectionsToShow.filter(
      (section) =>
        !mainSections.includes(section) &&
        !contentSections.includes(section) &&
        !["socialLinks", "seo", "customCss", "footer"].includes(section)
    );

    // Put footer in its own category
    const footerSections = sectionsToShow.filter(
      (section) => section === "footer"
    );

    return {
      main: mainSections,
      content: contentSections,
      additional: additionalSections,
      footer: footerSections,
    };
  })();

  // Get section title from template definitions or use capitalized section ID
  const getSectionTitle = (sectionId: string) => {
    if (sectionId === "header") return "Header & Profile";
    if (sectionId === "navbar") return "Navigation Bar";
    if (sectionId === "footer") return "Footer";
    const defaultTitle = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
    const templateTitle =
      templateSectionDefinitions[sectionId]?.defaultData?.title;
    return templateTitle || defaultTitle;
  };

  // Get content grouping title based on template category
  const getContentGroupTitle = () => {
    const category = template?.category || "developer";
    switch (category) {
      case "designer":
        return "Design Work";
      case "photographer":
        return "Photography";
      default:
        return "Work & Experience";
    }
  };

  const getContentForSection = (sectionId: string) => {
    return portfolio?.content?.[sectionId] || {};
  };

  // Get all available sections from template, always including navbar and footer
  const getAllAvailableSections = () => {
    const sections = new Set<string>();

    if (template?.sectionDefinitions) {
      Object.keys(template.sectionDefinitions).forEach((section) =>
        sections.add(section)
      );
    }

    template?.layouts?.forEach((layout: any) => {
      if (layout.structure?.sections) {
        layout.structure.sections.forEach((section: string) =>
          sections.add(section)
        );
      }
    });

    // Always add navbar and footer
    sections.add("navbar");
    sections.add("footer");

    return Array.from(sections);
  };

  // Handle section reordering
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !onSectionReorder) return;

    const items = Array.from(sectionsToShow);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onSectionReorder(items);
  };

  // Handle removing a section, but prevent removing navbar/footer
  const handleRemoveSection = (sectionId: string) => {
    if (!onSectionReorder) return;
    if (sectionId === "navbar" || sectionId === "footer") return; // Prevent removing

    const newSections = sectionsToShow.filter((id) => id !== sectionId);
    onSectionReorder(newSections);
  };

  // Handle adding a section
  const handleAddSection = (sectionId: string) => {
    if (!onSectionReorder || sectionsToShow.includes(sectionId)) return;

    // Always keep navbar at start, footer at end
    let newSections = [...sectionsToShow];
    if (sectionId === "navbar") {
      newSections = ["navbar", ...newSections.filter((s) => s !== "navbar")];
    } else if (sectionId === "footer") {
      newSections = [...newSections.filter((s) => s !== "footer"), "footer"];
    } else {
      // Add before footer if present, else at end
      const footerIndex = newSections.indexOf("footer");
      if (footerIndex !== -1) {
        newSections.splice(footerIndex, 0, sectionId);
      } else {
        newSections.push(sectionId);
      }
    }
    onSectionReorder(newSections);
  };

  // Toggle sidebar visibility on mobile
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Fixed floating toggle button for mobile
  const SidebarToggle = () => (
    <Button
      variant="secondary"
      size="sm"
      className="fixed bottom-4 right-4 z-50 rounded-full h-12 w-12 shadow-lg md:hidden flex items-center justify-center"
      onClick={toggleSidebar}
    >
      {sidebarCollapsed ? (
        <PanelLeft className="h-5 w-5" />
      ) : (
        <PanelLeftClose className="h-5 w-5" />
      )}
    </Button>
  );

  // Render component for a specific section, with improved scrolling
  const renderSectionEditor = (section: string) => {
    switch (section) {
      case "header":
        return (
          <div className="overflow-y-auto max-h-[60vh]">
            <HeaderEditor
              data={getContentForSection("header")}
              onChange={(data) => onUpdateSection("header", data)}
            />
          </div>
        );
      case "about":
        return (
          <div className="overflow-y-auto max-h-[60vh]">
            <AboutEditor
              data={getContentForSection("about")}
              onChange={(data) => onUpdateSection("about", data)}
            />
          </div>
        );
      case "projects":
      case "categories":
        return (
          <div className="overflow-y-auto max-h-[60vh]">
            <ProjectsEditor
              data={getContentForSection(section)}
              onChange={(data) => onUpdateSection(section, data)}
            />
          </div>
        );
      case "skills":
        return (
          <div className="overflow-y-auto max-h-[60vh]">
            <SkillsEditor
              data={getContentForSection("skills")}
              onChange={(data) => onUpdateSection("skills", data)}
            />
          </div>
        );
      case "experience":
        return (
          <div className="overflow-y-auto max-h-[60vh]">
            <ExperienceEditor
              data={getContentForSection("experience")}
              onChange={(data) => onUpdateSection("experience", data)}
            />
          </div>
        );
      case "education":
        return (
          <div className="overflow-y-auto max-h-[60vh]">
            <EducationEditor
              data={getContentForSection("education")}
              onChange={(data) => onUpdateSection("education", data)}
            />
          </div>
        );
      case "gallery":
      case "galleries":
        return (
          <div className="overflow-y-auto max-h-[60vh]">
            <GalleryEditor
              data={getContentForSection(section)}
              onChange={(data) => onUpdateSection(section, data)}
            />
          </div>
        );
      case "contact":
        return (
          <div className="overflow-y-auto max-h-[60vh]">
            <ContactEditor
              data={getContentForSection("contact")}
              onChange={(data) => onUpdateSection("contact", data)}
            />
          </div>
        );
      case "services":
        return (
          <div className="overflow-y-auto max-h-[60vh]">
            <ServicesEditor
              data={getContentForSection("services")}
              onChange={(data) => onUpdateSection("services", data)}
            />
          </div>
        );
      case "pricing":
        return (
          <div className="overflow-y-auto max-h-[60vh]">
            <PricingEditor
              data={getContentForSection("pricing")}
              onChange={(data) => onUpdateSection("pricing", data)}
            />
          </div>
        );
      case "work":
        return (
          <div className="overflow-y-auto max-h-[60vh]">
            <WorkEditor
              data={getContentForSection("work")}
              onChange={(data) => onUpdateSection("work", data)}
            />
          </div>
        );
      case "clients":
        return (
          <div className="overflow-y-auto max-h-[60vh]">
            <ClientsEditor
              data={getContentForSection("clients")}
              onChange={(data) => onUpdateSection("clients", data)}
            />
          </div>
        );
      case "testimonials":
        return (
          <div className="overflow-y-auto max-h-[60vh]">
            <TestimonialsEditor
              data={getContentForSection("testimonials")}
              onChange={(data) => onUpdateSection("testimonials", data)}
            />
          </div>
        );
      case "navbar":
        return (
          <div className="overflow-y-auto max-h-[60vh]">
            <NavbarEditor
              data={getContentForSection("navbar")}
              onChange={(data) => onUpdateSection("navbar", data)}
            />
          </div>
        );
      case "footer":
        return (
          <div className="overflow-y-auto max-h-[60vh]">
            <FooterEditor
              data={getContentForSection("footer")}
              onChange={(data) => onUpdateSection("footer", data)}
            />
          </div>
        );
      case "animations":
        return (
          <div className="overflow-y-auto max-h-[60vh]">
            <AnimationsEditor
              data={getContentForSection("animations")}
              onChange={(data) => onUpdateSection("animations", data)}
            />
          </div>
        );
      case "colorScheme":
        return (
          <div className="overflow-y-auto max-h-[60vh]">
            <ColorSchemeEditor
              data={getContentForSection("colorScheme")}
              presets={template?.themeOptions?.colorSchemes || []}
              onChange={(data) => onUpdateSection("colorScheme", data)}
            />
          </div>
        );
      default:
        // For any section without a specific editor
        return (
          <div className="overflow-y-auto max-h-[60vh] p-4 bg-muted/30 rounded-md">
            <p className="text-sm text-muted-foreground mb-2">
              {getSectionTitle(section)} section editor
            </p>
            <textarea
              className="w-full p-2 border rounded-md min-h-[100px]"
              placeholder={`Edit your ${getSectionTitle(section)} content here`}
              value={JSON.stringify(getContentForSection(section), null, 2)}
              onChange={(e) => {
                try {
                  const data = JSON.parse(e.target.value);
                  onUpdateSection(section, data);
                } catch (error) {
                  // Handle invalid JSON
                }
              }}
            />
          </div>
        );
    }
  };

  // Updated sidebar width for the expanded view
  const sidebarWidth = expandedView ? "w-full" : "w-full md:w-96";

  // Calculate layout for cards in expanded view
  const cardLayout = expandedView
    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    : "space-y-6";

  // Only render children after client-side hydration to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading editor...
      </div>
    );
  }

  return (
    <>
      <SidebarToggle />

      <div
        className={`h-full flex flex-col border-l bg-card transition-all duration-300 ${
          sidebarCollapsed
            ? "w-0 -translate-x-full md:translate-x-0 md:w-0 opacity-0 md:opacity-100"
            : `${sidebarWidth} translate-x-0 opacity-100`
        } ${isMobile && !sidebarCollapsed ? "fixed inset-0 z-40" : ""}`}
        style={{
          maxWidth: sidebarCollapsed
            ? 0
            : isMobile
              ? "100%"
              : expandedView
                ? "100%"
                : "400px",
          height: "100vh",
        }}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {template?.name || "Template Editor"}
          </h2>
          <div className="flex items-center space-x-2">
            <SaveDraftButton
              onClick={onSaveDraft}
              loading={draftSaving}
              saved={draftSaved}
            />
            <PreviewButton onClick={onPreview} loading={previewLoading} />
            {isMobile && (
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleSidebar}
                className="ml-2 md:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="flex justify-between px-4 py-2 bg-muted/40">
            <TabsTrigger value="content" className="flex-1">
              Content
            </TabsTrigger>
            <TabsTrigger value="theme" className="flex-1">
              Theme
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex-1">
              Layout
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 overflow-y-auto min-h-0">
            <TabsContent value="content" className="m-0 p-4 h-full min-h-0">
              <div className={expandedView ? cardLayout : "space-y-6"}>
                {onFetchProfile && (
                  <div
                    className={
                      expandedView ? "md:col-span-2 lg:col-span-3" : ""
                    }
                  >
                    <FetchProfileButton
                      onFetch={onFetchProfile}
                      fetchText="Auto-fill with Your Profile Data"
                      fetchingText="Importing your data..."
                      className="w-full mb-4"
                    />
                  </div>
                )}

                <div
                  className={
                    expandedView ? "md:col-span-2 lg:col-span-3" : "mb-6"
                  }
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold">
                      Portfolio Sections
                    </h3>
                    <Button
                      onClick={() => setShowSectionManager(!showSectionManager)}
                      variant="outline"
                      size="sm"
                    >
                      {showSectionManager ? "Done" : "Manage Sections"}
                    </Button>
                  </div>

                  {showSectionManager && (
                    <div className="border rounded-md p-3 mb-4 bg-muted/20">
                      <h4 className="text-sm font-medium mb-2">
                        Drag to reorder sections
                      </h4>

                      <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable
                          droppableId="sections-list"
                          isDropDisabled={false}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={
                                expandedView
                                  ? "grid grid-cols-1 md:grid-cols-2 gap-2"
                                  : "space-y-2"
                              }
                            >
                              {sectionsToShow.map((sectionId, index) => (
                                <Draggable
                                  key={sectionId}
                                  draggableId={sectionId}
                                  index={index}
                                >
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-md border"
                                    >
                                      <div className="flex items-center">
                                        <GripVertical className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <span className="capitalize text-sm">
                                          {getSectionTitle(sectionId)}
                                        </span>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0"
                                        disabled={
                                          sectionId === "navbar" ||
                                          sectionId === "footer"
                                        }
                                        onClick={() =>
                                          handleRemoveSection(sectionId)
                                        }
                                      >
                                        <X
                                          className={`h-4 w-4 text-muted-foreground ${sectionId === "navbar" || sectionId === "footer" ? "opacity-30 cursor-not-allowed" : ""}`}
                                        />
                                      </Button>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>

                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">
                          Available sections to add
                        </h4>
                        <div
                          className={
                            expandedView
                              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2"
                              : "grid grid-cols-2 gap-2"
                          }
                        >
                          {getAllAvailableSections()
                            .filter(
                              (section) => !sectionsToShow.includes(section)
                            )
                            .map((section) => (
                              <Button
                                key={section}
                                variant="outline"
                                size="sm"
                                className="justify-start"
                                onClick={() => handleAddSection(section)}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                <span className="capitalize text-sm">
                                  {getSectionTitle(section)}
                                </span>
                              </Button>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {expandedView ? (
                  <>
                    {categorizedSections.main.map((section) => (
                      <div
                        key={section}
                        className="border rounded-md p-4 bg-white dark:bg-gray-800 shadow-sm"
                      >
                        <div
                          className="flex items-center justify-between mb-3 cursor-pointer"
                          onClick={() =>
                            setExpandedSection(
                              expandedSection === section ? null : section
                            )
                          }
                        >
                          <h3 className="font-medium capitalize">
                            {getSectionTitle(section)}
                          </h3>
                          <ChevronRight
                            className={`h-4 w-4 transition-transform ${expandedSection === section ? "rotate-90" : ""}`}
                          />
                        </div>
                        <div
                          className={
                            expandedSection === section ? "block" : "hidden"
                          }
                        >
                          {renderSectionEditor(section)}
                        </div>
                      </div>
                    ))}

                    {categorizedSections.content.length > 0 && (
                      <div className="border rounded-md p-4 bg-white dark:bg-gray-800 shadow-sm md:col-span-2 lg:col-span-3">
                        <div
                          className="flex items-center justify-between mb-3 cursor-pointer"
                          onClick={() =>
                            setExpandedSection(
                              expandedSection === "content-group"
                                ? null
                                : "content-group"
                            )
                          }
                        >
                          <h3 className="font-medium">
                            {getContentGroupTitle()}
                          </h3>
                          <ChevronRight
                            className={`h-4 w-4 transition-transform ${expandedSection === "content-group" ? "rotate-90" : ""}`}
                          />
                        </div>
                        <div
                          className={
                            expandedSection === "content-group"
                              ? "block"
                              : "hidden"
                          }
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {categorizedSections.content.map((section) => (
                              <div
                                key={section}
                                className="border rounded-md p-3 bg-muted/10"
                              >
                                <h4 className="font-medium capitalize mb-2">
                                  {getSectionTitle(section)}
                                </h4>
                                {renderSectionEditor(section)}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {categorizedSections.additional.map((section) => (
                      <div
                        key={section}
                        className="border rounded-md p-4 bg-white dark:bg-gray-800 shadow-sm"
                      >
                        <div
                          className="flex items-center justify-between mb-3 cursor-pointer"
                          onClick={() =>
                            setExpandedSection(
                              expandedSection === section ? null : section
                            )
                          }
                        >
                          <h3 className="font-medium capitalize">
                            {getSectionTitle(section)}
                          </h3>
                          <ChevronRight
                            className={`h-4 w-4 transition-transform ${expandedSection === section ? "rotate-90" : ""}`}
                          />
                        </div>
                        <div
                          className={
                            expandedSection === section ? "block" : "hidden"
                          }
                        >
                          {renderSectionEditor(section)}
                        </div>
                      </div>
                    ))}

                    <div className="border rounded-md p-4 bg-white dark:bg-gray-800 shadow-sm">
                      <div
                        className="flex items-center justify-between mb-3 cursor-pointer"
                        onClick={() =>
                          setExpandedSection(
                            expandedSection === "social" ? null : "social"
                          )
                        }
                      >
                        <h3 className="font-medium">Social Media</h3>
                        <ChevronRight
                          className={`h-4 w-4 transition-transform ${expandedSection === "social" ? "rotate-90" : ""}`}
                        />
                      </div>
                      <div
                        className={
                          expandedSection === "social" ? "block" : "hidden"
                        }
                      >
                        <div className="overflow-y-auto max-h-[60vh]">
                          <SocialLinksEditor
                            data={portfolio?.content?.socialLinks || {}}
                            onChange={(data) =>
                              onUpdateSection("socialLinks", data)
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-md p-4 bg-white dark:bg-gray-800 shadow-sm">
                      <div
                        className="flex items-center justify-between mb-3 cursor-pointer"
                        onClick={() =>
                          setExpandedSection(
                            expandedSection === "seo" ? null : "seo"
                          )
                        }
                      >
                        <h3 className="font-medium">SEO & Metadata</h3>
                        <ChevronRight
                          className={`h-4 w-4 transition-transform ${expandedSection === "seo" ? "rotate-90" : ""}`}
                        />
                      </div>
                      <div
                        className={
                          expandedSection === "seo" ? "block" : "hidden"
                        }
                      >
                        <div className="overflow-y-auto max-h-[60vh]">
                          <SEOEditor
                            data={getContentForSection("seo")}
                            onChange={(data) => onUpdateSection("seo", data)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Dedicated footer card */}
                    {categorizedSections.footer.length > 0 &&
                      categorizedSections.footer.map((section) => (
                        <div
                          key={section}
                          className="border rounded-md p-4 bg-white dark:bg-gray-800 shadow-sm"
                        >
                          <div
                            className="flex items-center justify-between mb-3 cursor-pointer"
                            onClick={() =>
                              setExpandedSection(
                                expandedSection === section ? null : section
                              )
                            }
                          >
                            <h3 className="font-medium capitalize">
                              {getSectionTitle(section)}
                            </h3>
                            <ChevronRight
                              className={`h-4 w-4 transition-transform ${expandedSection === section ? "rotate-90" : ""}`}
                            />
                          </div>
                          <div
                            className={
                              expandedSection === section ? "block" : "hidden"
                            }
                          >
                            {renderSectionEditor(section)}
                          </div>
                        </div>
                      ))}
                  </>
                ) : (
                  <Accordion type="multiple" className="w-full">
                    {categorizedSections.main.map((section) => (
                      <AccordionItem value={section} key={section}>
                        <AccordionTrigger className="capitalize text-sm py-2">
                          {getSectionTitle(section)}
                        </AccordionTrigger>
                        <AccordionContent>
                          {renderSectionEditor(section)}
                        </AccordionContent>
                      </AccordionItem>
                    ))}

                    {categorizedSections.content.length > 0 && (
                      <AccordionItem value="content-sections">
                        <AccordionTrigger className="text-sm py-2">
                          {getContentGroupTitle()}
                        </AccordionTrigger>
                        <AccordionContent>
                          {categorizedSections.content.map((section) => (
                            <div key={section} className="mb-6">
                              <h3 className="font-medium capitalize mb-2">
                                {getSectionTitle(section)}
                              </h3>
                              {renderSectionEditor(section)}
                            </div>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    )}

                    {categorizedSections.additional.map((section) => (
                      <AccordionItem value={section} key={section}>
                        <AccordionTrigger className="capitalize text-sm py-2">
                          {getSectionTitle(section)}
                        </AccordionTrigger>
                        <AccordionContent>
                          {renderSectionEditor(section)}
                        </AccordionContent>
                      </AccordionItem>
                    ))}

                    <AccordionItem value="social">
                      <AccordionTrigger className="text-sm py-2">
                        Social Media
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="overflow-y-auto max-h-[60vh]">
                          <SocialLinksEditor
                            data={portfolio?.content?.socialLinks || {}}
                            onChange={(data) =>
                              onUpdateSection("socialLinks", data)
                            }
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="seo">
                      <AccordionTrigger className="text-sm py-2">
                        SEO & Metadata
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="overflow-y-auto max-h-[60vh]">
                          <SEOEditor
                            data={getContentForSection("seo")}
                            onChange={(data) => onUpdateSection("seo", data)}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Dedicated footer accordion */}
                    {categorizedSections.footer.length > 0 &&
                      categorizedSections.footer.map((section) => (
                        <AccordionItem value={section} key={section}>
                          <AccordionTrigger className="capitalize text-sm py-2">
                            {getSectionTitle(section)}
                          </AccordionTrigger>
                          <AccordionContent>
                            {renderSectionEditor(section)}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                  </Accordion>
                )}
              </div>
            </TabsContent>

            <TabsContent value="theme" className="m-0 p-4 h-full">
              <div
                className={
                  expandedView
                    ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                    : "space-y-6"
                }
              >
                <div className="border rounded-md p-4 bg-white dark:bg-gray-800 shadow-sm">
                  <h3 className="font-medium mb-3">Colors & Fonts</h3>
                  <ThemeSelector
                    themeOptions={template?.themeOptions}
                    activeColorSchemeId={portfolio?.activeColorScheme}
                    activeFontPairingId={portfolio?.activeFontPairing}
                    onChange={onUpdateTheme}
                  />
                </div>

                <div className="border rounded-md p-4 bg-white dark:bg-gray-800 shadow-sm">
                  <h3 className="font-medium mb-3">Custom CSS</h3>
                  <CustomCSSEditor
                    css={portfolio?.content?.customCss || ""}
                    onChange={(css) => onUpdateCustomCss(css)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="layout" className="m-0 p-4 h-full">
              <div className="border rounded-md p-4 bg-white dark:bg-gray-800 shadow-sm">
                <h3 className="font-medium mb-3">Layout Options</h3>
                <LayoutSelector
                  layouts={template?.layouts || []}
                  activeLayoutId={
                    portfolio?.activeLayout || template?.layouts?.[0]?.id
                  }
                  onChange={onUpdateLayout}
                />
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="p-4 border-t bg-card mt-auto">
          <div className="flex gap-3">
            <SaveDraftButton
              onClick={onSaveDraft}
              loading={draftSaving}
              saved={draftSaved}
              variant="outline"
              className="flex-1"
            />
            <PublishButton
              onClick={onPublish}
              loading={publishLoading}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      {isMobile && !sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/20 z-30"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}

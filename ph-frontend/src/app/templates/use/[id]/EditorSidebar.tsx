import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FetchProfileButton } from '@/components/ui/fetch-profile-button';
import ThemeSelector from './ThemeSelector';
import LayoutSelector from './LayoutSelector';
import HeaderEditor from './HeaderEditor';
import AboutEditor from './AboutEditor';
import SkillsEditor from './SkillsEditor';
import ProjectsEditor from './ProjectsEditor';
import ExperienceEditor from './ExperienceEditor';
import EducationEditor from './EducationEditor';
import ContactEditor from './ContactEditor';
import GalleryEditor from './GalleryEditor';
import SocialLinksEditor from './SocialLinksEditor';
import CustomCSSEditor from './CustomCSSEditor';
import SEOEditor from './SEOEditor';
import { SaveDraftButton } from '@/components/ui/save-draft-button';
import { PreviewButton } from '@/components/ui/preview-button';
import { PublishButton } from '@/components/ui/publish-button';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { GripVertical, X, Plus, PanelLeft, PanelLeftClose, ChevronRight } from 'lucide-react';

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
  expandedView = false
}: EditorSidebarProps) {
  const [activeTab, setActiveTab] = useState('content');
  const [showSectionManager, setShowSectionManager] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    const checkIfMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      setSidebarCollapsed(isMobileView);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Determine which sections to show in the editor based on the active layout
  const activeLayoutId = portfolio.activeLayout || template?.layouts?.[0]?.id || 'default';
  const activeLayout = template?.layouts?.find((l: any) => l.id === activeLayoutId) || template?.layouts?.[0];
  const availableSections = activeLayout?.structure?.sections ||
    template?.defaultStructure?.layout?.sections || [];

  // Use section order from props if available, otherwise use layout sections
  const sectionsToShow = sectionOrder.length > 0 ? sectionOrder : availableSections;

  // Get template-specific section definitions
  const templateSectionDefinitions = template?.sectionDefinitions || {};

  // Dynamically categorize sections based on template's own structure
  const categorizedSections = (() => {
    // Always place header and about in 'main' category
    const mainSections = sectionsToShow.filter(section =>
      section === 'header' || section === 'about'
    );

    // Determine content type sections - these are the portfolio specific sections
    const contentSections = sectionsToShow.filter(section => {
      // Skip main sections and utility sections
      if (mainSections.includes(section)) return false;
      if (['socialLinks', 'seo', 'customCss'].includes(section)) return false;

      // Based on template categories
      const sectionCategory = template?.category || 'developer';

      // Create category-based groupings
      if (sectionCategory === 'developer') {
        return ['projects', 'skills', 'experience', 'education', 'technologies'].includes(section);
      } else if (sectionCategory === 'designer') {
        return ['gallery', 'work', 'portfolio', 'process'].includes(section);
      } else if (sectionCategory === 'photographer') {
        return ['galleries', 'categories'].includes(section);
      }

      // Default case
      return ['projects', 'skills', 'experience', 'education'].includes(section);
    });

    // Additional sections - anything else
    const additionalSections = sectionsToShow.filter(section =>
      !mainSections.includes(section) &&
      !contentSections.includes(section) &&
      !['socialLinks', 'seo', 'customCss'].includes(section)
    );

    return {
      main: mainSections,
      content: contentSections,
      additional: additionalSections
    };
  })();

  // Get section title from template definitions or use capitalized section ID
  const getSectionTitle = (sectionId: string) => {
    return templateSectionDefinitions[sectionId]?.defaultData?.title ||
      sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
  };

  // Get content grouping title based on template category
  const getContentGroupTitle = () => {
    const category = template?.category || 'developer';

    switch (category) {
      case 'designer':
        return 'Design Work';
      case 'photographer':
        return 'Photography';
      default:
        return 'Work & Experience';
    }
  };

  const getContentForSection = (sectionId: string) => {
    return portfolio?.content?.[sectionId] || {};
  };

  // Get all available sections from template
  const getAllAvailableSections = () => {
    const sections = new Set<string>();

    if (template?.sectionDefinitions) {
      Object.keys(template.sectionDefinitions).forEach(section => sections.add(section));
    }

    template?.layouts?.forEach((layout: any) => {
      if (layout.structure?.sections) {
        layout.structure.sections.forEach((section: string) => sections.add(section));
      }
    });

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

  // Handle removing a section
  const handleRemoveSection = (sectionId: string) => {
    if (!onSectionReorder) return;

    const newSections = sectionsToShow.filter(id => id !== sectionId);
    onSectionReorder(newSections);
  };

  // Handle adding a section
  const handleAddSection = (sectionId: string) => {
    if (!onSectionReorder || sectionsToShow.includes(sectionId)) return;

    const newSections = [...sectionsToShow, sectionId];
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
      {sidebarCollapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
    </Button>
  );

  // Render component for a specific section
  const renderSectionEditor = (section: string) => {
    switch (section) {
      case 'header':
        return (
          <HeaderEditor
            data={getContentForSection('header')}
            onChange={(data) => onUpdateSection('header', data)}
          />
        );
      case 'about':
        return (
          <AboutEditor
            data={getContentForSection('about')}
            onChange={(data) => onUpdateSection('about', data)}
          />
        );
      case 'projects':
      case 'categories':
        return (
          <ProjectsEditor
            data={getContentForSection(section)}
            onChange={(data) => onUpdateSection(section, data)}
          />
        );
      case 'skills':
        return (
          <SkillsEditor
            data={getContentForSection('skills')}
            onChange={(data) => onUpdateSection('skills', data)}
          />
        );
      case 'experience':
        return (
          <ExperienceEditor
            data={getContentForSection('experience')}
            onChange={(data) => onUpdateSection('experience', data)}
          />
        );
      case 'education':
        return (
          <EducationEditor
            data={getContentForSection('education')}
            onChange={(data) => onUpdateSection('education', data)}
          />
        );
      case 'gallery':
      case 'galleries':
        return (
          <GalleryEditor
            data={getContentForSection(section)}
            onChange={(data) => onUpdateSection(section, data)}
          />
        );
      case 'contact':
        return (
          <ContactEditor
            data={getContentForSection('contact')}
            onChange={(data) => onUpdateSection('contact', data)}
          />
        );
      case 'services':
      case 'pricing':
        return (
          <div className="p-4 bg-muted/30 rounded-md">
            <p className="text-sm text-muted-foreground mb-2">
              {section === 'services' ? 'Services section' : 'Pricing section'} editor
            </p>
            <textarea
              className="w-full p-2 border rounded-md min-h-[100px]"
              placeholder={`Edit your ${section} content here`}
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
      default:
        // For any section without a specific editor
        return (
          <div className="p-4 bg-muted/30 rounded-md">
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
  const sidebarWidth = expandedView
    ? 'w-full'
    : 'w-full md:w-96';

  // Calculate layout for cards in expanded view
  const cardLayout = expandedView
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
    : 'space-y-6';

  return (
    <>
      {/* Sidebar Toggle Button */}
      <SidebarToggle />

      <div
        className={`h-full flex flex-col border-l bg-card transition-all duration-300 ${
          sidebarCollapsed ? 'w-0 -translate-x-full md:translate-x-0 md:w-0 opacity-0 md:opacity-100' : `${sidebarWidth} translate-x-0 opacity-100`
        } ${isMobile && !sidebarCollapsed ? 'fixed inset-0 z-40' : ''}`}
        style={{ maxWidth: sidebarCollapsed ? 0 : isMobile ? '100%' : expandedView ? '100%' : '400px' }}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">{template?.name || 'Template Editor'}</h2>
          <div className="flex items-center space-x-2">
            <SaveDraftButton
              onClick={onSaveDraft}
              loading={draftSaving}
              saved={draftSaved}
            />
            <PreviewButton
              onClick={onPreview}
              loading={previewLoading}
            />
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

        {/* Tabs for Content, Theme, and Layout */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="flex justify-between px-4 py-2 bg-muted/40">
            <TabsTrigger value="content" className="flex-1">Content</TabsTrigger>
            <TabsTrigger value="theme" className="flex-1">Theme</TabsTrigger>
            <TabsTrigger value="layout" className="flex-1">Layout</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 overflow-y-auto">
            {/* Content Tab */}
            <TabsContent value="content" className="m-0 p-4 h-full">
              <div className={expandedView ? cardLayout : "space-y-6"}>
                {/* Profile Data Import Button */}
                {onFetchProfile && (
                  <div className={expandedView ? "md:col-span-2 lg:col-span-3" : ""}>
                    <FetchProfileButton
                      onFetch={onFetchProfile}
                      fetchText="Auto-fill with Your Profile Data"
                      fetchingText="Importing your data..."
                      className="w-full mb-4"
                    />
                  </div>
                )}

                {/* Section Manager */}
                <div className={expandedView ? "md:col-span-2 lg:col-span-3" : "mb-6"}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold">Portfolio Sections</h3>
                    <Button
                      onClick={() => setShowSectionManager(!showSectionManager)}
                      variant="outline"
                      size="sm"
                    >
                      {showSectionManager ? 'Done' : 'Manage Sections'}
                    </Button>
                  </div>

                  {showSectionManager && (
                    <div className="border rounded-md p-3 mb-4 bg-muted/20">
                      <h4 className="text-sm font-medium mb-2">Drag to reorder sections</h4>

                      <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="sections-list">
                          {(provided) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className={expandedView ? "grid grid-cols-1 md:grid-cols-2 gap-2" : "space-y-2"}
                            >
                              {sectionsToShow.map((sectionId, index) => (
                                <Draggable key={sectionId} draggableId={sectionId} index={index}>
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-md border"
                                    >
                                      <div className="flex items-center">
                                        <GripVertical className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <span className="capitalize text-sm">{getSectionTitle(sectionId)}</span>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0"
                                        onClick={() => handleRemoveSection(sectionId)}
                                      >
                                        <X className="h-4 w-4 text-muted-foreground" />
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

                      {/* Available sections to add */}
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Available sections to add</h4>
                        <div className={expandedView ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2" : "grid grid-cols-2 gap-2"}>
                          {getAllAvailableSections()
                            .filter(section => !sectionsToShow.includes(section))
                            .map(section => (
                              <Button
                                key={section}
                                variant="outline"
                                size="sm"
                                className="justify-start"
                                onClick={() => handleAddSection(section)}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                <span className="capitalize text-sm">{getSectionTitle(section)}</span>
                              </Button>
                            ))
                          }
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section Editors in Expanded View */}
                {expandedView ? (
                  <>
                    {/* Main Sections */}
                    {categorizedSections.main.map(section => (
                      <div key={section} className="border rounded-md p-4 bg-white dark:bg-gray-800 shadow-sm">
                        <div
                          className="flex items-center justify-between mb-3 cursor-pointer"
                          onClick={() => setExpandedSection(expandedSection === section ? null : section)}
                        >
                          <h3 className="font-medium capitalize">
                            {section === 'header' ? 'Header & Profile' : getSectionTitle(section)}
                          </h3>
                          <ChevronRight className={`h-4 w-4 transition-transform ${expandedSection === section ? 'rotate-90' : ''}`} />
                        </div>
                        {expandedSection === section && renderSectionEditor(section)}
                      </div>
                    ))}

                    {/* Content Sections (specific to template category) */}
                    {categorizedSections.content.length > 0 && (
                      <div className="border rounded-md p-4 bg-white dark:bg-gray-800 shadow-sm md:col-span-2 lg:col-span-3">
                        <div
                          className="flex items-center justify-between mb-3 cursor-pointer"
                          onClick={() => setExpandedSection(expandedSection === 'content-group' ? null : 'content-group')}
                        >
                          <h3 className="font-medium">{getContentGroupTitle()}</h3>
                          <ChevronRight className={`h-4 w-4 transition-transform ${expandedSection === 'content-group' ? 'rotate-90' : ''}`} />
                        </div>
                        {expandedSection === 'content-group' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {categorizedSections.content.map(section => (
                              <div key={section} className="border rounded-md p-3 bg-muted/10">
                                <h4 className="font-medium capitalize mb-2">{getSectionTitle(section)}</h4>
                                {renderSectionEditor(section)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Additional Sections */}
                    {categorizedSections.additional.map(section => (
                      <div key={section} className="border rounded-md p-4 bg-white dark:bg-gray-800 shadow-sm">
                        <div
                          className="flex items-center justify-between mb-3 cursor-pointer"
                          onClick={() => setExpandedSection(expandedSection === section ? null : section)}
                        >
                          <h3 className="font-medium capitalize">{getSectionTitle(section)}</h3>
                          <ChevronRight className={`h-4 w-4 transition-transform ${expandedSection === section ? 'rotate-90' : ''}`} />
                        </div>
                        {expandedSection === section && renderSectionEditor(section)}
                      </div>
                    ))}

                    {/* Settings and Meta Sections */}
                    <div className="border rounded-md p-4 bg-white dark:bg-gray-800 shadow-sm">
                      <div
                        className="flex items-center justify-between mb-3 cursor-pointer"
                        onClick={() => setExpandedSection(expandedSection === 'social' ? null : 'social')}
                      >
                        <h3 className="font-medium">Social Media</h3>
                        <ChevronRight className={`h-4 w-4 transition-transform ${expandedSection === 'social' ? 'rotate-90' : ''}`} />
                      </div>
                      {expandedSection === 'social' && (
                        <SocialLinksEditor
                          data={portfolio?.content?.socialLinks || {}}
                          onChange={(data) => onUpdateSection('socialLinks', data)}
                        />
                      )}
                    </div>

                    <div className="border rounded-md p-4 bg-white dark:bg-gray-800 shadow-sm">
                      <div
                        className="flex items-center justify-between mb-3 cursor-pointer"
                        onClick={() => setExpandedSection(expandedSection === 'seo' ? null : 'seo')}
                      >
                        <h3 className="font-medium">SEO & Metadata</h3>
                        <ChevronRight className={`h-4 w-4 transition-transform ${expandedSection === 'seo' ? 'rotate-90' : ''}`} />
                      </div>
                      {expandedSection === 'seo' && (
                        <SEOEditor
                          data={getContentForSection('seo')}
                          onChange={(data) => onUpdateSection('seo', data)}
                        />
                      )}
                    </div>
                  </>
                ) : (
                  // Original accordion layout for non-expanded view
                  <Accordion type="multiple" className="w-full">
                    {/* Main Sections */}
                    {categorizedSections.main.map(section => (
                      <AccordionItem value={section} key={section}>
                        <AccordionTrigger className="capitalize text-sm py-2">
                          {section === 'header' ? 'Header & Profile' : getSectionTitle(section)}
                        </AccordionTrigger>
                        <AccordionContent>
                          {renderSectionEditor(section)}
                        </AccordionContent>
                      </AccordionItem>
                    ))}

                    {/* Content Sections - grouped by template category */}
                    {categorizedSections.content.length > 0 && (
                      <AccordionItem value="content-sections">
                        <AccordionTrigger className="text-sm py-2">
                          {getContentGroupTitle()}
                        </AccordionTrigger>
                        <AccordionContent>
                          {categorizedSections.content.map(section => (
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

                    {/* Additional Sections */}
                    {categorizedSections.additional.map(section => (
                      <AccordionItem value={section} key={section}>
                        <AccordionTrigger className="capitalize text-sm py-2">
                          {getSectionTitle(section)}
                        </AccordionTrigger>
                        <AccordionContent>
                          {renderSectionEditor(section)}
                        </AccordionContent>
                      </AccordionItem>
                    ))}

                    {/* Social Media */}
                    <AccordionItem value="social">
                      <AccordionTrigger className="text-sm py-2">
                        Social Media
                      </AccordionTrigger>
                      <AccordionContent>
                        <SocialLinksEditor
                          data={portfolio?.content?.socialLinks || {}}
                          onChange={(data) => onUpdateSection('socialLinks', data)}
                        />
                      </AccordionContent>
                    </AccordionItem>

                    {/* SEO */}
                    <AccordionItem value="seo">
                      <AccordionTrigger className="text-sm py-2">
                        SEO & Metadata
                      </AccordionTrigger>
                      <AccordionContent>
                        <SEOEditor
                          data={getContentForSection('seo')}
                          onChange={(data) => onUpdateSection('seo', data)}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </div>
            </TabsContent>

            {/* Theme Tab */}
            <TabsContent value="theme" className="m-0 p-4 h-full">
              <div className={expandedView ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-6"}>
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
                    css={portfolio?.content?.customCss || ''}
                    onChange={(css) => onUpdateCustomCss(css)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Layout Tab */}
            <TabsContent value="layout" className="m-0 p-4 h-full">
              <div className="border rounded-md p-4 bg-white dark:bg-gray-800 shadow-sm">
                <h3 className="font-medium mb-3">Layout Options</h3>
                <LayoutSelector
                  layouts={template?.layouts || []}
                  activeLayoutId={portfolio?.activeLayout || template?.layouts?.[0]?.id}
                  onChange={onUpdateLayout}
                />
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Footer Actions */}
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

      {/* Mobile overlay */}
      {isMobile && !sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/20 z-30"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}

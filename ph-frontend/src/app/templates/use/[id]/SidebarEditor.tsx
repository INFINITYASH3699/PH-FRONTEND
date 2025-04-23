import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { SaveDraftButton } from '@/components/ui/save-draft-button';
import { PreviewButton } from '@/components/ui/preview-button';
import { PublishButton } from '@/components/ui/publish-button';
import ThemeSelector from './ThemeSelector';
import LayoutSelector from './LayoutSelector';
import CustomCSSEditor from './CustomCSSEditor';
import SEOEditor from './SEOEditor';
import SocialLinksEditor from './SocialLinksEditor';
import HeaderEditor from './HeaderEditor';
import AboutEditor from './AboutEditor';
import SkillsEditor from './SkillsEditor';
import ProjectsEditor from './ProjectsEditor';
import ExperienceEditor from './ExperienceEditor';
import EducationEditor from './EducationEditor';
import ContactEditor from './ContactEditor';
import GalleryEditor from './GalleryEditor';
import { FetchProfileButton } from '@/components/ui/fetch-profile-button';
import {
  GripVertical,
  X,
  Plus,
  PanelLeft,
  PanelRight,
  Settings,
  Layout,
  Palette,
  Code,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Search
} from 'lucide-react';

interface SidebarEditorProps {
  template: any;
  portfolio: any;
  activeSection: string | null;
  setActiveSection: (section: string | null) => void;
  sectionOrder: string[];
  onSectionReorder: (newOrder: string[]) => void;
  onAddSection: (sectionId: string) => void;
  onRemoveSection: (sectionId: string) => void;
  onUpdateSection: (sectionId: string, data: any) => void;
  onUpdateLayout: (layoutId: string) => void;
  onUpdateTheme: (colorSchemeId: string, fontPairingId: string) => void;
  onUpdateCustomCss: (css: string) => void;
  onSaveDraft: () => void;
  onPreview: () => void;
  onPublish: () => void;
  onFetchProfile?: () => Promise<void>;
  draftSaving: boolean;
  draftSaved: boolean;
  previewLoading: boolean;
  publishLoading: boolean;
  showPreview?: boolean;
}

export default function SidebarEditor({
  template,
  portfolio,
  activeSection,
  setActiveSection,
  sectionOrder,
  onSectionReorder,
  onAddSection,
  onRemoveSection,
  onUpdateSection,
  onUpdateLayout,
  onUpdateTheme,
  onUpdateCustomCss,
  onSaveDraft,
  onPreview,
  onPublish,
  onFetchProfile,
  draftSaving,
  draftSaved,
  previewLoading,
  publishLoading,
  showPreview = false
}: SidebarEditorProps) {
  const [isClient, setIsClient] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [configTab, setConfigTab] = useState<'sections' | 'theme' | 'layout' | 'css'>('sections');
  const [searchTerm, setSearchTerm] = useState('');
  const [showManageSections, setShowManageSections] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const checkIfMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Get all available sections from template
  const getAllAvailableSections = () => {
    const sections = new Set<string>();

    // First add sections from the template schema
    if (template?.sectionDefinitions) {
      Object.keys(template.sectionDefinitions).forEach(section => sections.add(section));
    }

    // Then add sections from all layouts
    template?.layouts?.forEach((layout: any) => {
      if (layout.structure?.sections) {
        layout.structure.sections.forEach((section: string) => sections.add(section));
      }
    });

    // Also ensure we capture any sections mentioned in defaultStructure
    if (template?.defaultStructure?.layout?.sections) {
      template.defaultStructure.layout.sections.forEach((section: string) => sections.add(section));
    }

    // Ensure required sections are always available
    const requiredSections = template?.defaultStructure?.config?.requiredSections || ['header', 'about'];
    requiredSections.forEach(section => sections.add(section));

    // Convert Set to Array
    return Array.from(sections);
  };

  // Get section title from template definitions or use capitalized section ID
  const getSectionTitle = (sectionId: string) => {
    if (sectionId === 'header') return 'Header & Profile';
    if (sectionId === 'socialLinks') return 'Social Media';
    if (sectionId === 'seo') return 'SEO & Metadata';

    const defaultTitle = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
    const templateTitle = template?.sectionDefinitions?.[sectionId]?.defaultData?.title;

    return templateTitle || defaultTitle;
  };

  // Get section description or default description
  const getSectionDescription = (sectionId: string) => {
    switch (sectionId) {
      case 'header':
        return 'Your name, profile photo, and title';
      case 'about':
        return 'Bio and personal information';
      case 'projects':
        return 'Showcase your work and projects';
      case 'skills':
        return 'Technical skills and expertise';
      case 'experience':
        return 'Work history and professional experience';
      case 'education':
        return 'Educational background and certifications';
      case 'contact':
        return 'Contact information and form';
      case 'gallery':
        return 'Visual showcase of your work';
      case 'socialLinks':
        return 'Links to your social media profiles';
      case 'seo':
        return 'SEO settings for your portfolio';
      default:
        return `Configure your ${getSectionTitle(sectionId)} section`;
    }
  };

  // Get content for a specific section
  const getContentForSection = (sectionId: string) => {
    return portfolio?.content?.[sectionId] || {};
  };

  // Handle section click
  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);

    // If we're on mobile, collapse the sidebar after selection
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  };

  // Handle section reordering
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(sectionOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onSectionReorder(items);
  };

  // Render editor component for active section
  const renderSectionEditor = (section: string) => {
    if (!section) return null;

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
      case 'socialLinks':
        return (
          <SocialLinksEditor
            data={portfolio?.content?.socialLinks || {}}
            onChange={(data) => onUpdateSection('socialLinks', data)}
          />
        );
      case 'seo':
        return (
          <SEOEditor
            data={getContentForSection('seo')}
            onChange={(data) => onUpdateSection('seo', data)}
          />
        );
      default:
        // For any section without a specific editor
        return (
          <div className="p-4 bg-muted/30 rounded-md">
            <p className="text-sm text-muted-foreground mb-2">
              {getSectionTitle(section)} section editor
            </p>
            <textarea
              className="w-full p-2 border rounded-md min-h-[200px]"
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

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Render config panel based on selected tab
  const renderConfigPanel = () => {
    switch (configTab) {
      case 'sections':
        return (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Manage Sections</h3>
              <Button variant="outline" size="sm" onClick={() => setShowManageSections(false)}>
                Done
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Drag to reorder sections, remove unwanted sections, or add new ones to customize your portfolio.
            </p>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="sections-list">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-2 mb-6"
                  >
                    {sectionOrder.map((sectionId, index) => (
                      <Draggable key={sectionId} draggableId={sectionId} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-md border"
                          >
                            <div className="flex items-center">
                              <GripVertical className="h-4 w-4 mr-2 text-muted-foreground" />
                              <div>
                                <span className="font-medium">{getSectionTitle(sectionId)}</span>
                                <p className="text-xs text-muted-foreground">{getSectionDescription(sectionId)}</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => onRemoveSection(sectionId)}
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

            <div className="mt-6">
              <h4 className="text-sm font-medium mb-2">Available sections to add</h4>

              <div className="relative mb-3">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search sections..."
                  className="pl-8 pr-4 py-2 w-full rounded-md border"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {getAllAvailableSections()
                  .filter(section => !sectionOrder.includes(section))
                  .filter(section => section.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(section => (
                    <Button
                      key={section}
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() => onAddSection(section)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      <span className="capitalize text-sm">{getSectionTitle(section)}</span>
                    </Button>
                  ))
                }
              </div>
            </div>
          </div>
        );
      case 'theme':
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Theme Settings</h3>
            <ThemeSelector
              themeOptions={template?.themeOptions}
              activeColorSchemeId={portfolio?.activeColorScheme}
              activeFontPairingId={portfolio?.activeFontPairing}
              onChange={onUpdateTheme}
            />
          </div>
        );
      case 'layout':
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Layout Settings</h3>
            <LayoutSelector
              layouts={template?.layouts || []}
              activeLayoutId={portfolio?.activeLayout || template?.layouts?.[0]?.id}
              onChange={onUpdateLayout}
            />
          </div>
        );
      case 'css':
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Custom CSS</h3>
            <CustomCSSEditor
              css={portfolio?.content?.customCss || ''}
              onChange={(css) => onUpdateCustomCss(css)}
            />
          </div>
        );
      default:
        return null;
    }
  };

  // Find "special" sections that aren't in the main order but are always available
  const specialSections = ['socialLinks', 'seo'];

  // Filtered sections for the sidebar
  const filteredSections = sectionOrder.filter(
    section => section.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isClient) {
    return <div className="flex items-center justify-center h-screen">Loading editor...</div>;
  }

  // Sidebar toggle button (visible on mobile)
  const SidebarToggle = () => (
    <Button
      variant="secondary"
      size="sm"
      className="fixed bottom-4 right-4 z-50 rounded-full h-12 w-12 shadow-lg md:hidden flex items-center justify-center"
      onClick={toggleSidebar}
    >
      {sidebarCollapsed ? <PanelLeft className="h-5 w-5" /> : <PanelRight className="h-5 w-5" />}
    </Button>
  );

  // Main sidebar component (left panel)
  const Sidebar = () => (
    <div
      className={`h-full border-r bg-gray-50 dark:bg-gray-900 transition-all duration-300 ${
        sidebarCollapsed ? 'w-0 -translate-x-full md:translate-x-0 md:w-0 opacity-0' : 'w-full md:w-60 lg:w-72 translate-x-0 opacity-100'
      } ${isMobile && !sidebarCollapsed ? 'fixed inset-0 z-40' : ''}`}
      style={{ maxWidth: sidebarCollapsed ? 0 : isMobile ? '100%' : '18rem' }}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-base font-semibold truncate">Portfolio Sections</h2>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => setShowManageSections(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            {isMobile && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 md:hidden"
                onClick={toggleSidebar}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="relative px-3 pt-4 pb-2">
          <Search className="absolute left-5 top-[22px] h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search sections..."
            className="pl-8 pr-4 py-2 w-full rounded-md border"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <ScrollArea className="flex-1 overflow-auto">
          <ul className="py-2">
            {filteredSections.map((section) => (
              <li
                key={section}
                onClick={() => handleSectionClick(section)}
                className={`px-3 py-2 mx-2 my-1 rounded-md cursor-pointer flex items-center transition-colors ${
                  activeSection === section
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span className="truncate flex-1">{getSectionTitle(section)}</span>
                {activeSection === section && <ChevronRight className="h-4 w-4 ml-1" />}
              </li>
            ))}

            {/* Special sections that are always available */}
            {searchTerm === '' && (
              <>
                <li className="mt-4 px-3">
                  <span className="text-xs font-medium text-muted-foreground">SETTINGS</span>
                </li>
                {specialSections.map((section) => (
                  <li
                    key={section}
                    onClick={() => handleSectionClick(section)}
                    className={`px-3 py-2 mx-2 my-1 rounded-md cursor-pointer flex items-center transition-colors ${
                      activeSection === section
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className="truncate flex-1">{getSectionTitle(section)}</span>
                    {activeSection === section && <ChevronRight className="h-4 w-4 ml-1" />}
                  </li>
                ))}
              </>
            )}
          </ul>
        </ScrollArea>

        <div className="p-3 border-t mt-auto">
          <div className="grid grid-cols-4 gap-1">
            <Button
              variant={configTab === 'sections' ? 'default' : 'outline'}
              size="sm"
              className="flex flex-col items-center justify-center h-16 space-y-1 p-1"
              onClick={() => setConfigTab('sections')}
            >
              <Settings className="h-4 w-4" />
              <span className="text-[10px]">Sections</span>
            </Button>
            <Button
              variant={configTab === 'theme' ? 'default' : 'outline'}
              size="sm"
              className="flex flex-col items-center justify-center h-16 space-y-1 p-1"
              onClick={() => setConfigTab('theme')}
            >
              <Palette className="h-4 w-4" />
              <span className="text-[10px]">Theme</span>
            </Button>
            <Button
              variant={configTab === 'layout' ? 'default' : 'outline'}
              size="sm"
              className="flex flex-col items-center justify-center h-16 space-y-1 p-1"
              onClick={() => setConfigTab('layout')}
            >
              <Layout className="h-4 w-4" />
              <span className="text-[10px]">Layout</span>
            </Button>
            <Button
              variant={configTab === 'css' ? 'default' : 'outline'}
              size="sm"
              className="flex flex-col items-center justify-center h-16 space-y-1 p-1"
              onClick={() => setConfigTab('css')}
            >
              <Code className="h-4 w-4" />
              <span className="text-[10px]">CSS</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Config panel (for section management, theme, layout, css)
  const ConfigPanel = () => (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <div className="border-b p-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Configure Portfolio</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowManageSections(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        <Tabs defaultValue="sections">
          <TabsList className="w-full justify-start px-4 pt-4">
            <TabsTrigger value="sections" onClick={() => setConfigTab('sections')}>
              Sections
            </TabsTrigger>
            <TabsTrigger value="theme" onClick={() => setConfigTab('theme')}>
              Theme
            </TabsTrigger>
            <TabsTrigger value="layout" onClick={() => setConfigTab('layout')}>
              Layout
            </TabsTrigger>
            <TabsTrigger value="css" onClick={() => setConfigTab('css')}>
              Custom CSS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sections" className="p-0">
            {renderConfigPanel()}
          </TabsContent>
          <TabsContent value="theme" className="p-0">
            {renderConfigPanel()}
          </TabsContent>
          <TabsContent value="layout" className="p-0">
            {renderConfigPanel()}
          </TabsContent>
          <TabsContent value="css" className="p-0">
            {renderConfigPanel()}
          </TabsContent>
        </Tabs>
      </div>

      <div className="border-t p-4">
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowManageSections(false)}>
            Cancel
          </Button>
          <Button onClick={() => setShowManageSections(false)}>
            Apply Changes
          </Button>
        </div>
      </div>
    </div>
  );

  // Main content panel (right side)
  const ContentPanel = () => {
    if (!activeSection) {
      return (
        <div className="flex-1 flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
          <div className="text-center max-w-md">
            <h3 className="text-xl font-semibold mb-2">Select a section to edit</h3>
            <p className="text-muted-foreground mb-4">
              Choose a section from the sidebar to start editing your portfolio.
            </p>
            {onFetchProfile && (
              <FetchProfileButton
                onFetch={onFetchProfile}
                fetchText="Auto-fill from Profile"
                fetchingText="Fetching Profile Data..."
                className="w-full mb-4"
              />
            )}
            <Button
              variant="outline"
              onClick={() => setShowManageSections(true)}
              className="w-full"
            >
              <Settings className="h-4 w-4 mr-2" />
              Manage Sections
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
        <div className="p-4 border-b bg-background flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-semibold">{getSectionTitle(activeSection)}</h2>
            <p className="text-sm text-muted-foreground">{getSectionDescription(activeSection)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-500"
              onClick={() => onRemoveSection(activeSection)}
              title="Remove section"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4 overflow-auto">
          {renderSectionEditor(activeSection)}

          <div className="h-24" /> {/* Padding at bottom for better scrolling experience */}
        </ScrollArea>

        <div className="border-t p-3 mt-auto bg-background">
          <div className="flex justify-between gap-2">
            <SaveDraftButton
              onClick={onSaveDraft}
              loading={draftSaving}
              saved={draftSaved}
              size="sm"
            />
            <div className="flex gap-2">
              <PreviewButton
                onClick={onPreview}
                loading={previewLoading}
                size="sm"
              />
              <PublishButton
                onClick={onPublish}
                loading={publishLoading}
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile sidebar toggle */}
      <SidebarToggle />

      {/* Backdrop for mobile sidebar */}
      {isMobile && !sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/20 z-30"
          onClick={toggleSidebar}
        />
      )}

      {/* Main editor layout - sidebar + content panel */}
      <div className="flex flex-1 h-full overflow-hidden">
        {/* Sidebar panel */}
        <Sidebar />

        {/* Content panel (if not showing preview) */}
        {!showPreview && <ContentPanel />}
      </div>

      {/* Config panel overlay (when active) */}
      {showManageSections && <ConfigPanel />}
    </>
  );
}

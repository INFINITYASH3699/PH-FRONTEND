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
  Search,
  Paintbrush,
  Sparkles,
  Layers
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
// Add NavbarEditor to the imports
import NavbarEditor from './NavbarEditor';
// Add FooterEditor to the imports
import FooterEditor from './FooterEditor';

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

  selectedSectionVariants: Record<string, string>;
  onSectionVariantUpdate: (sectionId: string, variantId: string) => void;
  animationsEnabled: boolean;
  onAnimationsToggle: (enabled: boolean) => void;
  selectedStylePreset: string;
  onStylePresetUpdate: (presetId: string) => void;

  viewportMode: "desktop" | "tablet" | "mobile";
  setViewportMode: (mode: "desktop" | "tablet" | "mobile") => void;
  advancedMode?: boolean;
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
  showPreview = false,

  selectedSectionVariants,
  onSectionVariantUpdate,
  animationsEnabled,
  onAnimationsToggle,
  selectedStylePreset,
  onStylePresetUpdate,

  viewportMode,
  setViewportMode,
  advancedMode = false
}: SidebarEditorProps) {
  const [isClient, setIsClient] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [configTab, setConfigTab] = useState<
    'sections' | 'theme' | 'layout' | 'css' | 'variants' | 'animations' | 'style'
  >('sections');
  const [searchTerm, setSearchTerm] = useState('');
  const [showManageSections, setShowManageSections] = useState(false);
  const [portfolioState, setPortfolio] = useState<any>(portfolio);

  useEffect(() => {
    setPortfolio(portfolio);
  }, [portfolio]);

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

  const getSectionTitle = (sectionId: string) => {
    if (sectionId === 'header') return 'Header & Profile';
    if (sectionId === 'socialLinks') return 'Social Media';
    if (sectionId === 'seo') return 'SEO & Metadata';
    if (sectionId === 'navbar') return 'Navigation Bar';
    if (sectionId === 'footer') return 'Footer';
    if (advancedMode && sectionId === 'customCss') return 'Custom CSS';
    if (advancedMode && sectionId === 'effects') return 'Animations & Effects';
    if (advancedMode && sectionId === 'accessibility') return 'Accessibility';
    if (advancedMode && sectionId === 'performance') return 'Performance';

    const defaultTitle = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
    const templateTitle = template?.sectionDefinitions?.[sectionId]?.defaultData?.title;

    return templateTitle || defaultTitle;
  };

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
      case 'navbar':
        return 'Navigation bar at the top of your portfolio';
      case 'footer':
        return 'Footer section at the bottom of your portfolio';
      case 'customCss':
        return 'Add custom CSS to your portfolio';
      case 'effects':
        return 'Configure animations and visual effects';
      case 'accessibility':
        return 'Improve accessibility features';
      case 'performance':
        return 'Optimize loading and rendering';
      default:
        return `Configure your ${getSectionTitle(sectionId)} section`;
    }
  };

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

    if (template?.defaultStructure?.layout?.sections) {
      template.defaultStructure.layout.sections.forEach((section: string) => sections.add(section));
    }

    const requiredSections = template?.defaultStructure?.config?.requiredSections || ['header', 'about'];
    requiredSections.forEach(section => sections.add(section));

    ['navbar', 'footer'].forEach(section => sections.add(section));

    if (advancedMode) {
      ['customCss', 'effects', 'accessibility', 'performance'].forEach(section =>
        sections.add(section)
      );
    }

    return Array.from(sections);
  };

  const getContentForSection = (sectionId: string) => {
    return portfolioState?.content?.[sectionId] || {};
  };

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);

    if (isMobile) {
      setSidebarCollapsed(true);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(sectionOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onSectionReorder(items);
  };

  const renderSectionVariantSelector = (sectionType: string) => {
    const sectionVariants = template?.sectionVariants?.[sectionType] || [];

    if (!sectionVariants || sectionVariants.length === 0) {
      return (
        <div className="text-sm text-muted-foreground text-center py-4">
          No variants available for this section.
        </div>
      );
    }

    const selectedVariant = selectedSectionVariants[sectionType] || '';

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Select Section Variant</h4>
        <div className="grid grid-cols-1 gap-2">
          {sectionVariants.map((variant: any) => (
            <button
              key={variant.id}
              onClick={() => onSectionVariantUpdate(sectionType, variant.id)}
              className={`p-3 rounded-md text-left transition-colors ${
                selectedVariant === variant.id
                  ? 'bg-primary/10 border border-primary text-primary'
                  : 'bg-muted/30 hover:bg-muted/50 border'
              }`}
            >
              <div className="font-medium">{variant.name}</div>
              <div className="text-xs text-muted-foreground">{variant.description}</div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderStylePresetSelector = () => {
    const stylePresets = template?.stylePresets || {};

    if (!stylePresets || Object.keys(stylePresets).length === 0) {
      return (
        <div className="text-sm text-muted-foreground text-center py-4">
          No style presets available.
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Select Style Preset</h4>
        <div className="grid grid-cols-1 gap-2">
          {Object.entries(stylePresets).map(([presetId, preset]: [string, any]) => (
            <button
              key={presetId}
              onClick={() => onStylePresetUpdate(presetId)}
              className={`p-3 rounded-md text-left transition-colors ${
                selectedStylePreset === presetId
                  ? 'bg-primary/10 border border-primary text-primary'
                  : 'bg-muted/30 hover:bg-muted/50 border'
              }`}
              style={{
                borderRadius: preset.styles?.borderRadius || '0.5rem',
                boxShadow: preset.styles?.boxShadow || 'none',
                fontWeight: preset.styles?.fontWeight || 'normal'
              }}
            >
              <div className="font-medium">{preset.name}</div>
              <div className="text-xs text-muted-foreground">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderAnimationOptions = () => {
    const animations = template?.animations || {};

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium">Enable Animations</h4>
            <p className="text-xs text-muted-foreground">Add smooth animations to sections</p>
          </div>
          <Switch
            checked={animationsEnabled}
            onCheckedChange={onAnimationsToggle}
          />
        </div>

        {animationsEnabled && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Available Animations</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(animations).map(([animationId, animation]: [string, any]) => (
                <div
                  key={animationId}
                  className="p-3 rounded-md bg-muted/30 border text-left"
                >
                  <div className="font-medium">{animation.name}</div>
                  <div className="text-xs text-muted-foreground">{animation.type} animation ({animation.duration}ms)</div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-muted/30 rounded-md text-xs text-muted-foreground">
              <p className="font-medium mb-1">Animation Info:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Animations are applied automatically to each section</li>
                <li>Header uses fade-in, About uses slide-up, etc.</li>
                <li>Animations trigger when the section comes into view</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  };

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
              activeColorSchemeId={portfolioState?.activeColorScheme}
              activeFontPairingId={portfolioState?.activeFontPairing}
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
              activeLayoutId={portfolioState?.activeLayout || template?.layouts?.[0]?.id}
              onChange={onUpdateLayout}
            />
          </div>
        );
      case 'css':
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Custom CSS</h3>
            <CustomCSSEditor
              css={portfolioState?.content?.customCss || ''}
              onChange={(css) => onUpdateCustomCss(css)}
            />
          </div>
        );
      case 'variants':
        if (activeSection) {
          return (
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Section Variants</h3>
              {renderSectionVariantSelector(activeSection)}
            </div>
          );
        }
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Section Variants</h3>
            <p className="text-muted-foreground text-sm">
              Select a section to view available variants.
            </p>
          </div>
        );
      case 'animations':
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Animation Settings</h3>
            {renderAnimationOptions()}
          </div>
        );
      case 'style':
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Style Presets</h3>
            {renderStylePresetSelector()}
          </div>
        );
      default:
        return null;
    }
  };

  const renderSectionEditor = (section: string) => {
    if (!section) return null;

    const showVariantSelector =
      section !== 'seo' &&
      section !== 'socialLinks' &&
      section !== 'customCss' &&
      section !== 'effects' &&
      section !== 'accessibility' &&
      section !== 'performance' &&
      template?.sectionVariants?.[section]?.length > 0;

    const variantSelector =
      showVariantSelector ? (
        <div className="mb-4 p-4 bg-muted/20 border rounded-lg">
          <h4 className="text-sm font-medium mb-2">Section Style</h4>
          <div className="grid grid-cols-1 gap-2">
            {template.sectionVariants[section].map((variant: any) => (
              <button
                key={variant.id}
                onClick={() => onSectionVariantUpdate(section, variant.id)}
                className={`p-2 text-left rounded-md text-sm transition-colors ${
                  selectedSectionVariants[section] === variant.id
                    ? 'bg-primary/10 border border-primary text-primary'
                    : 'bg-white dark:bg-gray-800 border hover:bg-muted/20'
                }`}
              >
                <span className="font-medium">{variant.name}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null;

    switch (section) {
      case 'header':
        return (
          <div className="mb-4">
            {variantSelector}
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
              <p className="text-sm">
                <strong>Note:</strong> Make sure to add a profile image for better visibility. Your header will be visible on the published portfolio.
              </p>
            </div>
            <HeaderEditor
              data={getContentForSection('header')}
              onChange={(data) => onUpdateSection('header', data)}
            />
          </div>
        );
      case 'about':
        return (
          <div>
            {variantSelector}
            <AboutEditor
              data={getContentForSection('about')}
              onChange={(data) => onUpdateSection('about', data)}
            />
          </div>
        );
      case 'projects':
      case 'categories':
        return (
          <div>
            {variantSelector}
            <ProjectsEditor
              data={getContentForSection(section)}
              onChange={(data) => onUpdateSection(section, data)}
            />
          </div>
        );
      case 'skills':
        return (
          <div>
            {variantSelector}
            <SkillsEditor
              data={getContentForSection('skills')}
              onChange={(data) => onUpdateSection('skills', data)}
            />
          </div>
        );
      case 'experience':
        return (
          <div>
            {variantSelector}
            <ExperienceEditor
              data={getContentForSection('experience')}
              onChange={(data) => onUpdateSection('experience', data)}
            />
          </div>
        );
      case 'education':
        return (
          <div>
            {variantSelector}
            <EducationEditor
              data={getContentForSection('education')}
              onChange={(data) => onUpdateSection('education', data)}
            />
          </div>
        );
      case 'gallery':
      case 'galleries':
        return (
          <div>
            {variantSelector}
            <GalleryEditor
              data={getContentForSection(section)}
              onChange={(data) => onUpdateSection(section, data)}
            />
          </div>
        );
      case 'contact':
        return (
          <div>
            {variantSelector}
            <ContactEditor
              data={getContentForSection('contact')}
              onChange={(data) => onUpdateSection('contact', data)}
            />
          </div>
        );
      case 'socialLinks':
        return (
          <SocialLinksEditor
            data={portfolioState?.content?.socialLinks || {}}
            onChange={(data) => onUpdateSection('socialLinks', data)}
          />
        );
      case 'seo': {
        const userType = portfolioState?.userType || 'free';
        const isSubdomainLocked =
          userType === 'premium' ? false : portfolioState?.subdomainLocked === true;

        return (
          <SEOEditor
            data={getContentForSection('seo')}
            onChange={(data) => onUpdateSection('seo', data)}
            subdomain={portfolioState?.subdomain || ''}
            onSubdomainChange={(newSubdomain: string) => {
              if (userType === 'premium' || !isSubdomainLocked) {
                setPortfolio((prev: any) => ({
                  ...prev,
                  subdomain: newSubdomain,
                  customSubdomain: true
                }));
              }
            }}
            isSubdomainLocked={isSubdomainLocked}
            userType={userType}
          />
        );
      }
      case 'customCss':
        return (
          <CustomCSSEditor
            css={portfolioState?.content?.customCss || ''}
            onChange={(css) => onUpdateCustomCss(css)}
          />
        );
      case 'effects':
        return (
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
              />
            </div>

            <div className="p-3 border rounded-md">
              <h3 className="text-sm font-medium mb-2">Style Preset</h3>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(template?.stylePresets || {}).map(([id, preset]: [string, any]) => (
                  <button
                    key={id}
                    onClick={() => onStylePresetUpdate(id)}
                    className={`p-3 rounded-md text-left transition-colors ${
                      selectedStylePreset === id
                        ? 'bg-primary/10 border border-primary text-primary'
                        : 'bg-muted/30 hover:bg-muted/50 border'
                    }`}
                  >
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-xs text-muted-foreground">{preset.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 'accessibility':
        return (
          <div className="space-y-4 p-3 border rounded-md">
            <h3 className="text-sm font-medium">Accessibility Settings</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Improve accessibility of your portfolio with these settings.
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="high-contrast">High Contrast Mode</Label>
                <Switch
                  id="high-contrast"
                  checked={portfolioState?.content?.accessibility?.highContrast || false}
                  onCheckedChange={(checked) => {
                    onUpdateSection('accessibility', {
                      ...portfolioState?.content?.accessibility,
                      highContrast: checked
                    });
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="larger-text">Larger Text</Label>
                <Switch
                  id="larger-text"
                  checked={portfolioState?.content?.accessibility?.largerText || false}
                  onCheckedChange={(checked) => {
                    onUpdateSection('accessibility', {
                      ...portfolioState?.content?.accessibility,
                      largerText: checked
                    });
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="screen-reader">Screen Reader Support</Label>
                <Switch
                  id="screen-reader"
                  checked={portfolioState?.content?.accessibility?.screenReader || false}
                  onCheckedChange={(checked) => {
                    onUpdateSection('accessibility', {
                      ...portfolioState?.content?.accessibility,
                      screenReader: checked
                    });
                  }}
                />
              </div>
            </div>
          </div>
        );
      case 'performance':
        return (
          <div className="space-y-4 p-3 border rounded-md">
            <h3 className="text-sm font-medium">Performance Settings</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Optimize the performance of your portfolio.
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="lazy-loading">Enable Lazy Loading</Label>
                <Switch
                  id="lazy-loading"
                  checked={portfolioState?.content?.performance?.lazyLoading || false}
                  onCheckedChange={(checked) => {
                    onUpdateSection('performance', {
                      ...portfolioState?.content?.performance,
                      lazyLoading: checked
                    });
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="image-optimization">Image Optimization</Label>
                <Switch
                  id="image-optimization"
                  checked={portfolioState?.content?.performance?.imageOptimization || false}
                  onCheckedChange={(checked) => {
                    onUpdateSection('performance', {
                      ...portfolioState?.content?.performance,
                      imageOptimization: checked
                    });
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="prefetch">Prefetch Links</Label>
                <Switch
                  id="prefetch"
                  checked={portfolioState?.content?.performance?.prefetch || false}
                  onCheckedChange={(checked) => {
                    onUpdateSection('performance', {
                      ...portfolioState?.content?.performance,
                      prefetch: checked
                    });
                  }}
                />
              </div>
            </div>
          </div>
        );
      case 'navbar':
        // Use NavbarEditor instead of textarea
        return (
          <NavbarEditor
            data={getContentForSection('navbar')}
            onChange={(data) => onUpdateSection('navbar', data)}
          />
        );
      case 'footer':
        return (
          <FooterEditor
            data={getContentForSection('footer')}
            onChange={(data) => onUpdateSection('footer', data)}
          />
        );
      default:
        return (
          <div>
            {variantSelector}
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
          </div>
        );
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const specialSections = ['socialLinks', 'seo'];

  const filteredSections = sectionOrder.filter(
    section => section.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isClient) {
    return <div className="flex items-center justify-center h-screen">Loading editor...</div>;
  }

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

  const Sidebar = () => (
    <div
      className={`h-full border-r bg-gray-50 dark:bg-gray-900 transition-all duration-300 ${
        sidebarCollapsed ? 'w-0 -translate-x-full md:translate-x-0 md:w-0 opacity-0' : 'w-full md:w-60 lg:w-80 translate-x-0 opacity-100'
      } ${isMobile && !sidebarCollapsed ? 'fixed inset-0 z-40' : ''}`}
      style={{ maxWidth: sidebarCollapsed ? 0 : isMobile ? '100%' : '20rem' }}
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
                {advancedMode && (
                  <>
                    <li className="mt-4 px-3">
                      <span className="text-xs font-medium text-muted-foreground">ADVANCED</span>
                    </li>
                    {['customCss', 'effects', 'accessibility', 'performance'].map((section) => (
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
                <li className="mt-4 px-3">
                  <span className="text-xs font-medium text-muted-foreground">SITE</span>
                </li>
                {['navbar', 'footer'].map((section) => (
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

        <div className="p-3 border-t mt-auto bg-white dark:bg-gray-800">
          <div className="grid grid-cols-6 gap-1">
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
              variant={configTab === 'variants' ? 'default' : 'outline'}
              size="sm"
              className="flex flex-col items-center justify-center h-16 space-y-1 p-1"
              onClick={() => setConfigTab('variants')}
            >
              <Layers className="h-4 w-4" />
              <span className="text-[10px]">Variants</span>
            </Button>
            <Button
              variant={configTab === 'animations' ? 'default' : 'outline'}
              size="sm"
              className="flex flex-col items-center justify-center h-16 space-y-1 p-1"
              onClick={() => setConfigTab('animations')}
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-[10px]">Effects</span>
            </Button>
            <Button
              variant={configTab === 'style' ? 'default' : 'outline'}
              size="sm"
              className="flex flex-col items-center justify-center h-16 space-y-1 p-1"
              onClick={() => setConfigTab('style')}
            >
              <Paintbrush className="h-4 w-4" />
              <span className="text-[10px]">Style</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

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
        <Tabs defaultValue={configTab}>
          <TabsList className="w-full justify-start px-4 pt-4 flex flex-wrap gap-2">
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
            <TabsTrigger value="variants" onClick={() => setConfigTab('variants')}>
              Variants
            </TabsTrigger>
            <TabsTrigger value="animations" onClick={() => setConfigTab('animations')}>
              Effects
            </TabsTrigger>
            <TabsTrigger value="style" onClick={() => setConfigTab('style')}>
              Style
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
          <TabsContent value="variants" className="p-0">
            {renderConfigPanel()}
          </TabsContent>
          <TabsContent value="animations" className="p-0">
            {renderConfigPanel()}
          </TabsContent>
          <TabsContent value="style" className="p-0">
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

        <ScrollArea
          className="flex-1 p-4 overflow-auto"
          key={activeSection}
          type="always"
        >
          {renderSectionEditor(activeSection)}

          <div className="h-24" />
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
      <SidebarToggle />

      {isMobile && !sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/20 z-30"
          onClick={toggleSidebar}
        />
      )}

      <div className="flex flex-1 h-full overflow-hidden">
        <Sidebar />
        {!showPreview && <ContentPanel />}
      </div>

      {showManageSections && <ConfigPanel />}
    </>
  );
}

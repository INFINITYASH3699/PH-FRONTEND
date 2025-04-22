import { useState } from 'react';
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
  onFetchProfile?: () => Promise<void>; // Optional prop for fetching profile data
  draftSaving: boolean;
  draftSaved: boolean;
  previewLoading: boolean;
  publishLoading: boolean;
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
  draftSaving,
  draftSaved,
  previewLoading,
  publishLoading
}: EditorSidebarProps) {
  const [activeTab, setActiveTab] = useState('content');

  // Determine which sections to show in the editor based on the active layout
  const activeLayoutId = portfolio.activeLayout || template?.layouts?.[0]?.id || 'default';
  const activeLayout = template?.layouts?.find((l: any) => l.id === activeLayoutId) || template?.layouts?.[0];
  const sectionsToShow = activeLayout?.structure?.sections ||
    template?.defaultStructure?.layout?.sections || [];

  // Separate the sections by type
  const mainSections = ['header', 'about'];
  const portfolioSections = ['projects', 'skills', 'experience', 'education', 'gallery'];
  const additionalSections = ['contact', 'services', 'testimonials'];

  const getContentForSection = (sectionId: string) => {
    return portfolio?.content?.[sectionId] || {};
  };

  return (
    <div className="h-full flex flex-col border-l bg-card">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">Template Editor</h2>
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
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="flex justify-between px-4 py-2 bg-muted/40">
          <TabsTrigger value="content" className="flex-1">Content</TabsTrigger>
          <TabsTrigger value="theme" className="flex-1">Theme</TabsTrigger>
          <TabsTrigger value="layout" className="flex-1">Layout</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="content" className="m-0 p-4 h-full">
            <div className="space-y-6">
              {onFetchProfile && (
                <FetchProfileButton
                  onFetch={onFetchProfile}
                  fetchText="Auto-fill with Your Profile Data"
                  fetchingText="Importing your data..."
                  className="w-full mb-4"
                />
              )}
              <Accordion type="multiple" className="w-full">
                {/* Main Sections */}
                {mainSections.filter(section => sectionsToShow.includes(section)).map(section => (
                  <AccordionItem value={section} key={section}>
                    <AccordionTrigger className="capitalize text-sm py-2">
                      {section === 'header' ? 'Header & Profile' : section}
                    </AccordionTrigger>
                    <AccordionContent>
                      {section === 'header' && (
                        <HeaderEditor
                          data={getContentForSection('header')}
                          onChange={(data) => onUpdateSection('header', data)}
                        />
                      )}
                      {section === 'about' && (
                        <AboutEditor
                          data={getContentForSection('about')}
                          onChange={(data) => onUpdateSection('about', data)}
                        />
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}

                {/* Portfolio Sections */}
                {portfolioSections.filter(section => sectionsToShow.includes(section)).length > 0 && (
                  <AccordionItem value="portfolio-sections">
                    <AccordionTrigger className="text-sm py-2">
                      Work & Experience
                    </AccordionTrigger>
                    <AccordionContent>
                      {portfolioSections.filter(section => sectionsToShow.includes(section)).map(section => (
                        <div key={section} className="mb-6">
                          <h3 className="font-medium capitalize mb-2">
                            {section}
                          </h3>
                          {section === 'projects' && (
                            <ProjectsEditor
                              data={getContentForSection('projects')}
                              onChange={(data) => onUpdateSection('projects', data)}
                            />
                          )}
                          {section === 'skills' && (
                            <SkillsEditor
                              data={getContentForSection('skills')}
                              onChange={(data) => onUpdateSection('skills', data)}
                            />
                          )}
                          {section === 'experience' && (
                            <ExperienceEditor
                              data={getContentForSection('experience')}
                              onChange={(data) => onUpdateSection('experience', data)}
                            />
                          )}
                          {section === 'education' && (
                            <EducationEditor
                              data={getContentForSection('education')}
                              onChange={(data) => onUpdateSection('education', data)}
                            />
                          )}
                          {section === 'gallery' && (
                            <GalleryEditor
                              data={getContentForSection('gallery')}
                              onChange={(data) => onUpdateSection('gallery', data)}
                            />
                          )}
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Additional Sections */}
                {additionalSections.filter(section => sectionsToShow.includes(section)).map(section => (
                  <AccordionItem value={section} key={section}>
                    <AccordionTrigger className="capitalize text-sm py-2">
                      {section}
                    </AccordionTrigger>
                    <AccordionContent>
                      {section === 'contact' && (
                        <ContactEditor
                          data={getContentForSection('contact')}
                          onChange={(data) => onUpdateSection('contact', data)}
                        />
                      )}
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
            </div>
          </TabsContent>

          <TabsContent value="theme" className="m-0 p-4 h-full">
            <div className="space-y-6">
              <Accordion type="multiple" className="w-full" defaultValue={["theme"]}>
                <AccordionItem value="theme">
                  <AccordionTrigger className="text-sm py-2">
                    Colors & Fonts
                  </AccordionTrigger>
                  <AccordionContent>
                    <ThemeSelector
                      themeOptions={template?.themeOptions}
                      activeColorSchemeId={portfolio?.activeColorScheme}
                      activeFontPairingId={portfolio?.activeFontPairing}
                      onChange={onUpdateTheme}
                    />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="custom-css">
                  <AccordionTrigger className="text-sm py-2">
                    Custom CSS
                  </AccordionTrigger>
                  <AccordionContent>
                    <CustomCSSEditor
                      css={portfolio?.content?.customCss || ''}
                      onChange={(css) => onUpdateCustomCss(css)}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>

          <TabsContent value="layout" className="m-0 p-4 h-full">
            <div className="space-y-6">
              <Accordion type="multiple" className="w-full" defaultValue={["layout"]}>
                <AccordionItem value="layout">
                  <AccordionTrigger className="text-sm py-2">
                    Layout
                  </AccordionTrigger>
                  <AccordionContent>
                    <LayoutSelector
                      layouts={template?.layouts || []}
                      activeLayoutId={portfolio?.activeLayout || template?.layouts?.[0]?.id}
                      onChange={onUpdateLayout}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>

      <div className="p-4 border-t bg-card mt-auto">
        <PublishButton
          onClick={onPublish}
          loading={publishLoading}
          className="w-full"
        />
      </div>
    </div>
  );
}

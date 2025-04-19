'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image'; 
import Link from 'next/link';
import { useRouter, notFound, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NavBar } from '@/components/layout/NavBar';
import { Footer } from '@/components/layout/Footer';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/providers/AuthContext';
import ProjectsEditor from './ProjectsEditor';
import SkillsEditor from './SkillsEditor';
import apiClient, { Template } from '@/lib/apiClient';
import { templates as fallbackTemplates } from '@/data/templates'; // Use as fallback

// Define the portfolio structure
interface PortfolioSettings {
  colors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    text?: string;
  };
  fonts?: {
    heading?: string;
    body?: string;
  };
  layout?: {
    sections?: string[];
    showHeader?: boolean;
    showFooter?: boolean;
  };
}

// Section content interfaces
interface AboutContent {
  title?: string;
  bio?: string;
  profileImage?: string;
}

interface ProjectItem {
  id?: string;
  title: string;
  description: string;
  imageUrl?: string;
  projectUrl?: string;
  githubUrl?: string;
  tags: string[];
}

interface ProjectsContent {
  items: ProjectItem[];
}

interface SkillItem {
  name: string;
  proficiency: number;
}

interface SkillCategory {
  name: string;
  skills: SkillItem[];
}

interface SkillsContent {
  categories: SkillCategory[];
}

interface ExperienceItem {
  id?: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

interface ExperienceContent {
  items: ExperienceItem[];
}

interface EducationItem {
  id?: string;
  degree: string;
  institution: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

interface EducationContent {
  items: EducationItem[];
}

interface ContactContent {
  email?: string;
  phone?: string;
  address?: string;
  showContactForm?: boolean;
}

interface GalleryItem {
  id?: string;
  title: string;
  description?: string;
  imageUrl: string;
  category?: string;
}

interface GalleryContent {
  items: GalleryItem[];
}

interface SectionContent {
  about?: AboutContent;
  projects?: ProjectsContent;
  skills?: SkillsContent;
  experience?: ExperienceContent;
  education?: EducationContent;
  contact?: ContactContent;
  gallery?: GalleryContent;
  [key: string]: any;
}

interface Portfolio {
  id?: string;
  templateId: string;
  title: string;
  subtitle?: string;
  customDomain?: string;
  subdomain: string;
  isPublished: boolean;
  settings: PortfolioSettings;
  sectionContent: SectionContent;
}

// Enhance the fallbackTemplates with sections information to avoid undefined access
export interface Template {
  _id: string;
  name: string;
  description: string;
  category: string;
  previewImage: string;
  defaultStructure: Record<string, any>;
  isPublished: boolean;
  sections?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export default function PortfolioEditorPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = typeof params.id === 'string' ? params.id : '';
  const { user, isAuthenticated, isLoading } = useAuth();

  // Template state
  const [template, setTemplate] = useState<Template | null>(null);
  const [templateLoading, setTemplateLoading] = useState(true);

  // Portfolio state
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('about');
  const [portfolioId, setPortfolioId] = useState<string | null>(null);

  // Fetch template data from API
  useEffect(() => {
    const fetchTemplate = async () => {
      if (!templateId) {
        toast.error('Template ID is required');
        router.push('/templates');
        return;
      }

      try {
        setTemplateLoading(true);
        const templateData = await apiClient.getTemplateById(templateId);

        // Ensure the template has sections property
        if (!templateData.sections) {
          templateData.sections = ['header', 'about', 'projects', 'skills', 'experience', 'education', 'contact'];
        }

        setTemplate(templateData);

        // Initialize portfolio with template data
        initializePortfolio(templateData);
      } catch (error) {
        console.error('Error fetching template:', error);
        toast.error('Failed to load template from API. Using demo data.');

        // Fallback to local data
        const fallbackTemplate = fallbackTemplates.find(t => t._id === templateId);

        if (fallbackTemplate) {
          const template = {
            _id: fallbackTemplate._id,
            name: fallbackTemplate.name,
            description: fallbackTemplate.description,
            category: fallbackTemplate.category,
            previewImage: fallbackTemplate.previewImage,
            defaultStructure: fallbackTemplate.settings || {},
            // Add default sections if they don't exist
            sections: fallbackTemplate.sections || ['header', 'about', 'projects', 'skills', 'experience', 'education', 'contact'],
            isPublished: true
          } as Template;

          setTemplate(template);
          initializePortfolio(template);
        } else {
          toast.error('Template not found');
          router.push('/templates');
        }
      } finally {
        setTemplateLoading(false);
      }
    };

    fetchTemplate();
  }, [templateId, router]);

  // Initialize portfolio with template data
  const initializePortfolio = (templateData: Template) => {
    // Extract sections from template data
    const sections = templateData.defaultStructure?.layout?.sections ||
      templateData.sections ||
      ['header', 'about', 'projects', 'skills', 'experience', 'education', 'contact'];

    // Extract colors from template data
    const defaultColors = templateData.defaultStructure?.layout?.defaultColors ||
      templateData.customizationOptions?.colorSchemes?.[0] ||
      ['#6366f1', '#8b5cf6', '#ffffff', '#111827'];

    // Extract fonts from template data
    const defaultFonts = templateData.defaultStructure?.layout?.defaultFonts ||
      templateData.customizationOptions?.fontPairings?.[0] ||
      ['Inter', 'Roboto', 'Montserrat'];

    // Create portfolio object with template settings
    const newPortfolio: Portfolio = {
      templateId: templateData._id,
      title: 'My Portfolio',
      subtitle: user?.profile?.title || 'Web Developer',
      subdomain: user?.username || '',
      isPublished: false,
      settings: {
        colors: {
          primary: defaultColors[0] || '#6366f1',
          secondary: defaultColors[1] || '#8b5cf6',
          background: defaultColors[2] || '#ffffff',
          text: defaultColors[3] || '#111827',
        },
        fonts: {
          heading: defaultFonts[0] || 'Inter',
          body: defaultFonts[1] || 'Inter',
        },
        layout: {
          sections: sections,
          showHeader: true,
          showFooter: true,
        },
      },
      sectionContent: {
        about: {
          title: 'About Me',
          bio: user?.profile?.bio || 'I am a passionate professional with experience in my field.',
          profileImage: user?.profilePicture || '',
        },
        projects: {
          items: [],
        },
        skills: {
          categories: [
            {
              name: 'Frontend',
              skills: [
                { name: 'React', proficiency: 90 },
                { name: 'JavaScript', proficiency: 85 },
                { name: 'CSS', proficiency: 80 },
              ],
            },
          ],
        },
        experience: {
          items: [],
        },
        education: {
          items: [],
        },
        contact: {
          email: user?.email || '',
          phone: '',
          address: user?.profile?.location || '',
          showContactForm: true,
        },
        gallery: {
          items: [],
        },
      },
    };

    setPortfolio(newPortfolio);
  };

  // Check if user is authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error('You need to be logged in to create a portfolio');
      router.push('/auth/signin?callbackUrl=/templates');
    }
  }, [isAuthenticated, isLoading, router]);

  // Handle text input changes
  const handleInputChange = (field: string, value: string) => {
    if (!portfolio) return;

    setPortfolio(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  // Handle nested settings changes
  const handleSettingsChange = (
    category: 'colors' | 'fonts' | 'layout',
    field: string,
    value: string | boolean | string[]
  ) => {
    if (!portfolio) return;

    setPortfolio(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        settings: {
          ...prev.settings,
          [category]: {
            ...prev.settings[category],
            [field]: value,
          },
        },
      };
    });
  };

  // Handle section content changes
  const handleSectionContentChange = (
    section: string,
    content: any
  ) => {
    if (!portfolio) return;

    setPortfolio(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        sectionContent: {
          ...prev.sectionContent,
          [section]: content,
        },
      };
    });

    // If portfolio already exists, update section content immediately
    if (portfolioId) {
      updateSectionContent(section, content);
    }
  };

  // Update a specific section content
  const updateSectionContent = async (section: string, content: any) => {
    if (!portfolioId || !user) return;

    try {
      await apiClient.updatePortfolioContent(
        portfolioId,
        { [section]: content }
      );
    } catch (error) {
      console.error(`Error updating ${section} section:`, error);
      toast.error('Failed to update section content');
    }
  };

  // Handle file upload for profile image
  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !portfolio) return;

    try {
      setLoading(true);
      const imageData = await apiClient.uploadImage(file, 'profile');

      const updatedAboutContent = {
        ...portfolio.sectionContent.about,
        profileImage: imageData.url,
      };

      handleSectionContentChange('about', updatedAboutContent);
      toast.success('Profile image uploaded');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  // Save portfolio as draft
  const saveAsDraft = async () => {
    if (!isAuthenticated || !user || !portfolio) {
      toast.error('Please sign in to save your portfolio');
      return;
    }

    setLoading(true);

    try {
      // Track template usage
      if (!portfolioId && template?._id) {
        try {
          await apiClient.request(`/templates/${template._id}/use`, 'POST');
        } catch (error) {
          console.error('Error tracking template usage:', error);
          // Continue with saving even if tracking fails
        }
      }

      let savedPortfolio;

      if (portfolioId) {
        // Update existing portfolio
        savedPortfolio = await apiClient.updatePortfolioContent(
          portfolioId,
          {
            title: portfolio.title,
            subtitle: portfolio.subtitle,
            subdomain: portfolio.subdomain,
            settings: portfolio.settings,
            isPublished: false,
            ...portfolio.sectionContent
          }
        );
      } else {
        // Create new portfolio
        savedPortfolio = await apiClient.createPortfolio({
          title: portfolio.title,
          subtitle: portfolio.subtitle,
          subdomain: portfolio.subdomain,
          templateId: portfolio.templateId,
          content: portfolio.sectionContent,
        });

        if (savedPortfolio && savedPortfolio._id) {
          setPortfolioId(savedPortfolio._id);
        }
      }

      toast.success('Portfolio saved as draft');
    } catch (error) {
      console.error('Error saving portfolio:', error);
      toast.error('Failed to save portfolio');
    } finally {
      setLoading(false);
    }
  };

  // Publish portfolio
  const publishPortfolio = async () => {
    if (!isAuthenticated || !user || !portfolio) {
      toast.error('Please sign in to publish your portfolio');
      return;
    }

    // Validate subdomain
    if (!portfolio.subdomain) {
      toast.error('Subdomain is required');
      return;
    }

    setLoading(true);

    try {
      // Track template usage if this is a new portfolio
      if (!portfolioId && template?._id) {
        try {
          await apiClient.request(`/templates/${template._id}/use`, 'POST');
        } catch (error) {
          console.error('Error tracking template usage:', error);
          // Continue with publishing even if tracking fails
        }
      }

      let savedPortfolio;

      if (portfolioId) {
        // Update existing portfolio
        savedPortfolio = await apiClient.updatePortfolioContent(
          portfolioId,
          {
            title: portfolio.title,
            subtitle: portfolio.subtitle,
            subdomain: portfolio.subdomain,
            settings: portfolio.settings,
            isPublished: true,
            ...portfolio.sectionContent
          }
        );
      } else {
        // Create new portfolio
        savedPortfolio = await apiClient.createPortfolio({
          title: portfolio.title,
          subtitle: portfolio.subtitle,
          subdomain: portfolio.subdomain,
          templateId: portfolio.templateId,
          content: portfolio.sectionContent,
          isPublished: true
        });

        if (savedPortfolio && savedPortfolio._id) {
          setPortfolioId(savedPortfolio._id);
        }
      }

      toast.success('Portfolio published successfully');
      router.push(`/portfolio/${portfolio.subdomain}`);
    } catch (error) {
      console.error('Error publishing portfolio:', error);
      toast.error('Failed to publish portfolio');
    } finally {
      setLoading(false);
    }
  };

  // Preview the portfolio
  const previewPortfolio = async () => {
    // First save the portfolio as a draft
    await saveAsDraft();

    // Then open the preview in a new tab
    if (portfolio?.subdomain) {
      window.open(`/portfolio/${portfolio.subdomain}`, '_blank');
    } else {
      toast.error('Please set a subdomain for your portfolio');
    }
  };

  // Show loading state
  if (templateLoading || !template || !portfolio) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-muted-foreground">Loading template data...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      <main className="flex-grow py-8">
        <div className="container px-4 md:px-6">
          {/* Header */}
          <div className="mb-8 border-b pb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Customize Your Portfolio</h1>
                <p className="text-muted-foreground">
                  You're using the <span className="font-medium text-violet-600">{template.name}</span> template. Customize it to make it your own.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={previewPortfolio}
                  disabled={loading}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 mr-2"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Preview
                </Button>
                <Button
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                  onClick={publishPortfolio}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2"></div>
                      Publishing...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 mr-2"
                      >
                        <path d="M12 19V5" />
                        <path d="m5 12 7-7 7 7" />
                      </svg>
                      Publish
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Progress indication */}
            {portfolioId ? (
              <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 mr-2 text-green-500"
                >
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                <span>Your portfolio is saved as a draft. Continue customizing or publish when ready.</span>
              </div>
            ) : (
              <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 mr-2 text-blue-500"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="m12 8 4 4-4 4" />
                  <path d="m8 12h8" />
                </svg>
                <span>Complete the sections below and click "Save as Draft" to save your progress.</span>
              </div>
            )}
          </div>

          {/* Main Editor */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8 shadow-md">
                <CardHeader>
                  <CardTitle>Portfolio Settings</CardTitle>
                  <CardDescription>
                    Configure your portfolio settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="title" className="text-sm font-medium">
                        Portfolio Title
                      </label>
                      <Input
                        id="title"
                        placeholder="My Portfolio"
                        value={portfolio.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="subtitle" className="text-sm font-medium">
                        Subtitle
                      </label>
                      <Input
                        id="subtitle"
                        placeholder="Full Stack Developer"
                        value={portfolio.subtitle || ''}
                        onChange={(e) => handleInputChange('subtitle', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="subdomain" className="text-sm font-medium">
                        Subdomain
                      </label>
                      <div className="relative">
                        <Input
                          id="subdomain"
                          placeholder="johndoe"
                          value={portfolio.subdomain}
                          onChange={(e) => handleInputChange('subdomain', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                          className={!portfolio.subdomain ? "border-orange-300 focus:ring-orange-500" : ""}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-sm text-muted-foreground">
                          .portfoliohub.com
                        </div>
                      </div>
                      {!portfolio.subdomain && (
                        <p className="text-xs text-orange-500 mt-1">
                          A subdomain is required to publish your portfolio
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 pt-4 border-t">
                      <span className="text-sm font-medium">Colors</span>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="primaryColor" className="text-xs">Primary</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              id="primaryColor"
                              value={portfolio.settings.colors?.primary || '#6366f1'}
                              onChange={(e) => handleSettingsChange('colors', 'primary', e.target.value)}
                              className="w-8 h-8 rounded cursor-pointer"
                            />
                            <Input
                              value={portfolio.settings.colors?.primary || '#6366f1'}
                              onChange={(e) => handleSettingsChange('colors', 'primary', e.target.value)}
                              className="h-8 font-mono text-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="secondaryColor" className="text-xs">Secondary</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              id="secondaryColor"
                              value={portfolio.settings.colors?.secondary || '#8b5cf6'}
                              onChange={(e) => handleSettingsChange('colors', 'secondary', e.target.value)}
                              className="w-8 h-8 rounded cursor-pointer"
                            />
                            <Input
                              value={portfolio.settings.colors?.secondary || '#8b5cf6'}
                              onChange={(e) => handleSettingsChange('colors', 'secondary', e.target.value)}
                              className="h-8 font-mono text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t">
                      <span className="text-sm font-medium">Template Sections</span>
                      <div className="grid grid-cols-1 gap-2">
                        {template.sections && template.sections.map((section) => (
                          <div key={section} className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                            template.defaultStructure?.config?.requiredSections?.includes(section)
                              ? "bg-violet-50 border border-violet-100"
                              : "bg-muted/50"
                          }`}>
                            <div>
                              <span className="capitalize">{section}</span>
                              {template.defaultStructure?.config?.requiredSections?.includes(section) && (
                                <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-violet-100 text-violet-800">
                                  Required
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`section-${section}`}
                                checked={portfolio.settings.layout?.sections?.includes(section) || false}
                                onCheckedChange={(checked) => {
                                  // Don't allow unchecking required sections
                                  if (!checked && template.defaultStructure?.config?.requiredSections?.includes(section)) {
                                    toast.error(`The ${section} section is required for this template`);
                                    return;
                                  }

                                  const currentSections = portfolio.settings.layout?.sections || [];
                                  const newSections = checked
                                    ? [...currentSections, section]
                                    : currentSections.filter(s => s !== section);

                                  handleSettingsChange('layout', 'sections', newSections);

                                  // If newly enabled, set that section as active
                                  if (checked) {
                                    setActiveTab(section);
                                  }
                                }}
                                disabled={template.defaultStructure?.config?.requiredSections?.includes(section)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Editor Area */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Content Editor</CardTitle>
                  <CardDescription>
                    Edit your portfolio content section by section
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs
                    defaultValue="about"
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="space-y-4"
                  >
                    <TabsList className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7">
                      {portfolio.settings.layout?.sections?.map((section) => (
                        <TabsTrigger key={section} value={section} className="capitalize">
                          {section}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {/* About Section */}
                    <TabsContent value="about" className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">About Title</label>
                        <Input
                          defaultValue="About Me"
                          value={portfolio.sectionContent.about?.title || 'About Me'}
                          onChange={(e) => handleSectionContentChange('about', {
                            ...portfolio.sectionContent.about,
                            title: e.target.value
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Bio</label>
                        <Textarea
                          className="min-h-32"
                          placeholder="Write something about yourself..."
                          value={portfolio.sectionContent.about?.bio || ''}
                          onChange={(e) => handleSectionContentChange('about', {
                            ...portfolio.sectionContent.about,
                            bio: e.target.value
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Profile Image</label>
                        <div className="flex items-center gap-4">
                          <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                            {portfolio.sectionContent.about?.profileImage ? (
                              <Image
                                src={portfolio.sectionContent.about.profileImage}
                                alt="Profile"
                                width={128}
                                height={128}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-12 w-12 text-muted-foreground"
                              >
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                              </svg>
                            )}
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="profileImage" className="cursor-pointer">
                              <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                                Upload Image
                              </div>
                              <input
                                type="file"
                                id="profileImage"
                                accept="image/*"
                                className="hidden"
                                onChange={handleProfileImageUpload}
                              />
                            </label>
                            {portfolio.sectionContent.about?.profileImage && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSectionContentChange('about', {
                                  ...portfolio.sectionContent.about,
                                  profileImage: ''
                                })}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Projects Section */}
                    <TabsContent value="projects" className="space-y-4">
                      <ProjectsEditor
                        content={portfolio.sectionContent.projects || { items: [] }}
                        onSave={(content) => handleSectionContentChange('projects', content)}
                        isLoading={loading}
                      />
                    </TabsContent>

                    {/* Skills Section */}
                    <TabsContent value="skills" className="space-y-4">
                      <SkillsEditor
                        content={portfolio.sectionContent.skills || { categories: [] }}
                        onSave={(content) => handleSectionContentChange('skills', content)}
                        isLoading={loading}
                      />
                    </TabsContent>

                    {/* Gallery Section - if template supports it */}
                    {portfolio.settings.layout?.sections?.includes('gallery') && (
                      <TabsContent value="gallery" className="space-y-4">
                        <div className="p-6 border rounded-lg bg-muted/10">
                          <h3 className="text-lg font-medium mb-4">Gallery Section</h3>
                          <p className="mb-4 text-muted-foreground">
                            This section allows you to showcase your visual work. Upload images and organize them into categories.
                          </p>
                          <div className="flex justify-center">
                            <Button
                              variant="outline"
                              onClick={() => {
                                // Initialize gallery if it doesn't exist
                                if (!portfolio.sectionContent.gallery) {
                                  handleSectionContentChange('gallery', { items: [] });
                                }
                                // TODO: Implement full gallery editor in a future update
                                toast.info('Gallery editor will be available in the next update');
                              }}
                            >
                              {portfolio.sectionContent.gallery?.items?.length ?
                                `Edit Gallery (${portfolio.sectionContent.gallery.items.length} items)` :
                                'Add Images to Gallery'}
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                    )}

                    {/* Contact Section */}
                    {portfolio.settings.layout?.sections?.includes('contact') && (
                      <TabsContent value="contact" className="space-y-4">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Email Address</label>
                            <Input
                              type="email"
                              placeholder="your@email.com"
                              value={portfolio.sectionContent.contact?.email || ''}
                              onChange={(e) => handleSectionContentChange('contact', {
                                ...portfolio.sectionContent.contact,
                                email: e.target.value
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Phone Number (Optional)</label>
                            <Input
                              type="tel"
                              placeholder="+1 (555) 123-4567"
                              value={portfolio.sectionContent.contact?.phone || ''}
                              onChange={(e) => handleSectionContentChange('contact', {
                                ...portfolio.sectionContent.contact,
                                phone: e.target.value
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Location/Address (Optional)</label>
                            <Input
                              placeholder="City, Country"
                              value={portfolio.sectionContent.contact?.address || ''}
                              onChange={(e) => handleSectionContentChange('contact', {
                                ...portfolio.sectionContent.contact,
                                address: e.target.value
                              })}
                            />
                          </div>
                          <div className="flex items-center space-x-2 pt-2">
                            <Switch
                              id="contact-form"
                              checked={portfolio.sectionContent.contact?.showContactForm || false}
                              onCheckedChange={(checked) => handleSectionContentChange('contact', {
                                ...portfolio.sectionContent.contact,
                                showContactForm: checked
                              })}
                            />
                            <Label htmlFor="contact-form">
                              Include contact form on portfolio
                            </Label>
                          </div>
                        </div>
                      </TabsContent>
                    )}

                    {/* Experience Section */}
                    {portfolio.settings.layout?.sections?.includes('experience') && (
                      <TabsContent value="experience" className="space-y-4">
                        <div className="p-6 border rounded-lg bg-muted/10">
                          <h3 className="text-lg font-medium mb-4">Work Experience</h3>
                          <p className="mb-4 text-muted-foreground">
                            Add your professional experience to showcase your career journey.
                          </p>

                          {/* Simple experience editor - can be expanded later */}
                          {portfolio.sectionContent.experience?.items && portfolio.sectionContent.experience.items.length > 0 ? (
                            <div className="space-y-4 mb-4">
                              {portfolio.sectionContent.experience.items.map((item, index) => (
                                <div key={index} className="p-4 border rounded-md">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <h4 className="font-medium">{item.title}</h4>
                                      <p className="text-sm text-muted-foreground">{item.company}</p>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const updatedItems = [...portfolio.sectionContent.experience!.items];
                                        updatedItems.splice(index, 1);
                                        handleSectionContentChange('experience', {
                                          items: updatedItems
                                        });
                                      }}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-center text-muted-foreground mb-4">No experience added yet</p>
                          )}

                          <div className="flex justify-center">
                            <Button
                              onClick={() => {
                                // Initialize with sample data for now
                                const newItem = {
                                  id: Date.now().toString(),
                                  title: "Job Title",
                                  company: "Company Name",
                                  location: "Location",
                                  startDate: new Date().toISOString(),
                                  current: true,
                                  description: "Describe your responsibilities and achievements"
                                };

                                const currentItems = portfolio.sectionContent.experience?.items || [];
                                handleSectionContentChange('experience', {
                                  items: [...currentItems, newItem]
                                });
                              }}
                            >
                              Add Experience
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                    )}

                    {/* Other template-specific sections */}
                    {portfolio.settings.layout?.sections?.filter(s =>
                      !['about', 'projects', 'skills', 'gallery', 'contact', 'experience'].includes(s)
                    ).map((section) => (
                      <TabsContent key={section} value={section} className="h-96 flex items-center justify-center border rounded-md">
                        <div className="text-center">
                          <h3 className="text-lg font-medium capitalize mb-2">{section} Section</h3>
                          <p className="text-muted-foreground">
                            This section editor is coming soon. Edit your {section} content here.
                          </p>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-6">
                  <Button
                    variant="outline"
                    onClick={saveAsDraft}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4 mr-2"
                        >
                          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                          <polyline points="17 21 17 13 7 13 7 21" />
                          <polyline points="7 3 7 8 15 8" />
                        </svg>
                        Save as Draft
                      </>
                    )}
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                    onClick={publishPortfolio}
                    disabled={loading || !portfolio.subdomain}
                  >
                    {loading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2"></div>
                        Publishing...
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4 mr-2"
                        >
                          <path d="M21 2H3v16h5v4l4-4h4l5-5V2zM16 11H8V8h8v3z" />
                        </svg>
                        Publish Portfolio
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

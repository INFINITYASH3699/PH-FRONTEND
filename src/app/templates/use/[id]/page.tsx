'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
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
import { useSession } from 'next-auth/react';
import ProjectsEditor from './ProjectsEditor';
import SkillsEditor from './SkillsEditor';

// Same template data from the preview page
const templates = [
  {
    id: 'developer-1',
    name: 'Modern Developer',
    category: 'developer',
    description: 'A clean and modern template for developers and programmers.',
    longDescription: 'This template is perfect for developers who want to showcase their coding projects, skills, and experience. It includes sections for your bio, projects, skills, experience, education, and contact information. The clean and modern design makes it easy to navigate and highlights your work effectively.',
    image: 'https://repository-images.githubusercontent.com/616351992/41fb4d77-8bcc-4f2f-a5af-56c0e41e07c4',
    features: [
      'Projects showcase with GitHub integration',
      'Skills section with proficiency indicators',
      'Timeline for work experience and education',
      'Dark and light mode support',
      'Responsive design for all devices',
      'Blog section for technical articles',
      'Contact form with validation',
    ],
    layouts: 10,
    isPremium: false,
    sections: [
      'header',
      'about',
      'projects',
      'skills',
      'experience',
      'education',
      'contact',
      'blog'
    ]
  },
  {
    id: 'designer-1',
    name: 'Creative Studio',
    category: 'designer',
    description: 'Perfect for graphic designers, illustrators and creative professionals.',
    longDescription: 'Designed with creatives in mind, this template puts your visual work front and center. The sleek gallery layouts and minimal design ensure your portfolio pieces get all the attention they deserve. Ideal for graphic designers, illustrators, photographers, and other visual artists who want to showcase their creative work.',
    image: 'https://weandthecolor.com/wp-content/uploads/2020/09/A-modern-and-fresh-portfolio-template-for-Adobe-InDesign.jpg',
    features: [
      'Fullscreen gallery with various layout options',
      'Project case study pages',
      'Client testimonial section',
      'Animated transitions between pages',
      'Instagram feed integration',
      'Contact form with file upload',
      'Custom cursor options',
    ],
    layouts: 8,
    isPremium: false,
    sections: [
      'header',
      'about',
      'gallery',
      'work',
      'clients',
      'testimonials',
      'contact',
    ]
  },
  {
    id: 'photographer-1',
    name: 'Photo Gallery',
    category: 'photographer',
    description: 'A stunning template for photographers to display their work.',
    longDescription: 'Designed specifically for photographers, this template allows you to showcase your photography portfolio with beautiful high-resolution galleries. The minimal design puts the focus on your images while providing intuitive navigation and a professional presentation that will impress potential clients.',
    image: 'https://marketplace.canva.com/EAFwckKNjDE/2/0/1600w/canva-black-white-grayscale-portfolio-presentation-vzScEqAI__M.jpg',
    features: [
      'Fullscreen photo galleries',
      'Multiple portfolio categories',
      'Image lightbox with zoom capability',
      'Password-protected client galleries',
      'Photo metadata display',
      'Print store integration',
      'Photo shoot booking system',
    ],
    layouts: 12,
    isPremium: false,
    sections: [
      'header',
      'about',
      'galleries',
      'categories',
      'services',
      'pricing',
      'contact',
    ]
  },
];

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

export default function PortfolioEditorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session, status } = useSession();

  // Find the template by ID
  const template = templates.find(t => t.id === params.id);

  // If template not found, return 404
  if (!template) {
    notFound();
  }

  // Portfolio state
  const [portfolio, setPortfolio] = useState<Portfolio>({
    templateId: template.id,
    title: 'My Portfolio',
    subtitle: 'Web Developer',
    subdomain: '',
    isPublished: false,
    settings: {
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        background: '#ffffff',
        text: '#111827',
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter',
      },
      layout: {
        sections: template.sections,
        showHeader: true,
        showFooter: true,
      },
    },
    sectionContent: {
      about: {
        title: 'About Me',
        bio: 'I am a passionate developer with 5+ years of experience in building web applications. I specialize in React, Node.js, and TypeScript.',
        profileImage: '',
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
        email: '',
        phone: '',
        address: '',
        showContactForm: true,
      },
      gallery: {
        items: [],
      },
    },
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('about');
  const [portfolioId, setPortfolioId] = useState<string | null>(null);

  // Effect to set username as subdomain if authenticated
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.username) {
      setPortfolio(prev => ({
        ...prev,
        subdomain: session.user.username as string,
      }));
    }
  }, [status, session]);

  // Handle text input changes
  const handleInputChange = (field: string, value: string) => {
    setPortfolio(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle nested settings changes
  const handleSettingsChange = (
    category: 'colors' | 'fonts' | 'layout',
    field: string,
    value: string | boolean | string[]
  ) => {
    setPortfolio(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [category]: {
          ...prev.settings[category],
          [field]: value,
        },
      },
    }));
  };

  // Handle section content changes
  const handleSectionContentChange = (
    section: string,
    content: any
  ) => {
    setPortfolio(prev => ({
      ...prev,
      sectionContent: {
        ...prev.sectionContent,
        [section]: content,
      },
    }));

    // If portfolio already exists, update section content immediately
    if (portfolioId) {
      updateSectionContent(section, content);
    }
  };

  // Update a specific section content
  const updateSectionContent = async (section: string, content: any) => {
    if (!portfolioId || !session?.user) return;

    try {
      const response = await fetch('/api/portfolio/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          portfolioId: portfolioId,
          sectionType: section,
          content: content,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        toast.error(data.error || `Failed to update ${section} section`);
      }
    } catch (error) {
      console.error(`Error updating ${section} section:`, error);
      toast.error('An unexpected error occurred');
    }
  };

  // Handle file upload for profile image
  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'portfolios/profile');

    try {
      setLoading(true);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        const updatedAboutContent = {
          ...portfolio.sectionContent.about,
          profileImage: data.url,
        };

        handleSectionContentChange('about', updatedAboutContent);
        toast.success('Profile image uploaded');
      } else {
        toast.error(data.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Save portfolio as draft
  const saveAsDraft = async () => {
    if (!session?.user) {
      toast('Please sign in to save your portfolio');
      return;
    }

    setLoading(true);

    try {
      const method = portfolioId ? 'PATCH' : 'POST';
      const endpoint = '/api/portfolios';
      const body = portfolioId
        ? { id: portfolioId, ...portfolio, isPublished: false }
        : { ...portfolio, isPublished: false };

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        // If this is a new portfolio, store the ID
        if (!portfolioId && data.portfolio?._id) {
          setPortfolioId(data.portfolio._id);
        }

        toast.success('Portfolio saved as draft');
      } else {
        toast.error(data.error || 'Failed to save portfolio');
      }
    } catch (error) {
      console.error('Error saving portfolio:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Publish portfolio
  const publishPortfolio = async () => {
    if (!session?.user) {
      toast('Please sign in to publish your portfolio');
      return;
    }

    setLoading(true);

    try {
      const method = portfolioId ? 'PATCH' : 'POST';
      const endpoint = '/api/portfolios';
      const body = portfolioId
        ? { id: portfolioId, ...portfolio, isPublished: true }
        : { ...portfolio, isPublished: true };

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        // If this is a new portfolio, store the ID
        if (!portfolioId && data.portfolio?._id) {
          setPortfolioId(data.portfolio._id);
        }

        toast.success('Portfolio published successfully');
        router.push(`/portfolio/${portfolio.subdomain}`);
      } else {
        toast.error(data.error || 'Failed to publish portfolio');
      }
    } catch (error) {
      console.error('Error publishing portfolio:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Preview the portfolio in a new tab
  const previewPortfolio = async () => {
    // First save the portfolio as a draft
    await saveAsDraft();

    // Then open the preview in a new tab
    window.open(`/portfolio/${portfolio.subdomain}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      <main className="flex-grow py-8">
        <div className="container px-4 md:px-6">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Customize Your Portfolio</h1>
              <p className="text-muted-foreground">
                You're using the {template.name} template. Customize it to make it your own.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={previewPortfolio}
                disabled={loading}
              >
                Preview
              </Button>
              <Button
                className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                onClick={publishPortfolio}
                disabled={loading}
              >
                {loading ? 'Publishing...' : 'Publish'}
              </Button>
            </div>
          </div>

          {/* Main Editor */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
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
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-sm text-muted-foreground">
                          .portfoliohub.com
                        </div>
                      </div>
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
                        {template.sections.map((section) => (
                          <div key={section} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
                            <span className="capitalize">{section}</span>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`section-${section}`}
                                checked={portfolio.settings.layout?.sections?.includes(section) || false}
                                onCheckedChange={(checked) => {
                                  const currentSections = portfolio.settings.layout?.sections || [];
                                  const newSections = checked
                                    ? [...currentSections, section]
                                    : currentSections.filter(s => s !== section);

                                  handleSettingsChange('layout', 'sections', newSections);
                                }}
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

                    {/* Other Sections - To be implemented */}
                    {portfolio.settings.layout?.sections?.filter(s => !['about', 'projects', 'skills'].includes(s)).map((section) => (
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
                    {loading ? 'Saving...' : 'Save as Draft'}
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                    onClick={publishPortfolio}
                    disabled={loading}
                  >
                    {loading ? 'Publishing...' : 'Publish Portfolio'}
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

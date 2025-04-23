'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import TemplateRenderer from '@/components/template-renderer/TemplateRenderer';
import EditorSidebar from './EditorSidebar';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';
import { FetchProfileButton } from '@/components/ui/fetch-profile-button';
import { Expand, Shrink, Laptop, Tablet, Smartphone } from 'lucide-react';

interface TemplateEditorClientProps {
  template: any;
  user: any;
  id: string;
}

export default function TemplateEditorClient({ template, user, id }: TemplateEditorClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const portfolioIdParam = searchParams.get('portfolioId');

  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [updatedTemplate, setUpdatedTemplate] = useState(template);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // State for UI interactions
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [savedPortfolioId, setSavedPortfolioId] = useState<string | null>(null);

  // New state for section ordering
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);

  // Add state for fullscreen mode
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Set isClient to true when component mounts and check authentication
  useEffect(() => {
    setIsClient(true);

    // Check authentication status
    const token = apiClient.getToken?.();
    const currentUser = apiClient.getUser?.();

    if (token && currentUser) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      toast.error('You are not logged in. Please log in to save or publish your portfolio.');
    }
  }, []);

  // Initialize portfolio data on mount, only if authenticated
  useEffect(() => {
    if (!isClient) return;

    // Only allow portfolio editing if authenticated
    if (!isAuthenticated) {
      setError("You must be logged in to use the template editor.");
      setLoading(false);
      return;
    }

    try {
      if (!template) {
        setError("Template data is missing");
        setLoading(false);
        return;
      }

      const initializePortfolio = async () => {
        // Check if we have a portfolioId parameter (editing existing portfolio)
        if (portfolioIdParam) {
          try {
            const token = apiClient.getToken?.();

            const response = await apiClient.request<{
              success: boolean;
              portfolio: any;
            }>(`/portfolios/${portfolioIdParam}`, "GET");

            if (response && response.success && response.portfolio) {
              setPortfolio(response.portfolio);
              setSavedPortfolioId(response.portfolio._id);

              // Ensure the section order is loaded from the portfolio or set from template
              const portfolioSectionOrder = response.portfolio.sectionOrder || [];
              if (portfolioSectionOrder.length > 0) {
                setSectionOrder(portfolioSectionOrder);
              } else {
                // If portfolio doesn't have section order, set it from template
                const templateSections = template.layouts?.[0]?.structure?.sections ||
                  template.defaultStructure?.layout?.sections || [];
                setSectionOrder(templateSections);
              }

              setLoading(false);
              return;
            } else {
              toast.error('Failed to load your existing portfolio. Creating a new one instead.');
            }
          } catch (err) {
            toast.error('Failed to load your existing portfolio. Creating a new one instead.');
          }
        }

        // If we don't have a portfolioId or failed to fetch it, create a new one
        const generateSubdomain = () => {
          const username =
            user?.username ||
            user?.name?.toLowerCase().replace(/\s+/g, '') ||
            '';
          const timestamp = new Date().getTime().toString().slice(-4);
          return `${username}${timestamp}`;
        };

        // Determine default section order from template
        let defaultSectionOrder: string[] = [];
        if (template.layouts && template.layouts.length > 0) {
          const mainLayout = template.layouts[0];
          defaultSectionOrder = mainLayout?.structure?.sections || [];
        } else if (template.defaultStructure?.layout?.sections) {
          defaultSectionOrder = template.defaultStructure.layout.sections;
        }

        console.log('Template sections:', defaultSectionOrder);
        console.log('Template definition:', {
          layouts: template.layouts,
          defaultStructure: template.defaultStructure,
          sectionDefinitions: template.sectionDefinitions
        });

        // Prepare initial content based on section definitions
        const initialContent: Record<string, any> = {
          // Default required sections
          header: {
            title: user?.name || 'Your Name',
            subtitle:
              template.category === 'developer'
                ? 'Software Developer'
                : template.category === 'designer'
                ? 'Creative Designer'
                : template.category === 'photographer'
                ? 'Professional Photographer'
                : 'Professional Portfolio',
            profileImage: '',
            navigation: ['About', 'Projects', 'Experience', 'Contact'],
          },
          about: {
            title: 'About Me',
            bio: 'Welcome to my portfolio. Here you can share your professional background, experience, and what makes you unique.',
            variant:
              template.category === 'designer'
                ? 'with-image'
                : template.category === 'developer'
                ? 'with-highlights'
                : 'standard',
            highlights: [
              { title: 'My Expertise', description: 'Describe your main area of expertise.' },
              { title: 'Experience', description: 'Highlight your years of experience or key skills.' },
              { title: 'Education', description: 'Share your educational background.' },
            ],
          },
          seo: {
            title: 'My Portfolio | Professional Website',
            description: 'Welcome to my professional portfolio showcasing my work and experience.',
            keywords: 'portfolio, professional, skills, projects',
          },
          socialLinks: {
            github: '',
            linkedin: '',
            twitter: '',
            instagram: '',
          },
        };

        // Add template-specific section content from section definitions
        if (template.sectionDefinitions) {
          Object.entries(template.sectionDefinitions).forEach(([sectionType, definition]) => {
            // Skip already populated sections
            if (!initialContent[sectionType] && definition.defaultData) {
              initialContent[sectionType] = { ...definition.defaultData };
            }
          });
        }

        // Create initial portfolio data
        const initialPortfolioData = {
          _id: 'new-portfolio',
          title: 'My New Portfolio',
          subtitle: 'Created with Portfolio Hub',
          subdomain: generateSubdomain(),
          templateId: template._id,
          userId: user?.id || 'guest-user',
          content: initialContent,
          activeLayout: template.layouts?.[0]?.id || 'default',
          activeColorScheme: template.themeOptions?.colorSchemes?.[0]?.id || 'default',
          activeFontPairing: template.themeOptions?.fontPairings?.[0]?.id || 'default',
          customColors: null,
          sectionOrder: defaultSectionOrder,
        };

        setPortfolio(initialPortfolioData);
        setSectionOrder(defaultSectionOrder);
        setLoading(false);
      };

      initializePortfolio();
    } catch (err) {
      setError("Failed to initialize template editor.");
      setLoading(false);
    }
  }, [template, user, isAuthenticated, isClient, portfolioIdParam]);

  // Initialize section order when template/portfolio changes
  useEffect(() => {
    if (!isClient || !template || !portfolio) return;

    const activeLayoutId = portfolio.activeLayout || (template.layouts?.[0]?.id || 'default');
    const activeLayout = template.layouts?.find(l => l.id === activeLayoutId) || template.layouts?.[0];

    const layoutSections = activeLayout?.structure?.sections ||
      template.defaultStructure?.layout?.sections || [];

    if (portfolio.sectionOrder && portfolio.sectionOrder.length > 0) {
      setSectionOrder(portfolio.sectionOrder);
    } else if (layoutSections.length > 0) {
      setSectionOrder(layoutSections);
      // Also update portfolio with proper section order
      setPortfolio(prev => ({
        ...prev,
        sectionOrder: layoutSections
      }));
    }
  }, [isClient, template, portfolio]);

  // Handler for section updates
  const handleSectionUpdate = (sectionId: string, data: any) => {
    if (!portfolio) return;

    setPortfolio((prev: any) => ({
      ...prev,
      content: {
        ...prev.content,
        [sectionId]: data,
      },
    }));

    setIsSaved(false);
  };

  // Handler for theme selection
  const handleThemeSelect = (colorSchemeId: string, fontPairingId: string) => {
    if (!portfolio) return;

    setPortfolio((prev: any) => ({
      ...prev,
      activeColorScheme: colorSchemeId,
      activeFontPairing: fontPairingId,
    }));

    setIsSaved(false);
  };

  // Handler for layout selection
  const handleLayoutSelect = (layoutId: string) => {
    if (!portfolio) return;

    // When layout changes, update section order to match new layout's default
    const newLayout = template.layouts?.find((l: any) => l.id === layoutId);
    const newSectionOrder = newLayout?.structure?.sections || [];

    setPortfolio((prev: any) => ({
      ...prev,
      activeLayout: layoutId,
      sectionOrder: newSectionOrder,
    }));

    setSectionOrder(newSectionOrder);
    setIsSaved(false);
  };

  // Handler for custom CSS updates
  const handleCustomCssUpdate = (css: string) => {
    if (!portfolio) return;

    setPortfolio((prev: any) => ({
      ...prev,
      content: {
        ...prev.content,
        customCss: css,
      },
    }));

    setIsSaved(false);
  };

  // Handler for section reordering
  const handleSectionReorder = (newOrder: string[]) => {
    if (!portfolio) return;

    setPortfolio((prev: any) => ({
      ...prev,
      sectionOrder: newOrder,
    }));

    setSectionOrder(newOrder);
    setIsSaved(false);
  };

  // Update the handleSaveDraft function to properly prepare portfolio data
  const handleSaveDraft = async () => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to save your portfolio');
      return;
    }

    if (!portfolio) {
      toast.error('No portfolio data to save');
      return;
    }

    setIsSaving(true);
    setIsSaved(false);

    try {
      const currentUser = apiClient.getUser?.();
      const userId = currentUser?._id || user?.id;

      if (!userId) {
        throw new Error('User ID is missing');
      }

      const portfolioToSave = {
        ...portfolio,
        userId: userId,
        templateId: template._id,
        title: portfolio.title || 'My Portfolio',
        subtitle: portfolio.subtitle || '',
        subdomain: portfolio.subdomain || `user-${Date.now().toString().slice(-8)}`,
        isPublished: false,
        sectionOrder: sectionOrder,
      };

      if (process.env.NODE_ENV === 'development') {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      const response = await apiClient.portfolios.saveDraft(portfolioToSave);

      if (response && response.portfolio) {
        setSavedPortfolioId(response.portfolio._id);
        setPortfolio((prev: any) => ({
          ...prev,
          _id: response.portfolio._id,
        }));
        setIsSaved(true);
        toast.success('Portfolio saved as draft!');
      } else {
        throw new Error('Failed to save portfolio');
      }
    } catch (err: any) {
      let errorMessage = 'Failed to save portfolio. Please try again.';

      if (err.message?.includes('already have a portfolio with this template')) {
        errorMessage = 'You already have a portfolio with this template. Please use the Edit button on the templates page to modify your existing portfolio.';
        setTimeout(() => {
          router.push('/templates');
        }, 3000);
      } else if (err.message?.includes('subdomain is already taken')) {
        errorMessage = 'This subdomain is already taken. Please choose a different subdomain in the SEO section.';
      } else if (err.message?.includes('User ID is missing')) {
        errorMessage = 'Your user information could not be found. Please try logging out and logging back in.';
      }

      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Handler for publishing portfolio
  const handlePublish = async () => {
    if (!portfolio) return;
    if (!isAuthenticated) {
      toast.error('You must be logged in to publish your portfolio.');
      return;
    }

    try {
      setIsPublishing(true);

      if (!savedPortfolioId) {
        await handleSaveDraft();
      }

      const currentUser = apiClient.getUser?.();
      const userId = currentUser?._id || user?.id;

      if (!userId) {
        throw new Error('User ID is missing');
      }

      const portfolioToPublish = {
        ...portfolio,
        userId: userId,
        templateId: template._id,
        title: portfolio.title || 'My Portfolio',
        subtitle: portfolio.subtitle || '',
        subdomain: portfolio.subdomain || `user-${Date.now().toString().slice(-8)}`,
        isPublished: true,
        sectionOrder: sectionOrder,
      };

      if (process.env.NODE_ENV === 'development') {
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }

      const response = await apiClient.portfolios.publish(portfolioToPublish);

      if (response && response.portfolio) {
        setSavedPortfolioId(response.portfolio._id);
        setPortfolio((prev: any) => ({
          ...prev,
          _id: response.portfolio._id,
          isPublished: true,
        }));

        toast.success('Portfolio published successfully!');

        setTimeout(() => {
          router.push(`/portfolio/${response.portfolio.subdomain}`);
        }, 1500);
      } else {
        throw new Error('Failed to publish portfolio');
      }
    } catch (err) {
      toast.error('Failed to publish portfolio. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Handler for previewing the portfolio
  const handlePreview = async () => {
    if (!portfolio) return;
    if (!isAuthenticated) {
      toast.error('You must be logged in to preview your portfolio.');
      return;
    }

    setIsPreviewing(true);

    try {
      if (!savedPortfolioId) {
        await handleSaveDraft();
      }

      if (savedPortfolioId) {
        window.open(`/portfolio/preview/${savedPortfolioId}`, '_blank');
      } else {
        throw new Error('Failed to generate preview');
      }
    } catch (err) {
      toast.error('Failed to generate preview. Please try again.');
    } finally {
      setIsPreviewing(false);
    }
  };

  // Function to fetch profile data and populate the template
  const fetchProfileData = async () => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to fetch your profile data.');
      return;
    }

    try {
      const response = await apiClient.user.getProfile();

      if (!response || !response.user) {
        throw new Error('Failed to fetch profile data: Invalid API response');
      }

      const profileData = response.user;

      if (!profileData.profile || Object.keys(profileData.profile).length === 0) {
        toast.warning('Your profile is empty. Please add information to your profile first.');
        return;
      }

      let updatedFields: string[] = [];

      setPortfolio(prev => {
        if (!prev) return prev;
        let updatedPortfolio = { ...prev };

        // Update header section
        if (profileData.fullName) {
          updatedPortfolio.content = {
            ...updatedPortfolio.content,
            header: {
              ...updatedPortfolio.content?.header,
              title: profileData.fullName,
            }
          };
          updatedFields.push('name');
        }

        // Update about section if profile bio exists
        if (profileData.profile?.bio) {
          updatedPortfolio.content = {
            ...updatedPortfolio.content,
            about: {
              ...updatedPortfolio.content?.about,
              bio: profileData.profile.bio,
            }
          };
          updatedFields.push('bio');
        }

        // Update skills section if profile skills exist
        if (profileData.profile?.skills && profileData.profile.skills.length > 0) {
          updatedPortfolio.content = {
            ...updatedPortfolio.content,
            skills: {
              ...updatedPortfolio.content?.skills,
              items: profileData.profile.skills.map((skill: any) => ({
                name: skill.name,
                level: skill.level || 80,
                category: skill.category || 'Technical'
              }))
            }
          };
          updatedFields.push('skills');
        }

        // Update experience section if profile experience exists
        if (profileData.profile?.experience && profileData.profile.experience.length > 0) {
          updatedPortfolio.content = {
            ...updatedPortfolio.content,
            experience: {
              ...updatedPortfolio.content?.experience,
              items: profileData.profile.experience.map((exp: any) => ({
                title: exp.title,
                company: exp.company,
                location: exp.location,
                startDate: exp.startDate,
                endDate: exp.endDate,
                current: exp.current,
                description: exp.description
              }))
            }
          };
          updatedFields.push('experience');
        }

        // Update education section if profile education exists
        if (profileData.profile?.education && profileData.profile.education.length > 0) {
          updatedPortfolio.content = {
            ...updatedPortfolio.content,
            education: {
              ...updatedPortfolio.content?.education,
              items: profileData.profile.education.map((edu: any) => ({
                degree: edu.degree,
                institution: edu.institution,
                location: edu.location,
                startDate: edu.startDate,
                endDate: edu.endDate,
                current: edu.current,
                description: edu.description
              }))
            }
          };
          updatedFields.push('education');
        }

        // Update projects section if profile projects exist
        if (profileData.profile?.projects && profileData.profile.projects.length > 0) {
          updatedPortfolio.content = {
            ...updatedPortfolio.content,
            projects: {
              ...updatedPortfolio.content?.projects,
              items: profileData.profile.projects.map((project: any) => ({
                title: project.title,
                description: project.description,
                image: project.image,
                link: project.link,
                tags: project.tags
              }))
            }
          };
          updatedFields.push('projects');
        }

        // Update social links if profile social links exist
        if (profileData.profile?.socialLinks) {
          updatedPortfolio.content = {
            ...updatedPortfolio.content,
            socialLinks: profileData.profile.socialLinks
          };
          updatedFields.push('socialLinks');
        }

        // Update subtitle with user's title if available
        if (profileData.profile?.title) {
          updatedPortfolio.content = {
            ...updatedPortfolio.content,
            header: {
              ...updatedPortfolio.content?.header,
              subtitle: profileData.profile.title
            }
          };
          updatedFields.push('title');
        }

        setIsSaved(false);

        return updatedPortfolio;
      });

      if (updatedFields.length > 0) {
        toast.success(
          `Profile data imported successfully! Updated: ${updatedFields.join(', ')}.`
        );
      } else {
        toast.warning(
          'No new profile data was imported. Your profile may be missing key information.'
        );
      }
    } catch (error: any) {
      if (
        error?.message &&
        error.message.includes('Failed to fetch profile data: Invalid API response')
      ) {
        toast.error('Failed to fetch profile data from the server. Please try again later.');
      } else if (
        error?.response &&
        error.response.status === 401
      ) {
        toast.error('You are not authorized. Please log in again.');
      } else {
        toast.error(
          error?.message
            ? `Failed to fetch profile data: ${error.message}`
            : 'Failed to fetch profile data. Please try again.'
        );
      }
    }
  };

  // Add fullscreen toggle handler
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!isClient) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading template editor...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
          <p className="text-muted-foreground">Loading template editor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => router.push('/templates')}>
          Back to Templates
        </Button>
      </div>
    );
  }

  if (!portfolio) {
    return null;
  }

  const viewportClass =
    viewportMode === 'mobile'
      ? 'max-w-[375px] mx-auto border-x shadow-lg'
      : viewportMode === 'tablet'
      ? 'max-w-[768px] mx-auto border-x shadow-lg'
      : 'w-full';

  // If in fullscreen mode, render only the template preview
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-950 z-50 flex flex-col">
        {/* Fullscreen header */}
        <div className="p-4 flex justify-between items-center border-b bg-card">
          <h2 className="text-lg font-semibold">Preview Mode: {updatedTemplate.name}</h2>
          <div className="flex items-center gap-2">
            <div className="flex border rounded-md overflow-hidden mr-4">
              <button
                className={`px-3 py-1 text-sm ${viewportMode === 'desktop' ? 'bg-muted font-medium' : 'hover:bg-muted/50'}`}
                onClick={() => setViewportMode('desktop')}
                title="Desktop view"
              >
                <Laptop className="h-4 w-4" />
              </button>
              <button
                className={`px-3 py-1 text-sm ${viewportMode === 'tablet' ? 'bg-muted font-medium' : 'hover:bg-muted/50'}`}
                onClick={() => setViewportMode('tablet')}
                title="Tablet view"
              >
                <Tablet className="h-4 w-4" />
              </button>
              <button
                className={`px-3 py-1 text-sm ${viewportMode === 'mobile' ? 'bg-muted font-medium' : 'hover:bg-muted/50'}`}
                onClick={() => setViewportMode('mobile')}
                title="Mobile view"
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>
            <Button variant="outline" size="sm" onClick={toggleFullscreen}>
              <Shrink className="h-4 w-4 mr-2" />
              Exit Fullscreen
            </Button>
          </div>
        </div>
        {/* Fullscreen content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className={`bg-white dark:bg-gray-800 min-h-full ${viewportClass}`}>
            <TemplateRenderer
              template={updatedTemplate}
              portfolio={portfolio}
              editable={false}
              customColors={portfolio.customColors}
              sectionOrder={sectionOrder}
            />
          </div>
        </div>
      </div>
    );
  }

  // Regular view with sidebar
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Top navigation bar */}
      <div className="border-b bg-card shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/templates" className="text-muted-foreground hover:text-foreground">
              ← Back to Templates
            </Link>
            <h1 className="text-xl font-bold">{updatedTemplate.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <FetchProfileButton
                onFetch={fetchProfileData}
                variant="outline"
                size="sm"
                fetchText="Auto-fill from Profile"
                fetchingText="Fetching Profile Data..."
              />
            )}
            <div className="flex border rounded-md overflow-hidden">
              <button
                className={`px-3 py-1 text-sm ${viewportMode === 'desktop' ? 'bg-muted font-medium' : 'hover:bg-muted/50'}`}
                onClick={() => setViewportMode('desktop')}
                title="Desktop view"
              >
                <Laptop className="h-4 w-4" />
              </button>
              <button
                className={`px-3 py-1 text-sm ${viewportMode === 'tablet' ? 'bg-muted font-medium' : 'hover:bg-muted/50'}`}
                onClick={() => setViewportMode('tablet')}
                title="Tablet view"
              >
                <Tablet className="h-4 w-4" />
              </button>
              <button
                className={`px-3 py-1 text-sm ${viewportMode === 'mobile' ? 'bg-muted font-medium' : 'hover:bg-muted/50'}`}
                onClick={() => setViewportMode('mobile')}
                title="Mobile view"
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>
            <Button variant="outline" size="sm" onClick={toggleFullscreen} title="Fullscreen preview">
              <Expand className="h-4 w-4 mr-2" />
              Fullscreen
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        <EditorSidebar
          template={updatedTemplate}
          portfolio={portfolio}
          onUpdateSection={handleSectionUpdate}
          onUpdateLayout={handleLayoutSelect}
          onUpdateTheme={handleThemeSelect}
          onUpdateCustomCss={handleCustomCssUpdate}
          onSaveDraft={handleSaveDraft}
          onPreview={handlePreview}
          onPublish={handlePublish}
          onFetchProfile={isAuthenticated ? fetchProfileData : undefined}
          draftSaving={isSaving}
          draftSaved={isSaved}
          previewLoading={isPreviewing}
          publishLoading={isPublishing}
          sectionOrder={sectionOrder}
          onSectionReorder={handleSectionReorder}
        />

        {/* Main preview pane */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className={`bg-white dark:bg-gray-800 h-full ${viewportClass}`}>
            {/* Template preview */}
            <div className="pb-20">
              <TemplateRenderer
                template={updatedTemplate}
                portfolio={portfolio}
                editable={true}
                customColors={portfolio.customColors}
                sectionOrder={sectionOrder}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

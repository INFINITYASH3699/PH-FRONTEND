'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import TemplateRenderer from '@/components/template-renderer/TemplateRenderer';
import EditorSidebar from './EditorSidebar';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';
import { FetchProfileButton } from '@/components/ui/fetch-profile-button';

interface TemplateEditorClientProps {
  template: any;
  user: any;
  id: string;
}

export default function TemplateEditorClient({ template, user, id }: TemplateEditorClientProps) {
  const router = useRouter();
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

      // Generate a unique subdomain based on user and timestamp
      const generateSubdomain = () => {
        const username =
          user?.username ||
          user?.name?.toLowerCase().replace(/\s+/g, '') ||
          '';
        const timestamp = new Date().getTime().toString().slice(-4);
        return `${username}${timestamp}`;
      };

      // Create initial portfolio data
      const initialPortfolioData = {
        _id: 'new-portfolio',
        title: 'My New Portfolio',
        subtitle: 'Created with Portfolio Hub',
        subdomain: generateSubdomain(),
        templateId: template._id,
        userId: user?.id || 'guest-user',
        content: {
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
        },
        // Default theme settings
        activeLayout: template.layouts?.[0]?.id || 'default',
        activeColorScheme: template.themeOptions?.colorSchemes?.[0]?.id || 'default',
        activeFontPairing: template.themeOptions?.fontPairings?.[0]?.id || 'default',
        customColors: null,
      };

      setPortfolio(initialPortfolioData);
      setLoading(false);
    } catch (err) {
      console.error("Error initializing portfolio:", err);
      setError("Failed to initialize template editor.");
      setLoading(false);
    }
  }, [template, user, isAuthenticated, isClient]);

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

    setPortfolio((prev: any) => ({
      ...prev,
      activeLayout: layoutId,
    }));

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

  // Handler for saving portfolio as draft
  const handleSaveDraft = async () => {
    if (!portfolio) return;
    if (!isAuthenticated) {
      toast.error('You must be logged in to save your portfolio.');
      return;
    }

    try {
      setIsSaving(true);

      // Prepare portfolio data for saving
      const portfolioToSave = {
        ...portfolio,
        templateId: template._id,
      };

      // Simulate network delay in development mode for better UX testing
      if (process.env.NODE_ENV === 'development') {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      // Save portfolio as draft
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
    } catch (err) {
      console.error('Error saving portfolio draft:', err);
      toast.error('Failed to save portfolio. Please try again.');
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

      // First save as draft if not already saved
      if (!savedPortfolioId) {
        await handleSaveDraft();
      }

      const portfolioToPublish = {
        ...portfolio,
        templateId: template._id,
      };

      // Simulate network delay in development mode
      if (process.env.NODE_ENV === 'development') {
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }

      // Publish portfolio
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
      console.error('Error publishing portfolio:', err);
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
      // Save as draft first if not already saved
      if (!savedPortfolioId) {
        await handleSaveDraft();
      }

      if (savedPortfolioId) {
        window.open(`/portfolio/preview/${savedPortfolioId}`, '_blank');
      } else {
        throw new Error('Failed to generate preview');
      }
    } catch (err) {
      console.error('Error generating preview:', err);
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
        throw new Error('Failed to fetch profile data');
      }

      const profileData = response.user;

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
        }

        // Update social links if profile social links exist
        if (profileData.profile?.socialLinks) {
          updatedPortfolio.content = {
            ...updatedPortfolio.content,
            socialLinks: profileData.profile.socialLinks
          };
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
        }

        setIsSaved(false);

        return updatedPortfolio;
      });

      toast.success('Profile data imported successfully!');
    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast.error('Failed to fetch profile data. Please try again.');
    }
  };

  // Don't render anything during SSR to prevent hydration mismatches
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

  // Calculate viewport class based on selected mode
  const viewportClass =
    viewportMode === 'mobile'
      ? 'max-w-[375px] mx-auto border-x shadow-lg'
      : viewportMode === 'tablet'
      ? 'max-w-[768px] mx-auto border-x shadow-lg'
      : 'w-full';

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
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <rect width="20" height="14" x="2" y="3" rx="2" />
                  <line x1="2" x2="22" y1="20" y2="20" />
                </svg>
              </button>
              <button
                className={`px-3 py-1 text-sm ${viewportMode === 'tablet' ? 'bg-muted font-medium' : 'hover:bg-muted/50'}`}
                onClick={() => setViewportMode('tablet')}
                title="Tablet view"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <rect width="14" height="18" x="5" y="3" rx="2" />
                  <line x1="9" x2="15" y1="21" y2="21" />
                </svg>
              </button>
              <button
                className={`px-3 py-1 text-sm ${viewportMode === 'mobile' ? 'bg-muted font-medium' : 'hover:bg-muted/50'}`}
                onClick={() => setViewportMode('mobile')}
                title="Mobile view"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <rect width="10" height="18" x="7" y="3" rx="2" />
                  <line x1="11" x2="13" y1="21" y2="21" />
                </svg>
              </button>
            </div>
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
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

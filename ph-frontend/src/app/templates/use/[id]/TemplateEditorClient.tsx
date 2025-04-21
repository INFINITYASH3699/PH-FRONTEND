'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import TemplateRenderer from '@/components/template-renderer/TemplateRenderer';
import EditorSidebar from './EditorSidebar';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';

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

  // State for UI interactions
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [savedPortfolioId, setSavedPortfolioId] = useState<string | null>(null);

  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize portfolio data on mount
  useEffect(() => {
    try {
      if (!template) {
        setError("Template data is missing");
        setLoading(false);
        return;
      }

      // Generate a unique subdomain based on user and timestamp
      const generateSubdomain = () => {
        const username = user?.username || user?.name?.toLowerCase().replace(/\s+/g, '') || '';
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
            subtitle: template.category === 'developer'
              ? 'Software Developer'
              : template.category === 'designer'
              ? 'Creative Designer'
              : template.category === 'photographer'
              ? 'Professional Photographer'
              : 'Professional Portfolio',
            profileImage: '',
            navigation: ['About', 'Projects', 'Experience', 'Contact']
          },
          about: {
            title: 'About Me',
            bio: 'Welcome to my portfolio. Here you can share your professional background, experience, and what makes you unique.',
            variant: template.category === 'designer' ? 'with-image' :
                    template.category === 'developer' ? 'with-highlights' : 'standard',
            highlights: [
              { title: 'My Expertise', description: 'Describe your main area of expertise.' },
              { title: 'Experience', description: 'Highlight your years of experience or key skills.' },
              { title: 'Education', description: 'Share your educational background.' }
            ]
          },
          seo: {
            title: 'My Portfolio | Professional Website',
            description: 'Welcome to my professional portfolio showcasing my work and experience.',
            keywords: 'portfolio, professional, skills, projects'
          },
          socialLinks: {
            github: '',
            linkedin: '',
            twitter: '',
            instagram: ''
          }
        },
        // Default theme settings
        activeLayout: template.layouts?.[0]?.id || 'default',
        activeColorScheme: template.themeOptions?.colorSchemes?.[0]?.id || 'default',
        activeFontPairing: template.themeOptions?.fontPairings?.[0]?.id || 'default',
        customColors: null
      };

      setPortfolio(initialPortfolioData);
      setLoading(false);
    } catch (err) {
      console.error("Error initializing portfolio:", err);
      setError("Failed to initialize template editor.");
      setLoading(false);
    }
  }, [template, user]);

  // Handler for section updates
  const handleSectionUpdate = (sectionId: string, data: any) => {
    if (!portfolio) return;

    setPortfolio(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [sectionId]: data
      }
    }));

    // Clear saved status when changes are made
    setIsSaved(false);
  };

  // Handler for theme selection
  const handleThemeSelect = (colorSchemeId: string, fontPairingId: string) => {
    if (!portfolio) return;

    setPortfolio(prev => ({
      ...prev,
      activeColorScheme: colorSchemeId,
      activeFontPairing: fontPairingId,
    }));

    // Clear saved status when changes are made
    setIsSaved(false);
  };

  // Handler for layout selection
  const handleLayoutSelect = (layoutId: string) => {
    if (!portfolio) return;

    setPortfolio(prev => ({
      ...prev,
      activeLayout: layoutId,
    }));

    // Clear saved status when changes are made
    setIsSaved(false);
  };

  // Handler for custom CSS updates
  const handleCustomCssUpdate = (css: string) => {
    if (!portfolio) return;

    setPortfolio(prev => ({
      ...prev,
      content: {
        ...prev.content,
        customCss: css
      }
    }));

    // Clear saved status when changes are made
    setIsSaved(false);
  };

  // Handler for saving portfolio as draft
  const handleSaveDraft = async () => {
    if (!portfolio) return;

    try {
      setIsSaving(true);

      // Prepare portfolio data for saving
      const portfolioToSave = {
        ...portfolio,
        // Make sure we have the template ID
        templateId: template._id,
      };

      // Simulate network delay in development mode for better UX testing
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // Save portfolio as draft
      const response = await apiClient.portfolios.saveDraft(portfolioToSave);

      // Update the portfolio state with the saved data
      if (response && response.portfolio) {
        setSavedPortfolioId(response.portfolio._id);
        setPortfolio(prev => ({
          ...prev,
          _id: response.portfolio._id
        }));
        setIsSaved(true);
        toast.success("Portfolio saved as draft!");
      } else {
        throw new Error("Failed to save portfolio");
      }
    } catch (err) {
      console.error("Error saving portfolio draft:", err);
      toast.error("Failed to save portfolio. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handler for publishing portfolio
  const handlePublish = async () => {
    if (!portfolio) return;

    try {
      setIsPublishing(true);

      // First save as draft if not already saved
      if (!savedPortfolioId) {
        await handleSaveDraft();
      }

      // Prepare portfolio data for publishing
      const portfolioToPublish = {
        ...portfolio,
        // Make sure we have the template ID
        templateId: template._id,
      };

      // Simulate network delay in development mode for better UX testing
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 1200));
      }

      // Publish portfolio
      const response = await apiClient.portfolios.publish(portfolioToPublish);

      // Update the portfolio state with the published data
      if (response && response.portfolio) {
        setSavedPortfolioId(response.portfolio._id);
        setPortfolio(prev => ({
          ...prev,
          _id: response.portfolio._id,
          isPublished: true
        }));

        toast.success("Portfolio published successfully!");

        // Navigate to the published portfolio
        setTimeout(() => {
          router.push(`/portfolio/${response.portfolio.subdomain}`);
        }, 1500);
      } else {
        throw new Error("Failed to publish portfolio");
      }
    } catch (err) {
      console.error("Error publishing portfolio:", err);
      toast.error("Failed to publish portfolio. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  // Handler for previewing the portfolio
  const handlePreview = async () => {
    if (!portfolio) return;

    setIsPreviewing(true);

    try {
      // Save as draft first if not already saved
      if (!savedPortfolioId) {
        await handleSaveDraft();
      }

      if (savedPortfolioId) {
        window.open(`/portfolio/preview/${savedPortfolioId}`, '_blank');
      } else {
        throw new Error("Failed to generate preview");
      }
    } catch (err) {
      console.error("Error generating preview:", err);
      toast.error("Failed to generate preview. Please try again.");
    } finally {
      setIsPreviewing(false);
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
    viewportMode === 'mobile' ? 'max-w-[375px] mx-auto border-x shadow-lg' :
    viewportMode === 'tablet' ? 'max-w-[768px] mx-auto border-x shadow-lg' :
    'w-full';

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
        {/* Editor sidebar - contains all the editing tools */}
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

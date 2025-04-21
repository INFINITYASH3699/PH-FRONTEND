'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TemplateRenderer from '@/components/template-renderer/TemplateRenderer';
import EditorSidebar from './EditorSidebar';
import ThemeSelector from './ThemeSelector';
import LayoutSelector from './LayoutSelector';
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
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
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

  // Handler for theme selection
  const handleThemeSelect = (colorSchemeId: string, fontPairingId: string) => {
    if (!portfolio) return;

    setPortfolio(prev => ({
      ...prev,
      activeColorScheme: colorSchemeId,
      activeFontPairing: fontPairingId,
    }));
  };

  // Handler for layout selection
  const handleLayoutSelect = (layoutId: string) => {
    if (!portfolio) return;

    setPortfolio(prev => ({
      ...prev,
      activeLayout: layoutId,
    }));
  };

  // Handler for custom colors
  const handleCustomColorsChange = (schemeId: string, updatedColors: any) => {
    if (!portfolio) return;

    setPortfolio(prev => ({
      ...prev,
      customColors: updatedColors
    }));
  };

  // Handler for saving a custom color scheme
  const handleSaveCustomColorScheme = (name: string, colors: any) => {
    if (!updatedTemplate || !portfolio) return;

    // Create a unique, stable ID for the custom scheme
    const customSchemeId = `custom-${name.toLowerCase().replace(/\s+/g, '-')}`;

    // In a real app, this would call an API to save the custom scheme
    const newScheme = {
      id: customSchemeId,
      name,
      colors
    };

    // Update the template state
    setUpdatedTemplate(prev => ({
      ...prev,
      themeOptions: {
        ...prev.themeOptions,
        colorSchemes: [...(prev.themeOptions?.colorSchemes || []), newScheme]
      }
    }));

    // Switch to the new scheme
    setPortfolio(prev => ({
      ...prev,
      activeColorScheme: customSchemeId,
      customColors: null // Reset custom colors when using a saved scheme
    }));
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

      // Save portfolio as draft
      const response = await apiClient.portfolios.saveDraft(portfolioToSave);

      // Update the portfolio state with the saved data
      if (response && response.portfolio) {
        setSavedPortfolioId(response.portfolio._id);
        setPortfolio(prev => ({
          ...prev,
          _id: response.portfolio._id
        }));
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

      // Prepare portfolio data for publishing
      const portfolioToPublish = {
        ...portfolio,
        // Make sure we have the template ID
        templateId: template._id,
      };

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
  const handlePreview = () => {
    if (savedPortfolioId) {
      window.open(`/portfolio/preview/${savedPortfolioId}`, '_blank');
    } else {
      toast.info("Please save your portfolio as a draft first to preview it");
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
        <p>Loading template editor...</p>
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

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top navigation bar */}
      <div className="border-b bg-card shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/templates" className="text-muted-foreground hover:text-foreground">
              ← Back to Templates
            </Link>
            <h1 className="text-xl font-bold">{updatedTemplate.name}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Draft"}
            </Button>
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={!savedPortfolioId}
            >
              Preview
            </Button>
            <Button
              onClick={handlePublish}
              disabled={isPublishing}
            >
              {isPublishing ? "Publishing..." : "Publish Portfolio"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container flex-1 px-0">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-0">
          {/* Editor sidebar - contains all the editing tools */}
          <EditorSidebar template={updatedTemplate} portfolio={portfolio} />

          {/* Main preview */}
          <div className="border-l min-h-[calc(100vh-64px)] overflow-y-auto">
            <div className="sticky top-0 z-10 bg-background px-4 py-2 border-b">
              <Tabs defaultValue="preview">
                <TabsList>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="layout">Layout</TabsTrigger>
                  <TabsTrigger value="theme">Theme</TabsTrigger>
                </TabsList>

                {/* Preview tab - shows the template rendered with current settings */}
                <TabsContent value="preview" className="p-0 mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-medium">Portfolio Preview</h2>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Desktop</Button>
                      <Button variant="outline" size="sm">Tablet</Button>
                      <Button variant="outline" size="sm">Mobile</Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Layout tab - shows layout options */}
                <TabsContent value="layout" className="mt-4">
                  <h2 className="text-sm font-medium mb-4">Select Layout</h2>
                  <LayoutSelector
                    template={updatedTemplate}
                    initialLayout={portfolio.activeLayout}
                    onSelect={handleLayoutSelect}
                  />
                </TabsContent>

                {/* Theme tab - shows theme options */}
                <TabsContent value="theme" className="mt-4">
                  <h2 className="text-sm font-medium mb-4">Select Theme</h2>
                  <ThemeSelector
                    template={updatedTemplate}
                    initialColorScheme={portfolio.activeColorScheme}
                    initialFontPairing={portfolio.activeFontPairing}
                    onSelect={handleThemeSelect}
                    onCustomColorsChange={handleCustomColorsChange}
                    onSaveCustomColorScheme={handleSaveCustomColorScheme}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Template preview */}
            <div className="mt-4 pb-20">
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

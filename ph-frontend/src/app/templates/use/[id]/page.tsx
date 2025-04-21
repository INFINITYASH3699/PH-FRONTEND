import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import TemplateRenderer from '@/components/template-renderer/TemplateRenderer';
import EditorSidebar from './EditorSidebar';
import ThemeSelector from './ThemeSelector';
import LayoutSelector from './LayoutSelector';

// Mock function to fetch template data - replace with actual API call
async function getTemplateData(id: string) {
  try {
    // In real application, fetch from API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/templates/${id}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch template');
    }

    const data = await response.json();
    return data.template;
  } catch (error) {
    console.error('Error fetching template:', error);
    return null;
  }
}

// Mock function to get user data - replace with actual auth check
async function getCurrentUser() {
  // In a real application, this would check if the user is authenticated
  return {
    id: 'user123',
    name: 'Demo User',
    portfolios: []
  };
}

export default async function TemplateEditorPage({ params }: { params: { id: string } }) {
  const template = await getTemplateData(params.id);
  const user = await getCurrentUser();

  // Redirect if template not found
  if (!template) {
    redirect('/templates');
  }

  // Get initial portfolio data structure
  const initialPortfolio = {
    _id: 'new-portfolio',
    title: 'My New Portfolio',
    templateId: template._id,
    userId: user.id,
    content: {
      header: {
        title: user.name || 'Your Name',
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
    activeFontPairing: template.themeOptions?.fontPairings?.[0]?.id || 'default'
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top navigation bar */}
      <div className="border-b bg-card shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/templates" className="text-muted-foreground hover:text-foreground">
              ← Back to Templates
            </Link>
            <h1 className="text-xl font-bold">{template.name}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline">Save Draft</Button>
            <Button variant="outline">Preview</Button>
            <Button>Publish Portfolio</Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container flex-1 px-0">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-0">
          {/* Editor sidebar - contains all the editing tools */}
          <EditorSidebar template={template} portfolio={initialPortfolio} />

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
                  <LayoutSelector template={template} initialLayout={initialPortfolio.activeLayout} />
                </TabsContent>

                {/* Theme tab - shows theme options */}
                <TabsContent value="theme" className="mt-4">
                  <h2 className="text-sm font-medium mb-4">Select Theme</h2>
                  <ThemeSelector template={template} initialColorScheme={initialPortfolio.activeColorScheme} initialFontPairing={initialPortfolio.activeFontPairing} />
                </TabsContent>
              </Tabs>
            </div>

            {/* Template preview */}
            <div className="mt-4 pb-20">
              <TemplateRenderer
                template={template}
                portfolio={initialPortfolio}
                editable={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

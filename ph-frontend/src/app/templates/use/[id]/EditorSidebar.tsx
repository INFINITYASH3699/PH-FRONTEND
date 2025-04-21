'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

interface EditorSidebarProps {
  template: any;
  portfolio: any;
  onUpdate?: (section: string, data: any) => void;
}

const EditorSidebar: React.FC<EditorSidebarProps> = ({
  template,
  portfolio,
  onUpdate
}) => {
  const [activeSection, setActiveSection] = useState('portfolio');

  // Get sections from the active layout or default to template sections
  const selectedLayout = template.layouts?.find((l: any) => l.id === portfolio.activeLayout) || template.layouts?.[0];

  const sections = selectedLayout?.structure?.sections ||
    template.defaultStructure?.layout?.sections || [
      'header', 'about', 'projects', 'skills', 'experience', 'education', 'contact'
    ];

  // Handle portfolio metadata updates
  const handlePortfolioUpdate = (field: string, value: any) => {
    if (onUpdate) {
      onUpdate('portfolio', { ...portfolio, [field]: value });
    }
  };

  // Handle section content updates
  const handleSectionUpdate = (section: string, data: any) => {
    if (onUpdate) {
      onUpdate(section, data);
    }
  };

  return (
    <div className="bg-muted/20 border-r min-h-[calc(100vh-64px)] overflow-y-auto">
      <Tabs
        defaultValue={activeSection}
        orientation="vertical"
        onValueChange={setActiveSection}
        className="h-full"
      >
        {/* Sidebar Navigation */}
        <div className="border-b p-4">
          <TabsList className="flex flex-col space-y-1 w-full">
            <TabsTrigger
              value="portfolio"
              className="justify-start text-left px-3 py-2 h-auto"
            >
              Portfolio Settings
            </TabsTrigger>

            {sections.map((section: string) => (
              <TabsTrigger
                key={section}
                value={section}
                className="justify-start text-left px-3 py-2 h-auto capitalize"
              >
                {section}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Sidebar Content */}
        <div className="p-4">
          {/* Portfolio Settings Panel */}
          <TabsContent value="portfolio" className="space-y-4 mt-0">
            <h2 className="text-lg font-medium">Portfolio Settings</h2>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="portfolio-title">Title</Label>
                <Input
                  id="portfolio-title"
                  value={portfolio.title || ''}
                  onChange={(e) => handlePortfolioUpdate('title', e.target.value)}
                  placeholder="My Portfolio"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolio-subdomain">Subdomain</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="portfolio-subdomain"
                    value={portfolio.subdomain || ''}
                    onChange={(e) => handlePortfolioUpdate('subdomain', e.target.value)}
                    placeholder="my-portfolio"
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">.portfoliohub.com</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolio-description">Description</Label>
                <Textarea
                  id="portfolio-description"
                  value={portfolio.description || ''}
                  onChange={(e) => handlePortfolioUpdate('description', e.target.value)}
                  placeholder="A brief description of your portfolio"
                  rows={3}
                />
              </div>

              <div className="pt-2">
                <Button className="w-full">Save Settings</Button>
              </div>
            </div>
          </TabsContent>

          {/* Section Editor Panels */}
          {sections.map((section: string) => (
            <TabsContent key={section} value={section} className="space-y-4 mt-0">
              <h2 className="text-lg font-medium capitalize">{section} Section</h2>

              {section === 'header' && (
                <HeaderEditor
                  data={portfolio.content?.header}
                  onUpdate={(data) => handleSectionUpdate('header', data)}
                />
              )}

              {section === 'about' && (
                <AboutEditor
                  data={portfolio.content?.about}
                  onUpdate={(data) => handleSectionUpdate('about', data)}
                />
              )}

              {/* Placeholder for other section editors */}
              {!['header', 'about'].includes(section) && (
                <Card className="p-4">
                  <p className="text-muted-foreground text-sm mb-4">
                    This section editor will be implemented soon. For now, you can view and edit the {section} section in the preview pane.
                  </p>

                  <div className="border-t pt-3 mt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      Edit in Preview
                    </Button>
                  </div>
                </Card>
              )}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
};

// Helper component for Header section editing
const HeaderEditor: React.FC<{ data: any; onUpdate: (data: any) => void }> = ({ data, onUpdate }) => {
  const handleChange = (field: string, value: any) => {
    if (onUpdate) {
      onUpdate({ ...data, [field]: value });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="header-title">Name/Title</Label>
        <Input
          id="header-title"
          value={data?.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Your Name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="header-subtitle">Subtitle/Role</Label>
        <Input
          id="header-subtitle"
          value={data?.subtitle || ''}
          onChange={(e) => handleChange('subtitle', e.target.value)}
          placeholder="Your Profession"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="header-image">Profile Image URL</Label>
        <Input
          id="header-image"
          value={data?.profileImage || ''}
          onChange={(e) => handleChange('profileImage', e.target.value)}
          placeholder="https://example.com/your-image.jpg"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Enter a URL or</span>
          <button className="text-primary hover:underline">Upload Image</button>
        </div>
      </div>
    </div>
  );
};

// Helper component for About section editing
const AboutEditor: React.FC<{ data: any; onUpdate: (data: any) => void }> = ({ data, onUpdate }) => {
  const handleChange = (field: string, value: any) => {
    if (onUpdate) {
      onUpdate({ ...data, [field]: value });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="about-title">Section Title</Label>
        <Input
          id="about-title"
          value={data?.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="About Me"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="about-bio">Bio</Label>
        <Textarea
          id="about-bio"
          value={data?.bio || ''}
          onChange={(e) => handleChange('bio', e.target.value)}
          placeholder="Write something about yourself"
          rows={6}
        />
      </div>

      <div className="space-y-2">
        <Label>Style Variant</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            className={`p-2 text-xs border rounded-md ${data?.variant === 'standard' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}
            onClick={() => handleChange('variant', 'standard')}
          >
            Standard
          </button>
          <button
            className={`p-2 text-xs border rounded-md ${data?.variant === 'with-image' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}
            onClick={() => handleChange('variant', 'with-image')}
          >
            With Image
          </button>
          <button
            className={`p-2 text-xs border rounded-md ${data?.variant === 'with-highlights' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}
            onClick={() => handleChange('variant', 'with-highlights')}
          >
            With Highlights
          </button>
          <button
            className={`p-2 text-xs border rounded-md ${data?.variant === 'minimal' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}
            onClick={() => handleChange('variant', 'minimal')}
          >
            Minimal
          </button>
        </div>
      </div>

      {data?.variant === 'with-image' && (
        <div className="space-y-2">
          <Label htmlFor="about-image">About Image URL</Label>
          <Input
            id="about-image"
            value={data?.image || ''}
            onChange={(e) => handleChange('image', e.target.value)}
            placeholder="https://example.com/about-image.jpg"
          />
        </div>
      )}
    </div>
  );
};

export default EditorSidebar;

'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Define header content interface
interface HeaderContent {
  title?: string;
  subtitle?: string;
  showNavigation?: boolean;
  navItems?: { label: string; link: string }[];
  style?: 'default' | 'centered' | 'minimal';
  logoUrl?: string;
}

interface HeaderEditorProps {
  content: HeaderContent;
  onSave: (content: HeaderContent) => void;
  isLoading?: boolean;
}

export default function HeaderEditor({ content, onSave, isLoading = false }: HeaderEditorProps) {
  const [headerInfo, setHeaderInfo] = useState<HeaderContent>(content || {
    title: '',
    subtitle: '',
    showNavigation: true,
    navItems: [
      { label: 'Home', link: '#home' },
      { label: 'About', link: '#about' },
      { label: 'Projects', link: '#projects' },
      { label: 'Contact', link: '#contact' }
    ],
    style: 'default',
    logoUrl: ''
  });

  // Handle basic input changes
  const handleInputChange = (field: keyof HeaderContent, value: string | boolean) => {
    const updatedHeaderInfo = { ...headerInfo, [field]: value };
    setHeaderInfo(updatedHeaderInfo);
    onSave(updatedHeaderInfo);
  };

  // Handle nav item changes
  const handleNavItemChange = (index: number, field: 'label' | 'link', value: string) => {
    const updatedNavItems = [...headerInfo.navItems || []];

    if (updatedNavItems[index]) {
      updatedNavItems[index] = { ...updatedNavItems[index], [field]: value };

      const updatedHeaderInfo = { ...headerInfo, navItems: updatedNavItems };
      setHeaderInfo(updatedHeaderInfo);
      onSave(updatedHeaderInfo);
    }
  };

  // Add new nav item
  const addNavItem = () => {
    const updatedNavItems = [...headerInfo.navItems || [], { label: 'New Link', link: '#' }];
    const updatedHeaderInfo = { ...headerInfo, navItems: updatedNavItems };
    setHeaderInfo(updatedHeaderInfo);
    onSave(updatedHeaderInfo);
  };

  // Remove nav item
  const removeNavItem = (index: number) => {
    const updatedNavItems = [...headerInfo.navItems || []];
    updatedNavItems.splice(index, 1);
    const updatedHeaderInfo = { ...headerInfo, navItems: updatedNavItems };
    setHeaderInfo(updatedHeaderInfo);
    onSave(updatedHeaderInfo);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h3 className="text-lg font-medium">Header Section</h3>
        <p className="text-muted-foreground">
          Customize your portfolio header. This is typically the first element visitors will see at the top of the page.
        </p>
      </div>

      {/* Basic Header Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Header Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Header Title</label>
            <Input
              placeholder="Your Name or Portfolio Title"
              value={headerInfo.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              This will be displayed prominently in the header. Leave empty to use your portfolio title.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Header Subtitle</label>
            <Input
              placeholder="Web Developer | Designer | Photographer"
              value={headerInfo.subtitle || ''}
              onChange={(e) => handleInputChange('subtitle', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              A brief description or tagline to appear below the header title.
            </p>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-navigation"
                checked={headerInfo.showNavigation || false}
                onCheckedChange={(checked) => handleInputChange('showNavigation', checked)}
              />
              <Label htmlFor="show-navigation">Show Navigation Menu</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Items */}
      {headerInfo.showNavigation && (
        <Card>
          <CardHeader>
            <CardTitle>Navigation Menu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {headerInfo.navItems && headerInfo.navItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder="Label"
                    value={item.label}
                    onChange={(e) => handleNavItemChange(index, 'label', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Link (e.g., #about)"
                    value={item.link}
                    onChange={(e) => handleNavItemChange(index, 'link', e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeNavItem(index)}
                    disabled={headerInfo.navItems?.length === 1}
                  >
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
                      className="h-4 w-4"
                    >
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                  </Button>
                </div>
              ))}
            </div>

            <Button variant="outline" onClick={addNavItem} className="w-full">
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
                className="h-4 w-4 mr-2"
              >
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>
              Add Navigation Link
            </Button>

            <p className="text-xs text-muted-foreground mt-2">
              For section links, use hashtags (e.g., #about, #projects). For external links, use full URLs.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Header Style */}
      <Card>
        <CardHeader>
          <CardTitle>Header Style</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <label className="text-sm font-medium">Choose Style</label>
            <div className="grid grid-cols-3 gap-4 mt-2">
              <div
                className={`border rounded-md p-4 cursor-pointer ${
                  headerInfo.style === 'default' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                onClick={() => handleInputChange('style', 'default')}
              >
                <div className="h-8 bg-primary/20 rounded flex items-center justify-between px-2 mb-2">
                  <div className="w-8 h-3 bg-primary/40 rounded"></div>
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-primary/40 rounded"></div>
                    <div className="w-3 h-3 bg-primary/40 rounded"></div>
                    <div className="w-3 h-3 bg-primary/40 rounded"></div>
                  </div>
                </div>
                <p className="text-xs text-center font-medium">Default</p>
              </div>

              <div
                className={`border rounded-md p-4 cursor-pointer ${
                  headerInfo.style === 'centered' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                onClick={() => handleInputChange('style', 'centered')}
              >
                <div className="h-8 bg-primary/20 rounded flex flex-col items-center justify-center px-2 mb-2">
                  <div className="w-12 h-2 bg-primary/40 rounded mb-1"></div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary/40 rounded"></div>
                    <div className="w-2 h-2 bg-primary/40 rounded"></div>
                    <div className="w-2 h-2 bg-primary/40 rounded"></div>
                  </div>
                </div>
                <p className="text-xs text-center font-medium">Centered</p>
              </div>

              <div
                className={`border rounded-md p-4 cursor-pointer ${
                  headerInfo.style === 'minimal' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                onClick={() => handleInputChange('style', 'minimal')}
              >
                <div className="h-8 bg-primary/10 rounded flex items-center justify-end px-2 mb-2">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-primary/30 rounded"></div>
                    <div className="w-3 h-3 bg-primary/30 rounded"></div>
                    <div className="w-3 h-3 bg-primary/30 rounded"></div>
                  </div>
                </div>
                <p className="text-xs text-center font-medium">Minimal</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

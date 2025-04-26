import { useState } from 'react';
import {
  PlusCircle,
  X,
  Upload,
  Layout,
  Copy,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Github,
  Mail
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SocialLink {
  platform: string;
  url: string;
  enabled: boolean;
}

interface FooterColumn {
  title: string;
  links: Array<{ label: string; url: string }>;
}

interface FooterEditorProps {
  data: {
    copyright?: string;
    columns?: FooterColumn[];
    socialLinks?: SocialLink[];
    logo?: string;
    showLogo?: boolean;
    backgroundColor?: string;
    textColor?: string;
    linkColor?: string;
    layout?: 'standard' | 'centered' | 'minimal' | 'expanded';
    showSocial?: boolean;
    showNewsletter?: boolean;
    newsletterTitle?: string;
    newsletterText?: string;
  };
  onChange: (data: any) => void;
}

export default function FooterEditor({ data, onChange }: FooterEditorProps) {
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [activeColumn, setActiveColumn] = useState(0);

  // Default values for footer
  const footerData = {
    copyright: data?.copyright || `© ${new Date().getFullYear()} Your Name. All rights reserved.`,
    columns: data?.columns || [
      {
        title: 'About',
        links: [
          { label: 'About Me', url: '/about' },
          { label: 'Services', url: '/services' },
          { label: 'Portfolio', url: '/portfolio' }
        ]
      },
      {
        title: 'Resources',
        links: [
          { label: 'Blog', url: '/blog' },
          { label: 'Downloads', url: '/downloads' }
        ]
      }
    ],
    socialLinks: data?.socialLinks || [
      { platform: 'twitter', url: '', enabled: true },
      { platform: 'instagram', url: '', enabled: true },
      { platform: 'linkedin', url: '', enabled: true },
      { platform: 'github', url: '', enabled: true },
      { platform: 'facebook', url: '', enabled: false },
      { platform: 'email', url: '', enabled: false }
    ],
    logo: data?.logo || '',
    showLogo: data?.showLogo ?? true,
    backgroundColor: data?.backgroundColor || '#111827',
    textColor: data?.textColor || '#f9fafb',
    linkColor: data?.linkColor || '#d1d5db',
    layout: data?.layout || 'standard',
    showSocial: data?.showSocial ?? true,
    showNewsletter: data?.showNewsletter ?? false,
    newsletterTitle: data?.newsletterTitle || 'Subscribe to our newsletter',
    newsletterText: data?.newsletterText || 'Stay updated with our latest news and announcements.'
  };

  // Handle input changes
  const handleInputChange = (field: string, value: any) => {
    onChange({
      ...footerData,
      [field]: value
    });
  };

  // Handle copyright text change
  const handleCopyrightChange = (value: string) => {
    handleInputChange('copyright', value);
  };

  // Handle updating a column title
  const handleColumnTitleChange = (index: number, title: string) => {
    const updatedColumns = [...footerData.columns];
    updatedColumns[index].title = title;
    handleInputChange('columns', updatedColumns);
  };

  // Add new link to a column
  const handleAddLink = (columnIndex: number) => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;

    const updatedColumns = [...footerData.columns];
    updatedColumns[columnIndex].links.push({
      label: newLinkTitle.trim(),
      url: newLinkUrl.trim()
    });

    handleInputChange('columns', updatedColumns);
    setNewLinkTitle('');
    setNewLinkUrl('');
  };

  // Remove link from a column
  const handleRemoveLink = (columnIndex: number, linkIndex: number) => {
    const updatedColumns = [...footerData.columns];
    updatedColumns[columnIndex].links.splice(linkIndex, 1);
    handleInputChange('columns', updatedColumns);
  };

  // Add a new column
  const handleAddColumn = () => {
    const updatedColumns = [...footerData.columns, {
      title: 'New Column',
      links: []
    }];
    handleInputChange('columns', updatedColumns);
    setActiveColumn(updatedColumns.length - 1);
  };

  // Remove a column
  const handleRemoveColumn = (index: number) => {
    const updatedColumns = [...footerData.columns];
    updatedColumns.splice(index, 1);
    handleInputChange('columns', updatedColumns);

    if (activeColumn >= updatedColumns.length) {
      setActiveColumn(Math.max(0, updatedColumns.length - 1));
    }
  };

  // Update social link
  const handleUpdateSocialLink = (index: number, field: keyof SocialLink, value: string | boolean) => {
    const updatedLinks = [...footerData.socialLinks];
    updatedLinks[index] = {
      ...updatedLinks[index],
      [field]: value
    };
    handleInputChange('socialLinks', updatedLinks);
  };

  // Render social icon
  const renderSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return <Twitter className="h-4 w-4" />;
      case 'instagram':
        return <Instagram className="h-4 w-4" />;
      case 'facebook':
        return <Facebook className="h-4 w-4" />;
      case 'linkedin':
        return <Linkedin className="h-4 w-4" />;
      case 'github':
        return <Github className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="mb-4 grid grid-cols-3">
          <TabsTrigger value="content" className="flex items-center gap-1">
            <Copy className="h-4 w-4" />
            <span>Content</span>
          </TabsTrigger>
          <TabsTrigger value="style" className="flex items-center gap-1">
            <Layout className="h-4 w-4" />
            <span>Style</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-1">
            <Twitter className="h-4 w-4" />
            <span>Social</span>
          </TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          {/* Copyright */}
          <div className="space-y-2">
            <Label htmlFor="copyright">Copyright Text</Label>
            <Input
              id="copyright"
              value={footerData.copyright}
              onChange={(e) => handleCopyrightChange(e.target.value)}
              placeholder="© 2025 Your Name. All rights reserved."
            />
            <p className="text-xs text-muted-foreground">
              Your copyright statement or legal text.
            </p>
          </div>

          {/* Footer Logo */}
          <div className="pt-3 border-t">
            <div className="flex items-center space-x-2 mb-2">
              <Switch
                id="show-logo"
                checked={footerData.showLogo}
                onCheckedChange={(checked) => handleInputChange('showLogo', checked)}
              />
              <Label htmlFor="show-logo">Show Logo in Footer</Label>
            </div>

            {footerData.showLogo && (
              <div className="pl-7 space-y-2">
                <Input
                  value={footerData.logo}
                  onChange={(e) => handleInputChange('logo', e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the URL of your logo image.
                </p>
              </div>
            )}
          </div>

          {/* Newsletter */}
          <div className="pt-3 border-t">
            <div className="flex items-center space-x-2 mb-2">
              <Switch
                id="show-newsletter"
                checked={footerData.showNewsletter}
                onCheckedChange={(checked) => handleInputChange('showNewsletter', checked)}
              />
              <Label htmlFor="show-newsletter">Include Newsletter Signup</Label>
            </div>

            {footerData.showNewsletter && (
              <div className="pl-7 space-y-2">
                <Label htmlFor="newsletter-title">Newsletter Title</Label>
                <Input
                  id="newsletter-title"
                  value={footerData.newsletterTitle}
                  onChange={(e) => handleInputChange('newsletterTitle', e.target.value)}
                  placeholder="Subscribe to our newsletter"
                />

                <Label htmlFor="newsletter-text">Newsletter Description</Label>
                <Textarea
                  id="newsletter-text"
                  value={footerData.newsletterText}
                  onChange={(e) => handleInputChange('newsletterText', e.target.value)}
                  placeholder="Stay updated with our latest news and announcements."
                  rows={2}
                />
              </div>
            )}
          </div>

          {/* Footer Columns */}
          <div className="space-y-4 pt-3 border-t">
            <div className="flex items-center justify-between">
              <Label>Footer Columns</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddColumn}
                disabled={footerData.columns.length >= 4}
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Add Column
              </Button>
            </div>

            {footerData.columns.length > 0 ? (
              <div className="space-y-4">
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {footerData.columns.map((column, index) => (
                    <Button
                      key={index}
                      variant={activeColumn === index ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveColumn(index)}
                      className="whitespace-nowrap"
                    >
                      {column.title || `Column ${index + 1}`}
                    </Button>
                  ))}
                </div>

                {footerData.columns[activeColumn] && (
                  <div className="space-y-4 border rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`column-${activeColumn}-title`}>Column Title</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveColumn(activeColumn)}
                        disabled={footerData.columns.length <= 1}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <Input
                      id={`column-${activeColumn}-title`}
                      value={footerData.columns[activeColumn].title}
                      onChange={(e) => handleColumnTitleChange(activeColumn, e.target.value)}
                      placeholder="Column Title"
                    />

                    <div className="space-y-2">
                      <Label>Links</Label>
                      {footerData.columns[activeColumn].links.length > 0 ? (
                        <div className="space-y-2">
                          {footerData.columns[activeColumn].links.map((link, linkIndex) => (
                            <div key={linkIndex} className="flex items-center space-x-2">
                              <Input
                                value={link.label}
                                onChange={(e) => {
                                  const updatedColumns = [...footerData.columns];
                                  updatedColumns[activeColumn].links[linkIndex].label = e.target.value;
                                  handleInputChange('columns', updatedColumns);
                                }}
                                placeholder="Link Text"
                                className="flex-1"
                              />
                              <Input
                                value={link.url}
                                onChange={(e) => {
                                  const updatedColumns = [...footerData.columns];
                                  updatedColumns[activeColumn].links[linkIndex].url = e.target.value;
                                  handleInputChange('columns', updatedColumns);
                                }}
                                placeholder="URL"
                                className="flex-1"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveLink(activeColumn, linkIndex)}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-sm text-muted-foreground border border-dashed rounded-md">
                          No links added yet. Add a link below.
                        </div>
                      )}

                      <div className="pt-2 grid grid-cols-2 gap-2">
                        <Input
                          value={newLinkTitle}
                          onChange={(e) => setNewLinkTitle(e.target.value)}
                          placeholder="Link Text"
                        />
                        <div className="flex space-x-2">
                          <Input
                            value={newLinkUrl}
                            onChange={(e) => setNewLinkUrl(e.target.value)}
                            placeholder="URL"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleAddLink(activeColumn)}
                            disabled={!newLinkTitle.trim() || !newLinkUrl.trim()}
                          >
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-muted-foreground border border-dashed rounded-md">
                No columns added yet. Click "Add Column" to create a footer column.
              </div>
            )}
          </div>
        </TabsContent>

        {/* Style Tab */}
        <TabsContent value="style" className="space-y-4">
          {/* Colors */}
          <div className="space-y-4">
            <Label>Colors</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label htmlFor="background-color" className="text-xs">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="background-color"
                    type="color"
                    value={footerData.backgroundColor}
                    onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                    className="w-12 h-8 p-1"
                  />
                  <Input
                    type="text"
                    value={footerData.backgroundColor}
                    onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="text-color" className="text-xs">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="text-color"
                    type="color"
                    value={footerData.textColor}
                    onChange={(e) => handleInputChange('textColor', e.target.value)}
                    className="w-12 h-8 p-1"
                  />
                  <Input
                    type="text"
                    value={footerData.textColor}
                    onChange={(e) => handleInputChange('textColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="link-color" className="text-xs">Link Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="link-color"
                    type="color"
                    value={footerData.linkColor}
                    onChange={(e) => handleInputChange('linkColor', e.target.value)}
                    className="w-12 h-8 p-1"
                  />
                  <Input
                    type="text"
                    value={footerData.linkColor}
                    onChange={(e) => handleInputChange('linkColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Layout Style */}
          <div className="space-y-2 pt-4">
            <Label>Footer Layout</Label>
            <div className="grid grid-cols-2 gap-3">
              <Card
                className={`cursor-pointer transition-all ${footerData.layout === 'standard' ? 'border-primary' : 'border-muted'}`}
                onClick={() => handleInputChange('layout', 'standard')}
              >
                <CardContent className="p-3 flex flex-col items-center">
                  <div className="bg-muted/30 h-16 w-full rounded flex items-end justify-between px-2 mb-2">
                    <div className="flex w-2/3 justify-between mb-2 ml-2">
                      <div className="space-y-1">
                        <div className="bg-muted rounded h-2 w-8"></div>
                        <div className="bg-muted rounded h-1 w-6"></div>
                        <div className="bg-muted rounded h-1 w-4"></div>
                      </div>
                      <div className="space-y-1">
                        <div className="bg-muted rounded h-2 w-8"></div>
                        <div className="bg-muted rounded h-1 w-6"></div>
                        <div className="bg-muted rounded h-1 w-4"></div>
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded h-2 w-1/4 mb-2 mr-2"></div>
                  </div>
                  <span className="text-sm font-medium">Standard</span>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${footerData.layout === 'centered' ? 'border-primary' : 'border-muted'}`}
                onClick={() => handleInputChange('layout', 'centered')}
              >
                <CardContent className="p-3 flex flex-col items-center">
                  <div className="bg-muted/30 h-16 w-full rounded flex flex-col items-center justify-end mb-2">
                    <div className="space-y-1 mb-2">
                      <div className="bg-muted rounded h-2 w-16 mx-auto"></div>
                      <div className="bg-muted rounded h-1 w-12 mx-auto"></div>
                      <div className="flex justify-center space-x-1 mt-1">
                        <div className="bg-muted rounded-full h-2 w-2"></div>
                        <div className="bg-muted rounded-full h-2 w-2"></div>
                        <div className="bg-muted rounded-full h-2 w-2"></div>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-medium">Centered</span>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${footerData.layout === 'minimal' ? 'border-primary' : 'border-muted'}`}
                onClick={() => handleInputChange('layout', 'minimal')}
              >
                <CardContent className="p-3 flex flex-col items-center">
                  <div className="bg-muted/30 h-16 w-full rounded flex items-center justify-center mb-2">
                    <div className="bg-muted rounded h-2 w-3/4"></div>
                  </div>
                  <span className="text-sm font-medium">Minimal</span>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${footerData.layout === 'expanded' ? 'border-primary' : 'border-muted'}`}
                onClick={() => handleInputChange('layout', 'expanded')}
              >
                <CardContent className="p-3 flex flex-col items-center">
                  <div className="bg-muted/30 h-16 w-full rounded grid grid-cols-4 gap-1 p-2 mb-2">
                    <div className="space-y-1">
                      <div className="bg-muted rounded h-1 w-full"></div>
                      <div className="bg-muted rounded h-1 w-3/4"></div>
                      <div className="bg-muted rounded h-1 w-1/2"></div>
                    </div>
                    <div className="space-y-1">
                      <div className="bg-muted rounded h-1 w-full"></div>
                      <div className="bg-muted rounded h-1 w-3/4"></div>
                      <div className="bg-muted rounded h-1 w-1/2"></div>
                    </div>
                    <div className="space-y-1">
                      <div className="bg-muted rounded h-1 w-full"></div>
                      <div className="bg-muted rounded h-1 w-3/4"></div>
                      <div className="bg-muted rounded h-1 w-1/2"></div>
                    </div>
                    <div className="space-y-1">
                      <div className="bg-muted rounded h-1 w-full"></div>
                      <div className="bg-muted rounded h-1 w-3/4"></div>
                      <div className="bg-muted rounded h-1 w-1/2"></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium">Expanded</span>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Social Tab */}
        <TabsContent value="social" className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Switch
              id="show-social"
              checked={footerData.showSocial}
              onCheckedChange={(checked) => handleInputChange('showSocial', checked)}
            />
            <Label htmlFor="show-social">Show Social Media Links</Label>
          </div>

          {footerData.showSocial && (
            <div className="space-y-4">
              {footerData.socialLinks.map((link, index) => (
                <div key={index} className="flex items-center space-x-2 border rounded-md p-3">
                  <Switch
                    id={`social-${link.platform}-${index}`}
                    checked={link.enabled}
                    onCheckedChange={(checked) => handleUpdateSocialLink(index, 'enabled', checked)}
                  />
                  <div className="flex-1 flex items-center space-x-2">
                    <div className="w-7 h-7 flex items-center justify-center bg-muted rounded-md">
                      {renderSocialIcon(link.platform)}
                    </div>
                    <div className="capitalize">{link.platform}</div>
                  </div>
                  {link.enabled && (
                    <Input
                      value={link.url}
                      onChange={(e) => handleUpdateSocialLink(index, 'url', e.target.value)}
                      placeholder={`Your ${link.platform} URL`}
                      className="flex-1"
                    />
                  )}
                </div>
              ))}

              <div className="p-3 bg-muted/20 rounded-md">
                <p className="text-sm text-muted-foreground">
                  <Badge variant="outline" className="mr-2">Tip</Badge>
                  Social links will appear in your footer according to the footer layout style you've selected.
                </p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

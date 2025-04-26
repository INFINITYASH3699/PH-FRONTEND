import { useState, useRef } from 'react';
import { PlusCircle, X, Upload, Menu, AlignJustify, Layout, ChevronDown, Link as LinkIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import apiClient from '@/lib/apiClient';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface MenuItem {
  label: string;
  url: string;
  isExternal?: boolean;
  children?: MenuItem[];
}

interface NavbarEditorProps {
  data: {
    brand?: string;
    logo?: string;
    logoHeight?: number;
    menuItems?: MenuItem[];
    position?: 'fixed' | 'sticky' | 'static';
    placement?: 'top' | 'bottom';
    style?: 'standard' | 'transparent' | 'minimal' | 'centered';
    showSearch?: boolean;
    showSocialLinks?: boolean;
    backgroundColor?: string;
    textColor?: string;
    hoverColor?: string;
    customClass?: string;
    mobileBreakpoint?: string;
  };
  onChange: (data: any) => void;
}

export default function NavbarEditor({ data, onChange }: NavbarEditorProps) {
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [newMenuItem, setNewMenuItem] = useState({ label: '', url: '' });
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Default values for navbar
  const navbarData = {
    brand: data?.brand || 'Your Brand',
    logo: data?.logo || '',
    logoHeight: data?.logoHeight || 40,
    menuItems: data?.menuItems || [
      { label: 'Home', url: '/' },
      { label: 'About', url: '/about' },
      { label: 'Services', url: '/services' },
      { label: 'Portfolio', url: '/portfolio' },
      { label: 'Contact', url: '/contact' }
    ],
    position: data?.position || 'sticky',
    placement: data?.placement || 'top',
    style: data?.style || 'standard',
    showSearch: data?.showSearch ?? false,
    showSocialLinks: data?.showSocialLinks ?? false,
    backgroundColor: data?.backgroundColor || '#ffffff',
    textColor: data?.textColor || '#111827',
    hoverColor: data?.hoverColor || '#6366f1',
    customClass: data?.customClass || '',
    mobileBreakpoint: data?.mobileBreakpoint || 'md'
  };

  // Handle input changes
  const handleInputChange = (field: string, value: any) => {
    onChange({
      ...navbarData,
      [field]: value
    });
  };

  // Handle logo upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLogoUploading(true);
      const result = await apiClient.uploadImage(file, 'logo');

      if (result.success && result.image?.url) {
        handleInputChange('logo', result.image.url);
        toast.success('Logo uploaded successfully');
      } else {
        toast.error('Failed to upload logo');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('An unexpected error occurred during upload');
    } finally {
      setIsLogoUploading(false);
    }
  };

  // Trigger logo file input click
  const handleLogoUploadClick = () => {
    logoFileInputRef.current?.click();
  };

  // Add menu item
  const handleAddMenuItem = () => {
    if (!newMenuItem.label.trim() || !newMenuItem.url.trim()) {
      toast.error('Both label and URL are required');
      return;
    }

    const updatedMenuItems = [
      ...navbarData.menuItems,
      {
        label: newMenuItem.label.trim(),
        url: newMenuItem.url.trim(),
        isExternal: newMenuItem.url.startsWith('http')
      }
    ];

    onChange({
      ...navbarData,
      menuItems: updatedMenuItems
    });

    setNewMenuItem({ label: '', url: '' });
  };

  // Remove menu item
  const handleRemoveMenuItem = (index: number) => {
    const updatedMenuItems = [...navbarData.menuItems];
    updatedMenuItems.splice(index, 1);

    onChange({
      ...navbarData,
      menuItems: updatedMenuItems
    });
  };

  // Handle menu reorder
  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(navbarData.menuItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onChange({
      ...navbarData,
      menuItems: items
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="mb-4 grid grid-cols-3">
          <TabsTrigger value="content" className="flex items-center gap-1">
            <Menu className="h-4 w-4" />
            <span>Content</span>
          </TabsTrigger>
          <TabsTrigger value="style" className="flex items-center gap-1">
            <Layout className="h-4 w-4" />
            <span>Style</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-1">
            <AlignJustify className="h-4 w-4" />
            <span>Advanced</span>
          </TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          {/* Brand/Logo */}
          <div className="space-y-2">
            <Label htmlFor="navbar-brand">Brand Name</Label>
            <Input
              id="navbar-brand"
              value={navbarData.brand}
              onChange={(e) => handleInputChange('brand', e.target.value)}
              placeholder="Your Brand"
            />

            <Label htmlFor="navbar-logo">Logo</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="navbar-logo"
                value={navbarData.logo}
                onChange={(e) => handleInputChange('logo', e.target.value)}
                placeholder="https://example.com/logo.png"
              />
              <Button
                variant="outline"
                size="icon"
                title="Upload Logo"
                onClick={handleLogoUploadClick}
                disabled={isLogoUploading}
              >
                {isLogoUploading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                ) : (
                  <Upload className="h-4 w-4" />
                )}
              </Button>
              <input
                type="file"
                ref={logoFileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleLogoUpload}
              />
            </div>
            {navbarData.logo && (
              <div className="mt-2 relative h-10 w-40 rounded overflow-hidden border">
                <img
                  src={navbarData.logo}
                  alt="Logo Preview"
                  className="h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/200x80?text=Logo';
                  }}
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Label htmlFor="logo-height">Logo Height</Label>
              <Input
                id="logo-height"
                type="number"
                value={navbarData.logoHeight}
                onChange={(e) => handleInputChange('logoHeight', parseInt(e.target.value) || 40)}
                className="w-20"
                min={20}
                max={100}
              />
              <span className="text-sm text-muted-foreground">px</span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Navigation Menu Items</Label>
              <Badge variant="outline">{navbarData.menuItems.length} items</Badge>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="menu-items">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2 mb-4"
                  >
                    {navbarData.menuItems.map((item, index) => (
                      <Draggable key={index} draggableId={`item-${index}`} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="flex items-center gap-2 p-2 border rounded-md bg-muted/10"
                          >
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <div className="text-sm font-medium">{item.label}</div>
                              <div className="text-sm text-muted-foreground truncate">{item.url}</div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveMenuItem(index)}
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            <div className="space-y-2 border rounded-md p-3">
              <Label htmlFor="menu-item-label">Add Menu Item</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  id="menu-item-label"
                  value={newMenuItem.label}
                  onChange={(e) => setNewMenuItem({ ...newMenuItem, label: e.target.value })}
                  placeholder="Label (e.g. About)"
                />
                <Input
                  value={newMenuItem.url}
                  onChange={(e) => setNewMenuItem({ ...newMenuItem, url: e.target.value })}
                  placeholder="URL (e.g. /about)"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddMenuItem}
                className="w-full"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Menu Item
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Drag and drop menu items to reorder them. External links (starting with http) will open in a new tab.
            </p>
          </div>

          {/* Additional Options */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-search"
                  checked={navbarData.showSearch}
                  onCheckedChange={(checked) => handleInputChange('showSearch', checked)}
                />
                <Label htmlFor="show-search">Show Search</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-social"
                  checked={navbarData.showSocialLinks}
                  onCheckedChange={(checked) => handleInputChange('showSocialLinks', checked)}
                />
                <Label htmlFor="show-social">Show Social Links</Label>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Style Tab */}
        <TabsContent value="style" className="space-y-4">
          <div className="space-y-2">
            <Label>Position</Label>
            <RadioGroup
              value={navbarData.position}
              onValueChange={(value: 'fixed' | 'sticky' | 'static') => handleInputChange('position', value)}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="static" id="position-static" />
                <Label htmlFor="position-static">Static (Scrolls with page)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sticky" id="position-sticky" />
                <Label htmlFor="position-sticky">Sticky (Sticks to top when scrolling)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fixed" id="position-fixed" />
                <Label htmlFor="position-fixed">Fixed (Always visible)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Placement</Label>
            <RadioGroup
              value={navbarData.placement}
              onValueChange={(value: 'top' | 'bottom') => handleInputChange('placement', value)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="top" id="placement-top" />
                <Label htmlFor="placement-top">Top</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bottom" id="placement-bottom" />
                <Label htmlFor="placement-bottom">Bottom</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Navbar Style</Label>
            <div className="grid grid-cols-2 gap-3">
              <Card
                className={`cursor-pointer transition-all ${navbarData.style === 'standard' ? 'border-primary' : 'border-muted'}`}
                onClick={() => handleInputChange('style', 'standard')}
              >
                <CardContent className="p-3 flex flex-col items-center">
                  <div className="bg-muted/30 h-10 w-full rounded flex items-center justify-between px-2 mb-2">
                    <div className="bg-muted rounded h-4 w-8"></div>
                    <div className="flex space-x-2">
                      <div className="bg-muted rounded h-2 w-6"></div>
                      <div className="bg-muted rounded h-2 w-6"></div>
                      <div className="bg-muted rounded h-2 w-6"></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium">Standard</span>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${navbarData.style === 'transparent' ? 'border-primary' : 'border-muted'}`}
                onClick={() => handleInputChange('style', 'transparent')}
              >
                <CardContent className="p-3 flex flex-col items-center">
                  <div className="bg-transparent border border-dashed border-muted h-10 w-full rounded flex items-center justify-between px-2 mb-2">
                    <div className="bg-muted/50 rounded h-4 w-8"></div>
                    <div className="flex space-x-2">
                      <div className="bg-muted/50 rounded h-2 w-6"></div>
                      <div className="bg-muted/50 rounded h-2 w-6"></div>
                      <div className="bg-muted/50 rounded h-2 w-6"></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium">Transparent</span>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${navbarData.style === 'minimal' ? 'border-primary' : 'border-muted'}`}
                onClick={() => handleInputChange('style', 'minimal')}
              >
                <CardContent className="p-3 flex flex-col items-center">
                  <div className="h-10 w-full rounded flex items-center justify-between px-2 mb-2">
                    <div className="bg-muted rounded h-4 w-8"></div>
                    <div className="flex space-x-3">
                      <div className="bg-muted rounded-full h-2 w-2"></div>
                      <div className="bg-muted rounded-full h-2 w-2"></div>
                      <div className="bg-muted rounded-full h-2 w-2"></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium">Minimal</span>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${navbarData.style === 'centered' ? 'border-primary' : 'border-muted'}`}
                onClick={() => handleInputChange('style', 'centered')}
              >
                <CardContent className="p-3 flex flex-col items-center">
                  <div className="bg-muted/30 h-10 w-full rounded flex flex-col items-center justify-center mb-2">
                    <div className="bg-muted rounded h-3 w-10 mb-1"></div>
                    <div className="flex space-x-2">
                      <div className="bg-muted rounded h-2 w-4"></div>
                      <div className="bg-muted rounded h-2 w-4"></div>
                      <div className="bg-muted rounded h-2 w-4"></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium">Centered</span>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <Label>Colors</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label htmlFor="background-color" className="text-xs">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="background-color"
                    type="color"
                    value={navbarData.backgroundColor}
                    onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                    className="w-12 h-8 p-1"
                  />
                  <Input
                    type="text"
                    value={navbarData.backgroundColor}
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
                    value={navbarData.textColor}
                    onChange={(e) => handleInputChange('textColor', e.target.value)}
                    className="w-12 h-8 p-1"
                  />
                  <Input
                    type="text"
                    value={navbarData.textColor}
                    onChange={(e) => handleInputChange('textColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="hover-color" className="text-xs">Hover Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="hover-color"
                    type="color"
                    value={navbarData.hoverColor}
                    onChange={(e) => handleInputChange('hoverColor', e.target.value)}
                    className="w-12 h-8 p-1"
                  />
                  <Input
                    type="text"
                    value={navbarData.hoverColor}
                    onChange={(e) => handleInputChange('hoverColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mobile-breakpoint">Mobile Menu Breakpoint</Label>
            <Select
              value={navbarData.mobileBreakpoint}
              onValueChange={(value) => handleInputChange('mobileBreakpoint', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select breakpoint" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">Small (640px)</SelectItem>
                <SelectItem value="md">Medium (768px)</SelectItem>
                <SelectItem value="lg">Large (1024px)</SelectItem>
                <SelectItem value="xl">Extra Large (1280px)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Determines at what screen width the navbar will switch to a mobile menu.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-class">Custom CSS Class</Label>
            <Input
              id="custom-class"
              value={navbarData.customClass}
              onChange={(e) => handleInputChange('customClass', e.target.value)}
              placeholder="my-custom-navbar"
            />
            <p className="text-xs text-muted-foreground">
              Add custom CSS classes to the navbar (for advanced users).
            </p>
          </div>

          <div className="p-4 bg-muted/20 rounded-lg border border-muted mt-4">
            <h3 className="text-sm font-medium mb-2">Navbar Tips</h3>
            <ul className="text-xs text-muted-foreground space-y-2">
              <li className="flex items-start">
                <Badge variant="outline" className="mr-2 mt-0.5">Tip</Badge>
                Keep your navigation menu concise - 5-7 items is typically best for usability.
              </li>
              <li className="flex items-start">
                <Badge variant="outline" className="mr-2 mt-0.5">Tip</Badge>
                For transparent navbars, ensure text has enough contrast with your background content.
              </li>
              <li className="flex items-start">
                <Badge variant="outline" className="mr-2 mt-0.5">Tip</Badge>
                Consider using sticky position to keep navigation accessible as users scroll.
              </li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Layout,
  Type,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  MessageSquare,
  LayoutGrid
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import apiClient from '@/lib/apiClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface HeaderEditorProps {
  data: {
    title?: string;
    subtitle?: string;
    description?: string;
    profileImage?: string;
    backgroundImage?: string;
    backgroundColor?: string;
    textColor?: string;
    overlayColor?: string;
    overlayOpacity?: number;
    alignment?: 'left' | 'center' | 'right';
    height?: string;
    fullscreen?: boolean;
    showProfileImage?: boolean;
    variant?: string;
    buttonText?: string;
    buttonLink?: string;
    secondaryButtonText?: string;
    secondaryButtonLink?: string;
    showSocialLinks?: boolean;
    sticky?: boolean;
    animation?: boolean;
    customClass?: string;
  };
  onChange: (data: any) => void;
}

export default function HeaderEditor({ data, onChange }: HeaderEditorProps) {
  const [isProfileImageUploading, setIsProfileImageUploading] = useState(false);
  const [isBackgroundImageUploading, setIsBackgroundImageUploading] = useState(false);
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const backgroundImageInputRef = useRef<HTMLInputElement>(null);

  // Default values for the header
  const headerData = {
    title: data?.title || 'Your Name',
    subtitle: data?.subtitle || 'Your Profession',
    description: data?.description || '',
    profileImage: data?.profileImage || '',
    backgroundImage: data?.backgroundImage || '',
    backgroundColor: data?.backgroundColor || '#111827',
    textColor: data?.textColor || '#ffffff',
    overlayColor: data?.overlayColor || '#000000',
    overlayOpacity: data?.overlayOpacity ?? 0.5,
    alignment: data?.alignment || 'center',
    height: data?.height || 'medium',
    fullscreen: data?.fullscreen ?? false,
    showProfileImage: data?.showProfileImage ?? true,
    variant: data?.variant || 'standard',
    buttonText: data?.buttonText || 'Contact Me',
    buttonLink: data?.buttonLink || '#contact',
    secondaryButtonText: data?.secondaryButtonText || 'View Projects',
    secondaryButtonLink: data?.secondaryButtonLink || '#projects',
    showSocialLinks: data?.showSocialLinks ?? false,
    sticky: data?.sticky ?? false,
    animation: data?.animation ?? false,
    customClass: data?.customClass || ''
  };

  // Handle input changes
  const handleInputChange = (field: string, value: any) => {
    onChange({
      ...headerData,
      [field]: value
    });
  };

  // Handle profile image upload
  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProfileImageUploading(true);
      const result = await apiClient.uploadImage(file, 'profile');

      if (result.success && result.image?.url) {
        handleInputChange('profileImage', result.image.url);
        toast.success('Profile image uploaded successfully');
      } else {
        toast.error('Failed to upload profile image');
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast.error('An unexpected error occurred during upload');
    } finally {
      setIsProfileImageUploading(false);
    }
  };

  // Handle background image upload
  const handleBackgroundImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsBackgroundImageUploading(true);
      const result = await apiClient.uploadImage(file, 'background');

      if (result.success && result.image?.url) {
        handleInputChange('backgroundImage', result.image.url);
        toast.success('Background image uploaded successfully');
      } else {
        toast.error('Failed to upload background image');
      }
    } catch (error) {
      console.error('Error uploading background image:', error);
      toast.error('An unexpected error occurred during upload');
    } finally {
      setIsBackgroundImageUploading(false);
    }
  };

  // Trigger profile image file input click
  const handleProfileImageUploadClick = () => {
    profileImageInputRef.current?.click();
  };

  // Trigger background image file input click
  const handleBackgroundImageUploadClick = () => {
    backgroundImageInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="mb-4 grid grid-cols-4 md:grid-cols-4">
          <TabsTrigger value="content" className="flex items-center gap-1">
            <Type className="h-4 w-4" />
            <span>Content</span>
          </TabsTrigger>
          <TabsTrigger value="style" className="flex items-center gap-1">
            <Palette className="h-4 w-4" />
            <span>Style</span>
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center gap-1">
            <Layout className="h-4 w-4" />
            <span>Layout</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-1">
            <LayoutGrid className="h-4 w-4" />
            <span>Advanced</span>
          </TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <div className="space-y-4">
            <Label htmlFor="header-title">Name/Title</Label>
            <Input
              id="header-title"
              value={headerData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="John Doe"
            />
            <Label htmlFor="header-subtitle">Subtitle/Role</Label>
            <Input
              id="header-subtitle"
              value={headerData.subtitle}
              onChange={(e) => handleInputChange('subtitle', e.target.value)}
              placeholder="Software Developer"
            />
            <Label htmlFor="header-description">Description</Label>
            <Textarea
              id="header-description"
              value={headerData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="A short description or tagline"
              rows={3}
            />
          </div>

          {/* Profile Image */}
          <div className="space-y-2 pt-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={headerData.showProfileImage}
                onCheckedChange={(checked) => handleInputChange('showProfileImage', checked)}
                id="show-profile-image-switch"
              />
              <Label htmlFor="show-profile-image-switch" className="cursor-pointer">
                Show Profile Image
              </Label>
            </div>

            {headerData.showProfileImage && (
              <>
                <Label htmlFor="profile-image">Profile Image</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="profile-image"
                    value={headerData.profileImage}
                    onChange={(e) => handleInputChange('profileImage', e.target.value)}
                    placeholder="https://example.com/your-image.jpg"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    title="Upload Profile Image"
                    onClick={handleProfileImageUploadClick}
                    disabled={isProfileImageUploading}
                  >
                    {isProfileImageUploading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </Button>
                  <input
                    type="file"
                    ref={profileImageInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Enter an image URL or upload a file (recommended size: 500x500px)
                </p>
                {headerData.profileImage && (
                  <div className="mt-2 relative w-16 h-16 rounded-full overflow-hidden border">
                    <img
                      src={headerData.profileImage}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/150?text=Profile';
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Buttons */}
          <div className="space-y-2 pt-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="text-sm font-medium flex items-center gap-1">
                    Call-to-Action Buttons <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </h3>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">
                    Add buttons to your header section to guide visitors to important sections or pages
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Primary Button</Label>
                <Input
                  value={headerData.buttonText}
                  onChange={(e) => handleInputChange('buttonText', e.target.value)}
                  placeholder="Contact Me"
                />
                <Input
                  value={headerData.buttonLink}
                  onChange={(e) => handleInputChange('buttonLink', e.target.value)}
                  placeholder="#contact"
                />
              </div>
              <div className="space-y-2">
                <Label>Secondary Button</Label>
                <Input
                  value={headerData.secondaryButtonText}
                  onChange={(e) => handleInputChange('secondaryButtonText', e.target.value)}
                  placeholder="View Projects"
                />
                <Input
                  value={headerData.secondaryButtonLink}
                  onChange={(e) => handleInputChange('secondaryButtonLink', e.target.value)}
                  placeholder="#projects"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="pt-2">
            <div className="flex items-center space-x-2">
              <Switch
                checked={headerData.showSocialLinks}
                onCheckedChange={(checked) => handleInputChange('showSocialLinks', checked)}
                id="show-social-links-switch"
              />
              <Label htmlFor="show-social-links-switch" className="cursor-pointer">
                Show Social Links
              </Label>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Enable to show social media links in your header (configured in the Social Media section)
            </p>
          </div>
        </TabsContent>

        {/* Style Tab */}
        <TabsContent value="style" className="space-y-4">
          {/* Background Image */}
          <div className="space-y-2">
            <Label htmlFor="background-image">Background Image</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="background-image"
                value={headerData.backgroundImage}
                onChange={(e) => handleInputChange('backgroundImage', e.target.value)}
                placeholder="https://example.com/background.jpg"
              />
              <Button
                variant="outline"
                size="icon"
                title="Upload Background Image"
                onClick={handleBackgroundImageUploadClick}
                disabled={isBackgroundImageUploading}
              >
                {isBackgroundImageUploading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                ) : (
                  <Upload className="h-4 w-4" />
                )}
              </Button>
              <input
                type="file"
                ref={backgroundImageInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleBackgroundImageUpload}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Enter an image URL or upload a file (recommended size: 1920x600px)
            </p>
            {headerData.backgroundImage && (
              <div className="mt-2 relative h-24 rounded-md overflow-hidden border">
                <img
                  src={headerData.backgroundImage}
                  alt="Background Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/1920x600?text=Background';
                  }}
                />
              </div>
            )}
          </div>

          {/* Colors and Overlay */}
          <div className="space-y-4">
            <Label>Colors & Overlay</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="background-color" className="text-xs">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="background-color"
                    type="color"
                    value={headerData.backgroundColor}
                    onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                    className="w-12 h-8 p-1"
                  />
                  <Input
                    type="text"
                    value={headerData.backgroundColor}
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
                    value={headerData.textColor}
                    onChange={(e) => handleInputChange('textColor', e.target.value)}
                    className="w-12 h-8 p-1"
                  />
                  <Input
                    type="text"
                    value={headerData.textColor}
                    onChange={(e) => handleInputChange('textColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="overlay-color" className="text-xs">Overlay Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="overlay-color"
                    type="color"
                    value={headerData.overlayColor}
                    onChange={(e) => handleInputChange('overlayColor', e.target.value)}
                    className="w-12 h-8 p-1"
                  />
                  <Input
                    type="text"
                    value={headerData.overlayColor}
                    onChange={(e) => handleInputChange('overlayColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="overlay-opacity" className="text-xs">Overlay Opacity</Label>
                <div className="flex flex-col gap-1">
                  <Slider
                    id="overlay-opacity"
                    value={[headerData.overlayOpacity]}
                    max={1}
                    step={0.05}
                    onValueChange={(val) => handleInputChange('overlayOpacity', val[0])}
                    className="py-2"
                  />
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">0%</span>
                    <span className="text-xs font-medium">{Math.round(headerData.overlayOpacity * 100)}%</span>
                    <span className="text-xs text-muted-foreground">100%</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              The overlay is a colored layer between the background image and the text to improve readability
            </p>
          </div>
        </TabsContent>

        {/* Layout Tab */}
        <TabsContent value="layout" className="space-y-4">
          {/* Text Alignment */}
          <div className="space-y-2">
            <Label>Text Alignment</Label>
            <div className="flex justify-around p-2 border rounded-md">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={headerData.alignment === 'left' ? 'default' : 'outline'}
                      className="flex flex-col items-center gap-1 h-auto py-2 px-4"
                      onClick={() => handleInputChange('alignment', 'left')}
                    >
                      <AlignLeft className="w-5 h-5" />
                      <span className="text-xs">Left</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Align text to the left</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={headerData.alignment === 'center' ? 'default' : 'outline'}
                      className="flex flex-col items-center gap-1 h-auto py-2 px-4"
                      onClick={() => handleInputChange('alignment', 'center')}
                    >
                      <AlignCenter className="w-5 h-5" />
                      <span className="text-xs">Center</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Center align text</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={headerData.alignment === 'right' ? 'default' : 'outline'}
                      className="flex flex-col items-center gap-1 h-auto py-2 px-4"
                      onClick={() => handleInputChange('alignment', 'right')}
                    >
                      <AlignRight className="w-5 h-5" />
                      <span className="text-xs">Right</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Align text to the right</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Header Height */}
          <div className="space-y-2">
            <Label>Header Height</Label>
            <Select
              value={headerData.height}
              onValueChange={(value) => handleInputChange('height', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select height" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small (300px)</SelectItem>
                <SelectItem value="medium">Medium (500px)</SelectItem>
                <SelectItem value="large">Large (700px)</SelectItem>
                <SelectItem value="fullscreen">Fullscreen (100vh)</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2 mt-2">
              <Switch
                checked={headerData.fullscreen}
                onCheckedChange={(checked) => handleInputChange('fullscreen', checked)}
                id="fullscreen-switch"
              />
              <Label htmlFor="fullscreen-switch" className="cursor-pointer">
                Fullscreen Mode
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Enabling fullscreen mode will make the header take up the entire viewport height
            </p>
          </div>

          {/* Header Variants */}
          <div className="space-y-2">
            <Label>Header Variant</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Card
                className={`cursor-pointer transition-all ${headerData.variant === 'standard' ? 'border-primary' : 'border-muted'}`}
                onClick={() => handleInputChange('variant', 'standard')}
              >
                <CardContent className="p-3 flex flex-col items-center">
                  <div className="bg-muted/30 h-16 w-full rounded flex items-center justify-center mb-2">
                    <div className="w-12 h-12 rounded-full bg-primary/20 mr-2"></div>
                    <div className="space-y-1">
                      <div className="h-3 w-20 bg-muted rounded"></div>
                      <div className="h-2 w-24 bg-muted rounded"></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium">Standard</span>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${headerData.variant === 'minimal' ? 'border-primary' : 'border-muted'}`}
                onClick={() => handleInputChange('variant', 'minimal')}
              >
                <CardContent className="p-3 flex flex-col items-center">
                  <div className="bg-muted/30 h-16 w-full rounded flex items-center justify-center mb-2">
                    <div className="space-y-1">
                      <div className="h-3 w-20 bg-muted rounded"></div>
                      <div className="h-2 w-24 bg-muted rounded"></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium">Minimal</span>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${headerData.variant === 'centered' ? 'border-primary' : 'border-muted'}`}
                onClick={() => handleInputChange('variant', 'centered')}
              >
                <CardContent className="p-3 flex flex-col items-center">
                  <div className="bg-muted/30 h-16 w-full rounded flex flex-col items-center justify-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 mb-1"></div>
                    <div className="space-y-1 flex flex-col items-center">
                      <div className="h-2 w-16 bg-muted rounded"></div>
                      <div className="h-1 w-20 bg-muted rounded"></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium">Centered</span>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${headerData.variant === 'split' ? 'border-primary' : 'border-muted'}`}
                onClick={() => handleInputChange('variant', 'split')}
              >
                <CardContent className="p-3 flex flex-col items-center">
                  <div className="bg-muted/30 h-16 w-full rounded grid grid-cols-2 mb-2">
                    <div className="flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-primary/20"></div>
                    </div>
                    <div className="flex items-center">
                      <div className="space-y-1">
                        <div className="h-2 w-12 bg-muted rounded"></div>
                        <div className="h-1 w-16 bg-muted rounded"></div>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-medium">Split</span>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-4">
          <div className="p-4 bg-muted/20 rounded-lg border border-muted">
            <h3 className="text-sm font-medium mb-2">Header Performance Tips</h3>
            <ul className="text-xs text-muted-foreground space-y-2">
              <li className="flex items-start">
                <Badge variant="outline" className="mr-2 mt-0.5">Tip</Badge>
                Use smaller image files for better loading speed. Consider optimizing images before upload.
              </li>
              <li className="flex items-start">
                <Badge variant="outline" className="mr-2 mt-0.5">Tip</Badge>
                If using background image, ensure good contrast with text for better readability.
              </li>
              <li className="flex items-start">
                <Badge variant="outline" className="mr-2 mt-0.5">Tip</Badge>
                Keep your header content concise and focused for better user engagement.
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label>Header Extras</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="header-sticky"
                  checked={headerData.sticky}
                  onCheckedChange={(checked) => handleInputChange('sticky', checked)}
                />
                <Label htmlFor="header-sticky">Sticky Header</Label>
              </div>
              <p className="text-xs text-muted-foreground pl-7">
                Make the header stick to the top when scrolling
              </p>

              <div className="flex items-center space-x-2 mt-2">
                <Switch
                  id="header-animation"
                  checked={headerData.animation}
                  onCheckedChange={(checked) => handleInputChange('animation', checked)}
                />
                <Label htmlFor="header-animation">Enable Animations</Label>
              </div>
              <p className="text-xs text-muted-foreground pl-7">
                Add subtle animations to header elements
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-class">Custom CSS Class</Label>
            <Input
              id="custom-class"
              value={headerData.customClass}
              onChange={(e) => handleInputChange('customClass', e.target.value)}
              placeholder="my-custom-header-class"
            />
            <p className="text-xs text-muted-foreground">
              Add custom CSS classes to the header container (advanced users)
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

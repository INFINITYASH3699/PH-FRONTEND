import { useState, useEffect, useRef } from 'react';
import {
  PlusCircle,
  X,
  Upload,
  UserCircle,
  HelpCircle,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  Palette,
  LayoutGrid
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/components/providers/AuthContext';
import { toast } from 'sonner';
import apiClient from '@/lib/apiClient';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';

interface Highlight {
  title: string;
  description: string;
  icon?: string;
  color?: string;
}

interface AboutEditorProps {
  data: {
    title?: string;
    bio?: string;
    image?: string;
    variant?: string;
    highlights?: Highlight[];
    background?: string;
    backgroundOpacity?: number;
    alignment?: string;
    showQuote?: boolean;
    quote?: string;
    quoteAuthor?: string;
    sectionId?: string;
    backgroundImage?: string;
    textColor?: string;
  };
  onChange: (data: any) => void;
}

export default function AboutEditor({ data, onChange }: AboutEditorProps) {
  // Get user data from auth context
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set default values if data is empty
  const aboutData = {
    title: data?.title || 'About Me',
    bio: data?.bio || 'Share your story, background, and what makes you unique.',
    image: data?.image || '',
    variant: data?.variant || 'standard',
    highlights: data?.highlights || [
      { title: 'My Expertise', description: 'Describe your main area of expertise.' },
      { title: 'Experience', description: 'Highlight your years of experience or key skills.' },
      { title: 'Education', description: 'Share your educational background.' }
    ],
    background: data?.background || '#ffffff',
    backgroundOpacity: data?.backgroundOpacity ?? 1,
    alignment: data?.alignment || 'left',
    showQuote: data?.showQuote ?? false,
    quote: data?.quote || '',
    quoteAuthor: data?.quoteAuthor || '',
    sectionId: data?.sectionId || '',
    backgroundImage: data?.backgroundImage || '',
    textColor: data?.textColor || '#18181b'
  };

  // Check if user has a profile picture when the component mounts
  useEffect(() => {
    if (!aboutData.image && user?.profilePicture) {
      toast.info(
        <div className="flex flex-col">
          <div className="font-medium">Profile picture detected</div>
          <div className="text-sm">Click "Use Profile Picture" to add it to your About section</div>
        </div>,
        {
          duration: 5000,
          action: {
            label: "Use Now",
            onClick: () => handleUseProfilePicture()
          }
        }
      );
    }
    // eslint-disable-next-line
  }, [user]);

  // Handle using the user's profile picture
  const handleUseProfilePicture = () => {
    if (user?.profilePicture) {
      handleInputChange('image', user.profilePicture);
      toast.success('Profile picture added to About section');
    } else {
      toast.error('No profile picture found. Upload one in your profile settings.');
    }
  };

  // Handle input changes for simple fields
  const handleInputChange = (field: string, value: any) => {
    onChange({
      ...aboutData,
      [field]: value
    });
  };

  // Handle variant change
  const handleVariantChange = (value: string) => {
    onChange({
      ...aboutData,
      variant: value
    });
  };

  // Handle highlight changes
  const handleHighlightChange = (index: number, field: keyof Highlight, value: string) => {
    const updatedHighlights = [...aboutData.highlights];
    updatedHighlights[index] = {
      ...updatedHighlights[index],
      [field]: value
    };

    onChange({
      ...aboutData,
      highlights: updatedHighlights
    });
  };

  // Add a new highlight
  const handleAddHighlight = () => {
    const updatedHighlights = [
      ...aboutData.highlights,
      { title: 'New Highlight', description: 'Description of this highlight.' }
    ];

    onChange({
      ...aboutData,
      highlights: updatedHighlights
    });
  };

  // Remove a highlight
  const handleRemoveHighlight = (index: number) => {
    const updatedHighlights = [...aboutData.highlights];
    updatedHighlights.splice(index, 1);

    onChange({
      ...aboutData,
      highlights: updatedHighlights
    });
  };

  // Move highlight up/down
  const handleMoveHighlight = (index: number, direction: 'up' | 'down') => {
    const updatedHighlights = [...aboutData.highlights];
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === updatedHighlights.length - 1)
    ) {
      return;
    }
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const [removed] = updatedHighlights.splice(index, 1);
    updatedHighlights.splice(newIndex, 0, removed);

    onChange({
      ...aboutData,
      highlights: updatedHighlights
    });
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const result = await apiClient.uploadImage(file, 'about');

      if (result.success && result.image?.url) {
        handleInputChange('image', result.image.url);
        toast.success('About section image uploaded successfully');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('An unexpected error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };

  // Trigger file input click
  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Handle color change
  const handleColorChange = (field: string, value: string) => {
    onChange({
      ...aboutData,
      [field]: value
    });
  };

  // Handle opacity change
  const handleOpacityChange = (value: number) => {
    onChange({
      ...aboutData,
      backgroundOpacity: value
    });
  };

  // Handle toggle switches
  const handleToggle = (field: string) => {
    onChange({
      ...aboutData,
      [field]: !aboutData[field as keyof typeof aboutData]
    });
  };

  // Handle quote changes
  const handleQuoteChange = (field: string, value: string) => {
    onChange({
      ...aboutData,
      [field]: value
    });
  };

  // Handle alignment change
  const handleAlignmentChange = (value: string) => {
    onChange({
      ...aboutData,
      alignment: value
    });
  };

  // Handle section id
  const handleSectionIdChange = (value: string) => {
    onChange({
      ...aboutData,
      sectionId: value
    });
  };

  // Handle background image
  const handleBackgroundImageChange = (value: string) => {
    onChange({
      ...aboutData,
      backgroundImage: value
    });
  };

  // Handle text color
  const handleTextColorChange = (value: string) => {
    onChange({
      ...aboutData,
      textColor: value
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="main" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="main">Main</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="main">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="about-title">Section Title</Label>
              <Input
                id="about-title"
                value={aboutData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="About Me"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="about-bio">Bio</Label>
              <Textarea
                id="about-bio"
                value={aboutData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Share your professional background and what makes you unique"
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                Write a compelling bio that highlights your expertise and personality
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="about-image">Profile/About Image</Label>
              <div className="flex gap-2">
                <Input
                  id="about-image"
                  value={aboutData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  placeholder="https://example.com/about-image.jpg"
                />
                <Button
                  variant="outline"
                  size="icon"
                  title="Upload Image"
                  type="button"
                  onClick={handleUploadButtonClick}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                {user?.profilePicture && (
                  <Button
                    variant="outline"
                    className="flex items-center gap-1 whitespace-nowrap px-3"
                    onClick={handleUseProfilePicture}
                    type="button"
                    title="Use your profile picture"
                  >
                    <UserCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Use Profile Picture</span>
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Enter an image URL or upload a file (recommended size: 800x600px)
              </p>
              {aboutData.image && (
                <div className="mt-2 relative w-32 h-24 rounded overflow-hidden border">
                  <img
                    src={aboutData.image}
                    alt="About Image Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/800x600?text=About';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label>Section Layout</Label>
              <RadioGroup
                value={aboutData.variant}
                onValueChange={handleVariantChange}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="standard" id="variant-standard" />
                  <Label htmlFor="variant-standard">Standard (Text only)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="with-image" id="variant-with-image" />
                  <Label htmlFor="variant-with-image">With Image (Text + Image)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="with-highlights" id="variant-highlights" />
                  <Label htmlFor="variant-highlights">With Highlights (Text + Highlight Cards)</Label>
                </div>
              </RadioGroup>
            </div>

            {aboutData.variant === 'with-highlights' && (
              <div className="space-y-3 pt-2">
                <Label>Highlights</Label>
                {aboutData.highlights.map((highlight, index) => (
                  <div key={index} className="border rounded-md p-3 space-y-2">
                    <div className="flex justify-between items-center gap-2">
                      <Label className="text-sm">Highlight {index + 1}</Label>
                      <div className="flex gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={index === 0}
                                onClick={() => handleMoveHighlight(index, 'up')}
                                className="h-8 w-8"
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Move Up</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={index === aboutData.highlights.length - 1}
                                onClick={() => handleMoveHighlight(index, 'down')}
                                className="h-8 w-8"
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Move Down</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => handleRemoveHighlight(index)}
                                disabled={aboutData.highlights.length <= 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Remove Highlight</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>

                    <Input
                      value={highlight.title}
                      onChange={(e) => handleHighlightChange(index, 'title', e.target.value)}
                      placeholder="Highlight Title"
                      className="mb-2"
                    />

                    <Textarea
                      value={highlight.description}
                      onChange={(e) => handleHighlightChange(index, 'description', e.target.value)}
                      placeholder="Highlight Description"
                      rows={2}
                    />

                    {/* Optional icon and color fields for highlight */}
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type="text"
                        value={highlight.icon || ''}
                        onChange={(e) => handleHighlightChange(index, 'icon', e.target.value)}
                        placeholder="Icon (optional)"
                        className="w-1/2"
                      />
                      <Input
                        type="color"
                        value={highlight.color || '#efefef'}
                        onChange={(e) => handleHighlightChange(index, 'color', e.target.value)}
                        title="Highlight Color"
                        className="w-8 h-8 p-0 border-none"
                        style={{ background: highlight.color || '#efefef' }}
                      />
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleAddHighlight}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Highlight
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="layout">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label>Alignment</Label>
              <Select value={aboutData.alignment} onValueChange={handleAlignmentChange}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Alignment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <Label>Text Color</Label>
              <Input
                type="color"
                value={aboutData.textColor}
                onChange={(e) => handleTextColorChange(e.target.value)}
                className="w-8 h-8 p-0 border-none"
                style={{ background: aboutData.textColor }}
              />
              <Input
                type="text"
                value={aboutData.textColor}
                onChange={(e) => handleTextColorChange(e.target.value)}
                className="w-28"
              />
            </div>
            <div className="flex items-center gap-4">
              <Label>Background Color</Label>
              <Input
                type="color"
                value={aboutData.background}
                onChange={(e) => handleColorChange('background', e.target.value)}
                className="w-8 h-8 p-0 border-none"
                style={{ background: aboutData.background }}
              />
              <Input
                type="text"
                value={aboutData.background}
                onChange={(e) => handleColorChange('background', e.target.value)}
                className="w-28"
              />
              <div className="flex items-center gap-2 ml-4">
                <Label className="text-xs">Opacity</Label>
                <Input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={aboutData.backgroundOpacity}
                  onChange={(e) => handleOpacityChange(Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-xs">{Math.round(aboutData.backgroundOpacity * 100)}%</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Label>Background Image</Label>
              <Input
                type="text"
                value={aboutData.backgroundImage}
                onChange={(e) => handleBackgroundImageChange(e.target.value)}
                placeholder="https://example.com/background.jpg"
                className="flex-1"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="advanced">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label htmlFor="section-id">Section ID</Label>
              <Input
                id="section-id"
                value={aboutData.sectionId}
                onChange={(e) => handleSectionIdChange(e.target.value)}
                placeholder="about-section"
                className="flex-1"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span className="text-xs">
                      Set a unique section ID for anchor links (e.g. #about-section)
                    </span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-4">
              <Switch
                checked={aboutData.showQuote}
                onCheckedChange={() => handleToggle('showQuote')}
                id="toggle-quote"
              />
              <Label htmlFor="toggle-quote">Show Quote</Label>
            </div>
            {aboutData.showQuote && (
              <div className="space-y-2 pl-6">
                <Label>Quote</Label>
                <Textarea
                  value={aboutData.quote}
                  onChange={(e) => handleQuoteChange('quote', e.target.value)}
                  placeholder="Inspirational quote"
                  rows={2}
                />
                <Label>Quote Author</Label>
                <Input
                  value={aboutData.quoteAuthor}
                  onChange={(e) => handleQuoteChange('quoteAuthor', e.target.value)}
                  placeholder="Quote author"
                />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

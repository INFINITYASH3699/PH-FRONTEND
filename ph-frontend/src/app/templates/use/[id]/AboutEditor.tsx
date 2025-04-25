import { useState, useEffect } from 'react';
import { PlusCircle, X, Upload, UserCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/components/providers/AuthContext';
import { toast } from 'sonner';

interface Highlight {
  title: string;
  description: string;
}

interface AboutEditorProps {
  data: {
    title?: string;
    bio?: string;
    image?: string;
    variant?: string;
    highlights?: Highlight[];
  };
  onChange: (data: any) => void;
}

export default function AboutEditor({ data, onChange }: AboutEditorProps) {
  // Get user data from auth context
  const { user } = useAuth();

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
    ]
  };

  // Check if user has a profile picture when the component mounts
  useEffect(() => {
    // If no image is set yet but user has a profile picture, suggest using it
    if (!aboutData.image && user?.profilePicture) {
      // Show a toast notification suggesting to use the profile picture
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
  const handleInputChange = (field: string, value: string) => {
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
  const handleHighlightChange = (index: number, field: 'title' | 'description', value: string) => {
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

  return (
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
        <Label htmlFor="about-image">Profile/About Image URL</Label>
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
          >
            <Upload className="h-4 w-4" />
          </Button>
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
        {/* Display image preview if available */}
        {aboutData.image ? (
          <div className="mt-2 relative h-28 rounded-md overflow-hidden border">
            <img
              src={aboutData.image}
              alt="About Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/400x200?text=About+Image';
              }}
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-1 right-1 h-7 w-7 p-0"
              onClick={() => handleInputChange('image', '')}
              title="Remove image"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : user?.profilePicture ? (
          <div className="mt-2 flex items-center text-sm text-muted-foreground">
            <span>You have a profile picture available. Click "Use Profile Picture" to add it here.</span>
          </div>
        ) : null}
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
              <div className="flex justify-between items-center">
                <Label className="text-sm">Highlight {index + 1}</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemoveHighlight(index)}
                  disabled={aboutData.highlights.length <= 1}
                >
                  <X className="h-4 w-4" />
                </Button>
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
  );
}

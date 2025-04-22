'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
  Youtube,
  Dribbble,
  Codepen,
  Globe,
  AtSign,
  Trash2
} from 'lucide-react';

// Define social links interface
export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

interface SocialLinksContent {
  links: SocialLink[];
}

// Updated props to match how it's being used in EditorSidebar
interface SocialLinksEditorProps {
  data: any; // Change from content to data to match how it's called in EditorSidebar
  onChange: (content: SocialLinksContent) => void; // Change from onSave to onChange
  isLoading?: boolean;
}

// Available platforms with their icons
const PLATFORMS = [
  { name: 'GitHub', value: 'github', icon: 'Github' },
  { name: 'Twitter', value: 'twitter', icon: 'Twitter' },
  { name: 'LinkedIn', value: 'linkedin', icon: 'Linkedin' },
  { name: 'Instagram', value: 'instagram', icon: 'Instagram' },
  { name: 'Facebook', value: 'facebook', icon: 'Facebook' },
  { name: 'YouTube', value: 'youtube', icon: 'Youtube' },
  { name: 'Dribbble', value: 'dribbble', icon: 'Dribbble' },
  { name: 'CodePen', value: 'codepen', icon: 'Codepen' },
  { name: 'Personal Website', value: 'website', icon: 'Globe' },
  { name: 'Email', value: 'email', icon: 'AtSign' },
  { name: 'Other', value: 'other', icon: 'Globe' },
];

export default function SocialLinksEditor({ data, onChange, isLoading = false }: SocialLinksEditorProps) {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(data?.links || []);
  const [newPlatform, setNewPlatform] = useState<string>('');
  const [newUrl, setNewUrl] = useState<string>('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Get the icon component for a platform
  const getIconForPlatform = (platform: string) => {
    switch (platform) {
      case 'github':
        return <Github className="h-5 w-5" />;
      case 'twitter':
        return <Twitter className="h-5 w-5" />;
      case 'linkedin':
        return <Linkedin className="h-5 w-5" />;
      case 'instagram':
        return <Instagram className="h-5 w-5" />;
      case 'facebook':
        return <Facebook className="h-5 w-5" />;
      case 'youtube':
        return <Youtube className="h-5 w-5" />;
      case 'dribbble':
        return <Dribbble className="h-5 w-5" />;
      case 'codepen':
        return <Codepen className="h-5 w-5" />;
      case 'website':
        return <Globe className="h-5 w-5" />;
      case 'email':
        return <AtSign className="h-5 w-5" />;
      default:
        return <Globe className="h-5 w-5" />;
    }
  };

  // Get available platforms (those not yet added)
  const getAvailablePlatforms = () => {
    const usedPlatforms = socialLinks.map(link => link.platform);
    return PLATFORMS.filter(platform => !usedPlatforms.includes(platform.value));
  };

  // Validate the URL input
  const validateUrl = (url: string, platform: string): boolean => {
    if (!url) {
      setErrors({ url: 'URL is required' });
      return false;
    }

    if (platform === 'email') {
      // Special case for email
      if (url.startsWith('mailto:')) {
        // Valid mailto link
        return true;
      }

      // Check if it's a valid email address
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(url)) {
        setErrors({ url: 'Please enter a valid email address' });
        return false;
      }

      return true;
    } else {
      // For other platforms, ensure URL has http:// or https://
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        setErrors({ url: 'URL must start with http:// or https://' });
        return false;
      }
    }

    return true;
  };

  // Add a new social link
  const handleAddSocialLink = () => {
    if (!newPlatform) {
      setErrors({ platform: 'Please select a platform' });
      return;
    }

    if (!validateUrl(newUrl, newPlatform)) {
      return;
    }

    // Clear any errors
    setErrors({});

    // Format email links properly
    let formattedUrl = newUrl;
    if (newPlatform === 'email' && !newUrl.startsWith('mailto:')) {
      formattedUrl = `mailto:${newUrl}`;
    }

    // Find the platform info to get the icon
    const platformInfo = PLATFORMS.find(p => p.value === newPlatform);

    // Create the new link
    const newLink: SocialLink = {
      platform: newPlatform,
      url: formattedUrl,
      icon: platformInfo?.icon || 'Globe'
    };

    // Update state
    const updatedLinks = [...socialLinks, newLink];
    setSocialLinks(updatedLinks);

    // Reset inputs
    setNewPlatform('');
    setNewUrl('');

    // Save changes
    onChange({ links: updatedLinks });
    toast.success('Social link added successfully');
  };

  // Delete a social link
  const handleDeleteSocialLink = (index: number) => {
    const updatedLinks = [...socialLinks];
    const removedPlatform = updatedLinks[index].platform;
    updatedLinks.splice(index, 1);

    setSocialLinks(updatedLinks);
    onChange({ links: updatedLinks });
    toast.success(`${getPlatformName(removedPlatform)} link removed successfully`);
  };

  // Get the display name for a platform value
  const getPlatformName = (platformValue: string): string => {
    const platform = PLATFORMS.find(p => p.value === platformValue);
    return platform ? platform.name : platformValue;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h3 className="text-lg font-medium">Social Links</h3>
        <p className="text-muted-foreground">
          Add links to your social media profiles or other platforms to help visitors connect with you.
        </p>
      </div>

      {/* Current social links */}
      {socialLinks.length > 0 ? (
        /* List of current social links */
        <div className="space-y-4">
          {socialLinks.map((link, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border rounded-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-accent/30 rounded-full flex items-center justify-center">
                  {getIconForPlatform(link.platform)}
                </div>
                <div>
                  <h4 className="font-medium">{getPlatformName(link.platform)}</h4>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {link.url}
                  </a>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteSocialLink(index)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        /* Empty state if no social links */
        <div className="border rounded-lg p-8 text-center">
          <h4 className="text-lg font-medium mb-2">No social links added yet</h4>
          <p className="text-muted-foreground mb-4">
            Add links to your social media profiles to help visitors connect with you.
          </p>
        </div>
      )}

      {/* Add new social link */}
      <Card>
        <CardHeader>
          <CardTitle>Add Social Link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Platform selector */}
          <div className="space-y-2">
            <label htmlFor="platform" className="text-sm font-medium">
              Platform <span className="text-red-500">*</span>
            </label>
            <select
              id="platform"
              className="w-full p-2 border rounded-md bg-background"
              value={newPlatform}
              onChange={(e) => setNewPlatform(e.target.value)}
              disabled={getAvailablePlatforms().length === 0}
            >
              <option value="">Select a platform</option>
              {getAvailablePlatforms().map((platform) => (
                <option key={platform.value} value={platform.value}>
                  {platform.name}
                </option>
              ))}
            </select>
            {errors.platform && <p className="text-red-500 text-xs mt-1">{errors.platform}</p>}
            {getAvailablePlatforms().length === 0 && (
              <p className="text-amber-500 text-xs mt-1">
                You've added all available platforms. Delete an existing one to add a different platform.
              </p>
            )}
          </div>

          {/* URL input */}
          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium">
              {newPlatform === 'email' ? 'Email Address' : 'URL'} <span className="text-red-500">*</span>
            </label>
            <Input
              id="url"
              placeholder={newPlatform === 'email'
                ? "your.email@example.com"
                : "https://www.example.com/your-profile"}
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className={errors.url ? "border-red-500" : ""}
            />
            {errors.url && <p className="text-red-500 text-xs mt-1">{errors.url}</p>}
            <p className="text-xs text-muted-foreground">
              {newPlatform === 'email'
                ? "Enter your email address. It will be automatically converted to a mailto: link."
                : "Enter the full URL including http:// or https://"}
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleAddSocialLink}
            disabled={!newPlatform || !newUrl || isLoading || getAvailablePlatforms().length === 0}
          >
            Add Social Link
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

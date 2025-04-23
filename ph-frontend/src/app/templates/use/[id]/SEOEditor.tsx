import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Lock, Unlock, AlertCircle } from 'lucide-react';

interface SEOEditorProps {
  data: any;
  onChange: (data: any) => void;
  subdomain?: string;
  onSubdomainChange?: (subdomain: string) => void;
  isSubdomainLocked?: boolean;
  userType?: 'free' | 'premium';
}

export default function SEOEditor({
  data,
  onChange,
  subdomain,
  onSubdomainChange,
  isSubdomainLocked = false,
  userType = 'free'
}: SEOEditorProps) {
  const handleChange = (field: string, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  // Handle subdomain input change
  const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only alphanumeric characters and hyphens
    const sanitizedValue = e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();

    if (onSubdomainChange) {
      onSubdomainChange(sanitizedValue);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="seo-title">Page Title</Label>
        <Input
          id="seo-title"
          value={data.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="My Professional Portfolio | Software Developer"
        />
        <p className="text-xs text-muted-foreground mt-1">
          This will appear in browser tabs and search results.
        </p>
      </div>

      <div>
        <Label htmlFor="seo-description">Meta Description</Label>
        <Textarea
          id="seo-description"
          value={data.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="A portfolio showcasing my skills, projects, and professional experience."
          className="min-h-[100px]"
        />
        <p className="text-xs text-muted-foreground mt-1">
          A brief description for search engines. Keep it under 160 characters.
        </p>
      </div>

      <div>
        <Label htmlFor="seo-keywords">Keywords</Label>
        <Input
          id="seo-keywords"
          value={data.keywords || ''}
          onChange={(e) => handleChange('keywords', e.target.value)}
          placeholder="portfolio, developer, projects, skills"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Comma-separated keywords for search engines.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="subdomain">
            Custom Subdomain
            {isSubdomainLocked ?
              <Lock className="h-3 w-3 inline ml-1 text-amber-500" /> :
              <Unlock className="h-3 w-3 inline ml-1 text-green-500" />
            }
          </Label>
          {userType === 'free' && (
            <span className="text-xs text-amber-600 font-medium">Free Account</span>
          )}
          {userType === 'premium' && (
            <span className="text-xs text-green-600 font-medium">Premium Account</span>
          )}
        </div>

        <div className="flex">
          <Input
            id="subdomain"
            value={subdomain || ''}
            onChange={handleSubdomainChange}
            placeholder="your-subdomain"
            className="flex-grow"
            disabled={isSubdomainLocked}
          />
          <span className="flex items-center pl-2 pr-3 bg-gray-100 border-y border-r border-gray-300 rounded-r-md text-sm text-gray-600">
            .portfoliohub.io
          </span>
        </div>

        {isSubdomainLocked ? (
          <div className="mt-2 flex items-start space-x-2 rounded-md bg-amber-50 p-2 text-amber-800 text-xs">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Subdomain is locked</p>
              <p className="mt-1">
                For free accounts, subdomain can't be changed after it's been set.
                {userType === 'free' && (
                  <> Upgrade to a premium account to customize your subdomain.</>
                )}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground mt-1">
            Choose a custom subdomain for your portfolio. Only lowercase letters, numbers, and hyphens allowed.
            {userType === 'premium' && (
              <> As a premium user, you can change your subdomain at any time.</>
            )}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="seo-og-image">Social Media Image URL (Optional)</Label>
        <Input
          id="seo-og-image"
          value={data.ogImage || ''}
          onChange={(e) => handleChange('ogImage', e.target.value)}
          placeholder="https://example.com/my-image.jpg"
        />
        <p className="text-xs text-muted-foreground mt-1">
          URL to an image that will be displayed when sharing your portfolio on social media.
        </p>
      </div>

      <div className="bg-blue-50 p-3 rounded-md mt-6">
        <div className="flex items-start">
          <InfoCircledIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">SEO Best Practices</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Keep your title under 60 characters</li>
              <li>Make your description compelling and under 160 characters</li>
              <li>Use relevant keywords that describe your portfolio</li>
              <li>Choose a subdomain that is professional and easy to remember</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

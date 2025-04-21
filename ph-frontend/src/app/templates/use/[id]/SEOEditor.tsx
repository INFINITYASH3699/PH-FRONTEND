'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Define SEO settings interface
interface SEOSettings {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  ogImage?: string;
  structuredData?: string;
  canonical?: string;
}

interface SEOEditorProps {
  content: SEOSettings;
  onSave: (content: SEOSettings) => void;
  isLoading?: boolean;
}

export default function SEOEditor({ content, onSave, isLoading = false }: SEOEditorProps) {
  const [seoSettings, setSeoSettings] = useState<SEOSettings>(content || {
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    ogImage: '',
    structuredData: '',
    canonical: ''
  });

  // Handle input changes and save
  const handleInputChange = (field: keyof SEOSettings, value: string) => {
    const updatedSettings = { ...seoSettings, [field]: value };
    setSeoSettings(updatedSettings);
    onSave(updatedSettings);
  };

  // Calculate character count and show color indicator
  const getMetaTitleClass = () => {
    const length = seoSettings.metaTitle?.length || 0;
    if (length === 0) return '';
    if (length < 40) return 'text-orange-500';
    if (length > 60) return 'text-red-500';
    return 'text-green-500';
  };

  const getMetaDescriptionClass = () => {
    const length = seoSettings.metaDescription?.length || 0;
    if (length === 0) return '';
    if (length < 100) return 'text-orange-500';
    if (length > 160) return 'text-red-500';
    return 'text-green-500';
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h3 className="text-lg font-medium">SEO Settings</h3>
        <p className="text-muted-foreground">
          Optimize your portfolio for search engines to improve visibility and discoverability.
        </p>
      </div>

      {/* Basic SEO Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Basic SEO</CardTitle>
          <CardDescription>
            These settings affect how your portfolio appears in search results.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Meta Title */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label htmlFor="metaTitle" className="text-sm font-medium">
                Meta Title
              </label>
              <span className={`text-xs ${getMetaTitleClass()}`}>
                {seoSettings.metaTitle?.length || 0}/60 characters
              </span>
            </div>
            <Input
              id="metaTitle"
              placeholder="Portfolio of John Doe - Web Developer"
              value={seoSettings.metaTitle || ''}
              onChange={(e) => handleInputChange('metaTitle', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              The title tag that appears in search engine results. Aim for 50-60 characters.
            </p>
          </div>

          {/* Meta Description */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label htmlFor="metaDescription" className="text-sm font-medium">
                Meta Description
              </label>
              <span className={`text-xs ${getMetaDescriptionClass()}`}>
                {seoSettings.metaDescription?.length || 0}/160 characters
              </span>
            </div>
            <Textarea
              id="metaDescription"
              placeholder="John Doe is a web developer specializing in frontend development with React and Next.js."
              value={seoSettings.metaDescription || ''}
              onChange={(e) => handleInputChange('metaDescription', e.target.value)}
              className="min-h-24"
            />
            <p className="text-xs text-muted-foreground">
              The description that appears in search engine results. Aim for 120-160 characters.
            </p>
          </div>

          {/* Keywords */}
          <div className="space-y-2">
            <label htmlFor="keywords" className="text-sm font-medium">
              Keywords (comma separated)
            </label>
            <Input
              id="keywords"
              placeholder="web developer, frontend, react, next.js"
              value={seoSettings.keywords || ''}
              onChange={(e) => handleInputChange('keywords', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Keywords related to your skills and work. Use 5-10 relevant comma-separated keywords.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Advanced SEO Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced SEO</CardTitle>
          <CardDescription>
            These settings are for users with more SEO knowledge.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Canonical URL */}
          <div className="space-y-2">
            <label htmlFor="canonical" className="text-sm font-medium">
              Canonical URL (Optional)
            </label>
            <Input
              id="canonical"
              placeholder="https://www.yourdomain.com/portfolio"
              value={seoSettings.canonical || ''}
              onChange={(e) => handleInputChange('canonical', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              If you have multiple URLs for the same content, specify the preferred URL here.
            </p>
          </div>

          {/* Custom Domain Notice */}
          <div className="p-3 bg-amber-50 text-amber-800 rounded-md text-sm">
            <p className="font-medium">Custom Domain Notice</p>
            <p className="text-xs mt-1">
              Custom domains are only available in paid plans, which are not currently available.
              Your portfolio will be accessible via a PortfolioHub subdomain (username.portfoliohub.com).
            </p>
          </div>

          {/* Open Graph Image */}
          <div className="space-y-2">
            <label htmlFor="ogImage" className="text-sm font-medium">
              Social Sharing Image URL (Optional)
            </label>
            <Input
              id="ogImage"
              placeholder="https://example.com/your-image.jpg"
              value={seoSettings.ogImage || ''}
              onChange={(e) => handleInputChange('ogImage', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              The image that appears when sharing your portfolio on social media. Optimal size is 1200×630 pixels.
            </p>
          </div>

          {/* Structured Data */}
          <div className="space-y-2">
            <label htmlFor="structuredData" className="text-sm font-medium">
              JSON-LD Structured Data (Optional)
            </label>
            <Textarea
              id="structuredData"
              placeholder='{\n  "@context": "https://schema.org",\n  "@type": "Person",\n  "name": "John Doe",\n  "url": "https://johndoe.com",\n  "jobTitle": "Web Developer"\n}'
              value={seoSettings.structuredData || ''}
              onChange={(e) => handleInputChange('structuredData', e.target.value)}
              className="min-h-40 font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              JSON-LD markup for structured data. Helps search engines understand your content better.
            </p>
          </div>

          <div className="p-3 bg-amber-50 text-amber-800 rounded-md text-sm">
            <p className="font-medium">Note:</p>
            <p className="text-xs mt-1">
              Most users don't need to fill out the advanced settings.
              The template will automatically generate proper SEO elements using the basic settings.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* SEO Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Search Result Preview</CardTitle>
          <CardDescription>
            How your page might appear in Google search results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md p-4 bg-white">
            <div className="text-blue-600 hover:underline font-medium text-xl truncate">
              {seoSettings.metaTitle || 'Portfolio Title - Your Name and Profession'}
            </div>
            <div className="text-green-700 text-sm mt-1">
              portfoliohub.com/{content.canonical || 'yoursubdomain'}
            </div>
            <div className="text-gray-600 text-sm mt-1 line-clamp-2">
              {seoSettings.metaDescription || 'This is where your meta description will appear in search results. Make it compelling to increase click-through rates.'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

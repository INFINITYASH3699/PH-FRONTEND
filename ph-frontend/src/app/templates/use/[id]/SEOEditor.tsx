import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface SEOEditorProps {
  data: {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
    customHead?: string;
  };
  onChange: (data: any) => void;
}

export default function SEOEditor({ data, onChange }: SEOEditorProps) {
  // Default SEO data
  const seoData = {
    title: data?.title || '',
    description: data?.description || '',
    keywords: data?.keywords || '',
    ogImage: data?.ogImage || '',
    customHead: data?.customHead || ''
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    onChange({
      ...seoData,
      [field]: value
    });
  };

  // Generate a preview of the meta tags
  const generateMetaPreview = () => {
    return `<!-- Basic Meta Tags -->
<title>${seoData.title || 'Your Portfolio Title'}</title>
<meta name="description" content="${seoData.description || 'Your portfolio description'}">
<meta name="keywords" content="${seoData.keywords || 'portfolio, professional, skills'}">

<!-- Open Graph Meta Tags (for social sharing) -->
<meta property="og:title" content="${seoData.title || 'Your Portfolio Title'}">
<meta property="og:description" content="${seoData.description || 'Your portfolio description'}">
<meta property="og:type" content="website">
${seoData.ogImage ? `<meta property="og:image" content="${seoData.ogImage}">` : '<!-- No OG Image specified -->'}

<!-- Additional Meta Tags -->
<meta name="author" content="Your Name">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

${seoData.customHead || '<!-- No custom header tags -->'}`;
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="seo-title">
          Page Title
          <span className="text-xs text-muted-foreground ml-2">(60-70 characters recommended)</span>
        </Label>
        <Input
          id="seo-title"
          value={seoData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Your Portfolio | Professional Web Developer"
          maxLength={70}
        />
        <div className="flex justify-between">
          <p className="text-xs text-muted-foreground">
            This appears in browser tabs and search results
          </p>
          <p className="text-xs">
            {seoData.title?.length || 0}/70
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="seo-description">
          Meta Description
          <span className="text-xs text-muted-foreground ml-2">(150-160 characters recommended)</span>
        </Label>
        <Textarea
          id="seo-description"
          value={seoData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="A brief description of your portfolio and professional services. This appears in search engine results."
          maxLength={160}
          rows={3}
        />
        <div className="flex justify-between">
          <p className="text-xs text-muted-foreground">
            This appears in search engine results
          </p>
          <p className="text-xs">
            {seoData.description?.length || 0}/160
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="seo-keywords">
          Meta Keywords
          <span className="text-xs text-muted-foreground ml-2">(comma-separated)</span>
        </Label>
        <Input
          id="seo-keywords"
          value={seoData.keywords}
          onChange={(e) => handleInputChange('keywords', e.target.value)}
          placeholder="portfolio, web developer, designer, professional"
        />
        <p className="text-xs text-muted-foreground">
          Keywords help search engines categorize your page (less important today but still useful)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="seo-og-image">Social Share Image URL</Label>
        <Input
          id="seo-og-image"
          value={seoData.ogImage}
          onChange={(e) => handleInputChange('ogImage', e.target.value)}
          placeholder="https://example.com/your-og-image.jpg"
        />
        <p className="text-xs text-muted-foreground">
          This image appears when your portfolio is shared on social media (recommended size: 1200×630px)
        </p>
        {seoData.ogImage && (
          <div className="mt-2 relative h-28 rounded-md overflow-hidden border">
            <img
              src={seoData.ogImage}
              alt="OG Image Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/1200x630?text=OG+Image';
              }}
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="seo-custom-head">
          Custom <code className="text-xs bg-muted px-1 rounded">&lt;head&gt;</code> Tags
          <span className="text-xs text-muted-foreground ml-2">(advanced)</span>
        </Label>
        <Textarea
          id="seo-custom-head"
          value={seoData.customHead}
          onChange={(e) => handleInputChange('customHead', e.target.value)}
          placeholder="<!-- Add custom meta tags, scripts, or other head elements here -->"
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          Add custom tags for analytics, fonts, or other head elements (be careful with this)
        </p>
      </div>

      <div className="border rounded-md overflow-hidden">
        <div className="bg-muted px-3 py-2 text-xs font-mono border-b">
          Generated Meta Tags Preview
        </div>
        <pre className="text-xs overflow-x-auto p-3 bg-gray-50 dark:bg-gray-900 max-h-[200px]">
          <code>{generateMetaPreview()}</code>
        </pre>
      </div>

      <div className="bg-muted/50 rounded-md p-3">
        <h4 className="text-sm font-medium mb-2">SEO Tips</h4>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
          <li>Make your title descriptive and include relevant keywords</li>
          <li>Write a compelling meta description to improve click-through rates</li>
          <li>Use a high-quality, relevant image for social sharing</li>
          <li>Remember that good content is the most important factor for SEO</li>
        </ul>
      </div>
    </div>
  );
}

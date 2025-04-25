'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import apiClient from '@/lib/apiClient';
import { useAuth } from '@/components/providers/AuthContext';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Categories to filter templates
const categories = [
  { id: 'all', name: 'All Templates' },
  { id: 'developer', name: 'Developer' },
  { id: 'designer', name: 'Designer' },
  { id: 'photographer', name: 'Photographer' },
  { id: 'professional', name: 'Professional' },
  { id: 'creative', name: 'Creative' },
  { id: 'minimal', name: 'Minimal' },
];

interface Template {
  _id: string;
  name: string;
  description: string;
  category: string;
  previewImage: string;
  isFeatured: boolean;
  isPremium?: boolean;
  layouts?: any[];
  sectionVariants?: Record<string, any[]>;
  stylePresets?: Record<string, { name: string }>;
  usageCount?: number;
}

const TemplateCard = ({
  template,
  onSelectTemplate,
  used,
  portfolioId,
}: {
  template: Template;
  onSelectTemplate: (id: string) => void;
  used: boolean;
  portfolioId?: string;
}) => {
  const [showVariants, setShowVariants] = useState(false);

  // Count available variants
  const countVariants = () => {
    let count = 0;

    // Count section variants
    if (template.sectionVariants) {
      Object.values(template.sectionVariants).forEach((variants: any) => {
        if (Array.isArray(variants)) {
          count += variants.length;
        }
      });
    }

    // Count layouts
    if (template.layouts && Array.isArray(template.layouts)) {
      count += template.layouts.length;
    }

    // Count style presets
    if (template.stylePresets) {
      count += Object.keys(template.stylePresets).length;
    }

    return count;
  };

  const variantCount = countVariants();

  return (
    <div className="group relative rounded-lg border overflow-hidden bg-white shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Image
          src={template.previewImage}
          alt={template.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {used && (
          <div className="absolute top-2 right-2 z-10 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">
            Already In Use
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="font-medium text-lg">{template.name}</h3>
            <p className="text-sm text-muted-foreground">{template.description}</p>
          </div>

          {template.isPremium && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              Premium
            </Badge>
          )}
        </div>

        <div className="flex items-center mt-2 text-sm text-muted-foreground gap-2 flex-wrap">
          <Badge variant="outline" className="capitalize">
            {template.category}
          </Badge>
          {variantCount > 0 && (
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3" />
              {variantCount} variations
            </span>
          )}
          {template.isFeatured && (
            <Badge variant="outline" className="text-xs bg-violet-100 text-violet-800 px-2 py-1 rounded">
              Featured
            </Badge>
          )}
          {used && (
            <Badge variant="outline" className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              In Your Portfolio
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {template.layouts?.length || 1} layouts
          </Badge>
        </div>

        {/* Preview variants button */}
        {variantCount > 0 && (
          <div className="mt-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full flex items-center justify-between text-xs"
              onClick={(e) => {
                e.stopPropagation();
                setShowVariants(!showVariants);
              }}
            >
              <span>Preview variations</span>
              {showVariants ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>

            {/* Variants preview */}
            {showVariants && (
              <div className="mt-2 border-t pt-2">
                {/* Layout variants */}
                {template.layouts && template.layouts.length > 0 && (
                  <div className="mb-2">
                    <h4 className="text-xs font-medium mb-1">Layouts</h4>
                    <div className="flex flex-wrap gap-1">
                      {template.layouts.map((layout: any) => (
                        <Badge key={layout.id || layout.name} variant="outline" className="text-xs">
                          {layout.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section variants - just show a sample */}
                {template.sectionVariants && Object.keys(template.sectionVariants).length > 0 && (
                  <div className="mb-2">
                    <h4 className="text-xs font-medium mb-1">Section Styles</h4>
                    <div className="grid grid-cols-2 gap-1">
                      {Object.entries(template.sectionVariants)
                        .slice(0, 2)
                        .map(([section, variants]: [string, any]) => (
                          <div key={section} className="text-xs capitalize">
                            <span>{section}: </span>
                            <span className="text-muted-foreground">{Array.isArray(variants) ? variants.length : 0} styles</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Style presets */}
                {template.stylePresets && Object.keys(template.stylePresets).length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium mb-1">Style Presets</h4>
                    <div className="flex flex-wrap gap-1">
                      {Object.values(template.stylePresets)
                        .slice(0, 3)
                        .map((preset: any, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {preset.name}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {(template.usageCount || 0) > 1 ? `${template.usageCount} users` : '< 10 users'}
          </Badge>

          {used ? (
            <Link href={`/templates/use/${template._id}${portfolioId ? `?portfolioId=${portfolioId}` : ''}`}>
              <Button className="flex gap-1 items-center bg-green-600 hover:bg-green-700 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path>
                  <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon>
                </svg>
                Edit Portfolio
              </Button>
            </Link>
          ) : (
            <Button onClick={() => onSelectTemplate(template._id)} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
              Use Template
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function TemplatesClient({
  initialTemplates,
  currentCategory,
}: {
  initialTemplates: Template[];
  currentCategory: string;
}) {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [category, setCategory] = useState(currentCategory);
  const [usedTemplateIds, setUsedTemplateIds] = useState<Set<string>>(new Set());
  // Add state to store information about existing portfolios by template ID
  const [portfoliosByTemplate, setPortfoliosByTemplate] = useState<Record<string, any>>({});
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user portfolios to identify used templates and map portfolios by template ID
  useEffect(() => {
    const fetchUserPortfolios = async () => {
      if (!isAuthenticated) {
        return;
      }

      try {
        const response = await apiClient.request('/portfolios', 'GET');
        if (response.success && response.portfolios) {
          const usedIds = new Set<string>();
          const portfoliosByTemplateMap: Record<string, any> = {};

          response.portfolios.forEach((portfolio: any) => {
            let templateId = '';

            if (portfolio.templateId?._id) {
              templateId = portfolio.templateId._id;
            } else if (typeof portfolio.templateId === 'string') {
              templateId = portfolio.templateId;
            }

            if (templateId) {
              usedIds.add(templateId);
              portfoliosByTemplateMap[templateId] = portfolio;
            }
          });

          setUsedTemplateIds(usedIds);
          setPortfoliosByTemplate(portfoliosByTemplateMap);
        }
      } catch (error) {
        console.error('Error fetching user portfolios:', error);
      }
    };

    fetchUserPortfolios();
  }, [isAuthenticated, user]);

  // Function to handle category changes
  const handleCategoryChange = async (newCategory: string) => {
    setIsLoading(true);
    setCategory(newCategory);

    try {
      // Update URL without page reload
      const url = new URL(window.location.href);
      url.searchParams.set('category', newCategory);
      window.history.pushState({}, '', url.toString());

      // Fetch templates for the new category
      let endpoint = '/templates';
      if (newCategory !== 'all') {
        endpoint += `?category=${newCategory}`;
      }

      const response = await apiClient.request(endpoint, 'GET');
      if (response.success && response.templates) {
        setTemplates(response.templates);
      } else {
        toast.error('Failed to fetch templates');
      }
    } catch (error) {
      console.error('Error fetching templates for category:', error);
      toast.error('An error occurred while fetching templates');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle select template click for templates not yet used
  const onSelectTemplate = (templateId: string) => {
    window.location.href = `/templates/use/${templateId}`;
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Choose Your Template</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Select from our professionally designed templates to create your perfect portfolio. All templates are fully customizable to match your style.
        </p>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={cat.id === category ? 'default' : 'outline'}
            className="rounded-full px-4"
            onClick={() => handleCategoryChange(cat.id)}
            disabled={isLoading}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center my-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
        </div>
      )}

      {/* Templates Grid */}
      {!isLoading && (
        <>
          {templates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <TemplateCard
                  key={template._id}
                  template={template}
                  onSelectTemplate={onSelectTemplate}
                  used={usedTemplateIds.has(template._id)}
                  portfolioId={portfoliosByTemplate[template._id]?._id}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h3 className="text-xl font-medium">No templates found</h3>
              <p className="text-muted-foreground mt-2">Try changing your filter criteria or check back later for new templates.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

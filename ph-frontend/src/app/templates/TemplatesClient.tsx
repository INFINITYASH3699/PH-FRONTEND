'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import apiClient from '@/lib/apiClient';
import { useAuth } from '@/components/providers/AuthContext';
import { toast } from 'sonner';

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
  layouts?: any[];
}

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates?.map((template) => (
            <Card key={template._id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="relative aspect-[16/9] overflow-hidden">
                {usedTemplateIds.has(template._id) && (
                  <div className="absolute top-2 right-2 z-10 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                    Already In Use
                  </div>
                )}
                <Image
                  src={template.previewImage}
                  alt={template.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                  <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                  <p className="text-sm text-white/80">{template.description}</p>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs bg-muted px-2 py-1 rounded">
                    {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                  </span>
                  {template.isFeatured && (
                    <span className="text-xs bg-violet-100 text-violet-800 px-2 py-1 rounded">
                      Featured
                    </span>
                  )}
                  {usedTemplateIds.has(template._id) && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      In Your Portfolio
                    </span>
                  )}
                  <span className="text-xs bg-muted px-2 py-1 rounded">
                    {template.layouts?.length || 1} layouts
                  </span>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between p-4 pt-0">
                <Link href={`/templates/preview/${template._id}`}>
                  <Button variant="outline" size="sm">
                    Preview
                  </Button>
                </Link>
                {usedTemplateIds.has(template._id) ? (
                  <Link href={`/templates/use/${template._id}?portfolioId=${portfoliosByTemplate[template._id]?._id}`}>
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
                  <Link href={`/templates/use/${template._id}`}>
                    <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">Use Template</Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* No Templates Found */}
      {!isLoading && templates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h3 className="text-xl font-medium">No templates found</h3>
          <p className="text-muted-foreground mt-2">Try changing your filter criteria or check back later for new templates.</p>
        </div>
      )}
    </div>
  );
}

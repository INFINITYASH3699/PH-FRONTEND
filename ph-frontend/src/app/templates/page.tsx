'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { NavBar } from '@/components/layout/NavBar';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import apiClient, { Template } from '@/lib/apiClient';
import { templates as fallbackTemplates } from '@/data/templates'; // Use as fallback
import { useAuth } from '@/components/providers/AuthContext';

// Filtering and Sorting Options
interface FilterOptions {
  category: string;
  sort: string;
  featured: boolean;
  tags: string[];
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    category: 'all',
    sort: 'newest',
    featured: false,
    tags: [],
  });
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [favoriteTemplates, setFavoriteTemplates] = useState<string[]>([]);
  const [usedTemplates, setUsedTemplates] = useState<string[]>([]);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Extract all unique tags from templates
  useEffect(() => {
    if (templates.length > 0) {
      const allTags = new Set<string>();
      templates.forEach(template => {
        if (template.tags && Array.isArray(template.tags)) {
          template.tags.forEach(tag => allTags.add(tag));
        }
      });
      setAvailableTags(Array.from(allTags));
    }
  }, [templates]);

  // Fetch templates from the API
  useEffect(() => {
    const fetchTemplates = async () => {
      console.log("[DEBUG] Starting template fetch...");
      try {
        setLoading(true);
        const category = filterOptions.category !== 'all' ? filterOptions.category : undefined;
        const options = {
          sort: filterOptions.sort,
          featured: filterOptions.featured,
          tags: filterOptions.tags.length > 0 ? filterOptions.tags : undefined,
        };

        console.log("[DEBUG] Template fetch params:", { category, options });
        console.log("[DEBUG] API_BASE_URL used:", process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? 'https://portfolio-hub-yqp0.onrender.com/api' : 'http://localhost:5000/api'));

        // Implement a retry mechanism (try up to 3 times)
        let lastError: any = null;
        let retryCount = 0;
        const maxRetries = 2;

        while (retryCount <= maxRetries) {
          try {
            console.log(`[DEBUG] Attempt ${retryCount + 1} of ${maxRetries + 1} to fetch templates`);
            const fetchedTemplates = await apiClient.getTemplates(category, options);

            console.log('[DEBUG] Templates fetch successful, received:', fetchedTemplates.length, 'templates');
            setTemplates(fetchedTemplates);
            break; // Success, exit the retry loop
          } catch (error) {
            lastError = error;
            console.error(`[DEBUG] Attempt ${retryCount + 1} failed:`, error);

            if (retryCount < maxRetries) {
              // Wait a bit before retrying (exponential backoff)
              const delay = Math.pow(2, retryCount) * 1000;
              console.log(`[DEBUG] Waiting ${delay}ms before retry...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              retryCount++;
            } else {
              // We've exhausted our retries, throw the error to be caught below
              throw error;
            }
          }
        }
      } catch (error) {
        console.error('[DEBUG] All template fetch attempts failed:', error);

        // Log what type of error occurred
        if (error instanceof Error) {
          console.error(`[DEBUG] Error name: ${error.name}, message: ${error.message}, stack: ${error.stack}`);

          // Check for CORS errors specifically
          if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
            console.error('[DEBUG] CORS error detected. This may be due to incorrect CORS configuration on the backend.');
            console.error('[DEBUG] Backend URL being used:', process.env.NEXT_PUBLIC_API_URL || 'https://portfolio-hub-yqp0.onrender.com/api');
            console.error('[DEBUG] Frontend origin:', typeof window !== 'undefined' ? window.location.origin : 'unknown');
          }
        }

        toast.error('Failed to load templates. Using demo data instead.');

        console.log('[DEBUG] Falling back to demo templates data');
        // Use fallback templates if API fails
        setTemplates(
          fallbackTemplates.map(t => ({
            _id: t._id,
            name: t.name,
            description: t.description,
            category: t.category,
            previewImage: t.previewImage,
            defaultStructure: t.settings || {},
            isPublished: true,
            tags: t.tags || [],
            rating: {
              average: 4.5,
              count: 10,
            },
          }))
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [filterOptions]);

  // Fetch user's favorite templates
  useEffect(() => {
    if (isAuthenticated) {
      const fetchFavorites = async () => {
        try {
          const favorites = await apiClient.getFavoriteTemplates();
          setFavoriteTemplates(favorites.map(template => template._id));
        } catch (error) {
          console.error('Error fetching favorite templates:', error);
        }
      };
      fetchFavorites();
    }
  }, [isAuthenticated]);

  // New effect to check which templates the user has already used
  useEffect(() => {
    if (isAuthenticated) {
      const fetchUserPortfolios = async () => {
        try {
          const data = await apiClient.request<{ success: boolean; portfolios: any[] }>('/portfolios');
          if (data.success && data.portfolios) {
            // Extract template IDs from user portfolios
            const usedTemplateIds = data.portfolios
              .filter(p => p.templateId)
              .map(p => typeof p.templateId === 'string' ? p.templateId : p.templateId?._id)
              .filter(Boolean) as string[];

            setUsedTemplates(usedTemplateIds);
          }
        } catch (error) {
          console.error('Error fetching user portfolios:', error);
        }
      };

      fetchUserPortfolios();
    }
  }, [isAuthenticated]);

  // Filter templates based on search query
  const filteredTemplates = templates.filter(template => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      template.name.toLowerCase().includes(query) ||
      template.description.toLowerCase().includes(query) ||
      template.category.toLowerCase().includes(query) ||
      (template.tags && template.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  });

  // Update search query
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setFilterOptions(prev => ({
      ...prev,
      category,
    }));
  };

  // Handle sort change
  const handleSortChange = (sort: string) => {
    setFilterOptions(prev => ({
      ...prev,
      sort,
    }));
  };

  // Handle featured filter change
  const handleFeaturedChange = (featured: boolean) => {
    setFilterOptions(prev => ({
      ...prev,
      featured,
    }));
  };

  // Handle tag selection
  const handleTagSelect = (tag: string) => {
    setFilterOptions(prev => {
      const updatedTags = prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag];

      return {
        ...prev,
        tags: updatedTags,
      };
    });
  };

  // Toggle favorite template
  const handleToggleFavorite = async (templateId: string, isFavorite: boolean) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to save favorites');
      router.push('/auth/signin?callbackUrl=/templates');
      return;
    }

    try {
      await apiClient.favoriteTemplate(templateId, isFavorite);

      setFavoriteTemplates(prev =>
        isFavorite ? [...prev, templateId] : prev.filter(id => id !== templateId)
      );

      toast.success(
        isFavorite ? 'Template added to favorites' : 'Template removed from favorites'
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-r from-violet-50 to-indigo-50">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold">Choose Your Perfect Portfolio Template</h1>
              <p className="text-lg text-muted-foreground">
                Browse our collection of professionally designed templates for every creative field.
                Select, customize, and publish your portfolio with ease.
              </p>

              <div className="relative max-w-md mx-auto mt-8">
                <Input
                  className="pl-10"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={handleSearch}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Template Usage Policy Info Banner */}
        <section className="py-3 bg-blue-50 border-y border-blue-100">
          <div className="container px-4 md:px-6">
            <div className="flex items-center gap-3 text-blue-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4"/>
                <path d="M12 8h.01"/>
              </svg>
              <div>
                <p className="text-sm">
                  <strong>Template Policy:</strong> You can create multiple portfolios with different templates, but each template can only be used once per account to avoid redundancy.
                  <Link href="/features" className="ml-2 underline">Learn more</Link>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Bar */}
        <section className="py-6 border-b">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">Sort by:</span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={filterOptions.sort === 'newest' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSortChange('newest')}
                  >
                    Newest
                  </Button>
                  <Button
                    variant={filterOptions.sort === 'popular' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSortChange('popular')}
                  >
                    Most Used
                  </Button>
                  <Button
                    variant={filterOptions.sort === 'rating' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSortChange('rating')}
                  >
                    Highest Rated
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant={filterOptions.featured ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFeaturedChange(!filterOptions.featured)}
                  className={filterOptions.featured ? 'bg-amber-600 hover:bg-amber-700' : ''}
                >
                  {filterOptions.featured ? (
                    <span className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      Featured Only
                    </span>
                  ) : (
                    'Show Featured'
                  )}
                </Button>

                {isAuthenticated && (
                  <Link href="/templates/favorites">
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                      </svg>
                      My Favorites
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Tags Filter */}
            {availableTags.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">Tags:</span>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <Button
                      key={tag}
                      variant={filterOptions.tags.includes(tag) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleTagSelect(tag)}
                      className="text-xs"
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Templates Gallery */}
        <section className="py-12">
          <div className="container px-4 md:px-6">
            <Tabs
              defaultValue="all"
              value={filterOptions.category}
              onValueChange={handleCategoryChange}
              className="mb-8"
            >
              <TabsList className="w-full max-w-lg mx-auto grid grid-cols-3 md:grid-cols-6 h-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="developer">Developer</TabsTrigger>
                <TabsTrigger value="designer">Designer</TabsTrigger>
                <TabsTrigger value="photographer">Photographer</TabsTrigger>
                <TabsTrigger value="writer">Writer</TabsTrigger>
                <TabsTrigger value="architect">Architect</TabsTrigger>
              </TabsList>

              <TabsContent value={filterOptions.category} className="mt-8">
                {loading ? (
                  <div className="py-20 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                    <p className="mt-4 text-muted-foreground">Loading templates...</p>
                  </div>
                ) : filteredTemplates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredTemplates.map(template => (
                      <TemplateCard
                        key={template._id}
                        template={template}
                        isFavorite={favoriteTemplates.includes(template._id)}
                        isUsed={usedTemplates.includes(template._id)}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center">
                    <p className="text-muted-foreground">No templates found matching your criteria.</p>
                    <Button
                      variant="link"
                      onClick={() => {
                        setSearchQuery('');
                        setFilterOptions({
                          category: 'all',
                          sort: 'newest',
                          featured: false,
                          tags: [],
                        });
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

interface TemplateCardProps {
  template: Template;
  isFavorite: boolean;
  isUsed: boolean;
  onToggleFavorite: (templateId: string, isFavorite: boolean) => void;
}

function TemplateCard({ template, isFavorite, isUsed, onToggleFavorite }: TemplateCardProps) {
  return (
    <Card className={`group overflow-hidden rounded-lg border shadow-sm transition-all hover:shadow-md ${isUsed ? 'opacity-75' : ''}`}>
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={template.previewImage}
          alt={template.name}
          fill
          className={`object-cover transition-transform ${isUsed ? '' : 'group-hover:scale-105'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
          <h3 className="text-lg font-semibold text-white">{template.name}</h3>
          <p className="text-sm text-white/80">{template.description}</p>
        </div>

        {/* Already used badge - update wording */}
        {isUsed && (
          <div className="absolute top-4 right-4 bg-gray-800 text-white text-xs px-2 py-1 rounded-full">
            In Use
          </div>
        )}

        {/* Premium badge */}
        {template.isPremium && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full">
            Premium
          </div>
        )}

        {/* Featured badge */}
        {template.isFeatured && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3 w-3"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Featured
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium capitalize">{template.category}</span>

          {/* Rating stars */}
          {template.rating && (
            <div className="flex items-center gap-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <svg
                    key={star}
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill={star <= Math.round(template.rating.average) ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`h-4 w-4 ${
                      star <= Math.round(template.rating.average) ? 'text-amber-500' : 'text-gray-300'
                    }`}
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">({template.rating.count})</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {template.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
            {template.tags.length > 3 && (
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                +{template.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite(template._id, !isFavorite);
            }}
            className="flex items-center text-sm text-gray-500 hover:text-violet-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`h-4 w-4 mr-1 ${isFavorite ? 'text-red-500' : ''}`}
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            {isFavorite ? 'Saved' : 'Save'}
          </button>

          <div className="flex gap-2">
            <Link href={`/templates/preview/${template._id}`}>
              <Button variant="ghost" size="sm">
                Preview
              </Button>
            </Link>
            {isUsed ? (
              <div className="flex flex-col items-end">
                <Button size="sm" className="bg-gray-200 text-gray-600" disabled title="You're already using this template">
                  Already In Use
                </Button>
                <span className="text-xs text-muted-foreground mt-1">Each template can only be used once</span>
              </div>
            ) : (
              <Link href={`/templates/use/${template._id}`}>
                <Button size="sm" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                  Create Portfolio
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

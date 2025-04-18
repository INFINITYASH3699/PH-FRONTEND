'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { NavBar } from '@/components/layout/NavBar';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import apiClient, { Template } from '@/lib/apiClient';
import { useAuth } from '@/components/providers/AuthContext';

export default function FavoriteTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Check if user is authenticated and redirect if not
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error('Please sign in to view your favorite templates');
      router.push('/auth/signin?callbackUrl=/templates/favorites');
    }
  }, [isAuthenticated, isLoading, router]);

  // Fetch user's favorite templates
  useEffect(() => {
    const fetchFavorites = async () => {
      if (isLoading) return;

      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const favorites = await apiClient.getFavoriteTemplates();
        setTemplates(favorites);
      } catch (error) {
        console.error('Error fetching favorite templates:', error);
        toast.error('Failed to load favorite templates');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [isAuthenticated, isLoading]);

  // Toggle favorite template
  const handleToggleFavorite = async (templateId: string) => {
    try {
      await apiClient.favoriteTemplate(templateId, false);

      // Remove from the current list
      setTemplates(prev => prev.filter(template => template._id !== templateId));

      toast.success('Template removed from favorites');
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove from favorites');
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-muted-foreground">Loading your favorite templates...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      <main className="flex-grow py-12">
        <div className="container px-4 md:px-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">My Favorite Templates</h1>
              <p className="text-muted-foreground mt-2">
                Templates you've saved for later
              </p>
            </div>
            <Link href="/templates">
              <Button variant="outline">
                Browse All Templates
              </Button>
            </Link>
          </div>

          {templates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {templates.map((template) => (
                <TemplateCard
                  key={template._id}
                  template={template}
                  onRemove={handleToggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border rounded-lg bg-muted/30">
              <div className="flex justify-center mb-4">
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
                  className="h-16 w-16 text-gray-400"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                You haven't saved any templates to your favorites. Browse our template collection
                and click the heart icon to save templates you like.
              </p>
              <Link href="/templates">
                <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                  Explore Templates
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

interface TemplateCardProps {
  template: Template;
  onRemove: (templateId: string) => void;
}

function TemplateCard({ template, onRemove }: TemplateCardProps) {
  return (
    <Card className="group overflow-hidden rounded-lg border shadow-sm transition-all hover:shadow-md">
      <div className="relative aspect-[16/9] overflow-hidden">
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

        {/* Premium badge */}
        {template.isPremium && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full">
            Premium
          </div>
        )}

        {/* Featured badge */}
        {template.isFeatured && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Featured
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium capitalize">
            {template.category}
          </span>

          {/* Rating stars */}
          {template.rating && (
            <div className="flex items-center gap-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill={star <= Math.round(template.rating.average) ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`h-4 w-4 ${star <= Math.round(template.rating.average) ? "text-amber-500" : "text-gray-300"}`}
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                ({template.rating.count})
              </span>
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
            onClick={() => onRemove(template._id)}
            className="flex items-center text-sm text-red-500 hover:text-red-700 transition-colors"
          >
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
              className="h-4 w-4 mr-1"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            Remove
          </button>

          <div className="flex gap-2">
            <Link href={`/templates/preview/${template._id}`}>
              <Button variant="ghost" size="sm">Preview</Button>
            </Link>
            <Link href={`/templates/use/${template._id}`}>
              <Button size="sm" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                Use
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}

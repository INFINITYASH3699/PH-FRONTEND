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

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const router = useRouter();

  // Fetch templates from the API
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const category = activeCategory !== 'all' ? activeCategory : undefined;
        const fetchedTemplates = await apiClient.getTemplates(category);
        setTemplates(fetchedTemplates);
      } catch (error) {
        console.error('Error fetching templates:', error);
        toast.error('Failed to load templates. Using demo data instead.');
        // Use fallback templates if API fails
        setTemplates(fallbackTemplates.map(t => ({
          _id: t._id,
          name: t.name,
          description: t.description,
          category: t.category,
          previewImage: t.previewImage,
          defaultStructure: t.settings || {},
          isPublished: true,
        })));
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [activeCategory]);

  // Filter templates based on search query
  const filteredTemplates = templates.filter(template => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      template.name.toLowerCase().includes(query) ||
      template.description.toLowerCase().includes(query) ||
      template.category.toLowerCase().includes(query)
    );
  });

  // Update search query
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
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

        {/* Templates Gallery */}
        <section className="py-12">
          <div className="container px-4 md:px-6">
            <Tabs
              defaultValue="all"
              value={activeCategory}
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

              <TabsContent value={activeCategory} className="mt-8">
                {loading ? (
                  <div className="py-20 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                    <p className="mt-4 text-muted-foreground">Loading templates...</p>
                  </div>
                ) : filteredTemplates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredTemplates.map((template) => (
                      <TemplateCard key={template._id} template={template} />
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center">
                    <p className="text-muted-foreground">No templates found matching your criteria.</p>
                    <Button
                      variant="link"
                      onClick={() => {
                        setSearchQuery('');
                        setActiveCategory('all');
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
}

function TemplateCard({ template }: TemplateCardProps) {
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

        {template.isPremium && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full">
            Premium
          </div>
        )}
      </div>
      <div className="p-4 flex justify-between items-center">
        <span className="text-sm font-medium capitalize">
          {template.category}
        </span>
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
    </Card>
  );
}

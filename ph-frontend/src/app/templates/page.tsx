import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { getTemplates } from '@/lib/apiClient';

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

export default async function TemplatesPage() {
  // Fetch templates from API
  const templates = await getTemplates();

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
        {categories.map((category) => (
          <Button
            key={category.id}
            variant="outline"
            className="rounded-full px-4"
            asChild
          >
            <Link href={`/templates?category=${category.id}`}>
              {category.name}
            </Link>
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates?.map((template) => (
          <Card key={template._id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
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
                <span className="text-xs bg-muted px-2 py-1 rounded">
                  {template.layouts?.length || 1} layouts
                </span>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between p-4 pt-0">
              <Link href={`/templates/preview/${template._id}`}>
                <Button variant="outline" size="sm">Preview</Button>
              </Link>
              <Link href={`/templates/use/${template._id}`}>
                <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                  Use Template
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* No Templates Found */}
      {templates?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h3 className="text-xl font-medium">No templates found</h3>
          <p className="text-muted-foreground mt-2">Try changing your filter criteria or check back later for new templates.</p>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock API call function - replace with actual API client in production
async function getTemplateData(id: string) {
  try {
    // In real application, fetch from API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/templates/${id}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch template');
    }

    const data = await response.json();
    return data.template;
  } catch (error) {
    console.error('Error fetching template:', error);
    return null;
  }
}

export default async function TemplatePreviewPage({ params }: { params: { id: string } }) {
  const template = await getTemplateData(params.id);

  if (!template) {
    redirect('/templates');
  }

  // Get available layouts
  const layouts = template.layouts || [];

  // Get color schemes
  const colorSchemes = template.themeOptions?.colorSchemes || [];

  // Get font pairings
  const fontPairings = template.themeOptions?.fontPairings || [];

  // Get sections from the first layout or default structure
  const defaultLayout = layouts[0] || { structure: { sections: [] } };
  const sections = defaultLayout.structure.sections ||
    template.defaultStructure?.layout?.sections || [];

  return (
    <div className="container py-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left sidebar with template info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{template.name}</h1>
            <p className="text-muted-foreground mt-2">{template.description}</p>

            <div className="flex items-center mt-4 space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-100">
                {template.category}
              </span>

              {template.isFeatured && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100">
                  Featured
                </span>
              )}

              <div className="flex items-center">
                <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <span className="ml-1 text-sm text-gray-600">
                  {template.rating?.average || 0} ({template.rating?.count || 0} reviews)
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <Link href={`/templates/use/${template._id}`}>
                <Button className="w-full">Use This Template</Button>
              </Link>

              <Link href="/templates">
                <Button variant="outline" className="w-full">Back to Templates</Button>
              </Link>
            </div>
          </div>

          {/* Tags */}
          {template.tags && template.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Template stats */}
          <div>
            <h3 className="text-lg font-medium mb-2">Template Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Used by</span>
                <span className="font-medium">{template.usageCount || 0} portfolios</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Layouts</span>
                <span className="font-medium">{layouts.length || 1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Color schemes</span>
                <span className="font-medium">{colorSchemes.length || 1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sections</span>
                <span className="font-medium">{sections.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main preview area */}
        <div className="md:col-span-2">
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="layouts">Layouts</TabsTrigger>
              <TabsTrigger value="themes">Themes</TabsTrigger>
              <TabsTrigger value="sections">Sections</TabsTrigger>
            </TabsList>

            {/* Preview tab */}
            <TabsContent value="preview" className="space-y-4">
              <div className="relative aspect-[16/9] overflow-hidden rounded-lg border bg-muted">
                <Image
                  src={template.previewImage}
                  alt={template.name}
                  fill
                  className="object-cover"
                />
              </div>

              {template.previewImages && template.previewImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {template.previewImages.map((img: string, i: number) => (
                    <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted">
                      <Image
                        src={img}
                        alt={`${template.name} preview ${i+1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Layouts tab */}
            <TabsContent value="layouts" className="space-y-4">
              {layouts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {layouts.map((layout: any, i: number) => (
                    <Card key={i} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{layout.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                          {layout.previewImage ? (
                            <Image
                              src={layout.previewImage}
                              alt={layout.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <p className="text-muted-foreground text-sm">Layout preview not available</p>
                            </div>
                          )}
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground">Grid System: {layout.structure.gridSystem}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Sections: {layout.structure.sections.join(', ')}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    This template uses a standard layout configuration
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Themes tab */}
            <TabsContent value="themes" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Color schemes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Color Schemes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {colorSchemes.length > 0 ? (
                      colorSchemes.map((scheme: any, i: number) => (
                        <div key={i} className="border rounded-lg p-3">
                          <div className="font-medium mb-2">{scheme.name}</div>
                          <div className="grid grid-cols-4 gap-2">
                            {Object.entries(scheme.colors).map(([name, color]: [string, any]) => (
                              <div key={name} className="flex flex-col items-center text-xs">
                                <div
                                  className="w-6 h-6 rounded-full mb-1 border"
                                  style={{ backgroundColor: color }}
                                />
                                {name}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">Default color scheme</p>
                    )}
                  </CardContent>
                </Card>

                {/* Font pairings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Font Pairings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {fontPairings.length > 0 ? (
                      fontPairings.map((pairing: any, i: number) => (
                        <div key={i} className="border rounded-lg p-3">
                          <div className="font-medium mb-2">{pairing.name}</div>
                          <div className="space-y-2">
                            {Object.entries(pairing.fonts).map(([name, font]: [string, any]) => (
                              <div key={name} className="text-sm">
                                <span className="text-muted-foreground">{name}: </span>
                                <span>{font}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">Default font pairings</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Sections tab */}
            <TabsContent value="sections" className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-lg mb-3">Available Sections</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {sections.map((section: string, i: number) => (
                    <div key={i} className="border rounded-lg p-3 text-center">
                      <span className="capitalize">{section.replace('-', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-sm text-muted-foreground mt-2">
                <p>Sections can be customized and reordered when using the template.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

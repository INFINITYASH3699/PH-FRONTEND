import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Layers, Paintbrush, Sparkles } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import TemplateRenderer from '@/components/template-renderer/TemplateRenderer';

export const dynamic = 'force-dynamic';

async function getTemplate(id: string) {
  try {
    const response = await apiClient.serverRequest<{
      success: boolean,
      template: any
    }>(`/templates/${id}`, 'GET', undefined, undefined);

    if (response.success && response.template) {
      return response.template;
    }

    throw new Error('Template not found');
  } catch (error) {
    console.error('Error fetching template:', error);
    throw error;
  }
}

export default async function TemplatePreviewPage({ params }: { params: { id: string } }) {
  const template = await getTemplate(params.id);

  // Create sample portfolio data with template defaults
  const samplePortfolio = {
    _id: 'preview',
    title: 'Preview Portfolio',
    content: {},
    activeLayout: template.layouts?.[0]?.id || 'default',
    activeColorScheme: template.themeOptions?.colorSchemes?.[0]?.id || 'default',
    activeFontPairing: template.themeOptions?.fontPairings?.[0]?.id || 'default',
    customColors: null,
    sectionOrder: template.layouts?.[0]?.structure?.sections || template.defaultStructure?.layout?.sections || []
  };

  // Populate sample content from section definitions
  if (template.sectionDefinitions) {
    Object.entries(template.sectionDefinitions).forEach(([sectionType, definition]: [string, any]) => {
      if (definition.defaultData) {
        samplePortfolio.content[sectionType] = { ...definition.defaultData };
      }
    });
  }

  // Count variants
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

  return (
    <div className="container py-8">
      <div className="mb-8">
        <Link href="/templates" className="flex items-center text-sm mb-4 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Templates
        </Link>

        {/* Template header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{template.name}</h1>
            <p className="text-lg text-muted-foreground mb-4">{template.description}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="capitalize">{template.category}</Badge>
              {template.isFeatured && (
                <Badge variant="outline" className="bg-primary/10">Featured</Badge>
              )}
              <Badge variant="outline">
                {countVariants()} Variations
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Layers className="h-3 w-3" />
                {template.layouts?.length || 1} Layouts
              </Badge>
            </div>
          </div>

          <Link href={`/templates/use/${template._id}`}>
            <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
              Use This Template
            </Button>
          </Link>
        </div>

        {/* Tabs for different preview options */}
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="variations">Variations</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          {/* Standard preview */}
          <TabsContent value="preview" className="w-full">
            <div className="border rounded-lg p-4 bg-white overflow-hidden">
              <div className="overflow-auto max-h-[800px] rounded-md">
                <TemplateRenderer
                  template={template}
                  portfolio={samplePortfolio}
                />
              </div>
            </div>
          </TabsContent>

          {/* Variations */}
          <TabsContent value="variations">
            <div className="space-y-8">
              {/* Layout variations */}
              {template.layouts && template.layouts.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Layout Options</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {template.layouts.map((layout: any) => (
                      <Card key={layout.id} className="overflow-hidden">
                        <div className="p-4 bg-gray-50 flex items-center justify-between border-b">
                          <div>
                            <h3 className="font-medium">{layout.name}</h3>
                            <p className="text-sm text-muted-foreground">{layout.structure?.gridSystem}</p>
                          </div>
                          <Badge variant="outline">
                            {layout.structure?.sections?.length || 0} Sections
                          </Badge>
                        </div>
                        <CardContent className="p-4">
                          <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
                            {layout.structure?.gridSystem === 'sidebar-main' && (
                              <div className="w-full h-full p-4 flex gap-4">
                                <div className="w-1/4 h-full bg-gray-200 rounded-md"></div>
                                <div className="flex-1 bg-gray-200 rounded-md"></div>
                              </div>
                            )}
                            {layout.structure?.gridSystem === 'sidebar-right' && (
                              <div className="w-full h-full p-4 flex gap-4">
                                <div className="flex-1 bg-gray-200 rounded-md"></div>
                                <div className="w-1/4 h-full bg-gray-200 rounded-md"></div>
                              </div>
                            )}
                            {layout.structure?.gridSystem === 'full-screen' && (
                              <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                                <span className="text-sm text-gray-500">Full Screen Sections</span>
                              </div>
                            )}
                            {layout.structure?.gridSystem === 'masonry' && (
                              <div className="w-full h-full p-4 grid grid-cols-3 gap-2">
                                <div className="bg-gray-200 rounded-md h-1/2"></div>
                                <div className="bg-gray-200 rounded-md h-3/4"></div>
                                <div className="bg-gray-200 rounded-md h-2/3"></div>
                                <div className="bg-gray-200 rounded-md h-3/4"></div>
                                <div className="bg-gray-200 rounded-md h-1/2"></div>
                                <div className="bg-gray-200 rounded-md h-2/3"></div>
                              </div>
                            )}
                            {layout.structure?.gridSystem === 'tabs' && (
                              <div className="w-full h-full p-4 flex flex-col gap-2">
                                <div className="h-8 flex gap-2">
                                  <div className="w-20 bg-primary/30 rounded-t-md"></div>
                                  <div className="w-20 bg-gray-200 rounded-t-md"></div>
                                  <div className="w-20 bg-gray-200 rounded-t-md"></div>
                                </div>
                                <div className="flex-1 bg-gray-200 rounded-b-md"></div>
                              </div>
                            )}
                            {(!layout.structure?.gridSystem || layout.structure?.gridSystem === '12-column') && (
                              <div className="w-full h-full p-4 flex flex-col gap-2">
                                <div className="h-12 bg-gray-200 rounded-md"></div>
                                <div className="h-24 bg-gray-200 rounded-md"></div>
                                <div className="flex-1 grid grid-cols-3 gap-2">
                                  <div className="bg-gray-200 rounded-md"></div>
                                  <div className="bg-gray-200 rounded-md"></div>
                                  <div className="bg-gray-200 rounded-md"></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Section variants */}
              {template.sectionVariants && Object.keys(template.sectionVariants).length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Section Variants</h2>
                  <div className="space-y-6">
                    {Object.entries(template.sectionVariants).map(([sectionType, variants]: [string, any]) => (
                      <div key={sectionType}>
                        <h3 className="text-lg font-medium capitalize mb-2">{sectionType} Section</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {Array.isArray(variants) && variants.map((variant: any) => (
                            <Card key={variant.id} className="overflow-hidden">
                              <div className="p-3 bg-gray-50 border-b">
                                <h4 className="font-medium">{variant.name}</h4>
                                <p className="text-xs text-muted-foreground">{variant.description}</p>
                              </div>
                              <CardContent className="p-3 text-sm">
                                <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
                                  <div className="text-center p-2">
                                    <span className="text-xs text-gray-500">
                                      {sectionType === 'header' && variant.configuration?.variant === 'hero' && 'Full-screen header with background'}
                                      {sectionType === 'header' && variant.configuration?.variant === 'centered' && 'Centered header with image'}
                                      {sectionType === 'header' && variant.configuration?.variant === 'split' && 'Split header with text and image'}
                                      {sectionType === 'header' && variant.configuration?.variant === 'minimal' && 'Minimal header with just text'}

                                      {sectionType === 'about' && variant.configuration?.variant === 'standard' && 'Standard about section'}
                                      {sectionType === 'about' && variant.configuration?.variant === 'with-image' && 'About with sidebar image'}
                                      {sectionType === 'about' && variant.configuration?.variant === 'with-highlights' && 'About with highlight cards'}
                                      {sectionType === 'about' && variant.configuration?.variant === 'minimal' && 'Minimal about section'}

                                      {sectionType === 'projects' && variant.configuration?.layout === 'grid' && 'Grid layout of projects'}
                                      {sectionType === 'projects' && variant.configuration?.layout === 'list' && 'List layout of projects'}
                                      {sectionType === 'projects' && variant.configuration?.layout === 'featured' && 'Featured project with grid'}

                                      {sectionType === 'skills' && variant.configuration?.display === 'bars' && 'Skills shown as progress bars'}
                                      {sectionType === 'skills' && variant.configuration?.display === 'tags' && 'Skills shown as tags/badges'}
                                      {sectionType === 'skills' && variant.configuration?.display === 'categories' && 'Skills grouped by category'}
                                    </span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Style presets */}
              {template.stylePresets && Object.keys(template.stylePresets).length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Paintbrush className="h-5 w-5" />
                    Style Presets
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(template.stylePresets).map(([id, preset]: [string, any]) => (
                      <Card key={id} className="overflow-hidden">
                        <div className="p-3 bg-gray-50 border-b">
                          <h4 className="font-medium">{preset.name}</h4>
                          <p className="text-xs text-muted-foreground">{preset.description}</p>
                        </div>
                        <CardContent className="p-4">
                          <div
                            className="w-full p-4 border rounded-md"
                            style={{
                              borderRadius: preset.styles?.borderRadius || '0.5rem',
                              boxShadow: preset.styles?.boxShadow || 'none',
                              borderWidth: preset.styles?.borderWidth || '1px',
                            }}
                          >
                            <div className="h-4 w-24 bg-primary rounded-full mb-2"></div>
                            <div className="h-2 w-full bg-gray-200 rounded-full mb-2"></div>
                            <div className="h-2 w-3/4 bg-gray-200 rounded-full"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Animations */}
              {template.animations && Object.keys(template.animations).length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Animation Effects
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(template.animations).map(([id, animation]: [string, any]) => (
                      <Card key={id} className="overflow-hidden">
                        <div className="p-3 bg-gray-50 border-b">
                          <h4 className="font-medium">{animation.name}</h4>
                          <p className="text-xs text-muted-foreground">{animation.duration}ms {animation.easing}</p>
                        </div>
                        <CardContent className="p-4">
                          <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
                            <div
                              className={`p-4 bg-white border rounded-md transition-all ${
                                animation.type === 'fade' ? 'animate-pulse' :
                                animation.type === 'slide' ? 'animate-bounce' :
                                animation.type === 'zoom' ? 'animate-ping' :
                                ''
                              }`}
                            >
                              <span className="text-sm">{animation.type} animation</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Features */}
          <TabsContent value="features">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">Key Features</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>Multiple layout options to structure your portfolio</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>Section variants for different visual styles</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>Customizable color schemes and font pairings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>Fully responsive design across all devices</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>SEO optimized structure for better visibility</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">Perfect For</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {template.category === 'developer' && <span>Showcasing coding projects and technical skills</span>}
                      {template.category === 'designer' && <span>Displaying creative work and design projects</span>}
                      {template.category === 'photographer' && <span>Creating visual galleries of photography work</span>}
                      {!['developer', 'designer', 'photographer'].includes(template.category) && <span>Creating a professional online presence</span>}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Personal branding and career development</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Job applications and professional networking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Freelancers and independent professionals</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getTemplateById } from '@/lib/apiClient';
import TemplateRenderer from '@/components/template-renderer/TemplateRenderer';

// Sample portfolio data for preview
const samplePortfolio = {
  title: 'Portfolio Preview',
  subtitle: 'See how your portfolio could look',
  content: {},
  activeLayout: 'default',
  activeColorScheme: 'default',
  activeFontPairing: 'default',
};

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const template = await getTemplateById(params.id);

  if (!template) {
    return {
      title: 'Template Not Found',
    };
  }

  return {
    title: `${template.name} - Template Preview | PortfolioHub`,
    description: template.description,
  };
}

export default async function TemplatePreviewPage({ params }: { params: { id: string } }) {
  const template = await getTemplateById(params.id);

  if (!template) {
    notFound();
  }

  // Process template data for preview
  const layoutOptions = template.layouts || [];
  const colorSchemes = template.themeOptions?.colorSchemes || [];
  const fontPairings = template.themeOptions?.fontPairings || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/templates" className="text-sm flex items-center mb-6 text-muted-foreground hover:text-foreground transition-colors">
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
          className="mr-2 h-4 w-4"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to Templates
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="md:col-span-1">
          <div className="sticky top-8">
            <div className="relative aspect-video w-full mb-4 overflow-hidden rounded-lg border">
              <Image
                src={template.previewImage}
                alt={template.name}
                fill
                className="object-cover"
              />
            </div>

            <h1 className="text-2xl font-bold mb-2">{template.name}</h1>
            <p className="text-muted-foreground mb-4">{template.description}</p>

            <div className="flex flex-col space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-sm">Category:</span>
                <span className="text-sm font-medium capitalize">{template.category}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm">Layouts:</span>
                <span className="text-sm font-medium">{layoutOptions.length}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm">Color Schemes:</span>
                <span className="text-sm font-medium">{colorSchemes.length}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm">Font Pairings:</span>
                <span className="text-sm font-medium">{fontPairings.length}</span>
              </div>

              {template.usageCount !== undefined && (
                <div className="flex justify-between">
                  <span className="text-sm">Used By:</span>
                  <span className="text-sm font-medium">{template.usageCount} portfolios</span>
                </div>
              )}
            </div>

            <Link href={`/templates/use/${template._id}`}>
              <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                Use This Template
              </Button>
            </Link>
          </div>
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="layouts">Layouts</TabsTrigger>
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="fonts">Fonts</TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="bg-background rounded-md border shadow-sm overflow-hidden">
                  <div className="h-[600px] overflow-y-auto p-4">
                    <TemplateRenderer
                      template={template}
                      portfolio={samplePortfolio}
                      editable={false}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="layouts" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {layoutOptions.map((layout) => (
                  <Card key={layout.id} className="overflow-hidden">
                    <div className="p-4 border-b bg-muted/30">
                      <h3 className="font-medium">{layout.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {layout.structure.gridSystem === 'sidebar-main'
                          ? 'Sidebar Navigation Layout'
                          : 'Standard Content Layout'}
                      </p>
                    </div>
                    <CardContent className="p-4">
                      <div className="text-sm space-y-2">
                        <div className="font-medium mb-2">Included Sections:</div>
                        <div className="flex flex-wrap gap-2">
                          {layout.structure.sections.map((section: string) => (
                            <span key={section} className="px-2 py-1 bg-muted rounded-md text-xs capitalize">
                              {section}
                            </span>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="colors" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {colorSchemes.map((scheme) => (
                  <Card key={scheme.id} className="overflow-hidden">
                    <div className="p-4 border-b bg-muted/30">
                      <h3 className="font-medium">{scheme.name}</h3>
                    </div>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(scheme.colors).map(([name, color]) => (
                          <div key={name} className="flex items-center space-x-2">
                            <div
                              className="w-6 h-6 rounded-full border"
                              style={{ backgroundColor: color as string }}
                            />
                            <span className="text-xs capitalize">{name}: {color}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="fonts" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fontPairings.map((font) => (
                  <Card key={font.id} className="overflow-hidden">
                    <div className="p-4 border-b bg-muted/30">
                      <h3 className="font-medium">{font.name}</h3>
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Heading Font</div>
                          <div className="text-lg font-bold" style={{ fontFamily: font.fonts.heading }}>
                            {font.fonts.heading}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Body Font</div>
                          <div className="text-md" style={{ fontFamily: font.fonts.body }}>
                            {font.fonts.body}
                          </div>
                        </div>

                        {font.fonts.mono && (
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Monospace Font</div>
                            <div className="text-md font-mono" style={{ fontFamily: font.fonts.mono }}>
                              {font.fonts.mono}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

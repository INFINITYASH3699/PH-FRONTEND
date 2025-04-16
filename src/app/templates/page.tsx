import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { NavBar } from '@/components/layout/NavBar';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Sample template data
const templates = [
  {
    id: 'developer-1',
    name: 'Modern Developer',
    category: 'developer',
    description: 'A clean and modern template for developers and programmers.',
    image: 'https://repository-images.githubusercontent.com/616351992/41fb4d77-8bcc-4f2f-a5af-56c0e41e07c4',
    layouts: 10,
    isPremium: false,
  },
  {
    id: 'developer-2',
    name: 'Code Craft',
    category: 'developer',
    description: 'Showcase your coding projects with this sleek template.',
    image: 'https://marketplace.canva.com/EAGGr0aHXDg/2/0/1600w/canva-pink-bold-modern-creative-portfolio-presentation-te1AiwXONs0.jpg',
    layouts: 8,
    isPremium: true,
  },
  {
    id: 'designer-1',
    name: 'Creative Studio',
    category: 'designer',
    description: 'Perfect for graphic designers, illustrators and creative professionals.',
    image: 'https://weandthecolor.com/wp-content/uploads/2020/09/A-modern-and-fresh-portfolio-template-for-Adobe-InDesign.jpg',
    layouts: 8,
    isPremium: false,
  },
  {
    id: 'designer-2',
    name: 'Design Lab',
    category: 'designer',
    description: 'Showcase your design projects with beautiful layouts.',
    image: 'https://www.unsell.design/wp-content/uploads/2021/07/bd5b5164-cover-flat-lay.jpg',
    layouts: 12,
    isPremium: true,
  },
  {
    id: 'photographer-1',
    name: 'Photo Gallery',
    category: 'photographer',
    description: 'A stunning template for photographers to display their work.',
    image: 'https://marketplace.canva.com/EAFwckKNjDE/2/0/1600w/canva-black-white-grayscale-portfolio-presentation-vzScEqAI__M.jpg',
    layouts: 12,
    isPremium: false,
  },
  {
    id: 'photographer-2',
    name: 'Lens Focus',
    category: 'photographer',
    description: 'Highlight your photography with this elegant template.',
    image: 'https://slidestack-prod.s3.amazonaws.com/templates/6ji6c1kInxBUAhSi2a77f7EigLCRsBTCOeQ8Axls.jpg',
    layouts: 10,
    isPremium: true,
  },
  {
    id: 'writer-1',
    name: 'Story Teller',
    category: 'writer',
    description: 'Perfect for writers, bloggers and content creators.',
    image: 'https://marketplace.canva.com/EAFwckKNjDE/2/0/1600w/canva-black-white-grayscale-portfolio-presentation-vzScEqAI__M.jpg',
    layouts: 8,
    isPremium: false,
  },
  {
    id: 'writer-2',
    name: 'Word Craft',
    category: 'writer',
    description: 'Showcase your writing portfolio with this clean template.',
    image: 'https://marketplace.canva.com/EAFg2mo-uDo/1/0/1131w/canva-black-beige-minimalist-photography-portfolio-cover-page-DiK64bic_mc.jpg',
    layouts: 6,
    isPremium: true,
  },
  {
    id: 'architect-1',
    name: 'Blueprint',
    category: 'architect',
    description: 'Showcase architectural projects with this professional template.',
    image: 'https://www.unsell.design/wp-content/uploads/2021/07/bd5b5164-cover-flat-lay.jpg',
    layouts: 10,
    isPremium: false,
  },
];

export default function TemplatesPage() {
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
                <Input className="pl-10" placeholder="Search templates..." />
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
            <Tabs defaultValue="all" className="mb-8">
              <TabsList className="w-full max-w-lg mx-auto grid grid-cols-3 md:grid-cols-6 h-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="developer">Developer</TabsTrigger>
                <TabsTrigger value="designer">Designer</TabsTrigger>
                <TabsTrigger value="photographer">Photographer</TabsTrigger>
                <TabsTrigger value="writer">Writer</TabsTrigger>
                <TabsTrigger value="architect">Architect</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {templates.map((template) => (
                    <TemplateCard key={template.id} template={template} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="developer" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {templates
                    .filter((template) => template.category === 'developer')
                    .map((template) => (
                      <TemplateCard key={template.id} template={template} />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="designer" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {templates
                    .filter((template) => template.category === 'designer')
                    .map((template) => (
                      <TemplateCard key={template.id} template={template} />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="photographer" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {templates
                    .filter((template) => template.category === 'photographer')
                    .map((template) => (
                      <TemplateCard key={template.id} template={template} />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="writer" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {templates
                    .filter((template) => template.category === 'writer')
                    .map((template) => (
                      <TemplateCard key={template.id} template={template} />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="architect" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {templates
                    .filter((template) => template.category === 'architect')
                    .map((template) => (
                      <TemplateCard key={template.id} template={template} />
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

type TemplateCardProps = {
  template: {
    id: string;
    name: string;
    category: string;
    description: string;
    image: string;
    layouts: number;
    isPremium: boolean;
  };
};

function TemplateCard({ template }: TemplateCardProps) {
  return (
    <Card className="group overflow-hidden rounded-lg border shadow-sm transition-all hover:shadow-md">
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={template.image}
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
        <span className="text-sm font-medium">{template.layouts} layouts</span>
        <div className="flex gap-2">
          <Link href={`/templates/preview/${template.id}`}>
            <Button variant="ghost" size="sm">Preview</Button>
          </Link>
          <Link href={`/templates/use/${template.id}`}>
            <Button size="sm" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
              Use
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

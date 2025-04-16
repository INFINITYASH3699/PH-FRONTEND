import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NavBar } from '@/components/layout/NavBar';
import { Footer } from '@/components/layout/Footer';

// Same template data from the preview page
const templates = [
  {
    id: 'developer-1',
    name: 'Modern Developer',
    category: 'developer',
    description: 'A clean and modern template for developers and programmers.',
    longDescription: 'This template is perfect for developers who want to showcase their coding projects, skills, and experience. It includes sections for your bio, projects, skills, experience, education, and contact information. The clean and modern design makes it easy to navigate and highlights your work effectively.',
    image: 'https://repository-images.githubusercontent.com/616351992/41fb4d77-8bcc-4f2f-a5af-56c0e41e07c4',
    features: [
      'Projects showcase with GitHub integration',
      'Skills section with proficiency indicators',
      'Timeline for work experience and education',
      'Dark and light mode support',
      'Responsive design for all devices',
      'Blog section for technical articles',
      'Contact form with validation',
    ],
    layouts: 10,
    isPremium: false,
    sections: [
      'header',
      'about',
      'projects',
      'skills',
      'experience',
      'education',
      'contact',
      'blog'
    ]
  },
  {
    id: 'designer-1',
    name: 'Creative Studio',
    category: 'designer',
    description: 'Perfect for graphic designers, illustrators and creative professionals.',
    longDescription: 'Designed with creatives in mind, this template puts your visual work front and center. The sleek gallery layouts and minimal design ensure your portfolio pieces get all the attention they deserve. Ideal for graphic designers, illustrators, photographers, and other visual artists who want to showcase their creative work.',
    image: 'https://weandthecolor.com/wp-content/uploads/2020/09/A-modern-and-fresh-portfolio-template-for-Adobe-InDesign.jpg',
    features: [
      'Fullscreen gallery with various layout options',
      'Project case study pages',
      'Client testimonial section',
      'Animated transitions between pages',
      'Instagram feed integration',
      'Contact form with file upload',
      'Custom cursor options',
    ],
    layouts: 8,
    isPremium: false,
    sections: [
      'header',
      'about',
      'gallery',
      'work',
      'clients',
      'testimonials',
      'contact',
    ]
  },
  {
    id: 'photographer-1',
    name: 'Photo Gallery',
    category: 'photographer',
    description: 'A stunning template for photographers to display their work.',
    longDescription: 'Designed specifically for photographers, this template allows you to showcase your photography portfolio with beautiful high-resolution galleries. The minimal design puts the focus on your images while providing intuitive navigation and a professional presentation that will impress potential clients.',
    image: 'https://marketplace.canva.com/EAFwckKNjDE/2/0/1600w/canva-black-white-grayscale-portfolio-presentation-vzScEqAI__M.jpg',
    features: [
      'Fullscreen photo galleries',
      'Multiple portfolio categories',
      'Image lightbox with zoom capability',
      'Password-protected client galleries',
      'Photo metadata display',
      'Print store integration',
      'Photo shoot booking system',
    ],
    layouts: 12,
    isPremium: false,
    sections: [
      'header',
      'about',
      'galleries',
      'categories',
      'services',
      'pricing',
      'contact',
    ]
  },
];

export default function PortfolioEditorPage({ params }: { params: { id: string } }) {
  // Find the template by ID
  const template = templates.find(t => t.id === params.id);

  // If template not found, return 404
  if (!template) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      <main className="flex-grow py-8">
        <div className="container px-4 md:px-6">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Customize Your Portfolio</h1>
              <p className="text-muted-foreground">
                You're using the {template.name} template. Customize it to make it your own.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                Preview
              </Button>
              <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                Publish
              </Button>
            </div>
          </div>

          {/* Main Editor */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Portfolio Settings</CardTitle>
                  <CardDescription>
                    Configure your portfolio settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="title" className="text-sm font-medium">
                        Portfolio Title
                      </label>
                      <Input id="title" placeholder="My Portfolio" />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="subtitle" className="text-sm font-medium">
                        Subtitle
                      </label>
                      <Input id="subtitle" placeholder="Full Stack Developer" />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="subdomain" className="text-sm font-medium">
                        Subdomain
                      </label>
                      <div className="relative">
                        <Input id="subdomain" placeholder="johndoe" />
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-sm text-muted-foreground">
                          .portfoliohub.com
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t">
                      <span className="text-sm font-medium">Template Sections</span>
                      <div className="grid grid-cols-1 gap-2">
                        {template.sections.map((section) => (
                          <div key={section} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
                            <span className="capitalize">{section}</span>
                            <Button variant="ghost" size="sm" className="h-7 px-2">
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
                                className="h-4 w-4"
                              >
                                <path d="M12 5v14" />
                                <path d="M5 12h14" />
                              </svg>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Editor Area */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Content Editor</CardTitle>
                  <CardDescription>
                    Edit your portfolio content section by section
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="about" className="space-y-4">
                    <TabsList className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7">
                      {template.sections.map((section) => (
                        <TabsTrigger key={section} value={section} className="capitalize">
                          {section}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {/* The content tabs will be implemented based on the specific template sections */}
                    <TabsContent value="about" className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">About Title</label>
                        <Input defaultValue="About Me" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Bio</label>
                        <Textarea
                          className="min-h-32"
                          placeholder="Write something about yourself..."
                          defaultValue="I am a passionate developer with 5+ years of experience in building web applications. I specialize in React, Node.js, and TypeScript."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Profile Image</label>
                        <div className="flex items-center gap-4">
                          <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center">
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
                              className="h-12 w-12 text-muted-foreground"
                            >
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                          </div>
                          <Button variant="outline">Upload Image</Button>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Placeholder for other tabs - will be implemented based on template type */}
                    {template.sections.filter(s => s !== 'about').map((section) => (
                      <TabsContent key={section} value={section} className="h-96 flex items-center justify-center border rounded-md">
                        <div className="text-center">
                          <h3 className="text-lg font-medium capitalize mb-2">{section} Section</h3>
                          <p className="text-muted-foreground">
                            This section editor is coming soon. Edit your {section} content here.
                          </p>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-6">
                  <Button variant="outline">
                    Save as Draft
                  </Button>
                  <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { NavBar } from '@/components/layout/NavBar';
import { Footer } from '@/components/layout/Footer';

// Sample template data
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
  },
];

export default function TemplatePreviewPage({ params }: { params: { id: string } }) {
  // Find the template by ID
  const template = templates.find(t => t.id === params.id);

  // If template not found, return 404
  if (!template) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-12 border-b">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div>
                  <div className="inline-block bg-muted px-3 py-1 rounded-full text-sm mb-4">
                    {template.category.charAt(0).toUpperCase() + template.category.slice(1)} Template
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold">{template.name}</h1>
                </div>
                <p className="text-lg text-muted-foreground">
                  {template.longDescription}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href={`/templates/use/${template.id}`}>
                    <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                      Use This Template
                    </Button>
                  </Link>
                  <Link href="/templates">
                    <Button size="lg" variant="outline">
                      View All Templates
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative aspect-video rounded-lg overflow-hidden shadow-xl">
                <Image
                  src={template.image}
                  alt={template.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Template Features</h2>
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                Discover all the features and capabilities that {template.name} has to offer
              </p>
            </div>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {template.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 p-4 rounded-lg border">
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
                    className="h-5 w-5 text-violet-600 mt-0.5"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Preview Section */}
        <section className="py-16 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Template Preview</h2>
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                Take a closer look at how your portfolio can look with this template
              </p>
            </div>

            <div className="aspect-[16/9] max-w-5xl mx-auto relative rounded-lg overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                <div className="text-center px-4">
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
                    className="h-12 w-12 text-violet-600 mx-auto mb-4"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M10 8v8l6-4-6-4z" />
                  </svg>
                  <p className="text-white text-lg font-medium mb-3">Template Preview</p>
                  <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
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
                      className="h-5 w-5 mr-2"
                    >
                      <path d="M10 8v8l6-4-6-4z" />
                    </svg>
                    Play Video Preview
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-indigo-600/10" />
          <div className="container px-4 md:px-6 relative">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl font-bold">Ready to Create Your Portfolio?</h2>
              <p className="text-lg text-muted-foreground">
                Use this template to showcase your work and create a stunning portfolio that stands out.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href={`/templates/use/${template.id}`}>
                  <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                    Use This Template
                  </Button>
                </Link>
                <Link href="/templates">
                  <Button size="lg" variant="outline">
                    View All Templates
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

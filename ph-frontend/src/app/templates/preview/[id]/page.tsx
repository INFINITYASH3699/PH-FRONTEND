'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { NavBar } from '@/components/layout/NavBar';
import { Footer } from '@/components/layout/Footer';
import { toast } from 'sonner';
import apiClient, { Template } from '@/lib/apiClient';
import { templates as fallbackTemplates } from '@/data/templates'; // Use as fallback

// Sample features for templates
const templateFeatures = {
  developer: [
    'Projects showcase with GitHub integration',
    'Skills section with proficiency indicators',
    'Timeline for work experience and education',
    'Dark and light mode support',
    'Responsive design for all devices',
    'Blog section for technical articles',
    'Contact form with validation',
  ],
  designer: [
    'Fullscreen gallery with various layout options',
    'Project case study pages',
    'Client testimonial section',
    'Animated transitions between pages',
    'Instagram feed integration',
    'Contact form with file upload',
    'Custom cursor options',
  ],
  photographer: [
    'Fullscreen photo galleries',
    'Multiple portfolio categories',
    'Image lightbox with zoom capability',
    'Password-protected client galleries',
    'Photo metadata display',
    'Print store integration',
    'Photo shoot booking system',
  ],
  default: [
    'Responsive design for all devices',
    'Customizable sections',
    'Contact form with validation',
    'SEO optimized',
    'Social media integration',
    'Quick loading speed',
    'Modern and clean design',
  ],
};

export default function TemplatePreviewPage() {
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : '';

  // Fetch template data
  useEffect(() => {
    const fetchTemplate = async () => {
      if (!id) {
        setNotFoundError(true);
        setLoading(false);
        return;
      }

      try {
        // Try to fetch from API
        const templateData = await apiClient.getTemplateById(id);
        setTemplate(templateData);
      } catch (error) {
        console.error('Error fetching template:', error);
        toast.error('Failed to load template from API. Using demo data.');

        // Fallback to demo data
        const fallbackTemplate = fallbackTemplates.find(t => t._id === id);
        if (fallbackTemplate) {
          setTemplate({
            _id: fallbackTemplate._id,
            name: fallbackTemplate.name,
            description: fallbackTemplate.description,
            category: fallbackTemplate.category,
            previewImage: fallbackTemplate.previewImage,
            defaultStructure: fallbackTemplate.settings || {},
            isPublished: true,
            longDescription: fallbackTemplate.longDescription,
          } as Template);
        } else {
          setNotFoundError(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [id]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-muted-foreground">Loading template preview...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show not found
  if (notFoundError || !template) {
    notFound();
  }

  // Get features based on category or use default
  const features = templateFeatures[template.category as keyof typeof templateFeatures] || templateFeatures.default;

  // Construct a more detailed description if the template doesn't have one
  const longDescription = template.longDescription ||
    `${template.description} This template is designed to help you create a professional portfolio
    that showcases your work effectively. With a focus on ${template.category} projects, it includes
    all the sections you need to highlight your skills, experience, and achievements.`;

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
                  {longDescription}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href={`/templates/use/${template._id}`}>
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
                  src={template.previewImage}
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
              {features.map((feature) => (
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
              <Image
                src={template.previewImage}
                alt={template.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
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
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                    onClick={() => router.push(`/templates/use/${template._id}`)}
                  >
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
                    Start Customizing
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
                <Link href={`/templates/use/${template._id}`}>
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

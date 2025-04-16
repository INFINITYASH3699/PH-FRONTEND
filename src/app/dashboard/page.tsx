import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { NavBar } from '@/components/layout/NavBar';
import { Footer } from '@/components/layout/Footer';
import { portfolios } from '@/data/portfolios';
import { templates } from '@/data/templates';

// Mock user info for demo
const user = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com',
  image: 'https://ui-avatars.com/api/?name=John+Doe&background=6d28d9&color=fff'
};

export default function DashboardPage() {
  // Combine portfolios with template data
  const portfoliosWithTemplates = portfolios.map(portfolio => {
    const template = templates.find(t => t._id === portfolio.templateId);
    return { ...portfolio, template };
  });

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      <main className="flex-grow py-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your portfolios and see how they're performing
              </p>
            </div>
            <Link href="/templates">
              <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                Create New Portfolio
              </Button>
            </Link>
          </div>

          {portfoliosWithTemplates.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfoliosWithTemplates.map((portfolio) => (
                <PortfolioCard key={portfolio._id} portfolio={portfolio} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Empty state when user has no portfolios
function EmptyState() {
  return (
    <div className="mt-12 py-12 border rounded-lg flex flex-col items-center justify-center text-center">
      <div className="h-20 w-20 mb-6 rounded-full bg-muted flex items-center justify-center">
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
          className="h-10 w-10 text-muted-foreground"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold mb-2">No portfolios yet</h2>
      <p className="text-muted-foreground max-w-md mb-6">
        Create your first portfolio by selecting a template and customizing it to showcase your work.
      </p>
      <Link href="/templates">
        <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
          Browse Templates
        </Button>
      </Link>
    </div>
  );
}

// Portfolio card component
function PortfolioCard({ portfolio }: { portfolio: any }) {
  const template = portfolio.template || {};
  const portfolioUrl = `${portfolio.subdomain}.portfoliohub.com`;

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48">
        <Image
          src={template.previewImage || 'https://placehold.co/600x400/e2e8f0/a3adc2?text=No+Preview'}
          alt={portfolio.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
          <h3 className="text-xl font-semibold text-white">{portfolio.title}</h3>
          {portfolio.subtitle && (
            <p className="text-white/80 text-sm">{portfolio.subtitle}</p>
          )}
        </div>
        {portfolio.isPublished ? (
          <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            Published
          </div>
        ) : (
          <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
            Draft
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {template.previewImage ? (
                <Image
                  src={template.previewImage}
                  alt={template.name || 'Template'}
                  width={24}
                  height={24}
                  className="object-cover"
                />
              ) : (
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
                  className="h-4 w-4 text-muted-foreground"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
              )}
            </div>
            <span className="text-sm text-muted-foreground">{template.name || 'Custom Template'}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {new Date(portfolio.updatedAt).toLocaleDateString()}
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="text-sm mb-1">
            <span className="font-medium">URL: </span>
            <a href={`https://${portfolioUrl}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              {portfolioUrl}
            </a>
          </div>
          <div className="text-sm">
            <span className="font-medium">Views: </span>
            <span>0</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t p-4 flex gap-2">
        <Link href={`/templates/use/${portfolio.templateId}?portfolioId=${portfolio._id}`} className="flex-1">
          <Button variant="outline" className="w-full">Edit</Button>
        </Link>
        <Button variant="outline" className="flex-1">Preview</Button>
        {portfolio.isPublished ? (
          <Button variant="outline" className="flex-1">Unpublish</Button>
        ) : (
          <Button className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white">Publish</Button>
        )}
      </CardFooter>
    </Card>
  );
}

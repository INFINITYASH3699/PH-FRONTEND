'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { NavBar } from '@/components/layout/NavBar';
import { Footer } from '@/components/layout/Footer';
import { toast } from 'sonner';

// Portfolio interface
interface Portfolio {
  id: string;
  _id: string;
  title: string;
  subtitle?: string;
  subdomain: string;
  isPublished: boolean;
  updatedAt: string;
  createdAt: string;
  template?: {
    id: string;
    name: string;
    previewImage?: string;
    category?: string;
  };
}

interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/user');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setAuthStatus('authenticated');
        } else {
          setAuthStatus('unauthenticated');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setAuthStatus('unauthenticated');
      }
    };

    checkAuth();
  }, []);

  // Fetch user portfolios when authenticated
  useEffect(() => {
    const fetchPortfolios = async () => {
      if (authStatus === 'authenticated') {
        try {
          const response = await fetch('/api/user/portfolios');
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch portfolios');
          }

          setPortfolios(data.portfolios);
        } catch (error) {
          console.error('Error fetching portfolios:', error);
          toast.error('Failed to load your portfolios');
        } finally {
          setLoading(false);
        }
      } else if (authStatus === 'unauthenticated') {
        // Not logged in, no need to fetch
        setLoading(false);
      }
    };

    fetchPortfolios();
  }, [authStatus]);

  // Function to handle portfolio publishing state change
  const handlePublishToggle = async (portfolioId: string, currentState: boolean) => {
    try {
      const response = await fetch('/api/portfolios', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: portfolioId,
          isPublished: !currentState,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update portfolio');
      }

      // Update local state
      setPortfolios(prevPortfolios =>
        prevPortfolios.map(portfolio =>
          portfolio.id === portfolioId
            ? { ...portfolio, isPublished: !currentState }
            : portfolio
        )
      );

      toast.success(
        currentState
          ? 'Portfolio unpublished successfully'
          : 'Portfolio published successfully'
      );
    } catch (error) {
      console.error('Error toggling publish state:', error);
      toast.error('Failed to update portfolio');
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      window.location.href = '/auth/signin';
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    }
  };

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
            <div className="flex gap-2">
              <Link href="/templates">
                <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                  Create New Portfolio
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>

          {loading ? (
            <LoadingState />
          ) : authStatus === 'unauthenticated' ? (
            <UnauthenticatedState />
          ) : portfolios.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolios.map((portfolio) => (
                <PortfolioCard
                  key={portfolio.id}
                  portfolio={portfolio}
                  onPublishToggle={handlePublishToggle}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Loading state when fetching portfolios
function LoadingState() {
  return (
    <div className="mt-12 py-12 border rounded-lg flex flex-col items-center justify-center text-center">
      <div className="h-20 w-20 mb-6 rounded-full bg-muted flex items-center justify-center animate-pulse">
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
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold mb-2">Loading your portfolios...</h2>
      <p className="text-muted-foreground max-w-md">
        Please wait while we retrieve your portfolio data.
      </p>
    </div>
  );
}

// State when user is not authenticated
function UnauthenticatedState() {
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
          <circle cx="12" cy="12" r="10" />
          <path d="M8 15h8M10 9h.01M14 9h.01" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold mb-2">Not Signed In</h2>
      <p className="text-muted-foreground max-w-md mb-6">
        You need to sign in to view and manage your portfolios.
      </p>
      <Link href="/auth/signin">
        <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
          Sign In
        </Button>
      </Link>
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
interface PortfolioCardProps {
  portfolio: Portfolio;
  onPublishToggle: (id: string, currentState: boolean) => Promise<void>;
}

function PortfolioCard({ portfolio, onPublishToggle }: PortfolioCardProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const portfolioUrl = `${portfolio.subdomain}.portfoliohub.com`;

  const handlePublishClick = async () => {
    setIsPublishing(true);
    try {
      await onPublishToggle(portfolio.id, portfolio.isPublished);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48">
        <Image
          src={portfolio.template?.previewImage || 'https://placehold.co/600x400/e2e8f0/a3adc2?text=No+Preview'}
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
              {portfolio.template?.previewImage ? (
                <Image
                  src={portfolio.template.previewImage}
                  alt={portfolio.template?.name || 'Template'}
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
            <span className="text-sm text-muted-foreground">{portfolio.template?.name || 'Custom Template'}</span>
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
        <Link href={`/templates/use/${portfolio.template?.id || 'default'}?portfolioId=${portfolio.id}`} className="flex-1">
          <Button variant="outline" className="w-full">Edit</Button>
        </Link>
        <Link href={`/portfolio/${portfolio.subdomain}`} target="_blank" className="flex-1">
          <Button variant="outline" className="w-full">Preview</Button>
        </Link>
        {portfolio.isPublished ? (
          <Button
            variant="outline"
            className="flex-1"
            onClick={handlePublishClick}
            disabled={isPublishing}
          >
            {isPublishing ? 'Updating...' : 'Unpublish'}
          </Button>
        ) : (
          <Button
            className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
            onClick={handlePublishClick}
            disabled={isPublishing}
          >
            {isPublishing ? 'Publishing...' : 'Publish'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

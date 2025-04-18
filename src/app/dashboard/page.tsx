'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { NavBar } from '@/components/layout/NavBar';
import { Footer } from '@/components/layout/Footer';
import { toast } from 'sonner';
import apiClient, { User } from '@/lib/apiClient';
import { useAuth } from '@/components/providers/AuthContext';

// Portfolio interface
interface Portfolio {
  _id: string;
  title: string;
  subtitle?: string;
  subdomain: string;
  isPublished: boolean;
  updatedAt: string;
  createdAt: string;
  templateId?: {
    _id: string;
    name: string;
    previewImage?: string;
    category?: string;
  };
  viewCount: number;
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  // Log auth status for debugging
  useEffect(() => {
    console.log('Dashboard auth status:', {
      isAuthenticated,
      authLoading,
      user: user ? {
        id: user.id,
        email: user.email,
        username: user.username
      } : null
    });
  }, [isAuthenticated, authLoading, user]);

  // Check if user is authenticated using Auth context
  useEffect(() => {
    if (authLoading) {
      setAuthStatus('loading');
    } else if (isAuthenticated && user) {
      setAuthStatus('authenticated');
    } else {
      setAuthStatus('unauthenticated');
      // Only redirect if not in the loading state
      if (!authLoading) {
        console.log('Not authenticated, redirecting to signin');
        window.location.href = '/auth/signin';
      }
    }
  }, [isAuthenticated, authLoading, user]);

  // Fetch user portfolios when authenticated
  useEffect(() => {
    const fetchPortfolios = async () => {
      if (authStatus === 'authenticated') {
        try {
          console.log('Fetching portfolios...');
          const data = await apiClient.request<{ success: boolean; portfolios: Portfolio[] }>('/portfolios');
          console.log('Portfolios fetched:', data.portfolios.length);
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
      await apiClient.request<{ success: boolean; portfolio: Portfolio }>(
        `/portfolios/${portfolioId}`,
        'PUT',
        { isPublished: !currentState }
      );

      // Update local state
      setPortfolios(prevPortfolios =>
        prevPortfolios.map(portfolio =>
          portfolio._id === portfolioId
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
  const handleLogout = () => {
    apiClient.logout();
    window.location.href = '/auth/signin';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      <main className="flex-grow py-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              {user && (
                <p className="text-muted-foreground mb-2">
                  Welcome, {user.fullName || user.username}! ({user.email})
                </p>
              )}
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
                  key={portfolio._id}
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
    </div>
  );
}

// Empty state when no portfolios are found
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
          <path d="M12 8v8" />
          <path d="M8 12h8" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold mb-2">No Portfolios Yet</h2>
      <p className="text-muted-foreground max-w-md mb-6">
        You don't have any portfolios yet. Create your first portfolio to showcase your work.
      </p>
      <Link href="/templates">
        <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
          Create Your First Portfolio
        </Button>
      </Link>
    </div>
  );
}

// Portfolio card component
function PortfolioCard({ portfolio, onPublishToggle }: { portfolio: Portfolio, onPublishToggle: (id: string, currentState: boolean) => void }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-0">
        <CardTitle className="truncate">{portfolio.title || 'Untitled Portfolio'}</CardTitle>
        <CardDescription className="truncate">
          {portfolio.subtitle || 'No description'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="aspect-video relative rounded-md overflow-hidden bg-muted mb-4">
          {portfolio.templateId?.previewImage ? (
            <Image
              src={portfolio.templateId.previewImage}
              alt={portfolio.title || 'Portfolio preview'}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
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
                className="h-12 w-12 text-muted-foreground/50"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${portfolio.isPublished ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="text-sm text-muted-foreground">
              {portfolio.isPublished ? 'Published' : 'Draft'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Views: {portfolio.viewCount || 0}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPublishToggle(portfolio._id, portfolio.isPublished)}
            >
              {portfolio.isPublished ? 'Unpublish' : 'Publish'}
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Link href={`/portfolio/${portfolio.subdomain}`} target="_blank">
          <Button variant="outline" size="sm">
            View
          </Button>
        </Link>
        <Link href={`/templates/use/${portfolio.templateId?._id || 'default'}`}>
          <Button variant="default" size="sm">
            Edit
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

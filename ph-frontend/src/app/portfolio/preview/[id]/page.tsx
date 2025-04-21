'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound, useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Laptop, Smartphone, Tablet, Eye, Share2, Pencil, LayoutDashboard, Globe } from 'lucide-react';
import apiClient from '@/lib/apiClient';

export default function PortfolioPreviewPage() {
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewportSize, setViewportSize] = useState('desktop');
  const [showStats, setShowStats] = useState(true);
  const [publishLoading, setPublishLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [iframeUrl, setIframeUrl] = useState('');

  const router = useRouter();

  // Get portfolio ID from route params
  const params = useParams();
  const portfolioId = typeof params.id === 'string' ? params.id : '';

  // Share functionality
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Portfolio URL copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy URL to clipboard');
    }
  };

  const shareOnTwitter = () => {
    const text = `Check out ${portfolio?.title}'s portfolio`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      '_blank'
    );
  };

  const shareOnLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      '_blank'
    );
  };

  const shareOnFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      '_blank'
    );
  };

  // Fetch user data to check subscription
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiClient.request('/auth/me');
        if (response.success && response.user) {
          setUser(response.user);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // Fetch portfolio data by ID (not subdomain)
  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!portfolioId) return;

      try {
        setLoading(true);
        // Call the API to get portfolio by ID
        const response = await apiClient.request(`/portfolios/${portfolioId}`);

        if (response.success && response.portfolio) {
          setPortfolio(response.portfolio);
          console.log('Portfolio data loaded:', response.portfolio);
        } else {
          // If no portfolio is found, show 404
          notFound();
        }
      } catch (error) {
        console.error('Error fetching portfolio:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [portfolioId]);

  // Set iframe URL for preview (fix absolute URL)
  useEffect(() => {
    if (!portfolioId) return;

    // Only run client side
    if (typeof window !== 'undefined') {
      setIframeUrl(
        portfolio && portfolio.isPublished
          ? `/portfolio/${portfolio.subdomain || 'preview'}`
          : `${window.location.origin}/api/preview/${portfolioId}`
      );
    }
  }, [portfolio, portfolioId]);

  // Publish portfolio function
  const publishPortfolio = async () => {
    if (!portfolio || !portfolioId) return;

    try {
      setPublishLoading(true);
      const response = await apiClient.request(`/portfolios/${portfolioId}`, {
        method: 'PUT',
        data: {
          isPublished: true,
        },
      });

      if (response.success) {
        setPortfolio({ ...portfolio, isPublished: true });
        toast.success('Portfolio published successfully! It is now publicly visible.');
      } else {
        toast.error(response.message || 'Failed to publish portfolio');
      }
    } catch (error) {
      console.error('Error publishing portfolio:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setPublishLoading(false);
    }
  };

  // Unpublish portfolio function
  const unpublishPortfolio = async () => {
    if (!portfolio || !portfolioId) return;

    try {
      setPublishLoading(true);
      const response = await apiClient.request(`/portfolios/${portfolioId}`, {
        method: 'PUT',
        data: {
          isPublished: false,
        },
      });

      if (response.success) {
        setPortfolio({ ...portfolio, isPublished: false });
        toast.success('Portfolio unpublished. It is no longer publicly visible.');
      } else {
        toast.error(response.message || 'Failed to unpublish portfolio');
      }
    } catch (error) {
      console.error('Error unpublishing portfolio:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setPublishLoading(false);
    }
  };

  // Go to editor
  const goToEditor = () => {
    if (!portfolio?.templateId?._id) {
      toast.error('Template information not found');
      return;
    }

    router.push(`/templates/use/${portfolio.templateId._id}?portfolioId=${portfolioId}`);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-muted-foreground">Loading portfolio preview...</p>
          </div>
        </div>
      </div>
    );
  }

  // If portfolio not found, return 404
  if (!portfolio) {
    return notFound();
  }

  // Extract username for navigation links
  const username = portfolio.subdomain || 'preview';
  const portfolioViewUrl = portfolio.isPublished ? `/portfolio/${username}` : null;
  const hasPaidPlan = user?.subscriptionPlan?.type !== 'free' && user?.subscriptionPlan?.isActive;

  // Determine preview container classes based on viewport size
  const getPreviewContainerClasses = () => {
    switch (viewportSize) {
      case 'mobile':
        return 'w-[375px] h-[667px] mx-auto border rounded-lg shadow-lg overflow-hidden';
      case 'tablet':
        return 'w-[768px] h-[1024px] mx-auto border rounded-lg shadow-lg overflow-hidden';
      case 'desktop':
      default:
        return 'w-full h-[calc(100vh-150px)] border rounded-lg shadow-lg overflow-hidden';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-gray-900">
      {/* Preview Banner */}
      <div className="bg-yellow-500 text-white py-2 px-4 text-center">
        <p className="text-sm font-medium">
          {portfolio.isPublished
            ? 'This portfolio is published and publicly visible.'
            : 'This is a preview of your portfolio. It will not be publicly visible until you publish it.'}
        </p>
      </div>

      {/* Control Panel Header */}
      <header className="sticky top-0 z-50 w-full bg-white dark:bg-gray-950 border-b shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <LayoutDashboard className="h-5 w-5" />
              <span className="font-medium">Dashboard</span>
            </Link>
            <span className="text-muted-foreground">/</span>
            <h1 className="font-semibold text-lg tracking-tight truncate max-w-[200px]">
              {portfolio.title || 'Preview'}
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                className={viewportSize === 'desktop' ? 'bg-slate-100' : ''}
                onClick={() => setViewportSize('desktop')}
                title="Desktop View"
              >
                <Laptop className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={viewportSize === 'tablet' ? 'bg-slate-100' : ''}
                onClick={() => setViewportSize('tablet')}
                title="Tablet View"
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={viewportSize === 'mobile' ? 'bg-slate-100' : ''}
                onClick={() => setViewportSize('mobile')}
                title="Mobile View"
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center space-x-2"
              onClick={goToEditor}
            >
              <Pencil className="h-4 w-4" />
              <span>Edit</span>
            </Button>

            {portfolioViewUrl && (
              <Link href={portfolioViewUrl} target="_blank">
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex items-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Published</span>
                </Button>
              </Link>
            )}

            <Button
              variant="outline"
              size="sm"
              className="relative"
              onClick={() => setShowShareOptions(!showShareOptions)}
            >
              <Share2 className="h-4 w-4" />
              <span className="sr-only">Share</span>

              {showShareOptions && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 p-2 z-50">
                  <div className="py-1">
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                      Copy Link
                    </button>
                    <button
                      onClick={shareOnTwitter}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                      Twitter
                    </button>
                    <button
                      onClick={shareOnLinkedIn}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                      LinkedIn
                    </button>
                    <button
                      onClick={shareOnFacebook}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                      Facebook
                    </button>
                  </div>
                </div>
              )}
            </Button>

            {portfolio.isPublished ? (
              <Button
                variant="destructive"
                size="sm"
                disabled={publishLoading}
                onClick={unpublishPortfolio}
              >
                {publishLoading ? 'Processing...' : 'Unpublish'}
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                disabled={publishLoading}
                onClick={publishPortfolio}
              >
                {publishLoading ? 'Processing...' : 'Publish'}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="container py-6 flex-1 flex flex-col md:flex-row gap-6">
        {/* Preview Panel - Takes up more space on larger screens */}
        <div className="w-full md:w-3/4 lg:w-3/4 flex flex-col">
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          <div className={getPreviewContainerClasses()}>
            {iframeUrl && (
              <iframe
                src={iframeUrl}
                className="w-full h-full border-0"
                title="Portfolio Preview"
              />
            )}
          </div>
        </div>

        {/* Info Panel - Takes up less space */}
        <div className="w-full md:w-1/4 lg:w-1/4 space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Portfolio Details</h2>
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-stats"
                  checked={showStats}
                  onCheckedChange={setShowStats}
                />
                <Label htmlFor="show-stats">Stats</Label>
              </div>
            </div>

            <div className="mt-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm divide-y">
              <div className="p-4">
                <h3 className="font-medium">Basic Info</h3>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Title</span>
                    <span className="font-medium">{portfolio.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subdomain</span>
                    <span className="font-medium">{portfolio.subdomain}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Custom Domain</span>
                    <span className="font-medium">
                      {portfolio.customDomain ? (
                        <span className="text-green-600">{portfolio.customDomain}</span>
                      ) : hasPaidPlan ? (
                        <span className="text-amber-600">Not Set</span>
                      ) : (
                        <span className="text-gray-500">Premium Feature</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span
                      className={`font-medium ${
                        portfolio.isPublished ? 'text-green-600' : 'text-amber-600'
                      }`}
                    >
                      {portfolio.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
              </div>

              {showStats && (
                <div className="p-4">
                  <h3 className="font-medium">Statistics</h3>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Views</span>
                      <span className="font-medium">{portfolio.viewCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span className="font-medium">
                        {new Date(portfolio.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated</span>
                      <span className="font-medium">
                        {new Date(portfolio.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4">
                <h3 className="font-medium">Template</h3>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">{portfolio.templateId?.name || 'Custom'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">{portfolio.templateId?.category || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-medium">SEO Information</h3>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Title</span>
                    <span className="font-medium truncate max-w-[150px]">
                      {portfolio.content?.seo?.title || portfolio.title || 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Description</span>
                    <span className="font-medium truncate max-w-[150px]">
                      {portfolio.content?.seo?.description ? 'Set' : 'Not set'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Domain Settings for paid users */}
          {hasPaidPlan && (
            <div className="border rounded-lg bg-white dark:bg-gray-800 shadow-sm p-4">
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-violet-600" />
                <h3 className="font-medium">Custom Domain</h3>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Set up a custom domain for your portfolio.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                onClick={() => router.push(`/profile?tab=domains&portfolioId=${portfolioId}`)}
              >
                Configure Domain
              </Button>
            </div>
          )}

          {/* Quick Actions */}
          <div className="border rounded-lg bg-white dark:bg-gray-800 shadow-sm p-4">
            <h3 className="font-medium">Quick Actions</h3>
            <div className="mt-4 space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={goToEditor}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Portfolio
              </Button>

              {portfolioViewUrl && (
                <Link href={portfolioViewUrl} target="_blank" className="w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Published Version
                  </Button>
                </Link>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => router.push(`/dashboard`)}
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

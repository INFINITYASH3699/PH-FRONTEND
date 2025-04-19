'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import apiClient from '@/lib/apiClient'; // Import API client

export default function PublishedPortfolioPage() {
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get username from route params using the useParams hook
  const params = useParams();
  const username = typeof params.username === 'string' ? params.username : '';

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
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  // Fetch portfolio data
  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!username) return;

      try {
        setLoading(true);
        // Call the API to get portfolio by subdomain
        const response = await apiClient.request(`/portfolios/subdomain/${username}`);

        if (response.success && response.portfolio) {
          setPortfolio(response.portfolio);
        } else {
          // If no portfolio is found, show 404
          notFound();
        }
      } catch (error) {
        console.error('Error fetching portfolio:', error);
        // For development fallback to sample data
        if (process.env.NODE_ENV === 'development') {
          console.log('Using fallback data for development');
          const fallbackPortfolio = portfolios.find(p => p.username === username);
          if (fallbackPortfolio) {
            setPortfolio(fallbackPortfolio);
          } else {
            notFound();
          }
        } else {
          notFound();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [username]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-muted-foreground">Loading portfolio...</p>
          </div>
        </div>
      </div>
    );
  }

  // If portfolio not found, return 404 handled by Next.js
  if (!portfolio) {
    return notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-950/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href={`/portfolio/${username}`} className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text">
            {username}
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#about" className="text-sm font-medium transition-colors hover:text-primary">About</a>
            <a href="#projects" className="text-sm font-medium transition-colors hover:text-primary">Projects</a>
            <a href="#skills" className="text-sm font-medium transition-colors hover:text-primary">Skills</a>
            <a href="#experience" className="text-sm font-medium transition-colors hover:text-primary">Experience</a>
            <a href="#education" className="text-sm font-medium transition-colors hover:text-primary">Education</a>
            <a href="#contact" className="text-sm font-medium transition-colors hover:text-primary">Contact</a>
          </nav>

          {/* Share Button */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowShareOptions(!showShareOptions)}
                className="p-2 rounded-full bg-violet-100 dark:bg-gray-800 text-violet-600 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-gray-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </button>

              {showShareOptions && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 p-2 z-50">
                  <div className="py-1">
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 mr-2"
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      Copy Link
                    </button>
                    <button
                      onClick={shareOnTwitter}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        className="h-4 w-4 mr-2 text-[#1DA1F2]"
                        fill="currentColor"
                      >
                        <path d="M22 5.8a8.49 8.49 0 0 1-2.36.64 4.13 4.13 0 0 0 1.81-2.27 8.21 8.21 0 0 1-2.61 1 4.1 4.1 0 0 0-7 3.74 11.64 11.64 0 0 1-8.45-4.29 4.16 4.16 0 0 0-.55 2.07 4.09 4.09 0 0 0 1.82 3.41 4.05 4.05 0 0 1-1.86-.51v.05a4.1 4.1 0 0 0 3.3 4 3.93 3.93 0 0 1-1.1.17 4.9 4.9 0 0 1-.77-.07 4.11 4.11 0 0 0 3.83 2.84A8.22 8.22 0 0 1 3 18.34a7.93 7.93 0 0 1-1-.06 11.57 11.57 0 0 0 6.29 1.85A11.59 11.59 0 0 0 20 8.45v-.53a8.43 8.43 0 0 0 2-2.12Z" />
                      </svg>
                      Twitter
                    </button>
                    <button
                      onClick={shareOnLinkedIn}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        className="h-4 w-4 mr-2 text-[#0077B5]"
                        fill="currentColor"
                      >
                        <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
                      </svg>
                      LinkedIn
                    </button>
                    <button
                      onClick={shareOnFacebook}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        className="h-4 w-4 mr-2 text-[#1877F2]"
                        fill="currentColor"
                      >
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2z" />
                      </svg>
                      Facebook
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
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
                className="h-5 w-5"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Share options for mobile (below header) */}
      <div className="container px-4 md:px-6 py-3 flex items-center justify-between md:hidden border-b">
        <span className="text-sm text-muted-foreground">Share this portfolio:</span>
        <div className="flex space-x-2">
          <button
            onClick={copyToClipboard}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
          <button
            onClick={shareOnTwitter}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-[#1DA1F2]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="currentColor"
            >
              <path d="M22 5.8a8.49 8.49 0 0 1-2.36.64 4.13 4.13 0 0 0 1.81-2.27 8.21 8.21 0 0 1-2.61 1 4.1 4.1 0 0 0-7 3.74 11.64 11.64 0 0 1-8.45-4.29 4.16 4.16 0 0 0-.55 2.07 4.09 4.09 0 0 0 1.82 3.41 4.05 4.05 0 0 1-1.86-.51v.05a4.1 4.1 0 0 0 3.3 4 3.93 3.93 0 0 1-1.1.17 4.9 4.9 0 0 1-.77-.07 4.11 4.11 0 0 0 3.83 2.84A8.22 8.22 0 0 1 3 18.34a7.93 7.93 0 0 1-1-.06 11.57 11.57 0 0 0 6.29 1.85A11.59 11.59 0 0 0 20 8.45v-.53a8.43 8.43 0 0 0 2-2.12Z" />
            </svg>
          </button>
          <button
            onClick={shareOnLinkedIn}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-[#0077B5]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="currentColor"
            >
              <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
            </svg>
          </button>
          <button
            onClick={shareOnFacebook}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-[#1877F2]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="currentColor"
            >
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2z" />
            </svg>
          </button>
        </div>
      </div>

      <main className="flex-grow">
        {/* Hero Section */}
        <section id="about" className="py-24 border-b">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
                  {portfolio.title || portfolio.content?.about?.title || username}
                </h1>
                <p className="text-xl text-muted-foreground max-w-[600px]">
                  {portfolio.subtitle || portfolio.content?.about?.subtitle || 'Portfolio'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="#contact">
                    <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                      Contact Me
                    </Button>
                  </a>
                  <a href={portfolio.content?.contact?.socialLinks?.github || '#'} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" variant="outline">
                      View GitHub
                    </Button>
                  </a>
                </div>
              </div>
              <div className="mx-auto lg:mx-0">
                <div className="relative w-72 h-72 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl">
                  <Image
                    src={portfolio.content?.about?.profileImage || portfolio.headerImage?.url || 'https://ui-avatars.com/api/?name=' + username}
                    alt={portfolio.title || username}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamically render sections based on portfolio content */}
        {portfolio.content?.projects?.items?.length > 0 && (
          <section id="projects" className="py-24 border-b">
            <div className="container px-4 md:px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold">My Projects</h2>
                <p className="text-xl text-muted-foreground max-w-[800px] mx-auto mt-4">
                  Here are some of my recent projects.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {portfolio.content.projects.items.map((project, index) => (
                  <div key={project.id || index} className="group overflow-hidden rounded-lg border shadow-sm transition-all hover:shadow-md">
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={project.imageUrl || 'https://placehold.co/600x400/6d28d9/fff?text=Project'}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                      <p className="text-muted-foreground mb-4">{project.description}</p>
                      <div className="flex gap-3">
                        {project.projectUrl && (
                          <a href={project.projectUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm">Demo</Button>
                          </a>
                        )}
                        {project.githubUrl && (
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm">Code</Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Show a simplified version for now, add other sections based on portfolio content */}
        {/* You would want to render skills, experience, education, etc. similarly */}

        {/* Footer */}
        <footer className="border-t py-6">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} {portfolio.title}. All rights reserved.
              </p>
              <p className="text-sm text-muted-foreground">
                Powered by <Link href="/" className="text-primary hover:underline">PortfolioHub</Link>
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

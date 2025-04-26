"use client"

import { useState, useEffect } from 'react';
import { notFound, useParams, useSearchParams } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import PortfolioTemplateRenderer from '@/components/template-renderer/PortfolioTemplateRenderer';

export default function PublishedPortfolioPage() {
  const [portfolio, setPortfolio] = useState(null);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get username from route params using the useParams hook
  const params = useParams();
  const username = typeof params.username === 'string' ? params.username : '';

  // Get search params to check for full view mode
  const searchParams = useSearchParams();
  const isFullView = searchParams.get('view') === 'full';

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!username) return;

      try {
        setLoading(true);

        // Extract the base username and potential order number if it exists
        let baseUsername = username;
        let portfolioOrder = undefined;

        // Check if the username has a number suffix like username-1, username-2, etc.
        // This code path needs to be fixed - it's splitting incorrectly
        const usernameMatch = username.match(/^(.*?)(?:-(\d+))?$/);
        if (usernameMatch) {
          baseUsername = usernameMatch[1]; // The base part without the number
          if (usernameMatch[2]) {
            portfolioOrder = parseInt(usernameMatch[2]);
          }
        }

        // Call the API to get portfolio by subdomain
        // If portfolioOrder is defined, pass it as a query parameter
        let endpoint = `/portfolios/subdomain/${baseUsername}`;
        if (portfolioOrder !== undefined) {
          endpoint += `?order=${portfolioOrder}`;
        }

        const response = await apiClient.request(endpoint);
        console.log(`Fetched portfolio for subdomain ${baseUsername}, order: ${portfolioOrder || 0}`);

        if (response.success && response.portfolio) {
          setPortfolio(response.portfolio);

          // After getting the portfolio, fetch the template data
          if (response.portfolio.templateId && response.portfolio.templateId._id) {
            try {
              const templateResponse = await apiClient.request(
                `/templates/${response.portfolio.templateId._id}`
              );

              if (templateResponse.success && templateResponse.template) {
                setTemplate(templateResponse.template);
              }
            } catch (templateError) {
              console.error('Error fetching template data:', templateError);
            }
          }
        } else {
          // If no portfolio is found, show 404
          notFound();
        }
      } catch (error) {
        console.error('Error fetching portfolio:', error);
        // For development fallback to sample data
        if (process.env.NODE_ENV === 'development') {
          console.log('Using fallback data for development');
          notFound();
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

  // If we have a portfolio but no template, render a fallback basic layout
  if (!template) {
    return renderFallbackPortfolio();
  }

  // If we have both portfolio and template, use the PortfolioTemplateRenderer component
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <PortfolioTemplateRenderer
        template={template}
        portfolio={portfolio}
      />
    </div>
  );

  // Fallback function to render a basic portfolio layout if template data isn't available
  function renderFallbackPortfolio() {
    // Extract portfolio order information for the page title
    const portfolioOrderSuffix =
      portfolio.portfolioOrder && portfolio.portfolioOrder > 0
        ? ` (${portfolio.portfolioOrder})`
        : '';

    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
        <main className="flex-grow">
          {/* About Section - Always visible, even if portfolio.content.about is undefined */}
          <section id="about" className="py-24 border-b">
            <div className="container px-4 md:px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
                    {(portfolio.content?.about?.title) ||
                      (portfolio.content?.header?.title) ||
                      portfolio.title ||
                      username}
                    {portfolioOrderSuffix}
                  </h1>
                  <p className="text-xl text-muted-foreground max-w-[600px]">
                    {(portfolio.content?.about?.bio) ||
                      (portfolio.content?.header?.subtitle) ||
                      portfolio.subtitle ||
                      'Portfolio'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Display a message about the template */}
          <section className="py-12 text-center">
            <div className="container px-4 md:px-6">
              <p className="text-muted-foreground">
                This portfolio uses a template that could not be loaded.
                Please contact the site administrator for assistance.
              </p>
            </div>
          </section>
        </main>
      </div>
    );
  }
}

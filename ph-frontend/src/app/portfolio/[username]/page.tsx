"use client";

import { useState, useEffect } from "react";
import { notFound, useParams, useSearchParams } from "next/navigation";
import apiClient from "@/lib/apiClient";
import PortfolioTemplateRenderer from "@/components/template-renderer/PortfolioTemplateRenderer";

export default function PublishedPortfolioPage() {
  const [portfolio, setPortfolio] = useState(null);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState({});

  // Get username from route params using the useParams hook
  const params = useParams();
  const username = typeof params.username === "string" ? params.username : "";

  // Get search params to check for full view mode
  const searchParams = useSearchParams();
  const isFullView = searchParams.get("view") === "full";

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!username) return;

      try {
        setLoading(true);

        // Extract the base username and potential order number if it exists
        let baseUsername = username;
        let portfolioOrder = undefined;

        // Use a fixed regex to capture the base username and optional number suffix
        const usernameMatch = username.match(/^(.*?)(?:-(\d+))?$/);
        if (usernameMatch) {
          baseUsername = usernameMatch[1]; // The base part without the number
          if (usernameMatch[2]) {
            portfolioOrder = parseInt(usernameMatch[2]);
          }
        }

        // Save debug info to help troubleshoot
        setDebugInfo({
          originalUsername: username,
          parsedUsername: baseUsername,
          portfolioOrder: portfolioOrder,
        });

        console.log(
          `Fetching portfolio: username=${username}, baseUsername=${baseUsername}, portfolioOrder=${portfolioOrder || 0}`
        );

        // Call the API to get portfolio by subdomain
        // If portfolioOrder is defined, pass it as a query parameter
        let endpoint = `/portfolios/subdomain/${baseUsername}`;
        if (portfolioOrder !== undefined) {
          endpoint += `?order=${portfolioOrder}`;
        }

        const response = await apiClient.request(endpoint);
        console.log(`API Response:`, response);

        if (response.success && response.portfolio) {
          // Make sure portfolio has some basic structure
          const processedPortfolio = {
            ...response.portfolio,
            content: response.portfolio.content || {}
          };

          setPortfolio(processedPortfolio);
          console.log(`Portfolio found:`, {
            id: processedPortfolio._id,
            title: processedPortfolio.title,
            templateId: processedPortfolio.templateId?._id,
            isPublished: processedPortfolio.isPublished,
            order: processedPortfolio.portfolioOrder,
            content: processedPortfolio.content ? Object.keys(processedPortfolio.content) : 'No content'
          });

          // Extract the template ID
          let templateId = null;

          // Handle different ways the templateId might be structured
          if (processedPortfolio.templateId) {
            if (
              typeof processedPortfolio.templateId === "object" &&
              processedPortfolio.templateId._id
            ) {
              // If templateId is an object with _id property
              templateId = processedPortfolio.templateId._id;
            } else if (typeof processedPortfolio.templateId === "string") {
              // If templateId is a string
              templateId = processedPortfolio.templateId;
            }
          }

          console.log("Extracted templateId:", templateId);

          if (templateId) {
            try {
              const templateResponse = await apiClient.request(
                `/templates/${templateId}`
              );

              if (templateResponse.success && templateResponse.template) {
                // Ensure the template has the necessary properties
                const processedTemplate = {
                  ...templateResponse.template,
                  defaultStructure: templateResponse.template.defaultStructure || {
                    layout: {
                      sections: ['header', 'about', 'projects', 'skills', 'experience', 'education', 'contact'],
                      defaultColors: ['#6366f1', '#8b5cf6', '#ffffff', '#111827']
                    }
                  },
                  layouts: templateResponse.template.layouts || [{
                    id: 'default',
                    name: 'Standard Layout',
                    structure: {
                      sections: ['header', 'about', 'projects', 'skills', 'experience', 'education', 'contact']
                    }
                  }]
                };

                setTemplate(processedTemplate);
                console.log(`Template loaded:`, {
                  id: processedTemplate._id,
                  name: processedTemplate.name,
                  sections: processedTemplate.defaultStructure?.layout?.sections || [],
                  layouts: processedTemplate.layouts?.length || 0
                });
              } else {
                console.error("Template response error:", templateResponse);
              }
            } catch (templateError) {
              console.error("Error fetching template data:", templateError);
            }
          } else {
            console.warn(
              "Portfolio has no valid templateId:",
              processedPortfolio.templateId
            );
          }
        } else {
          console.error("Portfolio not found in API response:", response);
          // If no portfolio is found, show 404
          notFound();
        }
      } catch (error) {
        console.error("Error fetching portfolio:", error);
        // For development fallback to sample data
        if (process.env.NODE_ENV === "development") {
          console.log("Using fallback data for development");
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
    console.error("Portfolio not found, returning 404 page", debugInfo);
    return notFound();
  }

  // If we have a portfolio but no template, render a fallback basic layout
  if (!template) {
    console.warn(
      "Portfolio found but template missing, using fallback renderer",
      {
        portfolioId: portfolio._id,
        templateId: portfolio.templateId?._id || "missing",
      }
    );
    return renderFallbackPortfolio();
  }

  // If we have both portfolio and template, use the PortfolioTemplateRenderer component
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <PortfolioTemplateRenderer template={template} portfolio={portfolio} />
    </div>
  );

  // Fallback function to render a basic portfolio layout if template data isn't available
  function renderFallbackPortfolio() {
    // Extract portfolio order information for the page title
    const portfolioOrderSuffix =
      portfolio.portfolioOrder && portfolio.portfolioOrder > 0
        ? ` (${portfolio.portfolioOrder})`
        : "";

    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
        <main className="flex-grow">
          {/* About Section - Always visible, even if portfolio.content.about is undefined */}
          <section id="about" className="py-24 border-b">
            <div className="container px-4 md:px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
                    {portfolio.content?.about?.title ||
                      portfolio.content?.header?.title ||
                      portfolio.title ||
                      username}
                    {portfolioOrderSuffix}
                  </h1>
                  <p className="text-xl text-muted-foreground max-w-[600px]">
                    {portfolio.content?.about?.bio ||
                      portfolio.content?.header?.subtitle ||
                      portfolio.subtitle ||
                      "Portfolio"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Display a message about the template */}
          <section className="py-12 text-center">
            <div className="container px-4 md:px-6">
              <p className="text-muted-foreground">
                This portfolio uses a template that could not be loaded. Please
                contact the site administrator for assistance.
              </p>
            </div>
          </section>
        </main>
      </div>
    );
  }
}

"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound, useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import apiClient from '@/lib/apiClient'; // Import API client

export default function PublishedPortfolioPage() {
  const [portfolio, setPortfolio] = useState(null);
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

        // Parse the username to extract the base username and portfolio order if present
        // Example: "username-1" -> { baseUsername: "username", order: 1 }
        let baseUsername = username;
        let portfolioOrder = undefined;

        // Check if the username has a number suffix like username-1, username-2, etc.
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
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="#contact">
                    <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                      Contact Me
                    </Button>
                  </a>
                  <a
                    href={
                      portfolio.content?.contact?.socialLinks?.github ||
                      portfolio.content?.about?.github ||
                      '#'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="lg" variant="outline">
                      View GitHub
                    </Button>
                  </a>
                </div>
              </div>
              <div className="mx-auto lg:mx-0">
                <div className="relative w-72 h-72 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl">
                  <Image
                    src={
                      portfolio.content?.about?.profileImage ||
                      portfolio.headerImage?.url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}`
                    }
                    alt={portfolio.title || username}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Projects Section */}
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

        {/* Skills Section */}
        {portfolio.content?.skills?.categories?.length > 0 && (
          <section id="skills" className="py-24 border-b">
            <div className="container px-4 md:px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold">My Skills</h2>
                <p className="text-xl text-muted-foreground max-w-[800px] mx-auto mt-4">
                  Here are my technical skills and areas of expertise.
                </p>
              </div>

              <div className="space-y-12">
                {portfolio.content.skills.categories.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="space-y-4">
                    <h3 className="text-2xl font-bold">{category.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {category.skills.map((skill, skillIndex) => (
                        <div key={skillIndex} className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{skill.name}</span>
                            <span className="text-sm text-muted-foreground">{skill.proficiency}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-violet-600 to-indigo-600"
                              style={{ width: `${skill.proficiency}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Experience Section */}
        {portfolio.content?.experience?.items?.length > 0 && (
          <section id="experience" className="py-24 border-b">
            <div className="container px-4 md:px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold">Work Experience</h2>
                <p className="text-xl text-muted-foreground max-w-[800px] mx-auto mt-4">
                  My professional journey and work history.
                </p>
              </div>

              <div className="space-y-8">
                {portfolio.content.experience.items.map((exp, index) => (
                  <div key={exp.id || index} className="bg-white dark:bg-gray-800 border rounded-lg p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between mb-4">
                      <h3 className="text-xl font-bold">{exp.title}</h3>
                      <div className="text-muted-foreground text-sm md:text-base">
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between mb-4">
                      <div className="font-medium text-violet-600 dark:text-violet-400">{exp.company}</div>
                      {exp.location && <div className="text-muted-foreground">{exp.location}</div>}
                    </div>
                    <p className="text-muted-foreground whitespace-pre-line">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Education Section */}
        {portfolio.content?.education?.items?.length > 0 && (
          <section id="education" className="py-24 border-b">
            <div className="container px-4 md:px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold">Education</h2>
                <p className="text-xl text-muted-foreground max-w-[800px] mx-auto mt-4">
                  My academic background and qualifications.
                </p>
              </div>

              <div className="space-y-8">
                {portfolio.content.education.items.map((edu, index) => (
                  <div key={edu.id || index} className="bg-white dark:bg-gray-800 border rounded-lg p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between mb-4">
                      <h3 className="text-xl font-bold">{edu.degree}</h3>
                      <div className="text-muted-foreground text-sm md:text-base">
                        {edu.startDate} - {edu.endDate || 'Present'}
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between mb-4">
                      <div className="font-medium text-violet-600 dark:text-violet-400">{edu.institution}</div>
                      {edu.location && <div className="text-muted-foreground">{edu.location}</div>}
                    </div>
                    {edu.description && (
                      <p className="text-muted-foreground whitespace-pre-line">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Gallery Section */}
        {portfolio.content?.gallery?.items?.length > 0 && (
          <section id="gallery" className="py-24 border-b">
            <div className="container px-4 md:px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold">Gallery</h2>
                <p className="text-xl text-muted-foreground max-w-[800px] mx-auto mt-4">
                  Showcase of my work and projects.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolio.content.gallery.items.map((item, index) => (
                  <div key={item.id || index} className="group overflow-hidden rounded-lg border shadow-sm transition-all hover:shadow-md">
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={item.imageUrl || 'https://placehold.co/600x600/6d28d9/fff?text=Gallery'}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-medium">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      )}
                      {item.category && (
                        <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200">
                          {item.category}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Contact Section */}
        {portfolio.content?.contact && (
          <section id="contact" className="py-24">
            <div className="container px-4 md:px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold">Contact Me</h2>
                <p className="text-xl text-muted-foreground max-w-[800px] mx-auto mt-4">
                  Get in touch for collaborations and opportunities.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                <div className="space-y-6">
                  {portfolio.content.contact.email && (
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center text-violet-600 dark:text-violet-300">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect width="20" height="16" x="2" y="4" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <a href={`mailto:${portfolio.content.contact.email}`} className="font-medium hover:text-violet-600">
                          {portfolio.content.contact.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {portfolio.content.contact.phone && (
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center text-violet-600 dark:text-violet-300">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <a href={`tel:${portfolio.content.contact.phone}`} className="font-medium hover:text-violet-600">
                          {portfolio.content.contact.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {portfolio.content.contact.address && (
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center text-violet-600 dark:text-violet-300">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">{portfolio.content.contact.address}</p>
                      </div>
                    </div>
                  )}

                  {/* Social Links */}
                  {portfolio.content.contact.socialLinks?.links?.length > 0 && (
                    <div className="pt-6 mt-6 border-t">
                      <h3 className="text-lg font-medium mb-4">Connect with me</h3>
                      <div className="flex flex-wrap gap-3">
                        {portfolio.content.contact.socialLinks.links.map((link, index) => (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                          >
                            {link.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Contact Form */}
                {portfolio.content.contact.showContactForm && (
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
                    <h3 className="text-xl font-bold mb-4">Send me a message</h3>
                    <form className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="name" className="text-sm font-medium">
                            Name
                          </label>
                          <input
                            id="name"
                            className="w-full px-3 py-2 border rounded-md dark:bg-gray-950 dark:border-gray-800"
                            placeholder="Your name"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="email" className="text-sm font-medium">
                            Email
                          </label>
                          <input
                            id="email"
                            type="email"
                            className="w-full px-3 py-2 border rounded-md dark:bg-gray-950 dark:border-gray-800"
                            placeholder="Your email"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="subject" className="text-sm font-medium">
                          Subject
                        </label>
                        <input
                          id="subject"
                          className="w-full px-3 py-2 border rounded-md dark:bg-gray-950 dark:border-gray-800"
                          placeholder="Message subject"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-medium">
                          Message
                        </label>
                        <textarea
                          id="message"
                          className="w-full min-h-[120px] px-3 py-2 border rounded-md resize-y dark:bg-gray-950 dark:border-gray-800"
                          placeholder="Your message"
                        ></textarea>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                        Send Message
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

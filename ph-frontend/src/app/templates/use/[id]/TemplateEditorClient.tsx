"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import TemplateRenderer from '@/components/template-renderer/TemplateRenderer';
import SidebarEditor from './SidebarEditor';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';
import { FetchProfileButton } from '@/components/ui/fetch-profile-button';
import { Expand, Shrink, Laptop, Tablet, Smartphone, Eye, ArrowLeft, Save, Share } from 'lucide-react';

interface TemplateEditorClientProps {
  template: any;
  user: any;
  id: string;
}

export default function TemplateEditorClient({ template, user, id }: TemplateEditorClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const portfolioIdParam = searchParams.get('portfolioId');

  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [updatedTemplate, setUpdatedTemplate] = useState(template);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // State for UI interactions
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [savedPortfolioId, setSavedPortfolioId] = useState<string | null>(null);

  // State for editor view
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // New state for section ordering
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState(template);

  // Set isClient to true when component mounts and check authentication
  useEffect(() => {
    setIsClient(true);

    // Check authentication status
    const token = apiClient.getToken?.();
    const currentUser = apiClient.getUser?.();

    if (token && currentUser) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      toast.error('You are not logged in. Please log in to save or publish your portfolio.');
    }
  }, []);

  // Initialize portfolio data on mount, only if authenticated
  useEffect(() => {
    if (!isClient) return;

    // Only allow portfolio editing if authenticated
    if (!isAuthenticated) {
      setError("You must be logged in to use the template editor.");
      setLoading(false);
      return;
    }

    try {
      if (!template) {
        setError("Template data is missing");
        setLoading(false);
        return;
      }

      const initializePortfolio = async () => {
        // Check if we have a portfolioId parameter (editing existing portfolio)
        if (portfolioIdParam) {
          try {
            const token = apiClient.getToken?.();

            const response = await apiClient.request<{
              success: boolean;
              portfolio: any;
            }>(`/portfolios/${portfolioIdParam}`, "GET");

            if (response && response.success && response.portfolio) {
              // Get current user subscription information
              const currentUser = apiClient.getUser?.();
              const isPremiumUser =
                currentUser?.subscriptionPlan?.type === 'premium' ||
                currentUser?.subscriptionPlan?.type === 'professional';

              // Update portfolio with current subscription status
              const updatedPortfolio = {
                ...response.portfolio,
                userType: isPremiumUser ? 'premium' : 'free'
              };

              setPortfolio(updatedPortfolio);
              setSavedPortfolioId(response.portfolio._id);

              // Ensure the section order is loaded from the portfolio or set from template
              const portfolioSectionOrder = response.portfolio.sectionOrder || [];
              if (portfolioSectionOrder.length > 0) {
                setSectionOrder(portfolioSectionOrder);
                // Set the first section as active
                setActiveSection(portfolioSectionOrder[0]);
              } else {
                // If portfolio doesn't have section order, set it from template
                const templateSections = template.layouts?.[0]?.structure?.sections ||
                  template.defaultStructure?.layout?.sections || [];
                setSectionOrder(templateSections);
                // Set the first section as active
                setActiveSection(templateSections[0]);
              }

              setLoading(false);
              return;
            } else {
              toast.error('Failed to load your existing portfolio. Creating a new one instead.');
            }
          } catch (err) {
            toast.error('Failed to load your existing portfolio. Creating a new one instead.');
          }
        }

        // If we don't have a portfolioId or failed to fetch it, create a new one
        const generateSubdomain = () => {
          const username =
            user?.username ||
            user?.name?.toLowerCase().replace(/\s+/g, '') ||
            '';
          const timestamp = new Date().getTime().toString().slice(-4);
          return `${username}${timestamp}`;
        };

        // Determine default section order from template
        let defaultSectionOrder: string[] = [];
        if (template.layouts && template.layouts.length > 0) {
          const mainLayout = template.layouts[0];
          defaultSectionOrder = mainLayout?.structure?.sections || [];
        } else if (template.defaultStructure?.layout?.sections) {
          defaultSectionOrder = template.defaultStructure.layout.sections;
        }

        // Prepare initial content based on section definitions
        const initialContent: Record<string, any> = {
          // Default required sections
          header: {
            title: user?.name || 'Your Name',
            subtitle:
              template.category === 'developer'
                ? 'Software Developer'
                : template.category === 'designer'
                ? 'Creative Designer'
                : template.category === 'photographer'
                ? 'Professional Photographer'
                : 'Professional Portfolio',
            profileImage: '',
            navigation: ['About', 'Projects', 'Experience', 'Contact'],
          },
          about: {
            title: 'About Me',
            bio: 'Welcome to my portfolio. Here you can share your professional background, experience, and what makes you unique.',
            variant:
              template.category === 'designer'
                ? 'with-image'
                : template.category === 'developer'
                ? 'with-highlights'
                : 'standard',
            highlights: [
              { title: 'My Expertise', description: 'Describe your main area of expertise.' },
              { title: 'Experience', description: 'Highlight your years of experience or key skills.' },
              { title: 'Education', description: 'Share your educational background.' },
            ],
          },
          seo: {
            title: 'My Portfolio | Professional Website',
            description: 'Welcome to my professional portfolio showcasing my work and experience.',
            keywords: 'portfolio, professional, skills, projects',
          },
          socialLinks: {
            github: '',
            linkedin: '',
            twitter: '',
            instagram: '',
          },
        };

        // Add template-specific section content from section definitions
        if (template.sectionDefinitions) {
          Object.entries(template.sectionDefinitions).forEach(([sectionType, definition]) => {
            // Skip already populated sections
            if (!initialContent[sectionType] && definition.defaultData) {
              initialContent[sectionType] = { ...definition.defaultData };
            }
          });
        }

        // Get current user subscription information
        const currentUser = apiClient.getUser?.();
        const isPremiumUser =
          currentUser?.subscriptionPlan?.type === 'premium' ||
          currentUser?.subscriptionPlan?.type === 'professional';

        // Create initial portfolio data
        const initialPortfolioData = {
          _id: 'new-portfolio',
          title: 'My New Portfolio',
          subtitle: 'Created with Portfolio Hub',
          subdomain: generateSubdomain(),
          templateId: template._id,
          userId: user?.id || 'guest-user',
          content: initialContent,
          activeLayout: template.layouts?.[0]?.id || 'default',
          activeColorScheme: template.themeOptions?.colorSchemes?.[0]?.id || 'default',
          activeFontPairing: template.themeOptions?.fontPairings?.[0]?.id || 'default',
          customColors: null,
          sectionOrder: defaultSectionOrder,
          userType: isPremiumUser ? 'premium' : 'free',
          subdomainLocked: !isPremiumUser
        };

        setPortfolio(initialPortfolioData);
        setSectionOrder(defaultSectionOrder);
        // Set the first section as active if available
        if (defaultSectionOrder.length > 0) {
          setActiveSection(defaultSectionOrder[0]);
        }
        setLoading(false);
      };

      initializePortfolio();
    } catch (err) {
      setError("Failed to initialize template editor.");
      setLoading(false);
    }
  }, [template, user, isAuthenticated, isClient, portfolioIdParam]);

  // Initialize section order when template/portfolio changes
  useEffect(() => {
    if (!isClient || !template || !portfolio) return;

    const activeLayoutId = portfolio.activeLayout || (template.layouts?.[0]?.id || 'default');
    const activeLayout = template.layouts?.find((l: any) => l.id === activeLayoutId) || template.layouts?.[0];

    const layoutSections = activeLayout?.structure?.sections ||
      template.defaultStructure?.layout?.sections || [];

    if (portfolio.sectionOrder && portfolio.sectionOrder.length > 0) {
      setSectionOrder(portfolio.sectionOrder);

      // Set active section if none is selected
      if (!activeSection && portfolio.sectionOrder.length > 0) {
        setActiveSection(portfolio.sectionOrder[0]);
      }
    } else if (layoutSections.length > 0) {
      setSectionOrder(layoutSections);

      // Set active section if none is selected
      if (!activeSection && layoutSections.length > 0) {
        setActiveSection(layoutSections[0]);
      }

      // Also update portfolio with proper section order
      setPortfolio((prev: any) => ({
        ...prev,
        sectionOrder: layoutSections
      }));
    }
  }, [isClient, template, portfolio, activeSection]);

  // Handler for section updates
  const handleSectionUpdate = (sectionId: string, data: any) => {
    if (!portfolio) return;

    setPortfolio((prev: any) => ({
      ...prev,
      content: {
        ...prev.content,
        [sectionId]: data,
      },
    }));

    setIsSaved(false);
  };

  // Handler for theme selection
  const handleThemeSelect = (colorSchemeId: string, fontPairingId: string) => {
    if (!portfolio) return;

    setPortfolio((prev: any) => ({
      ...prev,
      activeColorScheme: colorSchemeId,
      activeFontPairing: fontPairingId,
    }));

    setIsSaved(false);
  };

  // Handler for layout selection
  const handleLayoutSelect = (layoutId: string) => {
    if (!portfolio) return;

    // When layout changes, update section order to match new layout's default
    const newLayout = template.layouts?.find((l: any) => l.id === layoutId);
    const newSectionOrder = newLayout?.structure?.sections || [];

    setPortfolio((prev: any) => ({
      ...prev,
      activeLayout: layoutId,
      sectionOrder: newSectionOrder,
    }));

    setSectionOrder(newSectionOrder);

    // Set active section to first section in new order
    if (newSectionOrder.length > 0) {
      setActiveSection(newSectionOrder[0]);
    }

    setIsSaved(false);
  };

  // Handler for custom CSS updates
  const handleCustomCssUpdate = (css: string) => {
    if (!portfolio) return;

    setPortfolio((prev: any) => ({
      ...prev,
      content: {
        ...prev.content,
        customCss: css,
      },
    }));

    setIsSaved(false);
  };

  // Handler for section reordering
  const handleSectionReorder = (newOrder: string[]) => {
    if (!portfolio) return;

    setPortfolio((prev: any) => ({
      ...prev,
      sectionOrder: newOrder,
    }));

    setSectionOrder(newOrder);
    setIsSaved(false);
  };

  // Handler for adding a section
  const handleAddSection = (sectionId: string) => {
    if (!portfolio || sectionOrder.includes(sectionId)) return;

    const newOrder = [...sectionOrder, sectionId];

    setPortfolio((prev: any) => ({
      ...prev,
      sectionOrder: newOrder,
    }));

    setSectionOrder(newOrder);
    setActiveSection(sectionId);
    setIsSaved(false);
  };

  // Handler for removing a section
  const handleRemoveSection = (sectionId: string) => {
    if (!portfolio) return;

    const newOrder = sectionOrder.filter(id => id !== sectionId);

    setPortfolio((prev: any) => ({
      ...prev,
      sectionOrder: newOrder,
    }));

    setSectionOrder(newOrder);

    // If we're removing the active section, select another one
    if (activeSection === sectionId && newOrder.length > 0) {
      setActiveSection(newOrder[0]);
    }

    setIsSaved(false);
  };

  // Update the handleSaveDraft function to properly prepare portfolio data
  const handleSaveDraft = async () => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to save your portfolio');
      return;
    }

    if (!portfolio) {
      toast.error('No portfolio data to save');
      return;
    }

    setIsSaving(true);
    setIsSaved(false);

    try {
      const currentUser = apiClient.getUser?.();
      const userId = currentUser?._id || user?.id;

      if (!userId) {
        throw new Error('User ID is missing');
      }

      const portfolioToSave = {
        ...portfolio,
        userId: userId,
        templateId: template._id,
        title: portfolio.title || 'My Portfolio',
        subtitle: portfolio.subtitle || '',
        subdomain: portfolio.subdomain || `user-${Date.now().toString().slice(-8)}`,
        isPublished: false,
        sectionOrder: sectionOrder,
      };

      if (process.env.NODE_ENV === 'development') {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      const response = await apiClient.portfolios.saveDraft(portfolioToSave);

      if (response && response.portfolio) {
        setSavedPortfolioId(response.portfolio._id);
        setPortfolio((prev: any) => ({
          ...prev,
          _id: response.portfolio._id,
        }));
        setIsSaved(true);
        toast.success('Portfolio saved as draft!');
      } else {
        throw new Error('Failed to save portfolio');
      }
    } catch (err: any) {
      let errorMessage = 'Failed to save portfolio. Please try again.';

      if (err.message?.includes('already have a portfolio with this template')) {
        errorMessage = 'You already have a portfolio with this template. Please use the Edit button on the templates page to modify your existing portfolio.';
        setTimeout(() => {
          router.push('/templates');
        }, 3000);
      } else if (err.message?.includes('subdomain is already taken')) {
        errorMessage = 'This subdomain is already taken. Please choose a different subdomain in the SEO section.';
      } else if (err.message?.includes('User ID is missing')) {
        errorMessage = 'Your user information could not be found. Please try logging out and logging back in.';
      }

      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Handler for publishing portfolio
  const handlePublish = async () => {
    if (!portfolio) return;
    if (!isAuthenticated) {
      toast.error('You must be logged in to publish your portfolio.');
      return;
    }

    try {
      setIsPublishing(true);

      if (!savedPortfolioId) {
        await handleSaveDraft();
      }

      // Get current user and check for premium subscription
      const currentUser = apiClient.getUser?.();
      const userId = currentUser?._id || user?.id;

      if (!userId) {
        throw new Error('User ID is missing');
      }

      // Check if user has premium subscription with custom domain feature
      const isPremiumUser =
        currentUser?.subscriptionPlan?.type === 'premium' &&
        currentUser?.subscriptionPlan?.isActive === true &&
        currentUser?.subscriptionPlan?.features?.customDomain === true;

      // For free users, ensure subdomain is their username
      let subdomain = portfolio.subdomain;
      if (!isPremiumUser) {
        // Free users must use their username as subdomain
        subdomain = currentUser?.username || `user-${Date.now().toString().slice(-8)}`;
      } else if (!subdomain) {
        // Premium users can customize, but default to username if not set
        subdomain = currentUser?.username || `user-${Date.now().toString().slice(-8)}`;
      }

      const portfolioToPublish = {
        ...portfolio,
        userId: userId,
        templateId: template._id,
        title: portfolio.title || 'My Portfolio',
        subtitle: portfolio.subtitle || '',
        subdomain: subdomain,
        subdomainLocked: !isPremiumUser, // Lock subdomain for free users after publishing
        userType: isPremiumUser ? 'premium' : 'free',
        isPublished: true,
        sectionOrder: sectionOrder,
      };

      if (process.env.NODE_ENV === 'development') {
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }

      const response = await apiClient.portfolios.publish(portfolioToPublish);

      if (response && response.portfolio) {
        setSavedPortfolioId(response.portfolio._id);
        setPortfolio((prev: any) => ({
          ...prev,
          _id: response.portfolio._id,
          isPublished: true,
        }));

        toast.success('Portfolio published successfully!');

        setTimeout(() => {
          router.push(`/portfolio/${response.portfolio.subdomain}`);
        }, 1500);
      } else {
        throw new Error('Failed to publish portfolio');
      }
    } catch (err) {
      toast.error('Failed to publish portfolio. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Handler for previewing the portfolio
  const handlePreview = async () => {
    if (!portfolio) return;
    if (!isAuthenticated) {
      toast.error('You must be logged in to preview your portfolio.');
      return;
    }

    setIsPreviewing(true);

    try {
      if (!savedPortfolioId) {
        await handleSaveDraft();
      }

      if (savedPortfolioId) {
        window.open(`/portfolio/preview/${savedPortfolioId}`, '_blank');
      } else {
        throw new Error('Failed to generate preview');
      }
    } catch (err) {
      toast.error('Failed to generate preview. Please try again.');
    } finally {
      setIsPreviewing(false);
    }
  };

  // Toggle preview mode
  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  // Function to fetch profile data and populate the template
  const fetchProfileData = async () => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to fetch your profile data.');
      return;
    }

    try {
      const response = await apiClient.user.getProfile();

      if (!response || !response.user) {
        throw new Error('Failed to fetch profile data: Invalid API response');
      }

      const profileData = response.user;

      if (!profileData.profile || Object.keys(profileData.profile).length === 0) {
        toast.warning('Your profile is empty. Please add information to your profile first.');
        return;
      }

      let updatedFields: string[] = [];

      setPortfolio(prev => {
        if (!prev) return prev;
        let updatedPortfolio = { ...prev };

        // Update header section
        if (profileData.fullName) {
          updatedPortfolio.content = {
            ...updatedPortfolio.content,
            header: {
              ...updatedPortfolio.content?.header,
              title: profileData.fullName,
            }
          };
          updatedFields.push('name');
        }

        // If user has a profile photo, use it for header and about section
        if (profileData.profile?.profileImage) {
          // Update header
          updatedPortfolio.content = {
            ...updatedPortfolio.content,
            header: {
              ...updatedPortfolio.content?.header,
              profileImage: profileData.profile.profileImage,
            }
          };

          // Also update about section image if the about section has an image field
          if (updatedPortfolio.content?.about) {
            updatedPortfolio.content = {
              ...updatedPortfolio.content,
              about: {
                ...updatedPortfolio.content.about,
                image: profileData.profile.profileImage,
              }
            };
          }

          updatedFields.push('profileImage');
        }

        // Update about section if profile bio exists
        if (profileData.profile?.bio) {
          updatedPortfolio.content = {
            ...updatedPortfolio.content,
            about: {
              ...updatedPortfolio.content?.about,
              bio: profileData.profile.bio,
            }
          };
          updatedFields.push('bio');
        }

        // Update skills section if profile skills exist
        if (profileData.profile?.skills && profileData.profile.skills.length > 0) {
          // Properly map skills data from the profile
          const mappedSkills = profileData.profile.skills.map((skill: any) => ({
            name: skill.name,
            level: skill.level || 80,
            category: skill.category || 'Technical'
          }));

          updatedPortfolio.content = {
            ...updatedPortfolio.content,
            skills: {
              title: updatedPortfolio.content?.skills?.title || 'Skills',
              items: mappedSkills
            }
          };
          updatedFields.push('skills');
        }

        // Update experience section if profile experience exists
        if (profileData.profile?.experience && profileData.profile.experience.length > 0) {
          updatedPortfolio.content = {
            ...updatedPortfolio.content,
            experience: {
              title: updatedPortfolio.content?.experience?.title || 'Experience',
              items: profileData.profile.experience.map((exp: any) => ({
                title: exp.title,
                company: exp.company,
                location: exp.location,
                startDate: exp.startDate,
                endDate: exp.endDate,
                current: exp.current,
                description: exp.description
              }))
            }
          };
          updatedFields.push('experience');
        }

        // Update education section if profile education exists
        if (profileData.profile?.education && profileData.profile.education.length > 0) {
          updatedPortfolio.content = {
            ...updatedPortfolio.content,
            education: {
              title: updatedPortfolio.content?.education?.title || 'Education',
              items: profileData.profile.education.map((edu: any) => ({
                degree: edu.degree,
                institution: edu.institution,
                location: edu.location,
                startDate: edu.startDate,
                endDate: edu.endDate,
                current: edu.current,
                description: edu.description
              }))
            }
          };
          updatedFields.push('education');
        }

        // Update projects section if profile projects exist
        if (profileData.profile?.projects && profileData.profile.projects.length > 0) {
          updatedPortfolio.content = {
            ...updatedPortfolio.content,
            projects: {
              title: updatedPortfolio.content?.projects?.title || 'Projects',
              items: profileData.profile.projects.map((project: any) => ({
                title: project.title,
                description: project.description,
                image: project.image,
                link: project.link,
                tags: project.tags
              }))
            }
          };
          updatedFields.push('projects');
        }

        // Update social links if profile social links exist
        if (profileData.profile?.socialLinks) {
          updatedPortfolio.content = {
            ...updatedPortfolio.content,
            socialLinks: profileData.profile.socialLinks
          };
          updatedFields.push('socialLinks');
        }

        // Update subtitle with user's title if available
        if (profileData.profile?.title) {
          updatedPortfolio.content = {
            ...updatedPortfolio.content,
            header: {
              ...updatedPortfolio.content?.header,
              subtitle: profileData.profile.title
            }
          };
          updatedFields.push('title');
        }

        // Set proper subdomain based on subscription plan
        const username = profileData.username || profileData.fullName?.toLowerCase().replace(/\s+/g, '') || '';

        // Check subscription plan - default to 'free' if not specified
        const isPremiumUser =
          profileData.subscriptionPlan?.type === 'premium' &&
          profileData.subscriptionPlan?.isActive === true &&
          profileData.subscriptionPlan?.features?.customDomain === true;

        // Store user type for UI display
        updatedPortfolio.userType = isPremiumUser ? 'premium' : 'free';

        // For free users, use username as subdomain (locked)
        if (!isPremiumUser) {
          updatedPortfolio.subdomain = username;
          updatedPortfolio.subdomainLocked = true;
          updatedFields.push('subdomain');
        }
        // For premium users, set default as username but allow editing
        else if (isPremiumUser && !updatedPortfolio.customSubdomain) {
          // Default to username but don't lock it
          updatedPortfolio.subdomain = username;
          updatedPortfolio.subdomainLocked = false;
          updatedFields.push('subdomain');
        }
        // If subscription plan not specified, use default behavior
        else if (!updatedPortfolio.subdomain) {
          updatedPortfolio.subdomain = username || `user-${Date.now().toString().slice(-8)}`;
          updatedPortfolio.subdomainLocked = !isPremiumUser; // Lock it for free users
          updatedFields.push('subdomain');
        }

        setIsSaved(false);

        return updatedPortfolio;
      });

      if (updatedFields.length > 0) {
        toast.success(
          `Profile data imported successfully! Updated: ${updatedFields.join(', ')}.`
        );
      } else {
        toast.warning(
          'No new profile data was imported. Your profile may be missing key information.'
        );
      }
    } catch (error: any) {
      if (
        error?.message &&
        error.message.includes('Failed to fetch profile data: Invalid API response')
      ) {
        toast.error('Failed to fetch profile data from the server. Please try again later.');
      } else if (
        error?.response &&
        error.response.status === 401
      ) {
        toast.error('You are not authorized. Please log in again.');
      } else {
        toast.error(
          error?.message
            ? `Failed to fetch profile data: ${error.message}`
            : 'Failed to fetch profile data. Please try again.'
        );
      }
    }
  };

  // Get all available sections from template
  const getAllAvailableSections = () => {
    const sections = new Set<string>();

    if (template?.sectionDefinitions) {
      Object.keys(template.sectionDefinitions).forEach(section => sections.add(section));
    }

    template?.layouts?.forEach((layout: any) => {
      if (layout.structure?.sections) {
        layout.structure.sections.forEach((section: string) => sections.add(section));
      }
    });

    return Array.from(sections);
  };

  if (!isClient) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading template editor...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
          <p className="text-muted-foreground">Loading template editor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => router.push('/templates')}>
          Back to Templates
        </Button>
      </div>
    );
  }

  if (!portfolio) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Top navigation bar */}
      <div className="border-b bg-card shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/templates" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-1 inline" />
              Back to Templates
            </Link>
            <h1 className="text-xl font-bold hidden md:block">{updatedTemplate.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <FetchProfileButton
                onFetch={fetchProfileData}
                variant="outline"
                size="sm"
                fetchText="Auto-fill"
                fetchingText="Fetching..."
                className="hidden md:flex"
              />
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreview}
              className="flex items-center gap-1"
              disabled={isPreviewing}
            >
              <Eye className="h-4 w-4" />
              <span className="hidden md:inline">{isPreviewing ? "Opening Preview..." : "Open Preview"}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              className="flex items-center gap-1"
              disabled={isSaving}
            >
              <Save className="h-4 w-4" />
              <span className="hidden md:inline">{isSaving ? "Saving..." : isSaved ? "Saved" : "Save"}</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handlePublish}
              className="flex items-center gap-1"
              disabled={isPublishing}
            >
              <Share className="h-4 w-4" />
              <span className="hidden md:inline">{isPublishing ? "Publishing..." : "Publish"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content area with sidebar and editor content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with sections */}
        <SidebarEditor
          template={template}
          portfolio={portfolio}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          sectionOrder={sectionOrder}
          onSectionReorder={handleSectionReorder}
          onAddSection={handleAddSection}
          onRemoveSection={handleRemoveSection}
          onUpdateSection={handleSectionUpdate}
          onUpdateTheme={handleThemeSelect}
          onUpdateLayout={handleLayoutSelect}
          onUpdateCustomCss={handleCustomCssUpdate}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
          onPreview={handlePreview}
          onFetchProfile={isAuthenticated ? fetchProfileData : undefined}
          draftSaving={isSaving}
          draftSaved={isSaved}
          previewLoading={isPreviewing}
          publishLoading={isPublishing}
          showPreview={showPreview}
        />

        {/* Preview area */}
        {showPreview && (
          <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto p-4">
              <TemplateRenderer
                template={template}
                portfolio={portfolio}
                sectionOrder={sectionOrder}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, notFound, useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/providers/AuthContext";
import AboutEditor from "./AboutEditor";
import HeaderEditor from "./HeaderEditor";
import ProjectsEditor from "./ProjectsEditor";
import SkillsEditor from "./SkillsEditor";
import ExperienceEditor from "./ExperienceEditor";
import EducationEditor from "./EducationEditor";
import GalleryEditor from "./GalleryEditor";
import ContactEditor from "./ContactEditor";
import SEOEditor from "./SEOEditor";
import CustomCSSEditor from "./CustomCSSEditor";
import apiClient, { Template } from "@/lib/apiClient";
import { templates as fallbackTemplates } from "@/data/templates"; // Use as fallback
import { SaveDraftButton } from "@/components/ui/save-draft-button";
import { PreviewButton } from "@/components/ui/preview-button";
import { PublishButton } from "@/components/ui/publish-button";
import { FetchProfileButton } from "@/components/ui/fetch-profile-button";

// Define the portfolio structure
interface PortfolioSettings {
  colors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    text?: string;
  };
  fonts?: {
    heading?: string;
    body?: string;
  };
  layout?: {
    sections?: string[];
    showHeader?: boolean;
    showFooter?: boolean;
  };
}

// Section content interfaces
interface HeaderContent {
  title?: string;
  subtitle?: string;
  showNavigation?: boolean;
  navItems?: { label: string; link: string }[];
  style?: "default" | "centered" | "minimal";
  logoUrl?: string;
}

interface AboutContent {
  title?: string;
  bio?: string;
  profileImage?: string;
}

interface ProjectItem {
  id?: string;
  title: string;
  description: string;
  imageUrl?: string;
  projectUrl?: string;
  githubUrl?: string;
  tags: string[];
}

interface ProjectsContent {
  items: ProjectItem[];
}

interface SkillItem {
  name: string;
  proficiency: number;
}

interface SkillCategory {
  name: string;
  skills: SkillItem[];
}

interface SkillsContent {
  categories: SkillCategory[];
}

interface ExperienceItem {
  id?: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

interface ExperienceContent {
  items: ExperienceItem[];
}

interface EducationItem {
  id?: string;
  degree: string;
  institution: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

interface EducationContent {
  items: EducationItem[];
}

interface ContactContent {
  email?: string;
  phone?: string;
  address?: string;
  showContactForm?: boolean;
  socialLinks?: { links: Array<{ label: string; url: string }> };
}

interface GalleryItem {
  id?: string;
  title: string;
  description?: string;
  imageUrl: string;
  category?: string;
}

interface GalleryContent {
  items: GalleryItem[];
}

interface SectionContent {
  header?: HeaderContent;
  about?: AboutContent;
  projects?: ProjectsContent;
  skills?: SkillsContent;
  experience?: ExperienceContent;
  education?: EducationContent;
  contact?: ContactContent;
  gallery?: GalleryContent;
  customCSS?: { styles: string };
  seo?: { metaTitle: string; metaDescription: string; keywords: string };
  [key: string]: any;
}

interface Portfolio {
  id?: string;
  templateId: string;
  title: string;
  subtitle?: string;
  customDomain?: string;
  subdomain: string;
  isPublished: boolean;
  settings: PortfolioSettings;
  sectionContent: SectionContent;
}

// Enhance the fallbackTemplates with sections information to avoid undefined access
export interface Template {
  _id: string;
  name: string;
  description: string;
  category: string;
  previewImage: string;
  defaultStructure: Record<string, any>;
  isPublished: boolean;
  sections?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export default function TemplateUseEditor() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Get the template ID from the URL
  const templateId = typeof params.id === "string" ? params.id : "";

  // State for search params (query string)
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);

  // Template and portfolio state
  const [template, setTemplate] = useState<Template | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [portfolioId, setPortfolioId] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [publishLoading, setPublishLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("about");

  // Helper function to generate a unique subdomain
  const generateUniqueSubdomain = (baseSubdomain: string, templateName?: string): string => {
    let subdomain = baseSubdomain;

    // If username is available, use it as base for subdomain
    if (user?.username) {
      // Try to make the subdomain unique by adding a template identifier or random string
      const templateNameSlug = templateName
        ? templateName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-")
        : "";

      // Create a unique subdomain using template name or random string
      if (templateNameSlug) {
        subdomain = `${user.username}-${templateNameSlug}`;
      } else {
        // Use random characters if template name isn't available
        const randomStr = Math.random().toString(36).substring(2, 7);
        subdomain = `${user.username}-${randomStr}`;
      }
    } else {
      // If no username, append random string to whatever subdomain we have
      const randomStr = Math.random().toString(36).substring(2, 7);
      subdomain = `${subdomain || 'user'}-${randomStr}`;
    }

    return subdomain;
  };

  // Generate a completely random subdomain as fallback
  const generateRandomSubdomain = (): string => {
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `${user?.username || 'user'}-${randomStr}`;
  };

  // Load search params on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setSearchParams(new URLSearchParams(window.location.search));
    }
  }, []);

  // If we have a portfolioId in the query string, use it
  useEffect(() => {
    if (searchParams) {
      const portfolioParam = searchParams.get("portfolioId");
      if (portfolioParam) {
        setPortfolioId(portfolioParam);
      }
    }
  }, [searchParams]);

  // Load template data
  useEffect(() => {
    const fetchTemplate = async () => {
      if (!templateId) {
        toast.error("Template ID is required");
        router.push("/templates");
        return;
      }
      try {
        setLoading(true);
        const response = await apiClient.request<{ success: boolean; template: Template }>(
          `/templates/${templateId}`,
          "GET"
        );

        if (response.success && response.template) {
          const t = response.template;
          // Ensure the template has sections property
          if (!t.sections) {
            t.sections = [
              "header",
              "about",
              "projects",
              "skills",
              "experience",
              "education",
              "contact",
            ];
          }
          setTemplate(t);
        } else {
          // Use fallback templates if API fails
          const fallbackTemplate =
            fallbackTemplates.find((t) => t._id === templateId) ||
            fallbackTemplates.find((t) => t.id === templateId);
          if (fallbackTemplate) {
            setTemplate({
              _id: fallbackTemplate._id || fallbackTemplate.id,
              name: fallbackTemplate.name,
              description: fallbackTemplate.description,
              category: fallbackTemplate.category,
              previewImage: fallbackTemplate.previewImage,
              defaultStructure: fallbackTemplate.settings || {},
              sections: fallbackTemplate.sections || [
                "header",
                "about",
                "projects",
                "skills",
                "experience",
                "education",
                "contact",
              ],
              isPublished: true,
            });
          } else {
            toast.error("Template not found");
            router.push("/templates");
          }
        }
      } catch (error) {
        // Try fallback templates
        const fallbackTemplate =
          fallbackTemplates.find((t) => t._id === templateId) ||
          fallbackTemplates.find((t) => t.id === templateId);
        if (fallbackTemplate) {
          setTemplate({
            _id: fallbackTemplate._id || fallbackTemplate.id,
            name: fallbackTemplate.name,
            description: fallbackTemplate.description,
            category: fallbackTemplate.category,
            previewImage: fallbackTemplate.previewImage,
            defaultStructure: fallbackTemplate.settings || {},
            sections: fallbackTemplate.sections || [
              "header",
              "about",
              "projects",
              "skills",
              "experience",
              "education",
              "contact",
            ],
            isPublished: true,
          });
        } else {
          toast.error("Template not found");
          router.push("/templates");
        }
      } finally {
        setLoading(false);
      }
    };

    if (templateId) {
      fetchTemplate();
    }
    // eslint-disable-next-line
  }, [templateId]);

  // Load portfolio data by ID if we have it, or look for portfolio by template ID
  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!user || !templateId || !template) return;

      try {
        setLoading(true);

        // If we have a portfolioId (from query param), fetch that specific portfolio
        if (portfolioId) {
          const response = await apiClient.request<{ success: boolean; portfolio: any }>(
            `/portfolios/${portfolioId}`,
            "GET"
          );

          if (response.success && response.portfolio) {
            setPortfolio(convertApiPortfolio(response.portfolio, template));
            return;
          }
        }

        // If no portfolioId or portfolio not found, check if user has a portfolio with this template
        const portfoliosResponse = await apiClient.request<{ success: boolean; portfolios: any[] }>(
          "/portfolios",
          "GET"
        );

        if (portfoliosResponse.success && portfoliosResponse.portfolios) {
          // Find portfolio with this template
          const existingPortfolio = portfoliosResponse.portfolios.find(
            (p: any) =>
              p.templateId &&
              (typeof p.templateId === "string"
                ? p.templateId === templateId
                : p.templateId._id === templateId)
          );

          if (existingPortfolio) {
            setPortfolioId(existingPortfolio._id);
            setPortfolio(convertApiPortfolio(existingPortfolio, template));
            return;
          }
        }

        // Create a new portfolio with template defaults
        setPortfolio(initializePortfolio(template));
      } catch (error) {
        setPortfolio(initializePortfolio(template));
      } finally {
        setLoading(false);
      }
    };

    if (user && !isLoading && templateId && template) {
      fetchPortfolio();
    }
    // eslint-disable-next-line
  }, [user, isLoading, templateId, template, portfolioId]);

  // Helper: Convert API portfolio to local Portfolio type
  function convertApiPortfolio(apiPortfolio: any, template: Template): Portfolio {
    // Defensive: If already a Portfolio type, just return
    if (apiPortfolio.sectionContent && apiPortfolio.settings) {
      return apiPortfolio;
    }
    // The content may be in apiPortfolio.content
    const content = apiPortfolio.content || {};
    return {
      id: apiPortfolio._id,
      templateId: typeof apiPortfolio.templateId === "object" ? apiPortfolio.templateId._id : apiPortfolio.templateId,
      title: apiPortfolio.title || "My Portfolio",
      subtitle: apiPortfolio.subtitle || "",
      subdomain: apiPortfolio.subdomain || "",
      isPublished: apiPortfolio.isPublished || false,
      settings: content.settings || {
        colors: {
          primary: "#6366f1",
          secondary: "#8b5cf6",
          background: "#ffffff",
          text: "#111827",
        },
        fonts: {
          heading: "Inter",
          body: "Inter",
        },
        layout: {
          sections: template.sections || [
            "header",
            "about",
            "projects",
            "skills",
            "experience",
            "education",
            "contact",
          ],
          showHeader: true,
          showFooter: true,
        },
      },
      sectionContent: {
        header: content.header || {
          title: "",
          subtitle: "",
          showNavigation: true,
          navItems: [
            { label: "Home", link: "#home" },
            { label: "About", link: "#about" },
            { label: "Projects", link: "#projects" },
            { label: "Contact", link: "#contact" },
          ],
          style: "default",
          logoUrl: "",
        },
        about: content.about || {
          title: "About Me",
          bio: "",
          profileImage: "",
        },
        projects: content.projects || { items: [] },
        skills: content.skills || {
          categories: [
            {
              name: "Frontend",
              skills: [
                { name: "React", proficiency: 90 },
                { name: "JavaScript", proficiency: 85 },
                { name: "CSS", proficiency: 80 },
              ],
            },
          ],
        },
        experience: content.experience || { items: [] },
        education: content.education || { items: [] },
        contact: content.contact || {
          email: "",
          phone: "",
          address: "",
          showContactForm: true,
          socialLinks: { links: [] },
        },
        gallery: content.gallery || { items: [] },
        customCSS: content.customCSS || { styles: "" },
        seo: content.seo || { metaTitle: "", metaDescription: "", keywords: "" },
      },
    };
  }

  // Helper: Initialize a new portfolio from template
  function initializePortfolio(templateData: Template): Portfolio {
    const sections =
      templateData.defaultStructure?.layout?.sections ||
      templateData.sections || [
        "header",
        "about",
        "projects",
        "skills",
        "experience",
        "education",
        "contact",
      ];

    const defaultColors =
      templateData.defaultStructure?.layout?.defaultColors ||
      ["#6366f1", "#8b5cf6", "#ffffff", "#111827"];

    const defaultFonts =
      templateData.defaultStructure?.layout?.defaultFonts ||
      ["Inter", "Roboto"];

    return {
      templateId: templateData._id,
      title: "My Portfolio",
      subtitle: user?.profile?.title || "Web Developer",
      subdomain: user?.username || "",
      isPublished: false,
      settings: {
        colors: {
          primary: defaultColors[0] || "#6366f1",
          secondary: defaultColors[1] || "#8b5cf6",
          background: defaultColors[2] || "#ffffff",
          text: defaultColors[3] || "#111827",
        },
        fonts: {
          heading: defaultFonts[0] || "Inter",
          body: defaultFonts[1] || "Inter",
        },
        layout: {
          sections: sections,
          showHeader: true,
          showFooter: true,
        },
      },
      sectionContent: {
        header: {
          title: "",
          subtitle: "",
          showNavigation: true,
          navItems: [
            { label: "Home", link: "#home" },
            { label: "About", link: "#about" },
            { label: "Projects", link: "#projects" },
            { label: "Contact", link: "#contact" },
          ],
          style: "default",
          logoUrl: "",
        },
        about: {
          title: "About Me",
          bio:
            user?.profile?.bio ||
            "I am a passionate professional with experience in my field.",
          profileImage: user?.profilePicture || "",
        },
        projects: {
          items: [],
        },
        skills: {
          categories: [
            {
              name: "Frontend",
              skills: [
                { name: "React", proficiency: 90 },
                { name: "JavaScript", proficiency: 85 },
                { name: "CSS", proficiency: 80 },
              ],
            },
          ],
        },
        experience: {
          items: [],
        },
        education: {
          items: [],
        },
        contact: {
          email: user?.email || "",
          phone: "",
          address: user?.profile?.location || "",
          showContactForm: true,
          socialLinks: { links: [] },
        },
        gallery: {
          items: [],
        },
        customCSS: { styles: "" },
        seo: { metaTitle: "", metaDescription: "", keywords: "" },
      },
    };
  }

  // Check if user is authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error("You need to be logged in to create a portfolio");
      router.push("/auth/signin?callbackUrl=/templates");
    }
  }, [isAuthenticated, isLoading, router]);

  // Handle text input changes
  const handleInputChange = (field: string, value: string) => {
    if (!portfolio) return;
    setPortfolio((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  // Handle nested settings changes
  const handleSettingsChange = (
    category: "colors" | "fonts" | "layout",
    field: string,
    value: string | boolean | string[]
  ) => {
    if (!portfolio) return;

    setPortfolio((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        settings: {
          ...prev.settings,
          [category]: {
            ...prev.settings[category],
            [field]: value,
          },
        },
      };
    });
  };

  // Handle section content changes
  const handleSectionContentChange = (section: string, content: any) => {
    if (!portfolio) return;

    setPortfolio((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sectionContent: {
          ...prev.sectionContent,
          [section]: content,
        },
      };
    });

    // If portfolio already exists, update section content immediately
    if (portfolioId) {
      updateSectionContent(section, content);
    }
  };

  // Update a specific section content
  const updateSectionContent = async (section: string, content: any) => {
    if (!portfolioId || !user) return;

    try {
      // Deep clone the content to avoid reference issues with nested arrays
      const safeContent = JSON.parse(JSON.stringify(content));

      // Create a proper content update structure that matches what the backend expects
      const contentUpdate = {
        content: {
          [section]: safeContent,
        },
      };

      // Make direct API request to update only this section
      const response = await apiClient.request(
        `/portfolios/${portfolioId}`,
        "PUT",
        contentUpdate
      );

      if (response.success) {
      } else {
        console.error(`Failed to update ${section} section:`, response);
        toast.error(`Failed to update ${section} section`);
      }
    } catch (error) {
      console.error(`Error updating ${section} section:`, error);
      toast.error("Failed to update section content");
    }
  };

  // Handle file upload for profile image
  const handleProfileImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !portfolio) return;

    try {
      setLoading(true);
      const imageData = await apiClient.uploadImage(file, "profile");

      const updatedAboutContent = {
        ...portfolio.sectionContent.about,
        profileImage: imageData.url,
      };

      handleSectionContentChange("about", updatedAboutContent);
      toast.success("Profile image uploaded");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  // Save portfolio as draft - updated to use the helper function
  const saveAsDraft = async (): Promise<void> => {
    if (!isAuthenticated || !user || !portfolio) {
      toast.error("Please sign in to save your portfolio");
      return;
    }

    try {
      // Track template usage - use the new method which handles errors
      if (!portfolioId && template?._id) {
        await apiClient.incrementTemplateUsage(template._id);
      }

      // Prepare content data structure to ensure all sections are saved
      // Deep clone to avoid reference issues with nested arrays
      const contentData = JSON.parse(
        JSON.stringify({
          // Include settings
          settings: portfolio.settings,
          // Include all section content
          ...portfolio.sectionContent,
        })
      );

      let savedPortfolio;

      if (portfolioId) {
        // Update existing portfolio with proper structure
        savedPortfolio = await apiClient.request(
          `/portfolios/${portfolioId}`,
          "PUT",
          {
            title: portfolio.title,
            subtitle: portfolio.subtitle,
            subdomain: portfolio.subdomain,
            isPublished: false,
            content: contentData,
          }
        );

        // Update local portfolioId in case it's changed
        if (
          savedPortfolio &&
          savedPortfolio.portfolio &&
          savedPortfolio.portfolio._id
        ) {
          setPortfolioId(savedPortfolio.portfolio._id);
        }

        toast.success("Portfolio draft updated successfully");
      } else {
        // Create new portfolio with proper structure
        try {
          // Generate a unique subdomain for this new template
          const subdomain = generateUniqueSubdomain(portfolio.subdomain, template?.name);

          savedPortfolio = await apiClient.createPortfolio({
            title: portfolio.title,
            subtitle: portfolio.subtitle,
            subdomain: subdomain,
            templateId: portfolio.templateId,
            content: contentData,
          });

          if (savedPortfolio && savedPortfolio._id) {
            setPortfolioId(savedPortfolio._id);

            // Update the local portfolio state with the new subdomain
            setPortfolio(prev => {
              if (!prev) return prev;
              return {
                ...prev,
                subdomain: savedPortfolio.subdomain || subdomain
              };
            });

            toast.success("Portfolio draft created successfully");
          }
        } catch (portfolioError: any) {
          const errorMessage = portfolioError.message || "Failed to create portfolio";
          toast.error(errorMessage);

          if (errorMessage.includes("subdomain is already taken")) {
            toast.error("Please choose a different subdomain and try again");
          } else if (errorMessage.includes("Cannot change a portfolio's template")) {
            toast.error("Creating a new portfolio with a unique subdomain...");

            // Try again with a completely random subdomain
            try {
              const uniqueSubdomain = generateRandomSubdomain();

              savedPortfolio = await apiClient.createPortfolio({
                title: portfolio.title,
                subtitle: portfolio.subtitle,
                subdomain: uniqueSubdomain,
                templateId: portfolio.templateId,
                content: contentData,
              });

              if (savedPortfolio && savedPortfolio._id) {
                setPortfolioId(savedPortfolio._id);

                // Update the local portfolio state with the new subdomain
                setPortfolio(prev => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    subdomain: savedPortfolio.subdomain || uniqueSubdomain
                  };
                });

                toast.success("Portfolio created with a unique subdomain");
                return Promise.resolve();
              }
            } catch (retryError) {
              console.error("Error in retry attempt:", retryError);
              toast.error("Still unable to create portfolio. Please try again later.");
            }
          }

          throw portfolioError;
        }
      }

      return Promise.resolve();
    } catch (error) {
      console.error("Error saving portfolio:", error);
      toast.error("Failed to save portfolio draft. Please try again.");
      throw new Error("Failed to save portfolio");
    }
  };

  // Publish portfolio - updated to use the helper function
  const publishPortfolio = async (): Promise<void> => {
    if (!isAuthenticated || !user || !portfolio) {
      toast.error("Please sign in to publish your portfolio");
      throw new Error("Authentication required");
    }

    // Validate subdomain
    if (!portfolio.subdomain) {
      toast.error("Subdomain is required");
      throw new Error("Subdomain is required");
    }

    try {
      // Track template usage if this is a new portfolio - use the new method
      if (!portfolioId && template?._id) {
        await apiClient.incrementTemplateUsage(template._id);
      }

      // Prepare content data structure to ensure all sections are saved
      // Deep clone to avoid reference issues with nested arrays
      const contentData = JSON.parse(
        JSON.stringify({
          // Include settings
          settings: portfolio.settings,
          // Include all section content
          ...portfolio.sectionContent,
        })
      );

      let savedPortfolio;

      if (portfolioId) {
        // Update existing portfolio with proper structure
        savedPortfolio = await apiClient.request(
          `/portfolios/${portfolioId}`,
          "PUT",
          {
            title: portfolio.title,
            subtitle: portfolio.subtitle,
            subdomain: portfolio.subdomain,
            isPublished: true,
            content: contentData,
          }
        );

        toast.success("Portfolio published successfully");
      } else {
        // Create new portfolio with proper structure
        try {
          // Generate a unique subdomain for this new template
          const subdomain = generateUniqueSubdomain(portfolio.subdomain, template?.name);

          savedPortfolio = await apiClient.createPortfolio({
            title: portfolio.title,
            subtitle: portfolio.subtitle,
            subdomain: subdomain,
            templateId: portfolio.templateId,
            content: contentData,
            isPublished: true,
          });

          if (savedPortfolio && savedPortfolio._id) {
            setPortfolioId(savedPortfolio._id);

            // Update the local portfolio state with the new subdomain
            setPortfolio(prev => {
              if (!prev) return prev;
              return {
                ...prev,
                subdomain: savedPortfolio.subdomain || subdomain
              };
            });

            toast.success("Portfolio created and published successfully");
          }
        } catch (portfolioError: any) {
          const errorMessage = portfolioError.message || "Failed to create portfolio";
          toast.error(errorMessage);

          if (errorMessage.includes("subdomain is already taken")) {
            toast.error("Please choose a different subdomain and try again");
          } else if (errorMessage.includes("Cannot change a portfolio's template")) {
            toast.error("Creating a new portfolio with a unique subdomain...");

            // Try again with a completely random subdomain
            try {
              const uniqueSubdomain = generateRandomSubdomain();

              savedPortfolio = await apiClient.createPortfolio({
                title: portfolio.title,
                subtitle: portfolio.subtitle,
                subdomain: uniqueSubdomain,
                templateId: portfolio.templateId,
                content: contentData,
                isPublished: true,
              });

              if (savedPortfolio && savedPortfolio._id) {
                setPortfolioId(savedPortfolio._id);

                // Update the local portfolio state with the new subdomain
                setPortfolio(prev => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    subdomain: savedPortfolio.subdomain || uniqueSubdomain
                  };
                });

                toast.success("Portfolio created and published with a unique subdomain");
                return Promise.resolve();
              }
            } catch (retryError) {
              console.error("Error in retry attempt:", retryError);
              toast.error("Still unable to create portfolio. Please try again later.");
            }
          }

          throw portfolioError;
        }
      }

      return Promise.resolve();
    } catch (error: any) {
      // Check if the error is related to custom domains and show a toast
      if (error.message && error.message.includes("Custom domains are only available in paid plans")) {
        toast.error("Custom domains are only available in paid plans, which are not currently available. Your portfolio will be published with the default subdomain.");
      } else {
        console.error("Error publishing portfolio:", error);
        toast.error("Failed to publish portfolio. Please try again.");
      }
      throw new Error("Failed to publish portfolio");
    }
  };

  // Save and publish portfolio - updated to handle custom domain errors
  const saveAndPublish = async (): Promise<void> => {
    try {
      // Save as draft first
      await saveAsDraft();

      // Now attempt to publish
      if (!portfolio || !portfolioId) {
        toast.error("Portfolio must be saved before publishing");
        return;
      }

      setLoading(true);
      const response = await apiClient.request(
        `/portfolios/${portfolioId}`,
        "PUT",
        {
          isPublished: true,
        }
      );

      if (response.success) {
        toast.success("Portfolio published successfully!");

        // Update portfolio state
        setPortfolio((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            isPublished: true,
          };
        });
      } else {
        toast.error(
          response.message || "Failed to publish portfolio"
        );
      }
    } catch (error: any) {
      // Check if the error is related to custom domains
      if (error.message && error.message.includes("Custom domains are only available in paid plans")) {
        toast.error("Custom domains are only available in paid plans, which are not currently available. Your portfolio will be published with the default subdomain.");
      } else {
        toast.error(error.message || "Failed to publish portfolio");
      }
    } finally {
      setLoading(false);
    }
  };

  // Preview the portfolio - updated to work with PreviewButton
  const previewPortfolio = async (): Promise<string | null> => {
    if (!portfolio?.subdomain) {
      toast.error("Please set a subdomain for your portfolio");
      return null;
    }

    // If it's not saved yet, we need to save it first
    if (!portfolioId) {
      try {
        await saveAsDraft();
      } catch (error) {
        console.error("Error saving portfolio for preview:", error);
        toast.error("Failed to save portfolio before preview");
        return null;
      }
    }

    // Return the preview URL using the portfolio ID instead of subdomain
    return `/portfolio/preview/${portfolioId}`;
  };

  // Debug useEffect to log portfolio state on change
  useEffect(() => {
    if (portfolio) {
      console.log("Portfolio state updated:", {
        id: portfolio.id || "New Portfolio",
        title: portfolio.title,
        templateId: portfolio.templateId,
        sectionCount: Object.keys(portfolio.sectionContent).length,
        sections: Object.keys(portfolio.sectionContent),
      });
    }
  }, [portfolio]);

  // Debug useEffect to log template state on change
  useEffect(() => {
    if (template) {
      console.log("Template state updated:", {
        id: template._id,
        name: template.name,
        sections: template.sections,
      });
    }
  }, [template]);

  if (loading || !template || !portfolio) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-muted-foreground">
              Loading template data...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      <main className="flex-grow py-8">
        <div className="container px-4 md:px-6">
          {/* Header */}
          <div className="mb-8 border-b pb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Customize Your Portfolio</h1>
                <p className="text-muted-foreground">
                  You're using the{" "}
                  <span className="font-medium text-violet-600">
                    {template?.name}
                  </span>{" "}
                  template. Customize it to make it your own.
                </p>
              </div>
              <div className="flex gap-3">
                <SaveDraftButton onSave={saveAsDraft} variant="outline" />
                <PreviewButton
                  onPreview={previewPortfolio}
                  variant="outline"
                  fullscreen={true}
                />
                <PublishButton
                  onPublish={publishPortfolio}
                  requireValidation={true}
                  validationChecks={[
                    {
                      condition: Boolean(portfolio?.subdomain),
                      message:
                        "Subdomain is required to publish your portfolio",
                    },
                    {
                      condition: Boolean(portfolio?.title),
                      message: "Portfolio title is required",
                    },
                  ]}
                  successRedirectUrl={
                    portfolio ? `/portfolio/${portfolio.subdomain}` : undefined
                  }
                />
              </div>
            </div>

            {/* Template Usage Policy Banner */}
            <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md flex items-center">
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
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4"/>
                <path d="M12 8h.01"/>
              </svg>
              <span>
                <strong>Note:</strong> You can create multiple portfolios using the same template with different content and styling. Only one portfolio can be published at a time. Publishing a new portfolio will automatically unpublish any previously published portfolio.
              </span>
            </div>

            {/* Progress indication */}
            {portfolioId ? (
              <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md flex items-center">
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
                  className="h-5 w-5 mr-2 text-green-500"
                >
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                <span>
                  Your portfolio is saved as a draft. Continue customizing or
                  publish when ready.
                </span>
              </div>
            ) : (
              <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md flex items-center">
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
                  className="h-5 w-5 mr-2 text-blue-500"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="m12 8 4 4-4 4" />
                  <path d="m8 12h8" />
                </svg>
                <span>
                  Complete the sections below and click "Save as Draft" to save
                  your progress.
                </span>
              </div>
            )}
          </div>

          {/* Main Editor */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8 shadow-md">
                <CardHeader>
                  <CardTitle>Portfolio Settings</CardTitle>
                  <CardDescription>
                    Configure your portfolio settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="title" className="text-sm font-medium">
                        Portfolio Title
                      </label>
                      <Input
                        id="title"
                        placeholder="My Portfolio"
                        value={portfolio.title}
                        onChange={(e) =>
                          handleInputChange("title", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="subtitle" className="text-sm font-medium">
                        Subtitle
                      </label>
                      <Input
                        id="subtitle"
                        placeholder="Full Stack Developer"
                        value={portfolio.subtitle || ""}
                        onChange={(e) =>
                          handleInputChange("subtitle", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="subdomain"
                        className="text-sm font-medium"
                      >
                        Subdomain
                      </label>
                      <div className="relative">
                        <Input
                          id="subdomain"
                          placeholder="johndoe"
                          value={portfolio.subdomain}
                          onChange={(e) =>
                            handleInputChange(
                              "subdomain",
                              e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9-]/g, "")
                            )
                          }
                          className={
                            !portfolio.subdomain
                              ? "border-orange-300 focus:ring-orange-500"
                              : ""
                          }
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-sm text-muted-foreground">
                          .portfoliohub.com
                        </div>
                      </div>
                      {!portfolio.subdomain && (
                        <p className="text-xs text-orange-500 mt-1">
                          A subdomain is required to publish your portfolio
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 border-t pt-4">
                      <span className="text-sm font-medium">Fetch Profile Data</span>
                      <FetchProfileButton
                        onFetch={(profileData) => {
                          if (!portfolio) return;

                          // Create a deep copy of the current portfolio to avoid reference issues
                          const updatedPortfolio = JSON.parse(JSON.stringify(portfolio));

                          // Update sections with profile data
                          if (profileData.about) {
                            updatedPortfolio.sectionContent.about = profileData.about;
                          }

                          if (profileData.skills) {
                            updatedPortfolio.sectionContent.skills = profileData.skills;
                          }

                          if (profileData.experience) {
                            updatedPortfolio.sectionContent.experience = profileData.experience;
                          }

                          if (profileData.education) {
                            updatedPortfolio.sectionContent.education = profileData.education;
                          }

                          if (profileData.projects) {
                            updatedPortfolio.sectionContent.projects = profileData.projects;
                          }

                          setPortfolio(updatedPortfolio);

                          // If portfolio already exists, update content for each section
                          if (portfolioId) {
                            Object.keys(profileData).forEach(section => {
                              if (profileData[section]) {
                                updateSectionContent(section, profileData[section]);
                              }
                            });
                          }

                          toast.success("Profile data imported successfully to your template.");
                        }}
                        section="all"
                        variant="default"
                        disabled={loading}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Import all your profile data at once to quickly populate your portfolio.
                      </p>
                    </div>

                    <div className="space-y-2 pt-4 border-t">
                      <span className="text-sm font-medium">Colors</span>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="primaryColor" className="text-xs">
                            Primary
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              id="primaryColor"
                              value={
                                portfolio.settings.colors?.primary || "#6366f1"
                              }
                              onChange={(e) =>
                                handleSettingsChange(
                                  "colors",
                                  "primary",
                                  e.target.value
                                )
                              }
                              className="w-8 h-8 rounded cursor-pointer"
                            />
                            <Input
                              value={
                                portfolio.settings.colors?.primary || "#6366f1"
                              }
                              onChange={(e) =>
                                handleSettingsChange(
                                  "colors",
                                  "primary",
                                  e.target.value
                                )
                              }
                              className="h-8 font-mono text-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="secondaryColor" className="text-xs">
                            Secondary
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              id="secondaryColor"
                              value={
                                portfolio.settings.colors?.secondary ||
                                "#8b5cf6"
                              }
                              onChange={(e) =>
                                handleSettingsChange(
                                  "colors",
                                  "secondary",
                                  e.target.value
                                )
                              }
                              className="w-8 h-8 rounded cursor-pointer"
                            />
                            <Input
                              value={
                                portfolio.settings.colors?.secondary ||
                                "#8b5cf6"
                              }
                              onChange={(e) =>
                                handleSettingsChange(
                                  "colors",
                                  "secondary",
                                  e.target.value
                                )
                              }
                              className="h-8 font-mono text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t">
                      <span className="text-sm font-medium">
                        Template Sections
                      </span>
                      <div className="grid grid-cols-1 gap-2">
                        {template.sections &&
                          template.sections.map((section) => (
                            <div
                              key={section}
                              className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                                template.defaultStructure?.config?.requiredSections?.includes(
                                  section
                                )
                                  ? "bg-violet-50 border border-violet-100"
                                  : "bg-muted/50"
                              }`}
                            >
                              <div>
                                <span className="capitalize">{section}</span>
                                {template.defaultStructure?.config?.requiredSections?.includes(
                                  section
                                ) && (
                                  <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-violet-100 text-violet-800">
                                    Required
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id={`section-${section}`}
                                  checked={
                                    portfolio.settings.layout?.sections?.includes(
                                      section
                                    ) || false
                                  }
                                  onCheckedChange={(checked) => {
                                    // Don't allow unchecking required sections
                                    if (
                                      !checked &&
                                      template.defaultStructure?.config?.requiredSections?.includes(
                                        section
                                      )
                                    ) {
                                      toast.error(
                                        `The ${section} section is required for this template`
                                      );
                                      return;
                                    }

                                    const currentSections =
                                      portfolio.settings.layout?.sections || [];
                                    const newSections = checked
                                      ? [...currentSections, section]
                                      : currentSections.filter(
                                          (s) => s !== section
                                        );

                                    handleSettingsChange(
                                      "layout",
                                      "sections",
                                      newSections
                                    );

                                    // If newly enabled, set that section as active
                                    if (checked) {
                                      setActiveTab(section);
                                    }
                                  }}
                                  disabled={template.defaultStructure?.config?.requiredSections?.includes(
                                    section
                                  )}
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Editor Area */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Content Editor</CardTitle>
                  <CardDescription>
                    Edit your portfolio content section by section
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs
                    defaultValue="about"
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="space-y-4"
                  >
                    <TabsList className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7">
                      {portfolio.settings.layout?.sections?.map((section) => (
                        <TabsTrigger
                          key={section}
                          value={section}
                          className="capitalize"
                        >
                          {section}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {/* About Section */}
                    <TabsContent value="about" className="space-y-4">
                      <AboutEditor
                        content={
                          portfolio.sectionContent.about || {
                            title: "About Me",
                            bio: "",
                            profileImage: "",
                          }
                        }
                        onSave={(content) =>
                          handleSectionContentChange("about", content)
                        }
                        isLoading={loading}
                        onImageUpload={handleProfileImageUpload}
                      />
                    </TabsContent>

                    {/* Header Section */}
                    {portfolio.settings.layout?.sections?.includes(
                      "header"
                    ) && (
                      <TabsContent value="header" className="space-y-4">
                        <HeaderEditor
                          content={
                            portfolio.sectionContent.header || {
                              title: "",
                              subtitle: "",
                              showNavigation: true,
                              navItems: [
                                { label: "Home", link: "#home" },
                                { label: "About", link: "#about" },
                                { label: "Projects", link: "#projects" },
                                { label: "Contact", link: "#contact" },
                              ],
                              style: "default",
                              logoUrl: "",
                            }
                          }
                          onSave={(content) =>
                            handleSectionContentChange("header", content)
                          }
                          isLoading={loading}
                        />
                      </TabsContent>
                    )}

                    {/* Projects Section */}
                    <TabsContent value="projects" className="space-y-4">
                      <ProjectsEditor
                        content={
                          portfolio.sectionContent.projects || { items: [] }
                        }
                        onSave={(content) =>
                          handleSectionContentChange("projects", content)
                        }
                        isLoading={loading}
                      />
                    </TabsContent>

                    {/* Skills Section */}
                    <TabsContent value="skills" className="space-y-4">
                      <SkillsEditor
                        content={
                          portfolio.sectionContent.skills || { categories: [] }
                        }
                        onSave={(content) =>
                          handleSectionContentChange("skills", content)
                        }
                        isLoading={loading}
                      />
                    </TabsContent>

                    {/* Experience Section */}
                    {portfolio.settings.layout?.sections?.includes(
                      "experience"
                    ) && (
                      <TabsContent value="experience" className="space-y-4">
                        <ExperienceEditor
                          content={
                            portfolio.sectionContent.experience || { items: [] }
                          }
                          onSave={(content) =>
                            handleSectionContentChange("experience", content)
                          }
                          isLoading={loading}
                        />
                      </TabsContent>
                    )}

                    {/* Education Section */}
                    {portfolio.settings.layout?.sections?.includes(
                      "education"
                    ) && (
                      <TabsContent value="education" className="space-y-4">
                        <EducationEditor
                          content={
                            portfolio.sectionContent.education || { items: [] }
                          }
                          onSave={(content) =>
                            handleSectionContentChange("education", content)
                          }
                          isLoading={loading}
                        />
                      </TabsContent>
                    )}

                    {/* Gallery Section */}
                    {portfolio.settings.layout?.sections?.includes(
                      "gallery"
                    ) && (
                      <TabsContent value="gallery" className="space-y-4">
                        <GalleryEditor
                          content={
                            portfolio.sectionContent.gallery || { items: [] }
                          }
                          onSave={(content) =>
                            handleSectionContentChange("gallery", content)
                          }
                          isLoading={loading}
                        />
                      </TabsContent>
                    )}

                    {/* Contact Section */}
                    {portfolio.settings.layout?.sections?.includes(
                      "contact"
                    ) && (
                      <TabsContent value="contact" className="space-y-4">
                        <ContactEditor
                          content={portfolio.sectionContent.contact || {}}
                          onSave={(content) =>
                            handleSectionContentChange("contact", content)
                          }
                          isLoading={loading}
                        />
                      </TabsContent>
                    )}

                    {/* Custom CSS Section */}
                    {portfolio.settings.layout?.sections?.includes(
                      "customCSS"
                    ) && (
                      <TabsContent value="customCSS" className="space-y-4">
                        <CustomCSSEditor
                          content={
                            portfolio.sectionContent.customCSS || { styles: "" }
                          }
                          onSave={(content) =>
                            handleSectionContentChange("customCSS", content)
                          }
                          isLoading={loading}
                        />
                      </TabsContent>
                    )}

                    {/* SEO Settings Section */}
                    {portfolio.settings.layout?.sections?.includes("seo") && (
                      <TabsContent value="seo" className="space-y-4">
                        <SEOEditor
                          content={
                            portfolio.sectionContent.seo || {
                              metaTitle: "",
                              metaDescription: "",
                              keywords: "",
                            }
                          }
                          onSave={(content) =>
                            handleSectionContentChange("seo", content)
                          }
                          isLoading={loading}
                        />
                      </TabsContent>
                    )}

                    {/* Other template-specific sections */}
                    {portfolio.settings.layout?.sections
                      ?.filter(
                        (s) =>
                          ![
                            "about",
                            "projects",
                            "skills",
                            "gallery",
                            "contact",
                            "experience",
                            "education",
                            "customCSS",
                            "seo",
                            "header",
                          ].includes(s)
                      )
                      .map((section) => (
                        <TabsContent
                          key={section}
                          value={section}
                          className="h-96 flex items-center justify-center border rounded-md"
                        >
                          <div className="text-center">
                            <h3 className="text-lg font-medium capitalize mb-2">
                              {section} Section
                            </h3>
                            <p className="text-muted-foreground">
                              This section editor is coming soon. Edit your{" "}
                              {section} content here.
                            </p>
                          </div>
                        </TabsContent>
                      ))}
                  </Tabs>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-6">
                  <SaveDraftButton onSave={saveAsDraft} variant="outline" />
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-xs text-muted-foreground max-w-[300px] text-right">
                      <span className="font-semibold">Note:</span> Publishing this portfolio will automatically unpublish any other published portfolio.
                    </div>
                    <PublishButton
                      onPublish={publishPortfolio}
                      requireValidation={true}
                      validationChecks={[
                        {
                          condition: Boolean(portfolio?.subdomain),
                          message:
                            "Subdomain is required to publish your portfolio",
                        },
                        {
                          condition: Boolean(portfolio?.title),
                          message: "Portfolio title is required",
                        },
                      ]}
                      successRedirectUrl={
                        portfolio
                          ? `/portfolio/${portfolio.subdomain}`
                          : undefined
                      }
                    />
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

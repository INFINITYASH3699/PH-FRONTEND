"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
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
import { templates as fallbackTemplates } from "@/data/templates";
import { SaveDraftButton } from "@/components/ui/save-draft-button";
import { PreviewButton } from "@/components/ui/preview-button";
import { PublishButton } from "@/components/ui/publish-button";
import { FetchProfileButton } from "@/components/ui/fetch-profile-button";

// User plan interface
interface UserPlan {
  type: "free" | "premium" | "professional";
  isActive: boolean;
  features: {
    customDomain: boolean;
    analytics: boolean;
    multiplePortfolios: boolean;
    removeWatermark: boolean;
  };
}

// Portfolio structure
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

// Portfolio Settings component
function PortfolioSettings({
  portfolio,
  onUpdate,
  userPlan,
}: {
  portfolio: Portfolio;
  onUpdate: (key: string, value: any) => void;
  userPlan: UserPlan;
}) {
  const isFreePlan = userPlan.type === "free";
  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="portfolio-title">Portfolio Title</Label>
          <Input
            id="portfolio-title"
            value={portfolio.title || ""}
            onChange={(e) => onUpdate("title", e.target.value)}
            placeholder="My Portfolio"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="portfolio-subtitle">Portfolio Subtitle</Label>
          <Input
            id="portfolio-subtitle"
            value={portfolio.subtitle || ""}
            onChange={(e) => onUpdate("subtitle", e.target.value)}
            placeholder="Web Developer & Designer"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="portfolio-subdomain">Portfolio Subdomain</Label>
            {isFreePlan && (
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded dark:bg-amber-900 dark:text-amber-200">
                Free Plan
              </span>
            )}
          </div>
          <Input
            id="portfolio-subdomain"
            value={portfolio.subdomain || ""}
            onChange={(e) => onUpdate("subdomain", e.target.value)}
            placeholder="my-portfolio"
            disabled={isFreePlan}
          />
          {isFreePlan && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Free plan users can only use their username as subdomain. Upgrade to a paid plan to use custom subdomains.
            </p>
          )}
        </div>
        {userPlan.features.customDomain && (
          <div className="space-y-2">
            <Label htmlFor="custom-domain">Custom Domain (Pro feature)</Label>
            <Input
              id="custom-domain"
              value={portfolio.customDomain || ""}
              onChange={(e) => onUpdate("customDomain", e.target.value)}
              placeholder="example.com"
            />
            <p className="text-xs text-muted-foreground">
              Enter your domain name without http:// or www. (e.g., example.com)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Section Tab Component
function SectionTab({
  section,
  activeTab,
  disabled = false,
}: {
  section: string;
  activeTab: string;
  disabled?: boolean;
}) {
  return (
    <TabsTrigger
      value={section}
      onClick={() => setActiveTab(section)}
      className={`rounded-lg px-3 py-2 capitalize ${
        activeTab === section ? "bg-primary text-white" : ""
      }`}
      disabled={disabled}
    >
      {section}
    </TabsTrigger>
  );
}

// Portfolio Settings Tab
function PortfolioSettingsTab({ activeTab, template }: { activeTab: string; template: Template | null }) {
  return (
    <TabsTrigger
      value="settings"
      onClick={() => setActiveTab("settings")}
      className={`rounded-lg px-3 py-2 ${
        activeTab === "settings" ? "bg-primary text-white" : ""
      }`}
    >
      Portfolio Settings
    </TabsTrigger>
  );
}

export default function TemplateUseEditor() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Get the template ID from the URL
  const templateId = typeof params.id === "string" ? params.id : "";

  // State for search params (query string)
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(
    null
  );

  // Template and portfolio state
  const [template, setTemplate] = useState<Template | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [portfolioId, setPortfolioId] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [publishLoading, setPublishLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("about");

  // User plan state
  const [userPlan, setUserPlan] = useState<UserPlan>({
    type: "free",
    isActive: true,
    features: {
      customDomain: false,
      analytics: false,
      multiplePortfolios: false,
      removeWatermark: false,
    },
  });

  // Published portfolio state
  const [publishedPortfolio, setPublishedPortfolio] = useState<Portfolio | null>(null);

  // Fetch user's subscription plan and published portfolio
  useEffect(() => {
    if (isAuthenticated) {
      const fetchUserPlan = async () => {
        try {
          const subscription = await apiClient.getUserSubscriptionPlan();
          setUserPlan(subscription);
        } catch (error) {
          console.error("Error fetching user subscription plan:", error);
        }
      };

      fetchUserPlan();

      // Also fetch user's portfolios to find published one
      const fetchUserPortfolios = async () => {
        try {
          const response = await apiClient.request<{
            success: boolean;
            portfolios: any[];
          }>("/portfolios", "GET");

          if (response.success && response.portfolios) {
            const published = response.portfolios.find(p => p.isPublished);
            if (published) {
              setPublishedPortfolio(published);
            }
          }
        } catch (error) {
          console.error("Error fetching user portfolios:", error);
        }
      };

      fetchUserPortfolios();
    }
  }, [isAuthenticated]);

  // Helper function to generate a unique subdomain
  const generateUniqueSubdomain = async (
    baseSubdomain: string,
    templateName?: string
  ): Promise<string> => {
    let subdomain = baseSubdomain;

    try {
      const subscription = await apiClient.getUserSubscriptionPlan();
      const isFreePlan = subscription.type === "free";

      if (user?.username) {
        if (isFreePlan) {
          // Free plan: use username
          return user.username;
        }
        const templateNameSlug = templateName
          ? templateName
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "-")
              .replace(/-+/g, "-")
          : "";
        if (templateNameSlug) {
          subdomain = `${user.username}-${templateNameSlug}`;
        } else {
          const randomStr = Math.random().toString(36).substring(2, 7);
          subdomain = `${user.username}-${randomStr}`;
        }
      } else {
        const randomStr = Math.random().toString(36).substring(2, 7);
        subdomain = `${subdomain || "user"}-${randomStr}`;
      }
    } catch (error) {
      console.error("Error determining user plan for subdomain generation:", error);

      if (user?.username) {
        subdomain = user.username;
      } else {
        const randomStr = Math.random().toString(36).substring(2, 7);
        subdomain = `${baseSubdomain || "user"}-${randomStr}`;
      }
    }

    return subdomain;
  };

  const generateRandomSubdomain = async (): Promise<string> => {
    try {
      const subscription = await apiClient.getUserSubscriptionPlan();
      const isFreePlan = subscription.type === "free";
      if (isFreePlan && user?.username) {
        return user.username;
      }
      const randomStr = Math.random().toString(36).substring(2, 8);
      return `${user?.username || "user"}-${randomStr}`;
    } catch (error) {
      if (user?.username) {
        return user.username;
      } else {
        const randomStr = Math.random().toString(36).substring(2, 8);
        return `user-${randomStr}`;
      }
    }
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
        const response = await apiClient.request<{
          success: boolean;
          template: Template;
        }>(`/templates/${templateId}`, "GET");

        if (response.success && response.template) {
          const t = response.template;
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
              sections:
                fallbackTemplate.sections || [
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
            sections:
              fallbackTemplate.sections || [
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
  }, [templateId, router]);

  // Load portfolio data by ID if we have it, or look for portfolio by template ID
  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!user || !templateId || !template) return;

      try {
        setLoading(true);

        if (portfolioId) {
          const response = await apiClient.request<{
            success: boolean;
            portfolio: any;
          }>(`/portfolios/${portfolioId}`, "GET");

          if (response.success && response.portfolio) {
            setPortfolio(convertApiPortfolio(response.portfolio, template));
            return;
          }
        }

        const portfoliosResponse = await apiClient.request<{
          success: boolean;
          portfolios: any[];
        }>("/portfolios", "GET");

        if (portfoliosResponse.success && portfoliosResponse.portfolios) {
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
  }, [user, isLoading, templateId, template, portfolioId]);

  function convertApiPortfolio(apiPortfolio: any, template: Template): Portfolio {
    if (apiPortfolio.sectionContent && apiPortfolio.settings) {
      return apiPortfolio;
    }
    const content = apiPortfolio.content || {};
    return {
      id: apiPortfolio._id,
      templateId:
        typeof apiPortfolio.templateId === "object"
          ? apiPortfolio.templateId._id
          : apiPortfolio.templateId,
      title: apiPortfolio.title || "My Portfolio",
      subtitle: apiPortfolio.subtitle || "",
      subdomain: apiPortfolio.subdomain || "",
      customDomain: apiPortfolio.customDomain || "",
      isPublished: apiPortfolio.isPublished || false,
      settings:
        content.settings || {
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
            sections:
              template.sections || [
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
      customDomain: "",
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

  // Handle portfolio settings change
  const handlePortfolioChange = (field: string, value: any) => {
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

    if (portfolioId) {
      updateSectionContent(section, content);
    }
  };

  const updateSectionContent = async (section: string, content: any) => {
    if (!portfolioId || !user) return;

    try {
      const safeContent = JSON.parse(JSON.stringify(content));
      const contentUpdate = {
        content: {
          [section]: safeContent,
        },
      };

      const response = await apiClient.request(
        `/portfolios/${portfolioId}`,
        "PUT",
        contentUpdate
      );

      if (!response.success) {
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

  // Save portfolio as draft
  const saveAsDraft = async (): Promise<void> => {
    if (!isAuthenticated || !user || !portfolio) {
      toast.error("Please sign in to save your portfolio");
      return;
    }

    try {
      if (!portfolioId && template?._id) {
        await apiClient.incrementTemplateUsage(template._id);
      }

      const contentData = JSON.parse(
        JSON.stringify({
          settings: portfolio.settings,
          ...portfolio.sectionContent,
        })
      );

      let savedPortfolio;

      if (portfolioId) {
        savedPortfolio = await apiClient.request(
          `/portfolios/${portfolioId}`,
          "PUT",
          {
            title: portfolio.title,
            subtitle: portfolio.subtitle,
            subdomain: portfolio.subdomain,
            customDomain: portfolio.customDomain,
            isPublished: false,
            content: contentData,
          }
        );

        if (
          savedPortfolio &&
          savedPortfolio.portfolio &&
          savedPortfolio.portfolio._id
        ) {
          setPortfolioId(savedPortfolio.portfolio._id);
        }

        toast.success("Portfolio draft updated successfully");
      } else {
        try {
          const subdomain = await generateUniqueSubdomain(
            portfolio.subdomain,
            template?.name
          );

          savedPortfolio = await apiClient.createPortfolio({
            title: portfolio.title,
            subtitle: portfolio.subtitle,
            subdomain: subdomain,
            customDomain: portfolio.customDomain,
            templateId: portfolio.templateId,
            content: contentData,
          });

          if (savedPortfolio && savedPortfolio._id) {
            setPortfolioId(savedPortfolio._id);

            setPortfolio((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                subdomain: savedPortfolio.subdomain || subdomain,
              };
            });

            toast.success("Portfolio draft created successfully");
          }
        } catch (portfolioError: any) {
          const errorMessage =
            portfolioError.message || "Failed to create portfolio";
          toast.error(errorMessage);

          if (errorMessage.includes("subdomain is already taken")) {
            toast.error("Please choose a different subdomain and try again");
          } else if (
            errorMessage.includes("Cannot change a portfolio's template")
          ) {
            toast.error("Creating a new portfolio with a unique subdomain...");
            try {
              const uniqueSubdomain = await generateRandomSubdomain();

              savedPortfolio = await apiClient.createPortfolio({
                title: portfolio.title,
                subtitle: portfolio.subtitle,
                subdomain: uniqueSubdomain,
                customDomain: portfolio.customDomain,
                templateId: portfolio.templateId,
                content: contentData,
              });

              if (savedPortfolio && savedPortfolio._id) {
                setPortfolioId(savedPortfolio._id);

                setPortfolio((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    subdomain: savedPortfolio.subdomain || uniqueSubdomain,
                  };
                });

                toast.success("Portfolio created with a unique subdomain");
                return Promise.resolve();
              }
            } catch (retryError) {
              console.error("Error in retry attempt:", retryError);
              toast.error(
                "Still unable to create portfolio. Please try again later."
              );
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

  // Publish portfolio
  const publishPortfolio = async (): Promise<void> => {
    if (!isAuthenticated || !user || !portfolio) {
      toast.error("Please sign in to publish your portfolio");
      throw new Error("Authentication required");
    }

    if (!portfolio.subdomain) {
      toast.error("Subdomain is required");
      throw new Error("Subdomain is required");
    }

    try {
      if (!portfolioId && template?._id) {
        await apiClient.incrementTemplateUsage(template._id);
      }

      const contentData = JSON.parse(
        JSON.stringify({
          settings: portfolio.settings,
          ...portfolio.sectionContent,
        })
      );

      let savedPortfolio;

      if (portfolioId) {
        savedPortfolio = await apiClient.request(
          `/portfolios/${portfolioId}`,
          "PUT",
          {
            title: portfolio.title,
            subtitle: portfolio.subtitle,
            subdomain: portfolio.subdomain,
            customDomain: portfolio.customDomain,
            isPublished: true,
            content: contentData,
          }
        );

        if (savedPortfolio.success) {
          toast.success("Portfolio published successfully");
        } else if (savedPortfolio.message && savedPortfolio.message.includes("can only have one published portfolio")) {
          // This case shouldn't happen anymore with our backend updates, but keeping as fallback
          toast.info("Your existing portfolio was unpublished and this portfolio has been published.");
        }
      } else {
        try {
          const subdomain = await generateUniqueSubdomain(
            portfolio.subdomain,
            template?.name
          );

          savedPortfolio = await apiClient.createPortfolio({
            title: portfolio.title,
            subtitle: portfolio.subtitle,
            subdomain: subdomain,
            customDomain: portfolio.customDomain,
            templateId: portfolio.templateId,
            content: contentData,
            isPublished: true,
          });

          if (savedPortfolio && savedPortfolio._id) {
            setPortfolioId(savedPortfolio._id);

            setPortfolio((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                subdomain: savedPortfolio.subdomain || subdomain,
              };
            });

            toast.success("Portfolio created and published successfully");
          }
        } catch (portfolioError: any) {
          const errorMessage =
            portfolioError.message || "Failed to create portfolio";

          // Handle the specific case for free plan users with already published portfolio
          if (errorMessage.includes("can only have one published portfolio")) {
            toast.info("Your existing portfolio was unpublished and this portfolio has been published.");
            return Promise.resolve();
          }

          // Handle other error cases as before
          toast.error(errorMessage);

          if (errorMessage.includes("subdomain is already taken")) {
            toast.error("Please choose a different subdomain and try again");
          } else if (
            errorMessage.includes("Cannot change a portfolio's template")
          ) {
            toast.error("Creating a new portfolio with a unique subdomain...");

            try {
              const uniqueSubdomain = await generateRandomSubdomain();

              savedPortfolio = await apiClient.createPortfolio({
                title: portfolio.title,
                subtitle: portfolio.subtitle,
                subdomain: uniqueSubdomain,
                customDomain: portfolio.customDomain,
                templateId: portfolio.templateId,
                content: contentData,
                isPublished: true,
              });

              if (savedPortfolio && savedPortfolio._id) {
                setPortfolioId(savedPortfolio._id);

                setPortfolio((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    subdomain: savedPortfolio.subdomain || uniqueSubdomain,
                  };
                });

                toast.success(
                  "Portfolio created and published with a unique subdomain"
                );
                return Promise.resolve();
              }
            } catch (retryError) {
              console.error("Error in retry attempt:", retryError);
              toast.error(
                "Still unable to create portfolio. Please try again later."
              );
            }
          }

          throw portfolioError;
        }
      }

      return Promise.resolve();
    } catch (error: any) {
      if (
        error.message &&
        error.message.includes(
          "Custom domains are only available in paid plans"
        )
      ) {
        toast.error(
          "Custom domains are only available in paid plans, which are not currently available. Your portfolio will be published with the default subdomain."
        );
      } else {
        console.error("Error publishing portfolio:", error);
        toast.error("Failed to publish portfolio. Please try again.");
      }
      throw new Error("Failed to publish portfolio");
    }
  };

  // Preview the portfolio
  const previewPortfolio = async (): Promise<string | null> => {
    if (!portfolio?.subdomain) {
      toast.error("Please set a subdomain for your portfolio");
      return null;
    }

    if (!portfolioId) {
      try {
        await saveAsDraft();
      } catch (error) {
        console.error("Error saving portfolio for preview:", error);
        toast.error("Failed to save portfolio before preview");
        return null;
      }
    }

    // Use absolute URL with origin to make sure it works properly
    const origin = window.location.origin; // Get the current origin (protocol + hostname + port)
    return `${origin}/portfolio/preview/${portfolioId}`;
  };

  // Add this function to fetch user profile data
  const fetchProfileData = async (): Promise<void> => {
    if (!isAuthenticated || !user || !portfolio) {
      toast.error("Please sign in to fetch your profile data");
      return;
    }

    try {
      // Create an updated portfolio with data from the user profile
      const updatedPortfolio = { ...portfolio };

      // Update about section
      if (user.profile?.bio || user.profilePicture) {
        updatedPortfolio.sectionContent.about = {
          ...updatedPortfolio.sectionContent.about,
          bio: user.profile?.bio || updatedPortfolio.sectionContent.about?.bio || "",
          profileImage: user.profilePicture || updatedPortfolio.sectionContent.about?.profileImage || ""
        };

        // Handle section content update for about
        handleSectionContentChange("about", updatedPortfolio.sectionContent.about);
      }

      // Update skills section
      if (user.profile?.skills && user.profile.skills.length > 0) {
        updatedPortfolio.sectionContent.skills = {
          categories: [...user.profile.skills]
        };

        // Handle section content update for skills
        handleSectionContentChange("skills", updatedPortfolio.sectionContent.skills);
      }

      // Update experience section
      if (user.profile?.experience && user.profile.experience.length > 0) {
        updatedPortfolio.sectionContent.experience = {
          items: [...user.profile.experience]
        };

        // Handle section content update for experience
        handleSectionContentChange("experience", updatedPortfolio.sectionContent.experience);
      }

      // Update education section
      if (user.profile?.education && user.profile.education.length > 0) {
        updatedPortfolio.sectionContent.education = {
          items: [...user.profile.education]
        };

        // Handle section content update for education
        handleSectionContentChange("education", updatedPortfolio.sectionContent.education);
      }

      // Update projects section
      if (user.profile?.projects && user.profile.projects.length > 0) {
        updatedPortfolio.sectionContent.projects = {
          items: [...user.profile.projects]
        };

        // Handle section content update for projects
        handleSectionContentChange("projects", updatedPortfolio.sectionContent.projects);
      }

      // Update contact section
      if (user.email || user.profile?.location) {
        updatedPortfolio.sectionContent.contact = {
          ...updatedPortfolio.sectionContent.contact,
          email: user.email || updatedPortfolio.sectionContent.contact?.email || "",
          address: user.profile?.location || updatedPortfolio.sectionContent.contact?.address || ""
        };

        // Update social links if available
        if (user.profile?.socialLinks) {
          const socialLinksArray = Object.entries(user.profile.socialLinks)
            .filter(([_, url]) => url && url.trim() !== '')
            .map(([label, url]) => ({ label, url }));

          if (socialLinksArray.length > 0) {
            updatedPortfolio.sectionContent.contact.socialLinks = {
              links: socialLinksArray
            };
          }
        }

        // Handle section content update for contact
        handleSectionContentChange("contact", updatedPortfolio.sectionContent.contact);
      }

      // Update the title with user's name if available
      if (user.fullName && (!portfolio.title || portfolio.title === "My Portfolio")) {
        handlePortfolioChange("title", `${user.fullName}'s Portfolio`);
      }

      // Update subtitle with user's title if available
      if (user.profile?.title && (!portfolio.subtitle || portfolio.subtitle === "")) {
        handlePortfolioChange("subtitle", user.profile.title);
      }

    } catch (error) {
      console.error("Error updating portfolio with profile data:", error);
      throw new Error("Failed to update portfolio with profile data");
    }
  };

  useEffect(() => {
    if (portfolio) {
      //console.log("Portfolio state updated:", portfolio);
    }
  }, [portfolio]);

  useEffect(() => {
    if (template) {
      //console.log("Template state updated:", template);
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
                <FetchProfileButton
                  onFetch={fetchProfileData}
                  variant="outline"
                />
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
                  isPremiumUser={userPlan.type !== "free"}
                  publishedPortfolioTitle={publishedPortfolio?.title}
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
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <span>
                <strong>Note:</strong> You can create multiple portfolios using the same template with different content and styling. <strong>Only one portfolio can be published at a time.</strong> If you publish a new portfolio, any previously published portfolio will be automatically unpublished.
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-9">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4 flex flex-wrap">
                  <PortfolioSettingsTab
                    activeTab={activeTab}
                    template={template}
                  />
                  {template?.sections?.map((section) => (
                    <SectionTab
                      key={section}
                      section={section}
                      activeTab={activeTab}
                      disabled={!portfolio?.settings?.layout?.sections?.includes(section)}
                    />
                  ))}
                </TabsList>

                <div className="rounded-lg border bg-card p-6">
                  <TabsContent value="settings">
                    <PortfolioSettings
                      portfolio={portfolio}
                      onUpdate={handlePortfolioChange}
                      userPlan={userPlan}
                    />
                  </TabsContent>

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
                </div>
              </Tabs>
            </div>
            {/* Sidebar */}
            <div className="lg:col-span-3">
              <PortfolioSettings
                portfolio={portfolio}
                onUpdate={handlePortfolioChange}
                userPlan={userPlan}
              />
              {/* Additional settings (colors, sections, fetch profile, etc.) can be added here as needed */}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

import { Metadata } from "next";
import TemplateEditorClient from "./TemplateEditorClient";
import VariationExplorer from "./VariationExplorer";
import { notFound } from "next/navigation";
import apiClient from "@/lib/apiClient";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

// Server-side function to fetch template by ID
async function getTemplate(id: string) {
  try {
    const response = await apiClient.serverRequest<{
      success: boolean;
      template: any;
    }>(`/templates/${id}`, "GET", undefined, undefined);

    if (response.success && response.template) {
      return response.template;
    }

    return null;
  } catch (error) {
    console.error("Error fetching template:", error);
    return null;
  }
}

// Enhanced server-side user fetching with auth token from cookies
async function getServerUserWithAuth() {
  try {
    // Get the auth token from cookies
    const cookieStore = cookies();
    const authToken = cookieStore.get("ph_auth_token")?.value;

    if (!authToken) {
      console.log("No auth token found in cookies");
      return null;
    }

    // Call the API with the auth token
    const headers = {
      Authorization: `Bearer ${authToken}`,
    };

    const response = await apiClient.serverRequest<{
      success: boolean;
      user: any;
    }>("/auth/me", "GET", undefined, headers);

    if (response.success && response.user) {
      console.log(
        "Successfully fetched authenticated user:",
        response.user._id
      );
      return response.user;
    }

    return null;
  } catch (error) {
    console.error("Error fetching authenticated user:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const template = await getTemplate(params.id);

  if (!template) {
    return {
      title: "Template Not Found",
    };
  }

  return {
    title: `Customize "${template.name}" Template | Portfolio Hub`,
    description: `Customize the ${template.name} template to create your professional portfolio.`,
  };
}

export default async function TemplateEditorPage({
  params,
}: {
  params: { id: string };
}) {
  // Fetch template data
  const template = await getTemplate(params.id);

  if (!template) {
    notFound();
  }

  // Get current user with authentication (server-side)
  const authenticatedUser = await getServerUserWithAuth();

  // Fallback to development mock user if needed
  const user = authenticatedUser || (await apiClient.getServerUser());

  console.log(
    "Server-side auth status:",
    user ? "Authenticated" : "Not authenticated"
  );

  // Enhanced data for template rendering with more robust defaults
  const enhancedTemplate = {
    ...template,
    _id: template._id || params.id,
    name: template.name || "Untitled Template",
    category: template.category || "developer",
    // Ensure all required structures exist
    defaultStructure: template.defaultStructure || {
      layout: {
        sections: ["header", "about", "projects", "skills", "experience", "education", "contact"],
        defaultColors: ["#6366f1", "#8b5cf6", "#ffffff", "#111827"],
        defaultFonts: ["Inter", "Roboto", "Montserrat"]
      },
      config: {
        requiredSections: ["header", "about"],
        optionalSections: ["projects", "skills", "experience", "education", "contact"]
      }
    },
    // Ensure layouts exist
    layouts: template.layouts?.length ? template.layouts : [
      {
        id: "default",
        name: "Standard Layout",
        structure: {
          sections: ["header", "about", "projects", "skills", "experience", "education", "contact"],
          gridSystem: "12-column",
          spacing: { base: 8, multiplier: 1.5 }
        }
      }
    ],
    // Ensure theme options exist
    themeOptions: template.themeOptions || {
      colorSchemes: [
        {
          id: "default",
          name: "Default",
          colors: {
            primary: "#6366f1",
            secondary: "#8b5cf6",
            background: "#ffffff",
            text: "#111827"
          }
        }
      ],
      fontPairings: [
        {
          id: "default",
          name: "Default",
          fonts: {
            heading: "Inter",
            body: "Roboto"
          }
        }
      ],
      spacing: {
        standard: {
          base: 8,
          multiplier: 1.5
        }
      }
    },
    // Default empty objects if missing
    sectionDefinitions: template.sectionDefinitions || {},
    sectionVariants: template.sectionVariants || {},
    stylePresets: template.stylePresets || {
      modern: {
        name: "Modern",
        description: "Clean, modern style with rounded corners and subtle shadows",
        styles: {
          borderRadius: "0.5rem",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
          fontWeight: "normal"
        }
      }
    },
    animations: template.animations || {
      fadeIn: {
        id: "fadeIn",
        name: "Fade In",
        type: "fade",
        duration: 800,
        easing: "ease-in-out"
      }
    },
    componentMapping: template.componentMapping || {
      react: {
        header: "@/components/template-sections/HeaderSection",
        about: "@/components/template-sections/AboutSection",
        projects: "@/components/template-sections/ProjectsSection",
        skills: "@/components/template-sections/SkillsSection",
        experience: "@/components/template-sections/ExperienceSection",
        education: "@/components/template-sections/EducationSection",
        contact: "@/components/template-sections/ContactSection"
      }
    }
  };

  // Here we'd also fetch any existing portfolio that uses this template

  return (
    <>
      <TemplateEditorClient
        template={enhancedTemplate}
        user={user}
        id={params.id}
      />
      <VariationExplorer templateId={params.id} />
    </>
  );
}

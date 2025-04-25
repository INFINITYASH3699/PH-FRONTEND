import { Metadata } from 'next';
import TemplateEditorClient from './TemplateEditorClient';
import VariationExplorer from './VariationExplorer';
import { notFound } from 'next/navigation';
import apiClient from '@/lib/apiClient';

export const dynamic = 'force-dynamic';

// Server-side function to fetch template by ID
async function getTemplate(id: string) {
  try {
    const response = await apiClient.serverRequest<{
      success: boolean;
      template: any;
    }>(`/templates/${id}`, 'GET', undefined, undefined);

    if (response.success && response.template) {
      return response.template;
    }

    return null;
  } catch (error) {
    console.error('Error fetching template:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const template = await getTemplate(params.id);

  if (!template) {
    return {
      title: 'Template Not Found',
    };
  }

  return {
    title: `Customize "${template.name}" Template | Portfolio Hub`,
    description: `Customize the ${template.name} template to create your professional portfolio.`,
  };
}

export default async function TemplateEditorPage({ params }: { params: { id: string } }) {
  // Fetch template data
  const template = await getTemplate(params.id);

  if (!template) {
    notFound();
  }

  // Get current user (server-side)
  const user = await apiClient.getServerUser();

  // Enhanced data for template rendering
  const enhancedTemplate = {
    ...template,
    _id: template._id || params.id,
    // Default values if missing
    sectionVariants: template.sectionVariants || {},
    stylePresets: template.stylePresets || {},
    animations: template.animations || {},
  };

  // Here we'd also fetch any existing portfolio that uses this template

  return (
    <>
      <TemplateEditorClient template={enhancedTemplate} user={user} id={params.id} />
      <VariationExplorer templateId={params.id} />
    </>
  );
}

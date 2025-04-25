// This is a server component that wraps the client component
import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import TemplateEditorClient from './TemplateEditorClient';

// Loading fallback component
function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div
          className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
          role="status"
        >
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
        <p className="mt-4">Loading template editor...</p>
      </div>
    </div>
  );
}

// Dummy template data for fallback when API fails
const FALLBACK_TEMPLATE = {
  _id: 'fallback-template',
  name: 'Template Preview',
  category: 'developer',
  layouts: [
    {
      id: 'default',
      name: 'Standard Layout',
      structure: {
        sections: ['header', 'about', 'projects', 'skills', 'experience', 'contact'],
        gridSystem: '12-column',
      },
    },
  ],
  themeOptions: {
    colorSchemes: [
      {
        id: 'default',
        name: 'Default',
        colors: {
          primary: '#6366f1',
          background: '#ffffff',
          text: '#111827',
          muted: '#f3f4f6',
          accent: '#8b5cf6',
        },
      },
      {
        id: 'dark',
        name: 'Dark',
        colors: {
          primary: '#8b5cf6',
          background: '#0f172a',
          text: '#f8fafc',
          muted: '#1e293b',
          accent: '#ec4899',
        },
      },
    ],
    fontPairings: [
      {
        id: 'default',
        name: 'Default',
        fonts: {
          heading: 'Inter',
          body: 'Inter',
        },
      },
    ],
  },
};

// Function to get user data
const getCurrentUser = async () => {
  // This would be replaced with actual auth logic in a real app
  return {
    id: 'user123',
    name: 'Demo User',
    portfolios: [],
  };
};

// Server component that fetches the data and passes it to the client component
export default async function TemplateEditorPage({ params }: { params: { id: string } }) {
  if (!params.id) {
    return notFound();
  }

  let template = FALLBACK_TEMPLATE;
  const user = await getCurrentUser();

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const response = await fetch(`${apiUrl}/templates/${params.id}`, {
      cache: 'no-store',
      next: { revalidate: 60 },
    }).catch((error) => {
      console.error('Network error when fetching template:', error);
      return null;
    });

    if (response && response.ok) {
      const data = await response.json();
      if (data && data.template) {
        template = data.template;
      }
    }
  } catch (error) {
    console.error('Error fetching template:', error);
    // We'll use the fallback template
  }

  return (
    <Suspense fallback={<Loading />}>
      <TemplateEditorClient template={template} user={user} id={params.id} />
    </Suspense>
  );
}

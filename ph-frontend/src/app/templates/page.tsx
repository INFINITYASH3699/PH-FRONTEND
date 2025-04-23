import TemplatesClient from './TemplatesClient';

// Server-side function to fetch templates
async function fetchTemplates(category?: string) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  let endpoint = '/templates';
  const queryParams = [];

  if (category && category !== 'all') {
    queryParams.push(`category=${category}`);
  }

  if (queryParams.length > 0) {
    endpoint += `?${queryParams.join('&')}`;
  }

  try {
    console.log(`Server fetching templates from ${API_BASE_URL}${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      cache: 'no-store', // Disable caching for fresh data
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.templates || [];
  } catch (error) {
    console.error('Server-side template fetch error:', error);
    return [];
  }
}

export default async function TemplatesPage({ searchParams }: { searchParams?: { category?: string } }) {
  // Get category from search params
  const category = searchParams?.category || 'all';

  // Fetch templates from API
  const templates = await fetchTemplates(category);

  return <TemplatesClient initialTemplates={templates} currentCategory={category} />;
}

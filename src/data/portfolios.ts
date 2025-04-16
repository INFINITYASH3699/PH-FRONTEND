// Static portfolio data for development
export const portfolios = [
  {
    _id: 'portfolio-1',
    userId: 'user-1',
    templateId: 'developer-1',
    title: 'My Developer Portfolio',
    subtitle: 'Full Stack Developer',
    subdomain: 'johndoe',
    customDomain: '',
    isPublished: true,
    settings: {
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        background: '#ffffff',
        text: '#111827',
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter',
      },
      layout: {
        sections: ['header', 'about', 'projects', 'skills', 'experience', 'contact'],
        showHeader: true,
        showFooter: true,
      },
    },
    createdAt: '2023-06-15T00:00:00.000Z',
    updatedAt: '2023-06-20T00:00:00.000Z',
  },
  {
    _id: 'portfolio-2',
    userId: 'user-1',
    templateId: 'photographer-1',
    title: 'Photography Portfolio',
    subtitle: 'Landscape & Portrait Photography',
    subdomain: 'johnphotos',
    customDomain: '',
    isPublished: false,
    settings: {
      colors: {
        primary: '#000000',
        secondary: '#666666',
        background: '#ffffff',
        text: '#111827',
      },
      fonts: {
        heading: 'Playfair Display',
        body: 'Raleway',
      },
      layout: {
        sections: ['header', 'about', 'galleries', 'services', 'contact'],
        showHeader: true,
        showFooter: true,
      },
    },
    createdAt: '2023-07-10T00:00:00.000Z',
    updatedAt: '2023-07-15T00:00:00.000Z',
  },
];

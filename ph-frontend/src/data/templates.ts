// Static template data for development
export const templates = [
  {
    _id: 'developer-1',
    name: 'Modern Developer',
    description: 'A clean and modern template for developers and programmers.',
    previewImage: 'https://repository-images.githubusercontent.com/616351992/41fb4d77-8bcc-4f2f-a5af-56c0e41e07c4',
    isPremium: false,
    category: 'developer',
    tags: ['developer', 'programmer', 'coding', 'portfolio'],
    settings: {
      layout: {
        sections: ['header', 'about', 'projects', 'skills', 'experience', 'education', 'contact', 'blog'],
        defaultColors: ['#6366f1', '#8b5cf6', '#ffffff', '#111827'],
        defaultFonts: ['Inter', 'Roboto', 'Montserrat'],
      },
      config: {
        requiredSections: ['header', 'about'],
        optionalSections: ['projects', 'skills', 'experience', 'education', 'contact', 'blog'],
      },
    },
  },
  {
    _id: 'designer-1',
    name: 'Creative Studio',
    description: 'Perfect for graphic designers, illustrators and creative professionals.',
    previewImage: 'https://weandthecolor.com/wp-content/uploads/2020/09/A-modern-and-fresh-portfolio-template-for-Adobe-InDesign.jpg',
    isPremium: false,
    category: 'designer',
    tags: ['designer', 'creative', 'portfolio', 'graphic'],
    settings: {
      layout: {
        sections: ['header', 'about', 'gallery', 'work', 'clients', 'testimonials', 'contact'],
        defaultColors: ['#6366f1', '#8b5cf6', '#ffffff', '#111827'],
        defaultFonts: ['Poppins', 'Montserrat', 'Raleway'],
      },
      config: {
        requiredSections: ['header', 'about'],
        optionalSections: ['gallery', 'work', 'clients', 'testimonials', 'contact'],
      },
    },
  },
  {
    _id: 'photographer-1',
    name: 'Photo Gallery',
    description: 'A stunning template for photographers to display their work.',
    previewImage: 'https://marketplace.canva.com/EAFwckKNjDE/2/0/1600w/canva-black-white-grayscale-portfolio-presentation-vzScEqAI__M.jpg',
    isPremium: false,
    category: 'photographer',
    tags: ['photographer', 'portfolio', 'gallery', 'photos'],
    settings: {
      layout: {
        sections: ['header', 'about', 'galleries', 'categories', 'services', 'pricing', 'contact'],
        defaultColors: ['#000000', '#ffffff', '#f3f4f6', '#111827'],
        defaultFonts: ['Playfair Display', 'Raleway', 'Open Sans'],
      },
      config: {
        requiredSections: ['header', 'about'],
        optionalSections: ['galleries', 'categories', 'services', 'pricing', 'contact'],
      },
    },
  },
  {
    _id: 'developer-2',
    name: 'Code Craft',
    description: 'Showcase your coding projects with this sleek template.',
    previewImage: 'https://marketplace.canva.com/EAGGr0aHXDg/2/0/1600w/canva-pink-bold-modern-creative-portfolio-presentation-te1AiwXONs0.jpg',
    isPremium: true,
    category: 'developer',
    tags: ['developer', 'programmer', 'code', 'portfolio'],
    settings: {
      layout: {
        sections: ['header', 'about', 'projects', 'technologies', 'experience', 'education', 'testimonials', 'contact'],
        defaultColors: ['#0f172a', '#334155', '#cbd5e1', '#f8fafc'],
        defaultFonts: ['JetBrains Mono', 'Inter', 'Source Code Pro'],
      },
      config: {
        requiredSections: ['header', 'about'],
        optionalSections: ['projects', 'technologies', 'experience', 'education', 'testimonials', 'contact'],
      },
    },
  },
  {
    _id: 'designer-2',
    name: 'Design Lab',
    description: 'Showcase your design projects with beautiful layouts.',
    previewImage: 'https://www.unsell.design/wp-content/uploads/2021/07/bd5b5164-cover-flat-lay.jpg',
    isPremium: true,
    category: 'designer',
    tags: ['designer', 'design', 'portfolio', 'creative'],
    settings: {
      layout: {
        sections: ['header', 'about', 'portfolio', 'process', 'skills', 'clients', 'contact'],
        defaultColors: ['#ec4899', '#f43f5e', '#ffffff', '#0f172a'],
        defaultFonts: ['Playfair Display', 'Montserrat', 'Work Sans'],
      },
      config: {
        requiredSections: ['header', 'about'],
        optionalSections: ['portfolio', 'process', 'skills', 'clients', 'contact'],
      },
    },
  },
];

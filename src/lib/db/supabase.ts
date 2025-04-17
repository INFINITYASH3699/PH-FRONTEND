import { createClient } from '@supabase/supabase-js';

// These will be replaced with actual environment variables in a real deployment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if we're using placeholder credentials
const isDevelopmentMode = process.env.NODE_ENV === 'development';
const hasValidSupabaseConfig = supabaseUrl && supabaseAnonKey &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseAnonKey.includes('placeholder');

// Create a supabase client or a mock if in development with missing credentials
export const supabase = hasValidSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient();

function createMockClient() {
  console.warn('Using mock Supabase client. Storage operations will be mocked.');

  return {
    storage: {
      from: (bucket: string) => ({
        upload: async (path: string, file: any) => {
          console.log(`DEV MODE: Mock uploading file to ${bucket}/${path}`);
          return {
            data: { path: `${bucket}/${path}` },
            error: null
          };
        },
        getPublicUrl: (path: string) => ({
          data: { publicUrl: `https://via.placeholder.com/300?text=${encodeURIComponent(path)}` }
        }),
        remove: async (paths: string[]) => {
          console.log(`DEV MODE: Mock removing files: ${paths.join(', ')}`);
          return { data: { message: 'Files removed' }, error: null };
        }
      })
    },
    // Add other mocked methods as needed
  } as any;
}

// Type definitions for our database tables
export type User = {
  id: string;
  email: string;
  username: string;
  full_name: string;
  profile_picture?: string;
  title?: string;
  bio?: string;
  location?: string;
  created_at: string;
  updated_at: string;
};

export type PortfolioSettings = {
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
};

export type Portfolio = {
  id: string;
  user_id: string;
  template_id: string;
  title: string;
  subtitle?: string;
  custom_domain?: string;
  subdomain: string;
  is_published: boolean;
  settings: PortfolioSettings;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  portfolio_id: string;
  title: string;
  description: string;
  image_url?: string;
  project_url?: string;
  github_url?: string;
  tags: string[];
  order: number;
  created_at: string;
  updated_at: string;
};

export type Skill = {
  id: string;
  portfolio_id: string;
  name: string;
  category?: string;
  proficiency: number;
  order: number;
  created_at: string;
  updated_at: string;
};

export type Experience = {
  id: string;
  portfolio_id: string;
  type: 'education' | 'work';
  title: string;
  organization: string;
  location?: string;
  start_date: string;
  end_date?: string;
  current: boolean;
  description?: string;
  order: number;
  created_at: string;
  updated_at: string;
};

export type TemplateSettings = {
  layout?: {
    sections?: string[];
    defaultColors?: string[];
    defaultFonts?: string[];
  };
  config?: {
    requiredSections?: string[];
    optionalSections?: string[];
  };
};

export type Template = {
  id: string;
  name: string;
  description: string;
  preview_image: string;
  is_premium: boolean;
  settings: TemplateSettings;
  created_at: string;
  updated_at: string;
};

import React from 'react';
import Link from 'next/link';
import { ChevronUp, Instagram, Twitter, Github, Linkedin, Facebook, Youtube, Mail, Globe } from 'lucide-react';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon?: string;
}

interface FooterLink {
  id: string;
  label: string;
  url: string;
}

interface FooterColumn {
  id: string;
  title: string;
  links: FooterLink[];
}

interface FooterSectionProps {
  data: {
    showFooter?: boolean;
    darkMode?: boolean;
    copyright?: string;
    logo?: {
      src?: string;
      alt?: string;
      text?: string;
    };
    description?: string;
    columns?: FooterColumn[];
    socialLinks?: SocialLink[];
    showScrollToTop?: boolean;
    showCredit?: boolean;
    creditText?: string;
    layout?: 'simple' | 'columns' | 'centered';
  };
  editable?: boolean;
  onUpdate?: (data: any) => void;
}

const FooterSection: React.FC<FooterSectionProps> = ({ data }) => {
  // Default to showing the footer unless explicitly set to false
  if (data.showFooter === false) {
    return null;
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Helper to render social icon based on platform name
  const renderSocialIcon = (platform: string, icon?: string) => {
    const size = 18;
    const iconName = icon || platform.toLowerCase();

    switch (iconName) {
      case 'instagram':
        return <Instagram size={size} />;
      case 'twitter':
      case 'x':
        return <Twitter size={size} />;
      case 'github':
        return <Github size={size} />;
      case 'linkedin':
        return <Linkedin size={size} />;
      case 'facebook':
        return <Facebook size={size} />;
      case 'youtube':
        return <Youtube size={size} />;
      case 'email':
      case 'mail':
        return <Mail size={size} />;
      default:
        return <Globe size={size} />;
    }
  };

  // Determine background and text colors based on darkMode setting
  const bgClass = data.darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900';

  return (
    <footer className={`mt-auto py-12 ${bgClass}`}>
      <div className="container mx-auto px-4 md:px-6">
        {/* Simple Layout */}
        {(!data.layout || data.layout === 'simple') && (
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              {data.logo?.src ? (
                <img
                  src={data.logo.src}
                  alt={data.logo.alt || "Logo"}
                  className="h-8 md:h-10 w-auto"
                />
              ) : (
                <div className="text-xl font-bold">
                  {data.logo?.text || "Your Name"}
                </div>
              )}

              {data.description && (
                <p className="mt-2 text-sm max-w-md opacity-80">
                  {data.description}
                </p>
              )}
            </div>

            <div className="space-y-4 text-center md:text-right">
              {data.socialLinks && data.socialLinks.length > 0 && (
                <div className="flex items-center justify-center md:justify-end space-x-4">
                  {data.socialLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors"
                      aria-label={link.platform}
                    >
                      {renderSocialIcon(link.platform, link.icon)}
                    </a>
                  ))}
                </div>
              )}

              {data.copyright && (
                <p className="text-sm opacity-80">
                  {data.copyright}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Columns Layout */}
        {data.layout === 'columns' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              <div className="col-span-1 lg:col-span-1">
                {data.logo?.src ? (
                  <img
                    src={data.logo.src}
                    alt={data.logo.alt || "Logo"}
                    className="h-8 w-auto mb-4"
                  />
                ) : (
                  <div className="text-xl font-bold mb-4">
                    {data.logo?.text || "Your Name"}
                  </div>
                )}

                {data.description && (
                  <p className="text-sm opacity-80 mb-4">
                    {data.description}
                  </p>
                )}

                {data.socialLinks && data.socialLinks.length > 0 && (
                  <div className="flex items-center space-x-3">
                    {data.socialLinks.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                        aria-label={link.platform}
                      >
                        {renderSocialIcon(link.platform, link.icon)}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {data.columns && data.columns.map((column) => (
                <div key={column.id} className="col-span-1">
                  <h3 className="font-medium mb-4">
                    {column.title}
                  </h3>
                  <ul className="space-y-2">
                    {column.links.map((link) => (
                      <li key={link.id}>
                        <Link
                          href={link.url}
                          className="text-sm opacity-80 hover:opacity-100 hover:text-primary transition-colors"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center">
              {data.copyright && (
                <p className="text-sm opacity-80 mb-4 md:mb-0">
                  {data.copyright}
                </p>
              )}

              {data.showCredit && (
                <p className="text-sm opacity-80">
                  {data.creditText || "Made with Portfolio Hub"}
                </p>
              )}
            </div>
          </>
        )}

        {/* Centered Layout */}
        {data.layout === 'centered' && (
          <div className="text-center">
            <div className="mb-6">
              {data.logo?.src ? (
                <img
                  src={data.logo.src}
                  alt={data.logo.alt || "Logo"}
                  className="h-10 w-auto mx-auto mb-4"
                />
              ) : (
                <div className="text-xl font-bold mb-4">
                  {data.logo?.text || "Your Name"}
                </div>
              )}

              {data.description && (
                <p className="text-sm opacity-80 max-w-lg mx-auto mb-6">
                  {data.description}
                </p>
              )}
            </div>

            {data.columns && data.columns.length > 0 && data.columns[0]?.links && (
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-8">
                {data.columns[0].links.map((link) => (
                  <Link
                    key={link.id}
                    href={link.url}
                    className="text-sm opacity-80 hover:opacity-100 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}

            {data.socialLinks && data.socialLinks.length > 0 && (
              <div className="flex items-center justify-center space-x-4 mb-8">
                {data.socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                    aria-label={link.platform}
                  >
                    {renderSocialIcon(link.platform, link.icon)}
                  </a>
                ))}
              </div>
            )}

            <div className="border-t pt-6">
              {data.copyright && (
                <p className="text-sm opacity-80">
                  {data.copyright}
                </p>
              )}

              {data.showCredit && (
                <p className="text-sm opacity-80 mt-2">
                  {data.creditText || "Made with Portfolio Hub"}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Scroll to top button */}
      {data.showScrollToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}
    </footer>
  );
};

export default FooterSection;

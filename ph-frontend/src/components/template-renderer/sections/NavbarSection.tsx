import React from 'react';
import Link from 'next/link';
import { Moon, Sun, Menu, X } from 'lucide-react';

interface NavbarSectionProps {
  data: {
    logo?: {
      src?: string;
      alt?: string;
      text?: string;
    };
    items?: Array<{
      id: string;
      label: string;
      href: string;
      isExternal?: boolean;
    }>;
    position?: 'fixed' | 'static' | 'sticky';
    transparent?: boolean;
    enableDarkMode?: boolean;
    colorScheme?: 'light' | 'dark' | 'auto';
    hideOnScroll?: boolean;
    ctaButton?: {
      enabled?: boolean;
      label?: string;
      href?: string;
      variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    };
  };
  editable?: boolean;
  onUpdate?: (data: any) => void;
}

const NavbarSection: React.FC<NavbarSectionProps> = ({ data, editable }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);
  const lastScrollY = React.useRef(0);

  // Initialize state based on preference if dark mode is enabled
  React.useEffect(() => {
    if (data.enableDarkMode && typeof window !== 'undefined') {
      // Check user preference
      if (data.colorScheme === 'dark') {
        setIsDarkMode(true);
      } else if (data.colorScheme === 'auto') {
        setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
      }
    }
  }, [data.enableDarkMode, data.colorScheme]);

  // Handle scroll events for navbar behavior
  React.useEffect(() => {
    if (data.position === 'sticky' || data.hideOnScroll) {
      const handleScroll = () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 50) {
          setScrolled(true);
        } else {
          setScrolled(false);
        }

        // Hide on scroll logic
        if (data.hideOnScroll) {
          if (currentScrollY > lastScrollY.current) {
            setHidden(true);
          } else {
            setHidden(false);
          }
        }

        lastScrollY.current = currentScrollY;
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [data.position, data.hideOnScroll]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);

    // In a real scenario, this would apply dark mode to the document
    // For now, we'll just toggle the state
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', !isDarkMode);
    }
  };

  const getNavbarClass = () => {
    const baseClass = 'w-full py-4 transition-all duration-300 z-40';
    const positionClass = data.position === 'fixed' ? 'fixed top-0' :
                          data.position === 'sticky' ? 'sticky top-0' : 'relative';

    const backgroundClass = data.transparent && !scrolled ?
      'bg-transparent' :
      'bg-background border-b';

    const hiddenClass = hidden && data.hideOnScroll ? '-translate-y-full' : 'translate-y-0';

    return `${baseClass} ${positionClass} ${backgroundClass} ${hiddenClass}`;
  };

  const getButtonVariantClass = (variant = 'primary') => {
    switch (variant) {
      case 'primary':
        return 'bg-primary text-primary-foreground hover:bg-primary/90';
      case 'secondary':
        return 'bg-secondary text-secondary-foreground hover:bg-secondary/90';
      case 'outline':
        return 'border border-input bg-background hover:bg-accent hover:text-accent-foreground';
      case 'ghost':
        return 'hover:bg-accent hover:text-accent-foreground';
      default:
        return 'bg-primary text-primary-foreground hover:bg-primary/90';
    }
  };

  return (
    <nav className={getNavbarClass()}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            {data.logo?.src ? (
              <Link href="/" className="block">
                <img
                  src={data.logo.src}
                  alt={data.logo.alt || "Logo"}
                  className="h-8 md:h-10 w-auto"
                />
              </Link>
            ) : (
              <Link href="/" className="text-xl md:text-2xl font-bold">
                {data.logo?.text || "Your Name"}
              </Link>
            )}
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Nav Links */}
            <div className="flex items-center space-x-4">
              {(data.items || []).map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  target={item.isExternal ? "_blank" : undefined}
                  rel={item.isExternal ? "noopener noreferrer" : undefined}
                  className="font-medium text-sm text-foreground/80 hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Dark mode toggle */}
            {data.enableDarkMode && (
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full bg-muted hover:bg-muted/80"
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            )}

            {/* CTA Button */}
            {data.ctaButton?.enabled && (
              <Link
                href={data.ctaButton.href || "#"}
                className={`px-4 py-2 rounded-md text-sm font-medium ${getButtonVariantClass(data.ctaButton.variant)}`}
              >
                {data.ctaButton.label || "Contact Me"}
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-foreground"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        {isOpen && (
          <div className="md:hidden pt-4 pb-2">
            <div className="flex flex-col space-y-4">
              {(data.items || []).map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  target={item.isExternal ? "_blank" : undefined}
                  rel={item.isExternal ? "noopener noreferrer" : undefined}
                  className="font-medium text-sm text-foreground/80 hover:text-foreground py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {/* CTA Button */}
              {data.ctaButton?.enabled && (
                <Link
                  href={data.ctaButton.href || "#"}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${getButtonVariantClass(data.ctaButton.variant)}`}
                  onClick={() => setIsOpen(false)}
                >
                  {data.ctaButton.label || "Contact Me"}
                </Link>
              )}

              {/* Dark mode toggle */}
              {data.enableDarkMode && (
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center py-2 space-x-2 text-sm font-medium"
                >
                  {isDarkMode ? (
                    <>
                      <Sun className="h-4 w-4" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavbarSection;

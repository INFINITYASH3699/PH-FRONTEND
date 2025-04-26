"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  // Check if the current path matches /portfolio/[something]
  const isPortfolioPage = /^\/portfolio\/[^/]+$/.test(pathname);

  if (isPortfolioPage) {
    return null; // Don't render footer
  }

  return (
    <footer className="w-full py-12 border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text">
              PortfolioHub
            </h3>
            <p className="text-sm text-muted-foreground">
              Create your professional portfolio in minutes. Showcase your work
              and get hired.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/templates"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Templates
                </Link>
              </li>
              <li>
                <Link
                  href="/features"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/examples"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Examples
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} PortfolioHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

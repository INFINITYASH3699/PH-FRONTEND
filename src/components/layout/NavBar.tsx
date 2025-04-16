import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export function NavBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text">
              PortfolioHub
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/templates"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Templates
          </Link>
          <Link
            href="/features"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Pricing
          </Link>
          <Link
            href="/examples"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Examples
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/auth/signin">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button size="sm" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>PortfolioHub</SheetTitle>
              <SheetDescription>Create your professional portfolio in minutes</SheetDescription>
            </SheetHeader>
            <nav className="flex flex-col gap-4 mt-8">
              <Link
                href="/templates"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Templates
              </Link>
              <Link
                href="/features"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Pricing
              </Link>
              <Link
                href="/examples"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Examples
              </Link>
              <div className="flex flex-col gap-2 mt-4">
                <Link href="/auth/signin">
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                    Get Started
                  </Button>
                </Link>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

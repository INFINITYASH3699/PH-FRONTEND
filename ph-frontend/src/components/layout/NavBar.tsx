"use client";

import { useState, useEffect } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  User,
  ChevronDown,
  Layers,
  LayoutDashboard,
  LogOut,
  Settings,
  UserCircle,
  GalleryHorizontal,
  Star,
  PieChart,
  Sparkles,
  BadgeCheck,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthContext"; // <-- IMPORT YOURS

export function NavBar() {
  // Use custom auth
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Listen for scroll events
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Custom logout handler
  const handleSignOut = async () => {
    logout();
    // Remove this direct router push to let middleware handle it
    // The middleware will detect the authentication state change and redirect
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  const navLinks = [
    {
      name: "Templates",
      href: "/templates",
      icon: <Layers className="h-4 w-4 mr-2" />,
    },
    {
      name: "Features",
      href: "/features",
      icon: <Sparkles className="h-4 w-4 mr-2" />,
    },
    {
      name: "Pricing",
      href: "/pricing",
      icon: <PieChart className="h-4 w-4 mr-2" />,
    },
    {
      name: "Examples",
      href: "/examples",
      icon: <GalleryHorizontal className="h-4 w-4 mr-2" />,
    },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md shadow-sm border-b"
          : "bg-background/50 backdrop-blur-sm"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300">
              <span className="font-bold text-white text-lg">PH</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text">
              PortfolioHub
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center text-sm font-medium transition-colors hover:text-primary relative px-1 py-1 ${
                isActive(link.href) ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <span className="flex items-center">
                {link.icon}
                {link.name}
              </span>
              {isActive(link.href) && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary rounded-full animate-fadeIn"></span>
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <LayoutDashboard className="h-4 w-4 mr-1" />
                  Dashboard
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 pl-2 pr-3 relative border border-muted-foreground/20 hover:bg-accent"
                  >
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.fullName || "User"}
                        className="h-7 w-7 rounded-full ring-2 ring-background"
                      />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white ring-2 ring-background">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                    <span className="font-medium max-w-[120px] truncate">
                      {user?.fullName || user?.username || "User"}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    {isAuthenticated && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 p-2 rounded-xl"
                >
                  <div className="flex flex-col space-y-3 p-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Signed in as
                    </p>
                    <div className="flex items-center gap-3">
                      {user?.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user.fullName || "User"}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                          <User className="h-5 w-5" />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <p className="font-medium">
                          {user?.fullName || user?.username || "User"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {user?.email || ""}
                        </p>
                      </div>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    asChild
                    className="flex items-center cursor-pointer"
                  >
                    <Link href="/dashboard" className="flex items-center">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="flex items-center cursor-pointer"
                  >
                    <Link href="/profile" className="flex items-center">
                      <UserCircle className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="flex items-center cursor-pointer"
                  >
                    <Link
                      href={`/portfolio/${user?.username || ""}`}
                      className="flex items-center"
                    >
                      <BadgeCheck className="h-4 w-4 mr-2" />
                      View Portfolio
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex items-center text-red-500 hover:text-red-600 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/auth/signin">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-muted-foreground/20 hover:border-muted-foreground/30"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
                >
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Navigation (also refactored) */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] sm:w-[350px]">
            <SheetHeader className="text-left">
              <SheetTitle>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-md bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                    <span className="font-bold text-white text-lg">PH</span>
                  </div>
                  <span className="text-xl font-bold">PortfolioHub</span>
                </div>
              </SheetTitle>
              <SheetDescription>
                Create your professional portfolio in minutes
              </SheetDescription>
            </SheetHeader>
            <nav className="flex flex-col gap-5 mt-8">
              {isAuthenticated && (
                <div className="flex items-center gap-3 mb-4 bg-muted p-3 rounded-lg">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.fullName || "User"}
                      className="h-12 w-12 rounded-full border-2 border-background"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white border-2 border-background">
                      <User className="h-6 w-6" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">
                      {user?.fullName || user?.username || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                      {user?.email}
                    </p>
                  </div>
                </div>
              )}

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center text-base font-medium transition-colors hover:text-primary pl-1 py-1 ${
                    isActive(link.href)
                      ? "text-primary bg-muted pl-3 rounded-lg border-l-2 border-primary"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}

              <div className="flex flex-col gap-3 mt-6 pt-6 border-t">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        size="sm"
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        size="sm"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </Link>
                    <Link
                      href={`/portfolio/${user?.username || ""}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        size="sm"
                      >
                        <BadgeCheck className="h-4 w-4 mr-2" />
                        View Portfolio
                      </Button>
                    </Link>
                    <Button
                      className="w-full mt-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleSignOut();
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/signin"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button variant="outline" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

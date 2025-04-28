'use client';

import Link from 'next/link';
import { Suspense, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import SignUpForm from './SignUpForm';

export default function SignUpPage() {
  useEffect(() => {
    // Check if there's any authentication remnants and clear them
    try {
      const TOKEN_KEY = 'ph_auth_token';
      // Clear local storage items
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('ph_user_data');

      // Clear cookies
      document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0`;
    } catch (error) {
      console.error("Error clearing auth data on signup page:", error);
    }
  }, []);

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-600 to-indigo-700" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Link href="/" className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-6 w-6"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" x2="22" y1="10" y2="10" />
            </svg>
            <span className="text-xl font-bold">PortfolioHub</span>
          </Link>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "I created my professional portfolio in less than an hour with PortfolioHub. The templates are stunning and my portfolio has already helped me land several freelance projects."
            </p>
            <footer className="text-sm">Marcus Chen - Web Developer</footer>
          </blockquote>
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-10 opacity-40">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            className="w-full"
          >
            <path
              fill="currentColor"
              fillOpacity="1"
              d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,224C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
      </div>
      <div className="p-4 md:p-8 lg:p-12 flex items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
            <p className="text-sm text-muted-foreground">
              Start building your professional portfolio in minutes
            </p>
          </div>
          <Card>
            <Suspense fallback={
              <CardContent className="p-6">
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
                </div>
              </CardContent>
            }>
              <SignUpForm />
            </Suspense>
          </Card>
          <p className="px-8 text-center text-xs text-muted-foreground">
            By creating an account, you are agreeing to our{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

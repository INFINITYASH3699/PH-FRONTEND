'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { NavBar } from '@/components/layout/NavBar';
import { Footer } from '@/components/layout/Footer';
import ResetPasswordForm from './ResetPasswordForm';

// This component will load within Suspense
const ResetPasswordContent = () => {
  'use client';

  // useSearchParams is now safely wrapped in a client component within Suspense
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token') || '';

  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
        <CardDescription>Enter your new password below</CardDescription>
      </CardHeader>
      <ResetPasswordForm token={token} />
    </Card>
  );
};

// Server component
export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      <main className="flex-grow flex items-center justify-center py-12">
        <div className="container max-w-md px-4 md:px-6">
          <Suspense fallback={
            <Card className="shadow-lg">
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold">Loading...</CardTitle>
                <CardDescription>Please wait</CardDescription>
              </CardHeader>
            </Card>
          }>
            <ResetPasswordContent />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}

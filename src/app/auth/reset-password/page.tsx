'use client';

import Link from 'next/link';
import { Suspense, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { NavBar } from '@/components/layout/NavBar';
import { Footer } from '@/components/layout/Footer';
import ResetPasswordForm from './ResetPasswordForm';

// Client component that safely uses browser APIs
const ResetPasswordContent = () => {
  'use client';

  // We need to use dynamic imports for React hooks to avoid SSR issues
  const React = require('react');
  const [token, setToken] = React.useState('');

  React.useEffect(() => {
    // Only access window in useEffect, which only runs in browser
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      setToken(searchParams.get('token') || '');
    }
  }, []);

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

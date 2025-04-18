import Link from 'next/link';
import { Suspense } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NavBar } from '@/components/layout/NavBar';
import { Footer } from '@/components/layout/Footer';
import SignInForm from './SignInForm';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      <main className="flex-grow flex items-center justify-center py-12">
        <div className="container max-w-md px-4 md:px-6">
          <Card className="shadow-lg">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">Sign in to your account</CardTitle>
              <CardDescription>Enter your credentials to access your PortfolioHub account</CardDescription>
            </CardHeader>
            <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
              <SignInForm />
            </Suspense>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

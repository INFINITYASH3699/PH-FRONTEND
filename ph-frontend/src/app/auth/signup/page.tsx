import Link from 'next/link';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { NavBar } from '@/components/layout/NavBar';
import { Footer } from '@/components/layout/Footer';
import SignUpForm from './SignUpForm';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      <main className="flex-grow flex items-center justify-center py-12">
        <div className="container max-w-md px-4 md:px-6">
          <Card className="shadow-lg">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
              <CardDescription>Enter your details to create your PortfolioHub account</CardDescription>
            </CardHeader>
            <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
              <SignUpForm />
            </Suspense>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

'use client';

import Link from 'next/link';
import { Suspense, useEffect } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SignInForm from './SignInForm';

export default function SignInPage() {
  useEffect(() => {
    // Check if there's any authentication remnants and clear them
    try {
      const TOKEN_KEY = 'ph_auth_token';
      // Clear local storage items
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('ph_user_data');

      // Clear cookies
      document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0`;
      console.log("Signin page: Cleared any existing authentication data");
    } catch (error) {
      console.error("Error clearing auth data on signin page:", error);
    }
  }, []);

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
      <Card className="mx-auto max-w-md shadow-lg">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid grid-cols-1 mb-4 hidden">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <Suspense fallback={<div>Loading...</div>}>
              <SignInForm />
            </Suspense>
          </TabsContent>
        </Tabs>
      </Card>
    </main>
  );
}

'use client';

import Link from 'next/link';
import { Suspense, useEffect } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
      console.log("Signup page: Cleared any existing authentication data");
    } catch (error) {
      console.error("Error clearing auth data on signup page:", error);
    }
  }, []);

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
      <Card className="mx-auto max-w-md shadow-lg">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>
            Start building your professional portfolio in minutes
          </CardDescription>
        </CardHeader>
        <Tabs defaultValue="signup" className="w-full">
          <TabsList className="grid grid-cols-1 mb-4 hidden">
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signup">
            <Suspense fallback={<div>Loading...</div>}>
              <SignUpForm />
            </Suspense>
          </TabsContent>
        </Tabs>
      </Card>
    </main>
  );
}

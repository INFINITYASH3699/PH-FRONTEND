import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { NavBar } from '@/components/layout/NavBar';
import { Footer } from '@/components/layout/Footer';
import ResetPasswordForm from './ResetPasswordForm';

export default function ResetPasswordPage({
  searchParams
}: {
  searchParams: { token?: string }
}) {
  const token = searchParams.token || '';

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      <main className="flex-grow flex items-center justify-center py-12">
        <div className="container max-w-md px-4 md:px-6">
          <Card className="shadow-lg">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
              <CardDescription>Enter your new password below</CardDescription>
            </CardHeader>
            <ResetPasswordForm token={token} />
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

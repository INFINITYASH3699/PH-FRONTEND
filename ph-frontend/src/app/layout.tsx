import './globals.css';
import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import { AuthProvider } from '@/components/providers/AuthProvider';
import ToastProvider from '@/components/providers/ToastProvider';
import ClientBody from './ClientBody';
import { NavBar } from '@/components/layout/NavBar';
import { Footer } from '@/components/layout/Footer';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'PortfolioHub - Create Your Professional Portfolio',
  description: 'Create a stunning portfolio website in minutes with customizable templates',
  metadataBase: new URL('https://portfoliohub.com'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontSans.variable}`} suppressHydrationWarning>
      <AuthProvider>
        <ClientBody>
          <ToastProvider />
          <NavBar />
          {children}
          <Footer />
        </ClientBody>
      </AuthProvider>
    </html>
  );
}

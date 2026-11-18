import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { LanguageProvider } from '@/context/LanguageContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Meditation Hub — Meditate together',
  description:
    'A peaceful digital meditation room where people share intentions, support loved ones through meditation, and connect through quiet collective presence.',
  manifest: '/manifest.json',
  openGraph: {
    title: 'Meditation Hub — A peaceful room to meditate together',
    description:
      'A peaceful digital meditation room where people share intentions, support loved ones through meditation, and connect through quiet collective presence.',
    url: 'https://meditation-hub.org',
    siteName: 'Meditation Hub',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Meditation Hub — Meditate together',
    description:
      'A peaceful digital meditation room where people share intentions, support loved ones through meditation, and connect through quiet collective presence.',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Meditation Hub',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#080B15] text-[#F3F3FA]">
        <LanguageProvider>
          <AppProvider>{children}</AppProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

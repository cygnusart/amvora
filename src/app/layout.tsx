import { AuthProvider } from '@/contexts/AuthContext';
import { TimerProvider } from '@/contexts/TimerContext';
import QueryProvider from '@/providers/QueryProvider';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Amvora - Your Thinking Companion',
  description: 'AI-powered productivity and focus platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>
          <AuthProvider>
            <TimerProvider>
              {children}
            </TimerProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
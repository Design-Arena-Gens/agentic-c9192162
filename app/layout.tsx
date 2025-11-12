import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pro TTS Studio',
  description: 'Professional Text-to-Speech for web and product teams',
  metadataBase: new URL('https://agentic-c9192162.vercel.app'),
  openGraph: {
    title: 'Pro TTS Studio',
    description: 'Professional Text-to-Speech for web and product teams',
    url: 'https://agentic-c9192162.vercel.app',
    siteName: 'Pro TTS Studio',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Pro TTS Studio'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pro TTS Studio',
    description: 'Professional Text-to-Speech for web and product teams',
    images: ['/og.png']
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

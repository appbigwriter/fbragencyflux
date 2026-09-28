import type { Metadata, Viewport } from 'next';
import './globals.css';

const siteUrl = 'https://afterforty.fbr.news';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'After Forty — Feel and look stronger after 40', template: '%s | After Forty' },
  description: 'A calm, evidence-led guide to skin health, strength, recovery, and healthy aging.',
  alternates: { canonical: '/' },
  openGraph: { type: 'website', url: siteUrl, siteName: 'After Forty by Heidi Braun', title: 'After Forty — Feel and look stronger after 40', description: 'Evidence-led guidance for skin health, strength, recovery, and healthy aging.' },
  twitter: { card: 'summary', title: 'After Forty by Heidi Braun', description: 'Evidence-led guidance for healthy aging after 40.' },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, colorScheme: 'light' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

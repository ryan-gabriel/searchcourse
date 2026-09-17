import type { Metadata } from 'next';
import { Work_Sans } from 'next/font/google';
import { Fraunces as FrauncesFont } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { TelegramCTA } from '@/components/telegram-cta';
import { SITE_NAME, SITE_TAGLINE, siteUrl } from '@/lib/site';

const WorkSans = Work_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-work-sans',
  display: 'swap',
});

const Fraunces = FrauncesFont({
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: 'Curated online course deals: verified discounts, coupons, and the best value learning paths across platforms.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180' }],
  },
  openGraph: {
    title: SITE_NAME,
    description: SITE_TAGLINE,
    url: siteUrl(),
    siteName: SITE_NAME,
    type: 'website',
    images: [{ url: siteUrl('/seo/og-image.jpg'), width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_TAGLINE,
    images: [{ url: siteUrl('/seo/twitter-card.jpg'), width: 1200, height: 600, alt: SITE_NAME }],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${WorkSans.variable} ${Fraunces.variable}`}
    >
      <body className="flex min-h-screen flex-col">
        <script
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }}
        />
        <a
          href="#main"
          className="focus-ring sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-foreground"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <TelegramCTA />
        <SiteFooter />
      </body>
    </html>
  );
}
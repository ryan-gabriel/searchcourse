import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildOrganizationSchema } from '@/lib/seo/schema';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),

  title: {
    default: 'SearchCourse - Discover Premium Course Deals',
    template: '%s | SearchCourse',
  },
  description:
    'Find the best deals on online courses from Udemy, Coursera, and more. Save up to 90% on top-rated courses with verified coupons.',
  keywords: [
    'online courses',
    'course deals',
    'udemy coupons',
    'coursera discounts',
    'programming courses',
    'web development',
    'learning platform',
    'free courses',
    'course coupons',
    'online learning',
  ],
  authors: [{ name: 'SearchCourse' }],
  creator: 'SearchCourse',
  publisher: 'SearchCourse',

  verification: {
    google: 'v2nwME-tJsD-NrNQIghAfDT9Ew-hR0c1QC4A7As_WLM',
  },

  icons: {
    icon: [
      { url: '/seo/16x16-icon.ico', sizes: '16x16', type: 'image/x-icon' },
      { url: '/seo/32x32-icon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/seo/48x48-icon.ico', sizes: '48x48', type: 'image/x-icon' },
      { url: '/seo/192x192-icon.ico', sizes: '192x192', type: 'image/x-icon' },
      { url: '/seo/512x512-icon.ico', sizes: '512x512', type: 'image/x-icon' },
    ],
    shortcut: '/seo/32x32-icon.ico',
    apple: [{ url: '/seo/192x192-icon.ico', sizes: '180x180', type: 'image/x-icon' }],
  },

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'SearchCourse',
    title: 'SearchCourse - Discover Premium Course Deals',
    description:
      'Find the best deals on online courses from Udemy, Coursera, and more. Save up to 90% on top-rated courses.',
    images: [
      {
        url: '/seo/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SearchCourse - Your Gateway to Premium Online Courses',
        type: 'image/png',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'SearchCourse - Discover Premium Course Deals',
    description:
      'Find the best deals on online courses from Udemy, Coursera, and more. Save up to 90% on top-rated courses.',
    images: [
      {
        url: '/seo/twitter-card.png',
        width: 1200,
        height: 600,
        alt: 'SearchCourse - Premium Course Deals',
      },
    ],
    creator: '@searchcourse',
    site: '@searchcourse',
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  applicationName: 'SearchCourse',
  referrer: 'origin-when-cross-origin',
  category: 'education',
  other: {
    'theme-color': '#12110f',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className={`${GeistSans.variable} antialiased min-h-screen flex flex-col`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-accent focus:text-accent-ink focus:text-sm focus:font-medium"
        >
          Skip to main content
        </a>
        <ThemeProvider>
          <Header />
          <main id="main-content" className="flex-1 outline-none">
            {children}
          </main>
          <Footer />
          <JsonLd
            data={buildOrganizationSchema(
              process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
            )}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}

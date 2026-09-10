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
    icon: [{ url: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' }],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
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
      {/* Sticky Telegram Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-blue-900 text-white text-sm py-3 px-4 text-center opacity-95 transition-opacity duration-300 hover:opacity-100">
        <span className="font-medium">💰 FREE UDEMY DEALS DAILY — JOIN 500+ SAVVY LEARNERS</span>
        <a href="https://t.me/searchcourses" className="font-medium underline underline-offset-2 ml-2" target="_blank" rel="noopener noreferrer">
          t.me/searchcourses
        </a>
      </div>
      </body>
</html>
  );
}

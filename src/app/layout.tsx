import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { Outfit } from 'next/font/google';
import { Send } from 'lucide-react';
import './globals.css';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildOrganizationSchema } from '@/lib/seo/schema';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

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
        url: '/seo/twitter-card.jpg',
        width: 1200,
        height: 600,
        alt: 'SearchCourse - Premium Course Deals',
        type: 'image/jpeg',
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
    'theme-color': '#0b0f0d',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||'dark';var r=t==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;document.documentElement.classList.add(r);}catch(e){document.documentElement.classList.add('dark');}})();`,
          }}
        />
      </head>
      <body
        className={`${GeistSans.variable} ${outfit.variable} antialiased min-h-screen flex flex-col`}
      >
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
      <div className="h-20" aria-hidden="true" />
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface/95 backdrop-blur text-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-center">
          <Send className="h-4 w-4 text-accent" aria-hidden="true" />
          <span className="text-foreground/80">Free Udemy deals daily</span>
          <a
            href="https://t.me/searchcourses"
            className="font-semibold text-accent underline-offset-2 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Join 500+ learners
          </a>
        </div>
      </div>
      </body>
</html>
  );
}

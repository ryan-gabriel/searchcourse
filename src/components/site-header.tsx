import Link from 'next/link';
import Image from 'next/image';
import { Container } from './container';
import { SITE_NAME } from '@/lib/site';

const NAV = [
  { href: '/courses', label: 'Courses' },
  { href: '/roadmaps', label: 'Roadmaps' },
  { href: '/about', label: 'About' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-secondary/20 bg-secondary">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Link href="/" className="focus-ring inline-flex items-center rounded-md" aria-label={SITE_NAME}>
          <Image
            src="/seo/long-logo-light.png"
            alt={SITE_NAME}
            width={180}
            height={50}
            priority
            className="h-8 w-auto"
          />
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="focus-ring rounded-md px-3 py-2 text-sm font-medium text-secondary-foreground/75 hover:bg-secondary/80 hover:text-secondary-foreground"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="focus-ring rounded-md px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
          >
            Sign in
          </Link>
        </nav>
      </Container>
    </header>
  );
}
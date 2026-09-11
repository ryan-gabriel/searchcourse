import Link from 'next/link';
import Image from 'next/image';
import { Container } from './container';
import { SITE_NAME, TELEGRAM_URL } from '@/lib/site';

export function SiteFooter() {
  return (
    <footer className="border-t border-secondary/20 bg-secondary">
      <Container className="flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Image
            src="/seo/long-logo-light.png"
            alt={SITE_NAME}
            width={180}
            height={50}
            className="h-16.5 w-auto"
          />
          <p className="mt-2 text-sm text-secondary-foreground/75">Curated online course deals.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/courses" className="focus-ring text-secondary-foreground/75 hover:text-secondary-foreground">
            Courses
          </Link>
          <Link href="/roadmaps" className="focus-ring text-secondary-foreground/75 hover:text-secondary-foreground">
            Roadmaps
          </Link>
          <Link href="/about" className="focus-ring text-secondary-foreground/75 hover:text-secondary-foreground">
            About
          </Link>
          <Link href="/privacy" className="focus-ring text-secondary-foreground/75 hover:text-secondary-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="focus-ring text-secondary-foreground/75 hover:text-secondary-foreground">
            Terms
          </Link>
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring text-secondary-foreground/75 hover:text-secondary-foreground"
          >
            Telegram
          </a>
        </nav>
      </Container>
    </footer>
  );
}
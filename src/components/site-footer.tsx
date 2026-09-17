import Link from 'next/link';
import Image from 'next/image';
import { Container } from './container';
import { SITE_NAME, TELEGRAM_URL } from '@/lib/site';

export function SiteFooter() {
  return (
    <footer className="border-t border-secondary/20 bg-secondary text-secondary-foreground">
      <Container className="grid gap-10 py-12 sm:grid-cols-[1fr_auto]">
        <div className="max-w-sm">
          <Image
            src="/seo/long-logo-light.png"
            alt={SITE_NAME}
            width={180}
            height={50}
            className="h-16 w-auto"
          />
          <p className="mt-3 text-sm leading-relaxed text-secondary-foreground/75">
            A verified deal sheet for online learning. Every price is checked and dated before it is published.
          </p>
        </div>

        <nav aria-label="Footer" className="grid gap-x-12 gap-y-8 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-foreground/50">Browse</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/courses" className="focus-ring rounded-sm text-secondary-foreground/75 transition-colors hover:text-secondary-foreground">Course deals</Link></li>
              <li><Link href="/roadmaps" className="focus-ring rounded-sm text-secondary-foreground/75 transition-colors hover:text-secondary-foreground">Learning roadmaps</Link></li>
              <li><Link href="/categories" className="focus-ring rounded-sm text-secondary-foreground/75 transition-colors hover:text-secondary-foreground">Categories</Link></li>
              <li><Link href="/platforms" className="focus-ring rounded-sm text-secondary-foreground/75 transition-colors hover:text-secondary-foreground">Platforms</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-foreground/50">Site</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/about" className="focus-ring rounded-sm text-secondary-foreground/75 transition-colors hover:text-secondary-foreground">About</Link></li>
              <li>
                <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="focus-ring rounded-sm text-secondary-foreground/75 transition-colors hover:text-secondary-foreground">
                  Telegram channel
                </a>
              </li>
              <li><Link href="/privacy" className="focus-ring rounded-sm text-secondary-foreground/75 transition-colors hover:text-secondary-foreground">Privacy</Link></li>
              <li><Link href="/terms" className="focus-ring rounded-sm text-secondary-foreground/75 transition-colors hover:text-secondary-foreground">Terms</Link></li>
            </ul>
          </div>
        </nav>
      </Container>
    </footer>
  );
}

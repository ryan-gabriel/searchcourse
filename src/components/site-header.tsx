'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { Container } from './container';
import { SITE_NAME } from '@/lib/site';

const NAV = [
  { href: '/courses', label: 'Courses' },
  { href: '/roadmaps', label: 'Roadmaps' },
  { href: '/categories', label: 'Categories' },
  { href: '/about', label: 'About' },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className={`sticky top-0 z-40 border-b border-secondary/20 bg-secondary transition-shadow duration-300 ${
        scrolled || menuOpen ? 'shadow-[0_4px_16px_-8px_rgba(26,23,19,0.5)]' : ''
      }`}
    >
      <Container className="flex h-20 items-center justify-between gap-6">
        <Link
          href="/"
          className="focus-ring inline-flex items-center rounded-md"
          aria-label={SITE_NAME}
          onClick={closeMenu}
        >
          <Image
            src="/seo/long-logo-light.png"
            alt={SITE_NAME}
            width={180}
            height={50}
            priority
            className="h-16 w-auto sm:h-17"
          />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="focus-ring rounded-md px-3 py-2 text-sm font-medium text-secondary-foreground/75 transition-colors hover:bg-secondary/80 hover:text-secondary-foreground"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="focus-ring rounded-md px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            Sign in
          </Link>
        </nav>

        <button
          type="button"
          className="focus-ring inline-flex items-center justify-center rounded-md p-2.5 text-secondary-foreground md:hidden"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>
      </Container>

      <nav
        id="mobile-nav"
        aria-label="Mobile"
        className={`border-t border-secondary/20 bg-secondary md:hidden ${
          menuOpen ? 'block' : 'hidden'
        }`}
      >
        <Container className="flex flex-col gap-1 py-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMenu}
              className="focus-ring rounded-md px-3 py-3 text-base font-medium text-secondary-foreground/75 transition-colors hover:bg-secondary/80 hover:text-secondary-foreground"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={closeMenu}
            className="focus-ring rounded-md px-3 py-3 text-base font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            Sign in
          </Link>
        </Container>
      </nav>
    </header>
  );
}

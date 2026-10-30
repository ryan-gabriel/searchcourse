export const SITE_NAME = 'SearchCourse';
export const SITE_TAGLINE = 'Curated online course deals';

export const TELEGRAM_URL =
  process.env.NEXT_PUBLIC_TELEGRAM_URL || 'https://t.me/searchcourses';

export const TELEGRAM_BOT_USERNAME =
  process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || '';

// Empty when no bot username is configured; callers hide bot-only links.
export const TELEGRAM_BOT_URL = TELEGRAM_BOT_USERNAME
  ? `https://t.me/${TELEGRAM_BOT_USERNAME}`
  : '';

export function siteUrl(path = ''): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${base.replace(/\/$/, '')}${path}`;
}

export function siteTitle(page: string): string {
  return `${page} · ${SITE_NAME}`;
}
export const SITE_NAME = 'SearchCourse';
export const SITE_TAGLINE = 'Curated online course deals';

export function siteUrl(path = ''): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${base.replace(/\/$/, '')}${path}`;
}

export function siteTitle(page: string): string {
  return `${page} · ${SITE_NAME}`;
}
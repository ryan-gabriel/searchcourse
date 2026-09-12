import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/container';
import { getAllPlatforms } from '@/services';
import { siteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Learning platforms',
  description:
    'Browse verified course deals by platform. Compare current coupons across Udemy and other learning platforms.',
  alternates: { canonical: siteUrl('/platforms') },
};

export const revalidate = 300;

export default async function PlatformsPage() {
  const platforms = await getAllPlatforms();

  return (
    <Container className="py-10 sm:py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Learning platforms</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Each platform page collects the current verified deals available on that platform.
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {platforms.map((platform) => (
          <li key={platform.id}>
            <Link
              href={`/platforms/${platform.slug}`}
              className="focus-ring block rounded-lg border border-border bg-card p-5 transition-shadow hover:shadow-md"
            >
              <span className="font-semibold">{platform.name}</span>
              <span className="mt-1 block text-sm text-muted-foreground">
                {platform._count.courses} active course{platform._count.courses === 1 ? '' : 's'}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
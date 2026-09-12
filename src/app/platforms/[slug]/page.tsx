import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/container';
import { CourseCard } from '@/components/course-card';
import { EmptyState } from '@/components/states';
import { Pagination } from '@/components/pagination';
import { LinkButton } from '@/components/button';
import { getPlatformBySlug, searchCourses } from '@/services';
import { buildItemListSchema, buildBreadcrumbSchema } from '@/lib/seo/schema';
import { siteUrl } from '@/lib/site';

export const revalidate = 300;

const PAGE_LIMIT = 24;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const platform = await getPlatformBySlug(slug);

  if (!platform) {
    return { title: 'Platform not found' };
  }

  return {
    title: `${platform.name} course deals`,
    description: `Verified ${platform.name} course coupons and discounts. Compare current prices on curated ${platform.name} courses before the deal expires.`,
    alternates: { canonical: siteUrl(`/platforms/${platform.slug}`) },
    openGraph: {
      title: `${platform.name} course deals`,
      description: `Verified ${platform.name} course deals and discounts.`,
      url: siteUrl(`/platforms/${platform.slug}`),
      type: 'website',
    },
  };
}

export default async function PlatformPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const awaited = await searchParams;
  const page = Math.max(1, Number(awaited.page) || 1);

  const platform = await getPlatformBySlug(slug);

  if (!platform) notFound();

  const result = await searchCourses({
    platform: slug,
    page,
    limit: PAGE_LIMIT,
    sortBy: 'date',
    sortOrder: 'desc',
  });

  const jsonLd = [
    buildBreadcrumbSchema([
      { name: 'Home', url: siteUrl() },
      { name: 'Courses', url: siteUrl('/courses') },
      { name: platform.name, url: siteUrl(`/platforms/${platform.slug}`) },
    ]),
    buildItemListSchema(
      result.data.map((course) => ({
        name: course.title,
        url: siteUrl(`/courses/${course.slug}`),
      }))
    ),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Container className="py-10 sm:py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{platform.name} course deals</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Verified {platform.name} courses with active coupons. Prices are re-checked as coupons are validated.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            {result.pagination.total} course{result.pagination.total === 1 ? '' : 's'} with active deals
          </p>
        </header>

        {result.data.length ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {result.data.map((course, i) => (
                <CourseCard key={course.id} course={course} priority={i < 3} />
              ))}
            </div>
            <Pagination
              page={page}
              totalPages={result.pagination.totalPages}
              buildHref={(next) => (next > 1 ? `/platforms/${platform.slug}?page=${next}` : `/platforms/${platform.slug}`)}
            />
          </>
        ) : (
          <EmptyState
            title={`No ${platform.name} deals right now`}
            body="We re-check coupons continuously. Try the full listing or check back soon."
            action={<LinkButton href="/courses" variant="secondary">Browse all courses</LinkButton>}
          />
        )}
      </Container>
    </>
  );
}
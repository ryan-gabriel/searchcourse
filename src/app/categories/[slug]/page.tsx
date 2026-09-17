import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/container';
import { ContextImage } from '@/components/context-image';
import { CourseCard } from '@/components/course-card';
import { EmptyState } from '@/components/states';
import { Pagination } from '@/components/pagination';
import { LinkButton } from '@/components/button';
import { JsonLd } from '@/components/json-ld';
import { getCategoryBySlug, searchCourses } from '@/services';
import { imageForCategory } from '@/lib/category-images';
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
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return { title: 'Category not found' };
  }

  return {
    title: `${category.name} course deals`,
    description: `Verified ${category.name} course deals, coupons, and discounts. Compare current prices on curated ${category.name.toLowerCase()} courses before the coupon expires.`,
    alternates: { canonical: siteUrl(`/categories/${category.slug}`) },
    openGraph: {
      title: `${category.name} course deals`,
      description: `Verified ${category.name} course deals and discounts.`,
      url: siteUrl(`/categories/${category.slug}`),
      type: 'website',
    },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const awaited = await searchParams;
  const page = Math.max(1, Number(awaited.page) || 1);

  const category = await getCategoryBySlug(slug);

  if (!category) notFound();

  const result = await searchCourses({
    category: slug,
    page,
    limit: PAGE_LIMIT,
    sortBy: 'date',
    sortOrder: 'desc',
  });

  const jsonLd = [
    buildBreadcrumbSchema([
      { name: 'Home', url: siteUrl() },
      { name: 'Courses', url: siteUrl('/courses') },
      { name: category.name, url: siteUrl(`/categories/${category.slug}`) },
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
      <JsonLd data={jsonLd} />

      <div className="border-b border-border bg-secondary">
        <div className="relative h-40 overflow-hidden sm:h-56">
          <ContextImage
            src={imageForCategory(category.name)}
            alt={`${category.name} courses`}
            sizes="100vw"
            priority
            className="opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/40 to-transparent" aria-hidden="true" />
        </div>
      </div>

      <Container className="py-10 sm:py-12">
        <header className="mb-8 -mt-14 sm:-mt-16">
          <div className="inline-block max-w-2xl rounded-lg border border-border bg-card p-6 shadow-[0_10px_24px_-12px_rgba(26,23,19,0.28)]">
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{category.name} course deals</h1>
            <p className="mt-2 text-muted-foreground">
              {category.description ??
                `Verified ${category.name.toLowerCase()} courses with active coupons. Prices are re-checked as coupons are validated.`}
            </p>
            <p className="tnum mt-3 text-sm text-muted-foreground">
              {result.pagination.total} course{result.pagination.total === 1 ? '' : 's'} with active deals
            </p>
          </div>
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
              buildHref={(next) => (next > 1 ? `/categories/${category.slug}?page=${next}` : `/categories/${category.slug}`)}
            />
          </>
        ) : (
          <EmptyState
            title={`No ${category.name} deals right now`}
            body="We re-check coupons continuously. Try the full listing or check back soon."
            action={<LinkButton href="/courses" variant="secondary">Browse all courses</LinkButton>}
          />
        )}
      </Container>
    </>
  );
}
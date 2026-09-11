import type { Metadata } from 'next';
import { Container } from '@/components/container';
import { CourseCard } from '@/components/course-card';
import { EmptyState } from '@/components/states';
import { Pagination } from '@/components/pagination';
import { AutoSubmitSelect } from '@/components/auto-submit-select';
import { searchCourses, getAllPlatforms, getAllCategories } from '@/services';
import { CourseSearchSchema } from '@/validations';
import { resolveCoursesIndexing } from '@/lib/seo/canonical';
import { buildItemListSchema } from '@/lib/seo/schema';
import { siteUrl } from '@/lib/site';

const PAGE_LIMIT = 24;

function firstString(value: string | string[] | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

async function getSearchParams(searchParams: Promise<Record<string, string | string[] | undefined>>) {
  const awaited = await searchParams;
  return {
    query: firstString(awaited.query),
    category: firstString(awaited.category),
    platform: firstString(awaited.platform),
    level: firstString(awaited.level),
    sortBy: firstString(awaited.sortBy),
    page: firstString(awaited.page),
  };
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await getSearchParams(searchParams);
  const decision = resolveCoursesIndexing({ baseUrl: siteUrl(), params });

  return {
    title: 'Courses',
    description:
      'Browse verified online course deals and discounts. Filter by category, platform, and level to find the best value courses.',
    alternates: { canonical: decision.canonicalUrl },
    robots: decision.noindex ? { index: false, follow: true } : { index: true, follow: true },
  };
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await getSearchParams(searchParams);

  const parsed = CourseSearchSchema.safeParse({
    query: params.query,
    category: params.category,
    platform: params.platform,
    level: params.level,
    sortBy: params.sortBy ?? 'date',
    sortOrder: 'desc',
    page: params.page ?? '1',
    limit: PAGE_LIMIT,
  });
  const search = parsed.success ? parsed.data : CourseSearchSchema.parse({});

  const [result, platforms, categories] = await Promise.all([
    searchCourses(search),
    getAllPlatforms(),
    getAllCategories(),
  ]);

  const jsonLd = buildItemListSchema(
    result.data.map((course) => ({
      name: course.title,
      url: siteUrl(`/courses/${course.slug}`),
    }))
  );

  const hasActiveFilters = Boolean(search.query || search.category || search.platform || search.level);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Container className="py-10 sm:py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            {hasActiveFilters ? 'Filtered courses' : 'Course deals'}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {result.pagination.total} verified course{result.pagination.total === 1 ? '' : 's'} with active deals
            {hasActiveFilters ? ' matching your filters' : ''}.
          </p>
        </header>

        <form method="get" action="/courses" className="mb-8 flex flex-wrap items-center gap-3">
          <label className="sr-only" htmlFor="query">Search courses</label>
          <input
            id="query"
            type="search"
            name="query"
            defaultValue={search.query}
            placeholder="Search by title, topic, or instructor"
            className="focus-ring w-full max-w-sm rounded-md border border-border bg-card px-4 py-2 text-sm"
          />
          <button type="submit" className="focus-ring rounded-md border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted">
            Search
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <AutoSubmitSelect
              name="category"
              label="Category"
              defaultValue={search.category ?? ''}
              options={categories.map((c) => ({ value: c.slug, label: c.name }))}
            />
            <AutoSubmitSelect
              name="platform"
              label="Platform"
              defaultValue={search.platform ?? ''}
              options={platforms.map((p) => ({ value: p.slug, label: p.name }))}
            />
            <AutoSubmitSelect
              name="level"
              label="Level"
              defaultValue={search.level ?? ''}
              options={[
                { value: 'BEGINNER', label: 'Beginner' },
                { value: 'INTERMEDIATE', label: 'Intermediate' },
                { value: 'ADVANCED', label: 'Advanced' },
                { value: 'ALL_LEVELS', label: 'All levels' },
              ]}
            />
            <AutoSubmitSelect
              name="sortBy"
              label="Sort"
              defaultValue={search.sortBy}
              options={[
                { value: 'date', label: 'Newest' },
                { value: 'rating', label: 'Top rated' },
                { value: 'popular', label: 'Most popular' },
                { value: 'price', label: 'Price' },
                { value: 'discount', label: 'Discount' },
              ]}
            />
          </div>
        </form>

        {result.data.length ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {result.data.map((course) => <CourseCard key={course.id} course={course} />)}
            </div>
            <Pagination page={search.page} totalPages={result.pagination.totalPages} buildHref={(page) => buildPageHref(search, page)} />
          </>
        ) : (
          <EmptyState
            title="No courses match your filters"
            body="Try widening your search, or clear the filters to see all current deals."
          />
        )}
      </Container>
    </>
  );
}

function buildPageHref(search: Record<string, unknown>, page: number): string {
  const params = new URLSearchParams();
  if (search.query) params.set('query', String(search.query));
  if (search.category) params.set('category', String(search.category));
  if (search.platform) params.set('platform', String(search.platform));
  if (search.level) params.set('level', String(search.level));
  if (search.sortBy && search.sortBy !== 'date') params.set('sortBy', String(search.sortBy));
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return qs ? `/courses?${qs}` : '/courses';
}
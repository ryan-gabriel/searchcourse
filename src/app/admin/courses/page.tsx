import type { Metadata } from 'next';
import Link from 'next/link';
import { CourseSearchSchema, type CourseSearchParams } from '@/validations';
import { getAllCategories, getAllPlatforms, searchCourses } from '@/services';
import { buttonClass, LinkButton } from '@/components/button';
import { Pagination } from '@/components/pagination';
import { EmptyState } from '@/components/states';
import { CourseForm } from '@/components/admin/course-form';
import { formatPrice, LEVEL_LABELS } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Courses',
};

const DEFAULT_PARAMS: CourseSearchParams = {
  page: 1,
  limit: 24,
  sortBy: 'date',
  sortOrder: 'desc',
};

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; page?: string }>;
}) {
  const raw = await searchParams;
  const parsed = CourseSearchSchema.safeParse(raw);
  const params: CourseSearchParams = parsed.success ? { ...parsed.data, limit: 24 } : DEFAULT_PARAMS;
  const query = params.query?.trim() || undefined;

  const [result, platforms, categories] = await Promise.all([
    searchCourses({ ...params, query }),
    getAllPlatforms(),
    getAllCategories(),
  ]);

  const { data: rows, pagination } = result;
  const totalWord = pagination.total === 1 ? 'course' : 'courses';

  const buildPageHref = (page: number) => {
    const sp = new URLSearchParams();
    if (query) sp.set('query', query);
    sp.set('page', String(page));
    return `/admin/courses?${sp.toString()}`;
  };

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {pagination.total} {totalWord}
        {query ? <> matching {`"${query}"`}</> : null}
      </p>

      <form method="get" action="/admin/courses" className="mt-6 flex flex-wrap items-end gap-3">
        <div className="min-w-64 flex-1">
          <label htmlFor="course-search" className="mb-1 block text-sm font-medium">
            Search courses
          </label>
          <input
            id="course-search"
            type="search"
            name="query"
            defaultValue={query ?? ''}
            placeholder="Title, instructor, or description"
            className="focus-ring w-full rounded-md border border-border bg-card px-4 py-2 text-sm"
          />
        </div>
        <button type="submit" className={buttonClass('secondary')}>
          Search
        </button>
        {query ? (
          <LinkButton href="/admin/courses" variant="ghost">
            Clear
          </LinkButton>
        ) : null}
      </form>

      {rows.length > 0 ? (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                  Title
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                  Platform
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                  Price
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                  Rating
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                  Level
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                  Active
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                  Featured
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((course) => (
                <tr key={course.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/courses/${course.id}`} className="focus-ring font-medium hover:underline">
                      {course.title}
                    </Link>
                    <span className="block text-xs text-muted-foreground">{course.slug}</span>
                  </td>
                  <td className="px-4 py-3">{course.platform.name}</td>
                  <td className="px-4 py-3">
                    {course.activeCoupon ? (
                      <>
                        {formatPrice(course.activeCoupon.finalPrice, course.currency)}
                        <span className="ml-1 text-xs text-muted-foreground line-through">
                          {formatPrice(course.originalPrice, course.currency)}
                        </span>
                      </>
                    ) : (
                      formatPrice(course.originalPrice, course.currency)
                    )}
                  </td>
                  <td className="px-4 py-3">{course.rating != null ? Number(course.rating).toFixed(1) : 'N/A'}</td>
                  <td className="px-4 py-3">{LEVEL_LABELS[course.level] ?? course.level}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-sm bg-muted px-2 py-0.5 text-xs">{course.isActive ? 'Yes' : 'No'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-sm bg-muted px-2 py-0.5 text-xs">{course.isFeatured ? 'Yes' : 'No'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState
            title={query ? 'No courses match your search' : 'No courses yet'}
            body={query ? 'Try different keywords or clear the search.' : 'Add your first course with the form below.'}
          />
        </div>
      )}

      <Pagination page={pagination.page} totalPages={pagination.totalPages} buildHref={buildPageHref} />

      <section className="mt-10" aria-labelledby="add-course-heading">
        <h2 id="add-course-heading" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Add a course
        </h2>
        <div className="mt-3">
          <CourseForm platforms={platforms} categories={categories} />
        </div>
      </section>
    </>
  );
}
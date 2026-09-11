import type { Metadata } from 'next';
import { buttonClass } from '@/components/button';
import { EmptyState } from '@/components/states';
import { CategoryManager, type CategoryRow } from '@/components/admin/category-manager';
import { searchCategories } from '@/services';
import { CategorySearchSchema } from '@/validations';

export const metadata: Metadata = { title: 'Categories' };

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; page?: string }>;
}) {
  const awaited = await searchParams;
  const parsed = CategorySearchSchema.safeParse({
    query: awaited.query || undefined,
    page: awaited.page || undefined,
  });
  const search = parsed.success ? parsed.data : CategorySearchSchema.parse({});

  const result = await searchCategories(search);

  const rows: CategoryRow[] = result.data.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    iconName: category.iconName,
    sortOrder: category.sortOrder,
    courseCount: category._count.courses,
  }));

  const buildHref = (page: number) => categoriesHref(page, search.query);

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {result.pagination.total} categor{result.pagination.total === 1 ? 'y' : 'ies'}
      </p>

      <form method="get" className="mt-6 flex flex-wrap items-center gap-3">
        <label className="sr-only" htmlFor="query">Search categories</label>
        <input
          id="query"
          type="search"
          name="query"
          defaultValue={search.query}
          placeholder="Search by name"
          className="focus-ring w-full max-w-sm rounded-md border border-border bg-card px-4 py-2 text-sm"
        />
        <button type="submit" className={buttonClass('secondary')}>Search</button>
      </form>

      {rows.length ? (
        <CategoryManager
          rows={rows}
          page={search.page}
          totalPages={result.pagination.totalPages}
          buildHref={buildHref}
        />
      ) : (
        <>
          <EmptyState
            title="No categories found"
            body="Nothing matches this search. Add a new category below, or clear the query."
          />
          <CategoryManager
            rows={rows}
            page={search.page}
            totalPages={result.pagination.totalPages}
            buildHref={buildHref}
          />
        </>
      )}
    </>
  );
}

function categoriesHref(page: number, query?: string): string {
  const params = new URLSearchParams();
  if (query) params.set('query', query);
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return qs ? `/admin/categories?${qs}` : '/admin/categories';
}
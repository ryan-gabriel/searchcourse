import type { Metadata } from 'next';
import { buttonClass } from '@/components/button';
import { EmptyState } from '@/components/states';
import { PlatformManager, type PlatformRow } from '@/components/admin/platform-manager';
import { searchPlatforms } from '@/services';
import { PlatformSearchSchema } from '@/validations';

export const metadata: Metadata = { title: 'Platforms' };

export default async function PlatformsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; page?: string }>;
}) {
  const awaited = await searchParams;
  const parsed = PlatformSearchSchema.safeParse({
    query: awaited.query || undefined,
    page: awaited.page || undefined,
  });
  const search = parsed.success ? parsed.data : PlatformSearchSchema.parse({});

  const result = await searchPlatforms(search);

  const rows: PlatformRow[] = result.data.map((platform) => ({
    id: platform.id,
    name: platform.name,
    slug: platform.slug,
    logoUrl: platform.logoUrl,
    baseUrl: platform.baseUrl,
    isActive: platform.isActive,
    courseCount: platform._count.courses,
  }));

  const buildHref = (page: number) => platformsHref(page, search.query);

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Platforms</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {result.pagination.total} platform{result.pagination.total === 1 ? '' : 's'}
      </p>

      <form method="get" className="mt-6 flex flex-wrap items-center gap-3">
        <label className="sr-only" htmlFor="query">Search platforms</label>
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
        <PlatformManager
          rows={rows}
          page={search.page}
          totalPages={result.pagination.totalPages}
          buildHref={buildHref}
        />
      ) : (
        <>
          <EmptyState
            title="No platforms found"
            body="Nothing matches this search. Add a new platform below, or clear the query."
          />
          <PlatformManager
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

function platformsHref(page: number, query?: string): string {
  const params = new URLSearchParams();
  if (query) params.set('query', query);
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return qs ? `/admin/platforms?${qs}` : '/admin/platforms';
}
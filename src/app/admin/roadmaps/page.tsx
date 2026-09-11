import type { Metadata } from 'next';
import Link from 'next/link';
import { RoadmapForm } from '@/components/admin/roadmap-form';
import { Pagination } from '@/components/pagination';
import { buttonClass } from '@/components/button';
import { EmptyState } from '@/components/states';
import { LEVEL_LABELS } from '@/lib/format';
import { searchRoadmaps } from '@/services';
import { RoadmapSearchSchema } from '@/validations';

export const metadata: Metadata = { title: 'Roadmaps' };

export default async function AdminRoadmapsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; page?: string; limit?: string }>;
}) {
  const raw = await searchParams;

  const params = RoadmapSearchSchema.parse({
    query: raw.query || undefined,
    page: raw.page || 1,
    limit: raw.limit || 20,
  });

  const result = await searchRoadmaps(params);

  function buildHref(page: number) {
    const sp = new URLSearchParams();
    if (raw.query) sp.set('query', raw.query);
    if (page > 1) sp.set('page', String(page));
    const qs = sp.toString();
    return qs ? `/admin/roadmaps?${qs}` : '/admin/roadmaps';
  }

  return (
    <>
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Roadmaps</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {result.pagination.total} roadmap{result.pagination.total === 1 ? '' : 's'}
        </p>
      </header>

      <form method="get" action="/admin/roadmaps" className="mt-8 flex gap-2">
        <input
          type="search"
          name="query"
          defaultValue={raw.query ?? ''}
          placeholder="Search by title or description"
          className="w-full max-w-sm rounded-md border border-border bg-card px-4 py-2 text-sm focus-ring"
        />
        <button type="submit" className={buttonClass('secondary')}>
          Search
        </button>
      </form>

      {result.data.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No roadmaps found"
            body="Try a different search, or add a new roadmap below."
          />
        </div>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-md border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Title
                  </th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Courses
                  </th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Level
                  </th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Featured
                  </th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Active
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((roadmap) => (
                  <tr key={roadmap.id} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/roadmaps/${roadmap.id}/steps`}
                        className="focus-ring rounded-sm font-medium hover:underline"
                      >
                        {roadmap.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">{roadmap.slug}</p>
                    </td>
                    <td className="px-4 py-3">{roadmap.courseCount}</td>
                    <td className="px-4 py-3">{LEVEL_LABELS[roadmap.level] ?? roadmap.level}</td>
                    <td className="px-4 py-3">
                      {roadmap.isFeatured ? (
                        <span className="rounded-sm bg-muted px-2 py-0.5 text-xs">Featured</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {roadmap.isActive ? (
                        <span className="rounded-sm bg-muted px-2 py-0.5 text-xs">Active</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={params.page}
            totalPages={result.pagination.totalPages}
            buildHref={buildHref}
          />
        </>
      )}

      <section className="mt-12">
        <h2 className="text-2xl font-semibold tracking-tight">Add a roadmap</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new learning path. Steps are added after it exists.
        </p>
        <div className="mt-6 max-w-3xl">
          <RoadmapForm />
        </div>
      </section>
    </>
  );
}
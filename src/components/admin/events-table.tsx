'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { buttonClass } from '@/components/button';
import { EmptyState } from '@/components/states';
import { formatCount, formatDate } from '@/lib/format';

const LIMIT = 20;

interface ClickEvent {
  id: string;
  course: { id: string; title: string; slug: string };
  source: string;
  country: string | null;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface EventsResponse {
  data: ClickEvent[];
  pagination: PaginationInfo;
}

export function EventsTable() {
  const [page, setPage] = useState(1);
  const [events, setEvents] = useState<ClickEvent[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/analytics/events?page=${page}&limit=${LIMIT}`);
        const body = (await res.json()) as EventsResponse & { message?: string };
        if (!res.ok) throw new Error(body.message || 'Failed to load events');
        if (!cancelled) {
          setEvents(body.data);
          setPagination(body.pagination);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load events');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page]);

  if (error) {
    return (
      <div role="alert" className="rounded-lg border border-border bg-card px-5 py-8 text-center">
        <p className="text-sm font-medium text-destructive">{error}</p>
      </div>
    );
  }

  if (!loading && events.length === 0) {
    return <EmptyState title="No clicks recorded yet." body="Affiliate clicks will appear here as courses are shared." />;
  }

  return (
    <div className="rounded-lg border border-border bg-card" aria-busy={loading}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="px-5 py-2 font-medium text-muted-foreground">
                Course
              </th>
              <th scope="col" className="px-5 py-2 font-medium text-muted-foreground">
                Source
              </th>
              <th scope="col" className="px-5 py-2 font-medium text-muted-foreground">
                Country
              </th>
              <th scope="col" className="px-5 py-2 font-medium text-muted-foreground">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && events.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td colSpan={4} className="px-5 py-3">
                    <div className="h-4 w-2/3 rounded bg-muted" />
                  </td>
                </tr>
              ))
            ) : (
              events.map((event) => (
                <tr key={event.id} className="border-b border-border">
                  <td className="px-5 py-2">
                    <Link href={`/courses/${event.course.slug}`} className="focus-ring font-medium hover:underline">
                      {event.course.title}
                    </Link>
                  </td>
                  <td className="px-5 py-2">{event.source.toLowerCase()}</td>
                  <td className="px-5 py-2">{event.country || 'Unknown'}</td>
                  <td className="px-5 py-2">{formatDate(event.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3">
        <p className="text-sm text-muted-foreground">
          {loading ? 'Loading events…' : pagination ? `${formatCount(pagination.total)} total` : ''}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={!pagination || !pagination.hasPrev || loading}
            className={buttonClass('secondary', 'disabled:cursor-not-allowed disabled:opacity-60')}
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={!pagination || !pagination.hasNext || loading}
            className={buttonClass('secondary', 'disabled:cursor-not-allowed disabled:opacity-60')}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
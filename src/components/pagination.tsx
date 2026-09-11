import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const pages = pageWindow(page, totalPages);

  return (
    <nav className="mt-10 flex items-center justify-center gap-1" aria-label="Pagination">
      {page > 1 ? (
        <Link href={buildHref(page - 1)} className="focus-ring inline-flex items-center gap-1 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Previous
        </Link>
      ) : null}

      <span className="px-1 text-sm text-muted-foreground hidden sm:inline">
        {pages.map((p) =>
          p === page ? (
            <span
              key={p}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-accent font-medium text-accent-foreground"
              aria-current="page"
            >
              {p}
            </span>
          ) : (
            <Link
              key={p}
              href={buildHref(p)}
              className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-muted"
            >
              {p}
            </Link>
          )
        )}
      </span>

      <span className="sm:hidden text-sm text-muted-foreground px-2">
        Page {page} of {totalPages}
      </span>

      {page < totalPages ? (
        <Link href={buildHref(page + 1)} className="focus-ring inline-flex items-center gap-1 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted">
          Next
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : null}
    </nav>
  );
}

function pageWindow(page: number, totalPages: number): number[] {
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
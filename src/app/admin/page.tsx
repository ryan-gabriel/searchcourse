import Link from 'next/link';
import { getDashboardStats } from '@/services';
import { formatCount } from '@/lib/format';

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    { label: 'Active courses', value: formatCount(stats.courses.active), sub: `${formatCount(stats.courses.total)} total · ${stats.courses.featured} featured` },
    { label: 'Active coupons', value: formatCount(stats.coupons.active), sub: `${formatCount(stats.coupons.total)} total · ${stats.coupons.expiringSoon} expiring soon` },
    { label: 'Roadmaps', value: formatCount(stats.roadmaps.active), sub: `${formatCount(stats.roadmaps.total)} total` },
    { label: 'Platforms & categories', value: formatCount(stats.platforms), sub: `${formatCount(stats.categories)} categories` },
  ];

  const clickCards = [
    { label: 'Clicks today', value: formatCount(stats.clicks.today) },
    { label: 'This week', value: formatCount(stats.clicks.thisWeek) },
    { label: 'This month', value: formatCount(stats.clicks.thisMonth) },
    { label: 'All time', value: formatCount(stats.clicks.total) },
  ];

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Overall health of the catalog and affiliate clicks.</p>
      </header>

      <section aria-labelledby="catalog-title">
        <h2 id="catalog-title" className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Catalog</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="rounded-lg border border-border bg-card p-5">
              <dt className="text-sm text-muted-foreground">{card.label}</dt>
              <dd className="mt-1 text-3xl font-bold tracking-tight">{card.value}</dd>
              <p className="mt-2 text-xs text-muted-foreground">{card.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="clicks-title" className="mt-8">
        <h2 id="clicks-title" className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Affiliate clicks</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {clickCards.map((card) => (
            <div key={card.label} className="rounded-lg border border-border bg-card p-5">
              <dt className="text-sm text-muted-foreground">{card.label}</dt>
              <dd className="mt-1 text-3xl font-bold tracking-tight">{card.value}</dd>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="recent-title" className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="recent-title" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Recent clicks</h2>
          <Link href="/admin/analytics" className="focus-ring text-sm font-medium hover:underline">
            View analytics
          </Link>
        </div>

        {stats.recentClicks.length ? (
          <ul className="overflow-hidden rounded-lg border border-border">
            {stats.recentClicks.map((click) => (
              <li key={click.id} className="flex items-center justify-between gap-4 border-b border-border bg-card px-5 py-3 text-sm last:border-b-0">
                <Link href={`/courses/${click.course.slug}`} className="focus-ring truncate font-medium hover:underline">
                  {click.course.title}
                </Link>
                <span className="shrink-0 text-muted-foreground">
                  {click.source || 'web'} · {new Date(click.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No clicks recorded yet.
          </p>
        )}
      </section>
    </div>
  );
}
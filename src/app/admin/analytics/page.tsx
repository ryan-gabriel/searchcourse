import type { Metadata } from 'next';
import { EventsTable } from '@/components/admin/events-table';
import { RangeSelect } from '@/components/admin/range-select';
import { formatCount, formatDate } from '@/lib/format';
import { getClickAnalytics } from '@/services';

export const metadata: Metadata = {
  title: 'Analytics',
};

const RANGE_TO_DAYS: Record<string, number | undefined> = {
  '1d': 1,
  '7d': 7,
  '30d': 30,
};

function formatSource(source: string): string {
  return source.toLowerCase();
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const selectedRange = range === '1d' || range === '7d' || range === '30d' ? range : '';
  const days = RANGE_TO_DAYS[selectedRange];

  const analytics = await getClickAnalytics(days);

  const daysIncluded = selectedRange === '1d' ? '1' : selectedRange === '7d' ? '7' : selectedRange === '30d' ? '30' : 'All';

  const statCards = [
    { label: 'Clicks', value: formatCount(analytics.totalClicks) },
    { label: 'Today', value: formatCount(analytics.todayClicks) },
    { label: 'This week', value: formatCount(analytics.weekClicks) },
    { label: 'Days included', value: daysIncluded },
  ];

  const topCourses = analytics.topCourses.slice(0, 5);

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
      <p className="mt-1 text-sm text-muted-foreground">Affiliate click tracking</p>

      <div className="mt-8 space-y-8">
        <RangeSelect defaultValue={selectedRange} />

        <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <div key={card.label} className="rounded-lg border border-border bg-card p-5">
              <dt className="text-sm text-muted-foreground">{card.label}</dt>
              <dd className="mt-1 text-3xl font-bold tracking-tight">{card.value}</dd>
            </div>
          ))}
        </dl>

        <section aria-labelledby="daily-trend">
          <h2 id="daily-trend" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Daily trend
          </h2>
          {analytics.dailyClicks.length ? (
            <ul className="mt-3 rounded-lg border border-border bg-card px-5">
              {analytics.dailyClicks.map(({ date, count }) => (
                <li
                  key={date}
                  className="flex items-center justify-between gap-4 border-b border-border py-2 text-sm last:border-b-0"
                >
                  <span className="font-medium">{formatDate(`${date}T00:00:00`)}</span>
                  <span>{formatCount(count)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 rounded-lg border border-border bg-card px-5 py-8 text-sm text-muted-foreground">
              No clicks in this period.
            </p>
          )}
        </section>

        <section aria-labelledby="top-courses">
          <h2 id="top-courses" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Top courses
          </h2>
          {topCourses.length ? (
            <ul className="mt-3 rounded-lg border border-border bg-card px-5">
              {topCourses.map(({ courseId, title, clicks }) => (
                <li
                  key={courseId}
                  className="flex items-center justify-between gap-4 border-b border-border py-2 text-sm last:border-b-0"
                >
                  <span className="font-medium">{title}</span>
                  <span>{formatCount(clicks)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 rounded-lg border border-border bg-card px-5 py-8 text-sm text-muted-foreground">
              No clicks in this period.
            </p>
          )}
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <section aria-labelledby="source-breakdown" className="rounded-lg border border-border bg-card p-5">
            <h2 id="source-breakdown" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Source
            </h2>
            {analytics.sourceBreakdown.length ? (
              <ul className="mt-2">
                {analytics.sourceBreakdown.map(({ source, count }) => (
                  <li
                    key={source}
                    className="flex items-center justify-between gap-4 border-b border-border py-2 text-sm last:border-b-0"
                  >
                    <span className="font-medium">{formatSource(source)}</span>
                    <span>{formatCount(count)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-2 text-sm text-muted-foreground">No clicks in this period.</p>
            )}
          </section>

          <section aria-labelledby="country-breakdown" className="rounded-lg border border-border bg-card p-5">
            <h2 id="country-breakdown" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Country
            </h2>
            {analytics.countryBreakdown.length ? (
              <ul className="mt-2">
                {analytics.countryBreakdown.map(({ country, count }) => (
                  <li
                    key={country}
                    className="flex items-center justify-between gap-4 border-b border-border py-2 text-sm last:border-b-0"
                  >
                    <span className="font-medium">{country || 'Unknown'}</span>
                    <span>{formatCount(count)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-2 text-sm text-muted-foreground">No clicks in this period.</p>
            )}
          </section>
        </div>

        <section aria-labelledby="recent-events">
          <h2 id="recent-events" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Recent events
          </h2>
          <div className="mt-3">
            <EventsTable />
          </div>
        </section>
      </div>
    </>
  );
}
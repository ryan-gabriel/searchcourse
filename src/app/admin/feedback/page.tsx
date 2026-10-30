import type { Metadata } from 'next';
import { buttonClass } from '@/components/button';
import { EmptyState } from '@/components/states';
import { Pagination } from '@/components/pagination';
import { formatDate } from '@/lib/format';
import { searchFeedback } from '@/services';
import { FeedbackSearchSchema } from '@/validations';

export const metadata: Metadata = { title: 'Feedback' };

const TYPE_LABELS: Record<string, string> = {
  REVIEW: 'Review',
  SUGGESTION: 'Suggestion',
};

const SOURCE_LABELS: Record<string, string> = {
  WEB: 'Website',
  TELEGRAM: 'Telegram',
};

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; source?: string; page?: string }>;
}) {
  const awaited = await searchParams;

  const parsed = FeedbackSearchSchema.safeParse({
    type: awaited.type || undefined,
    source: awaited.source || undefined,
    page: awaited.page || undefined,
  });
  const search = parsed.success ? parsed.data : FeedbackSearchSchema.parse({});

  const result = await searchFeedback(search);

  const buildHref = (page: number) => feedbackHref(page, search.type, search.source);

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Feedback</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {result.pagination.total} message{result.pagination.total === 1 ? '' : 's'} from the website and Telegram
      </p>

      <form method="get" className="mt-6 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="type" className="mb-1 block text-sm font-medium">Type</label>
          <select
            id="type"
            name="type"
            defaultValue={search.type ?? ''}
            className="focus-ring w-auto rounded-md border border-border bg-card px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="REVIEW">Reviews</option>
            <option value="SUGGESTION">Suggestions</option>
          </select>
        </div>
        <div>
          <label htmlFor="source" className="mb-1 block text-sm font-medium">Source</label>
          <select
            id="source"
            name="source"
            defaultValue={search.source ?? ''}
            className="focus-ring w-auto rounded-md border border-border bg-card px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="WEB">Website</option>
            <option value="TELEGRAM">Telegram</option>
          </select>
        </div>
        <button type="submit" className={buttonClass('secondary')}>Apply</button>
      </form>

      {result.data.length ? (
        <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="px-5 py-3 font-medium text-muted-foreground">Date</th>
                  <th scope="col" className="px-5 py-3 font-medium text-muted-foreground">Type</th>
                  <th scope="col" className="px-5 py-3 font-medium text-muted-foreground">Source</th>
                  <th scope="col" className="px-5 py-3 font-medium text-muted-foreground">From</th>
                  <th scope="col" className="px-5 py-3 font-medium text-muted-foreground">Message</th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((item) => (
                  <tr key={item.id} className="border-b border-border align-top last:border-b-0">
                    <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          item.type === 'REVIEW'
                            ? 'bg-accent/10 text-accent'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {TYPE_LABELS[item.type] ?? item.type}
                      </span>
                    </td>
                    <td className="px-5 py-3">{SOURCE_LABELS[item.source] ?? item.source}</td>
                    <td className="px-5 py-3">
                      <div className="space-y-1">
                        <p className="font-medium">{item.name || 'Anonymous'}</p>
                        {item.email ? (
                          <a href={`mailto:${item.email}`} className="focus-ring block text-xs text-muted-foreground hover:underline">
                            {item.email}
                          </a>
                        ) : null}
                        {item.telegramUsername ? (
                          <a
                            href={`https://t.me/${item.telegramUsername}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="focus-ring block text-xs text-muted-foreground hover:underline"
                          >
                            @{item.telegramUsername}
                          </a>
                        ) : item.source === 'TELEGRAM' && item.telegramUserId ? (
                          <span className="block text-xs text-muted-foreground">ID {item.telegramUserId}</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="max-w-xl whitespace-pre-wrap break-words">{item.message}</p>
                      {item.pageUrl ? (
                        <p className="mt-1 text-xs text-muted-foreground">Sent from {item.pageUrl}</p>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState
            title="No feedback yet"
            body="Reviews and suggestions sent from the website or Telegram will appear here."
          />
        </div>
      )}

      <Pagination page={search.page} totalPages={result.pagination.totalPages} buildHref={buildHref} />
    </>
  );
}

function feedbackHref(page: number, type?: string, source?: string): string {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  if (source) params.set('source', source);
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return qs ? `/admin/feedback?${qs}` : '/admin/feedback';
}

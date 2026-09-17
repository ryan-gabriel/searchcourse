import Link from 'next/link';

export interface TickerDeal {
  label: string;
  price: string;
  href: string;
}

function TickerRow({ deals, ariaHidden }: { deals: TickerDeal[]; ariaHidden?: boolean }) {
  return (
    <ul className="flex shrink-0 items-center gap-10 px-5" aria-hidden={ariaHidden}>
      {deals.map((deal, i) => (
        <li key={`${deal.href}-${i}`} className="flex shrink-0 items-center gap-2.5 whitespace-nowrap text-sm">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-secondary-foreground/50" />
          <Link
            href={deal.href}
            tabIndex={ariaHidden ? -1 : undefined}
            className="rounded-sm font-medium text-secondary-foreground transition-opacity hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-foreground"
          >
            {deal.label}
          </Link>
          <span className="tnum font-semibold text-secondary-foreground">{deal.price}</span>
        </li>
      ))}
    </ul>
  );
}

export function DealTicker({ deals }: { deals: TickerDeal[] }) {
  if (!deals.length) return null;

  return (
    <section
      className="overflow-hidden border-y border-secondary/40 bg-accent py-2.5"
      aria-label="Live verified deals"
    >
      <div className="ticker-track flex w-max">
        <TickerRow deals={deals} />
        <TickerRow deals={deals} ariaHidden />
      </div>
    </section>
  );
}

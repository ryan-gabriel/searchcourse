import { Send } from 'lucide-react';
import { Container } from './container';
import { buttonClass } from './button';
import { TELEGRAM_URL } from '@/lib/site';

interface Props {
  variant?: 'banner' | 'inline';
  source?: string;
}

export function TelegramCTA({ variant = 'banner', source = 'web' }: Props) {
  const href = `${TELEGRAM_URL}?src=${encodeURIComponent(source)}`;

  if (variant === 'inline') {
    return (
      <div className="mt-4 rounded-lg border border-border bg-card p-4">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
          <Send className="h-4 w-4 text-accent" aria-hidden="true" />
          Get deals like this daily
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Verified free &amp; discounted course coupons, posted every day. No spam.
        </p>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass('primary', 'mt-3 w-full')}
        >
          Join the channel
        </a>
      </div>
    );
  }

  return (
    <section aria-label="Telegram channel" className="border-t border-secondary/20 bg-secondary">
      <Container className="flex flex-col items-start gap-3 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 font-semibold text-secondary-foreground">
            <Send className="h-4 w-4" aria-hidden="true" />
            Get free &amp; discounted course deals daily
          </p>
          <p className="mt-1 text-sm text-secondary-foreground/75">
            Verified coupons posted to Telegram every day. No spam.
          </p>
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass('primary', 'shrink-0')}
        >
          Join the channel
        </a>
      </Container>
    </section>
  );
}
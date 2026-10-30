import type { Metadata } from 'next';
import Link from 'next/link';
import { Send } from 'lucide-react';
import { Container } from '@/components/container';
import { FeedbackForm } from '@/components/feedback-form';
import { buttonClass } from '@/components/button';
import { siteUrl, TELEGRAM_BOT_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Reviews & suggestions',
  description:
    'Share a review or suggestion about SearchCourse. Send it from the website or message our Telegram bot — every message is read by the team.',
  alternates: { canonical: siteUrl('/feedback') },
};

export default function FeedbackPage() {
  return (
    <Container className="py-10 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Reviews &amp; suggestions
        </h1>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Found a broken coupon, a deal we missed, or something on the site that could work better? Tell us.
          Reviews and suggestions go straight to the team.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl items-start gap-8 lg:grid-cols-[1fr_340px]">
        <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
          <FeedbackForm />
        </div>

        <aside className="space-y-4">
          {TELEGRAM_BOT_URL ? (
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="inline-flex items-center gap-2 font-semibold">
                <Send className="h-4 w-4 text-accent" aria-hidden="true" />
                Prefer Telegram?
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Message our bot directly. It reads every message and files it with the team.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">/review your review</code>
                </li>
                <li>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">/suggest your idea</code>
                </li>
                <li>Or just send a plain message — we treat it as a suggestion.</li>
              </ul>
              <a
                href={TELEGRAM_BOT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass('ink', 'mt-5 w-full')}
              >
                Message the bot
              </a>
            </div>
          ) : null}

          <div className="rounded-lg border border-border bg-card p-6">
            <p className="font-semibold">What happens next?</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Messages are stored privately for the team to review. We do not publish them, and we never
              sell your contact details. See the{' '}
              <Link href="/privacy" className="focus-ring rounded-sm underline underline-offset-2 hover:text-foreground">
                privacy policy
              </Link>
              .
            </p>
          </div>
        </aside>
      </div>
    </Container>
  );
}

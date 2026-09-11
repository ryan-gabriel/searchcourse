import type { Metadata } from 'next';
import { Container } from '@/components/container';
import { getAboutPageStats, getMissionContent } from '@/services';
import { siteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About',
  description:
    'SearchCourse finds and verifies the best online course deals so you can skip the noise, buy smart, and keep learning without overpaying.',
  alternates: { canonical: siteUrl('/about') },
};

export default async function AboutPage() {
  const [stats, mission] = await Promise.all([getAboutPageStats(), getMissionContent()]);

  const statItems = [
    { label: 'Courses verified', value: stats.coursesVerified },
    { label: 'Student savings', value: stats.studentSavings },
    { label: 'Price monitoring', value: stats.priceMonitoring },
  ].filter((item) => item.value);

  return (
    <Container className="py-10 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {mission.title || 'About SearchCourse'}
        </h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          {mission.description ||
            'Online courses are genuinely great at what they do — until it comes to pricing. "Deals" are rarely actual deals, prices change daily, and there is almost no independent source to tell you whether the offer in front of you is good.'}
        </p>

        <p className="mt-4 leading-relaxed text-muted-foreground">
          SearchCourse is that source. We scrape coupons from across the web, verify them automatically, and publish
          clearly-dated proof of the prices we found. When you see a deal here, you know exactly when we checked it and
          exactly how much it costs — not what the marketing page claims.
        </p>

        {statItems.length ? (
          <dl className="mt-10 grid gap-4 sm:grid-cols-3">
            {statItems.map((item) => (
              <div key={item.label} className="rounded-lg border border-border bg-card p-5 text-center">
                <dt className="text-sm text-muted-foreground">{item.label}</dt>
                <dd className="mt-1 text-2xl font-bold tracking-tight">{item.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        <h2 className="mt-12 text-2xl font-semibold tracking-tight">How it works</h2>
        <ol className="mt-5 space-y-4">
          {[
            'We scan coupon sources and course platforms around the clock.',
            'Every deal is validated automatically — expired or bogus coupons never make it to the page.',
            'We record the discovery date so you can judge how fresh an offer is.',
            'If you buy through one of our links, we may earn a commission at no extra cost to you — that is what keeps the verification running.',
          ].map((step, index) => (
            <li key={step} className="grid gap-3 sm:grid-cols-[auto_1fr] sm:gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold" aria-hidden="true">
                {index + 1}
              </span>
              <p className="leading-relaxed text-muted-foreground">{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </Container>
  );
}
import type { Metadata } from 'next';
import { Container } from '@/components/container';
import { ContextImage } from '@/components/context-image';
import { Reveal } from '@/components/reveal';
import { getAboutPageStats, getMissionContent } from '@/services';
import { siteUrl } from '@/lib/site';

const ABOUT_IMAGE =
  'https://images.unsplash.com/photo-1499750310159-5b5b4d1ea2c9?q=80&w=1200&auto=format&fit=crop';

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
      <div className="grid items-start gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {mission.title || 'About SearchCourse'}
          </h1>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            {mission.description ||
              'Online courses are genuinely great at what they do, until it comes to pricing. "Deals" are rarely actual deals, prices change daily, and there is almost no independent source to tell you whether the offer in front of you is good.'}
          </p>

          <p className="mt-4 leading-relaxed text-muted-foreground">
            SearchCourse is that source. We scrape coupons from across the web, verify them automatically, and publish
            clearly-dated proof of the prices we found. When you see a deal here, you know exactly when we checked it and
            exactly how much it costs, not what the marketing page claims.
          </p>

          {statItems.length ? (
            <dl className="mt-10 grid gap-4 sm:grid-cols-3">
              {statItems.map((item, i) => (
                <Reveal key={item.label} delay={i * 70}>
                  <div className="rounded-lg border border-border bg-card p-5 text-center">
                    <dt className="text-sm text-muted-foreground">{item.label}</dt>
                    <dd className="tnum mt-1 text-2xl font-bold tracking-tight">{item.value}</dd>
                  </div>
                </Reveal>
              ))}
            </dl>
          ) : null}
        </div>

        <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-border">
          <ContextImage
            src={ABOUT_IMAGE}
            alt="A desk with a laptop, notebook, and coffee, set up for an online study session"
            sizes="(min-width: 1024px) 380px, 90vw"
          />
        </div>
      </div>

      <div className="mt-16 max-w-3xl">
        <h2 className="font-display text-2xl font-semibold tracking-tight">How it works</h2>
        <ol className="mt-6 divide-y divide-border border-y border-border">
          {[
            'We scan coupon sources and course platforms around the clock.',
            'Every deal is validated automatically: expired or bogus coupons never make it to the page.',
            'We record the discovery date so you can judge how fresh an offer is.',
            'If you buy through one of our links, we may earn a commission at no extra cost to you. That is what keeps the verification running.',
          ].map((step, index) => (
            <li key={step} className="grid gap-x-6 gap-y-1 py-5 sm:grid-cols-[3rem_1fr]">
              <span aria-hidden="true" className="tnum font-display text-2xl font-semibold text-accent">
                {String(index + 1).padStart(2, '0')}
              </span>
              <p className="leading-relaxed text-muted-foreground">{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </Container>
  );
}

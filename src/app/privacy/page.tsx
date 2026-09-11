import type { Metadata } from 'next';
import { Container } from '@/components/container';
import { siteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How SearchCourse handles your data: the minimal analytics we collect through our course links and what we never sell.',
  alternates: { canonical: siteUrl('/privacy') },
};

export default function PrivacyPage() {
  return (
    <Container className="py-10 sm:py-14">
      <article className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: September 2026</p>

        <div className="prose mt-8 space-y-6 leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">What we collect</h2>
            <p>
              SearchCourse does not require an account and does not collect personal information from visitors. The only
              identifiers we process are anonymous click counters on outbound course links, used to measure which deals
              readers find useful.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Click tracking</h2>
            <p>
              When you follow a &ldquo;Get this deal&rdquo; link, we record the course, the referral source, the date,
              and an approximate country derived from your IP address. This data is aggregate analytics — it cannot be
              tied back to you as an individual.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Affiliate disclosure</h2>
            <p>
              Some course links are affiliate links. If you make a purchase through one, the platform may pay us a
              commission. This never changes the price you pay, and we prioritize verified deals regardless of
              commission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Cookies</h2>
            <p>
              The third-party platforms we link to may set their own cookies when you visit them. We have no access to
              or control over those cookies and recommend reviewing their privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Your rights</h2>
            <p>
              You may request deletion or a copy of any data attributable to you by contacting us. Because we store no
              identifying information, in most cases there is nothing attributable to a single individual.
            </p>
          </section>
        </div>
      </article>
    </Container>
  );
}
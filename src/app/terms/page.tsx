import type { Metadata } from 'next';
import { Container } from '@/components/container';
import { siteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'The terms governing your use of SearchCourse, including our affiliate disclosure and how deal information is presented.',
  alternates: { canonical: siteUrl('/terms') },
};

export default function TermsPage() {
  return (
    <Container className="py-10 sm:py-14">
      <article className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Terms of Service</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: September 2026</p>

        <div className="mt-8 space-y-6 leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">The service</h2>
            <p>
              SearchCourse aggregates and verifies discount offers for online courses. We publish the prices we observed
              on a given date, along with evidence of when that price was recorded.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">No guarantee of price or availability</h2>
            <p>
              Deal information is provided &ldquo;as is&rdquo; and can change at any time. Course platforms control their
              own pricing and may end, alter, or relabel a promotion without notice. We do the verification we can, but
              we make no warranty that any deal will still be available when you visit.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Affiliate relationships</h2>
            <p>
              Some links on SearchCourse are affiliate links. We may earn a commission from qualifying purchases. This
              does not affect the price you pay, and it does not determine which courses appear on the site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Your purchases</h2>
            <p>
              All course purchases are made on the course platform&apos;s own website and are governed by that
              platform&apos;s terms, refund policy, and license agreement — not by SearchCourse.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Content and trademarks</h2>
            <p>
              Course names, logos, and descriptions belong to their respective owners and are used solely to identify
              the courses we feature. All other content on SearchCourse is ours and may not be reproduced without
              permission.
            </p>
          </section>
        </div>
      </article>
    </Container>
  );
}
import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/container';
import { SectionRule } from '@/components/section-rule';
import { CourseCard } from '@/components/course-card';
import { CourseThumb } from '@/components/course-thumb';
import { ContextImage } from '@/components/context-image';
import { DealTicker, type TickerDeal } from '@/components/ticker';
import { CountUp } from '@/components/count-up';
import { Reveal } from '@/components/reveal';
import { RoadmapMeta } from '@/components/roadmap-meta';
import { LinkButton } from '@/components/button';
import { EmptyState } from '@/components/states';
import { JsonLd } from '@/components/json-ld';
import { getFeaturedCourses, getTopDiscountCourses, getFeaturedRoadmaps, getHomepageStats } from '@/services';
import { buildWebSiteSchema, buildOrganizationSchema } from '@/lib/seo/schema';
import { formatPrice } from '@/lib/format';
import { SITE_NAME, siteUrl } from '@/lib/site';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1400&auto=format&fit=crop';

export const metadata: Metadata = {
  title: { absolute: SITE_NAME },
  description:
    'SearchCourse finds verified online course deals and discounts, with curated learning paths to help you study for less across Udemy and other platforms.',
  alternates: { canonical: siteUrl() },
};

export default async function HomePage() {
  const [featured, topDiscounts, roadmaps, stats] = await Promise.all([
    getFeaturedCourses(6),
    getTopDiscountCourses(6),
    getFeaturedRoadmaps(3),
    getHomepageStats(),
  ]);

  const tickerDeals: TickerDeal[] = topDiscounts.data.map((course) => ({
    label: course.title,
    price: course.activeCoupon && course.activeCoupon.finalPrice === 0
      ? 'Free'
      : formatPrice(course.activeCoupon?.finalPrice ?? course.originalPrice, course.currency),
    href: `/courses/${course.slug}`,
  }));

  const [headlineCourse, ...restFeatured] = featured.data;

  const jsonLd = [
    buildWebSiteSchema(siteUrl()),
    buildOrganizationSchema(siteUrl()),
  ];

  return (
    <>
      <JsonLd data={jsonLd} />

      <section className="bg-secondary" aria-labelledby="hero-title">
        <Container className="grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="hero-in stamp tnum bg-card" style={{ ['--hero-delay' as string]: '0ms' }}>
              Verified daily
            </p>
            <h1
              id="hero-title"
              className="hero-in mt-6 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-secondary-foreground sm:text-6xl"
              style={{ ['--hero-delay' as string]: '80ms' }}
            >
              Online courses worth taking, at prices worth paying.
            </h1>
            <p
              className="hero-in mt-6 max-w-xl text-lg leading-relaxed text-secondary-foreground/75"
              style={{ ['--hero-delay' as string]: '160ms' }}
            >
              SearchCourse verifies Udemy coupons and discounts so you can skip the inflated list price and study
              for less. Every deal shows the price we found and the day we checked it.
            </p>
            <div
              className="hero-in mt-8 flex flex-wrap gap-3"
              style={{ ['--hero-delay' as string]: '240ms' }}
            >
              <LinkButton href="/courses" variant="primary" size="lg">
                Browse today&apos;s deals
              </LinkButton>
              <Link
                href="/roadmaps"
                className="focus-ring inline-flex min-h-12 items-center justify-center rounded-md border border-secondary-foreground/30 px-6 py-3 text-base font-medium text-secondary-foreground transition-colors hover:bg-secondary-foreground/10"
              >
                Explore learning paths
              </Link>
            </div>

            <dl
              className="hero-in mt-12 grid grid-cols-3 gap-6 border-t border-secondary-foreground/15 pt-6"
              style={{ ['--hero-delay' as string]: '320ms' }}
            >
              <div>
                <dd className="tnum text-2xl font-bold text-secondary-foreground sm:text-3xl">
                  <CountUp value={stats.coursesVerified} />
                </dd>
                <dt className="mt-1 text-xs text-secondary-foreground/60 sm:text-sm">Courses verified</dt>
              </div>
              <div>
                <dd className="tnum text-2xl font-bold text-secondary-foreground sm:text-3xl">
                  <CountUp value={stats.studentSavings} />
                </dd>
                <dt className="mt-1 text-xs text-secondary-foreground/60 sm:text-sm">Student savings</dt>
              </div>
              <div>
                <dd className="tnum text-2xl font-bold text-secondary-foreground sm:text-3xl">
                  <CountUp value={stats.uptime} />
                </dd>
                <dt className="mt-1 text-xs text-secondary-foreground/60 sm:text-sm">Deal monitoring</dt>
              </div>
            </dl>
          </div>

          <div
            className="hero-in relative mx-auto aspect-[4/3] w-full max-w-lg overflow-hidden rounded-lg border border-secondary-foreground/15 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.6)]"
            style={{ ['--hero-delay' as string]: '200ms' }}
          >
            <ContextImage
              src={HERO_IMAGE}
              alt="Two students working through a course together on a laptop"
              sizes="(min-width: 1024px) 460px, 90vw"
              priority
            />
            <span className="stamp tnum absolute bottom-4 left-4 bg-card">Every price dated</span>
          </div>
        </Container>
      </section>

      <DealTicker deals={tickerDeals} />

      <Container className="py-14 sm:py-20">
        {featured.data.length ? (
          <section aria-labelledby="featured-title">
            <Reveal>
              <div className="mb-8 max-w-xl">
                <h2 id="featured-title" className="font-display text-3xl font-semibold tracking-tight">
                  Featured courses
                </h2>
                <SectionRule className="mt-3" />
                <p className="mt-2 text-muted-foreground">Hand-picked highlights we checked recently.</p>
              </div>
            </Reveal>

            {headlineCourse ? (
              <Reveal>
                <article className="group mb-8 grid overflow-hidden rounded-lg border border-border bg-card transition-[box-shadow] duration-200 hover:shadow-[0_10px_24px_-12px_rgba(26,23,19,0.28)] sm:grid-cols-2">
                  <Link
                    href={`/courses/${headlineCourse.slug}`}
                    className="focus-ring relative block aspect-video overflow-hidden bg-muted sm:aspect-auto sm:min-h-[280px]"
                    aria-label={headlineCourse.title}
                  >
                    <CourseThumb
                      src={headlineCourse.thumbnailUrl}
                      alt={headlineCourse.title}
                      sizes="(min-width: 640px) 50vw, 100vw"
                    />
                  </Link>
                  <div className="flex flex-col justify-center gap-3 p-6 sm:p-8">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {headlineCourse.platform.name} · Editor&apos;s pick
                    </p>
                    <h3 className="font-display text-2xl font-semibold leading-snug">
                      <Link href={`/courses/${headlineCourse.slug}`} className="focus-ring hover:underline">
                        {headlineCourse.title}
                      </Link>
                    </h3>
                    {headlineCourse.instructorName ? (
                      <p className="text-sm text-muted-foreground">{headlineCourse.instructorName}</p>
                    ) : null}
                    <p className="tnum mt-2 flex items-baseline gap-2">
                      {headlineCourse.activeCoupon && headlineCourse.activeCoupon.finalPrice < headlineCourse.originalPrice ? (
                        <>
                          <span className="text-2xl font-bold text-accent">
                            {headlineCourse.activeCoupon.finalPrice === 0
                              ? 'Free'
                              : formatPrice(headlineCourse.activeCoupon.finalPrice, headlineCourse.currency)}
                          </span>
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(headlineCourse.originalPrice, headlineCourse.currency)}
                          </span>
                        </>
                      ) : (
                        <span className="text-2xl font-bold">
                          {formatPrice(headlineCourse.originalPrice, headlineCourse.currency)}
                        </span>
                      )}
                    </p>
                    <div className="mt-2">
                      <LinkButton href={`/courses/${headlineCourse.slug}`} variant="secondary">
                        View course
                      </LinkButton>
                    </div>
                  </div>
                </article>
              </Reveal>
            ) : null}

            {restFeatured.length ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {restFeatured.map((course, i) => (
                  <Reveal key={course.id} delay={(i % 3) * 70}>
                    <CourseCard course={course} priority={i < 2} />
                  </Reveal>
                ))}
              </div>
            ) : null}
          </section>
        ) : (
          <EmptyState
            title="No featured courses yet"
            body="Once courses are curated, the best ones will show up here first."
            action={<LinkButton href="/courses" variant="secondary">Browse all courses</LinkButton>}
          />
        )}
      </Container>

      <div className="border-y border-border bg-card [--notch-bg:var(--color-card)]">
        <Container className="py-14 sm:py-20">
          {topDiscounts.data.length ? (
            <section aria-labelledby="deals-title">
              <Reveal>
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                  <div className="max-w-xl">
                    <h2 id="deals-title" className="font-display text-3xl font-semibold tracking-tight">
                      Biggest discounts right now
                    </h2>
                    <SectionRule className="mt-3" />
                    <p className="mt-2 text-muted-foreground">Live coupons with the largest verified markdowns.</p>
                  </div>
                  <Link
                    href="/courses?sortBy=discount"
                    className="focus-ring rounded-sm text-sm font-semibold text-accent hover:underline"
                  >
                    All discounts
                  </Link>
                </div>
              </Reveal>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {topDiscounts.data.slice(0, 3).map((course, i) => (
                  <Reveal key={course.id} delay={i * 70}>
                    <CourseCard course={course} />
                  </Reveal>
                ))}
              </div>
            </section>
          ) : (
            <EmptyState
              title="No active discounts right now"
              body="We scan for new coupons continuously. Check back soon."
              action={<LinkButton href="/courses" variant="secondary">Browse all courses</LinkButton>}
            />
          )}
        </Container>
      </div>

      <Container className="py-14 sm:py-20">
        {roadmaps.data.length ? (
          <section aria-labelledby="paths-title">
            <Reveal>
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div className="max-w-xl">
                  <h2 id="paths-title" className="font-display text-3xl font-semibold tracking-tight">
                    Featured learning paths
                  </h2>
                  <SectionRule className="mt-3" />
                  <p className="mt-2 text-muted-foreground">Structured course sequences for common career goals.</p>
                </div>
                <Link
                  href="/roadmaps"
                  className="focus-ring rounded-sm text-sm font-semibold text-accent hover:underline"
                >
                  All roadmaps
                </Link>
              </div>
            </Reveal>

            <ol className="divide-y divide-border border-y border-border">
              {roadmaps.data.map((roadmap, i) => (
                <li key={roadmap.id}>
                  <Reveal delay={i * 70}>
                    <Link
                      href={`/roadmaps/${roadmap.slug}`}
                      className="focus-ring group grid items-baseline gap-x-8 gap-y-2 py-6 sm:grid-cols-[auto_1fr_auto] sm:py-8"
                    >
                      <span
                        aria-hidden="true"
                        className="tnum font-display text-4xl font-semibold text-border transition-colors group-hover:text-accent sm:text-5xl"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span>
                        <h3 className="font-display text-xl font-semibold tracking-tight group-hover:underline sm:text-2xl">
                          {roadmap.title}
                        </h3>
                        {roadmap.subtitle || roadmap.description ? (
                          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                            {roadmap.subtitle || roadmap.description}
                          </p>
                        ) : null}
                      </span>
                      <RoadmapMeta roadmap={roadmap} />
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ol>
          </section>
        ) : (
          <EmptyState
            title="No learning paths yet"
            body="Curated roadmaps are on the way."
            action={<LinkButton href="/roadmaps" variant="secondary">View roadmaps</LinkButton>}
          />
        )}
      </Container>
    </>
  );
}

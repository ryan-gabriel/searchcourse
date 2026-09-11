import type { Metadata } from 'next';
import { Container } from '@/components/container';
import { SectionRule } from '@/components/section-rule';
import { CourseCard } from '@/components/course-card';
import { RoadmapCard } from '@/components/roadmap-card';
import { LinkButton } from '@/components/button';
import { EmptyState } from '@/components/states';
import { getFeaturedCourses, getTopDiscountCourses, getFeaturedRoadmaps, getHomepageStats } from '@/services';
import { buildWebSiteSchema, buildOrganizationSchema } from '@/lib/seo/schema';
import { SITE_NAME, siteUrl } from '@/lib/site';

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

  const jsonLd = [
    buildWebSiteSchema(siteUrl()),
    buildOrganizationSchema(siteUrl()),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="border-b border-border bg-card" aria-labelledby="hero-title">
        <Container className="py-16 sm:py-24">
          <div className="max-w-2xl">
            <h1 id="hero-title" className="text-3xl font-bold tracking-tight sm:text-5xl">
              Online courses worth taking, at prices worth paying.
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              SearchCourse verifies Udemy coupons and discounts so you can skip the inflated list price and study for less.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/courses" variant="primary">
                Browse today&apos;s deals
              </LinkButton>
              <LinkButton href="/roadmaps" variant="secondary">
                Explore learning paths
              </LinkButton>
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-12 sm:py-16">
        <section className="grid gap-6 rounded-lg border border-border bg-card p-8 sm:grid-cols-3" aria-label="Site stats">
          <div>
            <p className="text-3xl font-bold">{stats.coursesVerified}</p>
            <p className="mt-1 text-sm text-muted-foreground">Courses verified for active deals</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{stats.studentSavings}</p>
            <p className="mt-1 text-sm text-muted-foreground">Estimated savings for tracked learners</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{stats.uptime}</p>
            <p className="mt-1 text-sm text-muted-foreground">Deal monitoring uptime</p>
          </div>
        </section>

        <section className="mt-14" aria-labelledby="featured-title">
          <div className="mb-6">
            <h2 id="featured-title" className="text-2xl font-semibold tracking-tight">
              Featured courses
            </h2>
            <SectionRule className="mt-2" />
            <p className="mt-1 text-sm text-muted-foreground">Hand-picked highlights we checked recently.</p>
          </div>
          {featured.data.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.data.map((course) => <CourseCard key={course.id} course={course} />)}
            </div>
          ) : (
            <EmptyState
              title="No featured courses yet"
              body="Once courses are curated, the best ones will show up here first."
              action={<LinkButton href="/courses" variant="secondary">Browse all courses</LinkButton>}
            />
          )}
        </section>

        <section className="mt-14" aria-labelledby="deals-title">
          <div className="mb-6">
            <h2 id="deals-title" className="text-2xl font-semibold tracking-tight">
              Biggest discounts right now
            </h2>
            <SectionRule className="mt-2" />
            <p className="mt-1 text-sm text-muted-foreground">Live coupons with the largest verified markdowns.</p>
          </div>
          {topDiscounts.data.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {topDiscounts.data.map((course) => <CourseCard key={course.id} course={course} />)}
            </div>
          ) : (
            <EmptyState
              title="No active discounts right now"
              body="We scan for new coupons continuously. Check back soon."
              action={<LinkButton href="/courses" variant="secondary">Browse all courses</LinkButton>}
            />
          )}
        </section>

        <section className="mt-14" aria-labelledby="paths-title">
          <div className="mb-6">
            <h2 id="paths-title" className="text-2xl font-semibold tracking-tight">
              Featured learning paths
            </h2>
            <SectionRule className="mt-2" />
            <p className="mt-1 text-sm text-muted-foreground">Structured course sequences for common career goals.</p>
          </div>
          {roadmaps.data.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {roadmaps.data.map((roadmap) => <RoadmapCard key={roadmap.id} roadmap={roadmap} />)}
            </div>
          ) : (
            <EmptyState
              title="No learning paths yet"
              body="Curated roadmaps are on the way."
              action={<LinkButton href="/roadmaps" variant="secondary">View roadmaps</LinkButton>}
            />
          )}
        </section>
      </Container>
    </>
  );
}
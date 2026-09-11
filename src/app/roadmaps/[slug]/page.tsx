import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Clock, Star } from 'lucide-react';
import { Container } from '@/components/container';
import { getRoadmapBySlug } from '@/services';
import { buildItemListSchema, buildBreadcrumbSchema } from '@/lib/seo/schema';
import { discountPercent, formatPercent, formatPrice } from '@/lib/format';
import { SITE_NAME, siteUrl } from '@/lib/site';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const roadmap = await getRoadmapBySlug(slug);

  if (!roadmap) {
    return { title: 'Roadmap not found' };
  }

  return {
    title: roadmap.title,
    description:
      roadmap.description ??
      `${roadmap.title}: a ${roadmap.courseCount}-course learning path to get you from beginner to job-ready.`,
    alternates: { canonical: siteUrl(`/roadmaps/${roadmap.slug}`) },
    openGraph: {
      title: roadmap.title,
      description: roadmap.description ?? `${roadmap.courseCount}-course learning path on SearchCourse.`,
      url: siteUrl(`/roadmaps/${roadmap.slug}`),
      type: 'article',
      images: roadmap.steps[0]?.course.thumbnailUrl
        ? [{ url: roadmap.steps[0].course.thumbnailUrl, alt: roadmap.title }]
        : [{ url: siteUrl('/seo/og-image.jpg'), width: 1200, height: 630, alt: SITE_NAME }],
    },
  };
}

export default async function RoadmapDetailPage({ params }: Props) {
  const { slug } = await params;
  const roadmap = await getRoadmapBySlug(slug);

  if (!roadmap) notFound();

  const firstStep = roadmap.steps[0];
  const jsonLd = [
    buildItemListSchema(
      roadmap.steps.map((step) => ({
        name: step.course.title,
        url: siteUrl(`/courses/${step.course.slug}`),
      }))
    ),
    buildBreadcrumbSchema([
      { name: 'Home', url: siteUrl() },
      { name: 'Roadmaps', url: siteUrl('/roadmaps') },
      { name: roadmap.title },
    ]),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Container className="py-10 sm:py-14">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1">
            <li><Link href="/" className="focus-ring hover:underline">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/roadmaps" className="focus-ring hover:underline">Roadmaps</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground">{roadmap.title}</li>
          </ol>
        </nav>

        <header className="max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{roadmap.title}</h1>
          {roadmap.description ? (
            <p className="mt-4 leading-relaxed text-muted-foreground">{roadmap.description}</p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span>{roadmap.courseCount} courses</span>
            {roadmap.estimatedHours ? (
              <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" aria-hidden="true" /> ~{roadmap.estimatedHours}h</span>
            ) : null}
          </div>
        </header>

        <div className="mt-10 rounded-lg border border-border bg-card p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Total cost of this path</h2>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold sm:text-3xl">
                  {formatPrice(roadmap.totalDiscountedPrice)}
                </span>
                {roadmap.totalSavings > 0 ? (
                  <>
                    <span className="text-muted-foreground line-through">{formatPrice(roadmap.totalOriginalPrice)}</span>
                    <span className="rounded-sm bg-accent px-2 py-1 text-sm font-semibold text-accent-foreground">
                      Save {formatPercent(discountPercent(roadmap.totalOriginalPrice, roadmap.totalDiscountedPrice))}
                    </span>
                  </>
                ) : null}
              </div>
            </div>
            {firstStep ? (
              <Link
                href={`/courses/${firstStep.course.slug}`}
                className="focus-ring inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent/90"
              >
                Start with step 1
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            ) : null}
          </div>
        </div>

        {roadmap.steps.length ? (
          <section className="mt-12" aria-labelledby="steps-title">
            <h2 id="steps-title" className="text-2xl font-semibold tracking-tight">The path, step by step</h2>
            <ol className="mt-6 space-y-6">
              {roadmap.steps.map((step) => {
                const stepDiscounted = step.course.activeCoupon
                  ? step.course.activeCoupon.finalPrice < step.course.originalPrice
                  : false;
                const stepSavings = step.course.activeCoupon
                  ? discountPercent(step.course.originalPrice, step.course.activeCoupon.finalPrice)
                  : 0;

                return (
                  <li key={step.id} className="grid gap-4 rounded-lg border border-border bg-card p-5 sm:grid-cols-[auto_1fr] sm:gap-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold" aria-hidden="true">
                      {step.orderIndex + 1}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-lg font-semibold">{step.title}</h3>
                        <div className="flex items-baseline gap-2 text-sm">
                          {stepDiscounted && step.course.activeCoupon ? (
                            <>
                              <span className="text-muted-foreground line-through">{formatPrice(step.course.originalPrice)}</span>
                              <span className="text-base font-bold text-accent">{formatPrice(step.course.activeCoupon.finalPrice)}</span>
                              <span className="font-medium text-accent">({formatPercent(stepSavings)} off)</span>
                            </>
                          ) : (
                            <span className="text-base font-bold">{formatPrice(step.course.originalPrice)}</span>
                          )}
                        </div>
                      </div>
                      {step.description ? (
                        <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span>{step.course.platform.name}</span>
                        <span>by {step.course.instructorName ?? 'a professional instructor'}</span>
                        {step.course.duration ? <span>{step.course.duration}</span> : null}
                        {typeof step.course.rating === 'number' && step.course.rating > 0 ? (
                          <span className="inline-flex items-center gap-1 text-foreground">
                            <Star className="h-4 w-4" style={{ fill: '#8e0413', color: '#8e0413' }} aria-hidden="true" />
                            {step.course.rating.toFixed(1)}
                          </span>
                        ) : null}
                      </div>
                      <Link href={`/courses/${step.course.slug}`} className="focus-ring mt-3 inline-flex items-center gap-1 text-sm font-medium hover:underline">
                        View course
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        ) : (
          <p className="mt-12 text-muted-foreground">This path has no steps yet. Check back soon.</p>
        )}
      </Container>
    </>
  );
}
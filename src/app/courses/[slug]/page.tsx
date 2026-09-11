import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Star, Check, Clock, Users, BadgePercent, Info } from 'lucide-react';
import { Container } from '@/components/container';
import { LinkButton } from '@/components/button';
import { TelegramCTA } from '@/components/telegram-cta';
import { getCourseWithFullDetails } from '@/services';
import { buildCourseSchema, buildBreadcrumbSchema } from '@/lib/seo/schema';
import { buildEditorialNote } from '@/lib/seo/editorial';
import { discountPercent, formatPercent, formatPrice, formatCount, formatDate, LEVEL_LABELS } from '@/lib/format';
import { SITE_NAME, siteUrl } from '@/lib/site';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ src?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseWithFullDetails(slug);

  if (!course) {
    return { title: 'Course not found' };
  }

  const description =
    course.shortDescription ||
    course.headline ||
    `${course.title} by ${course.instructorName ?? 'a professional instructor'} on ${course.platform.name}. See the current verified deal on SearchCourse.`;

  return {
    title: course.title,
    description,
    alternates: { canonical: siteUrl(`/courses/${course.slug}`) },
    openGraph: {
      title: course.title,
      description,
      url: siteUrl(`/courses/${course.slug}`),
      type: 'article',
      images: course.thumbnailUrl
        ? [{ url: course.thumbnailUrl, alt: course.title }]
        : [{ url: siteUrl('/seo/og-image.jpg'), width: 1200, height: 630, alt: SITE_NAME }],
    },
  };
}

export default async function CourseDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { src } = await searchParams;
  const course = await getCourseWithFullDetails(slug);

  if (!course) notFound();

  const discounted = course.activeCoupon ? course.activeCoupon.finalPrice < course.originalPrice : false;
  const savings = course.activeCoupon ? discountPercent(course.originalPrice, course.activeCoupon.finalPrice) : 0;
  const srcQuery = src === 'tg' ? '?src=tg' : '?src=web';

  const jsonLd = [
    buildCourseSchema({
      name: course.title,
      description: course.description ?? course.title,
      url: siteUrl(`/courses/${course.slug}`),
      image: course.thumbnailUrl ?? undefined,
      providerName: course.platform.name,
      providerUrl: course.platform.logoUrl ?? undefined,
      instructorName: course.instructorName ?? undefined,
      rating: course.rating ?? undefined,
      reviewCount: course.reviewCount,
      price: course.activeCoupon?.finalPrice ?? course.originalPrice,
      currency: course.currency,
      lastVerifiedAt: course.lastVerifiedAt,
    }),
    buildBreadcrumbSchema([
      { name: 'Home', url: siteUrl() },
      { name: 'Courses', url: siteUrl('/courses') },
      { name: course.title },
    ]),
  ];

  const editorial = buildEditorialNote({
    title: course.title,
    instructorName: course.instructorName,
    rating: course.rating,
    reviewCount: course.reviewCount,
    platformName: course.platform.name,
    discountPercent: discounted ? savings : undefined,
    finalPrice: course.activeCoupon?.finalPrice,
    verifiedDate: course.lastVerifiedAt,
  });

  const facts = [
    { label: 'Duration', value: course.duration ?? 'See platform' },
    { label: 'Lectures', value: course.lectureCount ? formatCount(course.lectureCount) : 'See platform' },
    { label: 'Level', value: LEVEL_LABELS[course.level] ?? course.level },
    { label: 'Language', value: course.language ?? 'English' },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Container className="py-10 sm:py-14">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1">
            <li><Link href="/" className="focus-ring hover:underline">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/courses" className="focus-ring hover:underline">Courses</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground">{course.title}</li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{course.title}</h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span>{course.platform.name}</span>
              {course.instructorName ? <span>by {course.instructorName}</span> : null}
              {typeof course.rating === 'number' && course.rating > 0 ? (
                <span className="inline-flex items-center gap-1 text-foreground">
                  <Star className="h-4 w-4 fill-destructive text-destructive" aria-hidden="true" />
                  {course.rating.toFixed(1)}
                  {course.reviewCount > 0 ? ` (${formatCount(course.reviewCount)} reviews)` : ''}
                </span>
              ) : null}
            </div>

            {course.description ? (
              <p className="mt-6 leading-relaxed text-muted-foreground">{course.description}</p>
            ) : null}

            <aside className="mt-8 rounded-lg border border-border bg-card p-5 text-sm leading-relaxed text-muted-foreground">
              <h2 className="mb-2 text-base font-semibold text-foreground">Why we&apos;re featuring this course</h2>
              {editorial}
            </aside>

            {course.learningOutcomes.length ? (
              <section className="mt-10" aria-labelledby="outcomes-title">
                <h2 id="outcomes-title" className="text-xl font-semibold tracking-tight">What you&apos;ll learn</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {course.learningOutcomes.map((outcome) => (
                    <li key={outcome.id} className="flex items-start gap-3 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                      <span>{outcome.text}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {course.syllabusSections.length ? (
              <section className="mt-10" aria-labelledby="syllabus-title">
                <h2 id="syllabus-title" className="text-xl font-semibold tracking-tight">Course content</h2>
                <ol className="mt-4 space-y-2">
                  {course.syllabusSections.map((section) => (
                    <li key={section.id} className="rounded-lg border border-border bg-card p-4">
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="font-medium">{section.title}</h3>
                        {section.duration ? (
                          <span className="shrink-0 text-sm text-muted-foreground">{section.duration}</span>
                        ) : null}
                      </div>
                      {section.items.length ? (
                        <ul className="mt-3 space-y-1 border-t border-border pt-3 text-sm text-muted-foreground">
                          {section.items.map((item) => (
                            <li key={item.id}>{item.title}</li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Deal details">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Current deal</h2>

              <div className="mt-4">
                {discounted && course.activeCoupon ? (
                  <div className="flex items-baseline gap-2">
                    {course.activeCoupon.finalPrice === 0 ? (
                      <span className="text-4xl font-bold tracking-tight text-secondary">Free</span>
                    ) : (
                      <span className="text-4xl font-bold tracking-tight text-accent">
                        {formatPrice(course.activeCoupon.finalPrice, course.currency)}
                      </span>
                    )}
                    <span className="text-lg text-muted-foreground line-through">
                      {formatPrice(course.originalPrice, course.currency)}
                    </span>
                  </div>
                ) : (
                  <div className="text-4xl font-bold tracking-tight">
                    {formatPrice(course.originalPrice, course.currency)}
                  </div>
                )}
                {discounted ? (
                  <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                    <BadgePercent className="h-4 w-4" aria-hidden="true" />
                    {formatPercent(savings)} off, verified {formatDate(course.lastVerifiedAt)}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Last verified {formatDate(course.lastVerifiedAt)}
                  </p>
                )}
              </div>

              <LinkButton href={`/api/out/${course.id}${srcQuery}`} size="lg" className="mt-6 w-full">
                Get this deal
              </LinkButton>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                You&apos;ll be redirected to {course.platform.name}. We may earn a commission at no extra cost to you.
              </p>

              <TelegramCTA variant="inline" source="course" />

              <div className="mt-4 flex items-start gap-2 rounded-md border border-border bg-muted/40 p-3 text-left text-xs text-muted-foreground">
                <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <p>
                  Heads up: this coupon may expire or run out of spots at any time. If it no longer works, the course
                  may not be free anymore, but the discount could still be available.
                </p>
              </div>

              <dl className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
                {facts.map((fact) => (
                  <div key={fact.label} className="flex items-center justify-between gap-3">
                    <dt className="inline-flex items-center gap-2 text-muted-foreground">
                      {fact.label === 'Duration' ? <Clock className="h-4 w-4" aria-hidden="true" /> : null}
                      {fact.label === 'Lectures' ? <BadgePercent className="h-4 w-4" aria-hidden="true" /> : null}
                      {fact.label}
                    </dt>
                    <dd className="font-medium">{fact.value}</dd>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-3 border-t border-border pt-2">
                  <dt className="inline-flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" aria-hidden="true" />
                    Students
                  </dt>
                  <dd className="font-medium">{formatCount(course.studentCount)}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}
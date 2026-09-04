import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
    Star,
    Users,
    PlayCircle,
    CheckCircle,
    ChevronRight,
    Award,
    TrendingUp,
    ArrowRight,
} from 'lucide-react';
import { getCourseWithFullDetails, getCourseBySlug } from '@/services';
import { formatPrice, calculateDiscountPercentage, formatCompactNumber } from '@/lib/utils';
import { CourseAccordion } from './CourseAccordion';
import { StickyCourseSidebar } from './StickyCourseSidebar';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const course = await getCourseBySlug(slug);

    if (!course) {
        return { title: 'Course Not Found' };
    }

    return {
        title: course.title,
        description:
            course.shortDescription || course.description?.slice(0, 160),
        openGraph: {
            title: `${course.title} | SearchCourse`,
            description:
                course.shortDescription || course.description?.slice(0, 160),
            images: course.thumbnailUrl
                ? [{ url: course.thumbnailUrl }]
                : undefined,
        },
    };
}

export const dynamic = 'force-dynamic';

export default async function CourseDetailPage(props: PageProps) {
    const { slug } = await props.params;
    const course = await getCourseWithFullDetails(slug);

    if (!course) {
        notFound();
    }

    const hasDiscount = course.activeCoupon !== null;
    const finalPrice = hasDiscount
        ? course.activeCoupon!.finalPrice
        : course.originalPrice;
    const discountPercent = hasDiscount
        ? calculateDiscountPercentage(
              Number(course.originalPrice),
              Number(finalPrice)
          )
        : 0;

    const affiliateUrl = course.affiliateUrl || `/api/out/${course.id}`;

    return (
        <div className="min-h-screen bg-background">
            <div className="bg-surface border-b border-border sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <nav className="flex items-center gap-2 text-sm overflow-x-auto whitespace-nowrap scrollbar-hide">
                        <Link
                            href="/courses"
                            className="text-foreground/50 hover:text-foreground"
                        >
                            Courses
                        </Link>
                        <ChevronRight className="w-4 h-4 text-foreground/40 flex-shrink-0" />
                        {course.category ? (
                            <>
                                <Link
                                    href={`/courses?category=${course.category.slug}`}
                                    className="text-foreground/50 hover:text-foreground"
                                >
                                    {course.category.name}
                                </Link>
                                <ChevronRight className="w-4 h-4 text-foreground/40 flex-shrink-0" />
                            </>
                        ) : null}
                        <Link
                            href={`/courses?platform=${course.platform.slug}`}
                            className="text-foreground font-medium truncate max-w-[200px] hover:underline"
                        >
                            {course.platform.name}
                        </Link>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
                <div className="lg:grid lg:grid-cols-3 lg:gap-12">
                    <div className="lg:col-span-2">
                        <div className="mb-8">
                            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                                {course.title}
                            </h1>

                            {course.shortDescription && (
                                <p className="text-lg text-foreground/60 mb-6">
                                    {course.shortDescription}
                                </p>
                            )}

                            <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
                                {course.rating && (
                                    <div className="flex items-center gap-1">
                                        <span className="font-bold text-amber-600">
                                            {Number(course.rating).toFixed(1)}
                                        </span>
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${
                                                        i < Math.floor(Number(course.rating))
                                                            ? 'fill-amber-400 text-amber-400'
                                                            : 'fill-border text-border'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-foreground/50">
                                            ({formatCompactNumber(course.reviewCount)} ratings)
                                        </span>
                                    </div>
                                )}

                                {course.studentCount > 0 && (
                                    <div className="flex items-center gap-1 text-foreground/60">
                                        <Users className="w-4 h-4" />
                                        <span>
                                            {formatCompactNumber(course.studentCount)} students
                                        </span>
                                    </div>
                                )}

                                {course.lastVerifiedAt && (
                                    <div className="hidden sm:flex items-center gap-1 text-price">
                                        <CheckCircle className="w-4 h-4" />
                                        <span>
                                            Verified{' '}
                                            {new Date(
                                                course.lastVerifiedAt
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {course.instructorName && (
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center text-foreground font-semibold flex-shrink-0">
                                        {course.instructorName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm text-foreground/50">
                                            Created by
                                        </p>
                                        <p className="font-medium text-foreground">
                                            {course.instructorName}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/50">
                                <span className="inline-flex items-center gap-1">
                                    Available on {course.platform.name}
                                </span>
                                {course.duration && (
                                    <span className="inline-flex items-center gap-1">
                                        <PlayCircle className="w-4 h-4" />
                                        {course.duration} of content
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="relative aspect-video bg-surface-muted rounded-2xl overflow-hidden mb-10">
                            {course.thumbnailUrl ? (
                                <Image
                                    src={course.thumbnailUrl}
                                    alt={course.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            ) : null}
                            {course.directUrl && (
                                <Link
                                    href={course.directUrl}
                                    target="_blank"
                                    className="absolute inset-0 bg-black/40 hover:bg-black/30 transition-colors flex items-center justify-center group"
                                >
                                    <button className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-all group-hover:scale-110">
                                        <PlayCircle className="w-12 h-12 text-white fill-white/20" />
                                    </button>
                                </Link>
                            )}
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4 mb-10">
                            <div className="flex items-start gap-4 p-5 rounded-xl bg-surface-muted border border-border">
                                <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center flex-shrink-0">
                                    <TrendingUp className="w-6 h-6 text-foreground" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-1">
                                        Career Growth
                                    </h3>
                                    <p className="text-sm text-foreground/60">
                                        Build a portfolio-ready project and master in-demand
                                        skills recognized by top employers.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-5 rounded-xl bg-surface-muted border border-border">
                                <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center flex-shrink-0">
                                    <Award className="w-6 h-6 text-foreground" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-1">
                                        Certificate
                                    </h3>
                                    <p className="text-sm text-foreground/60">
                                        Receive a certificate of completion to validate your
                                        expertise on your resume.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {course.learningOutcomes.length > 0 && (
                            <section className="mb-10">
                                <h2 className="text-xl font-bold text-foreground mb-6">
                                    What you&apos;ll learn
                                </h2>
                                <div className="grid sm:grid-cols-2 gap-3 p-6 rounded-xl border border-border bg-surface-muted">
                                    {course.learningOutcomes.map(
                                        (outcome: { id: string; text: string }) => (
                                            <div
                                                key={outcome.id}
                                                className="flex items-start gap-3"
                                            >
                                                <CheckCircle className="w-5 h-5 text-price flex-shrink-0 mt-0.5" />
                                                <span className="text-sm text-foreground/70 leading-relaxed">
                                                    {outcome.text}
                                                </span>
                                            </div>
                                        )
                                    )}
                                </div>
                            </section>
                        )}

                        {course.description && (
                            <section className="mb-10">
                                <h2 className="text-xl font-bold text-foreground mb-4">
                                    Description
                                </h2>
                                <div className="text-foreground/70 leading-relaxed whitespace-pre-line">
                                    {course.description}
                                </div>
                            </section>
                        )}

                        {course.syllabusSections.length > 0 && (
                            <section className="mb-10">
                                <h2 className="text-xl font-bold text-foreground mb-6">
                                    Course Content
                                </h2>
                                <CourseAccordion
                                    sections={course.syllabusSections.map((s) => ({
                                        ...s,
                                        lectures: s.items.length,
                                        items: s.items.map((i) => i.title),
                                        duration: s.duration || '',
                                    }))}
                                />
                            </section>
                        )}

                        {course.rating && (
                            <section className="mb-10">
                                <h2 className="text-xl font-bold text-foreground mb-6">
                                    Student Feedback
                                </h2>
                                <div className="flex flex-col items-center justify-center p-8 bg-surface-muted rounded-2xl border border-border">
                                    <div className="text-center">
                                        <div className="text-5xl font-bold text-foreground mb-3">
                                            {Number(course.rating).toFixed(1)}
                                        </div>
                                        <div className="flex justify-center gap-1 mb-3">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-6 h-6 ${
                                                        i <
                                                        Math.floor(
                                                            Number(course.rating || 0)
                                                        )
                                                            ? 'fill-amber-400 text-amber-400'
                                                            : 'fill-border text-border'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <p className="font-semibold text-foreground mb-2">
                                            Course Rating
                                        </p>
                                        <p className="text-sm text-foreground/50">
                                            Trusted by{' '}
                                            {formatCompactNumber(course.studentCount)} students
                                        </p>
                                    </div>
                                </div>
                            </section>
                        )}

                        {course.instructorName && (
                            <section className="mb-10">
                                <h2 className="text-xl font-bold text-foreground mb-6">
                                    Instructor
                                </h2>
                                <div className="flex flex-col sm:flex-row items-start gap-6 p-6 border border-border rounded-2xl bg-surface">
                                    <div className="w-16 h-16 rounded-full bg-surface-muted flex items-center justify-center text-foreground text-xl font-bold flex-shrink-0">
                                        {course.instructorName.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground">
                                            {course.instructorName}
                                        </h3>
                                        <p className="text-sm text-foreground/50 mb-3 font-medium">
                                            Course Instructor
                                        </p>
                                        <p className="text-sm text-foreground/60 leading-relaxed">
                                            {course.instructorBio ||
                                                `${course.instructorName} is an experienced instructor with a passion for teaching complex topics in simple, understandable ways.`}
                                        </p>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>

                    <div className="hidden lg:block relative">
                        <StickyCourseSidebar
                            course={course}
                            finalPrice={Number(finalPrice)}
                            originalPrice={Number(course.originalPrice)}
                            discountPercent={discountPercent}
                            affiliateUrl={affiliateUrl}
                        />
                    </div>
                </div>
            </div>

            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border p-4 z-50">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-foreground">
                                {Number(finalPrice) === 0
                                    ? 'FREE'
                                    : formatPrice(Number(finalPrice), course.currency)}
                            </span>
                            {hasDiscount && (
                                <span className="text-sm text-foreground/40 line-through">
                                    {formatPrice(Number(course.originalPrice), course.currency)}
                                </span>
                            )}
                        </div>
                        {hasDiscount && discountPercent > 0 && (
                            <span className="text-xs text-price font-medium">
                                {discountPercent}% off
                            </span>
                        )}
                    </div>
                    <Link
                        href={affiliateUrl}
                        target="_blank"
                        className="flex-1 max-w-[200px] btn btn-primary py-3 rounded-xl gap-2"
                    >
                        Enroll Now
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

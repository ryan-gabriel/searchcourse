import Link from 'next/link';
import { Star } from 'lucide-react';
import { CourseThumb } from '@/components/course-thumb';
import { discountPercent, formatPercent, formatPrice, formatStudents, LEVEL_LABELS } from '@/lib/format';

export interface CourseCardCourse {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  instructorName: string | null;
  originalPrice: number;
  currency: string;
  level: string;
  rating: number | null;
  reviewCount: number;
  studentCount: number;
  platform: { name: string; slug: string; logoUrl?: string | null };
  activeCoupon: {
    finalPrice: number;
    discountValue: number;
    code?: string | null;
  } | null;
}

export function CourseCard({ course, priority = false }: { course: CourseCardCourse; priority?: boolean }) {
  const discounted = course.activeCoupon ? course.activeCoupon.finalPrice < course.originalPrice : false;
  const savings = course.activeCoupon
    ? discountPercent(course.originalPrice, course.activeCoupon.finalPrice)
    : 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md focus-within:shadow-md">
      <Link href={`/courses/${course.slug}`} className="focus-ring" aria-label={course.title}>
        <div className="relative aspect-video overflow-hidden bg-muted">
          <CourseThumb src={course.thumbnailUrl} priority={priority} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
          {discounted ? (
            <span className="absolute left-3 top-3 rounded-sm bg-accent px-2 py-1 text-xs font-semibold text-accent-foreground">
              {course.activeCoupon!.finalPrice === 0 ? 'Free' : `${formatPercent(savings)} off`}
            </span>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{course.platform.name}</p>
        <h3 className="line-clamp-2 text-base font-semibold leading-snug">
          <Link href={`/courses/${course.slug}`} className="focus-ring hover:underline">
            {course.title}
          </Link>
        </h3>
        {course.instructorName ? (
          <p className="text-sm text-muted-foreground">{course.instructorName}</p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <div className="flex items-center gap-2 text-sm">
            {typeof course.rating === 'number' && course.rating > 0 ? (
              <>
                <Star className="h-4 w-4 fill-destructive text-destructive" aria-hidden="true" />
                <span className="font-medium">{course.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">({formatStudents(course.studentCount)})</span>
              </>
            ) : (
              <span className="text-muted-foreground">{formatStudents(course.studentCount)} students</span>
            )}
            <span className="text-muted-foreground">· {LEVEL_LABELS[course.level] ?? course.level}</span>
          </div>
        </div>

        <div className="flex items-baseline gap-2 pt-1">
          {discounted ? (
            <>
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(course.originalPrice, course.currency)}
              </span>
              <span className="text-lg font-bold">
                {formatPrice(course.activeCoupon!.finalPrice, course.currency)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold">{formatPrice(course.originalPrice, course.currency)}</span>
          )}
        </div>
      </div>
    </article>
  );
}
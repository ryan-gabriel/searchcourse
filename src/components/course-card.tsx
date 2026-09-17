import Link from 'next/link';
import { Star } from 'lucide-react';
import { CourseThumb } from '@/components/course-thumb';
import { discountPercent, formatPercent, formatPrice, formatStudents } from '@/lib/format';

export interface CourseCardCourse {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  instructorName: string | null;
  originalPrice: number;
  currency: string;
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
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-12px_rgba(26,23,19,0.28)] focus-within:shadow-[0_10px_24px_-12px_rgba(26,23,19,0.28)]">
      <Link href={`/courses/${course.slug}`} className="focus-ring" aria-label={course.title}>
        <div className="relative aspect-video overflow-hidden bg-muted">
          <CourseThumb src={course.thumbnailUrl} priority={priority} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
          {discounted ? (
            <span className="stamp tnum absolute left-3 top-3 bg-card">
              {course.activeCoupon!.finalPrice === 0 ? 'Free' : `${formatPercent(savings)} off`}
            </span>
          ) : null}
        </div>
      </Link>

      <div className="ticket-tear mx-0" />

      <div className="flex flex-1 flex-col gap-2 px-5 pb-5 pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{course.platform.name}</p>
        <h3 className="line-clamp-2 text-base font-semibold leading-snug">
          <Link href={`/courses/${course.slug}`} className="focus-ring hover:underline">
            {course.title}
          </Link>
        </h3>
        {course.instructorName ? (
          <p className="text-sm text-muted-foreground">{course.instructorName}</p>
        ) : null}

        <div className="mt-auto flex items-center gap-2 pt-3 text-sm">
          {typeof course.rating === 'number' && course.rating > 0 ? (
            <>
              <Star className="h-4 w-4 fill-accent text-accent" aria-hidden="true" />
              <span className="tnum font-medium">{course.rating.toFixed(1)}</span>
              <span className="tnum text-muted-foreground">({formatStudents(course.studentCount)})</span>
            </>
          ) : (
            <span className="tnum text-muted-foreground">{formatStudents(course.studentCount)} students</span>
          )}
        </div>

        <div className="tnum flex items-baseline gap-2 pt-1">
          {discounted ? (
            <>
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(course.originalPrice, course.currency)}
              </span>
              <span className="text-lg font-bold text-accent">
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

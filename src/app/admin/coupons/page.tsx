import type { Metadata } from 'next';
import { buttonClass } from '@/components/button';
import { EmptyState } from '@/components/states';
import { CouponManager, type CouponRow } from '@/components/admin/coupon-manager';
import { searchCoupons, searchCourses } from '@/services';
import { CouponSearchSchema } from '@/validations';

export const metadata: Metadata = { title: 'Coupons' };

export default async function CouponsPage({
  searchParams,
}: {
  searchParams: Promise<{ isActive?: string; page?: string }>;
}) {
  const awaited = await searchParams;
  const isActiveParam = awaited.isActive;
  const isActive = isActiveParam === 'true' ? true : isActiveParam === 'false' ? false : undefined;

  const parsed = CouponSearchSchema.safeParse({
    isActive,
    notExpired: false,
    page: awaited.page || undefined,
  });
  const search = parsed.success ? parsed.data : CouponSearchSchema.parse({ notExpired: false });

  const [result, courseResult] = await Promise.all([
    searchCoupons(search),
    searchCourses({ query: '', page: 1, limit: 500, sortBy: 'date', sortOrder: 'desc' }),
  ]);

  const rows: CouponRow[] = result.data.map((coupon) => ({
    id: coupon.id,
    code: coupon.code,
    discountType: coupon.discountType as CouponRow['discountType'],
    discountValue: coupon.discountValue,
    finalPrice: coupon.finalPrice,
    expiresAt: coupon.expiresAt ? coupon.expiresAt.toISOString() : null,
    isActive: coupon.isActive,
    source: coupon.source,
    course: {
      id: coupon.course.id,
      title: coupon.course.title,
      slug: coupon.course.slug,
    },
  }));

  const courses = courseResult.data
    .map((course) => ({ id: course.id, title: course.title }))
    .sort((a, b) => a.title.localeCompare(b.title));

  const buildHref = (page: number) => couponsHref(page, isActive);

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Coupons</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {result.pagination.total} coupon{result.pagination.total === 1 ? '' : 's'}
      </p>

      <form method="get" className="mt-6 flex flex-wrap items-center gap-3">
        <label htmlFor="isActive" className="text-sm font-medium">Status</label>
        <select
          id="isActive"
          name="isActive"
          defaultValue={isActiveParam ?? ''}
          className="focus-ring w-auto rounded-md border border-border bg-card px-3 py-2 text-sm"
        >
          <option value="">All</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button type="submit" className={buttonClass('secondary')}>Apply</button>
      </form>

      {rows.length ? (
        <CouponManager
          rows={rows}
          courses={courses}
          page={search.page}
          totalPages={result.pagination.totalPages}
          buildHref={buildHref}
        />
      ) : (
        <>
          <EmptyState
            title="No coupons found"
            body="Nothing matches the current filter. Add a new coupon below, or clear the filter."
          />
          <CouponManager
            rows={rows}
            courses={courses}
            page={search.page}
            totalPages={result.pagination.totalPages}
            buildHref={buildHref}
          />
        </>
      )}
    </>
  );
}

function couponsHref(page: number, isActive?: boolean): string {
  const params = new URLSearchParams();
  if (isActive !== undefined) params.set('isActive', String(isActive));
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return qs ? `/admin/coupons?${qs}` : '/admin/coupons';
}
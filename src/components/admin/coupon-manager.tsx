'use client';

import Link from 'next/link';
import { formatDate, formatPercent, formatPrice } from '@/lib/format';
import { AdminManager } from '@/components/admin/admin-manager';
import { CouponForm, type CouponRow } from '@/components/admin/coupon-form';

export type { CouponRow } from '@/components/admin/coupon-form';

const badgeClass = 'rounded-sm bg-muted px-2 py-0.5 text-xs';

export function CouponManager({
  rows,
  courses,
  page,
  totalPages,
  buildHref,
}: {
  rows: CouponRow[];
  courses: { id: string; title: string }[];
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  return (
    <AdminManager
      rows={rows}
      page={page}
      totalPages={totalPages}
      buildHref={buildHref}
      createHeading="Add a coupon"
      deleteEndpoint={(id) => `/api/admin/coupons/${id}`}
      deleteMessage={(row) =>
        `Delete coupon ${row.code ? `"${row.code}"` : 'without a code'}? This cannot be undone.`
      }
      columns={[
        {
          header: 'Code',
          render: (row) =>
            row.code ? (
              <span className="font-mono text-xs">{row.code}</span>
            ) : (
              <span className="text-muted-foreground">No code</span>
            ),
        },
        {
          header: 'Course',
          render: (row) => (
            <Link href={`/courses/${row.course.slug}`} className="focus-ring font-medium hover:underline">
              {row.course.title}
            </Link>
          ),
        },
        {
          header: 'Discount',
          render: (row) =>
            row.discountType === 'PERCENTAGE' ? `${formatPercent(row.discountValue)} off` : formatPrice(row.discountValue),
        },
        { header: 'Final price', render: (row) => formatPrice(row.finalPrice) },
        {
          header: 'Expires',
          render: (row) =>
            row.expiresAt ? formatDate(row.expiresAt) : <span className="text-muted-foreground">Never</span>,
        },
        {
          header: 'Status',
          render: (row) => <span className={badgeClass}>{row.isActive ? 'Active' : 'Inactive'}</span>,
        },
      ]}
      renderForm={({ row, onDone, onCancel }) => (
        <CouponForm row={row} courses={courses} onDone={onDone} onCancel={onCancel} />
      )}
    />
  );
}
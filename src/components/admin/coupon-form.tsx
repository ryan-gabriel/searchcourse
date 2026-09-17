'use client';

import { useState } from 'react';
import { buttonClass } from '@/components/button';
import { inputClass, labelClass, readApiError, selectClass } from '@/components/admin/simple-table';

export interface CouponRow {
  id: string;
  code: string | null;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  finalPrice: number;
  expiresAt: string | null;
  isActive: boolean;
  source: string | null;
  course: { id: string; title: string; slug: string };
}

export function CouponForm({
  row,
  courses,
  onDone,
  onCancel,
}: {
  row?: CouponRow;
  courses: { id: string; title: string }[];
  onDone: () => void;
  onCancel?: () => void;
}) {
  const isEdit = Boolean(row);
  const formId = isEdit ? `edit-${row!.id}` : 'new';
  const courseOptions =
    row && !courses.some((course) => course.id === row.course.id)
      ? [{ id: row.course.id, title: row.course.title }, ...courses]
      : courses;
  const [courseId, setCourseId] = useState(row?.course.id ?? '');
  const [code, setCode] = useState(row?.code ?? '');
  const [discountType, setDiscountType] = useState<CouponRow['discountType']>(row?.discountType ?? 'PERCENTAGE');
  const [discountValue, setDiscountValue] = useState(row ? String(row.discountValue) : '');
  const [finalPrice, setFinalPrice] = useState(row ? String(row.finalPrice) : '');
  const [expiresAt, setExpiresAt] = useState(row?.expiresAt ? row.expiresAt.slice(0, 16) : '');
  const [isActive, setIsActive] = useState(row?.isActive ?? true);
  const [source, setSource] = useState(row?.source ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (isEdit && row) {
        const body: Record<string, unknown> = {};
        const nextExpires = expiresAt ? new Date(expiresAt).toISOString() : null;
        const nextDiscountValue = Number(discountValue);
        const nextFinalPrice = Number(finalPrice);
        if (courseId !== row.course.id) body.courseId = courseId;
        if ((code.trim() || null) !== (row.code ?? null)) body.code = code.trim() || null;
        if (discountType !== row.discountType) body.discountType = discountType;
        if (Number.isFinite(nextDiscountValue) && nextDiscountValue !== row.discountValue) body.discountValue = nextDiscountValue;
        if (Number.isFinite(nextFinalPrice) && nextFinalPrice !== row.finalPrice) body.finalPrice = nextFinalPrice;
        if (nextExpires !== row.expiresAt) body.expiresAt = nextExpires;
        if (isActive !== row.isActive) body.isActive = isActive;
        if ((source.trim() || null) !== (row.source ?? null)) body.source = source.trim() || null;

        if (Object.keys(body).length === 0) {
          onDone();
          return;
        }
        const response = await fetch(`/api/admin/coupons/${row.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!response.ok) {
          setError(await readApiError(response));
          return;
        }
      } else {
        const response = await fetch('/api/admin/coupons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseId,
            code: code.trim() || null,
            discountType,
            discountValue: Number(discountValue),
            finalPrice: Number(finalPrice),
            expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
            isActive,
            source: source.trim() || null,
          }),
        });
        if (!response.ok) {
          setError(await readApiError(response));
          return;
        }
      }
      onDone();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor={`${formId}-course`} className={labelClass}>Course</label>
        <select
          id={`${formId}-course`}
          className={selectClass}
          value={courseId}
          onChange={(event) => setCourseId(event.target.value)}
          required
        >
          <option value="" disabled>Select a course</option>
          {courseOptions.map((course) => (
            <option key={course.id} value={course.id}>{course.title}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${formId}-code`} className={labelClass}>Code</label>
          <input
            id={`${formId}-code`}
            className={inputClass}
            maxLength={50}
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor={`${formId}-discount-type`} className={labelClass}>Discount type</label>
          <select
            id={`${formId}-discount-type`}
            className={selectClass}
            value={discountType}
            onChange={(event) => setDiscountType(event.target.value as CouponRow['discountType'])}
          >
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED">Fixed amount</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${formId}-discount-value`} className={labelClass}>Discount value</label>
          <input
            id={`${formId}-discount-value`}
            type="number"
            min={0}
            step="0.01"
            className={inputClass}
            value={discountValue}
            onChange={(event) => setDiscountValue(event.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor={`${formId}-final-price`} className={labelClass}>Final price</label>
          <input
            id={`${formId}-final-price`}
            type="number"
            min={0}
            step="0.01"
            className={inputClass}
            value={finalPrice}
            onChange={(event) => setFinalPrice(event.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${formId}-expires`} className={labelClass}>Expires</label>
          <input
            id={`${formId}-expires`}
            type="datetime-local"
            className={inputClass}
            value={expiresAt}
            onChange={(event) => setExpiresAt(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor={`${formId}-source`} className={labelClass}>Source</label>
          <input
            id={`${formId}-source`}
            className={inputClass}
            maxLength={100}
            value={source}
            onChange={(event) => setSource(event.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id={`${formId}-active`}
          type="checkbox"
          checked={isActive}
          onChange={(event) => setIsActive(event.target.checked)}
          className="focus-ring h-4 w-4 rounded-sm border-border bg-card"
        />
        <label htmlFor={`${formId}-active`} className="text-sm font-medium">Active</label>
      </div>

      {error ? (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className={`${buttonClass('primary')} disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {busy ? (isEdit ? 'Saving…' : 'Adding…') : isEdit ? 'Save changes' : 'Add coupon'}
        </button>
        {isEdit && onCancel ? (
          <button type="button" onClick={onCancel} className={buttonClass('secondary')}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
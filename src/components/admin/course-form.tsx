'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { buttonClass } from '@/components/button';

export type CourseFormOption = {
  id: string;
  name: string;
};

type Props = {
  platforms: CourseFormOption[];
  categories: CourseFormOption[];
};

type Status = 'idle' | 'saving' | 'saved' | 'error';

const inputClass = 'focus-ring w-full rounded-md border border-border bg-card px-4 py-2 text-sm';

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function CourseForm({ platforms, categories }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = buildPayload(form);
    const validationError = validatePayload(payload);

    if (validationError) {
      setError(validationError);
      setStatus('error');
      return;
    }

    setStatus('saving');
    setError(null);

    try {
      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => null)) as { message?: string } | null;
      if (!res.ok) {
        setError(body?.message ?? 'Failed to create course');
        setStatus('error');
        return;
      }
      form.reset();
      setStatus('saved');
      router.refresh();
    } catch {
      setError('Network error, try again');
      setStatus('error');
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <fieldset className="rounded-lg border border-border p-5">
        <legend className="px-2 text-sm font-medium">Basics</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" htmlFor="course-title">
            <input id="course-title" name="title" required maxLength={200} className={inputClass} placeholder="React basics" />
          </Field>
          <Field label="Slug" htmlFor="course-slug" hint="Lowercase letters, numbers, and hyphens.">
            <input
              id="course-slug"
              name="slug"
              required
              maxLength={200}
              className={`${inputClass} font-mono`}
              placeholder="react-basics"
            />
          </Field>
          <Field label="External ID" htmlFor="course-external">
            <input id="course-external" name="externalId" maxLength={100} className={inputClass} placeholder="Optional sync identifier" />
          </Field>
        </div>
      </fieldset>

      <fieldset className="rounded-lg border border-border p-5">
        <legend className="px-2 text-sm font-medium">Platform and category</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Platform" htmlFor="course-platform">
            <select id="course-platform" name="platformId" required defaultValue="" className={inputClass}>
              <option value="" disabled>
                Select a platform
              </option>
              {platforms.map((platform) => (
                <option key={platform.id} value={platform.id}>
                  {platform.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Category" htmlFor="course-category">
            <select id="course-category" name="categoryId" defaultValue="" className={inputClass}>
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </fieldset>

      <fieldset className="rounded-lg border border-border p-5">
        <legend className="px-2 text-sm font-medium">Pricing</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Original price" htmlFor="course-price">
            <input id="course-price" name="originalPrice" type="number" required min={0} step="0.01" className={inputClass} placeholder="0.00" />
          </Field>
          <Field label="Currency" htmlFor="course-currency" hint="Three letters, for example USD.">
            <input id="course-currency" name="currency" defaultValue="USD" maxLength={3} className={inputClass} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="rounded-lg border border-border p-5">
        <legend className="px-2 text-sm font-medium">Level and language</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Level" htmlFor="course-level">
            <select id="course-level" name="level" defaultValue="ALL_LEVELS" className={inputClass}>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
              <option value="ALL_LEVELS">All levels</option>
            </select>
          </Field>
          <Field label="Language" htmlFor="course-language">
            <input id="course-language" name="language" defaultValue="English" maxLength={50} className={inputClass} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="rounded-lg border border-border p-5">
        <legend className="px-2 text-sm font-medium">Course copy</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Headline" htmlFor="course-headline">
            <input id="course-headline" name="headline" maxLength={500} className={inputClass} />
          </Field>
          <Field label="Instructor" htmlFor="course-instructor">
            <input id="course-instructor" name="instructorName" maxLength={100} className={inputClass} />
          </Field>
          <Field label="Short description" htmlFor="course-short" hint="Used in search results and metadata.">
            <textarea id="course-short" name="shortDescription" rows={2} maxLength={320} className={inputClass} />
          </Field>
          <Field label="Instructor bio" htmlFor="course-bio">
            <textarea id="course-bio" name="instructorBio" rows={2} maxLength={5000} className={inputClass} />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Description" htmlFor="course-description">
            <textarea id="course-description" name="description" rows={6} maxLength={10000} className={inputClass} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="rounded-lg border border-border p-5">
        <legend className="px-2 text-sm font-medium">Links</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Direct URL" htmlFor="course-direct">
            <input id="course-direct" name="directUrl" type="url" required className={inputClass} placeholder="https://..." />
          </Field>
          <Field label="Affiliate URL" htmlFor="course-affiliate">
            <input id="course-affiliate" name="affiliateUrl" type="url" className={inputClass} placeholder="https://..." />
          </Field>
          <Field label="Thumbnail URL" htmlFor="course-thumbnail">
            <input id="course-thumbnail" name="thumbnailUrl" type="url" className={inputClass} placeholder="https://..." />
          </Field>
        </div>
      </fieldset>

      <fieldset className="rounded-lg border border-border p-5">
        <legend className="px-2 text-sm font-medium">Metrics</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Duration" htmlFor="course-duration">
            <input id="course-duration" name="duration" maxLength={20} className={inputClass} placeholder="12h 30m" />
          </Field>
          <Field label="Lecture count" htmlFor="course-lectures">
            <input id="course-lectures" name="lectureCount" type="number" min={0} className={inputClass} />
          </Field>
          <Field label="Review count" htmlFor="course-reviews">
            <input id="course-reviews" name="reviewCount" type="number" min={0} defaultValue={0} className={inputClass} />
          </Field>
          <Field label="Student count" htmlFor="course-students">
            <input id="course-students" name="studentCount" type="number" min={0} defaultValue={0} className={inputClass} />
          </Field>
          <Field label="Rating" htmlFor="course-rating" hint="Between 0 and 5, one decimal.">
            <input id="course-rating" name="rating" type="number" min={0} max={5} step="0.1" className={inputClass} placeholder="4.5" />
          </Field>
        </div>
      </fieldset>

      <fieldset className="rounded-lg border border-border p-5">
        <legend className="px-2 text-sm font-medium">Status</legend>
        <div className="flex flex-wrap gap-6 pt-1">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" name="isActive" defaultChecked className="focus-ring h-4 w-4 accent-accent" />
            Active
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" name="isFeatured" className="focus-ring h-4 w-4 accent-accent" />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" name="isPosted" className="focus-ring h-4 w-4 accent-accent" />
            Posted
          </label>
        </div>
      </fieldset>

      {status === 'error' && error ? (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={status === 'saving'}
          className={buttonClass('primary', 'disabled:cursor-not-allowed disabled:opacity-60')}
        >
          {status === 'saving' ? 'Saving...' : 'Create course'}
        </button>
        {status === 'saved' ? (
          <p aria-live="polite" className="text-sm text-muted-foreground">
            Course created. It now appears in the list above.
          </p>
        ) : null}
      </div>
    </form>
  );
}

function buildPayload(form: HTMLFormElement): Record<string, unknown> {
  const formData = new FormData(form);

  const text = (name: string) => {
    const value = formData.get(name);
    return typeof value === 'string' ? value.trim() : '';
  };
  const optionalText = (name: string) => {
    const value = text(name);
    return value === '' ? null : value;
  };
  const number = (name: string, fallback: number) => {
    const value = Number(text(name));
    return Number.isFinite(value) ? value : fallback;
  };
  const optionalNumber = (name: string) => {
    const value = text(name);
    if (value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };
  const isChecked = (name: string) => formData.get(name) !== null;

  return {
    title: text('title'),
    slug: text('slug'),
    platformId: text('platformId'),
    categoryId: optionalText('categoryId'),
    originalPrice: number('originalPrice', 0),
    currency: text('currency').toUpperCase() || 'USD',
    level: text('level') || 'ALL_LEVELS',
    shortDescription: optionalText('shortDescription'),
    description: optionalText('description'),
    headline: optionalText('headline'),
    instructorName: optionalText('instructorName'),
    instructorBio: optionalText('instructorBio'),
    language: optionalText('language'),
    thumbnailUrl: optionalText('thumbnailUrl'),
    directUrl: text('directUrl'),
    affiliateUrl: optionalText('affiliateUrl'),
    duration: optionalText('duration'),
    lectureCount: optionalNumber('lectureCount'),
    reviewCount: number('reviewCount', 0),
    studentCount: number('studentCount', 0),
    rating: optionalNumber('rating'),
    isActive: isChecked('isActive'),
    isFeatured: isChecked('isFeatured'),
    isPosted: isChecked('isPosted'),
    externalId: optionalText('externalId'),
  };
}

function validatePayload(payload: Record<string, unknown>): string | null {
  const title = payload.title as string;
  const slug = payload.slug as string;

  if (title.length < 3) return 'Title must be at least 3 characters.';
  if (!/^[a-z0-9-]+$/.test(slug)) return 'Slug must use lowercase letters, numbers, and hyphens only.';
  if (!payload.platformId) return 'Platform is required.';
  if (typeof payload.originalPrice !== 'number' || payload.originalPrice < 0) {
    return 'Original price must be a number of 0 or higher.';
  }
  if (!isHttpUrl(payload.directUrl as string)) return 'Direct URL must be a valid http(s) URL.';

  const thumbnailUrl = payload.thumbnailUrl as string | null;
  if (thumbnailUrl && !isHttpUrl(thumbnailUrl)) return 'Thumbnail URL must be a valid http(s) URL.';

  const affiliateUrl = payload.affiliateUrl as string | null;
  if (affiliateUrl && !isHttpUrl(affiliateUrl)) return 'Affiliate URL must be a valid http(s) URL.';

  return null;
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
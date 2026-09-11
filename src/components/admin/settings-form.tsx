'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { buttonClass } from '@/components/button';

export interface SiteSettingsFields {
  coursesVerified: string;
  studentSavings: string;
  uptime: string;
  acceptanceRate: string;
  hostingCost: string;
  priceMonitoring: string;
  missionTitle: string;
  missionSubtitle: string;
  missionDescription: string;
}

type CatalogKey = 'coursesVerified' | 'studentSavings' | 'uptime' | 'acceptanceRate' | 'hostingCost' | 'priceMonitoring';

const CATALOG_FIELDS: { key: CatalogKey; label: string; maxLength: number }[] = [
  { key: 'coursesVerified', label: 'Verified courses', maxLength: 100 },
  { key: 'studentSavings', label: 'Student savings', maxLength: 100 },
  { key: 'uptime', label: 'Uptime', maxLength: 100 },
  { key: 'acceptanceRate', label: 'Acceptance rate', maxLength: 100 },
  { key: 'hostingCost', label: 'Hosting cost', maxLength: 100 },
  { key: 'priceMonitoring', label: 'Price monitoring', maxLength: 100 },
];

export function SettingsForm({ settings }: { settings: SiteSettingsFields }) {
  const router = useRouter();
  const [values, setValues] = useState<SiteSettingsFields>(settings);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  function updateField(key: keyof SiteSettingsFields) {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((prev) => ({ ...prev, [key]: event.target.value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('saving');
    setError(null);

    const body: Partial<SiteSettingsFields> = {};
    (Object.keys(values) as (keyof SiteSettingsFields)[]).forEach((key) => {
      const value = values[key].trim();
      if (value && value !== settings[key]) {
        body[key] = value;
      }
    });

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const payload = (await res.json()) as { message?: string };
      if (!res.ok) {
        throw new Error(payload.message || 'Failed to update settings');
      }

      setStatus('saved');
      router.refresh();
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-8">
      <fieldset className="rounded-lg border border-border p-5">
        <legend className="px-2 text-sm font-medium">Catalog claims</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          {CATALOG_FIELDS.map(({ key, label, maxLength }) => (
            <div key={key}>
              <label htmlFor={key} className="mb-1 block text-sm font-medium">
                {label}
              </label>
              <input
                id={key}
                name={key}
                type="text"
                maxLength={maxLength}
                value={values[key]}
                onChange={updateField(key)}
                className="focus-ring w-full rounded-md border border-border bg-card px-4 py-2 text-sm"
              />
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="rounded-lg border border-border p-5">
        <legend className="px-2 text-sm font-medium">Mission content</legend>
        <div className="grid gap-4">
          <div>
            <label htmlFor="missionTitle" className="mb-1 block text-sm font-medium">
              Title
            </label>
            <input
              id="missionTitle"
              name="missionTitle"
              type="text"
              maxLength={200}
              value={values.missionTitle}
              onChange={updateField('missionTitle')}
              className="focus-ring w-full rounded-md border border-border bg-card px-4 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="missionSubtitle" className="mb-1 block text-sm font-medium">
              Subtitle
            </label>
            <input
              id="missionSubtitle"
              name="missionSubtitle"
              type="text"
              maxLength={255}
              value={values.missionSubtitle}
              onChange={updateField('missionSubtitle')}
              className="focus-ring w-full rounded-md border border-border bg-card px-4 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="missionDescription" className="mb-1 block text-sm font-medium">
              Description
            </label>
            <textarea
              id="missionDescription"
              name="missionDescription"
              rows={6}
              maxLength={5000}
              value={values.missionDescription}
              onChange={updateField('missionDescription')}
              className="focus-ring w-full rounded-md border border-border bg-card px-4 py-2 text-sm"
            />
          </div>
        </div>
      </fieldset>

      {status === 'error' && error ? (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={status === 'saving'}
          className={buttonClass('primary', 'disabled:cursor-not-allowed disabled:opacity-60')}
        >
          {status === 'saving' ? 'Saving…' : 'Save changes'}
        </button>
        {status === 'saved' ? <p className="text-sm text-muted-foreground">Saved</p> : null}
      </div>
    </form>
  );
}
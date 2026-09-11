'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/button';

const levelOptions = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
  { value: 'ALL_LEVELS', label: 'All levels' },
];

const flagFields = [
  { name: 'hasJobGuarantee', label: 'Job guarantee' },
  { name: 'hasCertificate', label: 'Certificate' },
  { name: 'hasFreeResources', label: 'Free resources' },
  { name: 'isShortPath', label: 'Short path' },
] as const;

const inputClass =
  'w-full rounded-md border border-border bg-card px-4 py-2 text-sm focus-ring';

export function RoadmapForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const title = String(formData.get('title') ?? '').trim();
    const slug = String(formData.get('slug') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const iconName = String(formData.get('iconName') ?? '').trim();
    const estimatedHours = String(formData.get('estimatedHours') ?? '').trim();
    const sortOrder = String(formData.get('sortOrder') ?? '').trim();
    const level = String(formData.get('level') ?? '');
    const skillTags = String(formData.get('skillTags') ?? '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    const isActive = formData.get('isActive') !== null;
    const isFeatured = formData.get('isFeatured') !== null;

    const payload = {
      title,
      slug,
      ...(description ? { description } : {}),
      ...(iconName ? { iconName } : {}),
      ...(estimatedHours ? { estimatedHours: Number(estimatedHours) } : {}),
      ...(sortOrder ? { sortOrder: Number(sortOrder) } : {}),
      ...(level ? { level } : {}),
      ...(skillTags.length ? { skillTags } : {}),
      isActive,
      ...(isFeatured ? { isFeatured: true } : {}),
      ...(formData.get('hasJobGuarantee') !== null ? { hasJobGuarantee: true } : {}),
      ...(formData.get('hasCertificate') !== null ? { hasCertificate: true } : {}),
      ...(formData.get('hasFreeResources') !== null ? { hasFreeResources: true } : {}),
      ...(formData.get('isShortPath') !== null ? { isShortPath: true } : {}),
    };

    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/roadmaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create roadmap');
      }
      form.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create roadmap');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="roadmap-title" className="mb-1 block text-sm font-medium">
            Title
          </label>
          <input
            id="roadmap-title"
            name="title"
            required
            minLength={3}
            maxLength={200}
            placeholder="Full-Stack Developer Roadmap"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="roadmap-slug" className="mb-1 block text-sm font-medium">
            Slug
          </label>
          <input
            id="roadmap-slug"
            name="slug"
            required
            pattern="[a-z0-9-]+"
            placeholder="full-stack-developer"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="roadmap-level" className="mb-1 block text-sm font-medium">
            Level
          </label>
          <select id="roadmap-level" name="level" defaultValue="ALL_LEVELS" className={inputClass}>
            {levelOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="roadmap-icon" className="mb-1 block text-sm font-medium">
            Icon name
          </label>
          <input
            id="roadmap-icon"
            name="iconName"
            maxLength={50}
            placeholder="e.g. Rocket"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="roadmap-hours" className="mb-1 block text-sm font-medium">
            Estimated hours
          </label>
          <input id="roadmap-hours" name="estimatedHours" type="number" min={0} placeholder="400" className={inputClass} />
        </div>
        <div>
          <label htmlFor="roadmap-order" className="mb-1 block text-sm font-medium">
            Sort order
          </label>
          <input id="roadmap-order" name="sortOrder" type="number" min={0} placeholder="0" className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="roadmap-description" className="mb-1 block text-sm font-medium">
          Description
        </label>
        <textarea
          id="roadmap-description"
          name="description"
          maxLength={5000}
          rows={4}
          placeholder="What this path teaches and who it is for."
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="roadmap-tags" className="mb-1 block text-sm font-medium">
          Skill tags
        </label>
        <input
          id="roadmap-tags"
          name="skillTags"
          placeholder="React, TypeScript, Node.js"
          className={inputClass}
        />
        <p className="mt-1 text-xs text-muted-foreground">Comma-separated list.</p>
      </div>

      <fieldset>
        <legend className="mb-2 block text-sm font-medium">Status and highlights</legend>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked
              className="focus-ring h-4 w-4 rounded-sm border-border accent-accent"
            />
            Active
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isFeatured"
              className="focus-ring h-4 w-4 rounded-sm border-border accent-accent"
            />
            Featured
          </label>
          {flagFields.map((flag) => (
            <label key={flag.name} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name={flag.name}
                className="focus-ring h-4 w-4 rounded-sm border-border accent-accent"
              />
              {flag.label}
            </label>
          ))}
        </div>
      </fieldset>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={busy}>
        {busy ? 'Saving...' : 'Create roadmap'}
      </Button>
    </form>
  );
}
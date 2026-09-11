'use client';

import { Fragment, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PencilLine } from 'lucide-react';
import { buttonClass } from '@/components/button';
import { Pagination } from '@/components/pagination';
import {
  ConfirmButton,
  editButtonClass,
  inputClass,
  labelClass,
  readApiError,
} from '@/components/admin/simple-table';

export interface PlatformRow {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  baseUrl: string;
  isActive: boolean;
  courseCount: number;
}

export function PlatformManager({
  rows,
  page,
  totalPages,
  buildHref,
}: {
  rows: PlatformRow[];
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);

  async function remove(id: string) {
    const response = await fetch(`/api/admin/platforms/${id}`, { method: 'DELETE' });
    if (response.ok) {
      router.refresh();
    } else {
      window.alert(await readApiError(response));
    }
  }

  return (
    <div className="mt-8 space-y-8">
      {rows.length ? (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th scope="col" className="px-4 py-3 text-left font-medium text-muted-foreground">Slug</th>
                <th scope="col" className="px-4 py-3 text-left font-medium text-muted-foreground">Base URL</th>
                <th scope="col" className="px-4 py-3 text-left font-medium text-muted-foreground">Courses</th>
                <th scope="col" className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th scope="col" className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <Fragment key={row.id}>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3">
                      <div className="font-medium">{row.name}</div>
                      {row.logoUrl ? (
                        <div className="max-w-[220px] truncate font-mono text-xs text-muted-foreground">{row.logoUrl}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{row.slug}</td>
                    <td className="px-4 py-3">
                      <a
                        href={row.baseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={row.baseUrl}
                        className="focus-ring block max-w-[220px] truncate font-mono text-xs text-muted-foreground hover:text-foreground hover:underline"
                      >
                        {row.baseUrl}
                      </a>
                    </td>
                    <td className="px-4 py-3">{row.courseCount}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-sm bg-muted px-2 py-0.5 text-xs">
                        {row.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setEditingId(row.id)} className={editButtonClass}>
                          <PencilLine className="h-4 w-4" aria-hidden="true" />
                          Edit
                        </button>
                        <ConfirmButton
                          message={`Delete platform "${row.name}"? This cannot be undone.`}
                          onConfirm={() => remove(row.id)}
                        />
                      </div>
                    </td>
                  </tr>
                  {editingId === row.id ? (
                    <tr className="border-b border-border bg-muted">
                      <td colSpan={6} className="px-4 py-5">
                        <PlatformForm
                          row={row}
                          onDone={() => {
                            setEditingId(null);
                            router.refresh();
                          }}
                          onCancel={() => setEditingId(null)}
                        />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />

      <section aria-labelledby="create-platform-heading">
        <h2 id="create-platform-heading" className="text-xl font-semibold tracking-tight">Add a platform</h2>
        <div className="mt-4 max-w-xl rounded-lg border border-border bg-card p-6">
          <PlatformForm onDone={() => router.refresh()} />
        </div>
      </section>
    </div>
  );
}

function PlatformForm({
  row,
  onDone,
  onCancel,
}: {
  row?: PlatformRow;
  onDone: () => void;
  onCancel?: () => void;
}) {
  const isEdit = Boolean(row);
  const formId = isEdit ? `edit-${row!.id}` : 'new';
  const [name, setName] = useState(row?.name ?? '');
  const [slug, setSlug] = useState(row?.slug ?? '');
  const [logoUrl, setLogoUrl] = useState(row?.logoUrl ?? '');
  const [baseUrl, setBaseUrl] = useState(row?.baseUrl ?? '');
  const [isActive, setIsActive] = useState(row?.isActive ?? true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const body = {
        name: name.trim(),
        slug: slug.trim(),
        logoUrl: logoUrl.trim() || null,
        baseUrl: baseUrl.trim(),
        isActive,
      };
      const response = await fetch(isEdit ? `/api/admin/platforms/${row!.id}` : '/api/admin/platforms', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        setError(await readApiError(response));
        return;
      }
      onDone();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${formId}-name`} className={labelClass}>Name</label>
          <input
            id={`${formId}-name`}
            className={inputClass}
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor={`${formId}-slug`} className={labelClass}>Slug</label>
          <input
            id={`${formId}-slug`}
            className={inputClass}
            maxLength={100}
            pattern="[a-z0-9-]+"
            placeholder="course-platform"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            required
          />
        </div>
      </div>
      <div>
        <label htmlFor={`${formId}-logo`} className={labelClass}>Logo URL</label>
        <input
          id={`${formId}-logo`}
          type="url"
          className={inputClass}
          placeholder="https://example.com/logo.png"
          value={logoUrl}
          onChange={(event) => setLogoUrl(event.target.value)}
        />
      </div>
      <div>
        <label htmlFor={`${formId}-base`} className={labelClass}>Base URL</label>
        <input
          id={`${formId}-base`}
          type="url"
          className={inputClass}
          placeholder="https://example.com"
          value={baseUrl}
          onChange={(event) => setBaseUrl(event.target.value)}
          required
        />
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
          className={`${buttonClass('primary', 'px-5 py-2')} disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {busy ? (isEdit ? 'Saving…' : 'Adding…') : isEdit ? 'Save changes' : 'Add platform'}
        </button>
        {isEdit && onCancel ? (
          <button type="button" onClick={onCancel} className={buttonClass('secondary', 'px-5 py-2')}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
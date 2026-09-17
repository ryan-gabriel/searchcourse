'use client';

import { useState } from 'react';
import { buttonClass } from '@/components/button';
import { inputClass, labelClass, readApiError } from '@/components/admin/simple-table';
import { AdminManager } from '@/components/admin/admin-manager';

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconName: string | null;
  sortOrder: number;
  courseCount: number;
}

export function CategoryManager({
  rows,
  page,
  totalPages,
  buildHref,
}: {
  rows: CategoryRow[];
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
      createHeading="Add a category"
      deleteEndpoint={(id) => `/api/admin/categories/${id}`}
      deleteMessage={(row) => `Delete category "${row.name}"? This cannot be undone.`}
      columns={[
        { header: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
        { header: 'Slug', render: (row) => <span className="font-mono text-xs">{row.slug}</span> },
        { header: 'Courses', render: (row) => row.courseCount },
        { header: 'Sort', render: (row) => row.sortOrder },
      ]}
      renderForm={({ row, onDone, onCancel }) => (
        <CategoryForm row={row} onDone={onDone} onCancel={onCancel} />
      )}
    />
  );
}

function CategoryForm({
  row,
  onDone,
  onCancel,
}: {
  row?: CategoryRow;
  onDone: () => void;
  onCancel?: () => void;
}) {
  const isEdit = Boolean(row);
  const formId = isEdit ? `edit-${row!.id}` : 'new';
  const [name, setName] = useState(row?.name ?? '');
  const [slug, setSlug] = useState(row?.slug ?? '');
  const [description, setDescription] = useState(row?.description ?? '');
  const [sortOrder, setSortOrder] = useState(String(row?.sortOrder ?? 0));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(isEdit ? `/api/admin/categories/${row!.id}` : '/api/admin/categories', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || null,
          sortOrder: Number(sortOrder) || 0,
        }),
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
          placeholder="topic-name"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor={`${formId}-description`} className={labelClass}>Description</label>
        <textarea
          id={`${formId}-description`}
          className={inputClass}
          rows={3}
          maxLength={500}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>
      <div>
        <label htmlFor={`${formId}-sort`} className={labelClass}>Sort order</label>
        <input
          id={`${formId}-sort`}
          type="number"
          step={1}
          className={inputClass}
          value={sortOrder}
          onChange={(event) => setSortOrder(event.target.value)}
        />
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
          {busy ? (isEdit ? 'Saving…' : 'Adding…') : isEdit ? 'Save changes' : 'Add category'}
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
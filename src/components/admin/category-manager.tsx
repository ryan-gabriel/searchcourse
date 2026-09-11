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
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);

  async function remove(id: string) {
    const response = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
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
                <th scope="col" className="px-4 py-3 text-left font-medium text-muted-foreground">Courses</th>
                <th scope="col" className="px-4 py-3 text-left font-medium text-muted-foreground">Sort</th>
                <th scope="col" className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <Fragment key={row.id}>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-medium">{row.name}</td>
                    <td className="px-4 py-3 font-mono text-xs">{row.slug}</td>
                    <td className="px-4 py-3">{row.courseCount}</td>
                    <td className="px-4 py-3">{row.sortOrder}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setEditingId(row.id)} className={editButtonClass}>
                          <PencilLine className="h-4 w-4" aria-hidden="true" />
                          Edit
                        </button>
                        <ConfirmButton
                          message={`Delete category "${row.name}"? This cannot be undone.`}
                          onConfirm={() => remove(row.id)}
                        />
                      </div>
                    </td>
                  </tr>
                  {editingId === row.id ? (
                    <tr className="border-b border-border bg-muted">
                      <td colSpan={5} className="px-4 py-5">
                        <CategoryForm
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

      <section aria-labelledby="create-category-heading">
        <h2 id="create-category-heading" className="text-xl font-semibold tracking-tight">Add a category</h2>
        <div className="mt-4 max-w-xl rounded-lg border border-border bg-card p-6">
          <CategoryForm onDone={() => router.refresh()} />
        </div>
      </section>
    </div>
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
          className={`${buttonClass('primary', 'px-5 py-2')} disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {busy ? (isEdit ? 'Saving…' : 'Adding…') : isEdit ? 'Save changes' : 'Add category'}
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
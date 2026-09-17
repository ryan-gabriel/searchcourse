'use client';

import { Fragment, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { PencilLine } from 'lucide-react';
import { Pagination } from '@/components/pagination';
import { ConfirmButton, editButtonClass, readApiError } from '@/components/admin/simple-table';

export interface AdminManagerColumn<T> {
  header: string;
  render: (row: T) => ReactNode;
}

export function AdminManager<T extends { id: string }>({
  rows,
  page,
  totalPages,
  buildHref,
  columns,
  deleteEndpoint,
  deleteMessage,
  createHeading,
  renderForm,
}: {
  rows: T[];
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
  columns: AdminManagerColumn<T>[];
  deleteEndpoint: (id: string) => string;
  deleteMessage: (row: T) => string;
  createHeading: string;
  renderForm: (props: { row?: T; onDone: () => void; onCancel?: () => void }) => ReactNode;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const colSpan = columns.length + 1;

  async function remove(id: string) {
    const response = await fetch(deleteEndpoint(id), { method: 'DELETE' });
    if (response.ok) {
      router.refresh();
    } else {
      window.alert(await readApiError(response));
    }
  }

  function close() {
    setEditingId(null);
    router.refresh();
  }

  return (
    <div className="mt-8 space-y-8">
      {rows.length ? (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {columns.map((column) => (
                  <th key={column.header} scope="col" className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {column.header}
                  </th>
                ))}
                <th scope="col" className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <Fragment key={row.id}>
                  <tr className="border-b border-border">
                    {columns.map((column) => (
                      <td key={column.header} className="px-4 py-3">
                        {column.render(row)}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setEditingId(row.id)} className={editButtonClass}>
                          <PencilLine className="h-4 w-4" aria-hidden="true" />
                          Edit
                        </button>
                        <ConfirmButton message={deleteMessage(row)} onConfirm={() => remove(row.id)} />
                      </div>
                    </td>
                  </tr>
                  {editingId === row.id ? (
                    <tr className="border-b border-border bg-muted">
                      <td colSpan={colSpan} className="px-4 py-5">
                        {renderForm({ row, onDone: close, onCancel: () => setEditingId(null) })}
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

      <section aria-labelledby="create-heading">
        <h2 id="create-heading" className="text-xl font-semibold tracking-tight">{createHeading}</h2>
        <div className="mt-4 max-w-xl rounded-lg border border-border bg-card p-6">
          {renderForm({ onDone: () => router.refresh() })}
        </div>
      </section>
    </div>
  );
}
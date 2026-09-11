'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';

export const inputClass = 'focus-ring w-full rounded-md border border-border bg-card px-4 py-2 text-sm';
export const labelClass = 'mb-1 block text-sm font-medium';
export const selectClass = 'focus-ring w-full rounded-md border border-border bg-card px-4 py-2 text-sm';
export const editButtonClass =
  'inline-flex items-center gap-2 rounded-md border border-border bg-card px-2 py-1 text-sm font-medium hover:bg-muted focus-ring';

export async function readApiError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string; errors?: { message?: string }[] };
    if (body.message && Array.isArray(body.errors) && body.errors.length > 0) {
      return `${body.message}: ${body.errors.map((error) => error.message ?? 'Invalid value').join(', ')}`;
    }
    return body.message ?? 'Request failed';
  } catch {
    return 'Request failed';
  }
}

export function ConfirmButton({
  message,
  onConfirm,
  className = '',
}: {
  message: string;
  onConfirm: () => void | Promise<void>;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (!window.confirm(message)) return;
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className={`inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-destructive hover:bg-muted focus-ring disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" />
      {busy ? 'Deleting…' : 'Delete'}
    </button>
  );
}
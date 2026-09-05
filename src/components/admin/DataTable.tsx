'use client';

import React from "react";

export interface Column<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (row: T) => React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  keyField,
  renderActions,
}: {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  renderActions?: (row: T) => React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-surface-muted text-left">
          <tr>
            {columns.map((c) => (
              <th key={String(c.accessorKey)} className="px-4 py-3 font-medium">{c.header}</th>
            ))}
            {renderActions && <th className="px-4 py-3 font-medium">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={String(row[keyField])} className="border-t border-border">
              {columns.map((c) => (
                <td key={String(c.accessorKey)} className="px-4 py-3">
                  {c.cell ? c.cell(row) : String(row[c.accessorKey])}
                </td>
              ))}
              {renderActions && (
                <td className="px-4 py-3">
                  <div className="flex gap-1">{renderActions(row)}</div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

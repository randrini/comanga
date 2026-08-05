"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  getRowKey: (row: T) => string | number;
}

export function DataTable<T>({
  columns,
  data,
  onRowClick,
  emptyMessage = "No data found.",
  getRowKey,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-text-muted text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="sticky top-0 z-10">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-3 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider bg-bg-secondary border-b border-border",
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((row, index) => (
            <tr
              key={getRowKey(row)}
              onClick={() => onRowClick?.(row)}
              className={cn(
                index % 2 === 0 ? "bg-bg-primary" : "bg-bg-primary/50",
                onRowClick &&
                  "cursor-pointer hover:bg-bg-hover transition-colors duration-100",
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn("px-3 py-2 text-text-primary", col.className)}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

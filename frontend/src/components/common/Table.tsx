import React from 'react';
import { Loader2 } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  width?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor?: (item: T, index?: number) => string;
  isLoading?: boolean;
  emptyText?: string;
  onRowClick?: (item: T) => void;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyText = 'No records found',
  onRowClick,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center text-[var(--color-text-muted)]">
        <Loader2 size={24} className="animate-spin text-[var(--color-primary)] mb-2" />
        <span className="text-sm">Loading data...</span>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-[var(--color-border)]">
      <table className="w-full text-left text-sm border-collapse">
        <thead className="bg-[var(--color-surface-secondary)] border-b border-[var(--color-border)]">
          <tr>
            {columns.map((col, idx) => (
              <th key={col.key || `col-${idx}`} style={{ width: col.width }} className="px-4 py-3 text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-[var(--color-text-muted)] text-sm">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((item, idx) => {
              const rowKey = keyExtractor
                ? `${keyExtractor(item, idx)}-${idx}`
                : (item as any)?.id
                  ? `${(item as any).id}-${idx}`
                  : `row-${idx}`;
              return (
                <tr
                  key={rowKey}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`transition-colors hover:bg-[var(--color-primary-soft)] ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((col, cIdx) => (
                    <td key={col.key || `cell-${cIdx}`} className="px-4 py-3.5 text-[var(--color-text-primary)]">
                      {col.render ? col.render(item) : (item as Record<string, unknown>)[col.key] as React.ReactNode}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

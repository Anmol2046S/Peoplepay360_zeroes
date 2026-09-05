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
  keyExtractor: (item: T) => string;
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
      <div className="w-full py-16 flex flex-col items-center justify-center text-gray-400">
        <Loader2 size={24} className="animate-spin text-indigo-500 mb-2" />
        <span className="text-sm">Loading data...</span>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-gray-100 dark:border-white/10">
      <table className="w-full text-left text-sm border-collapse">
        <thead className="bg-gray-50/75 dark:bg-white/[0.03] border-b border-gray-100 dark:border-white/10">
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ width: col.width }} className="px-4 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-gray-400 text-sm">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick && onRowClick(item)}
                className={`transition-colors hover:bg-gray-50/50 dark:hover:bg-white/[0.02] ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3.5 text-gray-800 dark:text-gray-200">
                    {col.render ? col.render(item) : (item as Record<string, unknown>)[col.key] as React.ReactNode}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

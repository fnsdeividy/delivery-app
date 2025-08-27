"use client";

import { ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  className?: string;
}

export interface Action<T> {
  key: string;
  label: string;
  onClick: (item: T) => void;
  icon?: ReactNode;
  className?: string;
  disabled?: (item: T) => boolean;
  title?: (item: T) => string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions: Action<T>[];
  emptyMessage?: string;
  emptyMessageSubtitle?: string;
  className?: string;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
}

export function DataTable<T>({
  data,
  columns,
  actions,
  emptyMessage = "Nenhum item encontrado",
  emptyMessageSubtitle,
  className = "",
  onRowClick,
  isLoading = false,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-6 sm:py-8 md:py-12">
        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-6 sm:py-8 md:py-12 bg-white rounded-lg shadow-sm">
        <div className="text-gray-400 text-3xl sm:text-4xl md:text-6xl mb-2 sm:mb-3 md:mb-4">
          📋
        </div>
        <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-900 mb-1 sm:mb-2">
          {emptyMessage}
        </h3>
        {emptyMessageSubtitle && (
          <p className="text-xs sm:text-sm md:text-base text-gray-500 mb-2 sm:mb-3 md:mb-4 px-3 sm:px-4">
            {emptyMessageSubtitle}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.className || ""
                  }`}
                >
                  {column.header}
                </th>
              ))}
              <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr
                key={index}
                className={`hover:bg-gray-50 transition-colors duration-150 ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 ${
                      column.className || ""
                    }`}
                  >
                    {column.render(item)}
                  </td>
                ))}
                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-1 sm:space-x-2">
                    {actions.map((action) => {
                      const isDisabled = action.disabled?.(item) || false;
                      const title = action.title?.(item) || action.label;

                      return (
                        <button
                          key={action.key}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isDisabled) {
                              action.onClick(item);
                            }
                          }}
                          disabled={isDisabled}
                          className={`p-1 sm:p-1.5 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 ${
                            action.className || ""
                          }`}
                          title={title}
                        >
                          {action.icon || action.label}
                        </button>
                      );
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

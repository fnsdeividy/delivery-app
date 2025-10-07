"use client";

import { ReactNode } from "react";

export interface CardRenderer<T> {
  key: string;
  render: (item: T) => ReactNode;
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

interface DataCardListProps<T> {
  data: T[];
  cardRenderer: CardRenderer<T>;
  actions: Action<T>[];
  emptyMessage?: string;
  emptyMessageSubtitle?: string;
  className?: string;
  onCardClick?: (item: T) => void;
  isLoading?: boolean;
}

export function DataCardList<T>({
  data,
  cardRenderer,
  actions,
  emptyMessage = "Nenhum item encontrado",
  emptyMessageSubtitle,
  className = "",
  onCardClick,
  isLoading = false,
}: DataCardListProps<T>) {
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
          📱
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
    <div className={`md:hidden ${className}`}>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {data.map((item, index) => (
          <div
            key={index}
            className={`p-3 sm:p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors duration-150 ${
              onCardClick ? "cursor-pointer" : ""
            }`}
            onClick={() => onCardClick?.(item)}
          >
            <div className="space-y-3">
              {/* Conteúdo do card */}
              <div className="min-w-0">{cardRenderer.render(item)}</div>

              {/* Ações */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100">
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
                      className={`text-sm p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 ${
                        action.className || ""
                      }`}
                      title={title}
                    >
                      {action.icon || action.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

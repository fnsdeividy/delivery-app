"use client";

import { ArrowsClockwise, MagnifyingGlass } from "@phosphor-icons/react";
import { useCallback, useEffect, useState } from "react";

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
  isLoading?: boolean;
  debounceMs?: number;
  className?: string;
  disabled?: boolean;
}

export function SearchBar({
  placeholder = "Buscar...",
  value,
  onChange,
  onSearch,
  isLoading = false,
  debounceMs = 300,
  className = "",
  disabled = false,
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState(value);

  // Debounce para busca automática
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== value) {
        onChange(searchTerm);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, value, onChange, debounceMs]);

  // Sincronizar com valor externo
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  const handleSearch = useCallback(() => {
    if (onSearch) {
      onSearch();
    } else {
      onChange(searchTerm);
    }
  }, [onSearch, onChange, searchTerm]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearch();
      }
    },
    [handleSearch]
  );

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
        <MagnifyingGlass
          size={16}
          className="text-gray-400 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0"
        />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="block w-full pl-7 sm:pl-9 md:pl-10 pr-8 sm:pr-10 py-2 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs sm:text-sm md:text-base disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200"
      />
      <div className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center">
        {isLoading ? (
          <ArrowsClockwise
            size={16}
            className="animate-spin text-gray-400 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0"
          />
        ) : (
          <button
            onClick={handleSearch}
            disabled={disabled}
            className="text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
            title="Buscar"
          >
            <MagnifyingGlass
              size={16}
              className="sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0"
            />
          </button>
        )}
      </div>
    </div>
  );
}

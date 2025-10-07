import { useCallback, useEffect, useState } from "react";

export interface SearchSuggestion {
  type: "name" | "phone" | "email" | "orderId" | "orderNumber";
  value: string;
  label: string;
  icon: string;
}

export interface UseSearchSuggestionsProps {
  searchTerm: string;
  maxHistoryItems?: number;
  storageKey?: string;
}

export function useSearchSuggestions({
  searchTerm,
  maxHistoryItems = 5,
  storageKey = "order-search-history",
}: UseSearchSuggestionsProps) {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar histórico do localStorage
  useEffect(() => {
    const loadHistory = () => {
      try {
        const savedHistory = localStorage.getItem(storageKey);
        if (savedHistory) {
          const parsed = JSON.parse(savedHistory);
          if (Array.isArray(parsed)) {
            setSearchHistory(parsed);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar histórico de buscas:", error);
      }
    };

    loadHistory();
  }, [storageKey]);

  // Detectar tipo de busca baseado no input
  const detectSearchType = useCallback(
    (value: string): SearchSuggestion["type"] => {
      if (value.includes("@")) return "email";
      if (/^\d+$/.test(value.replace(/\D/g, ""))) return "phone";
      if (/^[A-Z0-9-]+$/i.test(value)) return "orderId";
      return "name";
    },
    []
  );

  // Obter ícone baseado no tipo
  const getSearchIcon = useCallback(
    (type: SearchSuggestion["type"]): string => {
      const icons = {
        name: "User",
        phone: "Phone",
        email: "Envelope",
        orderId: "Hash",
        orderNumber: "Hash",
      };
      return icons[type] || "MagnifyingGlass";
    },
    []
  );

  // Gerar sugestões
  const getSuggestions = useCallback((): SearchSuggestion[] => {
    if (!searchTerm.trim()) {
      return searchHistory.map((term) => ({
        type: detectSearchType(term),
        value: term,
        label: term,
        icon: getSearchIcon(detectSearchType(term)),
      }));
    }

    const filteredHistory = searchHistory.filter((term) =>
      term.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filteredHistory.map((term) => ({
      type: detectSearchType(term),
      value: term,
      label: term,
      icon: getSearchIcon(detectSearchType(term)),
    }));
  }, [searchTerm, searchHistory, detectSearchType, getSearchIcon]);

  // Adicionar termo ao histórico
  const addToHistory = useCallback(
    (term: string) => {
      if (!term.trim()) return;

      const newHistory = [
        term,
        ...searchHistory.filter((item) => item !== term),
      ].slice(0, maxHistoryItems);
      setSearchHistory(newHistory);

      try {
        localStorage.setItem(storageKey, JSON.stringify(newHistory));
      } catch (error) {
        console.error("Erro ao salvar histórico de buscas:", error);
      }
    },
    [searchHistory, maxHistoryItems, storageKey]
  );

  // Limpar histórico
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error("Erro ao limpar histórico de buscas:", error);
    }
  }, [storageKey]);

  // Remover item específico do histórico
  const removeFromHistory = useCallback(
    (term: string) => {
      const newHistory = searchHistory.filter((item) => item !== term);
      setSearchHistory(newHistory);

      try {
        localStorage.setItem(storageKey, JSON.stringify(newHistory));
      } catch (error) {
        console.error("Erro ao remover item do histórico:", error);
      }
    },
    [searchHistory, storageKey]
  );

  return {
    suggestions: getSuggestions(),
    searchHistory,
    addToHistory,
    clearHistory,
    removeFromHistory,
    detectSearchType,
    getSearchIcon,
    isLoading,
  };
}

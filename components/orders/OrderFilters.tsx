import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";
import {
  Calendar,
  Clock,
  Envelope,
  Hash,
  MagnifyingGlass,
  Phone,
  User,
  X,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

interface OrderFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  selectedPaymentStatus: string;
  setSelectedPaymentStatus: (status: string) => void;
  startDate?: string;
  setStartDate?: (date: string) => void;
  endDate?: string;
  setEndDate?: (date: string) => void;
}

export default function OrderFilters({
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus,
  selectedPaymentStatus,
  setSelectedPaymentStatus,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}: OrderFiltersProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Hook para gerenciar sugestões de busca
  const { suggestions, addToHistory, detectSearchType, getSearchIcon } =
    useSearchSuggestions({
      searchTerm,
      maxHistoryItems: 5,
      storageKey: "order-search-history",
    });

  // Obter ícone React baseado no nome do ícone
  const getReactIcon = (iconName: string) => {
    const iconMap = {
      User: <User className="h-4 w-4" />,
      Phone: <Phone className="h-4 w-4" />,
      Envelope: <Envelope className="h-4 w-4" />,
      Hash: <Hash className="h-4 w-4" />,
      MagnifyingGlass: <MagnifyingGlass className="h-4 w-4" />,
    };
    return (
      iconMap[iconName as keyof typeof iconMap] || (
        <MagnifyingGlass className="h-4 w-4" />
      )
    );
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setShowSuggestions(value.length > 0 || suggestions.length > 0);
  };

  const handleSearchSubmit = (value: string) => {
    setSearchTerm(value);
    setShowSuggestions(false);
    addToHistory(value);
    inputRef.current?.blur();
  };

  const clearSearch = () => {
    setSearchTerm("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: any) => {
    handleSearchSubmit(suggestion.value);
  };

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Detectar tipo de busca atual
  const currentSearchType = detectSearchType(searchTerm);

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Campo de Busca Avançado */}
        <div className="flex-1">
          <div className="relative" ref={searchRef}>
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Buscar por cliente, telefone, email ou ID do pedido..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearchSubmit(searchTerm);
                  } else if (e.key === "Escape") {
                    setShowSuggestions(false);
                  }
                }}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Sugestões de Busca */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                <div className="p-2">
                  <div className="text-xs text-gray-500 mb-2 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Buscas recentes
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <div className="text-gray-400">
                        {getReactIcon(suggestion.icon)}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-900">
                          {suggestion.label}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {suggestion.type === "name" && "Nome do cliente"}
                          {suggestion.type === "phone" && "Telefone"}
                          {suggestion.type === "email" && "Email"}
                          {suggestion.type === "orderId" && "ID do pedido"}
                          {suggestion.type === "orderNumber" &&
                            "Número do pedido"}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Indicador de Tipo de Busca */}
          {searchTerm && (
            <div className="mt-2 flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                {getReactIcon(getSearchIcon(currentSearchType))}
                <span className="capitalize">
                  {currentSearchType === "name"
                    ? "Nome"
                    : currentSearchType === "phone"
                    ? "Telefone"
                    : currentSearchType === "email"
                    ? "Email"
                    : currentSearchType === "orderId"
                    ? "ID do pedido"
                    : currentSearchType === "orderNumber"
                    ? "Número do pedido"
                    : "Busca"}
                </span>
              </div>
              <div className="text-xs text-gray-400">
                Buscando em: Nome, Telefone, Email, ID do pedido
              </div>
            </div>
          )}
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Todos os status</option>
            <option value="RECEIVED">Pendente</option>
            <option value="CONFIRMED">Confirmado</option>
            <option value="PREPARING">Preparando</option>
            <option value="READY">Pronto</option>
            <option value="DELIVERING">Saiu para Entrega</option>
            <option value="DELIVERED">Entregue</option>
            <option value="CANCELLED">Cancelado</option>
          </select>

          <select
            value={selectedPaymentStatus}
            onChange={(e) => setSelectedPaymentStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Todos os pagamentos</option>
            <option value="PENDING">Pendente</option>
            <option value="PAID">Pago</option>
            <option value="FAILED">Falhou</option>
            <option value="REFUNDED">Reembolsado</option>
          </select>

          {setStartDate && (
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={startDate || ""}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Data inicial"
              />
            </div>
          )}

          {setEndDate && (
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={endDate || ""}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Data final"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

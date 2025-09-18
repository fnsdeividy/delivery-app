"use client";

import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";
import {
  Calendar,
  Clock,
  ClockCounterClockwise,
  CurrencyDollar,
  Envelope,
  FunnelSimple,
  Hash,
  MagnifyingGlass,
  Phone,
  SortAscending,
  SortDescending,
  User,
  X,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

interface AdvancedOrderFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  selectedPaymentStatus: string;
  setSelectedPaymentStatus: (status: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  startDate?: string;
  setStartDate?: (date: string) => void;
  endDate?: string;
  setEndDate?: (date: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (order: "asc" | "desc") => void;
  minValue?: number;
  setMinValue?: (value: number) => void;
  maxValue?: number;
  setMaxValue?: (value: number) => void;
  showAdvanced: boolean;
  setShowAdvanced: (show: boolean) => void;
}

export default function AdvancedOrderFilters({
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus,
  selectedPaymentStatus,
  setSelectedPaymentStatus,
  selectedType,
  setSelectedType,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  minValue,
  setMinValue,
  maxValue,
  setMaxValue,
  showAdvanced,
  setShowAdvanced,
}: AdvancedOrderFiltersProps) {
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

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setSelectedPaymentStatus("all");
    setSelectedType("all");
    setStartDate?.("");
    setEndDate?.("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setMinValue?.(0);
    setMaxValue?.(0);
  };

  const hasActiveFilters = Boolean(
    searchTerm ||
      selectedStatus !== "all" ||
      selectedPaymentStatus !== "all" ||
      selectedType !== "all" ||
      startDate ||
      endDate ||
      minValue ||
      maxValue
  );

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
    <div className="bg-white p-3 sm:p-4 rounded-lg shadow mb-4 sm:mb-6">
      {/* Header com botões de controle */}
      <div className="flex flex-col gap-3 mb-3 sm:mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <FunnelSimple className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 flex-shrink-0" />
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 truncate">
              Filtros Avançados
            </h3>
            {hasActiveFilters && (
              <span className="bg-blue-100 text-blue-800 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex-shrink-0">
                {
                  [
                    searchTerm && "Busca",
                    selectedStatus !== "all" && "Status",
                    selectedPaymentStatus !== "all" && "Pagamento",
                    selectedType !== "all" && "Tipo",
                    startDate && "Data",
                    minValue && "Valor",
                  ].filter(Boolean).length
                }{" "}
                filtro(s) ativo(s)
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 flex-wrap">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1 min-h-[32px] px-2 py-1 rounded hover:bg-blue-50"
            >
              <FunnelSimple className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="truncate">
                {showAdvanced ? "Ocultar" : "Mostrar"} Avançado
              </span>
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs sm:text-sm text-red-600 hover:text-red-800 flex items-center space-x-1 min-h-[32px] px-2 py-1 rounded hover:bg-red-50"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="truncate">Limpar Tudo</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Campo de Busca Avançado */}
        <div className="flex-1">
          <div className="relative" ref={searchRef}>
            <div className="relative">
              <MagnifyingGlass className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
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
                className="w-full pl-8 sm:pl-10 pr-8 sm:pr-10 py-2 text-xs sm:text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[36px]"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              )}
            </div>

            {/* Sugestões de Busca */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 sm:max-h-60 overflow-y-auto">
                <div className="p-2">
                  <div className="text-xs text-gray-500 mb-2 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Buscas recentes
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors min-h-[40px]"
                    >
                      <div className="text-gray-400 flex-shrink-0">
                        {getReactIcon(suggestion.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm text-gray-900 truncate">
                          {suggestion.label}
                        </div>
                        <div className="text-xs text-gray-500 capitalize truncate">
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
            <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                {getReactIcon(getSearchIcon(currentSearchType))}
                <span className="capitalize truncate">
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
              <div className="text-xs text-gray-400 truncate">
                Buscando em: Nome, Telefone, Email, ID do pedido
              </div>
            </div>
          )}
        </div>

        {/* Filtros Básicos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2 sm:px-3 py-2 text-xs sm:text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[36px]"
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
            className="px-2 sm:px-3 py-2 text-xs sm:text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[36px]"
          >
            <option value="all">Todos os pagamentos</option>
            <option value="PENDING">Pendente</option>
            <option value="PAID">Pago</option>
            <option value="FAILED">Falhou</option>
            <option value="REFUNDED">Reembolsado</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2 sm:px-3 py-2 text-xs sm:text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[36px]"
          >
            <option value="all">Todos os tipos</option>
            <option value="DELIVERY">Entrega</option>
            <option value="PICKUP">Retirada</option>
            <option value="DINE_IN">Consumo no local</option>
          </select>

          <div className="flex items-center space-x-1 sm:space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 px-2 sm:px-3 py-2 text-xs sm:text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[36px]"
            >
              <option value="createdAt">Data de criação</option>
              <option value="total">Valor total</option>
              <option value="orderNumber">Número do pedido</option>
              <option value="customer.name">Nome do cliente</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex-shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center"
              title={`Ordenar ${
                sortOrder === "asc" ? "decrescente" : "crescente"
              }`}
            >
              {sortOrder === "asc" ? (
                <SortAscending className="h-3 w-3 sm:h-4 sm:w-4" />
              ) : (
                <SortDescending className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Filtros Avançados */}
        {showAdvanced && (
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Filtro por Data */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Período
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={startDate || ""}
                    onChange={(e) => setStartDate?.(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Data inicial"
                  />
                  <input
                    type="date"
                    value={endDate || ""}
                    onChange={(e) => setEndDate?.(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Data final"
                  />
                </div>
              </div>

              {/* Filtro por Valor */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <CurrencyDollar className="h-4 w-4 mr-1" />
                  Faixa de Valor
                </label>
                <div className="space-y-2">
                  <input
                    type="number"
                    value={minValue || ""}
                    onChange={(e) => setMinValue?.(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Valor mínimo"
                    min="0"
                    step="0.01"
                  />
                  <input
                    type="number"
                    value={maxValue || ""}
                    onChange={(e) => setMaxValue?.(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Valor máximo"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Filtros Rápidos */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <ClockCounterClockwise className="h-4 w-4 mr-1" />
                  Filtros Rápidos
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      const today = new Date();
                      const yesterday = new Date(today);
                      yesterday.setDate(yesterday.getDate() - 1);
                      setStartDate?.(yesterday.toISOString().split("T")[0]);
                      setEndDate?.(today.toISOString().split("T")[0]);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200"
                  >
                    Últimas 24h
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date();
                      const weekAgo = new Date(today);
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      setStartDate?.(weekAgo.toISOString().split("T")[0]);
                      setEndDate?.(today.toISOString().split("T")[0]);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200"
                  >
                    Última semana
                  </button>
                  <button
                    onClick={() => {
                      setSelectedStatus("RECEIVED");
                      setSelectedPaymentStatus("PENDING");
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200"
                  >
                    Pedidos pendentes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

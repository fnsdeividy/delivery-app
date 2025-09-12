// Hooks para autenticação e usuários
export {
  useAnalytics,
  useCustomerMetrics,
  usePeakHours,
  useStoreMetrics,
  useTopProducts,
} from "./useAnalytics";
export { useApiCache, useRelatedApiCache } from "./useApiCache";
export { useApiErrorHandler } from "./useApiErrorHandler";
export { useAuth } from "./useAuth";
export { useAuthContext } from "./useAuthContext";
export { useCardapioAuth } from "./useCardapioAuth";
export { useCreateStore } from "./useCreateStore";
export { useCurrency, useMultipleCurrency } from "./useCurrency";
export { useDashboardMetrics } from "./useDashboardMetrics";
export { useDashboardStats } from "./useDashboardStats";
export { useDebounce, useDebouncedCallback } from "./useDebounce";
export { useFormValidation } from "./useFormValidation";
export { useHybridAuth } from "./useHybridAuth";
export { useLoadingState, useMultipleLoadingStates } from "./useLoadingState";
export {
  useCancelOrder,
  useCreateOrder,
  useOrders,
  useOrderStats,
  useUpdateOrder,
} from "./useOrders";
export { useOrdersByStore, useUpdateOrderStatus } from "./useOrderStatus";
export {
  useActiveProducts,
  useCategories,
  useCreateProduct,
  useDeleteProduct,
  useProduct,
  useProducts,
  useProductsByCategory,
  useSearchProducts,
  useUpdateProduct,
} from "./useProducts";
export { useStore } from "./useStore";
export { useStoreRedirect } from "./useStoreRedirect";
export {
  useApproveStore,
  useDeleteStore,
  useRejectStore,
  useStores,
  useStoreStats,
  useUpdateStore,
} from "./useStores";
export {
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
  useUser,
  useUsers,
} from "./useUsers";

// Hook para configuração WhatsApp
export { useIfoodConfig } from "./useIfoodConfig";
export { useToast } from "./useToast";
export { useWhatsAppConfig } from "./useWhatsAppConfig";

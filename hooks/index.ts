// Hooks para autenticação e usuários
export {
  useAnalytics,
  useCustomerMetrics,
  usePeakHours,
  useStoreMetrics,
  useTopProducts,
} from "./useAnalytics";
export { useApiErrorHandler } from "./useApiErrorHandler";
export { useAuth } from "./useAuth";
export { useAuthContext } from "./useAuthContext";
export { useCardapioAuth } from "./useCardapioAuth";
export { useCreateStore } from "./useCreateStore";
export { useDashboardMetrics } from "./useDashboardMetrics";
export { useDashboardStats } from "./useDashboardStats";
export { useFormValidation } from "./useFormValidation";
export { useHybridAuth } from "./useHybridAuth";
export {
  useCancelOrder,
  useCreateOrder,
  useOrderStats,
  useOrders,
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
  useStoreStats,
  useStores,
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
export { useWhatsAppConfig } from "./useWhatsAppConfig";
export { useIfoodConfig } from "./useIfoodConfig";

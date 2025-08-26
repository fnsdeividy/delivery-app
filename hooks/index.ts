// Hooks para autenticação e usuários
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
  useCategories,
  useCreateCategory,
  useCreateProduct,
  useDeleteCategory,
  useDeleteProduct,
  useProduct,
  useProducts,
  useSearchProducts,
  useUpdateCategory,
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

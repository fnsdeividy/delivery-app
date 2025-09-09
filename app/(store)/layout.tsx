"use client";

import { CartProvider } from "../../contexts/CartContext";
import { CustomerProvider } from "../../contexts/CustomerContext";
import { usePathname } from 'next/navigation';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Extrair o storeSlug da URL
  let storeSlug;
  if (pathname) {
    const matches = pathname.match(/\/store\/([^\/]+)/);
    if (matches && matches[1]) {
      storeSlug = matches[1];
    }
  }
  
  return (
    <CustomerProvider>
      <CartProvider storeSlugParam={storeSlug}>
        {children}
      </CartProvider>
    </CustomerProvider>
  );
}

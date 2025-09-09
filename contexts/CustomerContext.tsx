"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface Customer {
  id: string;
  name?: string;
  phone: string;
  email?: string;
}

interface CustomerContextType {
  customer: Customer | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (phone: string, name?: string) => void;
  logout: () => void;
  updateCustomer: (customerData: Partial<Customer>) => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

interface CustomerProviderProps {
  children: ReactNode;
}

export function CustomerProvider({ children }: CustomerProviderProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se há dados do cliente no localStorage
    const savedCustomer = localStorage.getItem('store-customer');
    if (savedCustomer) {
      try {
        setCustomer(JSON.parse(savedCustomer));
      } catch (error) {
        console.error('Erro ao carregar dados do cliente:', error);
        localStorage.removeItem('store-customer');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (phone: string, name?: string) => {
    const newCustomer: Customer = {
      id: `customer_${Date.now()}`,
      phone,
      name,
    };
    setCustomer(newCustomer);
    localStorage.setItem('store-customer', JSON.stringify(newCustomer));
  };

  const logout = () => {
    setCustomer(null);
    localStorage.removeItem('store-customer');
  };

  const updateCustomer = (customerData: Partial<Customer>) => {
    if (customer) {
      const updatedCustomer = { ...customer, ...customerData };
      setCustomer(updatedCustomer);
      localStorage.setItem('store-customer', JSON.stringify(updatedCustomer));
    }
  };

  return (
    <CustomerContext.Provider
      value={{
        customer,
        isLoggedIn: !!customer,
        isLoading,
        login,
        logout,
        updateCustomer,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomerContext() {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomerContext deve ser usado dentro de um CustomerProvider');
  }
  return context;
}
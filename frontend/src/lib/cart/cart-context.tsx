'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { OrderItemType, CartItemModel } from '@/types/api.generated';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/auth-context';

interface SelectedServiceConfig {
  serviceId: number | null;
  serviceName?: string;
  packageId: number | null;
  packageName?: string;
  packagePrice: number;
}

interface CartContextType {
  sessionId: string;
  items: CartItemModel[];
  serviceConfig: SelectedServiceConfig;
  locationId: number | null;
  setLocationId: (id: number | null) => void;
  promotionCode: string;
  discountAmount: number;
  subtotal: number;
  totalAmount: number;
  itemCount: number;
  isLoading: boolean;
  setService: (serviceId: number, serviceName?: string, packageId?: number, packageName?: string, packagePrice?: number) => void;
  setPackage: (packageId: number, packageName?: string, packagePrice?: number) => void;
  addItem: (itemType: OrderItemType, referenceId: number, qty?: number, snapshot?: { name: string; price: number }) => Promise<void>;
  updateQuantity: (itemType: OrderItemType, referenceId: number, qty: number) => Promise<void>;
  removeItem: (itemType: OrderItemType, referenceId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  applyPromo: (code: string, discount: number) => void;
  removePromo: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_SESSION_KEY = 'beresin_guest_session_id';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [sessionId, setSessionId] = useState<string>('guest-session');
  const [items, setItems] = useState<CartItemModel[]>([]);
  const [serviceConfig, setServiceConfig] = useState<SelectedServiceConfig>({
    serviceId: null,
    packageId: null,
    packagePrice: 0,
  });
  const [locationId, setLocationId] = useState<number | null>(null);
  const [promotionCode, setPromotionCode] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Session ID
  useEffect(() => {
    let sid = localStorage.getItem(GUEST_SESSION_KEY);
    if (!sid) {
      sid = `guest-${Math.random().toString(36).substring(2, 10)}-${Date.now()}`;
      localStorage.setItem(GUEST_SESSION_KEY, sid);
    }
    setSessionId(sid);
  }, []);

  // Fetch cart from backend
  const refreshCart = useCallback(async () => {
    if (!sessionId) return;
    try {
      setIsLoading(true);
      const queryParam = !isAuthenticated ? `?sessionId=${encodeURIComponent(sessionId)}` : '';
      const res = await apiClient<{ items: CartItemModel[]; subtotal: number }>(`cart${queryParam}`);
      if (res && Array.isArray(res.items)) {
        setItems(res.items);
      }
    } catch {
      // Fallback silently if offline
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, isAuthenticated]);

  useEffect(() => {
    if (sessionId) {
      refreshCart();
    }
  }, [sessionId, refreshCart]);

  const setService = (
    serviceId: number,
    serviceName?: string,
    packageId?: number,
    packageName?: string,
    packagePrice: number = 0
  ) => {
    setServiceConfig({
      serviceId,
      serviceName,
      packageId: packageId || null,
      packageName,
      packagePrice,
    });
  };

  const setPackage = (packageId: number, packageName?: string, packagePrice: number = 0) => {
    setServiceConfig((prev) => ({
      ...prev,
      packageId,
      packageName,
      packagePrice,
    }));
  };

  const addItem = async (
    itemType: OrderItemType,
    referenceId: number,
    qty: number = 1,
    snapshot?: { name: string; price: number }
  ) => {
    try {
      // Optimistic update
      setItems((prev) => {
        const existingIndex = prev.findIndex(
          (i) => i.itemType === itemType && Number(i.referenceId) === Number(referenceId)
        );
        if (existingIndex > -1) {
          const updated = [...prev];
          const newQty = updated[existingIndex].qty + qty;
          updated[existingIndex] = {
            ...updated[existingIndex],
            qty: newQty,
            subtotal: (updated[existingIndex].priceSnapshot || 0) * newQty,
          };
          return updated;
        }
        return [
          ...prev,
          {
            id: Date.now(),
            cartKey: sessionId,
            itemType,
            referenceId,
            qty,
            nameSnapshot: snapshot?.name || `Item #${referenceId}`,
            priceSnapshot: snapshot?.price || 0,
            subtotal: (snapshot?.price || 0) * qty,
          },
        ];
      });

      await apiClient('cart/items', {
        method: 'POST',
        body: JSON.stringify({
          itemType,
          referenceId,
          qty,
          sessionId: !isAuthenticated ? sessionId : undefined,
        }),
      });
    } catch (e) {
      console.error('Error adding item to cart:', e);
      refreshCart();
    }
  };

  const updateQuantity = async (itemType: OrderItemType, referenceId: number, qty: number) => {
    try {
      if (qty <= 0) {
        await removeItem(itemType, referenceId);
        return;
      }

      setItems((prev) =>
        prev.map((item) => {
          if (item.itemType === itemType && Number(item.referenceId) === Number(referenceId)) {
            return {
              ...item,
              qty,
              subtotal: (item.priceSnapshot || 0) * qty,
            };
          }
          return item;
        })
      );

      await apiClient('cart/items', {
        method: 'PUT',
        body: JSON.stringify({
          itemType,
          referenceId,
          qty,
          sessionId: !isAuthenticated ? sessionId : undefined,
        }),
      });
    } catch {
      refreshCart();
    }
  };

  const removeItem = async (itemType: OrderItemType, referenceId: number) => {
    try {
      setItems((prev) =>
        prev.filter(
          (item) => !(item.itemType === itemType && Number(item.referenceId) === Number(referenceId))
        )
      );

      await apiClient('cart/items', {
        method: 'DELETE',
        body: JSON.stringify({
          itemType,
          referenceId,
          sessionId: !isAuthenticated ? sessionId : undefined,
        }),
      });
    } catch {
      refreshCart();
    }
  };

  const clearCart = async () => {
    try {
      setItems([]);
      setPromotionCode('');
      setDiscountAmount(0);
      const query = !isAuthenticated ? `?sessionId=${encodeURIComponent(sessionId)}` : '';
      await apiClient(`cart/clear${query}`, { method: 'DELETE' });
    } catch {
      refreshCart();
    }
  };

  const applyPromo = (code: string, discount: number) => {
    setPromotionCode(code);
    setDiscountAmount(discount);
  };

  const removePromo = () => {
    setPromotionCode('');
    setDiscountAmount(0);
  };

  // Subtotal & Total calculation
  const subtotal = useMemo(() => {
    let sum = serviceConfig.packagePrice || 0;
    for (const item of items) {
      sum += Number(item.subtotal || (item.priceSnapshot || 0) * item.qty);
    }
    return sum;
  }, [items, serviceConfig.packagePrice]);

  const totalAmount = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const itemCount = useMemo(() => {
    let count = serviceConfig.packageId ? 1 : 0;
    for (const item of items) {
      count += item.qty;
    }
    return count;
  }, [items, serviceConfig.packageId]);

  return (
    <CartContext.Provider
      value={{
        sessionId,
        items,
        serviceConfig,
        locationId,
        setLocationId,
        promotionCode,
        discountAmount,
        subtotal,
        totalAmount,
        itemCount,
        isLoading,
        setService,
        setPackage,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        applyPromo,
        removePromo,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

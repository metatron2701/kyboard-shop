"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Cart } from "./components/Cart"; 
import type { CartItem } from "@/features/cart/types";

type CartContextValue = {
  items: CartItem[];
  selectedItems: CartItem[];
  addItem: (item: CartItem) => void;
  updateQuantity: (index: number, quantity: number) => void;
  toggleItemSelected: (item: CartItem) => void;
  selectAllItems: (selected: boolean) => void;
  clearSelectedItems: () => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const emptyItems: CartItem[] = [];
const emptyKeys: string[] = [];

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  const items = emptyItems;
  const selectedItems = emptyItems;
  const selectedKeys = emptyKeys;

  const addItem = useCallback((_item: CartItem) => {
    // TODO(담당 3): 장바구니 상태/API에 상품을 추가합니다.
    setCartOpen(true);
  }, []);
  const updateQuantity = useCallback((_index: number, _quantity: number) => {
    // TODO(담당 3): 장바구니 상품 수량을 변경합니다.
  }, []);
  const toggleItemSelected = useCallback((_item: CartItem) => {
    // TODO(담당 3): 개별 상품 선택 상태를 변경합니다.
  }, []);
  const selectAllItems = useCallback((_selected: boolean) => {
    // TODO(담당 3): 전체 상품 선택 상태를 변경합니다.
  }, []);
  const clearSelectedItems = useCallback(() => {
    // TODO(담당 3): 주문 완료 후 선택 상품을 장바구니에서 제거합니다.
  }, []);
  const clearCart = useCallback(() => {
    // TODO(담당 3): 장바구니를 비웁니다.
  }, []);
  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const value = useMemo<CartContextValue>(() => ({
    items,
    selectedItems,
    addItem,
    updateQuantity,
    toggleItemSelected,
    selectAllItems,
    clearSelectedItems,
    clearCart,
    openCart,
    closeCart,
  }), [addItem, clearCart, clearSelectedItems, closeCart, items, openCart, selectAllItems, selectedItems, toggleItemSelected, updateQuantity]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <Cart
        onClose={closeCart}
        open={cartOpen}
      />
    </CartContext.Provider>
  );
}

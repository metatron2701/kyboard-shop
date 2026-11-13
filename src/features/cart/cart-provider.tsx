"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Cart } from "./components/Cart"; 
import type { CartItem } from "@/features/cart/types";
import { ProductCartContext } from "./components/CartContext";
import type { ProductType } from "./interface/Product";

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

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  const cartCtx = useContext(ProductCartContext);
  const products: ProductType[] = cartCtx?.products || [];
  const handleUpdateCount = cartCtx?.handleUpdateCount;
  const handleClearCart = cartCtx?.handleClearCart;
  const handleAddProduct = cartCtx?.handleAddProduct;

  const items = useMemo<CartItem[]>(() => {
    return products.map((p) => ({
      productId: String(p.productId),
      slug: String(p.productId),
      name: p.name,
      image: p.thumbnailUrl,
      optionValue: p.customBuildId ? `custom-${p.customBuildId}` : undefined,
      optionLabel: p.buildName || (p.includeAssembly ? '조립 대행 포함' : undefined),
      unitPrice: p.price,
      shippingFee: 0,
      quantity: p.quantity,
    }));
  }, [products]);

  const [deselectedIds, setDeselectedIds] = useState<Set<string>>(new Set());

  const selectedItems = useMemo(() => {
    return items.filter((item) => !deselectedIds.has(item.productId));
  }, [items, deselectedIds]);

  const addItem = useCallback(async (item: CartItem) => {
    if (handleAddProduct) {
      const isSuccess = await handleAddProduct({
        productId: Number(item.productId),
        name: item.name,
        price: item.unitPrice,
        stockQuantity: 999,
        quantity: item.quantity,
        thumbnailUrl: item.image,
        partType: '',
        additionalPrice: 0,
        customBuildId: 0,
        buildName: item.optionLabel || '',
        includeAssembly: false,
      });
      if (isSuccess !== false) {
        setCartOpen(true);
      }
    }
  }, [handleAddProduct]);

  const updateQuantity = useCallback((index: number, quantity: number) => {
    const item = items[index];
    if (item && handleUpdateCount) {
      handleUpdateCount(Number(item.productId), quantity);
    }
  }, [items, handleUpdateCount]);

  const toggleItemSelected = useCallback((item: CartItem) => {
    setDeselectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(item.productId)) {
        next.delete(item.productId);
      } else {
        next.add(item.productId);
      }
      return next;
    });
  }, []);

  const selectAllItems = useCallback((selected: boolean) => {
    if (selected) {
      setDeselectedIds(new Set());
    } else {
      setDeselectedIds(new Set(items.map((i) => i.productId)));
    }
  }, [items]);

  const clearSelectedItems = useCallback(() => {
    if (handleClearCart) {
      handleClearCart();
    }
    setDeselectedIds(new Set());
  }, [handleClearCart]);

  const clearCart = useCallback(() => {
    if (handleClearCart) {
      handleClearCart();
    }
    setDeselectedIds(new Set());
  }, [handleClearCart]);

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

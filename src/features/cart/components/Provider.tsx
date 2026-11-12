"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ProductType } from "../interface/Product";
import { ProductCartContext } from "./CartContext";

export function ProductCartProvider({ children }: { children: ReactNode}) {
  const [products, setProducts] = useState<ProductType[]>([]);

  const isLoaded = useRef(false);

  useEffect(() => {
    if (!isLoaded.current) {
      const saveProduct = localStorage.getItem("cartProduct");
      if (saveProduct) {
        setProducts(JSON.parse(saveProduct))
      }

      isLoaded.current = true;
      return;
    }
    localStorage.setItem("cartProduct", JSON.stringify(products));
  }, [products]);

  function handleUpdateCount(id : number, newQuantity : number) {
    setProducts((prevProducts : ProductType[]) => prevProducts.map((product : ProductType) => {
      if (product.productId === id) {
        const targetProduct = products.find((product : ProductType) => product.productId === id);

        newQuantity = Math.max(1, newQuantity);

        if (targetProduct && newQuantity > targetProduct.stockQuantity) {
          alert(`${targetProduct.name}의 현재 재고수는 ${targetProduct.stockQuantity}개입니다.`);
          newQuantity = targetProduct.stockQuantity;
        }
        
        return { ...product, quantity : newQuantity};
      }
      return product;
    })
  );}

  function handleRemoveProduct(id : number) {
    setProducts((prevProducts : ProductType[]) =>
      prevProducts.filter((product : ProductType) => product.productId !== id)
    );
  }

  function handleAddProduct(newProduct: ProductType) {
      const existingProduct = products.find(
          (product) =>
              product.productId === newProduct.productId &&
              product.customBuildId === newProduct.customBuildId &&
              product.includeAssembly === newProduct.includeAssembly &&
              product.stockQuantity === newProduct.stockQuantity
      );

      if (existingProduct) {
          const newQuantity =
              existingProduct.quantity + newProduct.quantity;

          if (newQuantity > existingProduct.stockQuantity) {
              alert(
                  `${existingProduct.name}의 현재 재고수는 ${existingProduct.stockQuantity}개입니다.`
              );
          }

          const finalQuantity = Math.min(
              newQuantity,
              existingProduct.stockQuantity
          );

          setProducts((prevProducts) =>
              prevProducts.map((product) => {
                  if (
                      product.productId === newProduct.productId &&
                      product.customBuildId === newProduct.customBuildId &&
                      product.includeAssembly === newProduct.includeAssembly &&
                      product.stockQuantity === newProduct.stockQuantity
                  ) {
                      return {
                          ...product,
                          quantity: finalQuantity,
                      };
                  }

                  return product;
              })
          );

          return;
      }
      setProducts((prevProducts) => [
          ...prevProducts,
          newProduct
      ]);
  }

  function handleClearCart() {
    setProducts([]);
  }

  return (
    <ProductCartContext.Provider value={{products, handleUpdateCount, handleRemoveProduct, handleAddProduct, handleClearCart}}>
      {children}  
    </ProductCartContext.Provider>
  );
}
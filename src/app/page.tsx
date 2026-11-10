"use client";

import { useEffect, useRef, useState } from "react";
import { ProductType } from "./interface/Product";
import { CartContext } from "./components/CartContext";
import { Cart } from "./components/Cart";

export default function Home() {
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

  function handleUpdateCount(id : number, newCount : number) {
    setProducts((prevProducts : ProductType[]) => prevProducts.map((product : ProductType) => {
      if (product.id === id) {
        const targetProduct = products.find((product : ProductType) => product.id === id);

        newCount = Math.max(0, newCount);

        if (targetProduct && newCount > targetProduct.stock) {
          alert(`${targetProduct.productName}의 현재 재고수는 ${targetProduct.stock}개입니다.`);
          newCount = targetProduct.stock;
        }
        
        return { ...product, count : newCount};
      }
      return product;
    })
  );}

  function handleRemoveProduct(id : number) {
    setProducts((prevProducts : ProductType[]) =>
      prevProducts.filter((product : ProductType) => product.id !== id)
    );
  }

  function handleAddProduct(newProduct : ProductType) {
    const newStock = Math.max(2, Math.floor(Math.random() * 20))
    const newCost = Math.max(1, Math.floor(Math.random() * 10000))
    setProducts((prevProducts : ProductType[]) => [...prevProducts, { ...newProduct, stock : newStock, cost : newCost}]);
  }

  return (
    <>
      <header>

      </header>
      <main>
        <CartContext.Provider value={{products, handleUpdateCount, handleRemoveProduct, handleAddProduct}}>
          <Cart />
        </CartContext.Provider>
      </main>
      <footer>
        
      </footer>
    </>
  );
}

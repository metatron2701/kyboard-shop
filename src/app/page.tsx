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
          if (newCount > 0) {
            const targetProduct = products.find((product : ProductType) => product.id === id);

            if (targetProduct && newCount > targetProduct.stock) {
              alert(`${targetProduct.productName}의 현재 재고수는 ${targetProduct.stock}개입니다.`);
              newCount = targetProduct.stock;
            }
            
            return { ...product, count : newCount};
          } else {
            handleRemoveProduct(product.id)
          }
        }
        return product;
      })
    );
  }

  function handleUpdateChecked(id : number) {
    setProducts((prevProducts : ProductType[]) => prevProducts.map((product : ProductType) => {
        if (product.id === id) {
          return {...product, checked: !product.checked}
        }
        return product;
      })
    );
  }

  function handleRemoveProduct(id : number) {
    setProducts((prevProducts : ProductType[]) =>
      prevProducts.filter((product : ProductType) => product.id !== id)
    );
  }

  function handleAddProduct(newProduct : ProductType) {
    setProducts((prevProducts : ProductType[]) => [...prevProducts, newProduct]);
  }

  return (
    <>
      <header>

      </header>
      <main>
        <CartContext.Provider value={{products, handleUpdateCount, handleUpdateChecked, handleRemoveProduct, handleAddProduct}}>
          <Cart />
        </CartContext.Provider>
      </main>
      <footer>
        
      </footer>
    </>
  );
}

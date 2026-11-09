import { useContext } from "react";
import "../style.css";
import { CartContext } from "./CartContext";
import type { ProductList, ProductType } from "../interface/Product";

export function Cart() {
    const {products, handleAddProduct} = useContext(CartContext);
    const totalCost = products.reduce((sum : number, product : ProductType) => {
        if (product.checked) {
            sum += (product.cost * product.count);
        }
        return sum;
    }, 0);

    const newItem = {
        id : Date.now(),
        productName : `새로운 상품 ${Date.now()}`,
        imgURL : "./test_image.jpg",
        stock :  Math.max(1, Math.floor(Math.random() * 20)),
        cost : Math.max(2, Math.floor(Math.random() * 10000)),
        checked : true,
        count : 1
    };

    const allItemCount = products.reduce((count : number, product : ProductType) => {
        count += product.count
        return count
    }, 0)

    return (
        <div id="Cart-Container">
            <div id="Cart-Header">
                <h2 id="Cart-Header-Name">Your cart ({allItemCount})</h2>
                <button id="Cart-Close-Button" type="button">
                    <svg id="Cart-Close-Icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 5L10 10M10 10L15 15M10 10L15 5M10 10L5 15" strokeWidth="1.25" strokeLinecap="round" stroke="#09090B"/>
                    </svg>
                </button>
            </div>
            <div id="Cart-Body">
                {products.length === 0 ? <NotThingItem /> : <AddListItem />}
            </div>
            <div id="Cart-Footer">
                <div id="Total-Const-Fraim">
                    <p id="Subtotal">Subtotal</p>
                    <p id="Total-Cost">${totalCost}</p>
                </div>
            </div>
            <button onClick={() => handleAddProduct(newItem)}>장바구니 추가 테스트</button>
        </div>
    );
}

function NotThingItem() {
    return (
        <div id="Not-Thing-Item">
            <div id="Bag-Icon">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.33301 13.3333H31.6663L29.9997 33.3333H9.99967L8.33301 13.3333Z" strokeWidth="2.5" stroke="#D4D4D8"/>
                    <path d="M15 15V10C15 8.67392 15.5268 7.40215 16.4645 6.46447C17.4021 5.52678 18.6739 5 20 5C21.3261 5 22.5979 5.52678 23.5355 6.46447C24.4732 7.40215 25 8.67392 25 10V15" strokeWidth="2.5" stroke="#D4D4D8"/>
                </svg>
            </div>
            <p id="Not-Thing-Item-Message">Your cart is empty.</p>
            <p id="Not-Thing-Item-Describe">A better desk starts with one good key.</p>
        </div>
    )
}

function AddListItem() {
    const {products} = useContext(CartContext);
    return (
        <>
            {products.map((product : ProductType) => <ListItem key={product.id} product={product} />)}
        </>
    )
}

function ListItem({ product } : ProductList) {
    const {handleUpdateCount, handleUpdateChecked, handleRemoveProduct} = useContext(CartContext);
    return (
        <ul id="In-Item">
            <img id="Cart-Item-Img" src={product.imgURL} />
            <div id="Cart-Item-Distance">
                <p id="Cart-Item-Name">{product.productName}</p>
                <div id="Cart-Item-Cost">
                    <div id="Cart-Count-Setting">
                        <button id="Cart-Count-Minus" type="button" tabIndex={-1} onClick={(event) => {
                                handleUpdateCount(product.id, product.count -= 1);}
                                }>
                            <svg width="10" height="1" viewBox="0 0 10 1" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 0.5H9.33333" stroke="#09090B"/>
                            </svg>
                        </button>
                        <div id="Cart-Item-Count-Frame">
                            <p id="Cart-Item-Count">{product.count}</p>
                        </div>
                        <button id="Cart-Count-Plus" type="button" tabIndex={-1} onClick={(event) => {
                                handleUpdateCount(product.id, product.count += 1);}
                                }>
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"     xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 4.66667H4.66667M4.66667 4.66667H9.33333M4.66667 4.66667V0M4.66667 4.66667V9.33333" stroke="#09090B"/>
                            </svg>
                        </button>
                    </div>
                    <p id="Cart-Explain">${product.cost * product.count}</p>
                </div>
            </div>
        </ ul>
    );
}
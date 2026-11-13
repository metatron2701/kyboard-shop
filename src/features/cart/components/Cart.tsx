import { useContext, useEffect } from "react";
import "../style.css";
import { ProductCartContext } from "./CartContext";
import type { ProductList, ProductType } from "../interface/Product";
import { useRouter } from "next/navigation";

type CartProps = {
  open: boolean;
  onClose: () => void;
};

export function Cart({ open, onClose } : CartProps) {
    const { products, refreshCart } = useContext(ProductCartContext);

    // 장바구니 서랍이 열릴 때(false -> true) 딱 1번만 백엔드 최신 상태 동기화 (무한 루프 방지)
    useEffect(() => {
        if (open && typeof refreshCart === "function") {
            refreshCart();
        }
    }, [open]);

    const router = useRouter();

    const totalCost = products.reduce((sum : number, product : ProductType) => {
        sum += (product.price * product.quantity);
        return sum;
    }, 0);

    const allItemCount = products.reduce((count : number, product : ProductType) => {
        count += product.quantity
        return count
    }, 0)

    return (
        <div 
            id="Cart-Container"
            className={`fixed inset-0 z-[60] transition ${
            open
            ? "pointer-events-auto"
            : "pointer-events-none"
        }`}>
            <div
                id="Cart-Overlay"
                className={`fixed inset-0 z-[60] transition-opacity duration-500 ${
                    open
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-0"
                }`}
            >
                <button
                    type="button"
                    aria-label="장바구니 닫기"
                    onClick={onClose}
                    className={`absolute inset-0 h-full w-full bg-black/50 transition-opacity duration-500 ${
                        open ? "opacity-100" : "opacity-0"
                    }`}
                />
                <aside
                    id="Cart-Container"
                    className={`fixed right-0 top-0 flex h-screen w-full max-w-md flex-col bg-white p-7 shadow-2xl transition-transform duration-500 ease-in-out ${
                        open ? "translate-x-0" : "translate-x-full"
                    }`}
                >
                    <div id="Cart-Header">
                        <h2 id="Cart-Header-Name">Your cart ({allItemCount})</h2>
                        <button id="Cart-Close-Button" type="button" onClick={onClose}>
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
                            <p id="Total-Cost">${totalCost.toLocaleString("ko-KR")}</p>
                        </div>
                        <button id="Cart-Payment-Button"
                                className={`transition-all duration-150 ${allItemCount > 0 ? "bg-zinc-800 hover:bg-zinc-950 active:scale-[0.99]" : "off"}`}
                                type="button"
                                disabled={allItemCount === 0}
                                onClick={() => {
                                    onClose();
                                    router.push('/checkout');
                                }}
                        >CHECKOUT</button>
                    </div>
                </aside>
            </div>
        </div>
    );
}

function NotThingItem() {
    return (
        <div id="Not-Thing-Item">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.33301 13.3333H31.6663L29.9997 33.3333H9.99967L8.33301 13.3333Z" strokeWidth="2.5" stroke="#D4D4D8"/>
                <path d="M15 15V10C15 8.67392 15.5268 7.40215 16.4645 6.46447C17.4021 5.52678 18.6739 5 20 5C21.3261 5 22.5979 5.52678 23.5355 6.46447C24.4732 7.40215 25 8.67392 25 10V15" strokeWidth="2.5" stroke="#D4D4D8"/>
            </svg>
            <p id="Not-Thing-Item-Message">Your cart is empty.</p>
            <p id="Not-Thing-Item-Describe">A better desk starts with one good key.</p>
        </div>
    )
}

function AddListItem() {
    const {products} = useContext(ProductCartContext);
    return (
        <>
            {products.map((product : ProductType) => <ListItem key={product.productId} product={product} />)}
        </>
    )
}

function ListItem({ product } : ProductList) {
    const {handleUpdateCount, handleRemoveProduct} = useContext(ProductCartContext);

    return (
        <ul id="In-Item">
            {product.thumbnailUrl ? (
                <img id="Cart-Item-Img" src={product.thumbnailUrl} alt={product.name || "상품 이미지"} />
            ) : (
                <div id="Cart-Item-Img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f4f5', fontSize: '11px', color: '#a1a1aa' }}>
                    NO IMG
                </div>
            )}
            <div id="Cart-Item-Distance">
                <div id="Cart-Item-Main">
                    <p id="Cart-Item-Name">{product.name}</p>
                    <button id="Cart-Item-Remove-Button" type="button" tabIndex={-1} onClick={() => {
                        handleRemoveProduct(product.productId)
                    }}>
                        <svg id="Cart-Item-Remove_Icon" width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 5L15.1327 17.1425C15.0579 18.1891 14.187 19 13.1378 19H4.86224C3.81296 19 2.94208 18.1891 2.86732 17.1425L2 5M16 5H12M16 5H17M2 5H1M2 5H6M7 9V15M11 9V15M12 5V2C12 1.44772 11.5523 1 11 1H7C6.44772 1 6 1.44772 6 2V5M12 5H6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="#000000"/>
                        </svg>
                    </button>
                </div>
                <div id="Cart-Item-Cost">
                    <div id="Cart-Count-Setting">
                        <button id="Cart-Count-Minus"
                                className={`${product.quantity > 1 ? "on" : "off"}`}
                                type="button" tabIndex={-1}
                                onClick={() => {
                            handleUpdateCount(product.productId, product.quantity - 1);
                        }}>
                            <svg width="10" height="1" viewBox="0 0 10 1" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 0.5H9.33333" stroke="currentColor"/>
                            </svg>
                        </button>
                        <div id="Cart-Item-Count-Frame">
                            <p id="Cart-Item-Count">{product.quantity}</p>
                        </div>
                        <button id="Cart-Count-Plus"
                                className={`${product.quantity < product.stockQuantity ? "on" : "off"}`}
                                type="button" tabIndex={-1}
                                onClick={() => {
                            handleUpdateCount(product.productId, product.quantity + 1);
                        }}>
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"     xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 4.66667H4.66667M4.66667 4.66667H9.33333M4.66667 4.66667V0M4.66667 4.66667V9.33333" stroke="currentColor"/>
                            </svg>
                        </button>
                    </div>
                    <p id="Cart-Explain">${(product.price * product.quantity).toLocaleString("ko-KR")}</p>
                </div>
            </div>
        </ ul>
    );
}
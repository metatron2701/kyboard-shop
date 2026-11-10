export interface ProductType {
    id : number,
    productName : string,
    imgURL : string,
    stock : number,
    cost : number,
    count : number
}

export interface ProductList {
    product : ProductType;
}
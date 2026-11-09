export interface ProductType {
    id : number,
    productName : string,
    imgURL : string,
    stock : number,
    cost : number,
    checked : boolean,
    count : number
}

export interface ProductList {
    product : ProductType;
}
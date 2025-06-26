export interface CartItem {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  salePrice?: number;
  image: string;
  category: string;
  stockQuantity: number; // To validate against when updating quantities
}

export interface Cart {
  items: CartItem[];
  lastUpdated: Date;
}
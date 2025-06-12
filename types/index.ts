export interface CartItem {
  code: string;
  name: string;
  price: number;
  image: string;
  serial: string;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  total: number;
}

export type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'INCREMENT_QTY'; payload: string }
  | { type: 'DECREMENT_QTY'; payload: string }
  | { type: 'CLEAR_CART' };

export interface Product {
  name: string;
  price: number;
  image: string;
  serial: string;
}
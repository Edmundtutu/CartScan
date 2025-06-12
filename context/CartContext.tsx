import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { CartState, CartAction, CartItem } from '@/types';

const initialState: CartState = {
  items: [],
  total: 0,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => item.code === action.payload.code
      );

      let newItems: CartItem[];
      if (existingItemIndex >= 0) {
        // Item exists, increment quantity
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // New item, add with quantity 1
        newItems = [...state.items, { ...action.payload, quantity: 1 }];
      }

      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      return {
        items: newItems,
        total,
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.code !== action.payload);
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      return {
        items: newItems,
        total,
      };
    }

    case 'INCREMENT_QTY': {
      const newItems = state.items.map(item =>
        item.code === action.payload
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      return {
        items: newItems,
        total,
      };
    }

    case 'DECREMENT_QTY': {
      const newItems = state.items.map(item =>
        item.code === action.payload && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ).filter(item => item.quantity > 0);
      
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      return {
        items: newItems,
        total,
      };
    }

    case 'CLEAR_CART':
      return initialState;

    default:
      return state;
  }
}

interface CartContextType {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ state, dispatch, totalItems }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
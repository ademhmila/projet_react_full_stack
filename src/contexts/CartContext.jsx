import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

// Initial State pulls from localStorage if it exists
const initialState = {
  items: JSON.parse(localStorage.getItem('ecommerce_cart_items')) || []
};

// Reducer defining standard Cart operations
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity = 1 } = action.payload;
      const existingItemIndex = state.items.findIndex(item => item.id === product.id);

      let newItems;
      if (existingItemIndex >= 0) {
        newItems = state.items.map((item, idx) => {
          if (idx === existingItemIndex) {
            const nextQuantity = item.quantity + quantity;
            // Cap quantity at stock limit if defined
            const finalQuantity = product.stock !== undefined 
              ? Math.min(nextQuantity, product.stock)
              : nextQuantity;
            return { ...item, quantity: finalQuantity };
          }
          return item;
        });
      } else {
        newItems = [...state.items, { 
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          stock: product.stock ?? 10,
          quantity: Math.min(quantity, product.stock ?? 10)
        }];
      }
      return { ...state, items: newItems };
    }

    case 'REMOVE_ITEM': {
      const { id } = action.payload;
      return {
        ...state,
        items: state.items.filter(item => item.id !== id)
      };
    }

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== id)
        };
      }
      return {
        ...state,
        items: state.items.map(item => {
          if (item.id === id) {
            const finalQuantity = item.stock !== undefined 
              ? Math.min(quantity, item.stock)
              : quantity;
            return { ...item, quantity: finalQuantity };
          }
          return item;
        })
      };
    }

    case 'CLEAR_CART': {
      return { ...state, items: [] };
    }

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Sync state with localStorage on change
  useEffect(() => {
    localStorage.setItem('ecommerce_cart_items', JSON.stringify(state.items));
  }, [state.items]);

  // Actions wrapped in helper functions
  const addItem = (product, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
  };

  const removeItem = (id) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  };

  const updateQuantity = (id, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  // Derived states
  const cartCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const value = {
    cartItems: state.items,
    cartCount,
    cartTotal,
    addItem,
    removeItem,
    updateQuantity,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

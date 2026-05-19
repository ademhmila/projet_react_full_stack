import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { CartProvider, useCart } from './CartContext';

// Standard consumer component to trigger reducer actions
const TestCartConsumer = () => {
  const { 
    cartItems, 
    cartCount, 
    cartTotal, 
    addItem, 
    removeItem, 
    updateQuantity, 
    clearCart 
  } = useCart();

  const dummyProduct = {
    id: 'test-item-99',
    name: 'Aura Sound Test',
    price: 150.00,
    stock: 5
  };

  return (
    <div>
      <div data-testid="cart-count">{cartCount}</div>
      <div data-testid="cart-total">{cartTotal}</div>
      <div data-testid="items-list">
        {cartItems.map(item => (
          <div key={item.id} data-testid={`item-${item.id}`}>
            {item.name} - Qty: {item.quantity} - Total: {item.price * item.quantity}
          </div>
        ))}
      </div>

      <button onClick={() => addItem(dummyProduct, 1)} data-testid="add-btn">Add Item</button>
      <button onClick={() => addItem(dummyProduct, 10)} data-testid="add-overstock-btn">Add Overstock</button>
      <button onClick={() => updateQuantity('test-item-99', 3)} data-testid="update-btn">Update to 3</button>
      <button onClick={() => removeItem('test-item-99')} data-testid="remove-btn">Remove Item</button>
      <button onClick={clearCart} data-testid="clear-btn">Clear Cart</button>
    </div>
  );
};

describe('CartContext & CartReducer State Mutations', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should initialize with a clean empty cart state', () => {
    render(
      <CartProvider>
        <TestCartConsumer />
      </CartProvider>
    );

    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
    expect(screen.getByTestId('cart-total')).toHaveTextContent('0');
  });

  it('should add a product and calculate price math correctly', () => {
    render(
      <CartProvider>
        <TestCartConsumer />
      </CartProvider>
    );

    fireEvent.click(screen.getByTestId('add-btn'));

    expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
    expect(screen.getByTestId('cart-total')).toHaveTextContent('150');
    expect(screen.getByTestId('item-test-item-99')).toHaveTextContent('Aura Sound Test - Qty: 1 - Total: 150');
    
    // Check localStorage cache sync
    const cache = JSON.parse(window.localStorage.getItem('ecommerce_cart_items'));
    expect(cache).toHaveLength(1);
    expect(cache[0].quantity).toBe(1);
  });

  it('should cap addition to product stock limit (stock = 5)', () => {
    render(
      <CartProvider>
        <TestCartConsumer />
      </CartProvider>
    );

    fireEvent.click(screen.getByTestId('add-overstock-btn'));

    // Capped at stock limit of 5
    expect(screen.getByTestId('cart-count')).toHaveTextContent('5');
    expect(screen.getByTestId('cart-total')).toHaveTextContent('750');
  });

  it('should update item quantities in-place', () => {
    render(
      <CartProvider>
        <TestCartConsumer />
      </CartProvider>
    );

    fireEvent.click(screen.getByTestId('add-btn'));
    fireEvent.click(screen.getByTestId('update-btn'));

    expect(screen.getByTestId('cart-count')).toHaveTextContent('3');
    expect(screen.getByTestId('cart-total')).toHaveTextContent('450');
  });

  it('should delete a product entirely from the array', () => {
    render(
      <CartProvider>
        <TestCartConsumer />
      </CartProvider>
    );

    fireEvent.click(screen.getByTestId('add-btn'));
    expect(screen.getByTestId('cart-count')).toHaveTextContent('1');

    fireEvent.click(screen.getByTestId('remove-btn'));

    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
    expect(screen.queryByTestId('item-test-item-99')).not.toBeInTheDocument();
  });

  it('should clear the entire cart on dispatch', () => {
    render(
      <CartProvider>
        <TestCartConsumer />
      </CartProvider>
    );

    fireEvent.click(screen.getByTestId('add-btn'));
    expect(screen.getByTestId('cart-count')).toHaveTextContent('1');

    fireEvent.click(screen.getByTestId('clear-btn'));

    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
    expect(screen.getByTestId('cart-total')).toHaveTextContent('0');
  });
});

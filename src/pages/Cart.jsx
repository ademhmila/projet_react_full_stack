import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

export const Cart = () => {
  const { cartItems, cartTotal, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  // Price calculations
  const shipping = cartTotal > 200 || cartTotal === 0 ? 0.00 : 15.00;
  const tax = cartTotal * 0.08; // 8% sales tax
  const total = cartTotal + shipping + tax;

  const handleCheckout = () => {
    // Forward to the Invoice checkout page
    navigate('/invoice');
  };

  if (cartItems.length === 0) {
    return (
      <main className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div className="card glass-card" style={{ maxWidth: '550px', margin: '0 auto', padding: '50px 30px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🛒</div>
          <h2 style={{ color: 'var(--text-h)', marginBottom: '12px' }}>Your Shopping Cart is Empty</h2>
          <p style={{ color: 'var(--text)', marginBottom: '32px', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Before checking out, you must add some modern electronics or wearables to your cart. 
            Browse our catalog to get started.
          </p>
          <Link to="/" className="btn btn-primary" style={{ padding: '12px 28px' }}>
            ✨ Explore Products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ padding: '40px 0' }}>
      <h1 style={{ marginBottom: '30px', fontSize: '2.5rem', color: 'var(--text-h)' }}>
        Shopping Cart 🛍️
      </h1>

      {/* Grid Split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
        
        {/* Left Side: Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '600', color: 'var(--text-h)' }}>
              Items ({cartItems.length})
            </span>
            <button 
              onClick={clearCart} 
              className="btn btn-danger" 
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              Clear Cart
            </button>
          </div>

          {cartItems.map((item) => (
            <div key={item.id} className="card glass-card" style={{ padding: '18px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Product Gradient Thumbnail */}
              <div style={{ 
                width: '75px', 
                height: '75px', 
                borderRadius: '8px', 
                background: 'linear-gradient(135deg, var(--primary), var(--accent-pink))', // backup gradient
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '2.2rem'
              }}>
                {/* Find icon if present in catalog */}
                {item.id === '1' && '🎧'}
                {item.id === '2' && '⌚'}
                {item.id === '3' && '🥽'}
                {item.id === '4' && '🔊'}
                {item.id === '5' && '⌨️'}
                {item.id === '6' && '🏃'}
                {!['1','2','3','4','5','6'].includes(item.id) && '📦'}
              </div>

              {/* Title & Price */}
              <div style={{ flex: '1', minWidth: '150px' }}>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--text-h)', marginBottom: '4px' }}>{item.name}</h3>
                <span style={{ fontWeight: '700', color: 'var(--text-h)' }}>{item.price.toFixed(2)} DT</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                  (Stock: {item.stock})
                </span>
              </div>

              {/* Quantity Changer */}
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--bg-app)' }}>
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                  className="btn" 
                  style={{ padding: '6px 10px', border: 'none', background: 'none' }}
                >
                  -
                </button>
                <span style={{ padding: '0 12px', fontWeight: 'bold', color: 'var(--text-h)', fontSize: '0.9rem' }}>
                  {item.quantity}
                </span>
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                  className="btn" 
                  style={{ padding: '6px 10px', border: 'none', background: 'none' }}
                  disabled={item.quantity >= item.stock}
                >
                  +
                </button>
              </div>

              {/* Action Button */}
              <button 
                onClick={() => removeItem(item.id)} 
                className="btn"
                style={{ padding: '8px', color: 'var(--accent-red)', background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer' }}
                title="Remove Item"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        {/* Right Side: Order Summary Invoice Card */}
        <div>
          <div className="card glass-card" style={{ padding: '30px', position: 'sticky', top: '90px' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              Order Summary
            </h2>

            {/* Calculations List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem' }}>
                <span>Subtotal ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                <strong style={{ color: 'var(--text-h)' }}>{cartTotal.toFixed(2)} DT</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem' }}>
                <span>Estimated Shipping</span>
                <strong style={{ color: 'var(--text-h)' }}>
                  {shipping === 0 ? <span style={{ color: 'var(--accent-green)' }}>FREE</span> : `${shipping.toFixed(2)} DT`}
                </strong>
              </div>

              {shipping > 0 && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '-8px' }}>
                  💡 Add <strong>{(200 - cartTotal).toFixed(2)} DT</strong> more to get FREE SHIPPING!
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem' }}>
                <span>Estimated Sales Tax (8%)</span>
                <strong style={{ color: 'var(--text-h)' }}>{tax.toFixed(2)} DT</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '800', borderTop: '1px solid var(--border)', paddingTop: '14px', marginTop: '6px', color: 'var(--text-h)' }}>
                <span>Total Amount</span>
                <span>{total.toFixed(2)} DT</span>
              </div>
            </div>

            {/* Promo Code placeholder */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
              <input 
                type="text" 
                placeholder="PROMOCODE10" 
                className="form-control" 
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                readOnly
              />
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                onClick={() => alert('Demo discount successfully applied! (10% off)')}
              >
                Apply
              </button>
            </div>

            {/* Checkout Action */}
            <button 
              onClick={handleCheckout}
              className="btn btn-primary" 
              style={{ width: '100%', padding: '14px', fontSize: '1.02rem' }}
            >
              🚀 Proceed to Checkout
            </button>

            <Link to="/" style={{ display: 'block', textAlign: 'center', marginTop: '16px', fontSize: '0.88rem', color: 'var(--primary)', fontWeight: '600' }}>
              Continue Shopping
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
};

export default Cart;

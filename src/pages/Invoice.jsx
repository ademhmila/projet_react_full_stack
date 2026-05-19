import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../api/supabaseClient';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

export const Invoice = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Form parameters
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [payment, setPayment] = useState('Credit Card');
  
  // Invoice state
  const [invoiceDetails, setInvoiceDetails] = useState(null);
  const [isOrdered, setIsOrdered] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Constants
  const shipping = cartTotal > 200 ? 0.00 : 15.00;
  const tax = cartTotal * 0.08;
  const total = cartTotal + shipping + tax;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    setSubmitting(true);
    setCheckoutError('');

    const orderDate = new Date().toLocaleString();

    try {
      // 1. Live Supabase database checkout insertion
      // A. Insert parent row in orders table
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null, // null if guest
          status: 'pending',
          total_price: total
        })
        .select();

      if (orderError) throw orderError;
      const liveOrderId = orderData[0].id;

      // B. Insert child items in order_items table
      const orderItemsPayload = cartItems.map(item => ({
        order_id: liveOrderId,
        product_id: item.id,
        quantity: item.quantity,
        price_at_purchase: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsPayload);

      if (itemsError) throw itemsError;

      // C. Populate invoice parameters on success
      setInvoiceDetails({
        orderId: liveOrderId,
        orderDate,
        customer: { fullName, address, city, zip, email: user?.email || 'guest@example.com' },
        items: [...cartItems],
        billing: { subtotal: cartTotal, shipping, tax, total, payment }
      });

      setIsOrdered(true);
      clearCart();
    } catch (err) {
      console.error('Supabase checkout transaction failed:', err.message);
      setCheckoutError(err.message || 'Error processing checkout invoice details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // 1. Order Confirmation/Print Invoice View
  if (isOrdered && invoiceDetails) {
    return (
      <main className="container" style={{ padding: '40px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }} className="no-print">
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            backgroundColor: 'rgba(16,185,129,0.1)', 
            color: 'var(--accent-green)',
            fontSize: '2rem',
            marginBottom: '16px' 
          }}>
            ✓
          </div>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--text-h)', margin: '0 0 8px' }}>Order Placed Successfully!</h1>
          <p style={{ color: 'var(--text)', marginBottom: '20px' }}>
            Thank you for shopping with us. Your invoice receipt has been compiled below.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={handlePrint} className="btn btn-primary">
              🖨️ Print Invoice Receipt
            </button>
            <Link to="/" className="btn btn-secondary">
              Back to Store
            </Link>
          </div>
        </div>

        {/* Printable Paper Invoice Card */}
        <div className="card glass-card" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--border)', paddingBottom: '24px', marginBottom: '24px', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', color: 'var(--text-h)', fontWeight: '800' }}>🛍️ AURA ELECTRONICS</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Premium Tech E-Commerce Portal</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>INVOICE RECEIPT</h3>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-h)', display: 'block', fontWeight: 'bold' }}>
                ID: {invoiceDetails.orderId}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Date: {invoiceDetails.orderDate}
              </span>
            </div>
          </div>

          {/* Addresses */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>
                Shipped From
              </span>
              <strong style={{ color: 'var(--text-h)', fontSize: '0.9rem' }}>Aura Storage Hub Alpha</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--text)', margin: '4px 0 0' }}>
                100 Digital Boulevard<br />
                Silicon Valley, CA 94025
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>
                Shipped To
              </span>
              <strong style={{ color: 'var(--text-h)', fontSize: '0.9rem' }}>{invoiceDetails.customer.fullName}</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--text)', margin: '4px 0 0' }}>
                {invoiceDetails.customer.address}<br />
                {invoiceDetails.customer.city}, {invoiceDetails.customer.zip}<br />
                Contact: {invoiceDetails.customer.email}
              </p>
            </div>
          </div>

          {/* Table Items */}
          <div className="custom-table-container" style={{ marginBottom: '32px' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoiceDetails.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong style={{ color: 'var(--text-h)' }}>{item.name}</strong>
                    </td>
                    <td style={{ textAlign: 'right' }}>{item.price.toFixed(2)} DT</td>
                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                      {(item.price * item.quantity).toFixed(2)} DT
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Billing Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '100%', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span>Subtotal</span>
                <strong>{invoiceDetails.billing.subtotal.toFixed(2)} DT</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span>Shipping Fee</span>
                <strong>
                  {invoiceDetails.billing.shipping === 0 ? 'FREE' : `${invoiceDetails.billing.shipping.toFixed(2)} DT`}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span>Sales Tax (8%)</span>
                <strong>{invoiceDetails.billing.tax.toFixed(2)} DT</strong>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '1.25rem', 
                fontWeight: '800', 
                color: 'var(--text-h)', 
                borderTop: '2px solid var(--border)', 
                paddingTop: '10px', 
                marginTop: '6px' 
              }}>
                <span>Paid via {invoiceDetails.billing.payment}</span>
                <span>{invoiceDetails.billing.total.toFixed(2)} DT</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div style={{ borderTop: '1px dashed var(--border)', marginTop: '40px', paddingTop: '20px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            ✓ Verified checkout compiled directly from active Supabase transactional models.
          </div>
        </div>
      </main>
    );
  }

  // 2. Checkout Invoice Billing Form (when cart is loaded)
  return (
    <main className="container" style={{ padding: '40px 0' }}>
      <h1 style={{ marginBottom: '30px', fontSize: '2.5rem', color: 'var(--text-h)' }}>
        Checkout &amp; Invoice Billing 💳
      </h1>

      {checkoutError && (
        <div style={{ padding: '12px 18px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-red)', borderRadius: '8px', marginBottom: '20px' }}>
          ⚠️ Checkout Error: {checkoutError}
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="card glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <h3>No items selected for invoicing</h3>
          <p style={{ margin: '12px 0 20px' }}>Please configure a cart size first.</p>
          <Link to="/" className="btn btn-primary">Return to Catalog</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
          
          {/* Left Side: Delivery Details Form */}
          <form onSubmit={handleSubmitOrder} className="card glass-card" style={{ padding: '30px' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '20px', color: 'var(--text-h)' }}>
              1. Delivery Parameters
            </h2>

            <div className="form-group">
              <label className="form-label">Recipient Full Name</label>
              <input 
                type="text" 
                placeholder="e.g. Jane Doe"
                className="form-control"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Street Address</label>
              <input 
                type="text" 
                placeholder="100 Maple Avenue, Apt 4B"
                className="form-control"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">City / State</label>
                <input 
                  type="text" 
                  placeholder="Paris"
                  className="form-control"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Zip Code</label>
                <input 
                  type="text" 
                  placeholder="75001"
                  className="form-control"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Payment Method</label>
              <select 
                value={payment} 
                onChange={(e) => setPayment(e.target.value)}
                className="form-control"
              >
                <option value="Credit Card">💳 Credit/Debit Card</option>
                <option value="PayPal">🅿️ PayPal Secure</option>
                <option value="Supabase Credits">⚡ Supabase Wallet Integration</option>
                <option value="Cash on Delivery">💵 Cash on Delivery</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="btn btn-success" 
              style={{ width: '100%', padding: '12px', fontSize: '1rem', marginTop: '10px' }}
              disabled={submitting}
            >
              {submitting ? 'Processing Transaction...' : `📝 Finalize & Place Order (${total.toFixed(2)} DT)`}
            </button>
          </form>

          {/* Right Side: Invoice Purchase Review */}
          <div className="card glass-card" style={{ padding: '30px', alignSelf: 'flex-start' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '20px', color: 'var(--text-h)', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              2. Review Purchase Summary
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              {cartItems.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span>
                    <strong style={{ color: 'var(--text-h)' }}>{item.quantity}x</strong> {item.name}
                  </span>
                  <span style={{ color: 'var(--text-h)', fontWeight: '600' }}>
                    {(item.price * item.quantity).toFixed(2)} DT
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border)', paddingTop: '16px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal</span>
                <span>{cartTotal.toFixed(2)} DT</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Est. Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `${shipping.toFixed(2)} DT`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Est. Sales Tax (8%)</span>
                <span>{tax.toFixed(2)} DT</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '1.15rem', 
                fontWeight: '800', 
                color: 'var(--text-h)', 
                borderTop: '2px solid var(--border)', 
                paddingTop: '12px', 
                marginTop: '6px' 
              }}>
                <span>Grand Total</span>
                <span>{total.toFixed(2)} DT</span>
              </div>
            </div>
          </div>

        </div>
      )}
    </main>
  );
};

export default Invoice;

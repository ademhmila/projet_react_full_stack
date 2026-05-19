import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../api/supabaseClient';
import { MOCK_PRODUCTS } from './Home';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

export const ProductDetails = () => {
  const { id } = useParams();
  const { addItem } = useCart();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [dbError, setDbError] = useState(null);
  
  // Form state for reviews
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Fetch product and reviews
  useEffect(() => {
    const fetchProductAndReviews = async () => {
      setLoading(true);
      setDbError(null);
      try {
        // 1. Fetch Product details from Supabase
        const { data: prodData, error: prodError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (prodError) throw prodError;

        if (prodData) {
          const seedMatch = MOCK_PRODUCTS.find(mock => mock.name.toLowerCase() === prodData.name.toLowerCase());
          const mappedProduct = {
            id: prodData.id,
            name: prodData.name,
            category: prodData.category || 'Electronics',
            price: parseFloat(prodData.price),
            stock: prodData.stock ?? 10,
            description: prodData.description || 'Premium high-performance tech hardware.',
            imageGradient: prodData.image_url 
              ? `url(${prodData.image_url})` 
              : (seedMatch?.imageGradient || 'linear-gradient(135deg, #6366f1, #d946ef)'),
            icon: prodData.image_url ? '' : (seedMatch?.icon || '📦'),
            rating: seedMatch?.rating || 4.5
          };
          setProduct(mappedProduct);
        }

        // 2. Fetch associated reviews
        const { data: revData, error: revError } = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', id)
          .order('created_at', { ascending: false });

        if (revError) throw revError;
        
        if (revData) {
          setReviews(revData.map(r => ({
            id: r.id,
            user: r.user_id ? 'Authenticated Buyer' : 'Guest Buyer',
            rating: r.rating,
            text: r.comment
          })));
        }

      } catch (err) {
        console.warn('Supabase fetch failed, using fallback static detail view:', err.message);
        setDbError(err.message);
        
        // Static mock fallback
        const mockMatch = MOCK_PRODUCTS.find(p => p.id === id);
        if (mockMatch) {
          setProduct(mockMatch);
          setReviews(mockMatch.reviews || []);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndReviews();
  }, [id]);

  const handleIncrement = () => {
    if (quantity < (product?.stock ?? 10)) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    alert(`Successfully added ${quantity}x ${product.name} to your cart!`);
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!reviewText) return;
    setReviewError('');
    setReviewSuccess(false);

    const score = parseInt(reviewRating);

    try {
      if (dbError) {
        // If in offline fallback, append local review array
        const newLocalRev = {
          id: `r-local-${Date.now()}`,
          user: reviewName || 'Guest User',
          rating: score,
          text: reviewText
        };
        setReviews(prev => [newLocalRev, ...prev]);
        setReviewSuccess(true);
      } else {
        // Live database submission to Supabase
        const { data, error } = await supabase
          .from('reviews')
          .insert({
            product_id: id,
            user_id: user?.id || null, // null if guest
            rating: score,
            comment: reviewText
          })
          .select();

        if (error) throw error;

        // Add dynamically to local array
        setReviews(prev => [{
          id: data?.[0]?.id || `r-live-${Date.now()}`,
          user: reviewName || (user ? 'Verified Customer' : 'Guest Buyer'),
          rating: score,
          text: reviewText
        }, ...prev]);

        setReviewSuccess(true);
      }

      // Reset fields
      setReviewName('');
      setReviewText('');
      setReviewRating(5);
    } catch (err) {
      console.error('Failed to submit review:', err.message);
      setReviewError(err.message || 'Error submitting review to Supabase.');
    }
  };

  if (loading) {
    return (
      <div className="container flex-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: '20px' }}>
        <div className="spinner"></div>
        <p>Loading database specifications...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div className="card glass-card" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px' }}>
          <span style={{ fontSize: '3rem' }}>🚫</span>
          <h2 style={{ marginTop: '20px', color: 'var(--text-h)' }}>Product Not Found</h2>
          <p style={{ color: 'var(--text)', margin: '12px 0 24px' }}>
            The device you are looking for does not exist or has been removed from the database.
          </p>
          <Link to="/" className="btn btn-primary">
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="container" style={{ padding: '40px 0' }}>
      {/* Back navigation link */}
      <div style={{ marginBottom: '24px' }}>
        <Link to="/" style={{ color: 'var(--primary)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <span>←</span> Back to Catalog
        </Link>
      </div>

      {/* Main Split Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', marginBottom: '60px' }}>
        
        {/* Left Side: Gradient Image */}
        <div className="card" style={{ 
          height: '400px', 
          background: product.imageGradient,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: '8rem',
          boxShadow: 'var(--shadow-hover)'
        }}>
          {product.icon && <span style={{ transform: 'scale(1.2)', display: 'inline-block' }}>{product.icon}</span>}
        </div>

        {/* Right Side: Detailed specs */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ 
            fontSize: '0.8rem', 
            fontWeight: '700', 
            textTransform: 'uppercase', 
            letterSpacing: '1px', 
            color: 'var(--primary)',
            background: 'var(--primary-glow)',
            padding: '4px 10px',
            borderRadius: '6px',
            alignSelf: 'flex-start',
            marginBottom: '12px'
          }}>
            {product.category}
          </span>
          
          <h1 style={{ fontSize: '2.5rem', lineHeight: '1.2', margin: '0 0 16px', color: 'var(--text-h)' }}>
            {product.name}
          </h1>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span className="star-rating">
              {'★'.repeat(Math.floor(product.rating))}
              {'☆'.repeat(5 - Math.floor(product.rating))}
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-h)', fontWeight: '600' }}>
              {product.rating} / 5.0
            </span>
            <span style={{ color: 'var(--text-muted)' }}>|</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {reviews.length} Customer Reviews
            </span>
          </div>

          {/* Pricing & Stock */}
          <div className="card glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>RETAIL PRICE</span>
              <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-h)' }}>
                ${product.price.toFixed(2)}
              </span>
            </div>
            <div>
              <span style={{ 
                fontSize: '0.8rem', 
                fontWeight: '700', 
                color: product.stock > 5 ? 'var(--accent-green)' : 'var(--accent-red)',
                background: product.stock > 5 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                padding: '6px 12px',
                borderRadius: '8px',
                display: 'block'
              }}>
                {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
              </span>
            </div>
          </div>

          <p style={{ color: 'var(--text)', fontSize: '1.02rem', lineHeight: '1.7', marginBottom: '32px' }}>
            {product.description}
          </p>

          {/* Interactive Cart Action */}
          {product.stock > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
              {/* Quantity Changer */}
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden', backgroundColor: 'var(--bg-card)' }}>
                <button onClick={handleDecrement} className="btn" style={{ padding: '12px 18px', border: 'none', background: 'none' }}>-</button>
                <span style={{ padding: '0 20px', fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-h)' }}>{quantity}</span>
                <button onClick={handleIncrement} className="btn" style={{ padding: '12px 18px', border: 'none', background: 'none' }}>+</button>
              </div>

              <button 
                onClick={handleAddToCart}
                className="btn btn-primary" 
                style={{ flex: '1', padding: '15px 24px', fontSize: '1rem', height: '100%' }}
              >
                📥 Add {quantity} to Cart
              </button>
            </div>
          ) : (
            <button className="btn btn-secondary" disabled style={{ width: '100%', padding: '15px' }}>
              Sold Out
            </button>
          )}
        </div>
      </div>

      {/* Reviews Split Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
        {/* Left Side: Display Existing Reviews */}
        <div>
          <h2 style={{ marginBottom: '24px' }}>💬 Customer Voice ({reviews.length})</h2>
          {reviews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {reviews.map((rev) => (
                <div key={rev.id} className="card glass-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ color: 'var(--text-h)', fontSize: '0.95rem' }}>{rev.user}</strong>
                    <span className="star-rating">
                      {'★'.repeat(rev.rating)}
                      {'☆'.repeat(5 - rev.rating)}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: '1.5' }}>"{rev.text}"</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No customer reviews recorded yet for this product.</p>
          )}
        </div>

        {/* Right Side: Add a Review Form */}
        <div>
          <h2 style={{ marginBottom: '24px' }}>✍️ Write a Review</h2>
          <form onSubmit={handleAddReview} className="card glass-card" style={{ padding: '24px' }}>
            {reviewSuccess && (
              <div style={{ 
                backgroundColor: 'rgba(16,185,129,0.1)', 
                color: 'var(--accent-green)', 
                padding: '12px', 
                borderRadius: '8px', 
                marginBottom: '16px',
                fontSize: '0.88rem',
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                ✓ Thank you! Your review has been added.
              </div>
            )}

            {reviewError && (
              <div style={{ 
                backgroundColor: 'rgba(239,68,68,0.1)', 
                color: 'var(--accent-red)', 
                padding: '12px', 
                borderRadius: '8px', 
                marginBottom: '16px',
                fontSize: '0.88rem',
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                ⚠️ {reviewError}
              </div>
            )}
            
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                placeholder={user ? "Verified Customer" : "e.g. John Doe"}
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                className="form-control"
                disabled={!!user}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Rating Score</label>
              <select 
                value={reviewRating} 
                onChange={(e) => setReviewRating(e.target.value)}
                className="form-control"
              >
                <option value="5">★★★★★ (5 Stars)</option>
                <option value="4">★★★★☆ (4 Stars)</option>
                <option value="3">★★★☆☆ (3 Stars)</option>
                <option value="2">★★☆☆☆ (2 Stars)</option>
                <option value="1">★☆☆☆☆ (1 Star)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Review Details</label>
              <textarea 
                rows="4" 
                placeholder="Share your experience with this device..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="form-control"
                required
                style={{ resize: 'vertical' }}
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Submit Product Review
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default ProductDetails;

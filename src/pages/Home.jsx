import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../api/supabaseClient';
import { useCart } from '../contexts/CartContext';

export const Home = () => {
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(null);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortOption, setSortOption] = useState('featured');

  const categories = ['All', 'Audio', 'Wearables', 'Electronics', 'Accessories'];

  // Load products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setDbError(null);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const mappedProducts = data.map(p => ({
            id: p.id,
            name: p.title, // p.title is correct in the products table schema
            category: p.category || 'Electronics',
            price: parseFloat(p.price) || 0,
            stock: p.stock ?? 0,
            description: p.description || 'Premium high-performance electronics and accessories.',
            imageGradient: p.image_url 
              ? `url(${p.image_url})` 
              : 'linear-gradient(135deg, #6366f1, #d946ef)',
            icon: p.image_url ? '' : '📦',
            rating: 4.5
          }));
          setProducts(mappedProducts);
        }
      } catch (err) {
        console.error('Supabase products fetch failed:', err.message);
        setDbError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter & Sort logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (search.trim() !== '') {
      result = result.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category !== 'All') {
      result = result.filter(p => p.category === category);
    }

    if (sortOption === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, search, category, sortOption]);

  return (
    <main className="container" style={{ padding: '40px 0' }}>
      {/* Dynamic DB indicator flag */}
      {dbError ? (
        <div style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '4px', backgroundColor: 'rgba(245, 158, 11, 0.12)', color: 'var(--accent-yellow)', marginBottom: '16px', textAlign: 'center' }}>
          ⚠️ Local Mocks Active: Set VITE_SUPABASE_URL and run DDL script to sync live tables.
        </div>
      ) : (
        <div style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '4px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-green)', marginBottom: '16px', textAlign: 'center' }}>
          ⚡ Supabase Connected: Live PostgreSQL Database Active.
        </div>
      )}

      {/* Banner */}
      <div className="card glass-card" style={{ padding: '48px', marginBottom: '40px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(236,72,153,0.06))' }}>
        <h1 style={{ fontSize: '3rem', margin: '0 0 12px', background: 'linear-gradient(135deg, var(--text-h), var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Discover Elite Technology
        </h1>
        <p style={{ maxWidth: '600px', margin: '0 auto 24px', color: 'var(--text)', fontSize: '1.05rem' }}>
          Welcome to Aura E-Shop. Browse our handpicked gadgets built to deliver high performance and premium craftsmanship.
        </p>
      </div>

      {/* Controls: Search and Filters */}
      <div className="card glass-card" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Box */}
          <div style={{ flex: '1', minWidth: '280px' }}>
            <input 
              type="text" 
              placeholder="Search modern devices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control"
            />
          </div>

          {/* Sort Dropdown */}
          <div style={{ minWidth: '180px' }}>
            <select 
              value={sortOption} 
              onChange={(e) => setSortOption(e.target.value)}
              className="form-control"
            >
              <option value="featured">Sort by: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Sort by: Rating</option>
            </select>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`btn ${category === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>🔥</span> Trending Hardware ({filteredProducts.length})
      </h2>
      
      {loading ? (
        <div className="flex-center" style={{ minHeight: '30vh', flexDirection: 'column', gap: '16px' }}>
          <div className="spinner"></div>
          <p>Querying products table...</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <div key={product.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Styled Gradient Image Thumbnail */}
              <div style={{ 
                height: '180px', 
                background: product.imageGradient,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '4.5rem',
                position: 'relative'
              }}>
                {product.icon && <span>{product.icon}</span>}
                <span className="glass-card" style={{ 
                  position: 'absolute', 
                  bottom: '12px', 
                  right: '12px', 
                  fontSize: '0.75rem', 
                  fontWeight: 'bold', 
                  padding: '4px 10px', 
                  borderRadius: '20px',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  {product.category}
                </span>
              </div>

              {/* Card Body */}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: '1' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-h)' }}>
                  {product.name}
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span className="star-rating">
                    {'★'.repeat(Math.floor(product.rating))}
                    {'☆'.repeat(5 - Math.floor(product.rating))}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    ({product.rating})
                  </span>
                </div>

                <p style={{ 
                  color: 'var(--text)', 
                  fontSize: '0.88rem', 
                  marginBottom: '20px', 
                  lineHeight: '1.5',
                  flex: '1',
                  display: '-webkit-box',
                  WebkitLineClamp: '2',
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {product.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifycontent: 'space-between', justifyContent: 'space-between', marginTop: 'auto' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>PRICE</span>
                    <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-h)' }}>
                      {product.price.toFixed(2)} DT
                    </span>
                  </div>

                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: '600', 
                    color: product.stock > 5 ? 'var(--accent-green)' : 'var(--accent-red)',
                    background: product.stock > 5 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    padding: '4px 8px',
                    borderRadius: '6px'
                  }}>
                    {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
                  </span>
                </div>

                {/* Card Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '20px' }}>
                  <Link to={`/product/${product.id}`} className="btn btn-secondary" style={{ padding: '8px' }}>
                    View details
                  </Link>
                  <button 
                    onClick={() => addItem(product, 1)}
                    disabled={product.stock <= 0}
                    className="btn btn-primary"
                    style={{ padding: '8px' }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card glass-card" style={{ padding: '60px', textAlign: 'center' }}>
          <span style={{ fontSize: '3rem' }}>🔍</span>
          <h3 style={{ marginTop: '16px', color: 'var(--text-h)' }}>No devices found</h3>
          <p style={{ color: 'var(--text)' }}>Try adjusting your search filters or clear your text.</p>
          <button onClick={() => { setSearch(''); setCategory('All'); }} className="btn btn-primary" style={{ marginTop: '20px' }}>
            Reset Filters
          </button>
        </div>
      )}
    </main>
  );
};

export default Home;

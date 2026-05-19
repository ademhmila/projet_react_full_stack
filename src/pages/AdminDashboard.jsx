import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { supabase } from '../api/supabaseClient';
import { DEMO_PRODUCTS, DEMO_ORDERS } from '../data/demoProducts';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, inventory, orders
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(null);

  // Stats Counters state
  const [kpiRevenue, setKpiRevenue] = useState(0);
  const [kpiPieces, setKpiPieces] = useState(0);
  const [kpiRating, setKpiRating] = useState(0);

  // Dynamic Chart States
  const [revenueChart, setRevenueChart] = useState([]);
  const [productSalesChart, setProductSalesChart] = useState([]);
  const [satisfactionChart, setSatisfactionChart] = useState([
    { rating: '5 Stars', count: 0, color: '#10b981' },
    { rating: '4 Stars', count: 0, color: '#0ea5e9' },
    { rating: '3 Stars', count: 0, color: '#f59e0b' },
    { rating: '2 Stars', count: 0, color: '#ec4899' },
    { rating: '1 Star', count: 0, color: '#ef4444' }
  ]);

  // Inventory & Orders states
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [orders, setOrders] = useState([]);

  // Product Form states
  const [prodName, setProdName] = useState('');
  const [prodCat, setProdCat] = useState('Audio');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);

  // Load live DB analytical metrics from Supabase on mount
  const fetchLiveDatabaseMetrics = async () => {
    setLoading(true);
    setDbError(null);
    try {
      // A. Pull products for Inventory manager
      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (prodError) throw prodError;

      if (prodData) {
        setProducts(prodData.map(p => ({
          id: p.id,
          name: p.title || p.name, // Support both schemas
          category: p.category || 'Audio',
          price: parseFloat(p.price) || 0,
          stock: p.stock ?? 0,
          description: p.description || '',
          icon: p.image_url ? '' : '📦',
          image_url: p.image_url
        })));
      } else {
        setProducts([]);
      }

      // B. Fetch orders and sum totals
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      if (ordersData && ordersData.length > 0) {
        setOrders(ordersData.map(o => ({
          id: o.id.substring(0, 8).toUpperCase(),
          client: o.user_id ? 'Authenticated Buyer' : 'Guest Customer',
          date: new Date(o.created_at).toISOString().split('T')[0],
          items: 'Store Checkout Transaction',
          total: parseFloat(o.total_price) || 0,
          status: o.status
        })));

        const sumRev = ordersData.reduce((acc, o) => acc + (parseFloat(o.total_price) || 0), 0);
        setKpiRevenue(sumRev);

        // Group monthly orders for AreaChart
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyGroups = {};
        ordersData.forEach(o => {
          const dateObj = new Date(o.created_at);
          const mName = months[dateObj.getMonth()];
          monthlyGroups[mName] = (monthlyGroups[mName] || 0) + (parseFloat(o.total_price) || 0);
        });

        const newRevChart = Object.keys(monthlyGroups).map(k => ({
          month: k,
          revenue: monthlyGroups[k]
        }));
        if (newRevChart.length > 0) setRevenueChart(newRevChart);
      } else {
        setOrders([]);
        setKpiRevenue(0);
        setRevenueChart([]);
      }

      // C. Fetch order_items for sold pieces breakdown
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('quantity, products (title)');

      if (!itemsError && itemsData) {
        const productSales = {};
        itemsData.forEach(item => {
          const pName = item.products?.title || 'Electronics Gadget';
          productSales[pName] = (productSales[pName] || 0) + (item.quantity || 0);
        });

        const newProductSalesChart = Object.keys(productSales).map(name => ({
          name,
          sold: productSales[name]
        }));
        setProductSalesChart(newProductSalesChart);

        const totalPieces = itemsData.reduce((acc, item) => acc + (item.quantity || 0), 0);
        setKpiPieces(totalPieces);
      } else {
        setProductSalesChart([]);
        setKpiPieces(0);
      }

      // D. Fetch reviews and compute averages
      const { data: revData, error: revError } = await supabase
        .from('reviews')
        .select('rating');

      if (revError) throw revError;

      if (revData && revData.length > 0) {
        const avg = revData.reduce((acc, r) => acc + r.rating, 0) / revData.length;
        setKpiRating(parseFloat(avg.toFixed(1)));

        // PieChart Reviews distribution
        const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        revData.forEach(r => {
          if (ratingCounts[r.rating] !== undefined) ratingCounts[r.rating]++;
        });

        const newSat = [
          { rating: '5 Stars', count: Math.round((ratingCounts[5] / revData.length) * 100) || 0, color: '#10b981' },
          { rating: '4 Stars', count: Math.round((ratingCounts[4] / revData.length) * 100) || 0, color: '#0ea5e9' },
          { rating: '3 Stars', count: Math.round((ratingCounts[3] / revData.length) * 100) || 0, color: '#f59e0b' },
          { rating: '2 Stars', count: Math.round((ratingCounts[2] / revData.length) * 100) || 0, color: '#ec4899' },
          { rating: '1 Star', count: Math.round((ratingCounts[1] / revData.length) * 100) || 0, color: '#ef4444' }
        ];
        setSatisfactionChart(newSat);
      } else {
        setKpiRating(0);
        setSatisfactionChart([
          { rating: '5 Stars', count: 0, color: '#10b981' },
          { rating: '4 Stars', count: 0, color: '#0ea5e9' },
          { rating: '3 Stars', count: 0, color: '#f59e0b' },
          { rating: '2 Stars', count: 0, color: '#ec4899' },
          { rating: '1 Star', count: 0, color: '#ef4444' }
        ]);
      }

    } catch (err) {
      console.warn('Supabase loading metrics failed, enabling offline fallbacks:', err.message);
      setDbError(err.message);
      
      // Load full demo products
      setProducts(DEMO_PRODUCTS.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        stock: p.stock,
        description: p.description,
        icon: p.icon || '📦',
        image_url: null
      })));

      // Load full demo orders
      setOrders(DEMO_ORDERS);

      // Aggregate revenue and pieces
      const sumRev = DEMO_ORDERS.reduce((acc, o) => acc + o.total, 0);
      setKpiRevenue(sumRev);
      setKpiPieces(7);
      setKpiRating(4.7);

      // Demo Revenue Chart
      setRevenueChart([
        { month: 'Jan', revenue: 400 },
        { month: 'Feb', revenue: 600 },
        { month: 'Mar', revenue: 950 },
        { month: 'Apr', revenue: 1450 },
        { month: 'May', revenue: sumRev }
      ]);

      // Demo Product Sales Chart
      setProductSalesChart([
        { name: 'Aura Pro Headphones', sold: 2 },
        { name: 'Quantum Smartwatch X', sold: 1 },
        { name: 'VisionX AR Glasses', sold: 1 },
        { name: 'MechForce Keyboard', sold: 1 },
        { name: 'AeroFit Pro Band', sold: 2 }
      ]);

      // Demo Satisfaction Chart
      setSatisfactionChart([
        { rating: '5 Stars', count: 70, color: '#10b981' },
        { rating: '4 Stars', count: 20, color: '#0ea5e9' },
        { rating: '3 Stars', count: 10, color: '#f59e0b' },
        { rating: '2 Stars', count: 0, color: '#ec4899' },
        { rating: '1 Star', count: 0, color: '#ef4444' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveDatabaseMetrics();
  }, []);

  // Submit product with real image upload to Supabase Storage Buckets
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!prodName || !prodPrice || !prodStock) return;
    
    let uploadedImageUrl = '';
    setImageUploading(true);

    try {
      // 1. Upload file to Supabase Storage Bucket ('product-images')
      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, selectedImage);

        if (uploadError) throw uploadError;

        // Get public read link
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        uploadedImageUrl = publicUrl;
      }

      // 2. Perform SQL database insertion/modification
      const payload = {
        title: prodName,
        category: prodCat,
        price: parseFloat(prodPrice),
        stock: parseInt(prodStock),
        description: prodDesc,
        image_url: uploadedImageUrl || (editingProduct ? editingProduct.image_url : null)
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id);

        if (error) throw error;
        alert('Database product updated successfully!');
        setEditingProduct(null);
      } else {
        const { error } = await supabase
          .from('products')
          .insert(payload);

        if (error) throw error;
        alert('Database product created successfully (Live Bucket Upload completed)!');
      }
      
      // Reload state
      await fetchLiveDatabaseMetrics();

    } catch (err) {
      console.warn('Supabase product submit failed, updating locally:', err.message);
      const mockId = editingProduct ? editingProduct.id : `demo-${Date.now()}`;
      const payload = {
        id: mockId,
        name: prodName,
        category: prodCat,
        price: parseFloat(prodPrice) || 0,
        stock: parseInt(prodStock) || 0,
        description: prodDesc,
        icon: '📦',
        image_url: editingProduct ? editingProduct.image_url : null
      };

      if (editingProduct) {
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? payload : p));
        alert('Offline Fallback: Product updated locally!');
        setEditingProduct(null);
      } else {
        setProducts(prev => [payload, ...prev]);
        alert('Offline Fallback: Product created locally!');
      }

      setProdName('');
      setProdPrice('');
      setProdStock('');
      setProdDesc('');
      setSelectedImage(null);
    } finally {
      setImageUploading(false);
    }
  };

  const handleEditInit = (product) => {
    setEditingProduct(product);
    setProdName(product.name);
    setProdCat(product.category);
    setProdPrice(product.price.toString());
    setProdStock(product.stock.toString());
    setProdDesc(product.description || '');
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Successfully deleted product from Supabase table!');
      await fetchLiveDatabaseMetrics();
    } catch (err) {
      console.warn('Supabase delete failed, removing locally:', err.message);
      setProducts(prev => prev.filter(p => p.id !== id));
      alert('Offline Fallback: Product deleted locally!');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // Since order ID display is shortened in UI tables, find full uuid match first
      const { data: fullOrders } = await supabase.from('orders').select('id');
      const match = fullOrders?.find(fo => fo.id.substring(0, 8).toUpperCase() === orderId);
      
      if (match) {
        const { error } = await supabase
          .from('orders')
          .update({ status: newStatus })
          .eq('id', match.id);

        if (error) throw error;
        alert('Fulfillment status updated inside database!');
      }
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar Controls */}
      <aside className="admin-sidebar">
        <h3 style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '14px', paddingLeft: '16px' }}>
          Operations
        </h3>
        <button 
          onClick={() => setActiveTab('analytics')}
          className={`admin-sidebar-btn ${activeTab === 'analytics' ? 'active' : ''}`}
        >
          📊 Dashboard Analytics
        </button>
        <button 
          onClick={() => setActiveTab('inventory')}
          className={`admin-sidebar-btn ${activeTab === 'inventory' ? 'active' : ''}`}
        >
          📦 Inventory Management
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`admin-sidebar-btn ${activeTab === 'orders' ? 'active' : ''}`}
        >
          📋 Order Management
        </button>
      </aside>

      {/* Main Panel Content */}
      <main className="admin-main">
        {dbError && (
          <div style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '4px', backgroundColor: 'rgba(245, 158, 11, 0.12)', color: 'var(--accent-yellow)', marginBottom: '16px', textAlign: 'center' }}>
            ⚠️ Local Mocks Active: Set VITE_SUPABASE_URL and run DDL script to sync live tables.
          </div>
        )}

        {loading ? (
          <div className="flex-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
            <div className="spinner"></div>
            <p>Syncing live charts and storage indices...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: ANALYTICS */}
            {activeTab === 'analytics' && (
              <div>
                <div style={{ marginBottom: '32px' }}>
                  <h1 style={{ fontSize: '2.2rem', color: 'var(--text-h)', margin: '0 0 6px' }}>Interactive Analytics</h1>
                  <p style={{ color: 'var(--text)' }}>Monitor your store revenues, total sold assets, and feedback statistics.</p>
                </div>

                {/* Metrics cards */}
                <div className="analytics-grid">
                  <div className="card glass-card analytic-card">
                    <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)' }}>TOTAL REVENUE</span>
                    <span className="analytic-value">{kpiRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DT</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-green)' }}>Processed transactional totals</span>
                  </div>
                  <div className="card glass-card analytic-card">
                    <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)' }}>PIECES SOLD</span>
                    <span className="analytic-value">{kpiPieces} units</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Fulfillment in-progress</span>
                  </div>
                  <div className="card glass-card analytic-card">
                    <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)' }}>CUSTOMER SATISFACTION</span>
                    <span className="analytic-value">{kpiRating} / 5.0</span>
                    <span className="star-rating">{'★'.repeat(Math.round(kpiRating))}</span>
                  </div>
                </div>

                {/* Recharts Displays */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', marginBottom: '30px' }}>
                  
                  {/* Chart 1: Revenue Trends */}
                  <div className="card glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '18px', fontSize: '1.1rem' }}>📈 Revenue Progression (DT)</h3>
                    <div style={{ width: '100%', height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueChart}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="month" stroke="var(--text)" fontSize={11} />
                          <YAxis stroke="var(--text)" fontSize={11} />
                          <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }} />
                          <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart 2: Product sales */}
                  <div className="card glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '18px', fontSize: '1.1rem' }}>📊 Pieces Sold Per Product Line</h3>
                    <div style={{ width: '100%', height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={productSalesChart}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="name" stroke="var(--text)" fontSize={9} />
                          <YAxis stroke="var(--text)" fontSize={11} />
                          <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }} />
                          <Bar dataKey="sold" fill="var(--accent-blue)" radius={[4, 4, 0, 0]}>
                            {productSalesChart.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--primary)' : 'var(--accent-blue)'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>

                {/* Chart 3: Reviews Breakdown */}
                <div className="card glass-card" style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
                  <h3 style={{ marginBottom: '18px', fontSize: '1.1rem', textAlign: 'center' }}>🌟 Review Scores Distribution</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '100%', height: '220px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={satisfactionChart}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="count"
                          >
                            {satisfactionChart.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Custom list description */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {satisfactionChart.map((data) => (
                        <div key={data.rating} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: data.color, display: 'inline-block' }}></span>
                          <strong style={{ color: 'var(--text-h)' }}>{data.rating}:</strong>
                          <span>{data.count}% of reviewers</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: INVENTORY */}
            {activeTab === 'inventory' && (
              <div>
                <div style={{ marginBottom: '32px' }}>
                  <h1 style={{ fontSize: '2.2rem', color: 'var(--text-h)', margin: '0 0 6px' }}>Inventory Management</h1>
                  <p style={{ color: 'var(--text)' }}>Create, edit, or adjust items inside your Supabase e-commerce database catalog.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
                  
                  {/* Product list */}
                  <div>
                    <h3 style={{ marginBottom: '16px', fontSize: '1.2rem' }}>📦 Store Catalog ({products.length} Products)</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {products.map((p) => (
                        <div key={p.id} className="card glass-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            {p.image_url ? (
                              <img src={p.image_url} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                            ) : (
                              <span style={{ fontSize: '2rem' }}>{p.icon || '📦'}</span>
                            )}
                            <div>
                              <strong style={{ color: 'var(--text-h)', fontSize: '0.95rem', display: 'block' }}>{p.name}</strong>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {p.price.toFixed(2)} DT | Stock: <strong style={{ color: 'var(--text-h)' }}>{p.stock}</strong>
                              </span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleEditInit(p)} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.75rem' }}>
                              Edit
                            </button>
                            <button onClick={() => handleDeleteProduct(p.id)} className="btn btn-danger" style={{ padding: '6px 10px', fontSize: '0.75rem' }}>
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Product creator form */}
                  <div>
                    <h3 style={{ marginBottom: '16px', fontSize: '1.2rem' }}>
                      {editingProduct ? '📝 Edit Stock Entry' : '➕ Add Catalog Entry'}
                    </h3>
                    <form onSubmit={handleProductSubmit} className="card glass-card" style={{ padding: '24px' }}>
                      
                      <div className="form-group">
                        <label className="form-label">Product Title</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Aura Pro Mouse"
                          className="form-control"
                          value={prodName}
                          onChange={(e) => setProdName(e.target.value)}
                          required
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                          <label className="form-label">Category</label>
                          <select 
                            className="form-control"
                            value={prodCat}
                            onChange={(e) => setProdCat(e.target.value)}
                          >
                            <option value="Audio">Audio</option>
                            <option value="Wearables">Wearables</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Accessories">Accessories</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Pricing (DT)</label>
                          <input 
                            type="number" 
                            step="0.01"
                            placeholder="99.99"
                            className="form-control"
                            value={prodPrice}
                            onChange={(e) => setProdPrice(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Initial Stock Volume</label>
                        <input 
                          type="number" 
                          placeholder="15"
                          className="form-control"
                          value={prodStock}
                          onChange={(e) => setProdStock(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Brief Description</label>
                        <textarea 
                          rows="3" 
                          placeholder="Input specifications..."
                          className="form-control"
                          value={prodDesc}
                          onChange={(e) => setProdDesc(e.target.value)}
                          style={{ resize: 'vertical' }}
                        ></textarea>
                      </div>

                      {/* Image upload trigger */}
                      <div className="form-group">
                        <label className="form-label">Upload Product Image (Supabase Bucket)</label>
                        <input 
                          type="file" 
                          accept="image/*"
                          className="form-control" 
                          style={{ padding: '8px' }}
                          onChange={(e) => setSelectedImage(e.target.files[0])}
                        />
                        <small style={{ display: 'block', marginTop: '6px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          💡 Uploads directly into 'product-images' Storage bucket.
                        </small>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: '1' }} disabled={imageUploading}>
                          {imageUploading ? 'Uploading & Creating...' : editingProduct ? 'Confirm Edits' : 'Create Product'}
                        </button>
                        {editingProduct && (
                          <button 
                            type="button" 
                            onClick={() => {
                              setEditingProduct(null);
                              setProdName('');
                              setProdPrice('');
                              setProdStock('');
                              setProdDesc('');
                              setSelectedImage(null);
                            }} 
                            className="btn btn-secondary"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 3: ORDER MANAGEMENT */}
            {activeTab === 'orders' && (
              <div>
                <div style={{ marginBottom: '32px' }}>
                  <h1 style={{ fontSize: '2.2rem', color: 'var(--text-h)', margin: '0 0 6px' }}>Order Management</h1>
                  <p style={{ color: 'var(--text)' }}>View incoming customer checkouts and update fulfillment status flags.</p>
                </div>

                <div className="card glass-card">
                  <div className="custom-table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Items Purchased</th>
                          <th style={{ textAlign: 'right' }}>Total (DT)</th>
                          <th style={{ textAlign: 'center' }}>Fulfillment Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((o) => (
                          <tr key={o.id}>
                            <td>
                              <strong style={{ color: 'var(--text-h)', fontSize: '0.88rem' }}>{o.id}</strong>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Date: {o.date}</span>
                            </td>
                            <td>{o.client}</td>
                            <td style={{ fontSize: '0.85rem' }}>{o.items}</td>
                            <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--text-h)' }}>
                              {o.total.toFixed(2)} DT
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <select 
                                value={o.status} 
                                onChange={(e) => handleStatusChange(o.id, e.target.value)}
                                className="form-control"
                                style={{ 
                                  fontSize: '0.8rem', 
                                  padding: '6px 10px', 
                                  borderRadius: '6px',
                                  width: '130px', 
                                  margin: '0 auto',
                                  fontWeight: '700',
                                  textAlign: 'center',
                                  backgroundColor: 
                                    o.status === 'pending' ? 'rgba(245, 158, 11, 0.15)' :
                                    o.status === 'confirmed' ? 'rgba(14, 165, 233, 0.15)' :
                                    o.status === 'shipped' ? 'rgba(16, 185, 129, 0.15)' :
                                    o.status === 'returned' ? 'rgba(236, 72, 153, 0.15)' :
                                    'rgba(239, 68, 68, 0.15)',
                                  color: 
                                    o.status === 'pending' ? 'var(--accent-yellow)' :
                                    o.status === 'confirmed' ? 'var(--accent-blue)' :
                                    o.status === 'shipped' ? 'var(--accent-green)' :
                                    o.status === 'returned' ? 'var(--accent-pink)' :
                                    'var(--accent-red)'
                                }}
                              >
                                <option value="pending">🕒 Pending</option>
                                <option value="confirmed">✓ Confirmed</option>
                                <option value="shipped">🚀 Shipped</option>
                                <option value="returned">↩ Returned</option>
                                <option value="canceled">✖ Canceled</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;

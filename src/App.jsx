import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Standard Pages
import Home from './pages/Home';
import Cart from './pages/Cart';
import Login from './pages/Login';

// Dynamic Lazy Loading for Heavy Components
const ProductDetails = React.lazy(() => import('./pages/ProductDetails'));
const Invoice = React.lazy(() => import('./pages/Invoice'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));

import './App.css';

function App() {
  const loadingSpinner = (
    <div className="flex-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: '20px' }}>
      <div className="spinner"></div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', letterSpacing: '1px' }}>
        LOADING SECURE COMPONENT...
      </p>
    </div>
  );

  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            
            {/* Global E-commerce Navigation Header */}
            <Navbar />

            {/* Application Views & Router Configuration */}
            <div style={{ flex: '1' }}>
              <React.Suspense fallback={loadingSpinner}>
                <Routes>
                  {/* 1. Public Storefront Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/login" element={<Login />} />

                  {/* 2. Customer Secure Checkout Checkout (Enforced Login) */}
                  <Route 
                    path="/invoice" 
                    element={
                      <ProtectedRoute>
                        <Invoice />
                      </ProtectedRoute>
                    } 
                  />

                  {/* 3. Protected Operations Dashboard (Enforced Admin Role) */}
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } 
                  />


                {/* 4. Global 404 Catch-All Page */}
                <Route 
                  path="*" 
                  element={
                    <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
                      <div className="card glass-card" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px' }}>
                        <span style={{ fontSize: '3.5rem' }}>📭</span>
                        <h2 style={{ marginTop: '20px', color: 'var(--text-h)' }}>404 - Page Not Found</h2>
                        <p style={{ color: 'var(--text)', margin: '12px 0 24px' }}>
                          The link you followed may be broken or the resource might have been deleted.
                        </p>
                        <a href="/" className="btn btn-primary">
                          Return to Home
                        </a>
                      </div>
                    </div>
                  } 
                />
              </Routes>
            </React.Suspense>
          </div>

            {/* Custom Premium Footer */}
            <footer style={{ 
              borderTop: '1px solid var(--border)', 
              padding: '24px 0', 
              textAlign: 'center', 
              fontSize: '0.82rem', 
              color: 'var(--text-muted)',
              backgroundColor: 'var(--bg-glass)',
              marginTop: '40px' 
            }} className="no-print">
              <div className="container">
                <p>© {new Date().getFullYear()} Aura E-Shop. Professional Capstone Project Certification Suite.</p>
                <p style={{ marginTop: '4px', fontSize: '0.75rem' }}>
                  Powered by React 19, Supabase Authentication, PostgreSQL, and Recharts Analytics.
                </p>
              </div>
            </footer>

          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

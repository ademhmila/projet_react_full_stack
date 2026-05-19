import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export const Navbar = () => {
  const { user, profile, signOut, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="logo-link">
          <span>🛍️</span>
          <span>AURA E-Shop</span>
        </Link>

        <nav>
          <ul className="nav-menu">
            <li>
              <NavLink 
                to="/" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Products
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/cart" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                style={{ position: 'relative' }}
              >
                Cart
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </NavLink>
            </li>
            {isAdmin && (
              <li>
                <NavLink 
                  to="/admin" 
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  style={{ color: 'var(--primary)', fontWeight: 'bold' }}
                >
                  Admin Panel 🛡️
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        <div className="nav-actions">
          {user ? (
            <div style={{ display: 'flex', alignPage: 'center', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Hello, <strong style={{ color: 'var(--text-h)' }}>{profile?.full_name || user.email}</strong>
              </span>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

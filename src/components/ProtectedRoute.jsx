import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, profile, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '80vh', flexDirection: 'column', gap: '20px' }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', letterSpacing: '1px' }}>
          VERIFYING ACCESS PRIVILEGES...
        </p>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If route requires admin and user is not an admin, deny access
  if (requireAdmin && !isAdmin) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="card glass-card" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px' }}>
          <div className="error-icon" style={{ fontSize: '3.5rem', marginBottom: '20px', color: 'var(--accent-red, #ef4444)' }}>
            ⚠️
          </div>
          <h2 style={{ color: 'var(--text-h)', marginBottom: '15px' }}>Access Denied</h2>
          <p style={{ color: 'var(--text)', marginBottom: '25px', fontSize: '0.95rem', lineHeight: '1.5' }}>
            You do not have administrative permissions to view this resource. 
            This area is restricted to administrators only.
          </p>
          <Navigate to="/" replace={false} />
          <a href="/" className="btn btn-primary" style={{ display: 'inline-block' }}>
            Return to Homepage
          </a>
        </div>
      </div>
    );
  }

  return children;
};
export default ProtectedRoute;

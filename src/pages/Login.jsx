import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Login = () => {
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Determine post-login redirect path
  const redirectPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setAuthLoading(true);

    try {
      if (isLoginTab) {
        // Sign-in
        const { data, error } = await signIn(email, password);
        if (error) {
          setErrorMsg(error.message || 'Invalid email or password.');
        } else {
          setSuccessMsg('Welcome back! Logging you in...');
          setTimeout(() => {
            navigate(redirectPath, { replace: true });
          }, 1000);
        }
      } else {
        // Sign-up
        const { data, error } = await signUp(email, password, fullName);
        if (error) {
          setErrorMsg(error.message || 'Registration failed. Try again.');
        } else {
          setSuccessMsg('Account created successfully! You can now log in.');
          setIsLoginTab(true); // Switch to login tab
          setPassword('');
        }
      }
    } catch (err) {
      setErrorMsg('An unexpected authentication error occurred.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDemoFill = (role) => {
    if (role === 'admin') {
      setEmail('admin@example.com');
      setPassword('admin123');
    } else {
      setEmail('user@example.com');
      setPassword('user123');
    }
  };

  return (
    <main className="container flex-center" style={{ minHeight: '80vh', padding: '40px 0' }}>
      <div style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Auth form card */}
        <div className="card glass-card" style={{ padding: '36px' }}>
          {/* Header tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
            <button
              onClick={() => { setIsLoginTab(true); setErrorMsg(''); setSuccessMsg(''); }}
              style={{ 
                background: 'none', 
                border: 'none', 
                fontWeight: '700', 
                fontSize: '1.05rem', 
                color: isLoginTab ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px 0',
                borderBottom: isLoginTab ? '2px solid var(--primary)' : '2px solid transparent'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLoginTab(false); setErrorMsg(''); setSuccessMsg(''); }}
              style={{ 
                background: 'none', 
                border: 'none', 
                fontWeight: '700', 
                fontSize: '1.05rem', 
                color: !isLoginTab ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px 0',
                borderBottom: !isLoginTab ? '2px solid var(--primary)' : '2px solid transparent'
              }}
            >
              Register
            </button>
          </div>

          <h2 style={{ textAlign: 'center', marginBottom: '24px', fontSize: '1.4rem' }}>
            {isLoginTab ? 'Access Your Account' : 'Create Customer Account'}
          </h2>

          {/* Status Alerts */}
          {errorMsg && (
            <div style={{ 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              color: 'var(--accent-red)', 
              padding: '12px 16px', 
              borderRadius: '8px', 
              marginBottom: '20px', 
              fontSize: '0.88rem',
              fontWeight: '500'
            }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{ 
              backgroundColor: 'rgba(16, 185, 129, 0.1)', 
              color: 'var(--accent-green)', 
              padding: '12px 16px', 
              borderRadius: '8px', 
              marginBottom: '20px', 
              fontSize: '0.88rem',
              fontWeight: '500'
            }}>
              ✓ {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full Name (Sign Up only) */}
            {!isLoginTab && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  placeholder="Jane Smith"
                  className="form-control"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                placeholder="you@example.com"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '12px', fontSize: '1rem', marginTop: '10px' }}
              disabled={authLoading}
            >
              {authLoading ? 'Verifying Credentials...' : isLoginTab ? 'Log In Securely' : 'Sign Up Customer'}
            </button>
          </form>
        </div>

        {/* Demo Helper box */}
        <div className="card glass-card" style={{ padding: '24px', border: '1px dashed var(--border)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
            🛠️ Capstone Evaluation Quick Logins
          </span>
          <p style={{ fontSize: '0.82rem', color: 'var(--text)', marginBottom: '14px', lineHeight: '1.4' }}>
            Use the buttons below to instantly pre-fill local demo accounts for rapid dashboard testing:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button 
              type="button" 
              onClick={() => handleDemoFill('admin')}
              className="btn btn-secondary" 
              style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}
            >
              <strong>Demo Admin</strong>
              <span>admin@example.com</span>
            </button>
            <button 
              type="button" 
              onClick={() => handleDemoFill('user')}
              className="btn btn-secondary" 
              style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}
            >
              <strong>Demo Customer</strong>
              <span>user@example.com</span>
            </button>
          </div>
        </div>

      </div>
    </main>
  );
};

export default Login;

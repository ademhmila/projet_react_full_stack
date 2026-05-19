import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Navbar from './Navbar';

// Mock context modules
const mockUseAuth = vi.fn();
const mockUseCart = vi.fn();

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}));

vi.mock('../contexts/CartContext', () => ({
  useCart: () => mockUseCart()
}));

describe('Navbar Integration Testing Suite', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Default mock cart counters
    mockUseCart.mockReturnValue({
      cartCount: 0
    });
  });

  it('should render basic links and a Sign In button for guest users', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
      isAdmin: false,
      signOut: vi.fn()
    });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    // Verify Title Logo and menus
    expect(screen.getByText('AURA E-Shop')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Cart')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    
    // Verify admin routes and cart badges are hidden
    expect(screen.queryByText('Admin Panel 🛡️')).not.toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('should render welcome greeting and logout trigger once logged in', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'usr-1', email: 'buyer@aura.com' },
      profile: { full_name: 'Alice Jenkins', role: 'customer' },
      isAdmin: false,
      signOut: vi.fn()
    });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText('Hello,')).toBeInTheDocument();
    expect(screen.getByText('Alice Jenkins')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
  });

  it('should exhibit the Admin Panel option exclusively for admin users', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'adm-1', email: 'boss@aura.com' },
      profile: { full_name: 'Boss Admin', role: 'admin' },
      isAdmin: true,
      signOut: vi.fn()
    });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText('Admin Panel 🛡️')).toBeInTheDocument();
  });

  it('should render the dynamic notification badge count when items exist in cart', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
      isAdmin: false
    });
    mockUseCart.mockReturnValue({
      cartCount: 7
    });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('7')).toHaveClass('cart-badge');
  });
});

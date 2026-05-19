import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to fetch user profile (e.g. role: 'admin') from profiles table
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile from Supabase profiles table:', error.message);
        // Return a fallback mock profile for development/testing
        return {
          id: userId,
          full_name: 'Demo User',
          role: userId === 'demo-admin-id' ? 'admin' : 'customer'
        };
      }
      return data;
    } catch (err) {
      console.error('Profile fetch failed:', err);
      return null;
    }
  };

  useEffect(() => {
    // 1. Check active session on mount
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          const prof = await fetchProfile(session.user.id);
          setProfile(prof);
        } else {
          // Check local storage for dummy demo login
          const demoUser = localStorage.getItem('demo_user');
          if (demoUser) {
            const parsed = JSON.parse(demoUser);
            setUser(parsed);
            setProfile({
              id: parsed.id,
              full_name: parsed.email === 'admin@example.com' ? 'Demo Admin' : 'Demo Customer',
              role: parsed.email === 'admin@example.com' ? 'admin' : 'customer'
            });
          }
        }
      } catch (err) {
        console.error('Session retrieval error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // 2. Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true);
      if (session?.user) {
        setUser(session.user);
        const prof = await fetchProfile(session.user.id);
        setProfile(prof);
      } else {
        // If not a standard session, check if demo mode was cleared
        const demoUser = localStorage.getItem('demo_user');
        if (!demoUser) {
          setUser(null);
          setProfile(null);
        }
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Professional sign-in with email & password
  const signIn = async (email, password) => {
    setLoading(true);
    try {
      // Direct demo logins for testing without configured Supabase
      if (email === 'admin@example.com' && password === 'admin123') {
        const demoAdmin = { id: 'demo-admin-id', email: 'admin@example.com' };
        localStorage.setItem('demo_user', JSON.stringify(demoAdmin));
        setUser(demoAdmin);
        setProfile({ id: 'demo-admin-id', full_name: 'Demo Admin', role: 'admin' });
        setLoading(false);
        return { data: { user: demoAdmin }, error: null };
      } else if (email === 'user@example.com' && password === 'user123') {
        const demoUser = { id: 'demo-user-id', email: 'user@example.com' };
        localStorage.setItem('demo_user', JSON.stringify(demoUser));
        setUser(demoUser);
        setProfile({ id: 'demo-user-id', full_name: 'Demo Customer', role: 'customer' });
        setLoading(false);
        return { data: { user: demoUser }, error: null };
      }

      // Live Supabase Authentication
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      const prof = await fetchProfile(data.user.id);
      setProfile(prof);
      return { data, error: null };
    } catch (error) {
      console.error('Sign-in failed:', error.message);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Sign-up
  const signUp = async (email, password, fullName) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });
      if (error) throw error;

      // Note: A trigger in PostgreSQL typically populates profiles on auth.users insert.
      // If it doesn't trigger immediately, we can insert manually here:
      if (data?.user) {
        const newProfile = {
          id: data.user.id,
          full_name: fullName,
          role: 'customer' // default role
        };
        await supabase.from('profiles').upsert(newProfile);
        setProfile(newProfile);
      }

      return { data, error: null };
    } catch (error) {
      console.error('Sign-up failed:', error.message);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Sign-out
  const signOut = async () => {
    setLoading(true);
    try {
      localStorage.removeItem('demo_user');
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign-out error:', error.message);
    } finally {
      setUser(null);
      setProfile(null);
      setLoading(false);
    }
  };

  // Helper check for role
  const isAdmin = profile?.role === 'admin';

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

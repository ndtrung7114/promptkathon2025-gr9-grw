import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { adminService, type UserRole } from '@/lib/supabase/database-existing';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  name?: string;
  hasAdvantage: boolean;
  avatar_url?: string;
  role: UserRole;
  isAdmin: boolean;
}

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name?: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  upgradeToAdvantage: () => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

const mapSupabaseUserToUser = async (supabaseUser: SupabaseUser): Promise<User> => {
  console.log('Mapping user:', supabaseUser.id, supabaseUser.email);
  
  try {
    // Add timeout to prevent hanging
    const rolePromise = adminService.getUserRole(supabaseUser.id);
    const isAdminPromise = adminService.isAdmin(supabaseUser.id);
    
    // Set a 5-second timeout for role fetching
    const timeoutPromise = new Promise<{ role: UserRole; isAdmin: boolean }>((_, reject) => {
      setTimeout(() => reject(new Error('Role fetch timeout')), 5000);
    });
    
    const roleDataPromise = Promise.all([rolePromise, isAdminPromise]).then(([role, isAdmin]) => ({
      role,
      isAdmin
    }));
    
    const { role, isAdmin } = await Promise.race([roleDataPromise, timeoutPromise]);
    
    console.log('User role fetched:', { role, isAdmin });
    
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name,
      avatar_url: supabaseUser.user_metadata?.avatar_url,
      hasAdvantage: true,
      role,
      isAdmin
    };
  } catch (error) {
    console.error('Error fetching user role, using defaults:', error);
    // Fallback to default values if role fetching fails
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name,
      avatar_url: supabaseUser.user_metadata?.avatar_url,
      hasAdvantage: true,
      role: 'user',
      isAdmin: false
    };
  }
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const mappedUser = await mapSupabaseUserToUser(session.user);
          setUser(mappedUser);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (session?.user) {
          const mappedUser = await mapSupabaseUserToUser(session.user);
          setUser(mappedUser);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return false;
      }

      if (data.user) {
        const mappedUser = await mapSupabaseUserToUser(data.user);
        setUser(mappedUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, name?: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      });

      if (error) {
        console.error('Registration error:', error);
        return false;
      }

      if (data.user) {
        // Don't set user immediately, wait for email confirmation
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error('Google login error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const upgradeToAdvantage = async (): Promise<boolean> => {
    // No longer needed, but keep for compatibility
    return true;
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        upgradeToAdvantage
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

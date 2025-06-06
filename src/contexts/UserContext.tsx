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
  isPremium: boolean;
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
    // Check for cached user data first
    const cachedUserData = localStorage.getItem('user_data');
    if (cachedUserData) {
      try {
        const parsedUser = JSON.parse(cachedUserData);
        if (parsedUser.id === supabaseUser.id) {
          console.log('Using cached user data temporarily while fetching fresh data');
          // Return cached data immediately, but still fetch fresh data below
          setTimeout(() => {
            // Refresh the data in background
            mapSupabaseUserToUser(supabaseUser).catch(console.error);
          }, 5000);
          return {
            ...parsedUser,
            email: supabaseUser.email || parsedUser.email || ''
          };
        }
      } catch (e) {
        console.error('Error parsing cached user data:', e);
      }
    }
    
    // Fetch user profile to get premium status - prioritize this 
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('is_premium, role')
      .eq('id', supabaseUser.id)
      .single();
    
    if (profileError) {
      console.error('Error fetching profile data:', profileError);
      // Don't throw, try to continue with defaults
    }

    // Only get the role from the profile, skip admin check
    const role = profileData?.role || 'user';
    const isPremium = profileData?.is_premium || false;
    
    console.log('User data fetched:', { role, isPremium });
    
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name,
      avatar_url: supabaseUser.user_metadata?.avatar_url,
      hasAdvantage: true,
      role,
      isAdmin: false, // Skip the admin check as requested
      isPremium
    };
  } catch (error) {
    console.error('Error fetching user data, using defaults:', error);
    
    // Try to get the previously stored user instead of falling back to false
    const previousUser = localStorage.getItem('user_data');
    if (previousUser) {
      try {
        const parsedUser = JSON.parse(previousUser);
        if (parsedUser.id === supabaseUser.id) {
          console.log('Using cached user data from localStorage');
          return {
            ...parsedUser,
            email: supabaseUser.email || parsedUser.email || '',
            name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || parsedUser.name,
            avatar_url: supabaseUser.user_metadata?.avatar_url || parsedUser.avatar_url
          };
        }
      } catch (e) {
        console.error('Error parsing cached user data:', e);
      }
    }
    
    // Ultimate fallback if no cached data exists or can't be parsed
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name,
      avatar_url: supabaseUser.user_metadata?.avatar_url,
      hasAdvantage: true,
      role: 'user',
      isAdmin: false,
      isPremium: false
    };
  }
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);  // Cached user setter function with error handling
  const setCachedUser = (newUser: User | null) => {
    try {
      if (newUser) {
        // Store the user data in localStorage to persist premium status
        localStorage.setItem('user_data', JSON.stringify(newUser));
      } else {
        localStorage.removeItem('user_data');
      }
      setUser(newUser);
    } catch (error) {
      console.error("Error setting cached user:", error);
      // Still try to set the user in state even if localStorage fails
      setUser(newUser);
    }
  };
  
  useEffect(() => {
    let isMounted = true;
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        // Check for cached user first for immediate UI feedback
        const cachedUserData = localStorage.getItem('user_data');
        let initialUser: User | null = null;
        
        if (cachedUserData) {
          try {
            initialUser = JSON.parse(cachedUserData);
            // Set user temporarily from cache while we fetch the latest
            if (isMounted) setUser(initialUser);
          } catch (e) {
            console.error('Error parsing cached user data:', e);
          }
        }
        
        // Get the actual session data
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting auth session:', sessionError);
          if (isMounted) setLoading(false);
          return;
        }
        
        if (session?.user) {
          try {
            const mappedUser = await mapSupabaseUserToUser(session.user);
            if (isMounted) setCachedUser(mappedUser);
          } catch (userMapError) {
            console.error('Error mapping user:', userMapError);
            // Still use the cached user if available
            if (initialUser && isMounted) {
              setUser(initialUser);
            }
          }
        } else if (initialUser && isMounted) {
          // If we had a cached user but no session, clear it
          setCachedUser(null);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        try {
          if (session?.user) {
            const mappedUser = await mapSupabaseUserToUser(session.user);
            if (isMounted) setCachedUser(mappedUser);
          } else {
            if (isMounted) setCachedUser(null);
          }
        } catch (error) {
          console.error('Error handling auth change:', error);
        } finally {
          if (isMounted) setLoading(false);
        }
      }
    );
    
    // Cleanup function to prevent state updates after unmounting
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };

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

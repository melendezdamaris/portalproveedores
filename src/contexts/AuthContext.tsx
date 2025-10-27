import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  requestPasswordReset: (email: string) => Promise<boolean>;
  signUp: (email: string, password: string, userData: { full_name: string; role: 'proveedor' | 'aprobador' | 'operaciones' }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Función para obtener datos del portal_users
  const getPortalUserData = async (userId: string): Promise<User | null> => {
    if (!isSupabaseConfigured) return null;

    try {
      const { data: portalUser, error } = await supabase
        .from('portal_users')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching portal user:', error);
        return null;
      }

      if (!portalUser) {
        console.warn('No portal user found for user_id:', userId);
        return null;
      }

      // Obtener datos del auth.users
      const { data: authUser } = await supabase.auth.getUser();
      
      if (!authUser.user) return null;

      return {
        id: portalUser.id,
        email: authUser.user.email || '',
        name: portalUser.full_name,
        role: portalUser.role,
        createdAt: new Date(portalUser.created_at),
        lastLogin: new Date()
      };
    } catch (error) {
      console.error('Error in getPortalUserData:', error);
      return null;
    }
  };

  // Función para crear usuario en portal_users después del registro
  const createPortalUser = async (authUserId: string, userData: { full_name: string; role: 'proveedor' | 'aprobador' | 'operaciones' }) => {
    if (!isSupabaseConfigured) return false;

    try {
      const { error } = await supabase
        .from('portal_users')
        .insert({
          user_id: authUserId,
          full_name: userData.full_name,
          role: userData.role,
          is_active: true
        });

      if (error) {
        console.error('Error creating portal user:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in createPortalUser:', error);
      return false;
    }
  };

  // Inicializar sesión - SOLO UNA VEZ
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      if (!isSupabaseConfigured) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        // Obtener sesión actual
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (isMounted) {
          setSession(currentSession);
          
          if (currentSession?.user) {
            const portalUserData = await getPortalUserData(currentSession.user.id);
            setUser(portalUserData);
          }
          
          setIsLoading(false);
        }

        // Configurar listener para cambios futuros
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            if (!isMounted) return;
            
            console.log('Auth state changed:', event);
            setSession(newSession);

            if (newSession?.user) {
              const portalUserData = await getPortalUserData(newSession.user.id);
              setUser(portalUserData);
            } else {
              setUser(null);
            }
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []); // Dependencias vacías - solo se ejecuta una vez

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured, using mock login');
      // Fallback a sistema mock para desarrollo
      const mockUsers = [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          email: 'proveedor@example.com',
          name: 'Juan Pérez',
          role: 'proveedor' as const,
          company: 'Empresa ABC SAC',
          ruc: '20123456789',
          createdAt: new Date('2024-01-15'),
          lastLogin: new Date()
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          email: 'operaciones@neoconsulting.com',
          name: 'María González',
          role: 'operaciones' as const,
          createdAt: new Date('2024-01-01'),
          lastLogin: new Date()
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          email: 'aprobador@neoconsulting.com',
          name: 'Carlos Rodríguez',
          role: 'aprobador' as const,
          createdAt: new Date('2024-01-01'),
          lastLogin: new Date()
        }
      ];

      const foundUser = mockUsers.find(u => u.email === email);
      if (foundUser && password === 'password123') {
        setUser(foundUser);
        return true;
      }
      return false;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error.message);
        return false;
      }

      // El listener se encargará de actualizar el estado
      return !!data.user;
    } catch (error) {
      console.error('Login exception:', error);
      return false;
    }
  };

  const logout = async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setSession(null);
      return;
    }

    try {
      // Limpiar estado inmediatamente antes del logout
      setUser(null);
      setSession(null);
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
    } catch (error) {
      console.error('Logout exception:', error);
      // Asegurar que el estado se limpie incluso si hay error
      setUser(null);
      setSession(null);
    }
  };

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      // Mock para desarrollo
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        console.error('Password reset error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Password reset exception:', error);
      return false;
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    userData: { full_name: string; role: 'proveedor' | 'aprobador' | 'operaciones' }
  ): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured');
      return false;
    }

    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        return false;
      }

      if (!authData.user) {
        console.error('No user returned from signup');
        return false;
      }

      // 2. Crear registro en portal_users
      const portalUserCreated = await createPortalUser(authData.user.id, userData);
      
      if (!portalUserCreated) {
        console.error('Failed to create portal user');
        return false;
      }

      console.log('User created successfully:', authData.user.email);
      return true;
    } catch (error) {
      console.error('Signup exception:', error);
      return false;
    }
  };

  const value = {
    user,
    session,
    login,
    logout,
    isLoading,
    requestPasswordReset,
    signUp
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
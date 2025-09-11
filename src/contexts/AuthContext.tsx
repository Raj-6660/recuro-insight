import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, UserRole } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setAuthState({
        user,
        isAuthenticated: true,
        loading: false,
      });
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      // Mock authentication - replace with actual API call
      const mockUser: User = {
        id: Math.random().toString(36),
        email,
        role,
        name: email.split('@')[0],
        created_at: new Date().toISOString(),
      };

      localStorage.setItem('user', JSON.stringify(mockUser));
      setAuthState({
        user: mockUser,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      // Mock registration - replace with actual API call
      const mockUser: User = {
        id: Math.random().toString(36),
        email,
        role,
        name,
        created_at: new Date().toISOString(),
      };

      localStorage.setItem('user', JSON.stringify(mockUser));
      setAuthState({
        user: mockUser,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
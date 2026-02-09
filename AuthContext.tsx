import React, { useState, useEffect, createContext, useContext } from 'react';
import { AuthState } from './types';
import { mockBackend } from './services/mockBackend';

interface AuthContextType extends AuthState {
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    // Check local storage for persistent session simulation
    const savedUser = localStorage.getItem('cabin_user_session');
    if (savedUser) {
      setState({
        user: JSON.parse(savedUser),
        isAuthenticated: true,
        isLoading: false
      });
    } else {
      setState(s => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = async (email: string) => {
    setState(s => ({ ...s, isLoading: true }));
    try {
      const user = await mockBackend.login(email);
      localStorage.setItem('cabin_user_session', JSON.stringify(user));
      setState({
        user,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      console.error(error);
      setState(s => ({ ...s, isLoading: false }));
    }
  };

  const logout = async () => {
    await mockBackend.logout();
    localStorage.removeItem('cabin_user_session');
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
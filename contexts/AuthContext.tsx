import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import { DEMO_USERS } from '../data/mockData';

// Types for registration
interface RegisterData {
  name: string;
  email: string;
  badgeNumber: string;
  agency: string;
  role: 'Administrator' | 'Officer' | 'Analyst' | 'Read-Only';
  password: string;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, role: string, agency: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children?: React.ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    token: null,
  });

  useEffect(() => {
    // Check local storage for session
    const storedUser = localStorage.getItem('intellishare_user');
    const storedToken = localStorage.getItem('intellishare_token');
    
    if (storedUser && storedToken) {
      setAuth({
        user: JSON.parse(storedUser),
        isAuthenticated: true,
        token: storedToken,
      });
    }
  }, []);

  const login = async (email: string, password: string, role: string, agency: string) => {
    // Mock login logic
    // In production, this would make an API call: axios.post('/api/auth/login', { email, password, role, agency })
    
    // Check against DEMO_USERS or localStorage users (created via register)
    const localUsers = JSON.parse(localStorage.getItem('intellishare_registered_users') || '[]');
    const allUsers = [...DEMO_USERS, ...localUsers];

    const foundUser = allUsers.find(u => u.email === email);
    
    // For demo purposes, we allow password 'password' for demo users, or the registered password for new users
    // In real app, backend handles hash comparison
    if (foundUser) {
      // Allow overriding role/agency for the demo to work fluidly with the UI selectors
      // In a real strict app, we would enforce the role stored in DB
      const sessionUser = { 
        ...foundUser, 
        role: role as any,
        agency: agency // Update agency to match selection for context context
      };
      
      const token = `mock-jwt-token-${Math.random().toString(36).substr(2)}`;
      
      setAuth({
        user: sessionUser,
        isAuthenticated: true,
        token: token,
      });
      
      localStorage.setItem('intellishare_user', JSON.stringify(sessionUser));
      localStorage.setItem('intellishare_token', token);
      return true;
    }
    
    return false;
  };

  const register = async (data: RegisterData) => {
    // Mock registration logic
    // In production: axios.post('/api/auth/register', data)
    
    const localUsers = JSON.parse(localStorage.getItem('intellishare_registered_users') || '[]');
    
    // Check if exists
    if (localUsers.find((u: any) => u.email === data.email) || DEMO_USERS.find(u => u.email === data.email)) {
      return false;
    }

    const newUser: User = {
      id: `u-${Date.now()}`,
      name: data.name,
      email: data.email,
      badgeNumber: data.badgeNumber,
      agency: data.agency,
      role: data.role,
      avatar: `https://ui-avatars.com/api/?name=${data.name.replace(' ', '+')}&background=0D8ABC&color=fff`
    };

    // Save to "DB"
    localUsers.push(newUser);
    localStorage.setItem('intellishare_registered_users', JSON.stringify(localUsers));

    // Auto login
    const token = `mock-jwt-token-${Math.random().toString(36).substr(2)}`;
    setAuth({
      user: newUser,
      isAuthenticated: true,
      token: token
    });
    
    localStorage.setItem('intellishare_user', JSON.stringify(newUser));
    localStorage.setItem('intellishare_token', token);
    
    return true;
  };

  const logout = () => {
    setAuth({ user: null, isAuthenticated: false, token: null });
    localStorage.removeItem('intellishare_user');
    localStorage.removeItem('intellishare_token');
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
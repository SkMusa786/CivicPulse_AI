import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { User, UserRole, Department } from '../types';
import { DEMO_USERS } from '../data/mockUsers';
import { API_BASE_URL, apiClient } from '../services/api';
import { clearStoredCurrentUser, saveCurrentUser } from '../services/storage';

interface LoginResult {
  success: boolean;
  user?: User;
  error?: string;
}

interface AuthContextType {
  currentUser: User;
  role: UserRole;
  allDemoUsers: User[];
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole, department?: Department) => void;
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (name: string, email: string, password: string, phone?: string, ward?: string) => Promise<LoginResult>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_TOKEN_KEY = 'civicai_auth_token';
const validRoles: UserRole[] = ['citizen', 'admin', 'officer'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(DEMO_USERS[0]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const restoreSession = async () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        if (active) setIsLoading(false);
        return;
      }

      try {
        const response = await apiClient.get<{ user: User }>('/auth/me');
        const user = response.data.user;
        if (!user?.id || !user.email || !validRoles.includes(user.role)) {
          throw new Error('Authentication server returned an invalid user session.');
        }
        if (active) {
          setCurrentUser(user);
          setIsAuthenticated(true);
          saveCurrentUser(user);
        }
      } catch (error) {
        if (active) {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          clearStoredCurrentUser();
          setCurrentUser(DEMO_USERS[0]);
          setIsAuthenticated(false);
          if (!axios.isAxiosError(error) || !error.response) {
            console.error('Unable to restore the saved CivicPulse session.', error);
          }
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void restoreSession();
    return () => {
      active = false;
    };
  }, []);

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    clearStoredCurrentUser();
    setIsAuthenticated(false);
    setCurrentUser(DEMO_USERS[0]);
  };

  const switchUser = (userId: string) => {
    const target = DEMO_USERS.find((user) => user.id === userId);
    if (target && target.id !== currentUser.id) logout();
  };

  const switchRole = (role: UserRole, department?: Department) => {
    const target = DEMO_USERS.find((user) => (
      user.role === role && (!department || user.department === department)
    ));
    if (target && target.id !== currentUser.id) logout();
  };

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      const response = await apiClient.post<{ token: string; user: User }>('/auth/login', { email, password });
      const { token, user } = response.data;
      if (!token || !user?.id || !user.email || !validRoles.includes(user.role)) {
        return { success: false, error: 'Authentication server returned an invalid login response.' };
      }

      localStorage.setItem(AUTH_TOKEN_KEY, token);
      setCurrentUser(user);
      setIsAuthenticated(true);
      setIsLoading(false);
      saveCurrentUser(user);
      return { success: true, user };
    } catch (error: unknown) {
      if (axios.isAxiosError<{ error?: string }>(error)) {
        const status = error.response?.status;
        const serverMessage = error.response?.data?.error;
        if (status === 401) return { success: false, error: 'Invalid email or password.' };
        if (status === 400) return { success: false, error: serverMessage || 'Enter your email and password.' };
        if (status && status >= 500) {
          return {
            success: false,
            error: serverMessage || `Authentication server error (HTTP ${status}). Please try again.`,
          };
        }
        if (status) return { success: false, error: serverMessage || `Login request failed (HTTP ${status}).` };
        if (error.code === 'ECONNABORTED') {
          return { success: false, error: 'Login request timed out. Check that the API server is running and try again.' };
        }
        return {
          success: false,
          error: `Cannot reach the authentication API at ${API_BASE_URL}. Start the backend and try again.`,
        };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected authentication error occurred.',
      };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    phone?: string,
    ward?: string,
  ): Promise<LoginResult> => {
    try {
      const response = await apiClient.post<{ token: string; user: User }>('/auth/register', {
        name,
        email,
        password,
        phone,
        ward,
      });
      const { token, user } = response.data;
      if (!token || !user?.id || !user.email || user.role !== 'citizen') {
        return { success: false, error: 'Authentication server returned an invalid registration response.' };
      }
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      setCurrentUser(user);
      setIsAuthenticated(true);
      setIsLoading(false);
      saveCurrentUser(user);
      return { success: true, user };
    } catch (error: unknown) {
      if (axios.isAxiosError<{ error?: string }>(error)) {
        if (error.response?.data?.error) return { success: false, error: error.response.data.error };
        if (error.code === 'ECONNABORTED') {
          return { success: false, error: 'Registration timed out. Check the API server and try again.' };
        }
        return {
          success: false,
          error: `Cannot reach the authentication API at ${API_BASE_URL}. Start the backend and try again.`,
        };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected registration error occurred.',
      };
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      role: currentUser.role,
      allDemoUsers: DEMO_USERS,
      switchUser,
      switchRole,
      login,
      register,
      logout,
      isAuthenticated,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

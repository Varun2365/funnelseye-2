import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import apiConfig from '../config/apiConfig.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // Configure axios defaults
  useEffect(() => {
    axios.defaults.baseURL = apiConfig.apiBaseUrl;
    console.log('🔗 [AuthContext] Axios base URL set to:', apiConfig.apiBaseUrl);
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('🔐 [AUTH] Starting auth check...');
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        console.log('🔐 [AUTH] No token found, user not authenticated');
        setLoading(false);
        return;
      }

      console.log('🔐 [AUTH] Token found, verifying with backend...');
      
      // Set token in axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Verify token with backend
      const response = await axios.get('/admin/auth/profile');
      console.log('🔐 [AUTH] Backend response:', response.data);
      
      if (response.data.success) {
        console.log('🔐 [AUTH] Authentication successful');
        setIsAuthenticated(true);
        setAdmin(response.data.data);
      } else {
        console.log('🔐 [AUTH] Backend returned success: false');
        localStorage.removeItem('adminToken');
        delete axios.defaults.headers.common['Authorization'];
      }
    } catch (error) {
      console.error('🔐 [AUTH] Auth check failed:', error);
      console.error('🔐 [AUTH] Error response:', error.response?.data);
      console.error('🔐 [AUTH] Error status:', error.response?.status);
      
      // Only remove token if it's an auth error (401, 403)
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('🔐 [AUTH] Removing invalid token');
        localStorage.removeItem('adminToken');
        delete axios.defaults.headers.common['Authorization'];
      }
    } finally {
      console.log('🔐 [AUTH] Auth check completed, setting loading to false');
      setLoading(false);
    }
  };

  const retryAuth = () => {
    console.log('🔐 [AUTH] Retrying authentication...');
    setRetryCount(prev => prev + 1);
    setLoading(true);
    checkAuthStatus();
  };

  const login = async (email, password) => {
    try {
      console.log('🔐 [FRONTEND] Login attempt started');
      console.log('🔐 [FRONTEND] Email:', email);
      console.log('🔐 [FRONTEND] Password length:', password.length);
      console.log('🔐 [FRONTEND] API URL:', axios.defaults.baseURL + '/admin/auth/login');
      
      const requestBody = { email, password };
      console.log('🔐 [FRONTEND] Request body:', requestBody);
      
      const response = await axios.post('/admin/auth/login', requestBody);
      
      console.log('🔐 [FRONTEND] Response received:', response);
      console.log('🔐 [FRONTEND] Response status:', response.status);
      console.log('🔐 [FRONTEND] Response data:', response.data);

      if (response.data.success) {
        console.log('🔐 [FRONTEND] Login successful, processing response data');
        const { token, admin } = response.data.data;
        console.log('🔐 [FRONTEND] Token received:', token ? 'YES' : 'NO');
        console.log('🔐 [FRONTEND] Admin data received:', admin);
        
        localStorage.setItem('adminToken', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        console.log('🔐 [FRONTEND] Setting authentication state...');
        setIsAuthenticated(true);
        setAdmin(admin);
        
        console.log('🔐 [FRONTEND] Authentication state updated - isAuthenticated: true, admin:', admin);
        console.log('🔐 [FRONTEND] Login completed successfully');
        return { success: true };
      } else {
        console.log('🔐 [FRONTEND] Login failed - backend returned success: false');
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('🔐 [FRONTEND] Login error occurred:', error);
      console.error('🔐 [FRONTEND] Error name:', error.name);
      console.error('🔐 [FRONTEND] Error message:', error.message);
      console.error('🔐 [FRONTEND] Error response:', error.response);
      console.error('🔐 [FRONTEND] Error request:', error.request);
      console.error('🔐 [FRONTEND] Error config:', error.config);
      
      if (error.response) {
        console.error('🔐 [FRONTEND] Response status:', error.response.status);
        console.error('🔐 [FRONTEND] Response data:', error.response.data);
        console.error('🔐 [FRONTEND] Response headers:', error.response.headers);
      }
      
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/admin/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('adminToken');
      delete axios.defaults.headers.common['Authorization'];
      setIsAuthenticated(false);
      setAdmin(null);
    }
  };

  const value = {
    isAuthenticated,
    admin,
    loading,
    retryCount,
    login,
    logout,
    checkAuthStatus,
    retryAuth
  };

  console.log('🔐 [AUTH_CONTEXT] Rendering with state:', { isAuthenticated, admin: admin ? 'exists' : 'null', loading });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

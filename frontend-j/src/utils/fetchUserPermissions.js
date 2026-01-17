// Utility to fetch and update user permissions after login
// This ensures staff permissions are always available in the Redux store

import { loginSuccess } from '../redux/authSlice';

// Import store dynamically to avoid circular dependencies
let store = null;
const getStore = () => {
  if (!store) {
    // Dynamic import to avoid circular dependency
    const storeModule = require('../redux/store');
    store = storeModule.store || storeModule.default;
  }
  return store;
};

import { API_BASE_URL } from '../config/apiConfig';

/**
 * Fetch current user data including permissions
 * This should be called after login to ensure permissions are loaded
 */
export const fetchUserPermissions = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('[fetchUserPermissions] No token found');
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('[fetchUserPermissions] Failed to fetch user data:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (data.success && data.user) {
      const user = data.user;
      
      // Update Redux store with fresh user data (including permissions)
      const storeInstance = getStore();
      if (storeInstance) {
        const currentState = storeInstance.getState();
        if (currentState.auth.token) {
          storeInstance.dispatch(loginSuccess({
            user: user,
            token: currentState.auth.token
          }));
        }
      }
      
      console.log('[fetchUserPermissions] User permissions updated:', user.permissions || []);
      return user;
    }
    
    return null;
  } catch (error) {
    console.error('[fetchUserPermissions] Error fetching user permissions:', error);
    return null;
  }
};

/**
 * Check if user permissions need to be fetched
 * Returns true if user is staff but permissions are missing
 */
export const shouldFetchPermissions = (authState) => {
  if (!authState?.user) return false;
  
  // Only staff need explicit permissions
  if (authState.user.role === 'staff') {
    // If permissions array is missing or empty, we should fetch
    const permissions = authState.user.permissions;
    return !permissions || !Array.isArray(permissions);
  }
  
  return false;
};


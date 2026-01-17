// Universal Auth Utilities for all components
// This solves the user.id vs user._id issue across the entire app
// Supports both coach and staff authentication

/**
 * Get coach ID from Redux auth state
 * For staff, returns their coachId (the coach they work for)
 * For coaches, returns their own ID
 * Handles both user.id and user._id cases
 */
export const getCoachId = (authState) => {
  if (!authState?.user) return null;
  const user = authState.user;
  
  // For staff, return their coachId (the coach they work for)
  if (user.role === 'staff' && user.coachId) {
    return typeof user.coachId === 'object' ? user.coachId._id || user.coachId : user.coachId;
  }
  
  // For coaches, return their own ID
  return user._id || user.id || null;
};

/**
 * Get user ID (the actual logged-in user's ID, not coach ID)
 */
export const getUserId = (authState) => {
  if (!authState?.user) return null;
  const user = authState.user;
  return user._id || user.id || null;
};

/**
 * Get token from Redux auth state
 */
export const getToken = (authState) => {
  return authState?.token || null;
};

/**
 * Get authentication status
 */
export const getAuthStatus = (authState) => {
  return authState?.isAuthenticated || false;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (authState) => {
  const userId = getUserId(authState);
  const token = getToken(authState);
  return !!(userId && token);
};

/**
 * Check if user is a coach
 */
export const isCoach = (authState) => {
  return authState?.user?.role === 'coach';
};

/**
 * Check if user is staff
 */
export const isStaff = (authState) => {
  return authState?.user?.role === 'staff';
};

/**
 * Get user role
 */
export const getUserRole = (authState) => {
  return authState?.user?.role || null;
};

/**
 * Get staff permissions (returns empty array for coaches)
 */
export const getStaffPermissions = (authState) => {
  if (!isStaff(authState)) return [];
  return authState?.user?.permissions || [];
};

/**
 * Get auth headers for API calls
 * Automatically handles staff vs coach tokens
 */
export const getAuthHeaders = (authState) => {
  const token = getToken(authState);
  const coachId = getCoachId(authState);
  
  if (!token || !coachId) {
    return null;
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Coach-ID': coachId,
    'Accept': 'application/json'
  };
};

/**
 * Debug auth state - useful for troubleshooting
 */
export const debugAuthState = (authState, componentName = 'Component') => {
  console.log(`🔍 ${componentName} - Auth Debug:`);
  console.log('Full auth state:', authState);
  console.log('Coach ID:', getCoachId(authState));
  console.log('Token:', getToken(authState));
  console.log('Is Authenticated:', isAuthenticated(authState));
  console.log('Auth Headers:', getAuthHeaders(authState));
};

/**
 * Get localStorage data directly (fallback)
 */
export const getLocalStorageAuth = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const token = localStorage.getItem('token');
    
    return {
      user,
      token,
      coachId: user?._id || user?.id || null,
      isAuthenticated: !!(user && token)
    };
  } catch (e) {
    console.warn('Error parsing localStorage auth data:', e);
    return {
      user: null,
      token: null,
      coachId: null,
      isAuthenticated: false
    };
  }
};

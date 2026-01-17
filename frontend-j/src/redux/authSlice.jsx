import { createSlice } from '@reduxjs/toolkit';

// Function to load state from localStorage (only for admin/coach)
const loadState = () => {
  try {
    console.log('🔍 authSlice loadState - Checking localStorage...');
    const serializedUser = localStorage.getItem('user');
    const serializedToken = localStorage.getItem('token');
    
    console.log('🔍 authSlice loadState - serializedUser:', serializedUser);
    console.log('🔍 authSlice loadState - serializedToken:', serializedToken);
    
    if (serializedUser === null || serializedToken === null) {
      console.log('🔍 authSlice loadState - Missing user or token, returning undefined');
      return undefined;
    }
    
    const user = JSON.parse(serializedUser);
    // Don't parse token as JSON since it's already a string
    const token = serializedToken;
    
    console.log('🔍 authSlice loadState - Parsed user:', user);
    console.log('🔍 authSlice loadState - Token:', token);
    
    const loadedState = {
      user: user,
      token: token,
      selectedPlan: null,
      isAuthenticated: true,
    };
    
    console.log('🔍 authSlice loadState - Returning loaded state:', loadedState);
    return loadedState;
  } catch (e) {
    console.warn("🔍 authSlice loadState - Could not load state from localStorage", e);
    return undefined;
  }
};

const initialState = loadState() || {
  user: null,
  token: null,
  selectedPlan: null,
  isAuthenticated: false,
};
console.log('🔍 authSlice - Initial state:', initialState);
console.log('🔍 authSlice - Initial state user:', initialState.user);
console.log('🔍 authSlice - Initial state token:', initialState.token);
console.log('🔍 authSlice - Initial state isAuthenticated:', initialState.isAuthenticated);
console.log('🔐 authSlice is being created...');
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    testAction: (state, action) => {
      console.log('🔐 TEST ACTION CALLED!', action.payload);
      console.log('🔐 Current state before update:', state);
      state.user = action.payload;
      console.log('🔐 State after update:', state);
    },
    loginSuccess: (state, action) => {
      console.log('🔐 authSlice loginSuccess called with:', action.payload);
      console.log('🔐 authSlice current state before update:', state);
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      // Store token as string, not JSON
      localStorage.setItem('token', action.payload.token);
      
      // Store coachId in localStorage for subscription system
      if (action.payload.user) {
        const coachId = action.payload.user._id || action.payload.user.id || action.payload.user.coachId || action.payload.user.userId;
        if (coachId) {
          localStorage.setItem('coachId', coachId);
          console.log('✅ CoachId stored during login:', coachId);
        }
      }
      
      console.log('🔐 authSlice state updated:', { user: state.user, token: state.token, isAuthenticated: state.isAuthenticated });
      console.log('🔐 localStorage set - user:', localStorage.getItem('user'));
      console.log('🔐 localStorage set - token:', localStorage.getItem('token'));
      console.log('🔐 localStorage set - coachId:', localStorage.getItem('coachId'));
    },
    registerSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      // Store token as string, not JSON
      localStorage.setItem('token', action.payload.token);
      
      // Store coachId in localStorage for subscription system
      if (action.payload.user) {
        const coachId = action.payload.user._id || action.payload.user.id || action.payload.user.coachId || action.payload.user.userId;
        if (coachId) {
          localStorage.setItem('coachId', coachId);
          console.log('✅ CoachId stored during registration:', coachId);
        }
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.selectedPlan = null;
      
      // Clear admin/coach data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      // Also clear any staff data to prevent mixing
      localStorage.removeItem('staffToken');
      localStorage.removeItem('staffId');
      localStorage.removeItem('coachId');
      localStorage.removeItem('staffData');
      
      // Redirect to login page
      window.location.href = '/login';
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    selectPlan: (state, action) => {
      state.selectedPlan = action.payload;
    },
  },
});

export const { testAction, loginSuccess, registerSuccess, logout, setError, selectPlan } = authSlice.actions;

export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectCurrentPlan = (state) => state.auth.selectedPlan;
export const selectAuthStatus = (state) => state.auth.isAuthenticated;

// Utility function to check auth state separation
export const checkAuthSeparation = () => {
  const adminUser = localStorage.getItem('user');
  const adminToken = localStorage.getItem('token');
  const staffToken = localStorage.getItem('staffToken');
  const staffId = localStorage.getItem('staffId');
  
  console.log('🔍 Auth Separation Check:');
  console.log('Admin User:', adminUser ? 'Present' : 'None');
  console.log('Admin Token:', adminToken ? 'Present' : 'None');
  console.log('Staff Token:', staffToken ? 'Present' : 'None');
  console.log('Staff ID:', staffId ? 'Present' : 'None');
  
  const hasAdminAuth = !!(adminUser && adminToken);
  const hasStaffAuth = !!(staffToken && staffId);
  
  if (hasAdminAuth && hasStaffAuth) {
    console.warn('⚠️ WARNING: Both admin and staff auth data present!');
  } else if (hasAdminAuth) {
    console.log('✅ Admin/Coach session active');
  } else if (hasStaffAuth) {
    console.log('✅ Staff session active');
  } else {
    console.log('ℹ️ No active session');
  }
  
  return { hasAdminAuth, hasStaffAuth };
};

// Utility function to debug localStorage directly
export const debugLocalStorage = () => {
  console.log('🔍 localStorage Debug:');
  console.log('user:', localStorage.getItem('user'));
  console.log('token:', localStorage.getItem('token'));
  console.log('staffToken:', localStorage.getItem('staffToken'));
  console.log('staffId:', localStorage.getItem('staffId'));
  console.log('coachId:', localStorage.getItem('coachId'));
  console.log('staffData:', localStorage.getItem('staffData'));
  
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    console.log('parsed user:', user);
    console.log('user._id:', user?._id);
    console.log('user.id:', user?.id);
  } catch (e) {
    console.log('Error parsing user:', e);
  }
};

export default authSlice.reducer;
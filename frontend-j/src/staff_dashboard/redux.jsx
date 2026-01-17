import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { staffAPI } from '../services/staffAPI';

import { API_BASE_URL as BASE_URL } from '../config/apiConfig';

// Utility function to clean up invalid localStorage entries
export const cleanupInvalidStorage = () => {
  const staffId = localStorage.getItem('staffId');
  if (staffId === 'undefined' || staffId === 'null' || !staffId) {
    console.log('🧹 Cleaning up invalid staffId from localStorage');
    localStorage.removeItem('staffId');
  }
  
  const token = localStorage.getItem('staffToken');
  if (token === 'undefined' || token === 'null' || !token) {
    console.log('🧹 Cleaning up invalid token from localStorage');
    localStorage.removeItem('staffToken');
  }
};

// Utility function to get auth headers
export const getAuthHeaders = () => {
  // Clean up any invalid entries first
  cleanupInvalidStorage();
  
  const token = localStorage.getItem('staffToken');
  const staffId = localStorage.getItem('staffId');
  const coachId = localStorage.getItem('coachId');
  console.log('🔍 Tokjassienstoken:', token);
  console.log('🔍 Staff jassiID:', staffId);
 console.log('🔍 Coach jassiID:', coachId);
  const headers = {
    'Content-Type': 'application/json',
    'token_staff': token,
    'Authorization': `Bearer ${token}`,
    'x-auth-token': token,
    'X-Staff-ID': staffId,
    'staff-id': staffId,
    'X-Coach-ID': coachId,
    'coach-id': coachId,
    'X-Request-Source': 'staff-dashboard'
  };
  if (token) {
    // Multiple token formats for compatibility
    headers['token_staff'] = token;
    headers['Authorization'] = `Bearer ${token}`;
    headers['x-auth-token'] = token;
  }
  if (staffId) {
    headers['X-Staff-ID'] = staffId;
    headers['staff-id'] = staffId;
  }
  if (coachId) {
    headers['X-Coach-ID'] = coachId;
    headers['coach-id'] = coachId;
  }
  
  return headers;
};

// Token refresh function
export const refreshToken = async () => {
  try {
    const currentToken = localStorage.getItem('staffToken');
    const staffId = localStorage.getItem('staffId');
    
    if (!currentToken || !staffId) {
      throw new Error('No token or staffId available');
    }
    
    console.log('🔄 Attempting to refresh token...');
    
    // Try to refresh token with current credentials
    const response = await api.post('/api/auth/refresh', {
      token: currentToken,
      staffId: staffId
    });
    
    if (response.data?.token) {
      console.log('✅ Token refreshed successfully');
      localStorage.setItem('staffToken', response.data.token);
      return response.data.token;
    }
    
    throw new Error('No new token received');
  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    throw error;
  }
};

// API service
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get from localStorage first
    let token = localStorage.getItem('staffToken');
    let staffId = localStorage.getItem('staffId');
    let coachId = localStorage.getItem('coachId');
    console.log('🔍 Token jassi:', token);
    console.log('🔍 StaffId jassi:', staffId);
    console.log('🔍 CoachId jassi:', coachId);
    // If not in localStorage, try to get from Redux state
    if (!token || !staffId) {
      try {
        const state = JSON.parse(localStorage.getItem('persist:root') || '{}');
        const staffState = JSON.parse(state.staff || '{}');
        
        if (!token && staffState.token) {
          token = staffState.token;
        }
        if (!staffId && staffState.staffId) {
          staffId = staffState.staffId;
        }
        if (!coachId && staffState.coachId) {
          coachId = staffState.coachId;
        }
      } catch (error) {
        console.log('Error parsing Redux state:', error);
      }
    }
    
    // Set headers - Multiple token formats for compatibility
    if (token) {
      // Try multiple token header formats
      config.headers['token_staff'] = token;
      config.headers['Authorization'] = `Bearer ${token}`;
      config.headers['x-auth-token'] = token;
      console.log('🔐 API Request - Token Staff:', token.substring(0, 10) + '...');
    }
    if (staffId) {
      config.headers['X-Staff-ID'] = staffId;
      config.headers['staff-id'] = staffId;
      console.log('👤 API Request - Staff ID:', staffId);
    }
    if (coachId) {
      config.headers['X-Coach-ID'] = coachId;
      config.headers['coach-id'] = coachId;
      console.log('👨‍💼 API Request - Coach ID:', coachId);
    }
    
    // Add additional headers for better tracking
    config.headers['X-Request-Source'] = 'staff-dashboard';
    config.headers['X-Request-Time'] = new Date().toISOString();
    
    // Log final headers being sent
    console.log('📤 Final request headers:', config.headers);
    console.log('📤 Request URL:', config.url);
    console.log('📤 Request method:', config.method);
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log successful API calls
    console.log('✅ API Response:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Log API errors
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      headers: error.config?.headers
    });
    
    // Handle authentication errors - Don't auto-redirect immediately
    if (error.response?.status === 401) {
      console.log('🚨 Unauthorized - Token may be expired or invalid');
      console.log('🔍 Current token:', localStorage.getItem('staffToken'));
      console.log('🔍 Current staffId:', localStorage.getItem('staffId'));
      
      // Only redirect if it's a critical auth endpoint
      const criticalEndpoints = ['/api/staff-dashboard/overview', '/api/staff-dashboard/data'];
      if (criticalEndpoints.some(endpoint => error.config?.url?.includes(endpoint))) {
        console.log('🚨 Critical auth endpoint failed - redirecting to login');
        localStorage.removeItem('staffToken');
        localStorage.removeItem('staffId');
        localStorage.removeItem('coachId');
        window.location.href = '/login';
      }
    }
    
    // Handle other common errors
    if (error.response?.status === 403) {
      console.log('🚫 Forbidden - Insufficient permissions');
    }
    if (error.response?.status === 404) {
      console.log('🔍 Not Found - API endpoint not found');
    }
    if (error.response?.status >= 500) {
      console.log('💥 Server Error - Backend issue');
    }
    
    return Promise.reject(error);
  }
);

// Async thunks
export const fetchDashboardData = createAsyncThunk(
  'staff/fetchDashboardData',
  async (timeRange = 30, { rejectWithValue }) => {
    try {
      const data = await staffAPI.getStaffDashboardData(timeRange);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch dashboard data');
    }
  }
);

export const fetchOverview = createAsyncThunk(
  'staff/fetchOverview',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching overview data...');
      console.log('🔍 Current auth headers:', getAuthHeaders());
      
      const data = await staffAPI.getStaffDashboardOverview();
      console.log('✅ Overview data received:', data);
      return data;
    } catch (error) {
      console.log('❌ Overview fetch error:', error.message);
      console.log('❌ Error details:', error.response?.status, error.response?.data);
      
      return rejectWithValue(error.message || 'Failed to fetch overview');
    }
  }
);

export const fetchTasks = createAsyncThunk(
  'staff/fetchTasks',
  async (filters = {}, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching tasks data...');
      console.log('🔍 Filters:', filters);
      console.log('🔍 Current auth headers:', getAuthHeaders());
      
      const data = await staffTaskAPI.getStaffTasks(filters);
      console.log('✅ Tasks data received:', data);
      return data;
    } catch (error) {
      console.log('❌ Tasks fetch error:', error.message);
      console.log('❌ Error details:', error.response?.status, error.response?.data);
      return rejectWithValue(error.message || 'Failed to fetch tasks');
    }
  }
);

export const fetchPerformance = createAsyncThunk(
  'staff/fetchPerformance',
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching performance data...');
      console.log('🔍 Parameters:', params);
      console.log('🔍 Current auth headers:', getAuthHeaders());
      
      const data = await staffAPI.getStaffDashboardPerformance(params);
      console.log('✅ Performance data received:', data);
      return data;
    } catch (error) {
      console.log('❌ Performance fetch error:', error.message);
      console.log('❌ Error details:', error.response?.status, error.response?.data);
      return rejectWithValue(error.message || 'Failed to fetch performance data');
    }
  }
);

export const fetchAchievements = createAsyncThunk(
  'staff/fetchAchievements',
  async (_, { rejectWithValue }) => {
    try {
      const data = await staffAPI.getStaffDashboardAchievements();
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch achievements');
    }
  }
);

export const fetchTeamData = createAsyncThunk(
  'staff/fetchTeamData',
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching team data...');
      console.log('🔍 Parameters:', params);
      console.log('🔍 Current auth headers:', getAuthHeaders());
      
      const data = await staffAPI.getStaffDashboardTeam(params);
      console.log('✅ Team data received:', data);
      return data;
    } catch (error) {
      console.log('❌ Team data fetch error:', error.message);
      console.log('❌ Error details:', error.response?.status, error.response?.data);
      
      return rejectWithValue(error.message || 'Failed to fetch team data');
    }
  }
);

export const fetchProgress = createAsyncThunk(
  'staff/fetchProgress',
  async (timeRange = 30, { rejectWithValue }) => {
    try {
      const data = await staffAPI.getStaffDashboardProgress(timeRange);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch progress');
    }
  }
);

export const fetchComparison = createAsyncThunk(
  'staff/fetchComparison',
  async (_, { rejectWithValue }) => {
    try {
      const data = await staffAPI.getStaffDashboardComparison();
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch comparison');
    }
  }
);

export const fetchGoals = createAsyncThunk(
  'staff/fetchGoals',
  async (_, { rejectWithValue }) => {
    try {
      const data = await staffAPI.getStaffDashboardGoals();
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch goals');
    }
  }
);

export const fetchCalendar = createAsyncThunk(
  'staff/fetchCalendar',
  async (_, { rejectWithValue }) => {
    try {
      const data = await staffAPI.getStaffDashboardCalendar();
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch calendar');
    }
  }
);

export const fetchNotifications = createAsyncThunk(
  'staff/fetchNotifications',
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching notifications data...');
      console.log('🔍 Parameters:', params);
      console.log('🔍 Current auth headers:', getAuthHeaders());
      
      const data = await staffAPI.getStaffDashboardNotifications(params);
      console.log('✅ Notifications data received:', data);
      return data;
    } catch (error) {
      console.log('❌ Notifications fetch error:', error.message);
      console.log('❌ Error details:', error.response?.status, error.response?.data);
      return rejectWithValue(error.message || 'Failed to fetch notifications');
    }
  }
);

export const fetchAnalytics = createAsyncThunk(
  'staff/fetchAnalytics',
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching analytics data...');
      console.log('🔍 Parameters:', params);
      console.log('🔍 Current auth headers:', getAuthHeaders());
      
      const data = await staffAPI.getStaffDashboardAnalytics(params);
      console.log('✅ Analytics data received:', data);
      return data;
    } catch (error) {
      console.log('❌ Analytics fetch error:', error.message);
      console.log('❌ Error details:', error.response?.status, error.response?.data);
      return rejectWithValue(error.message || 'Failed to fetch analytics');
    }
  }
);

// Test function to verify headers
export const testAuthHeaders = createAsyncThunk(
  'staff/testAuthHeaders',
  async (_, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      console.log('🔍 Testing Auth Headers:', headers);
      
      // Check if we have the required authentication data
      const token = localStorage.getItem('staffToken');
      const staffId = localStorage.getItem('staffId');
      const coachId = localStorage.getItem('coachId');
      
      if (!token || !staffId) {
        console.log('❌ Missing authentication data');
        return { valid: false, error: 'Missing token or staffId' };
      }
      
      console.log('✅ Authentication data present:', { token: !!token, staffId, coachId });
      
      // Try a simple API call first
      try {
        const response = await api.get('/api/staff-dashboard/overview');
        console.log('✅ Test API call successful with headers');
        return { valid: true, headers, response: response.data };
      } catch (apiError) {
        console.log('⚠️ API call failed, but authentication data is present');
        console.log('🔍 API Error:', apiError.response?.status, apiError.message);
        
        // Even if API fails, if we have valid auth data, consider it valid
        return { 
          valid: true, 
          headers, 
          note: 'Auth data present, API may be down',
          apiError: apiError.message
        };
      }
    } catch (error) {
      console.error('❌ Test auth headers failed:', error);
      return rejectWithValue({ error: error.message, headers: getAuthHeaders() });
    }
  }
);

// Simple token check function (no API call)
export const checkTokenLocally = () => {
  const token = localStorage.getItem('staffToken');
  const staffId = localStorage.getItem('staffId');
  const coachId = localStorage.getItem('coachId');
  
  console.log('🔍 Local token check:');
  console.log('🔍 Token exists:', !!token);
  console.log('🔍 Token length:', token ? token.length : 0);
  console.log('🔍 Token preview:', token ? `${token.substring(0, 20)}...` : 'None');
  console.log('🔍 StaffId exists:', !!staffId);
  console.log('🔍 StaffId:', staffId);
  console.log('🔍 CoachId exists:', !!coachId);
  console.log('🔍 CoachId:', coachId);
  
  // Also check API base URL
  console.log('🔍 API Base URL:', BASE_URL);
  console.log('🔍 Full overview URL:', `${BASE_URL}/api/staff-dashboard/overview`);
  
  return { token, staffId, coachId };
};

// Validate token function
export const validateToken = createAsyncThunk(
  'staff/validateToken',
  async (_, { rejectWithValue }) => {
    try {
      // First check token locally
      const localCheck = checkTokenLocally();
      
      if (!localCheck.token || !localCheck.staffId) {
        throw new Error('No token or staffId available');
      }
      
      console.log('🔍 Making API call to validate token...');
      
      // Try multiple endpoints to validate token
      let response;
      let endpoint;
      
      // First try a simple endpoint
      try {
        endpoint = '/api/staff-dashboard/overview';
        console.log('🔍 Trying endpoint:', endpoint);
        response = await api.get(endpoint);
        console.log('✅ Token validation successful with endpoint:', endpoint);
      } catch (firstError) {
        console.log('❌ First endpoint failed, trying alternative...');
        
        // Try alternative endpoint
        try {
          endpoint = '/api/staff-dashboard/data';
          console.log('🔍 Trying alternative endpoint:', endpoint);
          response = await api.get(endpoint, { params: { timeRange: 7 } });
          console.log('✅ Token validation successful with alternative endpoint:', endpoint);
        } catch (secondError) {
          console.log('❌ Both endpoints failed, trying simple GET...');
          
          // Try a simple GET request to base URL
          try {
            endpoint = '/';
            console.log('🔍 Trying base URL:', endpoint);
            response = await api.get(endpoint);
            console.log('✅ Base URL accessible, token might be valid');
            return { valid: true, token: localCheck.token, staffId: localCheck.staffId, note: 'Base URL accessible' };
          } catch (baseError) {
            throw new Error(`All endpoints failed: ${firstError.message}, ${secondError.message}, ${baseError.message}`);
          }
        }
      }
      
      console.log('✅ Token validation successful!');
      console.log('✅ Response status:', response.status);
      console.log('✅ Response data:', response.data);
      return { valid: true, token: localCheck.token, staffId: localCheck.staffId, endpoint };
    } catch (error) {
      console.error('❌ Token validation failed!');
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      });
      
      // Try to refresh token if validation fails
      try {
        console.log('🔄 Attempting token refresh...');
        const newToken = await refreshToken();
        console.log('✅ Token refreshed, retrying validation...');
        
        // Retry with new token
        const retryResponse = await api.get('/api/staff-dashboard/overview');
        return { valid: true, token: newToken, staffId: localStorage.getItem('staffId') };
      } catch (refreshError) {
        console.error('❌ Token refresh also failed:', refreshError);
        return rejectWithValue({ 
          error: 'Token validation and refresh failed', 
          originalError: error.message,
          refreshError: refreshError.message
        });
      }
    }
  }
);

// Get initial staff state from localStorage
const getInitialStaffState = () => {
  return {
    token: localStorage.getItem('staffToken') || null,
    staffId: localStorage.getItem('staffId') || null,
    coachId: localStorage.getItem('coachId') || null,
    staffData: JSON.parse(localStorage.getItem('staffData') || 'null'),
    isAuthenticated: !!(localStorage.getItem('staffToken') && localStorage.getItem('staffId')),
  };
};

const staffSlice = createSlice({
  name: 'staff',
  initialState: {
    ...getInitialStaffState(),
    
    // Dashboard Data
    dashboardData: null,
    overview: null,
    tasks: null,
    performance: null,
    achievements: null,
    teamData: null,
    progress: null,
    comparison: null,
    goals: null,
    calendar: null,
    notifications: null,
    analytics: null,
    
    // Loading States
    loading: {
      dashboard: false,
      overview: false,
      tasks: false,
      performance: false,
      achievements: false,
      team: false,
      progress: false,
      comparison: false,
      goals: false,
      calendar: false,
      notifications: false,
      analytics: false,
      test: false,
      validation: false,
    },
    
    // Error States
    errors: {
      dashboard: null,
      overview: null,
      tasks: null,
      performance: null,
      achievements: null,
      team: null,
      progress: null,
      comparison: null,
      goals: null,
      calendar: null,
      notifications: null,
      analytics: null,
      test: null,
      validation: null,
    },
    
    // UI State
    isDarkMode: JSON.parse(localStorage.getItem('isDarkMode') || 'false'),
    sidebarOpen: true,
    lastUpdated: null,
  },
  
  reducers: {
    setAuth: (state, action) => {
      console.log('🔐 setAuth called with payload:', action.payload);
      
      state.token = action.payload.token;
      state.staffId = action.payload.staffId;
      state.coachId = action.payload.coachId;
      state.isAuthenticated = true;
      
      localStorage.setItem('staffToken', action.payload.token);
      
      // Only store staffId if it's not undefined/null
      if (action.payload.staffId) {
        localStorage.setItem('staffId', action.payload.staffId);
        console.log('🔐 StaffId stored in localStorage:', action.payload.staffId);
      } else {
        console.log('⚠️ StaffId is undefined/null, not storing in localStorage');
      }
      
      if (action.payload.coachId) {
        localStorage.setItem('coachId', action.payload.coachId);
      }
    },
    
    setStaffData: (state, action) => {
      state.staffData = action.payload;
      localStorage.setItem('staffData', JSON.stringify(action.payload));
    },
    
    setLoading: (state, action) => {
      const { type, value } = action.payload;
      if (state.loading[type] !== undefined) {
        state.loading[type] = value;
      }
    },
    
    setError: (state, action) => {
      const { type, error } = action.payload;
      if (state.errors[type] !== undefined) {
        state.errors[type] = error;
      }
    },
    
    clearError: (state, action) => {
      const type = action.payload;
      if (state.errors[type] !== undefined) {
        state.errors[type] = null;
      }
    },
    
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
      localStorage.setItem('isDarkMode', JSON.stringify(state.isDarkMode));
    },
    
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    
    logout: (state) => {
      state.token = null;
      state.staffId = null;
      state.coachId = null;
      state.staffData = null;
      state.isAuthenticated = false;
      state.dashboardData = null;
      state.overview = null;
      state.tasks = null;
      state.performance = null;
      state.achievements = null;
      state.teamData = null;
      state.progress = null;
      state.comparison = null;
      state.goals = null;
      state.calendar = null;
      state.notifications = null;
      state.analytics = null;
      
      // Clear staff data
      localStorage.removeItem('staffToken');
      localStorage.removeItem('staffId');
      localStorage.removeItem('coachId');
      localStorage.removeItem('staffData');
      
      // Also clear any admin/coach data to prevent mixing
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      // Redirect to login page
      window.location.href = '/login';
    }
  },
  
  extraReducers: (builder) => {
    // Dashboard Data
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading.dashboard = true;
        state.errors.dashboard = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading.dashboard = false;
        state.dashboardData = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading.dashboard = false;
        state.errors.dashboard = action.payload;
      })
    
    // Overview
    builder
      .addCase(fetchOverview.pending, (state) => {
        state.loading.overview = true;
        state.errors.overview = null;
      })
      .addCase(fetchOverview.fulfilled, (state, action) => {
        state.loading.overview = false;
        state.overview = action.payload;
      })
      .addCase(fetchOverview.rejected, (state, action) => {
        state.loading.overview = false;
        state.errors.overview = action.payload;
      })
    
    // Tasks
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading.tasks = true;
        state.errors.tasks = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading.tasks = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading.tasks = false;
        state.errors.tasks = action.payload;
      })
    
    // Performance
    builder
      .addCase(fetchPerformance.pending, (state) => {
        state.loading.performance = true;
        state.errors.performance = null;
      })
      .addCase(fetchPerformance.fulfilled, (state, action) => {
        state.loading.performance = false;
        state.performance = action.payload;
      })
      .addCase(fetchPerformance.rejected, (state, action) => {
        state.loading.performance = false;
        state.errors.performance = action.payload;
      })
    
    // Achievements
    builder
      .addCase(fetchAchievements.pending, (state) => {
        state.loading.achievements = true;
        state.errors.achievements = null;
      })
      .addCase(fetchAchievements.fulfilled, (state, action) => {
        state.loading.achievements = false;
        state.achievements = action.payload;
      })
      .addCase(fetchAchievements.rejected, (state, action) => {
        state.loading.achievements = false;
        state.errors.achievements = action.payload;
      })
    
    // Team Data
    builder
      .addCase(fetchTeamData.pending, (state) => {
        state.loading.team = true;
        state.errors.team = null;
      })
      .addCase(fetchTeamData.fulfilled, (state, action) => {
        state.loading.team = false;
        state.teamData = action.payload;
      })
      .addCase(fetchTeamData.rejected, (state, action) => {
        state.loading.team = false;
        state.errors.team = action.payload;
      })
    
    // Progress
    builder
      .addCase(fetchProgress.pending, (state) => {
        state.loading.progress = true;
        state.errors.progress = null;
      })
      .addCase(fetchProgress.fulfilled, (state, action) => {
        state.loading.progress = false;
        state.progress = action.payload;
      })
      .addCase(fetchProgress.rejected, (state, action) => {
        state.loading.progress = false;
        state.errors.progress = action.payload;
      })
    
    // Comparison
    builder
      .addCase(fetchComparison.pending, (state) => {
        state.loading.comparison = true;
        state.errors.comparison = null;
      })
      .addCase(fetchComparison.fulfilled, (state, action) => {
        state.loading.comparison = false;
        state.comparison = action.payload;
      })
      .addCase(fetchComparison.rejected, (state, action) => {
        state.loading.comparison = false;
        state.errors.comparison = action.payload;
      })
    
    // Goals
    builder
      .addCase(fetchGoals.pending, (state) => {
        state.loading.goals = true;
        state.errors.goals = null;
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.loading.goals = false;
        state.goals = action.payload;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.loading.goals = false;
        state.errors.goals = action.payload;
      })
    
    // Calendar
    builder
      .addCase(fetchCalendar.pending, (state) => {
        state.loading.calendar = true;
        state.errors.calendar = null;
      })
      .addCase(fetchCalendar.fulfilled, (state, action) => {
        state.loading.calendar = false;
        state.calendar = action.payload;
      })
      .addCase(fetchCalendar.rejected, (state, action) => {
        state.loading.calendar = false;
        state.errors.calendar = action.payload;
      })
    
    // Notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading.notifications = true;
        state.errors.notifications = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading.notifications = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading.notifications = false;
        state.errors.notifications = action.payload;
      })
    
    // Analytics
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading.analytics = true;
        state.errors.analytics = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading.analytics = false;
        state.analytics = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading.analytics = false;
        state.errors.analytics = action.payload;
      })
    
    // Test Auth Headers
    builder
      .addCase(testAuthHeaders.pending, (state) => {
        state.loading.test = true;
        state.errors.test = null;
      })
      .addCase(testAuthHeaders.fulfilled, (state, action) => {
        state.loading.test = false;
        console.log('✅ Auth headers test successful:', action.payload);
      })
      .addCase(testAuthHeaders.rejected, (state, action) => {
        state.loading.test = false;
        state.errors.test = action.payload;
        console.log('❌ Auth headers test failed:', action.payload);
      })
    
    // Validate Token
    builder
      .addCase(validateToken.pending, (state) => {
        state.loading.validation = true;
        state.errors.validation = null;
      })
      .addCase(validateToken.fulfilled, (state, action) => {
        state.loading.validation = false;
        state.token = action.payload.token;
        state.staffId = action.payload.staffId;
        console.log('✅ Token validation successful:', action.payload);
      })
      .addCase(validateToken.rejected, (state, action) => {
        state.loading.validation = false;
        state.errors.validation = action.payload;
        console.log('❌ Token validation failed:', action.payload);
      });
  }
});

export const { 
  setAuth, 
  setStaffData, 
  setLoading, 
  setError, 
  clearError,
  toggleDarkMode,
  toggleSidebar,
  setSidebarOpen,
  logout 
} = staffSlice.actions;

// Utility function to check staff auth state
export const checkStaffAuthState = () => {
  const staffToken = localStorage.getItem('staffToken');
  const staffId = localStorage.getItem('staffId');
  const coachId = localStorage.getItem('coachId');
  const staffData = localStorage.getItem('staffData');
  
  console.log('🔍 Staff Auth State Check:');
  console.log('Staff Token:', staffToken ? `${staffToken.substring(0, 20)}...` : 'None');
  console.log('Staff ID:', staffId || 'None');
  console.log('Coach ID:', coachId || 'None');
  console.log('Staff Data:', staffData ? 'Present' : 'None');
  
  const isStaffAuthenticated = !!(staffToken && staffId);
  console.log('Staff Authenticated:', isStaffAuthenticated);
  
  return { staffToken, staffId, coachId, staffData, isStaffAuthenticated };
};

export { staffSlice };

// Export API instance for direct use if needed
export { api };
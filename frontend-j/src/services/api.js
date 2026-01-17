import { API_BASE_URL } from '../config/apiConfig';

// Helper function to get auth headers
export const getAuthHeaders = () => {
  let token = localStorage.getItem('token');
  let user = localStorage.getItem('user');
  
  console.log('🔑 Raw token from localStorage:', token);
  console.log('🔑 Raw user from localStorage:', user);
  
  if (!token) {
    console.error('❌ No token found in localStorage');
    throw new Error('No authentication token found');
  }
  
  // Clean the token - remove any whitespace and quotes
  token = token.trim().replace(/^["']|["']$/g, '');
  
  if (!token) {
    console.error('❌ Token is empty after cleaning');
    throw new Error('Invalid authentication token');
  }
  
  // Get coach ID from user data
  let coachId = null;
  try {
    const userData = JSON.parse(user || '{}');
    coachId = userData._id || userData.id || userData.coachId;
    console.log('🔑 Parsed user data:', userData);
    console.log('🔑 Coach ID extracted:', coachId);
  } catch (e) {
    console.warn('🔑 Error parsing user data:', e);
  }
  
  if (!coachId) {
    console.error('❌ No coach ID found in user data');
    console.log('🔍 Available user fields:', userData ? Object.keys(userData) : 'No user data');
    
    // Try alternative methods to get coach ID
    const alternativeCoachId = userData?.userId || userData?.coach_id || userData?.coachId;
    if (alternativeCoachId) {
      console.log('🔍 Found alternative coach ID:', alternativeCoachId);
      coachId = alternativeCoachId;
    } else {
      throw new Error('Coach ID not found in user data');
    }
  }
  
  console.log('🔑 Cleaned token:', token);
  console.log('🔑 Token length:', token.length);
  console.log('🔑 Authorization header:', `Bearer ${token}`);
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'Coach-ID': coachId,
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  };
  
  console.log('🔑 Final headers:', headers);
  
  return headers;
};

// Enhanced helper function to handle API responses with better error handling
const handleResponse = async (response) => {
  // Clear deactivation flag on successful API calls (account is active)
  if (response.ok) {
    // Dispatch success event to notify components
    window.dispatchEvent(new CustomEvent('api-success'));

    // Clear deactivation flag if it exists
    localStorage.removeItem('account_deactivated');
  }

  if (!response.ok) {
    let errorData = {};
    
    try {
      errorData = await response.json();
    } catch (parseError) {
      console.warn('⚠️ Could not parse error response as JSON:', parseError);
      // Try to get text response
      try {
        const textResponse = await response.text();
        errorData = { message: textResponse || 'Unknown error occurred' };
      } catch (textError) {
        console.warn('⚠️ Could not parse error response as text:', textError);
        errorData = { message: 'Unknown error occurred' };
      }
    }
    
    // Log detailed error information
    console.error('❌ API Error Details:');
    console.error('Status:', response.status);
    console.error('Status Text:', response.statusText);
    console.error('Error Data:', errorData);
    console.error('Response Headers:', Object.fromEntries(response.headers.entries()));
    
    // Handle specific error cases with user-friendly messages
    if (response.status === 500) {
      console.error('❌ Server Error (500) - Check backend logs');
      const errorMessage = errorData.message || 'Internal server error occurred';
      
      // Check if it's a specific server error
      if (errorMessage.includes('Internal Server Error')) {
        throw new Error('Server is temporarily unavailable. Please try again later.');
      }
      
      throw new Error(`Server Error: ${errorMessage}`);
    }
    
    if (response.status === 401) {
      console.error('❌ Unauthorized (401) - Token may be invalid');
      
      // Clear invalid auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      throw new Error('Session expired. Please login again.');
    }
    
    if (response.status === 403) {
      console.error('❌ Forbidden (403) - Insufficient permissions');

      // Check for account under review
      if (errorData.code === 'ACCOUNT_UNDER_REVIEW') {
        console.error('⏳ Account Under Review - Coach account is being reviewed by admin');

        // Store under review state
        localStorage.setItem('account_under_review', 'true');

        // Dispatch custom event for components to handle
        window.dispatchEvent(new CustomEvent('api-error', {
          detail: {
            code: 'ACCOUNT_UNDER_REVIEW',
            message: errorData.message,
            underReview: true
          }
        }));

        // Don't throw error - let event system handle it silently
        return;
      }

      // Check for account deactivation
      if (errorData.code === 'ACCOUNT_DEACTIVATED') {
        console.error('🚫 Account Deactivated - Coach account has been deactivated by admin');

        // Store deactivation state
        localStorage.setItem('account_deactivated', 'true');

        // Dispatch custom event for components to handle
        window.dispatchEvent(new CustomEvent('api-error', {
          detail: {
            code: 'ACCOUNT_DEACTIVATED',
            message: errorData.message,
            deactivated: true
          }
        }));

        // Don't throw error - let event system handle it silently
        return;
      }

      throw new Error('Access denied. You do not have permission to perform this action.');
    }
    
    if (response.status === 404) {
      console.error('❌ Not Found (404) - Endpoint may not exist');
      throw new Error('Requested resource not found.');
    }
    
    if (response.status === 429) {
      console.error('❌ Too Many Requests (429) - Rate limited');
      throw new Error('Too many requests. Please wait a moment and try again.');
    }
    
    if (response.status >= 500) {
      console.error(`❌ Server Error (${response.status}) - Backend issue`);
      throw new Error('Server is experiencing issues. Please try again later.');
    }
    
    if (response.status >= 400) {
      console.error(`❌ Client Error (${response.status}) - Request issue`);
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  try {
    return await response.json();
  } catch (parseError) {
    console.warn('⚠️ Could not parse successful response as JSON:', parseError);
    throw new Error('Invalid response format from server');
  }
};

// Enhanced fetch with timeout
const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - server is taking too long to respond');
    }
    throw error;
  }
};

// Dashboard API calls
export const dashboardAPI = {
  // Get dashboard overview data
  getOverview: async () => {
    try {
      console.log('🚀 Calling getOverview API...');
      const headers = getAuthHeaders();
      console.log('🚀 Using headers:', headers);
      
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/coach-dashboard/overview`, {
        method: 'GET',
        headers,
      }, 10000); // 10 second timeout
      
      console.log('🚀 getOverview response status:', response.status);
      return handleResponse(response);
    } catch (error) {
      console.error('❌ getOverview error:', error);
      
      // If it's an auth error, try to refresh token
      if (error.message.includes('Coach ID not found') || error.message.includes('No authentication token')) {
        console.log('🔄 Attempting to refresh auth data...');
        // Try to get fresh data from Redux store
        const freshUser = localStorage.getItem('user');
        const freshToken = localStorage.getItem('token');
        console.log('🔄 Fresh user data:', freshUser);
        console.log('🔄 Fresh token:', freshToken ? 'Present' : 'Missing');
      }
      
      throw error;
    }
  },

  // Get leads data
  getLeads: async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token');

    const response = await fetchWithTimeout(`${API_BASE_URL}/api/coach-dashboard/leads`, {
      method: 'GET',
      headers: getAuthHeaders(),
    }, 10000);
    return handleResponse(response);
  },

  // Get team performance data
  getTeamPerformance: async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token');

    const response = await fetchWithTimeout(`${API_BASE_URL}/api/staff-leaderboard/leaderboard`, {
      method: 'GET',
      headers: getAuthHeaders(),
    }, 10000);
    return handleResponse(response);
  },

  // Get financial data
  getFinancialData: async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token');

    const response = await fetchWithTimeout(`${API_BASE_URL}/api/coach-dashboard/financial`, {
      method: 'GET',
      headers: getAuthHeaders(),
    }, 10000);
    return handleResponse(response);
  },

  // Get funnel analytics (deprecated - use funnelAnalyticsAPI instead)
  getFunnelAnalytics: async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token');

    const response = await fetchWithTimeout(`${API_BASE_URL}/api/coach-dashboard/trends`, {
      method: 'GET',
      headers: getAuthHeaders(),
    }, 10000);
    return handleResponse(response);
  },

  // Get complete dashboard data - Updated to use new unified endpoint
  getCompleteData: async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token');

    // Check if user is staff or coach to determine endpoint
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isStaff = user.role === 'staff' || user.userType === 'staff';
    
    console.log('🔐 API Auth Check:', {
      token: token ? `${token.substring(0, 20)}...` : 'No token',
      user: user,
      isStaff: isStaff,
      endpoint: isStaff ? '/api/staff-dashboard/data' : '/api/coach-dashboard/data'
    });

    const endpoint = isStaff ? '/api/staff-dashboard/data' : '/api/coach-dashboard/data';
    
    const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    }, 15000); // Longer timeout for complete data
    return handleResponse(response);
  },

  // Get performance data
  getPerformance: async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/api/coach-dashboard/performance`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get marketing data
  getMarketing: async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/api/coach-dashboard/marketing`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get tasks data
  getTasks: async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/api/coach-dashboard/tasks`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get calendar data
  getCalendar: async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/api/coach-dashboard/calendar`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get AI insights
  getAIInsights: async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/api/coach-dashboard/ai-insights`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get KPIs
  getKPIs: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/coach-dashboard/kpis`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('❌ getKPIs error:', error);
      throw error;
    }
  },

  // Test authentication
  testAuth: async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🧪 Testing auth with token:', token ? `${token.substring(0, 20)}...` : 'No token');
      
      const headers = getAuthHeaders();
      console.log('🧪 Headers:', headers);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers,
      });
      
      console.log('🧪 Response status:', response.status);
      console.log('🧪 Response headers:', Object.fromEntries(response.headers.entries()));
      
      return handleResponse(response);
    } catch (error) {
      console.error('❌ testAuth error:', error);
      throw error;
    }
  },

  // Test dashboard API setup
  testDashboardSetup: async () => {
    try {
      console.log('🧪 Testing dashboard API setup...');
      
      const headers = getAuthHeaders();
      console.log('🧪 Dashboard Headers:', headers);
      
      // Test a simple endpoint first
      const response = await fetch(`${API_BASE_URL}/api/coach-dashboard/overview`, {
        method: 'GET',
        headers,
      });
      
      console.log('🧪 Dashboard Response status:', response.status);
      console.log('🧪 Dashboard Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('🧪 Dashboard Response data:', data);
        return data;
      } else {
        const errorText = await response.text();
        console.error('🧪 Dashboard Error response:', errorText);
        throw new Error(`Dashboard API Error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('❌ testDashboardSetup error:', error);
      throw error;
    }
  },

  // Debug current auth state
  debugAuthState: () => {
    console.log('🔍 === AUTH STATE DEBUG ===');
    
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log('🔍 Token exists:', !!token);
    console.log('🔍 Token value:', token ? `${token.substring(0, 20)}...` : 'null');
    console.log('🔍 Token length:', token ? token.length : 0);
    
    console.log('🔍 User exists:', !!user);
    if (user) {
      try {
        const userData = JSON.parse(user);
        console.log('🔍 User data:', userData);
        console.log('🔍 User _id:', userData._id);
        console.log('🔍 User id:', userData.id);
        console.log('🔍 User coachId:', userData.coachId);
      } catch (e) {
        console.error('🔍 Error parsing user data:', e);
      }
    }
    
    // Test headers generation
    try {
      const headers = getAuthHeaders();
      console.log('🔍 Generated headers:', headers);
    } catch (e) {
      console.error('🔍 Error generating headers:', e);
    }
    
    console.log('🔍 === END AUTH DEBUG ===');
  },
};

// Auth API calls
export const authAPI = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  verifyToken: async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Funnel Analytics API
export const funnelAnalyticsAPI = {
  // Get analytics for a specific funnel
  getFunnelAnalytics: async (funnelId, startDate = null, endDate = null) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token');

    let url = `${API_BASE_URL}/api/funnels/${funnelId}/analytics`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    }, 15000);
    return handleResponse(response);
  },
};

// Error handling utility
export const handleAPIError = (error) => {
  console.error('API Error:', error);
  
  if (error.message.includes('401') || error.message.includes('Unauthorized')) {
    // Token expired or invalid
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    return 'Session expired. Please login again.';
  }
  
  if (error.message.includes('Network') || error.message.includes('fetch')) {
    return 'Network error. Please check your internet connection.';
  }
  
  return error.message || 'An unexpected error occurred.';
};

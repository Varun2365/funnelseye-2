import { API_BASE_URL } from '../config/apiConfig';

// Helper function to get auth headers with staff context
const getAuthHeaders = () => {
  const staffToken = localStorage.getItem('staffToken');
  const token = staffToken || localStorage.getItem('token');
  const staffId = localStorage.getItem('staffId');
  const coachId = localStorage.getItem('coachId');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token) {
    console.warn('⚠️ No authentication token found - API calls will fail');
    // Don't throw error, let the API call fail gracefully
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'X-Request-Source': 'staff-dashboard'
  };
  
  // Add staff ID if available
  if (staffId) {
    headers['X-Staff-ID'] = staffId;
    headers['staff-id'] = staffId;
  }
  
  // Add coach ID if available (for staff management)
  if (coachId) {
    headers['X-Coach-ID'] = coachId;
    headers['coach-id'] = coachId;
  } else if (user.id) {
    headers['X-Coach-ID'] = user.id;
  }
  
  // Add multiple token formats for compatibility
  if (staffToken) {
    headers['token_staff'] = staffToken;
    headers['x-auth-token'] = staffToken;
  }
  
  return headers;
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  console.log('📡 API Response:', response.status, response.statusText);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('❌ API Error:', response.status, response.statusText, errorData);
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  console.log('✅ API Success:', response.status, response.statusText);
  console.log('📊 API Response Data:', data);
  return data;
};

// Unified Staff Dashboard API
export const unifiedStaffAPI = {
  // Dashboard Overview
  getCompleteDashboardData: async (timeRange = 30, sections = null) => {
    try {
      // Ensure timeRange is a number
      const timeRangeValue = typeof timeRange === 'object' ? 30 : timeRange;
      
      let url = `${API_BASE_URL}/api/staff-dashboard/data?timeRange=${timeRangeValue}`;
      if (sections) {
        url += `&sections=${sections.join(',')}`;
      }
      
      console.log('🚀 Making API call to:', url);
      console.log('🔑 Auth headers:', getAuthHeaders());
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      return handleResponse(response);
    } catch (error) {
      console.log('📊 Dashboard data API error:', error.message);
      throw error;
    }
  },

  getOverview: async () => {
    const response = await fetch(`${API_BASE_URL}/api/staff-dashboard/overview`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getNotifications: async () => {
    const response = await fetch(`${API_BASE_URL}/api/staff-dashboard/notifications`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Task Management
  getAllTasks: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    
    let url = `${API_BASE_URL}/api/staff-dashboard/tasks`;
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getMyTasks: async (timeRange = 30) => {
    const response = await fetch(`${API_BASE_URL}/api/staff-dashboard/unified/tasks/my-tasks?timeRange=${timeRange}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getOverdueTasks: async () => {
    const response = await fetch(`${API_BASE_URL}/api/staff-dashboard/unified/tasks/overdue`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getUpcomingTasks: async (days = 7) => {
    const response = await fetch(`${API_BASE_URL}/api/staff-dashboard/unified/tasks/upcoming?days=${days}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getTaskById: async (taskId) => {
    const response = await fetch(`${API_BASE_URL}/api/staff-dashboard/unified/tasks/${taskId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  updateTaskStatus: async (taskId, status, notes = '') => {
    const response = await fetch(`${API_BASE_URL}/api/staff-dashboard/unified/tasks/${taskId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, notes }),
    });
    return handleResponse(response);
  },

  completeTask: async (taskId, completionData) => {
    const response = await fetch(`${API_BASE_URL}/api/staff-dashboard/unified/tasks/${taskId}/complete`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(completionData),
    });
    return handleResponse(response);
  },

  startTask: async (taskId) => {
    const response = await fetch(`${API_BASE_URL}/api/staff-dashboard/unified/tasks/${taskId}/start`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  pauseTask: async (taskId) => {
    const response = await fetch(`${API_BASE_URL}/api/staff-dashboard/unified/tasks/${taskId}/pause`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  addTaskComment: async (taskId, comment) => {
    const response = await fetch(`${API_BASE_URL}/api/staff-dashboard/unified/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ comment }),
    });
    return handleResponse(response);
  },

  logTaskTime: async (taskId, timeLog) => {
    const response = await fetch(`${API_BASE_URL}/api/staff-dashboard/unified/tasks/${taskId}/time-log`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(timeLog),
    });
    return handleResponse(response);
  },

  bulkUpdateTasks: async (taskIds, updates) => {
    const response = await fetch(`${API_BASE_URL}/api/staff-dashboard/unified/tasks/bulk-update`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ taskIds, updates }),
    });
    return handleResponse(response);
  },

  // Calendar Management
  getCalendarEvents: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    
    let url = `${API_BASE_URL}/api/staff-dashboard/unified/calendar`;
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  createCalendarEvent: async (eventData) => {
    const response = await fetch(`${API_BASE_URL}/api/staff-dashboard/unified/calendar`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(eventData),
    });
    return handleResponse(response);
  },

  updateCalendarEvent: async (eventId, eventData) => {
    const response = await fetch(`${API_BASE_URL}/api/staff-dashboard/unified/calendar/${eventId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(eventData),
    });
    return handleResponse(response);
  },

  deleteCalendarEvent: async (eventId) => {
    const response = await fetch(`${API_BASE_URL}/api/staff-dashboard/unified/calendar/${eventId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getStaffAvailability: async (staffId, startTime, endTime) => {
    const response = await fetch(`${API_BASE_URL}/api/staff-dashboard/unified/calendar/staff/${staffId}/availability?startTime=${startTime}&endTime=${endTime}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Appointment Management
  assignAppointment: async (appointmentId, staffId) => {
    const response = await fetch(`${API_BASE_URL}/api/staff-dashboard/unified/appointments/assign`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ appointmentId, staffId }),
    });
    return handleResponse(response);
  },

  getStaffAppointments: async (staffId, filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    
    let url = `${API_BASE_URL}/api/staff-dashboard/unified/appointments/staff/${staffId}`;
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getAvailableStaff: async (appointmentDate, appointmentTime, duration = 30) => {
    const response = await fetch(`${API_BASE_URL}/api/staff-dashboard/unified/appointments/available-staff?appointmentDate=${appointmentDate}&appointmentTime=${appointmentTime}&duration=${duration}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  unassignAppointment: async (appointmentId) => {
    const response = await fetch(`${API_BASE_URL}/api/staff-dashboard/unified/appointments/${appointmentId}/unassign`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Performance & Analytics
  getStaffPerformance: async (timeRange = 30) => {
    try {
      // Ensure timeRange is a number
      const timeRangeValue = typeof timeRange === 'object' ? 30 : timeRange;
      
      const response = await fetch(`${API_BASE_URL}/api/staff-dashboard/performance?timeRange=${timeRangeValue}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      return handleResponse(response);
    } catch (error) {
      console.log('📈 Performance API error:', error.message);
      throw error;
    }
  },

  getPerformanceMetrics: async (timeRange = 30, includeDetails = false) => {
    try {
      // Ensure timeRange is a number
      const timeRangeValue = typeof timeRange === 'object' ? 30 : timeRange;
      
      const response = await fetch(`${API_BASE_URL}/api/staff-dashboard/performance/metrics?timeRange=${timeRangeValue}&includeDetails=${includeDetails}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      return handleResponse(response);
    } catch (error) {
      console.log('📊 Performance metrics API error:', error.message);
      throw error;
    }
  },

  getPerformanceComparison: async (timeRange = 30) => {
    const response = await fetch(`${API_BASE_URL}/api/staff-dashboard/performance/comparison?timeRange=${timeRange}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getPerformanceTrends: async (period = 'monthly', months = 6) => {
    const response = await fetch(`${API_BASE_URL}/api/staff-dashboard/performance/trends?period=${period}&months=${months}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getStaffAchievements: async (timeRange = 30) => {
    const response = await fetch(`${API_BASE_URL}/api/staff-dashboard/unified/achievements?timeRange=${timeRange}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getTeamLeaderboard: async (timeRange = 30, limit = 20) => {
    try {
      // Ensure timeRange is a number
      const timeRangeValue = typeof timeRange === 'object' ? 30 : timeRange;
      
      const response = await fetch(`${API_BASE_URL}/api/staff-dashboard/team/leaderboard?timeRange=${timeRangeValue}&limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      return handleResponse(response);
    } catch (error) {
      console.log('🏆 Team leaderboard API error:', error.message);
      throw error;
    }
  },

  getAnalytics: async (timeRange = 30) => {
    const response = await fetch(`${API_BASE_URL}/api/staff-dashboard/unified/analytics?timeRange=${timeRange}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Error handling utility
export const handleAPIError = (error) => {
  console.error('API Error:', error);
  
  if (error.message.includes('401') || error.message.includes('Unauthorized')) {
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

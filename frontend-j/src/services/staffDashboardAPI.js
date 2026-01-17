import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('staff_token') || localStorage.getItem('coach_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('staff_token');
      localStorage.removeItem('coach_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTHENTICATION ====================
export const authAPI = {
  // Staff Login
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('staff_token', response.data.data.token);
      localStorage.setItem('user_id', response.data.data.user.id);
      localStorage.setItem('staff_id', response.data.data.user.id);
      localStorage.setItem('coach_id', response.data.data.user.coachId);
    }
    return response.data;
  },

  // Get Current User
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('staff_token');
    localStorage.removeItem('coach_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('staff_id');
    localStorage.removeItem('coach_id');
  }
};

// ==================== DASHBOARD DATA ====================
export const dashboardAPI = {
  // Get Unified Dashboard Data
  getUnifiedData: async (params = {}) => {
    const { timeRange = 30, sections = 'overview,tasks,performance,calendar' } = params;
    const response = await apiClient.get('/staff-dashboard/unified/data', {
      params: { timeRange, sections }
    });
    return response.data;
  },

  // Get Overview Data
  getOverview: async () => {
    const response = await apiClient.get('/staff-dashboard/unified/overview');
    return response.data;
  },

  // Get Notifications
  getNotifications: async () => {
    const response = await apiClient.get('/staff-dashboard/unified/notifications');
    return response.data;
  },

  // Get Analytics
  getAnalytics: async (params = {}) => {
    const { timeRange = 30 } = params;
    const response = await apiClient.get('/staff-dashboard/unified/analytics', {
      params: { timeRange }
    });
    return response.data;
  }
};

// ==================== TASK MANAGEMENT ====================
export const taskAPI = {
  // Get All Tasks
  getAllTasks: async (params = {}) => {
    const { page = 1, limit = 20, status, priority, search } = params;
    const response = await apiClient.get('/staff-dashboard/unified/tasks', {
      params: { page, limit, status, priority, search }
    });
    return response.data;
  },

  // Get My Tasks
  getMyTasks: async (params = {}) => {
    const { timeRange = 30 } = params;
    const response = await apiClient.get('/staff-dashboard/unified/tasks/my-tasks', {
      params: { timeRange }
    });
    return response.data;
  },

  // Get Overdue Tasks
  getOverdueTasks: async (params = {}) => {
    const { page = 1, limit = 20 } = params;
    const response = await apiClient.get('/staff-dashboard/unified/tasks/overdue', {
      params: { page, limit }
    });
    return response.data;
  },

  // Get Upcoming Tasks
  getUpcomingTasks: async (params = {}) => {
    const { days = 7, page = 1, limit = 20 } = params;
    const response = await apiClient.get('/staff-dashboard/unified/tasks/upcoming', {
      params: { days, page, limit }
    });
    return response.data;
  },

  // Get Task Details
  getTaskDetails: async (taskId) => {
    const response = await apiClient.get(`/staff-dashboard/unified/tasks/${taskId}`);
    return response.data;
  },

  // Update Task Status
  updateTaskStatus: async (taskId, statusData) => {
    const response = await apiClient.put(`/staff-dashboard/unified/tasks/${taskId}/status`, statusData);
    return response.data;
  },

  // Start Task
  startTask: async (taskId, notes = '') => {
    const response = await apiClient.post(`/staff-dashboard/unified/tasks/${taskId}/start`, { notes });
    return response.data;
  },

  // Pause Task
  pauseTask: async (taskId, notes = '') => {
    const response = await apiClient.post(`/staff-dashboard/unified/tasks/${taskId}/pause`, { notes });
    return response.data;
  },

  // Add Task Comment
  addTaskComment: async (taskId, comment) => {
    const response = await apiClient.post(`/staff-dashboard/unified/tasks/${taskId}/comments`, { comment });
    return response.data;
  },

  // Log Task Time
  logTaskTime: async (taskId, timeData) => {
    const response = await apiClient.post(`/staff-dashboard/unified/tasks/${taskId}/time-log`, timeData);
    return response.data;
  },

  // Complete Task
  completeTask: async (taskId, completionData) => {
    const response = await apiClient.post(`/staff-dashboard/unified/tasks/${taskId}/complete`, completionData);
    return response.data;
  },

  // Bulk Update Tasks
  bulkUpdateTasks: async (updateData) => {
    const response = await apiClient.put('/staff-dashboard/unified/tasks/bulk-update', updateData);
    return response.data;
  }
};

// ==================== CALENDAR MANAGEMENT ====================
export const calendarAPI = {
  // Get Calendar Events
  getCalendarEvents: async (params = {}) => {
    const { startDate, endDate, page = 1, limit = 50 } = params;
    const response = await apiClient.get('/staff-dashboard/unified/calendar', {
      params: { startDate, endDate, page, limit }
    });
    return response.data;
  },

  // Create Calendar Event
  createCalendarEvent: async (eventData) => {
    const response = await apiClient.post('/staff-dashboard/unified/calendar', eventData);
    return response.data;
  },

  // Update Calendar Event
  updateCalendarEvent: async (eventId, eventData) => {
    const response = await apiClient.put(`/staff-dashboard/unified/calendar/${eventId}`, eventData);
    return response.data;
  },

  // Delete Calendar Event
  deleteCalendarEvent: async (eventId) => {
    const response = await apiClient.delete(`/staff-dashboard/unified/calendar/${eventId}`);
    return response.data;
  },

  // Get Staff Availability
  getStaffAvailability: async (staffId, params = {}) => {
    const { startTime, endTime } = params;
    const response = await apiClient.get(`/staff-dashboard/unified/calendar/staff/${staffId}/availability`, {
      params: { startTime, endTime }
    });
    return response.data;
  }
};

// ==================== PERFORMANCE & ANALYTICS ====================
export const performanceAPI = {
  // Get Performance Data
  getPerformanceData: async (params = {}) => {
    const { timeRange = 30 } = params;
    const response = await apiClient.get('/staff-dashboard/unified/performance', {
      params: { timeRange }
    });
    return response.data;
  },

  // Get Performance Metrics
  getPerformanceMetrics: async (params = {}) => {
    const { timeRange = 30, includeDetails = true } = params;
    const response = await apiClient.get('/staff-dashboard/unified/performance/metrics', {
      params: { timeRange, includeDetails }
    });
    return response.data;
  },

  // Get Performance Comparison
  getPerformanceComparison: async (params = {}) => {
    const { timeRange = 30 } = params;
    const response = await apiClient.get('/staff-dashboard/unified/performance/comparison', {
      params: { timeRange }
    });
    return response.data;
  },

  // Get Performance Trends
  getPerformanceTrends: async (params = {}) => {
    const { period = 'monthly', months = 6 } = params;
    const response = await apiClient.get('/staff-dashboard/unified/performance/trends', {
      params: { period, months }
    });
    return response.data;
  },

  // Get Achievements
  getAchievements: async (params = {}) => {
    const { timeRange = 30 } = params;
    const response = await apiClient.get('/staff-dashboard/unified/achievements', {
      params: { timeRange }
    });
    return response.data;
  },

  // Get Team Leaderboard
  getTeamLeaderboard: async (params = {}) => {
    const { timeRange = 30, limit = 20 } = params;
    const response = await apiClient.get('/staff-dashboard/unified/team/leaderboard', {
      params: { timeRange, limit }
    });
    return response.data;
  }
};

// ==================== APPOINTMENT MANAGEMENT ====================
export const appointmentAPI = {
  // Get Available Staff
  getAvailableStaff: async (params = {}) => {
    const { appointmentDate, appointmentTime, duration } = params;
    const response = await apiClient.get('/staff-dashboard/unified/appointments/available-staff', {
      params: { appointmentDate, appointmentTime, duration }
    });
    return response.data;
  },

  // Assign Appointment to Staff
  assignAppointment: async (assignmentData) => {
    const response = await apiClient.post('/staff-dashboard/unified/appointments/assign', assignmentData);
    return response.data;
  },

  // Get Staff Appointments
  getStaffAppointments: async (staffId, params = {}) => {
    const { startDate, endDate } = params;
    const response = await apiClient.get(`/staff-dashboard/unified/appointments/staff/${staffId}`, {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Unassign Appointment
  unassignAppointment: async (appointmentId, reasonData) => {
    const response = await apiClient.put(`/staff-dashboard/unified/appointments/${appointmentId}/unassign`, reasonData);
    return response.data;
  },

  // Transfer Appointment Between Staff
  transferAppointment: async (transferData) => {
    const response = await apiClient.put('/staff-dashboard/unified/appointments/transfer', transferData);
    return response.data;
  }
};

// ==================== SYSTEM & HEALTH ====================
export const systemAPI = {
  // Health Check
  healthCheck: async () => {
    const response = await apiClient.get('/staff-dashboard/unified/health');
    return response.data;
  },

  // System Info
  getSystemInfo: async () => {
    const response = await apiClient.get('/staff-dashboard/unified/system-info');
    return response.data;
  }
};

// ==================== STAFF MANAGEMENT (Coach Operations) ====================
export const staffManagementAPI = {
  // Create Staff
  createStaff: async (staffData) => {
    const response = await apiClient.post('/staff', staffData);
    return response.data;
  },

  // Get All Staff
  getAllStaff: async () => {
    const response = await apiClient.get('/staff');
    return response.data;
  },

  // Get Staff by ID
  getStaffById: async (staffId) => {
    const response = await apiClient.get(`/staff/${staffId}`);
    return response.data;
  },

  // Update Staff
  updateStaff: async (staffId, staffData) => {
    const response = await apiClient.put(`/staff/${staffId}`, staffData);
    return response.data;
  },

  // Get Staff Performance
  getStaffPerformance: async (staffId) => {
    const response = await apiClient.get(`/staff/${staffId}/performance`);
    return response.data;
  },

  // Get Staff Performance Trends
  getStaffPerformanceTrends: async (staffId) => {
    const response = await apiClient.get(`/staff/${staffId}/performance/trends`);
    return response.data;
  },

  // Get Staff Performance Comparison
  getStaffPerformanceComparison: async () => {
    const response = await apiClient.get('/staff/performance/comparison');
    return response.data;
  }
};

// ==================== LEAD MANAGEMENT ====================
export const leadAPI = {
  // Create Lead
  createLead: async (leadData) => {
    const response = await apiClient.post('/leads', leadData);
    return response.data;
  },

  // Get All Leads
  getAllLeads: async (params = {}) => {
    const { page = 1, limit = 20 } = params;
    const response = await apiClient.get('/leads', {
      params: { page, limit }
    });
    return response.data;
  },

  // Submit Question Responses
  submitQuestionResponses: async (responseData) => {
    const response = await apiClient.post('/leads/question-responses', responseData);
    return response.data;
  }
};

// Export all APIs
export default {
  authAPI,
  dashboardAPI,
  taskAPI,
  calendarAPI,
  performanceAPI,
  appointmentAPI,
  systemAPI,
  staffManagementAPI,
  leadAPI
};


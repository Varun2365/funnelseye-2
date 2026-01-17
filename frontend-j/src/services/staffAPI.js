import { API_BASE_URL } from '../config/apiConfig';

// Helper function to get auth headers with staff context
const getAuthHeaders = () => {
  // Try to get staff token first, then fallback to regular token
  const staffToken = localStorage.getItem('staffToken');
  const token = staffToken || localStorage.getItem('token');
  const staffId = localStorage.getItem('staffId');
  const coachId = localStorage.getItem('coachId');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token) {
    throw new Error('No authentication token found');
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
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.log('❌ API Error:', response.status, response.statusText, errorData);
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  // Log successful API calls
  console.log('✅ API Success:', response.status, response.statusText);
  const data = await response.json();
  console.log('📊 API Response Data:', data);
  return data;
};

// Staff Management API
export const staffAPI = {
  // Staff CRUD Operations
  getAllStaff: async (coachId = null) => {
    let url = `${API_BASE_URL}/api/staff`;
    if (coachId) {
      url += `?coachId=${coachId}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getStaffById: async (staffId) => {
    const response = await fetch(`${API_BASE_URL}/api/staff/${staffId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  createStaff: async (staffData) => {
    const response = await fetch(`${API_BASE_URL}/api/staff`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(staffData),
    });
    return handleResponse(response);
  },

  updateStaff: async (staffId, staffData) => {
    const response = await fetch(`${API_BASE_URL}/api/staff/${staffId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(staffData),
    });
    return handleResponse(response);
  },

  deleteStaff: async (staffId) => {
    const response = await fetch(`${API_BASE_URL}/api/staff/${staffId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  updateStaffPermissions: async (staffId, permissions) => {
    const response = await fetch(`${API_BASE_URL}/api/staff/${staffId}/permissions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ permissions }),
    });
    return handleResponse(response);
  },

  activateStaff: async (staffId) => {
    const response = await fetch(`${API_BASE_URL}/api/staff/${staffId}/activate`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  bulkStaffActions: async (staffIds, action) => {
    const response = await fetch(`${API_BASE_URL}/api/staff/bulk-actions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ staffIds, action }),
    });
    return handleResponse(response);
  },

  // Staff Performance
  getStaffPerformance: async (staffId, startDate = null, endDate = null) => {
    let url = `${API_BASE_URL}/api/staff/${staffId}/performance`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('includeDetails', 'true');
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getPerformanceTrends: async (staffId, period = 'monthly', months = 6) => {
    const response = await fetch(`${API_BASE_URL}/api/staff/${staffId}/performance/trends?period=${period}&months=${months}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getPerformanceComparison: async (startDate = null, endDate = null) => {
    let url = `${API_BASE_URL}/api/staff/performance/comparison`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Staff Calendar Management
  getCalendarEvents: async (staffId = null, startDate = null, endDate = null) => {
    let url = `${API_BASE_URL}/api/staff-calendar`;
    const params = new URLSearchParams();
    if (staffId) params.append('staffId', staffId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('limit', '50');
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getCalendarEventById: async (eventId) => {
    const response = await fetch(`${API_BASE_URL}/api/staff-calendar/${eventId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  createCalendarEvent: async (eventData) => {
    const response = await fetch(`${API_BASE_URL}/api/staff-calendar`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(eventData),
    });
    return handleResponse(response);
  },

  updateCalendarEvent: async (eventId, eventData) => {
    const response = await fetch(`${API_BASE_URL}/api/staff-calendar/${eventId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(eventData),
    });
    return handleResponse(response);
  },

  deleteCalendarEvent: async (eventId) => {
    const response = await fetch(`${API_BASE_URL}/api/staff-calendar/${eventId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getStaffAvailability: async (staffId, startTime, endTime) => {
    const response = await fetch(`${API_BASE_URL}/api/staff-calendar/staff/${staffId}/availability?startTime=${startTime}&endTime=${endTime}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  bulkCreateCalendarEvents: async (events) => {
    const response = await fetch(`${API_BASE_URL}/api/staff-calendar/bulk-create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ events }),
    });
    return handleResponse(response);
  },

  // Staff Dashboard
  getDashboardOverview: async () => {
    const response = await fetch(`${API_BASE_URL}/api/staff/dashboard/overview`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getDashboardStats: async (period = 'week') => {
    const response = await fetch(`${API_BASE_URL}/api/staff/dashboard/stats?period=${period}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getPersonalPerformanceDashboard: async (includeDetails = false, includeTrends = false) => {
    const params = new URLSearchParams();
    if (includeDetails) params.append('includeDetails', 'true');
    if (includeTrends) params.append('includeTrends', 'true');
    
    const response = await fetch(`${API_BASE_URL}/api/staff/dashboard/performance?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getNotifications: async (status = 'unread', type = 'all') => {
    let url = `${API_BASE_URL}/api/staff/dashboard/notifications`;
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (type && type !== 'all') params.append('type', type);
    params.append('limit', '20');
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getRecentActivity: async (limit = 20, type = 'all') => {
    let url = `${API_BASE_URL}/api/staff/dashboard/recent-activity`;
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (type && type !== 'all') params.append('type', type);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Staff Profile & Settings
  getStaffProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/api/staff/profile`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  updateStaffProfile: async (profileData) => {
    const response = await fetch(`${API_BASE_URL}/api/staff/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  },

  updateNotificationPreferences: async (preferences) => {
    const response = await fetch(`${API_BASE_URL}/api/staff/settings/notifications`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(preferences),
    });
    return handleResponse(response);
  },

  updateWorkingHours: async (workingHours) => {
    const response = await fetch(`${API_BASE_URL}/api/staff/settings/working-hours`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(workingHours),
    });
    return handleResponse(response);
  },

  // Staff Dashboard APIs
  getStaffDashboardData: async (timeRange = 30) => {
    const response = await fetch(`${API_BASE_URL}/api/staff-dashboard/data?timeRange=${timeRange}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getStaffDashboardOverview: async () => {
    const headers = getAuthHeaders();
    const staffId = localStorage.getItem('staffId');
    const coachId = localStorage.getItem('coachId');
    
    console.log('📊 Overview API Headers:', headers);
    console.log('📊 Staff ID being sent:', staffId);
    console.log('📊 Coach ID being sent:', coachId);
    
    const response = await fetch(`${API_BASE_URL}/api/staff-dashboard/overview`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        staffId: staffId,
        coachId: coachId,
        timestamp: new Date().toISOString()
      }),
    });
    return handleResponse(response);
  },

  getStaffDashboardTasks: async (filters = {}) => {
    const headers = getAuthHeaders();
    const staffId = localStorage.getItem('staffId');
    const coachId = localStorage.getItem('coachId');
    
    console.log('📋 Tasks API Headers:', headers);
    console.log('📋 Staff ID being sent:', staffId);
    console.log('📋 Filters:', filters);
    
    const response = await fetch(`${API_BASE_URL}/api/staff-dashboard/tasks`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        staffId: staffId,
        coachId: coachId,
        filters: filters,
        timestamp: new Date().toISOString()
      }),
    });
    return handleResponse(response);
  },

  getStaffDashboardPerformance: async (params = {}) => {
    const headers = getAuthHeaders();
    const staffId = localStorage.getItem('staffId');
    const coachId = localStorage.getItem('coachId');
    
    console.log('📊 Performance API Headers:', headers);
    console.log('📊 Staff ID being sent:', staffId);
    console.log('📊 Parameters:', params);
    
    const response = await fetch(`${API_BASE_URL}/api/staff-dashboard/performance`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        staffId: staffId,
        coachId: coachId,
        params: params,
        timestamp: new Date().toISOString()
      }),
    });
    return handleResponse(response);
  },

  getStaffDashboardAchievements: async () => {
    const response = await fetch(`${API_BASE_URL}/api/staff-dashboard/achievements`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getStaffDashboardTeam: async () => {
    const response = await fetch(`${API_BASE_URL}/api/staff-dashboard/team`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getStaffDashboardProgress: async (timeRange = 30) => {
    const response = await fetch(`${API_BASE_URL}/api/staff-dashboard/progress?timeRange=${timeRange}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getStaffDashboardComparison: async () => {
    const response = await fetch(`${API_BASE_URL}/api/staff-dashboard/comparison`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getStaffDashboardGoals: async () => {
    const response = await fetch(`${API_BASE_URL}/api/staff-dashboard/goals`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getStaffDashboardCalendar: async () => {
    const response = await fetch(`${API_BASE_URL}/api/staff-dashboard/calendar`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getStaffDashboardNotifications: async (params = {}) => {
    const headers = getAuthHeaders();
    const staffId = localStorage.getItem('staffId');
    const coachId = localStorage.getItem('coachId');
    
    console.log('🔔 Notifications API Headers:', headers);
    console.log('🔔 Staff ID being sent:', staffId);
    console.log('🔔 Parameters:', params);
    
    const response = await fetch(`${API_BASE_URL}/api/staff-dashboard/notifications`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        staffId: staffId,
        coachId: coachId,
        params: params,
        timestamp: new Date().toISOString()
      }),
    });
    return handleResponse(response);
  },

  getStaffDashboardAnalytics: async (params = {}) => {
    const headers = getAuthHeaders();
    const staffId = localStorage.getItem('staffId');
    const coachId = localStorage.getItem('coachId');
    
    console.log('📈 Analytics API Headers:', headers);
    console.log('📈 Staff ID being sent:', staffId);
    console.log('📈 Parameters:', params);
    
    const response = await fetch(`${API_BASE_URL}/api/staff-dashboard/analytics`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        staffId: staffId,
        coachId: coachId,
        params: params,
        timestamp: new Date().toISOString()
      }),
    });
    return handleResponse(response);
  },
};

// Workflow Management API (Missing Endpoints)
export const workflowAPI = {
  // Kanban Board
  getKanbanBoard: async () => {
    const response = await fetch(`${API_BASE_URL}/api/workflow/kanban-board`, {
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
    
    let url = `${API_BASE_URL}/api/workflow/tasks`;
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getTaskById: async (taskId) => {
    const response = await fetch(`${API_BASE_URL}/api/workflow/tasks/${taskId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  createTask: async (taskData) => {
    const response = await fetch(`${API_BASE_URL}/api/workflow/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    });
    return handleResponse(response);
  },

  updateTask: async (taskId, taskData) => {
    const response = await fetch(`${API_BASE_URL}/api/workflow/tasks/${taskId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    });
    return handleResponse(response);
  },

  deleteTask: async (taskId) => {
    const response = await fetch(`${API_BASE_URL}/api/workflow/tasks/${taskId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  moveTask: async (taskId, stage) => {
    const response = await fetch(`${API_BASE_URL}/api/workflow/tasks/${taskId}/move`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ stage }),
    });
    return handleResponse(response);
  },

  // Task Comments
  addTaskComment: async (taskId, comment) => {
    const response = await fetch(`${API_BASE_URL}/api/workflow/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(comment),
    });
    return handleResponse(response);
  },

  // Task Time Logging
  logTaskTime: async (taskId, timeLog) => {
    const response = await fetch(`${API_BASE_URL}/api/workflow/tasks/${taskId}/time-log`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(timeLog),
    });
    return handleResponse(response);
  },

  // Subtasks
  addSubtask: async (taskId, subtask) => {
    const response = await fetch(`${API_BASE_URL}/api/workflow/tasks/${taskId}/subtasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(subtask),
    });
    return handleResponse(response);
  },

  // Task Dependencies
  getTaskDependencies: async (taskId) => {
    const response = await fetch(`${API_BASE_URL}/api/workflow/tasks/${taskId}/dependencies`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  addTaskDependency: async (taskId, dependencyId) => {
    const response = await fetch(`${API_BASE_URL}/api/workflow/tasks/${taskId}/dependencies`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ dependencyId }),
    });
    return handleResponse(response);
  },

  removeTaskDependency: async (taskId, dependencyId) => {
    const response = await fetch(`${API_BASE_URL}/api/workflow/tasks/${taskId}/dependencies/${dependencyId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Analytics
  getTaskAnalytics: async () => {
    const response = await fetch(`${API_BASE_URL}/api/workflow/analytics`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Auto Assignment
  autoAssignTasks: async () => {
    const response = await fetch(`${API_BASE_URL}/api/workflow/auto-assign`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Bulk Operations
  bulkUpdateTaskStatus: async (taskIds, status) => {
    const response = await fetch(`${API_BASE_URL}/api/workflow/bulk-update-status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ taskIds, status }),
    });
    return handleResponse(response);
  },

  // SOP Generation
  generateSOP: async (taskType) => {
    const response = await fetch(`${API_BASE_URL}/api/workflow/generate-sop`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ taskType }),
    });
    return handleResponse(response);
  },

  // Task by Stage
  getTasksByStage: async (stage) => {
    const response = await fetch(`${API_BASE_URL}/api/workflow/tasks/stage/${stage}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Create Task from Lead
  createTaskFromLead: async (leadId, taskData) => {
    const response = await fetch(`${API_BASE_URL}/api/workflow/tasks/from-lead/${leadId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    });
    return handleResponse(response);
  },

  // Overdue Tasks
  getOverdueTasks: async () => {
    const response = await fetch(`${API_BASE_URL}/api/workflow/overdue-tasks`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Upcoming Tasks
  getUpcomingTasks: async () => {
    const response = await fetch(`${API_BASE_URL}/api/workflow/upcoming-tasks`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Staff Task Management API (Corrected Endpoints)
export const staffTaskAPI = {
  // Get staff's assigned tasks
  getStaffTasks: async (filters = {}) => {
    const headers = getAuthHeaders();
    const staffId = localStorage.getItem('staffId');
    const coachId = localStorage.getItem('coachId');
    
    console.log('📋 Staff Tasks API Headers:', headers);
    console.log('📋 Staff ID being sent:', staffId);
    console.log('📋 Filters:', filters);

    const response = await fetch(`${API_BASE_URL}/api/staff-tasks`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        staffId: staffId,
        coachId: coachId,
        filters: filters,
        timestamp: new Date().toISOString()
      }),
    });
    return handleResponse(response);
  },

  getStaffTaskById: async (taskId) => {
    const response = await fetch(`${API_BASE_URL}/api/staff-tasks/${taskId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  createTask: async (taskData) => {
    const headers = getAuthHeaders();
    const staffId = localStorage.getItem('staffId');
    const coachId = localStorage.getItem('coachId');
    
    console.log('📝 Create Task API Headers:', headers);
    console.log('📝 Staff ID being sent:', staffId);
    console.log('📝 Task Data:', taskData);

    const response = await fetch(`${API_BASE_URL}/api/staff-tasks`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        staffId: staffId,
        coachId: coachId,
        taskData: taskData,
        timestamp: new Date().toISOString()
      }),
    });
    return handleResponse(response);
  },

  updateTaskStatus: async (taskId, status, notes = '') => {
    const response = await fetch(`${API_BASE_URL}/api/staff-tasks/${taskId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, notes }),
    });
    return handleResponse(response);
  },

  completeTask: async (taskId, completionData) => {
    const response = await fetch(`${API_BASE_URL}/api/staff-tasks/${taskId}/complete`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(completionData),
    });
    return handleResponse(response);
  },

  startTask: async (taskId, notes = '') => {
    const response = await fetch(`${API_BASE_URL}/api/staff-tasks/${taskId}/start`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ notes }),
    });
    return handleResponse(response);
  },

  pauseTask: async (taskId, notes = '') => {
    const response = await fetch(`${API_BASE_URL}/api/staff-tasks/${taskId}/pause`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ notes }),
    });
    return handleResponse(response);
  },

  addTaskComment: async (taskId, content) => {
    const response = await fetch(`${API_BASE_URL}/api/staff-tasks/${taskId}/comments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
    });
    return handleResponse(response);
  },

  logTaskTime: async (taskId, timeLog) => {
    const response = await fetch(`${API_BASE_URL}/api/staff-tasks/${taskId}/time-log`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(timeLog),
    });
    return handleResponse(response);
  },

  getMyTasks: async (timeRange = 30) => {
    const response = await fetch(`${API_BASE_URL}/api/staff-tasks/my-tasks?timeRange=${timeRange}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getOverdueTasks: async (page = 1, limit = 10) => {
    const response = await fetch(`${API_BASE_URL}/api/staff-tasks/overdue?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getUpcomingTasks: async (days = 7, page = 1, limit = 10) => {
    const response = await fetch(`${API_BASE_URL}/api/staff-tasks/upcoming?days=${days}&page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  bulkUpdateTasks: async (taskIds, updates) => {
    const response = await fetch(`${API_BASE_URL}/api/staff-tasks/bulk-update`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ taskIds, updates }),
    });
    return handleResponse(response);
  },
};

// Staff Leads Management API
export const staffLeadsAPI = {
  getMyLeads: async () => {
    const response = await fetch(`${API_BASE_URL}/api/staff/leads/my-leads`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  updateLeadStatus: async (leadId, status) => {
    const response = await fetch(`${API_BASE_URL}/api/staff/leads/${leadId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },

  addLeadNotes: async (leadId, notes) => {
    const response = await fetch(`${API_BASE_URL}/api/staff/leads/${leadId}/notes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ notes }),
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


import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { unifiedStaffAPI } from '../services/unifiedStaffAPI';

// Function to load staff state from localStorage
const loadStaffState = () => {
  try {
    const serializedStaff = localStorage.getItem('staffData');
    const serializedStaffToken = localStorage.getItem('staffToken');
    const serializedStaffId = localStorage.getItem('staffId');
    
    if (serializedStaff === null || serializedStaffToken === null) {
      return undefined;
    }
    
    const staff = JSON.parse(serializedStaff);
    const token = serializedStaffToken;
    const staffId = serializedStaffId;
    return {
      staff: staff,
      token: token,
      staffId: staffId,
      isAuthenticated: true,
    };
  } catch (e) {
    console.warn("Could not load staff state from localStorage", e);
    return undefined;
  }
};

const initialState = {
  // Authentication - Initialize from localStorage or defaults
  ...loadStaffState(),
  
  // Dashboard Data
  dashboardData: null,
  overview: null,
  tasks: null,
  calendar: null,
  appointments: null,
  performance: null,
  achievements: null,
  team: null,
  notifications: null,
  analytics: null,
  
  // UI State
  loading: {
    dashboard: false,
    overview: false,
    tasks: false,
    calendar: false,
    appointments: false,
    performance: false,
    achievements: false,
    team: false,
    notifications: false,
    analytics: false,
  },
  errors: {
    dashboard: null,
    overview: null,
    tasks: null,
    calendar: null,
    appointments: null,
    performance: null,
    achievements: null,
    team: null,
    notifications: null,
    analytics: null,
  },
  
  // UI Preferences
  darkMode: false,
  sidebarCollapsed: false,
  activeTab: 0,
};

// Async thunks for API calls
export const fetchDashboardData = createAsyncThunk(
  'staff/fetchDashboardData',
  async ({ timeRange = 30, sections = null }, { rejectWithValue }) => {
    try {
      const response = await unifiedStaffAPI.getCompleteDashboardData(timeRange, sections);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchOverview = createAsyncThunk(
  'staff/fetchOverview',
  async (_, { rejectWithValue }) => {
    try {
      const response = await unifiedStaffAPI.getOverview();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTasks = createAsyncThunk(
  'staff/fetchTasks',
  async ({ status = null, priority = null, stage = null, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await unifiedStaffAPI.getAllTasks({ status, priority, stage, page, limit });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCalendar = createAsyncThunk(
  'staff/fetchCalendar',
  async ({ startDate, endDate, eventType = null }, { rejectWithValue }) => {
    try {
      const response = await unifiedStaffAPI.getCalendarEvents({ startDate, endDate, eventType });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAppointments = createAsyncThunk(
  'staff/fetchAppointments',
  async ({ staffId, startDate, endDate, status = null }, { rejectWithValue }) => {
    try {
      const response = await unifiedStaffAPI.getStaffAppointments({ staffId, startDate, endDate, status });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPerformance = createAsyncThunk(
  'staff/fetchPerformance',
  async ({ timeRange = 30, includeComparison = false }, { rejectWithValue }) => {
    try {
      const response = await unifiedStaffAPI.getStaffPerformance({ timeRange, includeComparison });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchNotifications = createAsyncThunk(
  'staff/fetchNotifications',
  async ({ unreadOnly = false, limit = 50 }, { rejectWithValue }) => {
    try {
      const response = await unifiedStaffAPI.getNotifications({ unreadOnly, limit });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTeamLeaderboard = createAsyncThunk(
  'staff/fetchTeamLeaderboard',
  async ({ timeRange = 30, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await unifiedStaffAPI.getTeamLeaderboard({ timeRange, limit });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAnalytics = createAsyncThunk(
  'staff/fetchAnalytics',
  async ({ timeRange = 30, metrics = null }, { rejectWithValue }) => {
    try {
      const response = await unifiedStaffAPI.getAnalyticsData({ timeRange, metrics });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Task actions
export const updateTaskStatus = createAsyncThunk(
  'staff/updateTaskStatus',
  async ({ taskId, status, notes = null }, { rejectWithValue }) => {
    try {
      const response = await unifiedStaffAPI.updateTaskStatus(taskId, { status, notes });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const completeTask = createAsyncThunk(
  'staff/completeTask',
  async ({ taskId, completionData }, { rejectWithValue }) => {
    try {
      const response = await unifiedStaffAPI.completeTask(taskId, completionData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const startTask = createAsyncThunk(
  'staff/startTask',
  async ({ taskId }, { rejectWithValue }) => {
    try {
      const response = await unifiedStaffAPI.startTask(taskId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const pauseTask = createAsyncThunk(
  'staff/pauseTask',
  async ({ taskId }, { rejectWithValue }) => {
    try {
      const response = await unifiedStaffAPI.pauseTask(taskId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addTaskComment = createAsyncThunk(
  'staff/addTaskComment',
  async ({ taskId, comment }, { rejectWithValue }) => {
    try {
      const response = await unifiedStaffAPI.addTaskComment(taskId, comment);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logTime = createAsyncThunk(
  'staff/logTime',
  async ({ taskId, timeData }, { rejectWithValue }) => {
    try {
      const response = await unifiedStaffAPI.logTime(taskId, timeData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Calendar actions
export const createCalendarEvent = createAsyncThunk(
  'staff/createCalendarEvent',
  async (eventData, { rejectWithValue }) => {
    try {
      const response = await unifiedStaffAPI.createCalendarEvent(eventData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCalendarEvent = createAsyncThunk(
  'staff/updateCalendarEvent',
  async ({ eventId, eventData }, { rejectWithValue }) => {
    try {
      const response = await unifiedStaffAPI.updateCalendarEvent(eventId, eventData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCalendarEvent = createAsyncThunk(
  'staff/deleteCalendarEvent',
  async ({ eventId }, { rejectWithValue }) => {
    try {
      const response = await unifiedStaffAPI.deleteCalendarEvent(eventId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    // Authentication actions
    setStaffAuth: (state, action) => {
      const { staff, token, staffId } = action.payload;
      state.staff = staff;
      state.token = token;
      state.staffId = staffId;
      state.isAuthenticated = true;
      
      // Save to localStorage
      localStorage.setItem('staffData', JSON.stringify(staff));
      localStorage.setItem('staffToken', token);
      localStorage.setItem('staffId', staffId);
    },
    
    clearStaffAuth: (state) => {
      state.staff = null;
      state.token = null;
      state.staffId = null;
      state.isAuthenticated = false;
      
      // Clear localStorage
      localStorage.removeItem('staffData');
      localStorage.removeItem('staffToken');
      localStorage.removeItem('staffId');
    },
    
    // UI actions
    setDarkMode: (state, action) => {
      state.darkMode = action.payload;
    },
    
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
    
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    
    // Clear errors
    clearError: (state, action) => {
      const section = action.payload;
      if (state.errors[section]) {
        state.errors[section] = null;
      }
    },
    
    // Clear all errors
    clearAllErrors: (state) => {
      Object.keys(state.errors).forEach(key => {
        state.errors[key] = null;
      });
    },
  },
  extraReducers: (builder) => {
    // Dashboard data
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading.dashboard = true;
        state.errors.dashboard = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading.dashboard = false;
        state.dashboardData = action.payload?.data || action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading.dashboard = false;
        state.errors.dashboard = action.payload;
      })
      
      // Overview
      .addCase(fetchOverview.pending, (state) => {
        state.loading.overview = true;
        state.errors.overview = null;
      })
      .addCase(fetchOverview.fulfilled, (state, action) => {
        state.loading.overview = false;
        state.overview = action.payload?.data || action.payload;
      })
      .addCase(fetchOverview.rejected, (state, action) => {
        state.loading.overview = false;
        state.errors.overview = action.payload;
      })
      
      // Tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading.tasks = true;
        state.errors.tasks = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading.tasks = false;
        state.tasks = action.payload?.data || action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading.tasks = false;
        state.errors.tasks = action.payload;
      })
      
      // Calendar
      .addCase(fetchCalendar.pending, (state) => {
        state.loading.calendar = true;
        state.errors.calendar = null;
      })
      .addCase(fetchCalendar.fulfilled, (state, action) => {
        state.loading.calendar = false;
        state.calendar = action.payload.data;
      })
      .addCase(fetchCalendar.rejected, (state, action) => {
        state.loading.calendar = false;
        state.errors.calendar = action.payload;
      })
      
      // Appointments
      .addCase(fetchAppointments.pending, (state) => {
        state.loading.appointments = true;
        state.errors.appointments = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading.appointments = false;
        state.appointments = action.payload.data;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading.appointments = false;
        state.errors.appointments = action.payload;
      })
      
      // Performance
      .addCase(fetchPerformance.pending, (state) => {
        state.loading.performance = true;
        state.errors.performance = null;
      })
      .addCase(fetchPerformance.fulfilled, (state, action) => {
        state.loading.performance = false;
        state.performance = action.payload?.data || action.payload;
      })
      .addCase(fetchPerformance.rejected, (state, action) => {
        state.loading.performance = false;
        state.errors.performance = action.payload;
      })
      
      // Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading.notifications = true;
        state.errors.notifications = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading.notifications = false;
        state.notifications = action.payload?.data || action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading.notifications = false;
        state.errors.notifications = action.payload;
      })
      
      // Team Leaderboard
      .addCase(fetchTeamLeaderboard.pending, (state) => {
        state.loading.team = true;
        state.errors.team = null;
      })
      .addCase(fetchTeamLeaderboard.fulfilled, (state, action) => {
        state.loading.team = false;
        state.team = action.payload?.data || action.payload;
      })
      .addCase(fetchTeamLeaderboard.rejected, (state, action) => {
        state.loading.team = false;
        state.errors.team = action.payload;
      })
      
      // Analytics
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading.analytics = true;
        state.errors.analytics = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading.analytics = false;
        state.analytics = action.payload?.data || action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading.analytics = false;
        state.errors.analytics = action.payload;
      });
  },
});

export const {
  setStaffAuth,
  clearStaffAuth,
  setDarkMode,
  setSidebarCollapsed,
  setActiveTab,
  clearError,
  clearAllErrors,
} = staffSlice.actions;

export default staffSlice.reducer;

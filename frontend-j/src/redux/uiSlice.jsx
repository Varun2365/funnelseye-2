import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  darkMode: false,
  sidebarOpen: false,
  showLeadForm: false,
  topNavMenuType: 'sidebar', // 'sidebar' or 'topnav'
  isSettingsSliderOpen: false,
  isSidebarFixed: false,
  notifications: [],
  loadingStates: {},
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    setDarkMode: (state, action) => {
      state.darkMode = action.payload;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setShowLeadForm: (state, action) => {
      state.showLeadForm = action.payload;
    },
    setTopNavMenuType: (state, action) => {
      state.topNavMenuType = action.payload;
    },
    setSettingsSliderOpen: (state, action) => {
      state.isSettingsSliderOpen = action.payload;
    },
    setSidebarFixed: (state, action) => {
      state.isSidebarFixed = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.push(action.payload);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    setLoadingState: (state, action) => {
      const { key, isLoading } = action.payload;
      state.loadingStates[key] = isLoading;
    },
    clearLoadingStates: (state) => {
      state.loadingStates = {};
    },
  },
});

export const {
  toggleDarkMode,
  setDarkMode,
  setSidebarOpen,
  toggleSidebar,
  setShowLeadForm,
  setTopNavMenuType,
  setSettingsSliderOpen,
  setSidebarFixed,
  addNotification,
  removeNotification,
  setLoadingState,
  clearLoadingStates,
} = uiSlice.actions;

// Selectors
export const selectDarkMode = (state) => state.ui.darkMode;
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectShowLeadForm = (state) => state.ui.showLeadForm;
export const selectTopNavMenuType = (state) => state.ui.topNavMenuType;
export const selectSettingsSliderOpen = (state) => state.ui.isSettingsSliderOpen;
export const selectSidebarFixed = (state) => state.ui.isSidebarFixed;
export const selectNotifications = (state) => state.ui.notifications;
export const selectLoadingStates = (state) => state.ui.loadingStates;

export default uiSlice.reducer;

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import uiReducer from './uiSlice';
import leadsReducer from './leadsSlice';
import teamReducer from './teamSlice';
import funnelReducer from './funnel';
import { staffSlice } from '../staff_dashboard/redux';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    leads: leadsReducer,
    team: teamReducer,
    funnel: funnelReducer,
    staff: staffSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  devTools: true,
});

// Redux store created successfully

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  teamMembers: [],
  leaderboard: [],
  loading: false,
  error: null,
  filters: {
    role: 'all',
    status: 'all',
    performance: 'all',
  },
};

const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    setTeamMembers: (state, action) => {
      state.teamMembers = action.payload;
    },
    addTeamMember: (state, action) => {
      state.teamMembers.push(action.payload);
    },
    updateTeamMember: (state, action) => {
      const index = state.teamMembers.findIndex(member => member.id === action.payload.id);
      if (index !== -1) {
        state.teamMembers[index] = { ...state.teamMembers[index], ...action.payload };
      }
    },
    removeTeamMember: (state, action) => {
      state.teamMembers = state.teamMembers.filter(member => member.id !== action.payload);
    },
    setLeaderboard: (state, action) => {
      state.leaderboard = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

export const {
  setTeamMembers,
  addTeamMember,
  updateTeamMember,
  removeTeamMember,
  setLeaderboard,
  setLoading,
  setError,
  setFilters,
  clearFilters,
} = teamSlice.actions;

export default teamSlice.reducer;

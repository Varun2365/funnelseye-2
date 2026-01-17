import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  leads: [],
  loading: false,
  error: null,
  filters: {
    status: 'all',
    source: 'all',
    dateRange: '30',
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  },
};

const leadsSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    setLeads: (state, action) => {
      state.leads = action.payload;
    },
    addLead: (state, action) => {
      state.leads.unshift(action.payload);
    },
    updateLead: (state, action) => {
      const index = state.leads.findIndex(lead => lead.id === action.payload.id);
      if (index !== -1) {
        state.leads[index] = { ...state.leads[index], ...action.payload };
      }
    },
    deleteLead: (state, action) => {
      state.leads = state.leads.filter(lead => lead.id !== action.payload);
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
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

export const {
  setLeads,
  addLead,
  updateLead,
  deleteLead,
  setLoading,
  setError,
  setFilters,
  setPagination,
  clearFilters,
} = leadsSlice.actions;

export default leadsSlice.reducer;

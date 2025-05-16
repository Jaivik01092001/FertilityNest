import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { setLoading, setError } from './uiSlice';

// Initial state
const initialState = {
  cycles: [],
  currentCycle: null,
  totalCycles: 0,
  page: 1,
  limit: 10,
};

// Async thunks
export const createCycle = createAsyncThunk(
  'cycle/createCycle',
  async (cycleData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ feature: 'cycles', isLoading: true }));
      const response = await api.post('/cycles', cycleData);
      dispatch(setLoading({ feature: 'cycles', isLoading: false }));
      return response.data;
    } catch (error) {
      dispatch(setLoading({ feature: 'cycles', isLoading: false }));
      dispatch(
        setError({
          feature: 'cycles',
          error: error.response?.data?.message || 'Failed to create cycle',
        })
      );
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const getCycles = createAsyncThunk(
  'cycle/getCycles',
  async ({ page = 1, limit = 10, startDate, endDate }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ feature: 'cycles', isLoading: true }));
      
      let url = `/cycles?page=${page}&limit=${limit}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      
      const response = await api.get(url);
      dispatch(setLoading({ feature: 'cycles', isLoading: false }));
      return response.data;
    } catch (error) {
      dispatch(setLoading({ feature: 'cycles', isLoading: false }));
      dispatch(
        setError({
          feature: 'cycles',
          error: error.response?.data?.message || 'Failed to fetch cycles',
        })
      );
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const getCurrentCycle = createAsyncThunk(
  'cycle/getCurrentCycle',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ feature: 'cycles', isLoading: true }));
      const response = await api.get('/cycles/current');
      dispatch(setLoading({ feature: 'cycles', isLoading: false }));
      return response.data;
    } catch (error) {
      dispatch(setLoading({ feature: 'cycles', isLoading: false }));
      dispatch(
        setError({
          feature: 'cycles',
          error: error.response?.data?.message || 'Failed to fetch current cycle',
        })
      );
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const getCycle = createAsyncThunk(
  'cycle/getCycle',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ feature: 'cycles', isLoading: true }));
      const response = await api.get(`/cycles/${id}`);
      dispatch(setLoading({ feature: 'cycles', isLoading: false }));
      return response.data;
    } catch (error) {
      dispatch(setLoading({ feature: 'cycles', isLoading: false }));
      dispatch(
        setError({
          feature: 'cycles',
          error: error.response?.data?.message || 'Failed to fetch cycle',
        })
      );
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const updateCycle = createAsyncThunk(
  'cycle/updateCycle',
  async ({ id, cycleData }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ feature: 'cycles', isLoading: true }));
      const response = await api.put(`/cycles/${id}`, cycleData);
      dispatch(setLoading({ feature: 'cycles', isLoading: false }));
      return response.data;
    } catch (error) {
      dispatch(setLoading({ feature: 'cycles', isLoading: false }));
      dispatch(
        setError({
          feature: 'cycles',
          error: error.response?.data?.message || 'Failed to update cycle',
        })
      );
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const deleteCycle = createAsyncThunk(
  'cycle/deleteCycle',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ feature: 'cycles', isLoading: true }));
      const response = await api.delete(`/cycles/${id}`);
      dispatch(setLoading({ feature: 'cycles', isLoading: false }));
      return { ...response.data, id };
    } catch (error) {
      dispatch(setLoading({ feature: 'cycles', isLoading: false }));
      dispatch(
        setError({
          feature: 'cycles',
          error: error.response?.data?.message || 'Failed to delete cycle',
        })
      );
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Slice
const cycleSlice = createSlice({
  name: 'cycle',
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setLimit: (state, action) => {
      state.limit = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createCycle.fulfilled, (state, action) => {
        state.cycles.unshift(action.payload.cycle);
        state.totalCycles += 1;
      })
      .addCase(getCycles.fulfilled, (state, action) => {
        state.cycles = action.payload.cycles;
        state.totalCycles = action.payload.total;
      })
      .addCase(getCurrentCycle.fulfilled, (state, action) => {
        state.currentCycle = action.payload.cycle;
      })
      .addCase(getCycle.fulfilled, (state, action) => {
        const index = state.cycles.findIndex(
          (cycle) => cycle._id === action.payload.cycle._id
        );
        if (index !== -1) {
          state.cycles[index] = action.payload.cycle;
        }
      })
      .addCase(updateCycle.fulfilled, (state, action) => {
        const index = state.cycles.findIndex(
          (cycle) => cycle._id === action.payload.cycle._id
        );
        if (index !== -1) {
          state.cycles[index] = action.payload.cycle;
        }
        if (state.currentCycle && state.currentCycle._id === action.payload.cycle._id) {
          state.currentCycle = action.payload.cycle;
        }
      })
      .addCase(deleteCycle.fulfilled, (state, action) => {
        state.cycles = state.cycles.filter((cycle) => cycle._id !== action.payload.id);
        state.totalCycles -= 1;
        if (state.currentCycle && state.currentCycle._id === action.payload.id) {
          state.currentCycle = null;
        }
      });
  },
});

export const { setPage, setLimit } = cycleSlice.actions;

export default cycleSlice.reducer;

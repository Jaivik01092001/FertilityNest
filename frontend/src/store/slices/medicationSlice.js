import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { setLoading, setError } from './uiSlice';

// Initial state
const initialState = {
  medications: [],
  todayMedications: [],
  totalMedications: 0,
  page: 1,
  limit: 10,
};

// Async thunks
export const createMedication = createAsyncThunk(
  'medication/createMedication',
  async (medicationData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ feature: 'medications', isLoading: true }));
      const response = await api.post('/medications', medicationData);
      dispatch(setLoading({ feature: 'medications', isLoading: false }));
      return response.data;
    } catch (error) {
      dispatch(setLoading({ feature: 'medications', isLoading: false }));
      dispatch(
        setError({
          feature: 'medications',
          error: error.response?.data?.message || 'Failed to create medication',
        })
      );
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const getMedications = createAsyncThunk(
  'medication/getMedications',
  async ({ page = 1, limit = 10, active, category }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ feature: 'medications', isLoading: true }));
      
      let url = `/medications?page=${page}&limit=${limit}`;
      if (active !== undefined) url += `&active=${active}`;
      if (category) url += `&category=${category}`;
      
      const response = await api.get(url);
      dispatch(setLoading({ feature: 'medications', isLoading: false }));
      return response.data;
    } catch (error) {
      dispatch(setLoading({ feature: 'medications', isLoading: false }));
      dispatch(
        setError({
          feature: 'medications',
          error: error.response?.data?.message || 'Failed to fetch medications',
        })
      );
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const getTodayMedications = createAsyncThunk(
  'medication/getTodayMedications',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ feature: 'medications', isLoading: true }));
      const response = await api.get('/medications/today');
      dispatch(setLoading({ feature: 'medications', isLoading: false }));
      return response.data;
    } catch (error) {
      dispatch(setLoading({ feature: 'medications', isLoading: false }));
      dispatch(
        setError({
          feature: 'medications',
          error: error.response?.data?.message || 'Failed to fetch today\'s medications',
        })
      );
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const getMedication = createAsyncThunk(
  'medication/getMedication',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ feature: 'medications', isLoading: true }));
      const response = await api.get(`/medications/${id}`);
      dispatch(setLoading({ feature: 'medications', isLoading: false }));
      return response.data;
    } catch (error) {
      dispatch(setLoading({ feature: 'medications', isLoading: false }));
      dispatch(
        setError({
          feature: 'medications',
          error: error.response?.data?.message || 'Failed to fetch medication',
        })
      );
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const updateMedication = createAsyncThunk(
  'medication/updateMedication',
  async ({ id, medicationData }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ feature: 'medications', isLoading: true }));
      const response = await api.put(`/medications/${id}`, medicationData);
      dispatch(setLoading({ feature: 'medications', isLoading: false }));
      return response.data;
    } catch (error) {
      dispatch(setLoading({ feature: 'medications', isLoading: false }));
      dispatch(
        setError({
          feature: 'medications',
          error: error.response?.data?.message || 'Failed to update medication',
        })
      );
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const deleteMedication = createAsyncThunk(
  'medication/deleteMedication',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ feature: 'medications', isLoading: true }));
      const response = await api.delete(`/medications/${id}`);
      dispatch(setLoading({ feature: 'medications', isLoading: false }));
      return { ...response.data, id };
    } catch (error) {
      dispatch(setLoading({ feature: 'medications', isLoading: false }));
      dispatch(
        setError({
          feature: 'medications',
          error: error.response?.data?.message || 'Failed to delete medication',
        })
      );
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const logMedication = createAsyncThunk(
  'medication/logMedication',
  async ({ id, logData }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ feature: 'medications', isLoading: true }));
      const response = await api.post(`/medications/${id}/log`, logData);
      dispatch(setLoading({ feature: 'medications', isLoading: false }));
      return { ...response.data, id };
    } catch (error) {
      dispatch(setLoading({ feature: 'medications', isLoading: false }));
      dispatch(
        setError({
          feature: 'medications',
          error: error.response?.data?.message || 'Failed to log medication',
        })
      );
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Slice
const medicationSlice = createSlice({
  name: 'medication',
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
      .addCase(createMedication.fulfilled, (state, action) => {
        state.medications.unshift(action.payload.medication);
        state.totalMedications += 1;
      })
      .addCase(getMedications.fulfilled, (state, action) => {
        state.medications = action.payload.medications;
        state.totalMedications = action.payload.total;
      })
      .addCase(getTodayMedications.fulfilled, (state, action) => {
        state.todayMedications = action.payload.medications;
      })
      .addCase(getMedication.fulfilled, (state, action) => {
        const index = state.medications.findIndex(
          (medication) => medication._id === action.payload.medication._id
        );
        if (index !== -1) {
          state.medications[index] = action.payload.medication;
        }
      })
      .addCase(updateMedication.fulfilled, (state, action) => {
        const index = state.medications.findIndex(
          (medication) => medication._id === action.payload.medication._id
        );
        if (index !== -1) {
          state.medications[index] = action.payload.medication;
        }
        
        // Update in today's medications if present
        const todayIndex = state.todayMedications.findIndex(
          (medication) => medication._id === action.payload.medication._id
        );
        if (todayIndex !== -1) {
          state.todayMedications[todayIndex] = action.payload.medication;
        }
      })
      .addCase(deleteMedication.fulfilled, (state, action) => {
        state.medications = state.medications.filter(
          (medication) => medication._id !== action.payload.id
        );
        state.todayMedications = state.todayMedications.filter(
          (medication) => medication._id !== action.payload.id
        );
        state.totalMedications -= 1;
      })
      .addCase(logMedication.fulfilled, (state, action) => {
        const index = state.medications.findIndex(
          (medication) => medication._id === action.payload.id
        );
        if (index !== -1) {
          state.medications[index].logs = action.payload.logs;
        }
        
        const todayIndex = state.todayMedications.findIndex(
          (medication) => medication._id === action.payload.id
        );
        if (todayIndex !== -1) {
          state.todayMedications[todayIndex].logs = action.payload.logs;
        }
      });
  },
});

export const { setPage, setLimit } = medicationSlice.actions;

export default medicationSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { setLoading, setError } from './uiSlice';

// Initial state
const initialState = {
  partnerInfo: null,
  partnerCycles: [],
  partnerMedications: [],
  partnerCode: null,
};

// Async thunks
export const getPartnerInfo = createAsyncThunk(
  'partner/getPartnerInfo',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ feature: 'partner', isLoading: true }));
      const response = await api.get('/partners/info');
      dispatch(setLoading({ feature: 'partner', isLoading: false }));
      return response.data;
    } catch (error) {
      dispatch(setLoading({ feature: 'partner', isLoading: false }));
      dispatch(
        setError({
          feature: 'partner',
          error: error.response?.data?.message || 'Failed to fetch partner information',
        })
      );
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const getPartnerCycles = createAsyncThunk(
  'partner/getPartnerCycles',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ feature: 'partner', isLoading: true }));
      const response = await api.get('/partners/cycles');
      dispatch(setLoading({ feature: 'partner', isLoading: false }));
      return response.data;
    } catch (error) {
      dispatch(setLoading({ feature: 'partner', isLoading: false }));
      dispatch(
        setError({
          feature: 'partner',
          error: error.response?.data?.message || 'Failed to fetch partner cycles',
        })
      );
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const getPartnerMedications = createAsyncThunk(
  'partner/getPartnerMedications',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ feature: 'partner', isLoading: true }));
      const response = await api.get('/partners/medications');
      dispatch(setLoading({ feature: 'partner', isLoading: false }));
      return response.data;
    } catch (error) {
      dispatch(setLoading({ feature: 'partner', isLoading: false }));
      dispatch(
        setError({
          feature: 'partner',
          error: error.response?.data?.message || 'Failed to fetch partner medications',
        })
      );
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const generatePartnerCode = createAsyncThunk(
  'partner/generatePartnerCode',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ feature: 'partner', isLoading: true }));
      const response = await api.post('/users/partner-code');
      dispatch(setLoading({ feature: 'partner', isLoading: false }));
      return response.data;
    } catch (error) {
      dispatch(setLoading({ feature: 'partner', isLoading: false }));
      dispatch(
        setError({
          feature: 'partner',
          error: error.response?.data?.message || 'Failed to generate partner code',
        })
      );
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const connectWithPartner = createAsyncThunk(
  'partner/connectWithPartner',
  async (partnerCode, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ feature: 'partner', isLoading: true }));
      const response = await api.post('/users/connect-partner', { partnerCode });
      dispatch(setLoading({ feature: 'partner', isLoading: false }));
      return response.data;
    } catch (error) {
      dispatch(setLoading({ feature: 'partner', isLoading: false }));
      dispatch(
        setError({
          feature: 'partner',
          error: error.response?.data?.message || 'Failed to connect with partner',
        })
      );
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Slice
const partnerSlice = createSlice({
  name: 'partner',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPartnerInfo.fulfilled, (state, action) => {
        state.partnerInfo = action.payload.partner;
      })
      .addCase(getPartnerCycles.fulfilled, (state, action) => {
        state.partnerCycles = action.payload.cycles;
      })
      .addCase(getPartnerMedications.fulfilled, (state, action) => {
        state.partnerMedications = action.payload.medications;
      })
      .addCase(generatePartnerCode.fulfilled, (state, action) => {
        state.partnerCode = action.payload.partnerCode;
      })
      .addCase(connectWithPartner.fulfilled, (state, action) => {
        state.partnerInfo = action.payload.partner;
      });
  },
});

export default partnerSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { setLoading, setError } from './uiSlice';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: false,
};

// Async thunks
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ feature: 'auth', isLoading: true }));
      const response = await api.post('/auth/register', userData);
      localStorage.setItem('token', response.data.token);
      dispatch(setLoading({ feature: 'auth', isLoading: false }));
      return response.data;
    } catch (error) {
      dispatch(setLoading({ feature: 'auth', isLoading: false }));
      dispatch(
        setError({
          feature: 'auth',
          error: error.response?.data?.message || 'Registration failed',
        })
      );
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ feature: 'auth', isLoading: true }));
      const response = await api.post('/auth/login', credentials);
      localStorage.setItem('token', response.data.token);
      dispatch(setLoading({ feature: 'auth', isLoading: false }));
      return response.data;
    } catch (error) {
      dispatch(setLoading({ feature: 'auth', isLoading: false }));
      dispatch(
        setError({
          feature: 'auth',
          error: error.response?.data?.message || 'Login failed',
        })
      );
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ feature: 'auth', isLoading: true }));
      const response = await api.get('/auth/me');
      dispatch(setLoading({ feature: 'auth', isLoading: false }));
      return response.data;
    } catch (error) {
      dispatch(setLoading({ feature: 'auth', isLoading: false }));
      dispatch(
        setError({
          feature: 'auth',
          error: error.response?.data?.message || 'Failed to fetch user data',
        })
      );
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ feature: 'auth', isLoading: true }));
      const response = await api.put('/users/profile', profileData);
      dispatch(setLoading({ feature: 'auth', isLoading: false }));
      return response.data;
    } catch (error) {
      dispatch(setLoading({ feature: 'auth', isLoading: false }));
      dispatch(
        setError({
          feature: 'auth',
          error: error.response?.data?.message || 'Failed to update profile',
        })
      );
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async (_, { dispatch }) => {
  localStorage.removeItem('token');
  return null;
});

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export default authSlice.reducer;

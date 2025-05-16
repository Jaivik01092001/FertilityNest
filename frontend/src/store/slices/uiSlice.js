import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: {
    auth: false,
    cycles: false,
    medications: false,
    chat: false,
    partner: false,
    community: false,
  },
  errors: {
    auth: null,
    cycles: null,
    medications: null,
    chat: null,
    partner: null,
    community: null,
  },
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      const { feature, isLoading } = action.payload;
      state.loading[feature] = isLoading;
    },
    setError: (state, action) => {
      const { feature, error } = action.payload;
      state.errors[feature] = error;
    },
    clearError: (state, action) => {
      const feature = action.payload;
      state.errors[feature] = null;
    },
    addNotification: (state, action) => {
      state.notifications.push(action.payload);
    },
    removeNotification: (state, action) => {
      const id = action.payload;
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== id
      );
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  addNotification,
  removeNotification,
  clearAllNotifications,
} = uiSlice.actions;

export default uiSlice.reducer;

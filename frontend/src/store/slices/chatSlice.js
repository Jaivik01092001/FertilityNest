import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { setLoading, setError } from './uiSlice';

// Initial state
const initialState = {
  chatSessions: [],
  currentSession: null,
  totalSessions: 0,
  page: 1,
  limit: 10,
  typingStatus: {}, // Map of sessionId -> isTyping
};

// Async thunks
export const createChatSession = createAsyncThunk(
  'chat/createChatSession',
  async (sessionData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ feature: 'chat', isLoading: true }));
      const response = await api.post('/chat/sessions', sessionData);
      dispatch(setLoading({ feature: 'chat', isLoading: false }));
      return response.data;
    } catch (error) {
      dispatch(setLoading({ feature: 'chat', isLoading: false }));
      dispatch(
        setError({
          feature: 'chat',
          error: error.response?.data?.message || 'Failed to create chat session',
        })
      );
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const getChatSessions = createAsyncThunk(
  'chat/getChatSessions',
  async ({ page = 1, limit = 10 }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ feature: 'chat', isLoading: true }));
      const response = await api.get(`/chat/sessions?page=${page}&limit=${limit}`);
      dispatch(setLoading({ feature: 'chat', isLoading: false }));
      return response.data;
    } catch (error) {
      dispatch(setLoading({ feature: 'chat', isLoading: false }));
      dispatch(
        setError({
          feature: 'chat',
          error: error.response?.data?.message || 'Failed to fetch chat sessions',
        })
      );
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const getChatSession = createAsyncThunk(
  'chat/getChatSession',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ feature: 'chat', isLoading: true }));
      const response = await api.get(`/chat/sessions/${id}`);
      dispatch(setLoading({ feature: 'chat', isLoading: false }));
      return response.data;
    } catch (error) {
      dispatch(setLoading({ feature: 'chat', isLoading: false }));
      dispatch(
        setError({
          feature: 'chat',
          error: error.response?.data?.message || 'Failed to fetch chat session',
        })
      );
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ sessionId, content }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ feature: 'chat', isLoading: true }));
      const response = await api.post(`/chat/sessions/${sessionId}/messages`, { content });
      dispatch(setLoading({ feature: 'chat', isLoading: false }));
      return response.data;
    } catch (error) {
      dispatch(setLoading({ feature: 'chat', isLoading: false }));
      dispatch(
        setError({
          feature: 'chat',
          error: error.response?.data?.message || 'Failed to send message',
        })
      );
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setLimit: (state, action) => {
      state.limit = action.payload;
    },
    setCurrentSession: (state, action) => {
      state.currentSession = action.payload;
    },
    setTypingStatus: (state, action) => {
      const { sessionId, isTyping } = action.payload;
      state.typingStatus[sessionId] = isTyping;

      // Also update the current session typing status if it matches
      if (state.currentSession && state.currentSession._id === sessionId) {
        state.currentSession.isTyping = isTyping;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createChatSession.fulfilled, (state, action) => {
        state.chatSessions.unshift(action.payload.chatSession);
        state.currentSession = action.payload.chatSession;
        state.totalSessions += 1;
      })
      .addCase(getChatSessions.fulfilled, (state, action) => {
        state.chatSessions = action.payload.chatSessions;
        state.totalSessions = action.payload.total;
      })
      .addCase(getChatSession.fulfilled, (state, action) => {
        state.currentSession = action.payload.chatSession;

        // Update in sessions list if present
        const index = state.chatSessions.findIndex(
          (session) => session._id === action.payload.chatSession._id
        );
        if (index !== -1) {
          state.chatSessions[index] = action.payload.chatSession;
        }
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        if (state.currentSession && state.currentSession._id === action.payload.userMessage.sessionId) {
          // Add user message
          state.currentSession.messages.push(action.payload.userMessage);

          // Add AI response if available
          if (action.payload.aiResponse) {
            state.currentSession.messages.push(action.payload.aiResponse);
          }
        }

        // Update in sessions list if present
        const index = state.chatSessions.findIndex(
          (session) => session._id === action.payload.userMessage.sessionId
        );
        if (index !== -1) {
          if (!state.chatSessions[index].messages) {
            state.chatSessions[index].messages = [];
          }

          // Add user message
          state.chatSessions[index].messages.push(action.payload.userMessage);

          // Add AI response if available
          if (action.payload.aiResponse) {
            state.chatSessions[index].messages.push(action.payload.aiResponse);
          }
        }
      });
  },
});

export const { setPage, setLimit, setCurrentSession, setTypingStatus } = chatSlice.actions;

export default chatSlice.reducer;

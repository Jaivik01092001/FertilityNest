import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { setLoading, setError } from './uiSlice';

// Initial state
const initialState = {
  communities: [],
  currentCommunity: null,
  userCommunities: [],
  totalCommunities: 0,
  page: 1,
  limit: 10,
};

// Async thunks
export const createCommunity = createAsyncThunk(
  'community/createCommunity',
  async (communityData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ feature: 'community', isLoading: true }));
      const response = await api.post('/community', communityData);
      dispatch(setLoading({ feature: 'community', isLoading: false }));
      return response.data;
    } catch (error) {
      dispatch(setLoading({ feature: 'community', isLoading: false }));
      dispatch(
        setError({
          feature: 'community',
          error: error.response?.data?.message || 'Failed to create community',
        })
      );
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const getCommunities = createAsyncThunk(
  'community/getCommunities',
  async ({ page = 1, limit = 10, category }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ feature: 'community', isLoading: true }));
      
      let url = `/community?page=${page}&limit=${limit}`;
      if (category) url += `&category=${category}`;
      
      const response = await api.get(url);
      dispatch(setLoading({ feature: 'community', isLoading: false }));
      return response.data;
    } catch (error) {
      dispatch(setLoading({ feature: 'community', isLoading: false }));
      dispatch(
        setError({
          feature: 'community',
          error: error.response?.data?.message || 'Failed to fetch communities',
        })
      );
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const getCommunity = createAsyncThunk(
  'community/getCommunity',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ feature: 'community', isLoading: true }));
      const response = await api.get(`/community/${id}`);
      dispatch(setLoading({ feature: 'community', isLoading: false }));
      return response.data;
    } catch (error) {
      dispatch(setLoading({ feature: 'community', isLoading: false }));
      dispatch(
        setError({
          feature: 'community',
          error: error.response?.data?.message || 'Failed to fetch community',
        })
      );
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const joinCommunity = createAsyncThunk(
  'community/joinCommunity',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ feature: 'community', isLoading: true }));
      const response = await api.post(`/community/${id}/join`);
      dispatch(setLoading({ feature: 'community', isLoading: false }));
      return response.data;
    } catch (error) {
      dispatch(setLoading({ feature: 'community', isLoading: false }));
      dispatch(
        setError({
          feature: 'community',
          error: error.response?.data?.message || 'Failed to join community',
        })
      );
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const leaveCommunity = createAsyncThunk(
  'community/leaveCommunity',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ feature: 'community', isLoading: true }));
      const response = await api.post(`/community/${id}/leave`);
      dispatch(setLoading({ feature: 'community', isLoading: false }));
      return { ...response.data, id };
    } catch (error) {
      dispatch(setLoading({ feature: 'community', isLoading: false }));
      dispatch(
        setError({
          feature: 'community',
          error: error.response?.data?.message || 'Failed to leave community',
        })
      );
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const createPost = createAsyncThunk(
  'community/createPost',
  async ({ communityId, postData }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ feature: 'community', isLoading: true }));
      const response = await api.post(`/community/${communityId}/posts`, postData);
      dispatch(setLoading({ feature: 'community', isLoading: false }));
      return { ...response.data, communityId };
    } catch (error) {
      dispatch(setLoading({ feature: 'community', isLoading: false }));
      dispatch(
        setError({
          feature: 'community',
          error: error.response?.data?.message || 'Failed to create post',
        })
      );
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Slice
const communitySlice = createSlice({
  name: 'community',
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
      .addCase(createCommunity.fulfilled, (state, action) => {
        state.communities.unshift(action.payload.community);
        state.userCommunities.unshift(action.payload.community);
        state.totalCommunities += 1;
      })
      .addCase(getCommunities.fulfilled, (state, action) => {
        state.communities = action.payload.communities;
        state.totalCommunities = action.payload.total;
        
        // Filter user communities
        if (action.payload.userCommunities) {
          state.userCommunities = action.payload.userCommunities;
        }
      })
      .addCase(getCommunity.fulfilled, (state, action) => {
        state.currentCommunity = action.payload.community;
        
        // Update in communities list if present
        const index = state.communities.findIndex(
          (community) => community._id === action.payload.community._id
        );
        if (index !== -1) {
          state.communities[index] = action.payload.community;
        }
        
        // Update in user communities list if present
        const userIndex = state.userCommunities.findIndex(
          (community) => community._id === action.payload.community._id
        );
        if (userIndex !== -1) {
          state.userCommunities[userIndex] = action.payload.community;
        }
      })
      .addCase(joinCommunity.fulfilled, (state, action) => {
        // Add to user communities
        state.userCommunities.push(action.payload.community);
        
        // Update in communities list if present
        const index = state.communities.findIndex(
          (community) => community._id === action.payload.community._id
        );
        if (index !== -1) {
          state.communities[index] = action.payload.community;
        }
        
        // Update current community if it's the same
        if (state.currentCommunity && state.currentCommunity._id === action.payload.community._id) {
          state.currentCommunity = action.payload.community;
        }
      })
      .addCase(leaveCommunity.fulfilled, (state, action) => {
        // Remove from user communities
        state.userCommunities = state.userCommunities.filter(
          (community) => community._id !== action.payload.id
        );
        
        // Update in communities list if present
        const index = state.communities.findIndex(
          (community) => community._id === action.payload.id
        );
        if (index !== -1 && action.payload.community) {
          state.communities[index] = action.payload.community;
        }
        
        // Update current community if it's the same
        if (state.currentCommunity && state.currentCommunity._id === action.payload.id) {
          if (action.payload.community) {
            state.currentCommunity = action.payload.community;
          } else {
            state.currentCommunity = null;
          }
        }
      })
      .addCase(createPost.fulfilled, (state, action) => {
        // Add post to current community if it's the same
        if (
          state.currentCommunity && 
          state.currentCommunity._id === action.payload.communityId &&
          action.payload.post
        ) {
          if (!state.currentCommunity.posts) {
            state.currentCommunity.posts = [];
          }
          state.currentCommunity.posts.unshift(action.payload.post);
        }
      });
  },
});

export const { setPage, setLimit } = communitySlice.actions;

export default communitySlice.reducer;

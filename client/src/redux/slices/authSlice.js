import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/config';

// Helper function to store auth data
const storeAuthData = (token, user) => {
  if (token) {
    localStorage.setItem('token', token.trim());
  }
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

// Helper function to clear auth data
const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      storeAuthData(response.data.token, response.data.data.user);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to login');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/signup', userData);
      storeAuthData(response.data.token, response.data.data.user);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to register');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/me');
      storeAuthData(null, response.data.data.user);
      return response.data.data;
    } catch (error) {
      console.error('Get current user error:', error);
      clearAuthData();
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user data');
    }
  }
);

// New password update thunk
export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await api.patch('/users/updatePassword', passwordData);
      return response.data;
    } catch (error) {
      console.error('Password update error:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        'Failed to update password. Please try again.'
      );
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: !!localStorage.getItem('token'),
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user')),
    isLoading: false,
    error: null,
    passwordUpdateStatus: 'idle',
    passwordUpdateError: null
  },
  reducers: {
    logout: (state) => {
      clearAuthData();
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateProfile: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    clearPasswordUpdateError: (state) => {
      state.passwordUpdateError = null;
      state.passwordUpdateStatus = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.data.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.data.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.passwordUpdateStatus = 'loading';
        state.passwordUpdateError = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
      });
  }
});

export const { logout, clearError, updateProfile } = authSlice.actions;

export default authSlice.reducer;
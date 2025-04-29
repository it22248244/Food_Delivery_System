import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Async thunks with auth token
export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/users/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching users');
    }
  }
);

export const updateUser = createAsyncThunk(
  'admin/updateUser',
  async ({ userId, userData, token }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/users/admin/users/${userId}`, userData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error updating user');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async ({ userId, token }, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/users/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return userId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error deleting user');
    }
  }
);

export const fetchPendingRestaurants = createAsyncThunk(
  'admin/fetchPendingRestaurants',
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/users/admin/restaurants/pending`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching pending restaurants');
    }
  }
);

export const approveRestaurant = createAsyncThunk(
  'admin/approveRestaurant',
  async ({ restaurantId, token }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_URL}/restaurants/${restaurantId}/verify`, 
        { isVerified: true, status: 'approved' },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      return response.data.data.restaurant;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error approving restaurant');
    }
  }
);

export const rejectRestaurant = createAsyncThunk(
  'admin/rejectRestaurant',
  async ({ restaurantId, reason, token }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/users/admin/restaurants/${restaurantId}/reject`, 
        { reason }, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error rejecting restaurant');
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  'admin/fetchTransactions',
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/users/admin/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching transactions');
    }
  }
);

export const updateTransactionStatus = createAsyncThunk(
  'admin/updateTransactionStatus',
  async ({ transactionId, status, token }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_URL}/users/admin/transactions/${transactionId}/status`, 
        { status }, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error updating transaction status');
    }
  }
);

export const fetchAllRestaurants = createAsyncThunk(
  'admin/fetchAllRestaurants',
  async (token, { rejectWithValue }) => {
    try {
      // First, fetch all restaurants from the admin endpoint
      const response = await axios.get(`${API_URL}/restaurants`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Get the basic restaurant data
      const restaurants = response.data.data.restaurants || [];
      
      // For each restaurant, fetch the detailed information including menu and opening hours
      const detailedRestaurants = await Promise.all(
        restaurants.map(async (restaurant) => {
          try {
            const detailResponse = await axios.get(`${API_URL}/restaurants/${restaurant._id}`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            
            // Return the detailed restaurant data
            return detailResponse.data.data.restaurant;
          } catch (error) {
            console.error(`Error fetching details for restaurant ${restaurant._id}:`, error);
            // If we can't get details, return the basic restaurant info
            return restaurant;
          }
        })
      );
      
      return detailedRestaurants;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching restaurants');
    }
  }
);

const initialState = {
  users: [],
  pendingRestaurants: [],
  allRestaurants: [],
  transactions: [],
  isLoading: false,
  error: null
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all users
      .addCase(fetchAllUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = state.users.filter(user => user._id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch pending restaurants
      .addCase(fetchPendingRestaurants.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPendingRestaurants.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingRestaurants = action.payload;
      })
      .addCase(fetchPendingRestaurants.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Approve restaurant
      .addCase(approveRestaurant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(approveRestaurant.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update in allRestaurants
        const index = state.allRestaurants.findIndex(
          restaurant => restaurant._id === action.payload._id
        );
        if (index !== -1) {
          state.allRestaurants[index] = {
            ...state.allRestaurants[index],
            isVerified: true,
            status: 'approved'
          };
        }
        
        // Remove from pendingRestaurants
        state.pendingRestaurants = state.pendingRestaurants.filter(
          restaurant => restaurant._id !== action.payload._id
        );
      })
      .addCase(approveRestaurant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Reject restaurant
      .addCase(rejectRestaurant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(rejectRestaurant.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update in allRestaurants
        const index = state.allRestaurants.findIndex(
          restaurant => restaurant._id === action.payload._id
        );
        if (index !== -1) {
          state.allRestaurants[index] = {
            ...state.allRestaurants[index],
            status: 'rejected',
            rejectionReason: action.payload.rejectionReason
          };
        }
        
        // Remove from pendingRestaurants
        state.pendingRestaurants = state.pendingRestaurants.filter(
          restaurant => restaurant._id !== action.payload._id
        );
      })
      .addCase(rejectRestaurant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update transaction status
      .addCase(updateTransactionStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTransactionStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.transactions.findIndex(
          transaction => transaction._id === action.payload._id
        );
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
      })
      .addCase(updateTransactionStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch all restaurants
      .addCase(fetchAllRestaurants.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllRestaurants.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allRestaurants = action.payload;
      })
      .addCase(fetchAllRestaurants.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError } = adminSlice.actions;

export default adminSlice.reducer;
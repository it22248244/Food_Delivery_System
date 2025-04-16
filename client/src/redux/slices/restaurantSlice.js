import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/config';

export const fetchAllRestaurants = createAsyncThunk(
  'restaurants/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/restaurants', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to fetch restaurants'
      );
    }
  }
);

export const fetchRestaurantById = createAsyncThunk(
  'restaurants/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/restaurants/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to fetch restaurant'
      );
    }
  }
);

export const createRestaurant = createAsyncThunk(
  'restaurants/create',
  async (restaurantData, { rejectWithValue }) => {
    try {
      const response = await api.post('/restaurants', restaurantData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to create restaurant'
      );
    }
  }
);

export const updateRestaurant = createAsyncThunk(
  'restaurants/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/restaurants/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to update restaurant'
      );
    }
  }
);

export const addMenuItem = createAsyncThunk(
  'restaurants/addMenuItem',
  async ({ restaurantId, menuItemData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/restaurants/${restaurantId}/menu`, menuItemData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to add menu item'
      );
    }
  }
);

export const updateMenuItem = createAsyncThunk(
  'restaurants/updateMenuItem',
  async ({ restaurantId, menuItemId, menuItemData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/restaurants/${restaurantId}/menu/${menuItemId}`, menuItemData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to update menu item'
      );
    }
  }
);

export const deleteMenuItem = createAsyncThunk(
  'restaurants/deleteMenuItem',
  async ({ restaurantId, menuItemId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/restaurants/${restaurantId}/menu/${menuItemId}`);
      return { restaurantId, menuItemId, response: response.data };
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to delete menu item'
      );
    }
  }
);

export const fetchRestaurantByOwnerId = createAsyncThunk(
  'restaurants/fetchByOwnerId',
  async (ownerId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/restaurants/owner/${ownerId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to fetch restaurant'
      );
    }
  }
);

const restaurantSlice = createSlice({
  name: 'restaurants',
  initialState: {
    restaurants: [],
    currentRestaurant: null,
    isLoading: false,
    error: null
  },
  reducers: {
    clearRestaurantError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all restaurants
      .addCase(fetchAllRestaurants.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllRestaurants.fulfilled, (state, action) => {
        state.isLoading = false;
        state.restaurants = action.payload.data.restaurants;
      })
      .addCase(fetchAllRestaurants.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch restaurant by ID
      .addCase(fetchRestaurantById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRestaurantById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRestaurant = action.payload.data.restaurant;
      })
      .addCase(fetchRestaurantById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create restaurant
      .addCase(createRestaurant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createRestaurant.fulfilled, (state, action) => {
        state.isLoading = false;
        state.restaurants.push(action.payload.data.restaurant);
        state.currentRestaurant = action.payload.data.restaurant;
      })
      .addCase(createRestaurant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update restaurant
      .addCase(updateRestaurant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateRestaurant.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update in restaurants list
        state.restaurants = state.restaurants.map(restaurant => 
          restaurant._id === action.payload.data.restaurant._id ? action.payload.data.restaurant : restaurant
        );
        // Update current restaurant if it's the same
        if (state.currentRestaurant && state.currentRestaurant._id === action.payload.data.restaurant._id) {
          state.currentRestaurant = action.payload.data.restaurant;
        }
      })
      .addCase(updateRestaurant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Add menu item
      .addCase(addMenuItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addMenuItem.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update menu in current restaurant
        if (state.currentRestaurant && state.currentRestaurant._id === action.payload.data.restaurantId) {
          state.currentRestaurant.menu.push(action.payload.data.menuItem);
        }
      })
      .addCase(addMenuItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update menu item
      .addCase(updateMenuItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMenuItem.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update menu item in current restaurant
        if (state.currentRestaurant && state.currentRestaurant._id === action.payload.data.restaurantId) {
          const menuIndex = state.currentRestaurant.menu.findIndex(
            item => item._id === action.payload.data.menuItem._id
          );
          if (menuIndex !== -1) {
            state.currentRestaurant.menu[menuIndex] = action.payload.data.menuItem;
          }
        }
      })
      .addCase(updateMenuItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Delete menu item
      .addCase(deleteMenuItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMenuItem.fulfilled, (state, action) => {
        state.isLoading = false;
        // Remove menu item from current restaurant
        if (state.currentRestaurant && state.currentRestaurant._id === action.payload.restaurantId) {
          state.currentRestaurant.menu = state.currentRestaurant.menu.filter(
            item => item._id !== action.payload.menuItemId
          );
        }
      })
      .addCase(deleteMenuItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch restaurant by owner ID
      .addCase(fetchRestaurantByOwnerId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRestaurantByOwnerId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRestaurant = action.payload.data.restaurant;
      })
      .addCase(fetchRestaurantByOwnerId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearRestaurantError } = restaurantSlice.actions;

export default restaurantSlice.reducer;
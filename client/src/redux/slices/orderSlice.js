import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as orderApi from '../../api/orderApi';

// Helper function to handle API errors consistently
const handleApiError = (error, defaultMessage) => {
  console.error(`Error: ${defaultMessage}`, error);
  return {
    message: error.message || defaultMessage,
    status: error.status
  };
};

export const createOrder = createAsyncThunk(
  'orders/create',
  async (orderData, { rejectWithValue }) => {
    try {
      console.log('Creating order with data:', orderData);
      const response = await orderApi.createOrder(orderData);
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to create order'));
    }
  }
);

export const fetchUserOrders = createAsyncThunk(
  'orders/fetchUserOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderApi.getUserOrders();
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to fetch orders'));
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await orderApi.getOrderById(id);
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to fetch order'));
    }
  }
);

export const fetchRestaurantOrders = createAsyncThunk(
  'orders/fetchRestaurantOrders',
  async (restaurantId, { rejectWithValue }) => {
    try {
      const response = await orderApi.getRestaurantOrders(restaurantId);
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to fetch restaurant orders'));
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await orderApi.updateOrderStatus(id, status);
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to update order status'));
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancel',
  async (id, { rejectWithValue }) => {
    try {
      const response = await orderApi.cancelOrder(id);
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to cancel order'));
    }
  }
);

// New thunks for additional functionality
export const fetchOrderStatistics = createAsyncThunk(
  'orders/fetchStatistics',
  async (restaurantId, { rejectWithValue }) => {
    try {
      const response = await orderApi.getOrderStatistics(restaurantId);
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to fetch order statistics'));
    }
  }
);

export const fetchOrdersByDateRange = createAsyncThunk(
  'orders/fetchByDateRange',
  async ({ startDate, endDate, restaurantId }, { rejectWithValue }) => {
    try {
      const response = await orderApi.getOrdersByDateRange(startDate, endDate, restaurantId);
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to fetch orders by date range'));
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    currentOrder: null,
    restaurantOrders: [],
    orderStatistics: null,
    dateRangeOrders: [],
    filters: {
      status: 'all',
      dateRange: null,
      searchQuery: ''
    },
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalOrders: 0
    },
    isLoading: false,
    error: null
  },
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    setOrderFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearOrderFilters: (state) => {
      state.filters = {
        status: 'all',
        dateRange: null,
        searchQuery: ''
      };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        const newOrder = action.payload.data.order;
        state.currentOrder = newOrder;
        // Add to orders array if it's a new order
        if (!state.orders.some(order => order._id === newOrder._id)) {
          state.orders.unshift(newOrder);
        }
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch user orders
      .addCase(fetchUserOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.data.orders;
        state.pagination = {
          ...state.pagination,
          totalOrders: action.payload.data.totalOrders || state.orders.length,
          totalPages: action.payload.data.totalPages || 1
        };
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload.data.order;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch restaurant orders
      .addCase(fetchRestaurantOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRestaurantOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.restaurantOrders = action.payload.data.orders;
        state.pagination = {
          ...state.pagination,
          totalOrders: action.payload.data.totalOrders || state.restaurantOrders.length,
          totalPages: action.payload.data.totalPages || 1
        };
      })
      .addCase(fetchRestaurantOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedOrder = action.payload.data.order;
        
        // Update current order if it's the same order
        if (state.currentOrder && state.currentOrder._id === updatedOrder._id) {
          state.currentOrder = updatedOrder;
        }
        
        // Update order in orders list
        state.orders = state.orders.map(order => 
          order._id === updatedOrder._id ? updatedOrder : order
        );
        
        // Update order in restaurant orders list
        state.restaurantOrders = state.restaurantOrders.map(order => 
          order._id === updatedOrder._id ? updatedOrder : order
        );
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Cancel order
      .addCase(cancelOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedOrder = action.payload.data.order;
        
        // Update current order if it's the same order
        if (state.currentOrder && state.currentOrder._id === updatedOrder._id) {
          state.currentOrder = updatedOrder;
        }
        
        // Update order in orders list
        state.orders = state.orders.map(order => 
          order._id === updatedOrder._id ? updatedOrder : order
        );
        
        // Update order in restaurant orders list if it exists
        state.restaurantOrders = state.restaurantOrders.map(order => 
          order._id === updatedOrder._id ? updatedOrder : order
        );
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch order statistics
      .addCase(fetchOrderStatistics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderStatistics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderStatistics = action.payload.data.statistics;
      })
      .addCase(fetchOrderStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch orders by date range
      .addCase(fetchOrdersByDateRange.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrdersByDateRange.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dateRangeOrders = action.payload.data.orders;
      })
      .addCase(fetchOrdersByDateRange.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  clearOrderError, 
  clearCurrentOrder, 
  setOrderFilters, 
  clearOrderFilters,
  setPagination 
} = orderSlice.actions;

export default orderSlice.reducer;
import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    restaurantId: null,
    restaurantName: null
  },
  reducers: {
    // Add item to cart
    addItem: (state, action) => {
      const { item, restaurantId, restaurantName } = action.payload;
      
      // If adding from a different restaurant, clear the cart first
      if (state.restaurantId && state.restaurantId !== restaurantId) {
        state.items = [];
      }
      
      // Set restaurant info
      state.restaurantId = restaurantId;
      state.restaurantName = restaurantName;
      
      // Check if item already exists
      const existingItemIndex = state.items.findIndex(
        cartItem => cartItem._id === item._id
      );
      
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        state.items[existingItemIndex].quantity += item.quantity;
      } else {
        // Add new item
        state.items.push(item);
      }
    },
    
    // Remove item from cart
    removeItem: (state, action) => {
      const itemId = action.payload;
      state.items = state.items.filter(item => item._id !== itemId);
      
      // Clear restaurant info if cart is empty
      if (state.items.length === 0) {
        state.restaurantId = null;
        state.restaurantName = null;
      }
    },
    
    // Update item quantity
    updateQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      
      const itemIndex = state.items.findIndex(item => item._id === itemId);
      
      if (itemIndex >= 0) {
        if (quantity > 0) {
          state.items[itemIndex].quantity = quantity;
        } else {
          // Remove item if quantity is 0 or less
          state.items = state.items.filter(item => item._id !== itemId);
          
          // Clear restaurant info if cart is empty
          if (state.items.length === 0) {
            state.restaurantId = null;
            state.restaurantName = null;
          }
        }
      }
    },
    
    // Clear cart
    clearCart: (state) => {
      state.items = [];
      state.restaurantId = null;
      state.restaurantName = null;
    }
  }
});

export const { addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions;

export default cartSlice.reducer;
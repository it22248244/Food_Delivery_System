import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import thunk from 'redux-thunk';

// Import reducers
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import uiReducer from './slices/uiSlice';
import restaurantReducer from './slices/restaurantSlice';
import orderReducer from './slices/orderSlice';
import deliveryReducer from './slices/deliverySlice';
import adminReducer from './slices/adminSlice';

// Configure persist options
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'cart'] // only persist these reducers
};

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  ui: uiReducer,
  restaurant: restaurantReducer,
  order: orderReducer,
  delivery: deliveryReducer,
  admin: adminReducer
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
const store = configureStore({
  reducer: persistedReducer,
  middleware: [thunk],
  devTools: process.env.NODE_ENV !== 'production'
});

// Create persistor
const persistor = persistStore(store);

export { store, persistor };
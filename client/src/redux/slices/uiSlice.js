import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    isMobileMenuOpen: false,
    isLoading: false,
    globalError: null,
    theme: 'light'
  },
  reducers: {
    // Toggle mobile menu
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    
    // Close mobile menu
    closeMobileMenu: (state) => {
      state.isMobileMenuOpen = false;
    },
    
    // Set loading state
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    
    // Set global error
    setGlobalError: (state, action) => {
      state.globalError = action.payload;
    },
    
    // Clear global error
    clearGlobalError: (state) => {
      state.globalError = null;
    },
    
    // Set theme
    setTheme: (state, action) => {
      state.theme = action.payload;
      // Save theme to localStorage
      localStorage.setItem('theme', action.payload);
    }
  }
});

export const {
  toggleMobileMenu,
  closeMobileMenu,
  setLoading,
  setGlobalError,
  clearGlobalError,
  setTheme
} = uiSlice.actions;

export default uiSlice.reducer;
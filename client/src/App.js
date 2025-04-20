import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '././redux/store';
import { getCurrentUser } from './redux/slices/authSlice';
import AppRoutes from './router';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  useEffect(() => {
    // Check if there's a token in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // Dispatch getCurrentUser action to fetch user data
      store.dispatch(getCurrentUser());
    }
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <div className="app-container">
            <Navbar />
            <main className="main-content">
              <AppRoutes />
            </main>
            <Footer />
            <ToastContainer position="bottom-right" autoClose={5000} />
          </div>
        </Router>
      </PersistGate>
    </Provider>
  );
}

export default App;
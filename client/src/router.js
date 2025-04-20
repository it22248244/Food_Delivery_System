import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Auth pages
import Login from './pages/auth/LoginPage';
import Register from './pages/auth/RegisterPage';

// Payment pages
import FakeStripePayment from './pages/payment/FakeStripePayment';
import PaymentStatus from './pages/payment/PaymentStatus';

// Customer pages
import Home from './pages/common/HomePage';
import Restaurants from './pages/common/Restaurants';
import RestaurantDetail from './pages/customer/RestaurantDetail';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import OrderHistory from './pages/customer/OrderHistory';
import CustomerOrderDetail from './pages/customer/OrderDetail';
import Profile from './pages/customer/Profile';

// Restaurant owner pages
import RestaurantDashboard from './pages/restaurant/Dashboard';
import RestaurantMenu from './pages/restaurant/Menu';
import RestaurantOrders from './pages/restaurant/Orders';
import RestaurantOrderDetail from './pages/restaurant/OrderDetail';
import RestaurantProfile from './pages/restaurant/Profile';
import RestaurantForm from './components/restaurant/RestaurantForm';

// Delivery person pages
import DeliveryDashboard from './pages/delivery/Dashboard';
import DeliveryHistory from './pages/delivery/History';
import DeliveryProfile from './pages/delivery/Profile';
import DeliveryOrderDetail from './pages/delivery/OrderDetail';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import RestaurantVerification from './pages/admin/RestaurantVerification';
import AdminFinancial from './pages/admin/AdminFinancial';


// Protected route wrapper
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect based on role
    if (user.role === 'customer') {
      return <Navigate to="/" replace />;
    } else if (user.role === 'restaurant') {
      return <Navigate to="/restaurant/dashboard" replace />;
    } else if (user.role === 'delivery') {
      return <Navigate to="/delivery/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Customer routes */}
      <Route path="/" element={<Home />} />
      <Route path="/restaurants" element={<Restaurants />} />
      <Route path="/restaurants/:id" element={<RestaurantDetail />} />
      <Route path="/cart" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <Cart />
        </ProtectedRoute>
      } />
      <Route path="/checkout" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <Checkout />
        </ProtectedRoute>
      } />
      <Route path="/orders" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <OrderHistory />
        </ProtectedRoute>
      } />
      <Route path="/orders/:id" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <CustomerOrderDetail />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      
      {/* Payment routes */}
      <Route path="/payment/checkout" element={<FakeStripePayment />} />
      <Route path="/payment/success" element={<PaymentStatus />} />
      <Route path="/payment/cancel" element={<PaymentStatus />} />
      <Route path="/payment/status" element={<PaymentStatus />} />
      
      {/* Restaurant owner routes */}
      <Route path="/restaurant/dashboard" element={
        <ProtectedRoute allowedRoles={['restaurant']}>
          <RestaurantDashboard />
        </ProtectedRoute>
      } />
      <Route path="/restaurant/menu" element={
        <ProtectedRoute allowedRoles={['restaurant']}>
          <RestaurantMenu />
        </ProtectedRoute>
      } />
      <Route path="/restaurant/orders" element={
        <ProtectedRoute allowedRoles={['restaurant']}>
          <RestaurantOrders />
        </ProtectedRoute>
      } />
      <Route path="/restaurant/orders/:id" element={
        <ProtectedRoute allowedRoles={['restaurant']}>
          <RestaurantOrderDetail />
        </ProtectedRoute>
      } />
      <Route path="/restaurant/profile" element={
        <ProtectedRoute allowedRoles={['restaurant']}>
          <RestaurantProfile />
        </ProtectedRoute>
      } />
      <Route path="/restaurant/create" element={
        <ProtectedRoute allowedRoles={['restaurant']}>
          <RestaurantForm />
        </ProtectedRoute>
      } />
      <Route path="/restaurant/edit/:id" element={
        <ProtectedRoute allowedRoles={['restaurant']}>
          <RestaurantForm />
        </ProtectedRoute>
      } />
      
      {/* Delivery person routes */}
      <Route path="/delivery/dashboard" element={
        <ProtectedRoute allowedRoles={['delivery']}>
          <DeliveryDashboard />
        </ProtectedRoute>
      } />
      <Route path="/delivery/history" element={
        <ProtectedRoute allowedRoles={['delivery']}>
          <DeliveryHistory />
        </ProtectedRoute>
      } />
      <Route path="/delivery/profile" element={
        <ProtectedRoute allowedRoles={['delivery']}>
          <DeliveryProfile />
        </ProtectedRoute>
      } />
      <Route path="/delivery/orders/:id" element={
        <ProtectedRoute allowedRoles={['delivery']}>
          <DeliveryOrderDetail />
        </ProtectedRoute>
      } />
      
      {/* Admin routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminUsers />
        </ProtectedRoute>
      } />
      <Route path="/admin/restaurants" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <RestaurantVerification />
        </ProtectedRoute>
      } />
      <Route path="/admin/financial" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminFinancial />
        </ProtectedRoute>
      } />
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />

      
    </Routes>
  );
};

export default AppRoutes;
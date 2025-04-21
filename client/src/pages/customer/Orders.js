import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaSearch, FaMotorcycle, FaCheck, FaTimes, FaFilter, FaClock, FaMapMarkerAlt, FaUtensils } from 'react-icons/fa';
import apiService from '../../utils/api';
import useApi from '../../hooks/useApi';
import './Orders.css';

const Orders = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const { loading, error } = useApi();
  
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTime, setSelectedTime] = useState('all');
  
  // Status options
  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'active', label: 'Active Orders' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];
  
  // Time filter options
  const timeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ];
  
  // Fetch user's orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) {
        return;
      }
      
      try {
        const ordersData = await apiService.orders.getUserOrders();
        setOrders(ordersData.data.orders || []);
        setFilteredOrders(ordersData.data.orders || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
      }
    };
    
    fetchOrders();
  }, [isAuthenticated]);
  
  // Filter and sort orders
  useEffect(() => {
    let filtered = [...orders];
    
    // Apply status filter
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'active') {
        filtered = filtered.filter(order => 
          ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery'].includes(order.status)
        );
      } else {
        filtered = filtered.filter(order => order.status === selectedStatus);
      }
    }
    
    // Apply time filter
    const now = new Date();
    if (selectedTime !== 'all') {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        switch (selectedTime) {
          case 'today':
            return orderDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.setDate(now.getDate() - 7));
            return orderDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
            return orderDate >= monthAgo;
          default:
            return true;
        }
      });
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order._id.toLowerCase().includes(query) ||
        order.restaurantName.toLowerCase().includes(query)
      );
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    setFilteredOrders(filtered);
  }, [orders, selectedStatus, selectedTime, searchQuery]);
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get status class and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case 'delivered':
        return { class: 'delivered', icon: <FaCheck />, label: 'Delivered' };
      case 'cancelled':
        return { class: 'cancelled', icon: <FaTimes />, label: 'Cancelled' };
      case 'out_for_delivery':
        return { class: 'active', icon: <FaMotorcycle />, label: 'Out for Delivery' };
      case 'ready_for_pickup':
        return { class: 'active', icon: <FaUtensils />, label: 'Ready for Pickup' };
      case 'preparing':
        return { class: 'active', icon: <FaUtensils />, label: 'Preparing' };
      case 'confirmed':
        return { class: 'active', icon: <FaCheck />, label: 'Confirmed' };
      case 'pending':
        return { class: 'active', icon: <FaClock />, label: 'Pending' };
      default:
        return { class: '', icon: null, label: status };
    }
  };
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled in the useEffect
  };
  
  if (!isAuthenticated) {
    return (
      <div className="orders-page">
        <div className="auth-required">
          <h2>Please log in to view your orders</h2>
          <button onClick={() => navigate('/login')} className="login-button">
            Log In
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>My Orders</h1>
        <p>Track and manage your food orders</p>
      </div>
      
      <div className="orders-filters">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search orders by ID or restaurant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </form>
        
        <div className="filters-container">
          <div className="filter-group">
            <label htmlFor="status-filter">Order Status</label>
            <select
              id="status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="filter-select"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="time-filter">Time Period</label>
            <select
              id="time-filter"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="filter-select"
            >
              {timeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-spinner">Loading your orders...</div>
      ) : error ? (
        <div className="error-message">
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Try Again
          </button>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="orders-grid">
          {filteredOrders.map(order => {
            const statusInfo = getStatusInfo(order.status);
            
            return (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-meta">
                    <h3>Order #{order._id.substring(order._id.length - 6)}</h3>
                    <span className="order-date">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className={`order-status ${statusInfo.class}`}>
                    {statusInfo.icon}
                    <span>{statusInfo.label}</span>
                  </div>
                </div>
                
                <div className="order-restaurant">
                  <h4>{order.restaurantName}</h4>
                  <span className="restaurant-address">
                    <FaMapMarkerAlt /> {order.restaurantAddress}
                  </span>
                </div>
                
                <div className="order-items">
                  {order.items.slice(0, 2).map((item, index) => (
                    <div key={index} className="order-item">
                      <span className="item-quantity">{item.quantity}x</span>
                      <span className="item-name">{item.name}</span>
                      <span className="item-price">Rs. {item.price.toFixed(2)}</span>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <div className="more-items">
                      +{order.items.length - 2} more items
                    </div>
                  )}
                </div>
                
                <div className="order-footer">
                  <div className="order-total">
                    Total: Rs. {order.totalAmount.toFixed(2)}
                  </div>
                  
                  <Link 
                    to={`/orders/${order._id}`} 
                    className="view-details-button"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="no-orders">
          <div className="no-orders-icon">
            <FaMotorcycle />
          </div>
          <h3>No orders found</h3>
          <p>
            {searchQuery
              ? "No orders match your search criteria"
              : "You haven't placed any orders yet"}
          </p>
          {searchQuery && (
            <button
              className="clear-filters-button"
              onClick={() => {
                setSearchQuery('');
                setSelectedStatus('all');
                setSelectedTime('all');
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Orders; 
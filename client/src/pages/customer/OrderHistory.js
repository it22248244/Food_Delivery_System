import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter, FaClock, FaCheckCircle, FaTimesCircle, FaTruck } from 'react-icons/fa';
import { fetchUserOrders } from '../../redux/slices/orderSlice';
import { formatDate } from '../../utils/dateUtils';
import './OrderHistory.css';

const OrderHistory = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { orders, isLoading, error } = useSelector((state) => state.order);
  
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTime, setSelectedTime] = useState('all');

  // Fetch orders when component mounts
  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(fetchUserOrders());
    } else {
      navigate('/login');
    }
  }, [dispatch, isAuthenticated, user, navigate]);

  // Filter orders when filters or search query changes
  useEffect(() => {
    let filtered = [...orders];

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    // Filter by time period
    if (selectedTime !== 'all') {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
      const ninetyDaysAgo = new Date(now.setDate(now.getDate() - 90));

      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        switch (selectedTime) {
          case 'last30':
            return orderDate >= thirtyDaysAgo;
          case 'last90':
            return orderDate >= ninetyDaysAgo;
          default:
            return true;
        }
      });
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.restaurantName?.toLowerCase().includes(query) ||
        order.orderNumber?.toLowerCase().includes(query) ||
        order._id?.toLowerCase().includes(query)
      );
    }

    setFilteredOrders(filtered);
  }, [orders, searchQuery, selectedStatus, selectedTime]);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { className: 'status-pending', icon: <FaClock />, text: 'Pending' };
      case 'confirmed':
        return { className: 'status-confirmed', icon: <FaCheckCircle />, text: 'Confirmed' };
      case 'preparing':
        return { className: 'status-preparing', icon: <FaClock />, text: 'Preparing' };
      case 'ready_for_pickup':
        return { className: 'status-ready', icon: <FaCheckCircle />, text: 'Ready for Pickup' };
      case 'out_for_delivery':
        return { className: 'status-delivery', icon: <FaTruck />, text: 'Out for Delivery' };
      case 'delivered':
        return { className: 'status-delivered', icon: <FaCheckCircle />, text: 'Delivered' };
      case 'cancelled':
        return { className: 'status-cancelled', icon: <FaTimesCircle />, text: 'Cancelled' };
      default:
        return { className: 'status-default', icon: null, text: status };
    }
  };

  if (isLoading) {
    return (
      <div className="order-history-page">
        <div className="loading-spinner">Loading orders...</div>
      </div>
    );
  }
  
  return (
    <div className="order-history-page">
      <div className="order-history-container">
        <div className="order-history-header">
          <h1>Order History</h1>
          <p>View and track your past orders</p>
        </div>
      
        <div className="order-filters">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by restaurant or order number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <div className="filter-item">
              <FaFilter className="filter-icon" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="ready_for_pickup">Ready for Pickup</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="filter-item">
              <FaClock className="filter-icon" />
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="last30">Last 30 Days</option>
                <option value="last90">Last 90 Days</option>
              </select>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="error-message">
            <p>{error.message || 'Failed to load your orders. Please try again.'}</p>
            <button onClick={() => dispatch(fetchUserOrders())} className="retry-button">
              Try Again
            </button>
          </div>
        )}
        
        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <h3>No orders found</h3>
            <p>Try adjusting your filters or search query</p>
            {orders.length > 0 && (
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
        ) : (
          <div className="orders-grid">
            {filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              return (
                <div
                  key={order._id}
                  className="order-card"
                  onClick={() => navigate(`/orders/${order._id}`)}
                >
                  <div className="order-header">
                    <div className="order-info">
                      <h3>{order.restaurantName}</h3>
                      <p className="order-number">Order #{order._id.slice(-6)}</p>
                    </div>
                    <div className={`status-badge ${statusInfo.className}`}>
                      {statusInfo.icon}
                      <span>{statusInfo.text}</span>
                    </div>
                  </div>
                
                  <div className="order-details">
                    <div className="detail-item">
                      <span className="label">Date:</span>
                      <span className="value">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Items:</span>
                      <span className="value">{order.items.length}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Total:</span>
                      <span className="value">Rs. {order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="order-actions">
                    <button
                      className="view-details-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/orders/${order._id}`);
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
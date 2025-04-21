import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaSearch, FaFilter, FaClock, FaCheck, FaTimes, FaUtensils, FaMotorcycle } from 'react-icons/fa';
import { fetchRestaurantOrders, updateOrderStatus } from '../../redux/slices/orderSlice';
import { toast } from 'react-toastify';
import axios from 'axios';
import './Orders.css';

const RestaurantOrders = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated, token } = useSelector((state) => state.auth);
  const { restaurantOrders, isLoading, error } = useSelector((state) => state.order);
  const { currentRestaurant } = useSelector((state) => state.restaurant);
  
  // State variables
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [availableDeliveryPersons, setAvailableDeliveryPersons] = useState([]);
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState('');
  const [isLoadingDeliveryPersons, setIsLoadingDeliveryPersons] = useState(false);
  
  // Fetch restaurant orders
  useEffect(() => {
    if (isAuthenticated && user && user.role === 'restaurant' && currentRestaurant) {
      console.log('Fetching orders for restaurant:', currentRestaurant._id);
      dispatch(fetchRestaurantOrders(currentRestaurant._id));
    } else if (!isAuthenticated) {
      navigate('/login');
    } else if (user && user.role !== 'restaurant') {
      navigate('/');
    }
  }, [dispatch, isAuthenticated, user, currentRestaurant, navigate]);
  
  // Filter orders based on filters and search
  useEffect(() => {
    if (restaurantOrders) {
      let filtered = [...restaurantOrders];
      
      // Filter by status
      if (statusFilter !== 'all') {
        filtered = filtered.filter(order => {
          if (statusFilter === 'active') {
            return ['pending', 'confirmed', 'preparing', 'ready_for_pickup'].includes(order.status);
          } else {
            return order.status === statusFilter;
          }
        });
      }
      
      // Filter by date
      if (dateFilter !== 'all') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        filtered = filtered.filter(order => {
          const orderDate = new Date(order.createdAt);
          
          if (dateFilter === 'today') {
            return orderDate >= today;
          } else if (dateFilter === 'yesterday') {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return orderDate >= yesterday && orderDate < today;
          } else if (dateFilter === 'week') {
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return orderDate >= weekAgo;
          } else if (dateFilter === 'month') {
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return orderDate >= monthAgo;
          }
          
          return true;
        });
      }
      
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(order => 
          order._id.toLowerCase().includes(searchLower) ||
          (order.customer?.name && order.customer.name.toLowerCase().includes(searchLower)) ||
          (order.customer?.phone && order.customer.phone.includes(searchTerm)) ||
          order.items.some(item => item.name.toLowerCase().includes(searchLower))
        );
      }
      
      // Sort by date (newest first)
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setFilteredOrders(filtered);
    }
  }, [restaurantOrders, statusFilter, dateFilter, searchTerm]);
  
  // Format date and time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };
  };
  
  // Format address object to string
  const formatAddress = (address) => {
    if (!address) return 'No address provided';
    if (typeof address === 'string') return address;
    
    const { street, city, state, zipCode } = address;
    return `${street}, ${city}, ${state} ${zipCode}`;
  };
  
  // Status labels and classes for display
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { class: 'pending', label: 'Pending', icon: <FaClock /> };
      case 'confirmed':
        return { class: 'confirmed', label: 'Confirmed', icon: <FaCheck /> };
      case 'preparing':
        return { class: 'preparing', label: 'Preparing', icon: <FaUtensils /> };
      case 'ready_for_pickup':
        return { class: 'ready', label: 'Ready for Pickup', icon: <FaCheck /> };
      case 'out_for_delivery':
        return { class: 'delivery', label: 'Out for Delivery', icon: <FaCheck /> };
      case 'delivered':
        return { class: 'delivered', label: 'Delivered', icon: <FaCheck /> };
      case 'cancelled':
        return { class: 'cancelled', label: 'Cancelled', icon: <FaTimes /> };
      default:
        return { class: '', label: status, icon: null };
    }
  };
  
  // Get next available status
  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['preparing', 'cancelled'],
      'preparing': ['ready_for_pickup', 'cancelled'],
      'ready_for_pickup': ['out_for_delivery', 'cancelled'],
      'out_for_delivery': ['delivered', 'cancelled']
    };
    
    return statusFlow[currentStatus] || [];
  };
  
  // Fetch available delivery personnel
  const fetchAvailableDeliveryPersons = async () => {
    setIsLoadingDeliveryPersons(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_DELIVERY_SERVICE_URL}/deliveries/personnel/available`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAvailableDeliveryPersons(response.data.data.deliveryPersons || []);
    } catch (error) {
      console.error('Error fetching delivery personnel:', error);
      toast.error('Failed to fetch available delivery personnel');
    } finally {
      setIsLoadingDeliveryPersons(false);
    }
  };
  
  // Handle order status update with delivery person selection
  const handleUpdateStatus = async (orderId, newStatus) => {
    if (isUpdating) return;

    if (newStatus === 'out_for_delivery') {
      setSelectedOrder(orderId);
      await fetchAvailableDeliveryPersons();
      setShowDeliveryModal(true);
      return;
    }

    try {
      setIsUpdating(true);
      await dispatch(updateOrderStatus({ id: orderId, status: newStatus })).unwrap();
      toast.success(`Order status updated to ${newStatus.replace(/_/g, ' ')}`);
    } catch (error) {
      toast.error(error.message || 'Failed to update order status');
      console.error('Error updating order status:', error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Handle delivery person assignment
  const handleDeliveryAssignment = async () => {
    if (!selectedDeliveryPerson) {
      toast.error('Please select a delivery person');
      return;
    }

    try {
      setIsUpdating(true);
      
      // First assign the delivery person
      await axios.post(
        `${process.env.REACT_APP_DELIVERY_SERVICE_URL}/deliveries/assign`,
        {
          orderId: selectedOrder,
          restaurantId: currentRestaurant._id,
          deliveryPersonId: selectedDeliveryPerson
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Then update the order status
      await dispatch(updateOrderStatus({ id: selectedOrder, status: 'out_for_delivery' })).unwrap();
      
      toast.success('Order assigned to delivery person and status updated');
      setShowDeliveryModal(false);
      setSelectedDeliveryPerson('');
      setSelectedOrder(null);
    } catch (error) {
      toast.error(error.message || 'Failed to assign delivery person');
      console.error('Error assigning delivery person:', error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Calculate total items in an order
  const calculateTotalItems = (items) => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };
  
  // If not authenticated or not a restaurant owner, redirect
  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }
  
  // If no restaurant data, show message
  if (user?.role === 'restaurant' && !currentRestaurant) {
    return (
      <div className="orders-page">
        <div className="no-restaurant-message">
          <h2>No Restaurant Found</h2>
          <p>You need to create a restaurant profile first.</p>
          <Link to="/restaurant/create" className="create-restaurant-button">
            Create Restaurant
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>Order Management</h1>
        <p>Manage and track your restaurant orders efficiently</p>
      </div>
      
      <div className="orders-filters">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search orders by ID, customer, or items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="status-filter">
              <FaFilter /> Filter by Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="ready_for_pickup">Ready for Pickup</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="date-filter">
              <FaClock /> Filter by Date
            </label>
            <select
              id="date-filter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading orders...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <h3>Error Loading Orders</h3>
          <p>{error.message || 'An error occurred while loading orders'}</p>
          <button 
            onClick={() => dispatch(fetchRestaurantOrders(currentRestaurant._id))}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="orders-grid">
          {filteredOrders.map(order => {
            const { date, time } = formatDateTime(order.createdAt);
            const statusInfo = getStatusInfo(order.status);
            const totalItems = calculateTotalItems(order.items);
            
            return (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order #{order._id.slice(-6)}</h3>
                    <div className="order-meta">
                      <span>{date}</span>
                      <span>{time}</span>
                    </div>
                  </div>
                  <div className={`status-badge ${statusInfo.class}`}>
                    {statusInfo.icon}
                    <span>{statusInfo.label}</span>
                  </div>
                </div>
                
                <div className="customer-details">
                  <h4>Customer Information</h4>
                  <p className="customer-name">{order.customer?.name || 'Anonymous'}</p>
                  <p className="customer-phone">{order.customer?.phone || 'No Phone'}</p>
                  {order.customer?.address && (
                    <p className="customer-address">{formatAddress(order.customer.address)}</p>
                  )}
                </div>
                
                <div className="order-summary">
                  <div className="summary-item">
                    <span className="label">Total Items</span>
                    <span className="value">{totalItems}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Total Amount</span>
                    <span className="value">Rs. {order.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Payment Method</span>
                    <span className="value">
                      {order.paymentMethod === 'cash' ? 'Cash on Delivery' : 'Online Payment'}
                    </span>
                  </div>
                </div>
                
                <div className="order-items">
                  <h4>Order Items</h4>
                  <ul className="items-list">
                    {order.items.slice(0, 3).map((item, index) => (
                      <li key={index} className="item">
                        <span className="quantity">{item.quantity}x</span>
                        <span className="name">{item.name}</span>
                      </li>
                    ))}
                    {order.items.length > 3 && (
                      <li className="more-items">
                        +{order.items.length - 3} more items
                      </li>
                    )}
                  </ul>
                </div>
                
                <div className="order-actions">
                  <Link
                    to={`/restaurant/orders/${order._id}`}
                    className="view-details-button"
                  >
                    View Details
                  </Link>
                  
                  {getNextStatus(order.status).length > 0 && (
                    <select
                      className="status-update-select"
                      onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                      disabled={isUpdating}
                      value=""
                    >
                      <option value="" disabled>Update Status</option>
                      {getNextStatus(order.status).map((status) => (
                        <option key={status} value={status}>
                          {status.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="no-orders-message">
          <h3>No Orders Found</h3>
          <p>
            {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
              ? "No orders match your search filters."
              : "You don't have any orders yet."}
          </p>
          {(searchTerm || statusFilter !== 'all' || dateFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setDateFilter('all');
              }}
              className="clear-filters-button"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Delivery Person Selection Modal */}
      {showDeliveryModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Select Delivery Person</h3>
            {isLoadingDeliveryPersons ? (
              <div className="loading-spinner">Loading available delivery personnel...</div>
            ) : availableDeliveryPersons.length > 0 ? (
              <>
                <div className="delivery-persons-list">
                  {availableDeliveryPersons.map(person => (
                    <div
                      key={person._id}
                      className={`delivery-person-card ${selectedDeliveryPerson === person._id ? 'selected' : ''}`}
                      onClick={() => setSelectedDeliveryPerson(person._id)}
                    >
                      <div className="delivery-person-info">
                        <h4>{person.name}</h4>
                        <p><FaMotorcycle /> {person.vehicleType} - {person.vehicleNumber}</p>
                        <p>Rating: {person.rating || 'N/A'}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="modal-actions">
                  <button
                    className="cancel-button"
                    onClick={() => {
                      setShowDeliveryModal(false);
                      setSelectedDeliveryPerson('');
                      setSelectedOrder(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="confirm-button"
                    onClick={handleDeliveryAssignment}
                    disabled={!selectedDeliveryPerson || isUpdating}
                  >
                    {isUpdating ? 'Assigning...' : 'Assign & Update Status'}
                  </button>
                </div>
              </>
            ) : (
              <div className="no-delivery-persons">
                <p>No delivery personnel available at the moment.</p>
                <button
                  className="cancel-button"
                  onClick={() => {
                    setShowDeliveryModal(false);
                    setSelectedDeliveryPerson('');
                    setSelectedOrder(null);
                  }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantOrders;
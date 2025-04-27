import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FaHistory, 
  FaCalendarAlt, 
  FaFilter, 
  FaStar, 
  FaMapMarkerAlt, 
  FaClock, 
  FaCheckCircle,
  FaChevronRight
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { getMyDeliveries } from '../../api/deliveryApi';
import './History.css';

const DeliveryHistory = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, token } = useSelector(state => state.auth);
  
  // State variables
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    status: 'all'
  });
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Check if user has delivery role
    if (user && user.role !== 'delivery') {
      toast.error('Access denied. Only delivery personnel can access this page.');
      navigate('/');
      return;
    }
    
    fetchDeliveryHistory();
  }, [isAuthenticated, user, navigate, token]);
  
  const fetchDeliveryHistory = async () => {
    setLoading(true);
    try {
      // Get all deliveries assigned to this delivery person
      const response = await getMyDeliveries();
      const allDeliveries = response.data.deliveries || [];
      
      // Sort by date (newest first)
      allDeliveries.sort((a, b) => new Date(b.assignedAt) - new Date(a.assignedAt));
      
      // Enhance deliveries with additional data
      const enhancedDeliveries = await Promise.all(
        allDeliveries.map(async (delivery) => {
          try {
            // Get order details
            const orderResponse = await axios.get(
              `${process.env.REACT_APP_ORDER_SERVICE_URL}/orders/${delivery.orderId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            const order = orderResponse.data.data.order;
            
            // Get restaurant details
            const restaurantResponse = await axios.get(
              `${process.env.REACT_APP_RESTAURANT_SERVICE_URL}/restaurants/${delivery.restaurantId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            const restaurant = restaurantResponse.data.data.restaurant;
            
            // Return enhanced delivery object
            return {
              id: delivery._id,
              orderId: delivery.orderId,
              orderNumber: delivery.orderId.substring(delivery.orderId.length - 6),
              date: new Date(delivery.assignedAt),
              customerName: order.customerName || 'Customer',
              customer: {
                address: delivery.deliveryAddress 
                  ? `${delivery.deliveryAddress.street}, ${delivery.deliveryAddress.city}, ${delivery.deliveryAddress.state} ${delivery.deliveryAddress.zipCode}`
                  : 'Address not available'
              },
              restaurant: {
                name: restaurant.name,
                address: restaurant.address 
                  ? `${restaurant.address.street}, ${restaurant.address.city}, ${restaurant.address.state} ${restaurant.address.zipCode}`
                  : 'Address not available'
              },
              items: order.items || [],
              total: order.totalAmount,
              status: delivery.status,
              assignedAt: delivery.assignedAt,
              pickedUpAt: delivery.pickedUpAt,
              deliveredAt: delivery.deliveredAt,
              rating: delivery.rating,
              feedback: delivery.feedback,
              earnings: 150 // Assuming LKR 150 per delivery
            };
          } catch (error) {
            console.error('Error fetching delivery details:', error);
            // Return basic delivery data if error occurs
            return {
              id: delivery._id,
              orderId: delivery.orderId,
              orderNumber: delivery.orderId.substring(delivery.orderId.length - 6),
              date: new Date(delivery.assignedAt),
              status: delivery.status,
              assignedAt: delivery.assignedAt,
              pickedUpAt: delivery.pickedUpAt,
              deliveredAt: delivery.deliveredAt,
              rating: delivery.rating
            };
          }
        })
      );
      
      setDeliveries(enhancedDeliveries);
      applyFilters(enhancedDeliveries, filters);
    } catch (error) {
      console.error('Error fetching delivery history:', error);
      toast.error('Failed to load delivery history');
      
      // Fallback to empty array if API fails
      setDeliveries([]);
      setFilteredDeliveries([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Apply filters to deliveries
  const applyFilters = (deliveryList, currentFilters) => {
    let filtered = [...deliveryList];
    
    // Filter by status
    if (currentFilters.status !== 'all') {
      filtered = filtered.filter(delivery => delivery.status === currentFilters.status);
    }
    
    // Filter by date range
    if (currentFilters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0));
      
      if (currentFilters.dateRange === 'today') {
        filtered = filtered.filter(delivery => {
          const deliveryDate = new Date(delivery.date);
          deliveryDate.setHours(0, 0, 0, 0);
          return deliveryDate.getTime() === today.getTime();
        });
      } else if (currentFilters.dateRange === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        filtered = filtered.filter(delivery => {
          return new Date(delivery.date) >= weekAgo;
        });
      } else if (currentFilters.dateRange === 'month') {
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        
        filtered = filtered.filter(delivery => {
          return new Date(delivery.date) >= monthAgo;
        });
      }
    }
    
    setFilteredDeliveries(filtered);
  };
  
  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    const newFilters = {
      ...filters,
      [filterType]: value
    };
    
    setFilters(newFilters);
    applyFilters(deliveries, newFilters);
  };
  
  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format time
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };
  
  // Get status class
  const getStatusClass = (status) => {
    switch (status) {
      case 'assigned':
        return 'assigned';
      case 'picked_up':
        return 'picked-up';
      case 'in_transit':
        return 'in-transit';
      case 'delivered':
        return 'delivered';
      default:
        return '';
    }
  };
  
  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }
  
  if (loading) {
    return (
      <div className="history-page">
        <div className="loading-spinner">Loading delivery history...</div>
      </div>
    );
  }
  
  return (
    <div className="history-page">
      <div className="history-header">
        <h1>Delivery History</h1>
        <div className="filters">
          <div className="filter-group">
            <label htmlFor="dateRange">
              <FaCalendarAlt /> Date Range
            </label>
            <select
              id="dateRange"
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="status">
              <FaFilter /> Status
            </label>
            <select
              id="status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="delivered">Delivered</option>
              <option value="assigned">Assigned</option>
              <option value="picked_up">Picked Up</option>
            </select>
          </div>
        </div>
      </div>

      <div className="deliveries-list">
        {filteredDeliveries.length > 0 ? (
          filteredDeliveries.map(delivery => (
            <div key={delivery.id} className="delivery-card">
              <div className="delivery-header">
                <div className="delivery-info">
                  <h3>Order #{delivery.orderNumber}</h3>
                  <div className="delivery-meta">
                    <span className="date">{formatDate(delivery.date)}</span>
                    <span className="time">{formatTime(delivery.date)}</span>
                  </div>
                </div>
                <div className="delivery-status">
                  <span className={`status-badge ${getStatusClass(delivery.status)}`}>
                    {delivery.status.replace('_', ' ')}
                  </span>
                  {delivery.rating && (
                    <div className="rating">
                      <FaStar className="star-icon" />
                      <span>{delivery.rating}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="delivery-content">
                <div className="content-section">
                  <div className="location-item">
                    <FaMapMarkerAlt className="location-icon" />
                    <div className="location-content">
                      <h4>Pickup</h4>
                      <p>{delivery.restaurant?.name}</p>
                    </div>
                  </div>
                  <div className="location-item">
                    <FaMapMarkerAlt className="location-icon" />
                    <div className="location-content">
                      <h4>Delivery</h4>
                      <p>{delivery.customerName}</p>
                    </div>
                  </div>
                </div>
                
                <div className="content-section">
                  <div className="time-item">
                    <FaClock className="time-icon" />
                    <div className="time-content">
                      <h4>Delivery Time</h4>
                      <p>
                        {delivery.deliveredAt ? 
                          `${formatTime(delivery.assignedAt)} - ${formatTime(delivery.deliveredAt)}` : 
                          'Not completed'}
                      </p>
                    </div>
                  </div>
                  <div className="earnings-item">
                    <h4>Earnings</h4>
                    <p className="earnings-value">Rs. {delivery.earnings || 0}</p>
                  </div>
                </div>
                
                {delivery.feedback && (
                  <div className="feedback-section">
                    <h4>Feedback</h4>
                    <p>{delivery.feedback}</p>
                  </div>
                )}
              </div>
              
              <div className="delivery-footer">
                <button 
                  className="view-details-button"
                  onClick={() => navigate(`/delivery/orders/${delivery.orderId}`)}
                >
                  View Order Details <FaChevronRight />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-deliveries">
            <FaHistory className="no-deliveries-icon" />
            <h3>No Deliveries Found</h3>
            <p>No deliveries match your current filters.</p>
            {filters.dateRange !== 'all' || filters.status !== 'all' ? (
              <button 
                className="clear-filters-button"
                onClick={() => {
                  const resetFilters = { dateRange: 'all', status: 'all' };
                  setFilters(resetFilters);
                  applyFilters(deliveries, resetFilters);
                }}
              >
                Clear Filters
              </button>
            ) : (
              <p>You haven't completed any deliveries yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryHistory;
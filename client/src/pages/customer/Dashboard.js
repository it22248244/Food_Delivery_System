import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUtensils, FaClipboardList, FaMoneyBillWave, FaArrowUp, FaArrowDown, FaRegClock } from 'react-icons/fa';
import apiService from '../../utils/api';
import { toast } from 'react-toastify';

const Dashboard = () => {
  // State variables
  const [restaurant, setRestaurant] = useState(null);
  const [stats, setStats] = useState({
    todayOrders: 0,
    pendingOrders: 0,
    todayRevenue: 0,
    comparedToYesterday: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [popularItems, setPopularItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // In a real app, this would be fetched from the API
        // For now, we'll use dummy data
        
        // Fetch restaurant data
        setRestaurant({
          _id: 'rest123',
          name: 'My Restaurant',
          cuisine: 'Italian',
          isOpen: true,
          rating: 4.8,
          totalOrders: 528,
          totalRevenue: 15842.50
        });
        
        // Set dashboard stats
        setStats({
          todayOrders: 24,
          pendingOrders: 5,
          todayRevenue: 780.45,
          comparedToYesterday: 15 // percent
        });
        
        // Set recent orders
        setRecentOrders([
          {
            _id: 'order1',
            orderNumber: '12345',
            customer: 'John Doe',
            status: 'pending',
            total: 42.50,
            items: 3,
            createdAt: new Date(Date.now() - 1000 * 60 * 15) // 15 minutes ago
          },
          {
            _id: 'order2',
            orderNumber: '12344',
            customer: 'Jane Smith',
            status: 'confirmed',
            total: 35.75,
            items: 2,
            createdAt: new Date(Date.now() - 1000 * 60 * 45) // 45 minutes ago
          },
          {
            _id: 'order3',
            orderNumber: '12343',
            customer: 'Bob Johnson',
            status: 'delivered',
            total: 29.99,
            items: 4,
            createdAt: new Date(Date.now() - 1000 * 60 * 90) // 90 minutes ago
          }
        ]);
        
        // Set popular items
        setPopularItems([
          {
            _id: 'item1',
            name: 'Margherita Pizza',
            sales: 128,
            revenue: 1536.00,
            image: '/images/pizza.jpg'
          },
          {
            _id: 'item2',
            name: 'Pasta Carbonara',
            sales: 95,
            revenue: 1045.00,
            image: '/images/pasta.jpg'
          },
          {
            _id: 'item3',
            name: 'Tiramisu',
            sales: 72,
            revenue: 504.00,
            image: '/images/tiramisu.jpg'
          }
        ]);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Format date and time
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };
  
  // Get time difference in minutes
  const getTimeDiff = (date) => {
    const diffMs = Date.now()- new Date(date).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const days = Math.floor(diffMins / 1440);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
  };
  
  // Get status class for styling
  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
      case 'preparing':
        return 'info';
      case 'ready_for_pickup':
      case 'out_for_delivery':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return '';
    }
  };
  
  // Toggle restaurant open/closed status
  const toggleRestaurantStatus = async () => {
    try {
      // In a real app, this would update the status via API
      setRestaurant({
        ...restaurant,
        isOpen: !restaurant.isOpen
      });
      
      toast.success(restaurant.isOpen 
        ? 'Restaurant is now marked as closed' 
        : 'Restaurant is now marked as open'
      );
    } catch (error) {
      toast.error('Failed to update restaurant status');
      console.error('Error updating restaurant status:', error);
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="restaurant-dashboard">
        <div className="loading-spinner">Loading dashboard data...</div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="restaurant-dashboard">
        <div className="error-message">
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="reload-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="restaurant-dashboard">
      <div className="dashboard-header">
        <div className="restaurant-info">
          <h1>{restaurant?.name || 'Your Restaurant'}</h1>
          <p>{restaurant?.cuisine || 'Restaurant'}</p>
        </div>
        
        <div className="restaurant-status-controls">
          <div className="status-toggle">
            <span>Status:</span>
            <button
              className={`status-button ${restaurant?.isOpen ? 'open' : 'closed'}`}
              onClick={toggleRestaurantStatus}
            >
              {restaurant?.isOpen ? 'Open' : 'Closed'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stats-card">
          <div className="stats-icon">
            <FaClipboardList />
          </div>
          <div className="stats-content">
            <h3>Today's Orders</h3>
            <div className="stats-value">{stats.todayOrders}</div>
            <div className={`stats-trend ${stats.comparedToYesterday >= 0 ? 'positive' : 'negative'}`}>
              {stats.comparedToYesterday >= 0 ? (
                <FaArrowUp className="trend-icon" />
              ) : (
                <FaArrowDown className="trend-icon" />
              )}
              <span>{Math.abs(stats.comparedToYesterday)}% from yesterday</span>
            </div>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="stats-icon">
            <FaRegClock />
          </div>
          <div className="stats-content">
            <h3>Pending Orders</h3>
            <div className="stats-value">{stats.pendingOrders}</div>
            <div className="stats-actions">
              <Link to="/restaurant/orders?status=pending" className="view-link">
                View Orders
              </Link>
            </div>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="stats-icon">
            <FaMoneyBillWave />
          </div>
          <div className="stats-content">
            <h3>Today's Revenue</h3>
            <div className="stats-value">Rs. {stats.todayRevenue.toFixed(2)}</div>
            <div className={`stats-trend ${stats.comparedToYesterday >= 0 ? 'positive' : 'negative'}`}>
              {stats.comparedToYesterday >= 0 ? (
                <FaArrowUp className="trend-icon" />
              ) : (
                <FaArrowDown className="trend-icon" />
              )}
              <span>{Math.abs(stats.comparedToYesterday)}% from yesterday</span>
            </div>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="stats-icon">
            <FaUtensils />
          </div>
          <div className="stats-content">
            <h3>Total Orders</h3>
            <div className="stats-value">{restaurant?.totalOrders || 0}</div>
            <div className="stats-secondary">
              Total Revenue: Rs. {restaurant?.totalRevenue?.toFixed(2) || '0.00'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Orders Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Recent Orders</h2>
          <Link to="/restaurant/orders" className="view-all-link">
            View All Orders
          </Link>
        </div>
        
        <div className="recent-orders-table">
          <div className="table-header">
            <div className="header-cell">Order #</div>
            <div className="header-cell">Customer</div>
            <div className="header-cell">Time</div>
            <div className="header-cell">Items</div>
            <div className="header-cell">Total</div>
            <div className="header-cell">Status</div>
            <div className="header-cell">Action</div>
          </div>
          
          <div className="table-body">
            {recentOrders.length > 0 ? (
              recentOrders.map(order => (
                <div key={order._id} className="table-row">
                  <div className="cell order-number">{order.orderNumber}</div>
                  <div className="cell customer">{order.customer}</div>
                  <div className="cell time">
                    <div className="time-display">{formatTime(order.createdAt)}</div>
                    <div className="time-ago">{getTimeDiff(order.createdAt)}</div>
                  </div>
                  <div className="cell items">{order.items}</div>
                  <div className="cell total">Rs. {order.total.toFixed(2)}</div>
                  <div className="cell status">
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div className="cell action">
                    <Link to={`/restaurant/orders/${order._id}`} className="view-button">
                      View
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-orders-message">
                No recent orders found.
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Popular Items Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Popular Items</h2>
          <Link to="/restaurant/menu" className="view-all-link">
            Manage Menu
          </Link>
        </div>
        
        <div className="popular-items-grid">
          {popularItems.map(item => (
            <div key={item._id} className="popular-item-card">
              <div className="item-image">
                <img src={item.image || '/images/food-placeholder.jpg'} alt={item.name} />
              </div>
              
              <div className="item-details">
                <h3>{item.name}</h3>
                
                <div className="item-stats">
                  <div className="stat">
                    <span className="stat-label">Orders:</span>
                    <span className="stat-value">{item.sales}</span>
                  </div>
                  
                  <div className="stat">
                    <span className="stat-label">Revenue:</span>
                    <span className="stat-value">Rs. {item.revenue.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
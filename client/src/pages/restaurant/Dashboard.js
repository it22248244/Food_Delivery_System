import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUtensils, FaShoppingBag, FaStar, FaClock, FaEdit, FaStore, FaChartLine, FaUsers, FaCog } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRestaurantByOwnerId } from '../../redux/slices/restaurantSlice';
import { fetchRestaurantOrders } from '../../redux/slices/orderSlice';
import './Dashboard.css';

const RestaurantDashboard = () => {
  const dispatch = useDispatch();
  const { currentRestaurant, isLoading: restaurantLoading, error: restaurantError } = useSelector((state) => state.restaurant);
  const { restaurantOrders, isLoading: ordersLoading, error: ordersError } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.auth);

  // Mock data for stats - replace with actual data from your backend
  const stats = [
    { title: 'Total Orders', value: restaurantOrders?.length || '0', icon: <FaShoppingBag />, color: '#4CAF50' },
    { title: 'Active Orders', value: restaurantOrders?.filter(order => ['pending', 'confirmed', 'preparing', 'ready_for_pickup'].includes(order.status)).length || '0', icon: <FaClock />, color: '#2196F3' },
    { title: 'Menu Items', value: '45', icon: <FaUtensils />, color: '#FF9800' },
    { title: 'Average Rating', value: '4.8', icon: <FaStar />, color: '#FFC107' }
  ];

  const features = [
    {
      icon: <FaStore />,
      title: 'Manage Your Restaurant',
      description: 'Set up your restaurant profile, update information, and manage your business details.'
    },
    {
      icon: <FaUtensils />,
      title: 'Menu Management',
      description: 'Create and update your menu items, set prices, and organize categories.'
    },
    {
      icon: <FaChartLine />,
      title: 'Analytics & Reports',
      description: 'Track your orders, view customer feedback, and monitor your restaurant\'s performance.'
    },
    {
      icon: <FaUsers />,
      title: 'Customer Management',
      description: 'View customer orders, manage feedback, and build your customer base.'
    }
  ];

  useEffect(() => {
    // Fetch the current restaurant's data by owner ID
    if (user?._id) {
      dispatch(fetchRestaurantByOwnerId(user._id));
    }
  }, [dispatch, user?._id]);

  useEffect(() => {
    // Fetch restaurant orders when we have the restaurant ID
    if (currentRestaurant?._id) {
      dispatch(fetchRestaurantOrders(currentRestaurant._id));
    }
  }, [dispatch, currentRestaurant?._id]);

  if (restaurantLoading || ordersLoading) {
    return <div className="loading">Loading...</div>;
  }

  // Don't show error if it's just "No restaurant found" - that's an expected state
  if (restaurantError && restaurantError !== 'No restaurant found for this owner') {
    return <div className="error">Error: {restaurantError}</div>;
  }

  if (ordersError) {
    return <div className="error">Error loading orders: {ordersError}</div>;
  }

  // Format date and time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };
  };

  // Get status info for display
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { class: 'pending', label: 'Pending' };
      case 'confirmed':
        return { class: 'confirmed', label: 'Confirmed' };
      case 'preparing':
        return { class: 'preparing', label: 'Preparing' };
      case 'ready_for_pickup':
        return { class: 'ready', label: 'Ready for Pickup' };
      case 'out_for_delivery':
        return { class: 'delivery', label: 'Out for Delivery' };
      case 'delivered':
        return { class: 'delivered', label: 'Delivered' };
      case 'cancelled':
        return { class: 'cancelled', label: 'Cancelled' };
      default:
        return { class: '', label: status };
    }
  };

  // Calculate total items in an order
  const calculateTotalItems = (items) => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  // Get recent orders (last 5)
  const recentOrders = restaurantOrders?.slice(0, 5) || [];

  return (
    <div className="restaurant-dashboard">
      <div className="dashboard-header">
        <h1>Restaurant Dashboard</h1>
        <div className="header-actions">
          {!currentRestaurant ? (
            <Link to="/restaurant/create" className="primary-button">
              <FaStore className="mr-2" />
              Create Your Restaurant
            </Link>
          ) : (
            <>
              <Link to={`/restaurant/edit/${currentRestaurant._id}`} className="secondary-button">
                <FaEdit className="mr-2" />
                Edit Restaurant
              </Link>
              <Link to="/restaurant/menu" className="secondary-button">
                <FaUtensils className="mr-2" />
                Manage Menu
              </Link>
              <Link to="/restaurant/orders" className="secondary-button">
                <FaShoppingBag className="mr-2" />
                View Orders
              </Link>
            </>
          )}
        </div>
      </div>

      {!currentRestaurant ? (
        <div className="empty-dashboard">
          <div className="welcome-section">
            <div className="welcome-content">
              <h2>Welcome to Your Restaurant Dashboard!</h2>
              <p className="subtitle">Start your journey to managing your restaurant online</p>
              <div className="feature-grid">
                {features.map((feature, index) => (
                  <div key={index} className="feature-card">
                    <div className="feature-icon">{feature.icon}</div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="get-started-section">
              <h3>Ready to Get Started?</h3>
              <p>Create your restaurant profile and start managing your business online today.</p>
              <Link to="/restaurant/create" className="get-started-button">
                <FaStore className="mr-2" />
                Create Your Restaurant
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: stat.color }}>
                  {stat.icon}
                </div>
                <div className="stat-info">
                  <h3>{stat.title}</h3>
                  <p>{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <h2>Recent Orders</h2>
              <Link to="/restaurant/orders" className="view-all">View All</Link>
            </div>
            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => {
                    const { date, time } = formatDateTime(order.createdAt);
                    const statusInfo = getStatusInfo(order.status);
                    const totalItems = calculateTotalItems(order.items);
                    
                    return (
                      <tr key={order._id}>
                        <td>#{order._id.slice(-6)}</td>
                        <td>{order.customer?.name || 'Anonymous'}</td>
                        <td>{totalItems}</td>
                        <td>Rs. {order.totalAmount.toFixed(2)}</td>
                        <td>
                          <span className={`status-badge ${statusInfo.class}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td>
                          <Link to={`/restaurant/orders/${order._id}`} className="action-button">
                            View Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RestaurantDashboard;